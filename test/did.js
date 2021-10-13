const assert = require('assert');
const did = require('../src/did.js');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');
const { hexToString, sleep } = require('../src/utils');
const {
  mnemonicValidate,
} = require('@polkadot/util-crypto');

describe('DID Module works correctly', () => {
  const TEST_MNEMONIC =
    'trade tennis uncle hour cave wait stadium dove derive resemble attract relax';
  const TEST_DID = 'rocket';
  const TEST_METADATA = 'Metadata';
  const expectedPubkey =
    '74e2fd8dadfd06cc6cd6d22cf561b6693f6c138d4de8340a1e197384fcc3bc5b';
  const NEW_MNEMONIC =
    'strong offer usual inmate reform universe zero erode reopen mosquito blossom bachelor';
  const expectedNewPubkey =
    '04249359400f54ceb6ecf51edfeb1c02c8233e8ca563492df998a5d91266fa64';
  let provider = null;
  let sigKeypairWithBal = null;
  let keyring = null;

  before(async () => {
    keyring = await initKeyring();
    provider = await buildConnection(constants.providerNetwork);
    sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);
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

    const data2 = await did.isDidValidator('did:ssid:mui-guru', provider);
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

  it('sanitiseDid work correctly', async () => {
    const hex_did = did.sanitiseDid('did:ssid:swn');
    assert.strictEqual(
      hex_did,
      '0x6469643a737369643a73776e0000000000000000000000000000000000000000'
    );
  });

  it('generateMnemonic works correctly', async () => {
    const mnemonic = did.generateMnemonic();
    assert.strictEqual(mnemonicValidate(mnemonic), true);
  })

  // These test cases should only run in local environment
  if (constants.providerNetwork == 'local') {
    it('storeDIDOnChain works correctly', async () => {
      const newDidObj = await did.generateDID(TEST_MNEMONIC, 'rocket', TEST_METADATA);
      await sleep(5000);
      await did.storeDIDOnChain(newDidObj, sigKeypairWithBal, provider);
      const newDidDetails = await did.getDIDDetails(newDidObj.identity, provider);
      assert.strictEqual(newDidDetails.public_key, `0x${expectedPubkey}`);
      assert.strictEqual(newDidDetails.identifier, did.sanitiseDid('did:ssid:rocket'));
      assert.strictEqual(hexToString(newDidDetails.metadata), 'Metadata');
    })

    it('updateDidKey works correctly', async () => {
      const didString = 'did:ssid:rocket';
      const pubKey = await keyring.addFromUri(NEW_MNEMONIC).publicKey;
      await sleep(5000);
      await did.updateDidKey(didString, pubKey, sigKeypairWithBal, provider);
      await sleep(5000);
      const newUpdatedDidDetails = await did.getDIDDetails(didString, provider);
      assert.strictEqual(newUpdatedDidDetails.public_key, `0x${expectedNewPubkey}`);
      assert.strictEqual(newUpdatedDidDetails.identifier, did.sanitiseDid('did:ssid:rocket'));
      const keyHistory = (await did.getDidKeyHistory(didString, provider)).map(data => data[0]);
      assert.equal(keyHistory.includes('5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2'), true);
    })
  }


  after(async () => {
    // Delete created DID (did:ssid:rocket)
    if (constants.providerNetwork == 'local') {
      await removeDid('did:ssid:rocket', sigKeypairWithBal, provider);
    }
  })

  // To remove DID after testing
  async function removeDid(didString, sig_key_pair, provider) {
    try {
      const tx = provider.tx.did.remove(did.sanitiseDid(didString));
      await new Promise((resolve, reject) => tx.signAndSend(sig_key_pair, ({ status, dispatchError }) => {
        if (dispatchError) {
          reject('Dispatch error');
        } else if (status.isFinalized) {
          resolve(status.asFinalized.toHex());
        }
      }));
    } catch (err) {
      throw new Error(err);
    }
  }
});