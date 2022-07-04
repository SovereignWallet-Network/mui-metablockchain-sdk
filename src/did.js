const { mnemonicGenerate, mnemonicValidate, blake2AsHex } = require('@polkadot/util-crypto');
const { initKeyring } = require('./config.js');
const utils = require('./utils.js');
const { buildConnection } = require('./connection.js');
const IDENTIFIER_PREFIX = 'did:ssid:';
const IDENTIFIER_MAX_LENGTH = 20;
const IDENTIFIER_MIN_LENGTH = 3;
const DID_HEX_LEN = 64;


const DidActionType = {
  Add: "Add",
  Update: "Update",
  Remove: "Remove",
  Rotate: "Rotate",
};
Object.freeze(DidActionType);


/** Generate Mnemonic
 * @returns {String} Mnemonic
 */
const generateMnemonic = () => mnemonicGenerate();

const checkIdentifierFormat = (identifier) => {
  const format = /^[0-9a-zA-Z]+$/;

  return format.test(identifier);
};

/**
 * Generate did object to be stored in blockchain.
 * @param {String} mnemonic
 * @param {String} identifier
 * @param {String} metadata
 * @returns {Object} Object containing did structure
 */
const generateDID = async (mnemonic, identifier, metadata = '') => {
  const keyring = await initKeyring();
  const isValidIdentifier = checkIdentifierFormat(identifier);
  const isValidMnemonic = mnemonicValidate(mnemonic);
  if (!isValidMnemonic) {
    throw new Error({
      errorCode: 'notValidMnemonic',
      errorMessage: 'Not valid mnemonic supplied',
    });
  }
  if (!isValidIdentifier) {
    throw new Error({
      errorCode: 'notValidIdentifier',
      errorMessage: 'Not valid identifier supplied',
    });
  }
  if (
    identifier.length > IDENTIFIER_MAX_LENGTH ||
    identifier.length < IDENTIFIER_MIN_LENGTH
  ) {
    throw new Error({
      errorCode: 'identifierLengthInvalid',
      errorMessage: 'Identifier length invalid',
    });
  }
  const pubKey = await keyring.addFromUri(mnemonic).publicKey;
  return {
    public_key: pubKey, // this is the public key linked to the did
    identity: IDENTIFIER_PREFIX + identifier, // this is the actual did
    metadata: utils.encodeData(metadata.padEnd(utils.METADATA_BYTES, '\0'), 'metadata'),
  };
};

function encodeDidVCProperty({metadata='', prevPubKey=null, pubKey}) {
  let didVCProperty = {
    metadata: utils.encodeData(metadata.padEnd(utils.METADATA_BYTES, '\0'), 'metadata'),
    prev_public_key: prevPubKey,
    public_key: pubKey,
  }
  return utils.encodeData(didVCProperty, 'DidProperty')
}

/**
 * Encode VC object
 * @param {String} mnemonic
 * @param {String} identifier
 * @param {String} metadata
 * @returns {Object} Object containing did structure
 */
function encodeDidVC(owner, issuer, didProperty, didActionType, sigKeypair) {
  let encodedDidProperty;
  switch (didActionType) {
    case DidActionType.Add:
    case DidActionType.Update:
    case DidActionType.Remove:
    case DidActionType.Rotate:
      encodedDidProperty = encodeDidVCProperty(didProperty);
      break;
    default:
      throw new Error("Unknown Did Action VC Type");
  }
  owner = sanitiseDid(owner);
  issuer = sanitiseDid(issuer);
  let encodedData = utils.encodeData({
    vc_type: didActionType,
    vc_property: encodedDidProperty,
    owner,
    issuer,
  }, "DID_VC_HEX");
  let hash = blake2AsHex(encodedData);
  const sign = utils.bytesToHex(sigKeypair.sign(hash));
  let didVC = {
    hash,
    issuer,
    owner,
    property: encodedDidProperty,
    signature: sign,
    vc_type: didActionType
  }
  return utils.encodeData(didVC, 'DidVC');
}

/**
 * Store the generated DID object in blockchain
 * @param {Object} DID
 * @param {Object} signingKeypair
 * @param {ApiPromise} api
 * @returns {String} txnId Txnid for storage operation.
 */
