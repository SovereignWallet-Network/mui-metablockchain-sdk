const { u8aToHex, hexToU8a, hexToString: polkadotHextoString, stringToU8a } = require('@polkadot/util');
const { base58Decode, blake2AsHex } = require('@polkadot/util-crypto');

const types = require('@polkadot/types');

const METABLOCKCHAIN_TYPES = {
  "PeerId": "(Vec<>)",
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
      "TokenTransferVC"
    ]
  },
  "TokenVC": {
    "token_name": "[u8;16]",
    "reservable_balance": "u128",
    "decimal": "u8",
    "currency_code": "[u8;8]"
  },
  "SlashMintTokens": {
    "vc_id": "VCid",
    "currency_id": "CurrencyId",
    "amount": "u128"
  },
  "TokenTransferVC": {
    "vc_id": "VCid",
    "currency_id": "CurrencyId",
    "amount": "u128"
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
    "token_name": "Bytes",
    "currency_code": "Bytes",
    "decimal": "u8"
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
};

const TOKEN_NAME_BYTES = 16;
const CURRENCY_CODE_BYTES = 8;
const VC_PROPERTY_BYTES = 128;

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
 * @param  {Hex} hexString
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

  function tidy(s) {
    const tidy = typeof s === 'string'
      ? s.replace( /[\x00-\x1F\x7F-\xA0]+/g, '' )
      : s ;
    return tidy;
  }

function hex_to_ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return tidy(str);
 }


module.exports = {
  METABLOCKCHAIN_TYPES,
  TOKEN_NAME_BYTES,
  CURRENCY_CODE_BYTES,
  VC_PROPERTY_BYTES,
  bytesToHex,
  hexToBytes,
  base58ToBytes,
  hexToString,
  stringToBytes,
  encodeData,
  decodeHex,
  vcHexToVcId,
  hex_to_ascii
};
