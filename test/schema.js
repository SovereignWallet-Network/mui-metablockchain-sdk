const assert = require('assert');
const schema = require('../src/schema.js');
const { buildConnection } = require('../src/connection.js');
const ssidJson = require('../src/vc_schema/ssid.json');
const identityJSON = require('../src/vc_schema/identity.json');
const sha256 = require('js-sha256');
const { stringToU8a, u8aToHex } = require('@polkadot/util');
const constants = require('./test_constants');

describe('Schema Module works correctly', () => {
  let expectedHashSsid = '';
  let expectedHashId = '';

  before(() => {
    expectedHashSsid = u8aToHex(sha256(stringToU8a(JSON.stringify(ssidJson))));
    expectedHashId = u8aToHex(sha256(stringToU8a(JSON.stringify(identityJSON))));
  });

  it('Schema is created in correct format', async () => {
    const x = schema.createNewSchema(ssidJson);
    assert.strictEqual(x.json_data, JSON.stringify(ssidJson));
    assert.strictEqual(x.hash, expectedHashSsid);
  });

  it('Schema is created in correct format II', async () => {
    const x = schema.createNewSchema(identityJSON);
    assert.strictEqual(x.json_data, JSON.stringify(identityJSON));
    assert.strictEqual(x.hash, expectedHashId);
  });

  it('Schema checks rejects invalid hex', async () => {
    const provider = await buildConnection(constants.providerNetwork);
    const test = await schema.doesSchemaExist('abc', provider);
    assert.strictEqual(test, false);
  });
  // Remove blockchain dependent tests
  // it('Schema checks rejects non existent schema', async () => {
  //   const provider = await buildConnection(constants.providerNetwork);
  //   const test = await schema.doesSchemaExist(constants.inValidSchema, provider);
  //   assert.strictEqual(test, false);
  // });

  // it('Schema checks accepts valid schema', async () => {
  //   const provider = await buildConnection(constants.providerNetwork);
  //   const test = await schema.doesSchemaExist(constants.validSchema, provider);
  //   assert.strictEqual(test, true);
  // });
});
