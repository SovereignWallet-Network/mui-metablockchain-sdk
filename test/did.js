const assert = require('assert');
const did = require('../src/did.js');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');
const { hexToString } = require('../src/utils');
const {
  mnemonicValidate,
} = require('@polkadot/util-crypto');
const { removeDid } = require('./helper/helper.js');

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
      did.sanitiseDid('did:ssid:swn')
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
      did.sanitiseDid('did:ssid:swn')
    );

    // return false for non existent did - this accountid is not expected to have a DID
    const data2 = await did.resolveAccountIdToDid(
      '5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2',
      provider
    );
    assert.strictEqual(data2, false);
  });

  it('Resolve DID to account at block number 0 works correctly', async () => {
    const data = await did.resolveDIDToAccount('did:ssid:swn', provider, 0);
    // Alice's DID is created at block number 0
    assert.strictEqual(data, '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
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

  it('updateMetadata throws error for unregistered DID', async () => {
    const data = did.updateMetadata(
      'did:ssid:nonexistentdid',
      'TestMetadata',
      sigKeypairWithBal,
      provider
    );
    await assert.rejects(data, (err) => {
      assert.strictEqual(err.message, 'did.DIDDoesNotExist');
      return true;
    });
  });

  it('sanitiseDid work correctly', async () => {
    const hex_did = did.sanitiseDid('did:ssid:swn');
    assert.strictEqual(
      hex_did,
      did.sanitiseDid('did:ssid:swn')
    );
  });

  it('generateMnemonic works correctly', async () => {
    const mnemonic = did.generateMnemonic();
    assert.strictEqual(mnemonicValidate(mnemonic), true);
  })

  // These test cases should only run in local environment
  if (constants.providerNetwork == 'local') {
    let addedDidBlockNum = null;
    let updatedKeyBlockNum = null;
    let testIdentifier = 'did:ssid:rocket';

    it('storeDIDOnChain works correctly', async () => {
      const newDidObj = await did.generateDID(TEST_MNEMONIC, 'rocket', TEST_METADATA);
      await did.storeDIDOnChain(newDidObj, sigKeypairWithBal, provider);
      const newDidDetails = await did.getDIDDetails(newDidObj.identity, provider);
      addedDidBlockNum = newDidDetails.added_block;
      assert.strictEqual(newDidDetails.public_key, `0x${expectedPubkey}`);
      assert.strictEqual(newDidDetails.identifier, did.sanitiseDid(testIdentifier));
      assert.strictEqual(hexToString(newDidDetails.metadata), 'Metadata');
    });

    it('storeDIDOnChain throws error on duplicate ssid', async () => {
      const newDidObj = await did.generateDID(NEW_MNEMONIC, 'rocket', TEST_METADATA);
      const data = did.storeDIDOnChain(newDidObj, sigKeypairWithBal, provider);
      await assert.rejects(data, (err) => {
        assert.strictEqual(err.message, 'did.DIDAlreadyExists');
        return true;
      });
    });

    it('storeDIDOnChain throws error on duplicate public key', async () => {
      const newDidObj = await did.generateDID(TEST_MNEMONIC, 'nonexistentdid', TEST_METADATA);
      const data = did.storeDIDOnChain(newDidObj, sigKeypairWithBal, provider);
      await assert.rejects(data, (err) => {
        assert.strictEqual(err.message, 'did.PublicKeyRegistered');
        return true;
      });
    });

    it('updateDidKey works correctly', async () => {
      const didString = testIdentifier;
      const pubKey = await keyring.addFromUri(NEW_MNEMONIC).publicKey;
      await did.updateDidKey(didString, pubKey, sigKeypairWithBal, provider);
      const newUpdatedDidDetails = await did.getDIDDetails(didString, provider);
      updatedKeyBlockNum = newUpdatedDidDetails.added_block;
      assert.strictEqual(newUpdatedDidDetails.public_key, `0x${expectedNewPubkey}`);
      assert.strictEqual(newUpdatedDidDetails.identifier, did.sanitiseDid(testIdentifier));
      const keyHistory = (await did.getDidKeyHistory(didString, provider));
      assert.equal(keyHistory.map(data => data[0]).includes('5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2'), true);
    })

    it('updateDidKey throws error on using existing public key', async () => {
      const pubKey = await keyring.addFromUri(NEW_MNEMONIC).publicKey;
      const data = did.updateDidKey(testIdentifier, pubKey, sigKeypairWithBal, provider);
      await assert.rejects(data, (err) => {
        assert.strictEqual(err.message, 'did.PublicKeyRegistered');
        return true;
      });
    });

    it('updateDidKey throws error on using non existent did', async () => {
      const pubKey = await keyring.addFromUri(TEST_MNEMONIC).publicKey;
      const data = did.updateDidKey('did:ssid:nonexistentdid', pubKey, sigKeypairWithBal, provider);
      await assert.rejects(data, (err) => {
        assert.strictEqual(err.message, 'did.DIDDoesNotExist');
        return true;
      });
    });

    it('Resolve test DID to account at block number 0 works correctly', async () => {
      const data = await did.resolveDIDToAccount(testIdentifier, provider, 0);
      assert.strictEqual(data, null);
      return true;
    });

    it('Resolve DID to account after did created works correctly', async () => {
      // const prevAccBlockNumAcc = await did.resolveDIDToAccount(testIdentifier, provider, addedDidBlockNum-1);
      const creatAccBlockNumAcc = await did.resolveDIDToAccount(testIdentifier, provider, addedDidBlockNum);
      const nextBlockNumberAcc = await did.resolveDIDToAccount(testIdentifier, provider, addedDidBlockNum+1);
      // assert.strictEqual(prevAccBlockNumAcc, null);
      assert.strictEqual(creatAccBlockNumAcc, '5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2');
      assert.strictEqual(nextBlockNumberAcc, '5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2');
    });

    it('Resolve DID to account after key updated works correctly', async () => {
      const prevBlockNumberAcc = await did.resolveDIDToAccount(testIdentifier, provider, updatedKeyBlockNum-1);
      const keyUpdateBlockNumberAcc = await did.resolveDIDToAccount(testIdentifier, provider, updatedKeyBlockNum);
      const nextblockNumberAcc = await did.resolveDIDToAccount(testIdentifier, provider, updatedKeyBlockNum+1);
      assert.strictEqual(prevBlockNumberAcc, '5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2');
      assert.strictEqual(keyUpdateBlockNumberAcc, '5CA8uxffSzq2JyXVKXBudbgC3zBkQGzH2WUUf8ogBiJzxvFJ');
      assert.strictEqual(nextblockNumberAcc, '5CA8uxffSzq2JyXVKXBudbgC3zBkQGzH2WUUf8ogBiJzxvFJ');
    });
  }


  after(async () => {
    // Delete created DID (did:ssid:rocket)
    if (constants.providerNetwork == 'local') {
      await removeDid('did:ssid:rocket', sigKeypairWithBal, provider);
    }
  })
});