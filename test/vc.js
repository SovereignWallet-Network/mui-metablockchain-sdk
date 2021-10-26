const assert = require('assert');
const vc = require('../src/vc.js');
const did = require('../src/did.js');
const tx = require('../src/transaction.js');
const vcJson = require('../src/vc_schema/identity.json');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');

describe('VC works correctly', () => {
  const originJson = vcJson;
  originJson.name = 'Mathew Joseph';
  originJson.email = 'test@test.com';
  originJson.country = 'India';
  originJson.owner_did = 'did:ssid:mathew';
  originJson.issued_block = '2244';
  let sigKeypair = null;
  const sigDid = 'did:ssid:swn';
  const TEST_DID = 'did:ssid:rocket';
  const EVE_DID = 'did:ssid:eve';
  var provider = null;
  let keyring;

  before(async () => {
    keyring = await initKeyring();
    sigKeypair = await keyring.addFromUri('//Alice');
    provider = await buildConnection(constants.providerNetwork);
  });

  if (constants.providerNetwork == 'local') {
    let vcId = null;
    let sigKeypairBob;
    let signKeypairEve;

    before(async () => {
      if (constants.providerNetwork == 'local') {
        sigKeypairBob = await keyring.addFromUri('//Bob');
        const didObj = {
          public_key: sigKeypairBob.publicKey, // this is the public key linked to the did
          identity: TEST_DID, // this is the actual did
          metadata: 'Metadata',
        };
        await did.storeDIDOnChain(didObj, sigKeypair, provider);
        const nonce = await provider.rpc.system.accountNextIndex(sigKeypair.address);
        await tx.sendTransaction(sigKeypair, TEST_DID, '20000000', provider, nonce);
      }
    })

    it('Store VC works correctly', async () => {
      // TODO: Generate this vc hex dynamically
      const vcHex = '0x8fcc460fd98b54c132cdcaed7d6d8a6026b42c8a39b916635738293e39246e916469643a737369643a726f636b65740000000000000000000000000000000000086469643a737369643a73776e00000000000000000000000000000000000000006469643a737369643a6576650000000000000000000000000000000000000000048caf7f9e8f5f3e318c0674b2b5b5c4a3b6b776220b4a991060ce2a5245bd0a513c154f1433364f085382561f26aeb30251ac73b110bcc75e8eb6e19e8cab9a80000074657374000000000000000000000000e8030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
      const transaction = await vc.storeVC(vcHex, sigKeypairBob, provider);
      assert.doesNotReject(transaction);
    });

    it('Get VC Ids by DID after storing VC works correctly', async () => {
      const vcs = await vc.getVCIdsByDID(TEST_DID, provider);
      vcId = vcs[0];
      assert.strictEqual(vcs.length > 0, true);
    });

    it('Get VCs works correctly', async () => {
      const vcs = await vc.getVCs(vcId, provider);
      assert.notStrictEqual(vcs, null);
    });

    it('Get DID by VC Id works correctly', async () => {
      const identifier = await vc.getDIDByVCId(vcId, provider);
      assert.strictEqual(identifier, did.sanitiseDid(TEST_DID));
    });

    it('Get VC history by VC ID works correctly', async () => {
      const vcHistory = await vc.getVCHistoryByVCId(vcId, provider);
      assert.notStrictEqual(vcHistory, null);
    });

    it('Sign VC works correctly', async () => {
      signKeypairEve = await keyring.addFromUri('//Eve');
      const didObj = {
        public_key: signKeypairEve.publicKey, // this is the public key linked to the did
        identity: EVE_DID, // this is the actual did
        metadata: 'Metadata',
      };
      await did.storeDIDOnChain(didObj, sigKeypair, provider);
      // TODO: Generate sign dynamically
      const sign = '0xfc69de5b6fa409a7689f79eced598216795e6639c9e8c6d7418a63023b48cd525ab844c89170622bf31f70ae9fb1d0c2da29d974566c47cfb8bd027fb3af398a';
      const transaction = await vc.addSignature(vcId, sign, signKeypairEve, provider);
      assert.doesNotReject(transaction);
    });

    it('Get VCs works correctly after signing', async () => {
      const vcs = await vc.getVCs(vcId, provider);
      assert.notStrictEqual(vcs, null);
    });

    it('Get VCs has new signature', async () => {
      const vcs = await vc.getVCs(vcId, provider);
      assert.strictEqual(vcs[0].signatures.length, 2);
    });

    it('Update status works correctly', async () => {
      const transaction = await vc.updateStatus(vcId, {InActive: 1}, sigKeypair, provider);
      assert.doesNotReject(transaction);
      const vcs = await vc.getVCs(vcId, provider);
      assert.strictEqual(vcs[1], 'Inactive');
    });
  }

  // it('VC is created in correct format', async () => {
  //   let tokenVC = {
  //     token_name: 'Test',
  //     reservable_balance: 1000,
  //   };
  //   const expectedHash = u8aToHex(sha256(stringToU8a(JSON.stringify(tokenVC))));
  //   sigKeypairBob = await keyring.addFromUri('//Bob');
  //   const rawVC = await vc.createVC(tokenVC, 'did:ssid:rocket', sigKeypairBob);
  //   assert.strictEqual(rawVC.owner, TEST_DID);
  //   assert.strictEqual(rawVC.hash, expectedHash);
  // });

  // it('VC is signed in correct format', async () => {
  //   const rawVC = await vc.createVC(originJson, schemaToTest, provider);
  //   const signedVC = await vc.signVC(rawVC, sigDid, sigKeypair);
  //   assert.strictEqual(signedVC.properties, originJson);
  //   assert.strictEqual(signedVC.hash, expectedHash);
  //   assert.strictEqual(signedVC.verifier, sigDid);
  //   assert.strictEqual(signedVC.schema, schemaToTest);
  //   // sr25519 signature are not deterministic, check only if value is present here
  //   assert.notStrictEqual(signedVC.schema, undefined);
  // });

  // it('VC verification works ', async () => {
  //   const rawVC = await vc.createVC(originJson, schemaToTest, provider);
  //   const signedVC = await vc.signVC(rawVC, sigDid, sigKeypair);
  //   const res = await vc.verifyVC(signedVC, provider);
  //   assert.strictEqual(res, true);
  // });

  after(async () => {
    // Delete created DIDs
    if (constants.providerNetwork == 'local') {
      await removeDid(TEST_DID, sigKeypair, provider);
      await removeDid(EVE_DID, sigKeypair, provider);
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
