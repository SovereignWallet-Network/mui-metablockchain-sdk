/**
 * SCHEMA IMPLEMENTATION (MVP)
 * Schema represents the structure of verifiable credentials
 * to be issued on the blockchain, using a common schema brings
 * uniformity across many different VCs depicting the same information
 *
 * Schema can only be created by privileged users, ie. the user account has to be present in the
 * validator-set pallet.
 */
const { stringToU8a, u8aToHex } = require('@polkadot/util');
const sha256 = require('js-sha256');
const { buildConnection } = require('./connection.js');

/**
 * Create a new schema with the properties provided in the schema_properties json
 * The stringified schema and its hash will be returned as required by the extrinsic.
 * @param {JSON} schema_properties
 *
 * @returns {JSON}
 */
function createNewSchema(schemaProperties) {
  return {
    json_data: JSON.stringify(schemaProperties),
    hash: u8aToHex(sha256(stringToU8a(JSON.stringify(schemaProperties)))),
  };
}

/**
 * Write a new schema to the chain using the account provided
 * This extrinsic can only be called by the accounts in the validator_set pallet
 * @param {JSON} schema
 * @param {String} signingKeypair
 */
async function storeSchemaOnChain(schema, signingKeypair, api = false) {
  try {
    const provider = api || await buildConnection('local');
    // TODO : check if caller is a memeber of validator set
    const tx = provider.tx.schema.add(
      schema.hash,
      schema.json_data,
    );
    const signedtx = await tx.signAndSend(signingKeypair);
    console.log('Transaction send to provider', signedtx.toHex());
    return signedtx;
  } catch (err) {
    console.log(err);
    return false;
  }
}

/**
 * The function will returns the Boolean value based on valid/invalid schemaHash.
 * @param {Hex} schemaHash
 * @returns {Boolean} Will return true, if valid schemaHash
 */
async function doesSchemaExist(schemaHash, provider) {
  // regex to test for a valid hex value
  const format = /\b0[xX][0-9a-fA-F]+\b/;
  if (!format.test(schemaHash)) {
    return false;
  }
  const result = (await provider.query.schema.sCHEMA(schemaHash)).toJSON();
  return result !== null;
}

module.exports = {
  createNewSchema,
  storeSchemaOnChain,
  doesSchemaExist,
};