function storeDIDOnChain(DID, signingKeypair, api = false, vc_hex=null) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));

      let tx;
      if(vc_hex) {
        tx = provider.tx.did.add(DID.public_key, sanitiseDid(DID.identity), DID.metadata, vc_hex);
      } else {
        tx = provider.tx.sudo.sudo(provider.tx.did.add(DID.public_key, sanitiseDid(DID.identity), DID.metadata, null));
      }

      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
      await signedTx.send(function ({ status, dispatchError }){
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
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Get did information from accountID
 * @param {String} identifier DID Identifier
 * @returns {JSON}
 */
async function getDIDDetails(identifier, api = false) {
  try {
    const provider = api || (await buildConnection('local'));
    const did_hex = sanitiseDid(identifier);
    const data = (await provider.query.did.dIDs(did_hex)).toJSON();
    return {
      identifier: data[0].identifier,
      public_key: data[0].public_key,
      metadata: data[0].metadata,
      added_block: data[1],
    };
  } catch (error) {
    throw Error('Failed to fetch details');
  }
}

/**
 * Get the accountId for a given DID
 * @param {String} identifier
 * @param {ApiPromise} api
 * @param {Number} blockNumber
 * @returns {String}
 */
async function resolveDIDToAccount(identifier, api = false, blockNumber = null) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(identifier);
  if(!blockNumber && blockNumber != 0) {
    return (await provider.query.did.lookup(did_hex)).toHuman();
  }
  const didDetails = await getDIDDetails(identifier, provider);
  if(blockNumber >= didDetails.added_block) {
    return (await provider.query.did.lookup(did_hex)).toHuman();
  }
  const keyHistories = await getDidKeyHistory(identifier, provider);
  if(!keyHistories) {
    return null;
  }
  const keyIndex = keyHistories.reverse().findIndex((value) => blockNumber >= parseInt(value[1]));
  if(keyIndex < 0) {
    return null;
  }
  return keyHistories[keyIndex][0];
}

/**
 * Get the DID associated to given accountID
 * @param {String} accountId (hex/base64 version works)
 * @param {ApiPromise} api
 * @returns {String | Boolean} (false if not found)
 */
async function resolveAccountIdToDid(accountId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.did.rLookup(accountId)).toHuman();
  // return false if empty
  if (data === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return false;
  }
  return data;
}

/**
 * This function will rotate the keys assiged to a DID
 * It should only be called by validator accounts, else will fail
 * @param {String} identifier
 * @param {Uint8Array} newKey
 * @param {KeyringObj} signingKeypair // of a validator account
 * @param {ApiPromise} api
 */
async function updateDidKey(identifier, newKey, signingKeypair, api, vc_hex=null) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));

      const did_hex = sanitiseDid(identifier);
      // call the rotateKey extrinsinc
      let tx;
      if(vc_hex) {
        tx = provider.tx.did.rotateKey(did_hex, newKey, vc_hex);
      } else {
        tx = provider.tx.sudo.sudo(provider.tx.did.rotateKey(did_hex, newKey, null));
      }
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
      await signedTx.send(function ({ status, dispatchError }){
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
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Convert to hex but return fixed size always, mimics substrate storage
 * @param {String} data
 * @param {Int} size
 * @return {String}
 */
function convertFixedSizeHex(data, size = 64) {
  if (data.length > size) throw new Error('Invalid Data');
  const identifierHex = Buffer.from(data).toString('hex');
  return `0x${identifierHex.padEnd(size, '0')}`;
}

/**
 * Checks if the given did is in hex format or not & converts it into valid hex format.
 * 
 *  Note: This util function is needed since dependant module wont convert the utf did to hex anymore
 * 
 * @param {String} did
 * @return {String} Hex did
 */
const sanitiseDid = (did) => {
  
  if (did.startsWith('0x')) {
    // already hex string
    return did.padEnd(DID_HEX_LEN, '0');
  }
  // console.log('Converting to hex');
  let hex_did = Buffer.from(did, 'utf8').toString('hex');
  hex_did = '0x'+ hex_did.padEnd(DID_HEX_LEN, '0');
  return hex_did;
}

/**
 * Check if the user is an approved validator
 * @param {String} identifier
 * @param {ApiPromise} api
 * @returns {Boolean}
 */
async function isDidValidator(identifier, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(identifier);
  const vList = (await provider.query.validatorSet.members()).toJSON();
  return vList.includes(did_hex);
}

/**
 * Fetch the history of rotated keys for the specified DID
 * @param {String} identifier
 * @param {ApiPromise} api
 * @returns {Array}
 */
async function getDidKeyHistory(identifier, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(identifier);
  const data = (await provider.query.did.prevKeys(did_hex)).toHuman();
  return data;
}

/**
 *
 * @param {String} identifier
 * @param {String} metadata
 * @param {KeyringObj} signingKeypair of a validator account
 * @param {ApiPromise} api
 */
async function updateMetadata(identifier, metadata, signingKeypair, api = false, vc_hex=null) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const did_hex = sanitiseDid(identifier);
      metadata = utils.encodeData(metadata.padEnd(utils.METADATA_BYTES, '\0'), 'metadata')
      let tx;
      if(vc_hex) {
        tx = provider.tx.did.updateMetadata(did_hex, metadata, vc_hex);
      } else {
        tx = provider.tx.sudo.sudo(provider.tx.did.updateMetadata(did_hex, metadata, null));
      }
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
      await signedTx.send(function ({ status, dispatchError }){
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

module.exports = {
  DidActionType,
  generateMnemonic,
  generateDID,
  storeDIDOnChain,
  getDIDDetails,
  updateDidKey,
  resolveDIDToAccount,
  getDidKeyHistory,
  resolveAccountIdToDid,
  isDidValidator,
  updateMetadata,
  sanitiseDid,
  encodeDidVC,
};
