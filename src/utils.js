const { u8aToHex, hexToU8a, hexToString: polkadotHextoString, stringToU8a, stringToHex } = require('@polkadot/util');
const { base58Decode, blake2AsHex } = require('@polkadot/util-crypto');

const types = require('@polkadot/types');

const VCType = {
  TokenVC: "TokenVC",
  MintTokens: "MintTokens",
  SlashTokens: "SlashTokens",
  TokenTransferVC: "TokenTransferVC",
  SlashMintTokens: "SlashMintTokens",
  GenericVC: "GenericVC",
};
Object.freeze(VCType);

const METABLOCKCHAIN_TYPES = {
  "PeerId": "OpaquePeerId",
  "identifier": "[u8;32]",
  "public_key": "[u8;32]",
  "metadata": "Vec<u8>",
  "DidStruct": {
    "identifier": "identifier",
    "public_key": "public_key",
    "metadata": "metadata"
  },
  "Did": "[u8;32]",
  "PublicKey": "[u8;32]",
  "Address": "MultiAddress",
  "LookupSource": "MultiAddress",
  "Balance": "u128",
  "TreasuryProposal": {
    "proposer": "Did",
    "beneficiary": "Did",
    "value": "Balance",
    "bond": "Balance"
  },
  "CurrencyId": "u32",
  "Amount": "i64",
  "Memo": "Vec<u8>",
  "AccountInfo": "AccountInfoWithDualRefCount",
  "VC": {
    "hash": "Hash",
    "owner": "Did",
    "issuers": "Vec<Did>",
    "signatures": "Vec<Signature>",
    "is_vc_used": "bool",
    "vc_type": "VCType",
    "vc_property": "[u8;128]"
  },
  "VCType": {
    "_enum": [
      "TokenVC",
      "SlashTokens",
      "MintTokens",
      "TokenTransferVC",
      "GenericVC"
    ]
  },
  "TokenVC": {
    "token_name": "[u8;16]",
    "reservable_balance": "Balance",
    "decimal": "u8",
    "currency_code": "[u8;8]"
  },
  "SlashMintTokens": {
    "vc_id": "VCid",
    "currency_code": "CurrencyCode",
    "amount": "u128"
  },
  "TokenTransferVC": {
    "vc_id": "VCid",
    "currency_code": "CurrencyCode",
    "amount": "u128"
  },
  "GenericVC": {
    "cid": "[u8;64]"
  },
  "VCHash": "Vec<u8>",
  "VCStatus": {
    "_enum": [
      "Active",
      "Inactive"
    ]
  },
  "VCid": "[u8;32]",
  "Hash": "H256",
  "Signature": "H512",
  "TokenDetails": {
    "token_name": "Vec<u8>",
    "currency_code": "Vec<u8>",
    "decimal": "u8",
    "block_number": "BlockNumber"
  },
  "StorageVersion": {
    "_enum": [
      "V1_0_0",
      "V2_0_0"
    ]
  },
  "TokenBalance": "u128",
  "TokenAccountData": {
    "free": "TokenBalance",
    "reserved": "TokenBalance",
    "frozen": "TokenBalance"
  },
  "TokenAccountInfo": {
    "nonce": "u32",
    "data": "TokenAccountData"
  },
  "Votes": {
    "index": "ProposalIndex",
    "threshold": "MemberCount",
    "ayes": "Vec<Did>",
    "nays": "Vec<Did>",
    "end": "BlockNumber"
  },
  "CurrencyCode": "[u8;8]",
  "StorageVersion": {
    "_enum": [
      "V1_0_0",
      "V2_0_0",
      "V3_0_0"
    ]
  },
  "VCPalletVersion": {
    "_enum": [
      "V1_0_0",
      "V2_0_0"
    ]
  }
}

// Types for generating HEX
const ENCODE_TYPES = {
  "VC_HEX": {
    "vc_type": "VCType",
    "vc_property": "[u8;128]",
    "owner": "Did",
    "issuers": "Vec<Did>"
  },
  "decimal": "u8",
  "currency_code": "[u8;8]",
  "token_bytes": "[u8;16]",
  "CID": "[u8;64]",
};

const TOKEN_NAME_BYTES = 16;
const CURRENCY_CODE_BYTES = 8;
const VC_PROPERTY_BYTES = 128;
const CID_BYTES = 64;

/**
 * @param  {Bytes} inputBytes u8[]
 */
const bytesToHex = (inputBytes) => u8aToHex(inputBytes);
/**
 * @param  {String} inputString
 */
const hexToBytes = (inputString) => hexToU8a(inputString);
/**
 * @param  {Base58} bs58string
 */
const base58ToBytes = (bs58string) => base58Decode(bs58string);
/**
 * @param  {String} inputString
 */
const stringToBytes = (inputString) => stringToU8a(inputString);
/**
 * @param  {Hex} hexString
 */
