const assert = require('assert');
const did = require('../src/did.js');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');
const { hexToString } = require('../src/utils');
const {
  mnemonicValidate, signatureVerify,
} = require('@polkadot/util-crypto');
const { removeDid } = require('./helper/helper.js');
const utils = require('../src/utils');
const { u8aToBuffer, u8aToU8a, hexToU8a } = require('@polkadot/util');

describe('DID Module works correctly', () => {
  const TEST_MNEMONIC =
    'trade tennis uncle hour cave wait stadium dove derive resemble attract relax';
  const DaveSeed = "link hire solve hill evil egg civil rice inform trouble poverty original";
  const CharlieSeed = "biology tag spread donkey phrase deputy pelican aerobic film grab aunt shine";
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

  it.only('should init metacash', async () => {
    const didIdentifier = utils.encodeData("did:ssid:swn", "DID_TEST");
    const message = utils.encodeData("Signed by swn".padEnd(64, '\0'), "DID_TEST");
    const signature = utils.bytesToHex(sigKeypairWithBal.sign(message));
    let key = sigKeypairWithBal.publicKey;
    assert.strictEqual(signatureVerify(hexToU8a(message), hexToU8a(signature), key).isValid, true);
    let store_key = utils.encodeData("local_store".padEnd(32, '\0'), "DID_TEST");
    let result = await provider.rpc.metacash.init(didIdentifier, message, signature, store_key);
    assert.strictEqual(result.isTrue, true);
  })

  it('DID is created in correct format', async () => {
    const didObj = await did.generateDID(TEST_MNEMONIC, TEST_DID, TEST_METADATA);
    assert.strictEqual(Buffer.from(didObj.public_key).toString('hex'), expectedPubkey);
    assert.strictEqual(didObj.identity, 'did:ssid:rocket');
    assert.strictEqual(didObj.metadata, "0x4d65746164617461000000000000000000000000000000000000000000000000");
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
      '5ES8sejoGKNyPgSpZFe5MdJCynKZcXTrukyjKM5vL2yxeY3r',
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
    let issuer = 'did:ssid:swn';
    let owner = 'did:ssid:swn';
    let didProperty = {
      pubKey: (await did.getDIDDetails(owner, provider)).public_key,
      metadata: 'TestMetadata'
    };
    let vc_hex = did.encodeDidVC(owner, issuer, didProperty, did.DidActionType.Update, sigKeypairWithBal);
    const data = await did.updateMetadata(
      'did:ssid:swn',
      'TestMetadata',
      sigKeypairWithBal,
      provider,
      vc_hex
    );
    assert.doesNotReject(data);
    const new_data = await did.getDIDDetails('did:ssid:swn', provider);
    assert.strictEqual(hexToString(new_data.metadata), 'TestMetadata');
    assert.strictEqual(new_data.added_block, 0);
  });

  it('updateMetadata by sudo works correctly', async () => {
    const data = await did.updateMetadata(
      'did:ssid:swn',
      'TestMetadata2',
      sigKeypairWithBal,
      provider,
      null
    );
    assert.doesNotReject(data);
    const new_data = await did.getDIDDetails('did:ssid:swn', provider);
    assert.strictEqual(hexToString(new_data.metadata), 'TestMetadata2');
    assert.strictEqual(new_data.added_block, 0);
  });

  it('updateMetadata throws error for unregistered DID', async () => {
    let issuer = 'did:ssid:swn';
    let owner = 'did:ssid:nonexistentdid';
    let didProperty = {
      metadata: 'TestMetadata'
    };
    let vc_hex = did.encodeDidVC(owner, issuer, didProperty, did.DidActionType.Update, sigKeypairWithBal);
    const data = did.updateMetadata(
      'did:ssid:nonexistentdid',
      'TestMetadata',
      sigKeypairWithBal,
      provider,
      vc_hex
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
      let ownerKeyPair = await keyring.addFromUri(TEST_MNEMONIC);
      let issuer = 'did:ssid:swn';
      let didProperty = {
        pubKey: newDidObj.public_key,
        metadata: newDidObj.metadata,
      };
      let vc_hex = did.encodeDidVC(newDidObj.identity, issuer, didProperty, did.DidActionType.Add, sigKeypairWithBal);

      await did.storeDIDOnChain(newDidObj, ownerKeyPair, provider, vc_hex);
      const newDidDetails = await did.getDIDDetails(newDidObj.identity, provider);
      addedDidBlockNum = newDidDetails.added_block;
      assert.strictEqual(newDidDetails.public_key, `0x${expectedPubkey}`);
      assert.strictEqual(newDidDetails.identifier, did.sanitiseDid(testIdentifier));
      assert.strictEqual(hexToString(newDidDetails.metadata), 'Metadata');
    });

    it('storeDIDOnChain by sudo works correctly', async () => {
      const newDidObj = await did.generateDID(DaveSeed, 'charlie', TEST_METADATA);
      const davePubKey = '0xd06234191ae0dc1322a5f4cdd966e6051078fd954dfea85d2b49606dc8dc1238'
      await did.storeDIDOnChain(newDidObj, sigKeypairWithBal, provider);
      const newDidDetails = await did.getDIDDetails(newDidObj.identity, provider);
      addedDidBlockNum = newDidDetails.added_block;
      assert.strictEqual(newDidDetails.public_key, `${davePubKey}`);
      assert.strictEqual(newDidDetails.identifier, did.sanitiseDid('did:ssid:charlie'));
      assert.strictEqual(hexToString(newDidDetails.metadata), 'Metadata');
    });

    it('storeDIDOnChain throws error on duplicate ssid', async () => {
      const newDidObj = await did.generateDID(NEW_MNEMONIC, 'rocket', TEST_METADATA);
      let issuer = 'did:ssid:swn';
      let didProperty = {
        pubKey: newDidObj.public_key,
        metadata: newDidObj.metadata,
      };
      let vc_hex = did.encodeDidVC(newDidObj.identity, issuer, didProperty, did.DidActionType.Add, sigKeypairWithBal);

      const data = did.storeDIDOnChain(newDidObj, sigKeypairWithBal, provider, vc_hex);
      await assert.rejects(data, (err) => {
        assert.strictEqual(err.message, 'did.DIDAlreadyExists');
        return true;
      });
    });

    it('storeDIDOnChain throws error on duplicate public key', async () => {
      const newDidObj = await did.generateDID(TEST_MNEMONIC, 'nonexistentdid', TEST_METADATA);
      let issuer = 'did:ssid:swn';
      let didProperty = {
        pubKey: newDidObj.public_key,
        metadata: newDidObj.metadata,
      };
      let vc_hex = did.encodeDidVC(newDidObj.identity, issuer, didProperty, did.DidActionType.Add, sigKeypairWithBal);
      const data = did.storeDIDOnChain(newDidObj, sigKeypairWithBal, provider, vc_hex);
      await assert.rejects(data, (err) => {
        assert.strictEqual(err.message, 'did.PublicKeyRegistered');
        return true;
      });
    });

    it('updateDidKey works correctly', async () => {
      const didString = testIdentifier;
      const pubKey = await keyring.addFromUri(NEW_MNEMONIC).publicKey;
      let issuer = 'did:ssid:swn';
      let didProperty = {
        pubKey,
      };
      let vc_hex = did.encodeDidVC(didString, issuer, didProperty, did.DidActionType.Rotate, sigKeypairWithBal);
      await did.updateDidKey(didString, pubKey, sigKeypairWithBal, provider, vc_hex);
      const newUpdatedDidDetails = await did.getDIDDetails(didString, provider);
      updatedKeyBlockNum = newUpdatedDidDetails.added_block;
      assert.strictEqual(newUpdatedDidDetails.public_key, `0x${expectedNewPubkey}`);
      assert.strictEqual(newUpdatedDidDetails.identifier, did.sanitiseDid(testIdentifier));
      const keyHistory = (await did.getDidKeyHistory(didString, provider));
      assert.equal(keyHistory.map(data => data[0]).includes('5EhxqnrHHFy32DhcaqYrWiwC82yDiVS4xySysGxsUn462nX2'), true);
    })

    it('updateDidKey by sudo works correctly', async () => {
      const didString = 'did:ssid:charlie';
      const pubKey = await keyring.addFromUri(CharlieSeed).publicKey;
      const charliePubKey = '0xc62bd629cc0476fbfa3de82f0caf1587febeaab0a48090f1d06d8d6f03aae256';
      await did.updateDidKey(didString, pubKey, sigKeypairWithBal, provider, null);
      const newUpdatedDidDetails = await did.getDIDDetails(didString, provider);
      assert.strictEqual(newUpdatedDidDetails.public_key, `${charliePubKey}`);
      assert.strictEqual(newUpdatedDidDetails.identifier, did.sanitiseDid(didString));
      const keyHistory = (await did.getDidKeyHistory(didString, provider));
      assert.equal(keyHistory.map(data => data[0]).includes('5GmvzMeoJMNxKhHQcXN2jscS3knBGR7NaCLBcCnpg9T9hA7o'), true);
    })

    it('updateDidKey throws error on using existing public key', async () => {
      const pubKey = await keyring.addFromUri(NEW_MNEMONIC).publicKey;
      let issuer = 'did:ssid:swn';
      let didProperty = {
        pubKey,
      };
      let vc_hex = did.encodeDidVC(testIdentifier, issuer, didProperty, did.DidActionType.Rotate, sigKeypairWithBal);
      const data = did.updateDidKey(testIdentifier, pubKey, sigKeypairWithBal, provider, vc_hex);
      await assert.rejects(data, (err) => {
        assert.strictEqual(err.message, 'did.PublicKeyRegistered');
        return true;
      });
    });

    it('updateDidKey throws error on using non existent did', async () => {
      const pubKey = await keyring.addFromUri(TEST_MNEMONIC).publicKey;
      let issuer = 'did:ssid:swn';
      let didProperty = {
        pubKey,
      };
      let vc_hex = did.encodeDidVC('did:ssid:nonexistentdid', issuer, didProperty, did.DidActionType.Rotate, sigKeypairWithBal);
      const data = did.updateDidKey('did:ssid:nonexistentdid', pubKey, sigKeypairWithBal, provider, vc_hex);
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
    // if (constants.providerNetwork == 'local') {
    //   await removeDid('did:ssid:rocket', sigKeypairWithBal, provider);
    //   await removeDid('did:ssid:charlie', sigKeypairWithBal, provider);
    // }
  })
});