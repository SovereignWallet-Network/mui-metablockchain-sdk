const assert = require('assert');
const vc = require('../src/vc.js');
const did = require('../src/did.js');
const tx = require('../src/transaction.js');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');
const utils = require('../src/utils');
const { hexToU8a } = require('@polkadot/util');
const { signatureVerify, blake2AsU8a } = require('@polkadot/util-crypto');

describe('VC works correctly', () => {
  let sigKeypair = null;
  const TEST_DID = 'did:ssid:rocket';
  const EVE_DID = 'did:ssid:eve';
  var provider = null;
  let keyring;
  let sigKeypairBob;
  let signKeypairEve;
  let actualHex;
  let eveSign;

  before(async () => {
    keyring = await initKeyring();
    sigKeypair = await keyring.addFromUri('//Alice');
    provider = await buildConnection(constants.providerNetwork);
    sigKeypairBob = await keyring.addFromUri('//Bob');
    signKeypairEve = await keyring.addFromUri('//Eve');
  });

  it('VC is created in correct format', async () => {
    let tokenVC = {
      tokenName: 'test',
      reservableBalance: 1000,
    };
    let owner = "did:ssid:rocket";
    let issuers = [
      "did:ssid:swn",
      "did:ssid:eve",
    ];
    actualHex = vc.createVC(tokenVC, owner, issuers, sigKeypairBob);
    let actualObject = utils.decodeHex(actualHex, 'VC');
    let expectedObject = {
      hash: '0x8fcc460fd98b54c132cdcaed7d6d8a6026b42c8a39b916635738293e39246e91',
      owner: did.sanitiseDid("did:ssid:rocket"),
      issuers: [
        did.sanitiseDid("did:ssid:swn"),
        did.sanitiseDid("did:ssid:eve")
      ],
      signatures: [''],
      is_vc_used: false,
      vc_type: "TokenVC",
      vc_property: '0x74657374000000000000000000000000e8030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    let expectedHex = '0x8fcc460fd98b54c132cdcaed7d6d8a6026b42c8a39b916635738293e39246e916469643a737369643a726f636b65740000000000000000000000000000000000086469643a737369643a73776e00000000000000000000000000000000000000006469643a737369643a6576650000000000000000000000000000000000000000048caf7f9e8f5f3e318c0674b2b5b5c4a3b6b776220b4a991060ce2a5245bd0a513c154f1433364f085382561f26aeb30251ac73b110bcc75e8eb6e19e8cab9a80000074657374000000000000000000000000e8030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    assert.strictEqual(actualHex.substring(0, 32), expectedHex.substring(0, 32));
    assert.strictEqual(actualObject.hash, expectedObject.hash);
    assert.strictEqual(actualObject.owner, expectedObject.owner);
    assert.deepEqual(actualObject.issuers, expectedObject.issuers);
    assert.strictEqual(actualObject.vc_property, expectedObject.vc_property);
  });

  it('VC is signed in correct format', async () => {
    let tokenVC = {
      tokenName: 'test',
      reservableBalance: 1000,
    };
    eveSign = vc.signVC(tokenVC, signKeypairEve);
    let encodedTokenVC = vc.createTokenVC(tokenVC);
    const hash = blake2AsU8a(encodedTokenVC);
    let isSignValid = signatureVerify(hash, hexToU8a(eveSign), signKeypairEve.publicKey).isValid;
    assert.strictEqual(isSignValid, true);
  });

  if (constants.providerNetwork == 'local') {
    let vcId = null;

    before(async () => {
      if (constants.providerNetwork == 'local') {
        const didObj = {
          public_key: sigKeypairBob.publicKey, // this is the public key linked to the did
          identity: TEST_DID, // this is the actual did
          metadata: 'Metadata',
        };
        try {
          await did.storeDIDOnChain(didObj, sigKeypair, provider);
        } catch(err) {}
        const nonce = await provider.rpc.system.accountNextIndex(sigKeypair.address);
        await tx.sendTransaction(sigKeypair, TEST_DID, '20000000', provider, nonce);
      }
    })

    it('Store VC works correctly', async () => {
      const transaction = await vc.storeVC(actualHex, sigKeypairBob, provider);
      assert.doesNotReject(transaction);
    });

    it('Get VC Ids by DID after storing VC works correctly', async () => {
      const vcs = await vc.getVCIdsByDID(TEST_DID, provider);
      vcId = vcs[1] || vcs[0];
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
      const didObj = {
        public_key: signKeypairEve.publicKey, // this is the public key linked to the did
        identity: EVE_DID, // this is the actual did
        metadata: 'Metadata',
      };
      try {
        await did.storeDIDOnChain(didObj, sigKeypair, provider);
      } catch(err) {}
      const transaction = await vc.addSignature(vcId, eveSign, signKeypairEve, provider);
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
      const transaction = await vc.updateStatus(vcId, { InActive: 1 }, sigKeypair, provider);
      assert.doesNotReject(transaction);
      const vcs = await vc.getVCs(vcId, provider);
      assert.strictEqual(vcs[1], 'Inactive');
    });
  }

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