const hexToString = (hexString) => polkadotHextoString(hexString).replace(/^\0+/, '').replace(/\0+$/, '');


/**
 * @param {Hex} hexString
 */
const vcHexToVcId = (hexString) => blake2AsHex(hexString);

const registry = new types.TypeRegistry();
registry.register(METABLOCKCHAIN_TYPES);
registry.register(ENCODE_TYPES);

/** Encodes object/ string of given type to hex
 * @param  {Object | String} data Object to be encoded
 * @param  {String} typeKey Key from METABLOCKCHAIN_TYPES which represents type of data
 * @returns {String} Encoded Hex
 */
function encodeData(data, typeKey) {
  return types.createType(registry, typeKey, data).toHex();
}

/** Decodes hex of given type to it's corresponding object/value
 * @param  {String} hexValue Hex String to be decoded
 * @param  {String} typeKey Key from METABLOCKCHAIN_TYPES which represents type of data
 * @returns {Object | String} Decoded Object/String
 */
function decodeHex(hexValue, typeKey) {
  return types.createType(registry, typeKey, hexValue).toJSON();
}

/** Checks if str is upper and only contains characters
 * @param  {} str
 * @returns bool
 */
function isUpperAndValid(str) {
  return /^[A-Z]+$/.test(str);
}

/** regex to remove unwanted hex bytes
 * @param  {String} s Hex String to make tidy
 * @returns {Object | String} Decoded tidy Object/String
 */
function tidy(s) {
  const tidy = typeof s === 'string'
    ? s.replace( /[\x00-\x1F\x7F-\xA0]+/g, '' )
    : s ;
  return tidy;
}

 /** function that decodes hex of createTokenVC
 * @param  {String} hexValue Hex String to be decoded
 * @param  {String} typeKey Key from METABLOCKCHAIN_TYPES which represents type of data
 * @returns {Object | String} Decoded Object/String
 */
 function getVCS(hexValue, typeKey) {
  let vcs = decodeHex(hexValue, typeKey);
  if(Boolean(vcs.token_name))
    vcs["token_name"] = hexToString(vcs.token_name);
  if(Boolean(vcs.currency_code))
    vcs["currency_code"] = hexToString(vcs.currency_code);
  return vcs;
 }

  /** function that decodes hex of createVC where type is TokenVC to it's corresponding object/value
 * @param  {String} hexValue Hex String to be decoded
 * @param  {String} typeKey Key from METABLOCKCHAIN_TYPES which represents type of data
 * @returns {Object | String} Decoded Object/String
 */
 function decodeVC(hexValue, typeKey) {
  let vcs = decodeHex(hexValue, typeKey);
  vcs["owner"] = hexToString(vcs.owner);
  let issuer_did = [];
  for(let i=0; i<vcs.issuers.length; i++){
    issuer_did.push(hexToString(vcs.issuers[i]));
  }
  vcs["issuers"] = issuer_did;
  switch(vcs.vc_type) {
    case VCType.MintTokens:
      vcs["vc_property"] = getVCS(vcs.vc_property, VCType.SlashMintTokens);
      break;
    case VCType.TokenVC:
      vcs["vc_property"] = getVCS(vcs.vc_property, vcs.vc_type);
      break;
    case VCType.SlashTokens:
      vcs["vc_property"] = getVCS(vcs.vc_property, VCType.SlashMintTokens);
      break;
    case VCType.TokenTransferVC:
      vcs["vc_property"] = getVCS(vcs.vc_property, VCType.TokenTransferVC);
      break;
    case VCType.GenericVC:
      vcs["vc_property"] = getVCS(vcs.vc_property, VCType.GenericVC);
      break;
    default:
      throw new Error("Unknown Type");
  }
  return vcs;
}

/** Sort object by keys
 * @param  {Object} unorderedObj unordered object
 * @returns {Object} ordered object by key
 */
function sortObjectByKeys(unorderedObj) {
  return Object.keys(unorderedObj).sort().reduce(
    (obj, key) => { 
      obj[key] = unorderedObj[key]; 
      return obj;
    },
    {}
  );
}

/** generate blake hash of js object
 * @param  {Object} unordered unordered object
 * @returns {Object} ordered object by key
 */
function generateObjectHash(object) {
  const sortedData = sortObjectByKeys(object);
  const encodedData = stringToHex(JSON.stringify(sortedData));
  return blake2AsHex(encodedData);
}

module.exports = {
  METABLOCKCHAIN_TYPES,
  TOKEN_NAME_BYTES,
  CURRENCY_CODE_BYTES,
  VC_PROPERTY_BYTES,
  CID_BYTES,
  VCType,
  bytesToHex,
  hexToBytes,
  base58ToBytes,
  hexToString,
  stringToBytes,
  encodeData,
  decodeHex,
  vcHexToVcId,
  isUpperAndValid,
  getVCS,
  decodeVC,
  sortObjectByKeys,
  generateObjectHash,
};
