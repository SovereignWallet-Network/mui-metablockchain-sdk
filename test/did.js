const assert = require('assert');
const did = require('../src/did.js');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constant = require('./test_constants');
const { hexToString } = require('../src/utils');

describe('DID Module works correctly', () => {
  const TEST_MNEMONIC =
    'trade tennis uncle hour cave wait stadium dove derive resemble attract relax';
  const TEST_DID = 'rocket';
  const TEST_METADATA = 'Metadata';
  const expectedPubkey =
    '74e2fd8dadfd06cc6cd6d22cf561b6693f6c138d4de8340a1e197384fcc3bc5b';
  let provider = null;
  let sigKeypairWithBal = null;

  before(async () => {
    const keyring = await initKeyring();
    provider = await buildConnection('dev');
    sigKeypairWithBal = await keyring.addFromUri(constant.mnemonicWithBalance);
  });

  it('DID is created in correct format', async () => {
    const didObj = await did.generateDID(TEST_MNEMONIC, TEST_DID, TEST_METADATA);
    assert.strictEqual(Buffer.from(didObj.public_key).toString('hex'), expectedPubkey);
    assert.strictEqual(didObj.identity, 'did:ssid:rocket');
    assert.strictEqual(didObj.metadata, TEST_METADATA);
  });

  it('DID details are fetched correctly - positive test', async () => {
    //  Alice is expected in the test chain
    const data = await did.getDIDDetails('did:ssid:swn', provider);
    assert.strictEqual(
      data.public_key,
      '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d'
    );
    assert.strictEqual(
      data.identifier,
      '0x6469643a737369643a73776e0000000000000000000000000000000000000000'
    );
    assert.strictEqual(data.added_block, 0);
  });

  it('Resolve DID to account works correctly', async () => {
    //  Alice is expected in the test chain
    const data = await did.resolveDIDToAccount('did:ssid:swn', provider);
    assert.strictEqual(data, '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
  });

  it('Resolve AccountID to DID works correctly', async () => {
    //  Alice is expected in the test chain
    const data = await did.resolveAccountIdToDid(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      provider
    );
    assert.strictEqual(
      data,
      '0x6469643a737369643a73776e0000000000000000000000000000000000000000'
    );

    // return false for non existent did - this accountid is not expected to have a DID
    const data2 = await did.resolveAccountIdToDid(
      '5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2',
      provider
    );
    assert.strictEqual(data2, false);
  });

  it('isDidValidator works correctly', async () => {
    //  Alice is expected in the test chain
    const data = await did.isDidValidator('did:ssid:swn', provider);
    assert.strictEqual(data, true);

    const data2 = await did.isDidValidator('Stanly', provider);
    assert.strictEqual(data2, false);
  });

  it('updateMetadata works correctly', async () => {
    const data = await did.updateMetadata(
      'did:ssid:swn',
      'TestMetadata',
      sigKeypairWithBal,
      provider
    );
    assert.doesNotReject(data);
    const new_data = await did.getDIDDetails('did:ssid:swn', provider);
    assert.strictEqual(hexToString(new_data.metadata), 'TestMetadata');
    assert.strictEqual(new_data.added_block, 0);
  });
});
