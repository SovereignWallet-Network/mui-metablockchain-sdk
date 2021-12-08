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
 const { signatureVerify, blake2AsHex } = require('@polkadot/util-crypto');
 const sha256 = require('js-sha256');
 const { sanitiseDid, getDIDDetails, getDidKeyHistory, isDidValidator } = require('./did');
 const { buildConnection } = require('./connection.js');
 const { doesSchemaExist } = require('./schema.js');
 const { VCType } = require('./utils.js');
 const did = require('./did.js');
 const utils = require('./utils.js');
 const { getTokenData } = require('./token');
 
 
 /** Encodes Token VC and pads with appropriate bytes
  * @param  {Object} TokenVC
  * @param  {String} TokenVC.tokenName 
  * @param  {String} TokenVC.reservableBalance In Highest Form
  * @param  {String} TokenVC.decimal 
  * @param  {String} TokenVC.currencyCode 
  * @returns {String} Token VC Hex String
  */
 function createTokenVC({ tokenName, reservableBalance, decimal, currencyCode}) {
   if(!tokenName) {
     throw new Error('Token name is required');
   }
   if(tokenName.length > utils.TOKEN_NAME_BYTES) {
     throw new Error('Token name should not exceed 16 chars');
   }
   if(!currencyCode) {
     throw new Error('Currency code is required');
   }
   // Removing extra spaces
   currencyCode = currencyCode.replace(/ /g, '');
   if(currencyCode.length > utils.CURRENCY_CODE_BYTES) {
     throw new Error('Currency Code should not exceed 8 chars');
   }
   if(!utils.isUpperAndValid(currencyCode)){
     throw new Error('Only Upper case characters are allowed for currency code');
   }
   let vcProperty = {
     token_name: utils.encodeData(tokenName.padEnd(utils.TOKEN_NAME_BYTES, '\0'), 'token_bytes'),
     reservable_balance: utils.encodeData(reservableBalance*(Math.pow(10,decimal)), 'Balance'),
     decimal: utils.encodeData(decimal, 'decimal'),
     currency_code: utils.encodeData(currencyCode.padEnd(utils.CURRENCY_CODE_BYTES, '\0'), 'currency_code'),
   };
   return utils.encodeData(vcProperty, VCType.TokenVC)
     .padEnd((utils.VC_PROPERTY_BYTES * 2)+2, '0'); // *2 for hex and +2 bytes for 0x
 }
 
 /** Encodes Token VC and pads with appropriate bytes
  * @param  {Object} vcProperty
  * @param  {String} vcProperty.vcId 
  * @param  {String} vcProperty.currencyCode
  * @param  {String} vcProperty.amount In Highest Form
  * @returns {String} Token VC Hex String
  */
  async function createMintSlashVC({ vcId, currencyCode, amount }, api=false) {
   const provider = api || (await buildConnection('local'));
   let tokenData = await getTokenData(currencyCode, provider);
   let vcProperty = {
     vc_id: vcId,
     currency_code: utils.encodeData(currencyCode.padEnd(utils.CURRENCY_CODE_BYTES, '\0'), 'CurrencyCode'),
     amount: utils.encodeData(amount*(Math.pow(10,tokenData.decimal)), 'Balance'),
   };
   return utils.encodeData(vcProperty, VCType.SlashMintTokens)
     .padEnd((utils.VC_PROPERTY_BYTES * 2)+2, '0'); // *2 for hex and +2 bytes for 0x
 }
 
 /** Encodes Token VC and pads with appropriate bytes
  * @param  {Object} vcProperty
  * @param  {String} vcProperty.vcId 
  * @param  {String} vcProperty.currencyCode
  * @param  {String} vcProperty.amount In Highest Form
  * @returns {String} Token VC Hex String
  */
  async function createTokenTransferVC({ vcId, currencyCode, amount }, api=false) {
   const provider = api || (await buildConnection('local'));
   let tokenData = await getTokenData(currencyCode, provider);
   let vcProperty = {
     vc_id: vcId,
     currency_code: utils.encodeData(currencyCode.padEnd(utils.CURRENCY_CODE_BYTES, '\0'), 'CurrencyCode'),
     amount: utils.encodeData(amount*(Math.pow(10,tokenData.decimal)), 'Balance'),
   };
   return utils.encodeData(vcProperty, VCType.TokenTransferVC)
     .padEnd((utils.VC_PROPERTY_BYTES * 2)+2, '0'); // *2 for hex and +2 bytes for 0x
 }
 
 /**
  * Create VC
  * @param  {Object} vcProperty
  * @param  {String} owner Did
  * @param  {String[]} issuers Array of Did
  * @param  {String} vcType TokenVC, MintTokens, SlashTokens, TokenTransferVC
  * @param  {KeyPair} sigKeypair Owner Key Ring pair
  * @returns {String} VC Hex String
  */
 
 async function generateVC(vcProperty, owner, issuers, vcType, sigKeypair, api=false) {
   let encodedVCProperty;
   switch (vcType) {
     case VCType.TokenVC:
       encodedVCProperty = createTokenVC(vcProperty);
       break;
     case VCType.MintTokens:
     case VCType.SlashTokens:
       encodedVCProperty = await createMintSlashVC(vcProperty, api);
       break;
     case VCType.TokenTransferVC:
       encodedVCProperty = await createTokenTransferVC(vcProperty, api);
       break;
     default:
       throw new Error("Unknown VC Type");
   }
   owner = did.sanitiseDid(owner);
   issuers = issuers.map(issuer => did.sanitiseDid(issuer));
   const encodedData = utils.encodeData({
     vc_type: vcType,
     vc_property: encodedVCProperty,
     owner,
     issuers,
   }, "VC_HEX");
   const hash = blake2AsHex(encodedData);
   const sign = utils.bytesToHex(sigKeypair.sign(hash));
   let vcObject = {
     hash,
     owner,
     issuers,
     signatures: [sign],
     is_vc_used: false,
     vc_type: vcType,
     vc_property: encodedVCProperty,
   };
   return utils.encodeData(vcObject, 'VC');
 }
 
 /**
 * Sign VC
 * @param  {Object} vcData {vcType, vcProperty, owner, issuers}
 * @param  {KeyPair} sigKeypair Issuer Key Ring pair
 * @returns {String} Signature
 */
