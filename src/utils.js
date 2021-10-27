const { u8aToHex, hexToU8a, hexToString: polkadotHextoString } = require('@polkadot/util');
const { base58Decode } = require('@polkadot/util-crypto');
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
      "TokenVC"
    ]
  },
  "TokenVC": {
    "token_name": "token_bytes",
    "reservable_balance": "u128"
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
  "token_bytes": "[u8;16]",
  "TokenBytes": "[u8;16]", //TODO: Remove this once token identifier issue is resolved
  "TokenData": { // To solve Account Data issue which has new field
    "free": "Balance",
    "reserved": "Balance",
    "frozen": "Balance"
  }
}

const TOKEN_NAME_BYTES = 16;
const TOKEN_VC_BYTES = 256;

const bytesToHex = (inputBytes) => u8aToHex(inputBytes);
const hexToBytes = (inputString) => hexToU8a(inputString);
const base58ToBytes = (bs58string) => base58Decode(bs58string);
const hexToString = (hexString) => polkadotHextoString(hexString).replace(/^\0+/, '').replace(/\0+$/, '');

const registry = new types.TypeRegistry();
registry.register(METABLOCKCHAIN_TYPES);

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

module.exports = {
  METABLOCKCHAIN_TYPES,
  TOKEN_NAME_BYTES,
  TOKEN_VC_BYTES,
  bytesToHex,
  hexToBytes,
  base58ToBytes,
  hexToString,
  encodeData,
  decodeHex,
};
