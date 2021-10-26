/**
 * VC IMPLEMENTATION (MVP)
 * VC in metablockchain network is used as a certificate to prove certain details.
 * All VCs have to follow the params mentioned in the respective SCHEMA.
 *
 * VC is just a simple JSON document (for now), that contains the values
 * and is signed by the verifying authority.
 * We have to modify it to an interface or class to support generalised SCHEMAs.
 *
 * VC Format (For schemas and verifier DID already registered on blockchain) :
 * {
 *   "schema" : "Hash of the schema that the VC is using",
 *   "properties" : {
 *          // the properties JSON, this should be the same as the schema definition
 *          },
 *   "hash" : "SHA256 hash of the properties field",
 *   "verifier" : "The metablock did of the verifying authority",
 *   "signature" : "The signature of the verifier, verifying the hash"
 * }
 */
const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
const { signatureVerify } = require('@polkadot/util-crypto');
const sha256 = require('js-sha256');
const { getDIDDetails, getDidKeyHistory, isDidValidator } = require('./did');
const { buildConnection } = require('./connection.js');
const { doesSchemaExist } = require('./schema.js');
const { sanitiseDid } = require('./did');

/**
 * The function returns the VC in the expected format, the verifier and
 * signature fields are left blank to be filled by signing function
 * @param {token_name: String, reservable_balance: Number} tokenVC
 * @param {did} String
 *
 * @returns {JSON}
 */
async function createVC(tokenVC, did, sigKeypair) {
  const hash = u8aToHex(sha256(stringToU8a(JSON.stringify(tokenVC))));
  const sign = sigKeypair.sign(hash); 
  return {
    hash,
    signatures: [sign],
    vc_type: {TokenVC: tokenVC},
    owner: did,
    issuers: [did],
    is_vc_used: true,
    vc_property: tokenVC,
  };
}

/**
 * Sign a VC using the given verifier_pvkey
 * @param {JSON} vcJson
 * @param {String} verifierDid
 * @param {KeyPair} signingKeyPair
 * @returns {JSON}
 */
async function signVC(vcJson, verifierDid, signingKeyPair) {
  // check if the hash and the properties are a match
  const expectedHash = u8aToHex(sha256(stringToU8a(JSON.stringify(vcJson.properties))));
  if (expectedHash !== vcJson.hash) {
    throw new Error('Data Mismatch!');
  }

  // sign the VC
  const dataToSign = hexToU8a(vcJson.hash);
  const signedData = signingKeyPair.sign(dataToSign);
  const resVC = vcJson;
  resVC.verifier = verifierDid;
  resVC.signature = u8aToHex(signedData);

  return resVC;
}

/**
 * Verify if the signature/verifier DID is valid and matches the given data in vc_json
 * @param {JSON} vcJson
 *
 * @returns {Boolean} true if valid VC
 */
async function verifyVC(vcJson, api = false) {
  const provider = api || (await buildConnection('local'));

  // check if the vc has signature and verifier
  if (!vcJson.verifier || !vcJson.signature) {
    throw new Error('VC Not signed!');
  }

  // check if the hash and the properties are a match
  const expectedHash = u8aToHex(sha256(stringToU8a(JSON.stringify(vcJson.properties))));
  if (expectedHash !== vcJson.hash) {
    throw new Error('Data Mismatch!');
  }

  // check if the signer is a validator
  const isSignerValidator = await isDidValidator(vcJson.verifier, provider);
  if (!isSignerValidator) throw new Error('Signer is not a validator!');

  // fetch the details of the DID
  const didDetails = await getDIDDetails(vcJson.verifier, provider);
  let signerAddress = didDetails.public_key;

  // if the pubkey has been rotated, check for older versions
  // naive implementation need to reafactor later handling edge cases
  if (didDetails.added_block > parseInt(vcJson.properties.issued_block, 10)) {
    console.log('Signing key has been rotated, searching for previous key history!');
    const prevKeyDetails = await getDidKeyHistory(vcJson.verifier);
    prevKeyDetails.forEach(([accountId, blockNo]) => {
      if (parseInt(vcJson.properties.issued_block, 10) > blockNo) {
        console.log('Signing key found!');
        signerAddress = accountId;
      }
    });
  }

  return signatureVerify(hexToU8a(vcJson.hash), hexToU8a(vcJson.signature), signerAddress.toString()).isValid;
}


/**
 * Store vc hex
 * @param {String} vcHex
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function storeVC(
  vcHex,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));

      const tx = provider.tx.vc.store(vcHex);

      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(`${section}.${name}`);
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(dispatchError.toString());
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Store vc hex
 * @param {String} vcId
 * @param {String} sign
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function addSignature(
  vcId,
  sign,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));

      const tx = provider.tx.vc.addSignature(vcId, sign);

      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(`${section}.${name}`);
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(dispatchError.toString());
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Update Status
 * @param {String} vcId
 * @param {String} vcStatus
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function updateStatus(
  vcId,
  vcStatus,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));

      const tx = provider.tx.vc.updateStatus(vcId, vcStatus);

      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(`${section}.${name}`);
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(dispatchError.toString());
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Get VCs by VC id
 * @param {String} vcId (hex/base64 version works)
 * @param {ApiPromise} api
 * @returns {String} (false if not found)
 */
 async function getVCs(vcId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.vc.vCs(vcId)).toHuman();
  return data;
}

/**
 * Get VC Ids by did
 * @param {String} did (hex/base64 version works)
 * @param {ApiPromise} api
 * @returns {String} (false if not found)
 */
 async function getVCIdsByDID(did, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(did);
  const data = (await provider.query.vc.lookup(did_hex)).toHuman();
  return data;
}

/**
 * Get DID by VC Id
 * @param {String} vcId (hex/base64 version works)
 * @param {ApiPromise} api
 * @returns {String} (false if not found)
 */
 async function getDIDByVCId(vcId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.vc.rLookup(vcId)).toHuman();
  return data;
}

/**
 * Get DID by VC Id
 * @param {String} vcId (hex/base64 version works)
 * @param {ApiPromise} api
 * @returns {String} (false if not found)
 */
 async function getVCHistoryByVCId(vcId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.vc.vCHistory(vcId)).toHuman();
  return data;
}

module.exports = {
  // createVC,
  // signVC,
  // verifyVC,
  doesSchemaExist,
  storeVC,
  addSignature,
  updateStatus,
  getVCs,
  getVCIdsByDID,
  getDIDByVCId,
  getVCHistoryByVCId,
};
