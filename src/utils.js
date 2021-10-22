const { u8aToHex, hexToU8a, hexToString: polkadotHextoString } = require('@polkadot/util');
const { base58Decode } = require('@polkadot/util-crypto');

const METABLOCKCHAIN_TYPES = {
  "PeerId": "(Vec<>)",
  "identifier": "[u8;32]",
  "public_key": "[u8;32]",
  "metadata": "(Vec<u8>)",
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
  "CurrencyId": "i64",
  "Amount": "i64",
  "Memo": "Vec<u8>",
  "AccountInfo": "AccountInfoWithDualRefCount",
  "VC": {
    "hash": "Hash",
    "owner": "Did",
    "issuers": "Vec<Did>",
    "signatures": "Vec<Signature>",
    "is_vc_used": "bool",
    "vc_type": "TokenVC"
  },
  "TokenVC": {
    "token_name": "Vec<u8>",
    "reservable_balance": "Balance"
  },
  "VCHash": "Vec<u8>",
  "VCStatus": "Vec<u8>",
  "VCid": "[u8;32]",
  "Hash": "H256",
  "Signature": "H512"
}

const bytesToHex = (inputBytes) => u8aToHex(inputBytes);
const hexToBytes = (inputString) => hexToU8a(inputString);
const base58ToBytes = (bs58string) => base58Decode(bs58string);
const hexToString = (hexString) => polkadotHextoString(hexString).replace(/^\0+/, '').replace(/\0+$/, '');

module.exports = {
  METABLOCKCHAIN_TYPES,
  bytesToHex,
  hexToBytes,
  base58ToBytes,
  hexToString,
};