function approveVC(vcId, signingKeyPair, api=false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));

      // fetching VC from chain
      let vc_details = await getVCs(vcId, provider);
      if (!vc_details) {
        reject(new Error('VC not found'));
      }
      const vc = vc_details[0];

      // generating signature
      const encodedData = utils.encodeData({
        vc_type: vc['vc_type'],
        vc_property: vc['vc_property'],
        owner: vc['owner'],
        issuers: vc['issuers']
      }, "VC_HEX");
      const hash = blake2AsHex(encodedData);
      const sign = utils.bytesToHex(signingKeyPair.sign(hash));

      // adding signature to the chain
      const tx = provider.tx.vc.addSignature(vcId, sign);

      let nonce = await provider.rpc.system.accountNextIndex(signingKeyPair.address);
      let signedTx = tx.sign(signingKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Verify if the signature/verifier DID is valid and matches the given data in vc_json
 * @param {JSON} vcJson
 * @returns {Boolean} true if valid VC
 */
async function verifyVC(vcJson, api = false) {
  const provider = api || (await buildConnection('local'));

  // check if the vc has signature and verifier
  if (!vcJson.verifier || !vcJson.signature) {
    throw new Error('VC Not signed!');
  }

  // check if the hash and the properties are a match
  const expectedHash = utils.bytesToHex(sha256(utils.stringToBytes(JSON.stringify(vcJson.properties))));
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

  return signatureVerify(utils.hexToBytes(vcJson.hash), utils.hexToBytes(vcJson.signature), signerAddress.toString()).isValid;
}


/**
 * Store vc hex
 * @param {String} vcHex
 * @param {KeyPair} senderAccountKeyPair
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

      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Store vc hex
 * @param {String} vcId
 * @param {String} sign
 * @param {KeyPair} senderAccountKeyPair
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

      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Update Status
 * @param {String} vcId
 * @param {String} vcStatus
 * @param {KeyPair} senderAccountKeyPair
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

      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
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

// TODO: Import & re export the functions from verified_credentials.js in next PR
module.exports = {
  createTokenVC,
  generateVC,
  approveVC,
  doesSchemaExist,
  storeVC,
  updateStatus,
  getVCs,
  getVCIdsByDID,
  getDIDByVCId,
  getVCHistoryByVCId,
};