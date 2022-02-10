const assert = require('assert');
const vc = require('../src/vc.js');
const tx = require('../src/transaction.js');
const did = require('../src/did.js');
const { initKeyring, SSID_BASE_URL } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');
const utils = require('../src/utils');
const { removeDid, storeVC, sudoStoreVC } = require('./helper/helper.js');

describe('VC works correctly', () => {
  let sigKeypair = null;
  const TEST_DID = 'did:ssid:rocket';
  const EVE_DID = 'did:ssid:eve';
  var provider = null;
  let keyring;
  let sigKeypairBob;
  let signKeypairEve;
  let signKeypairDave;
  let actualHex;
  let ssidUrl;
  let eveSign;
  const TEST_DAVE_DID = "did:ssid:dave";
  const TEST_SWN_DID = "did:ssid:swn";

  before(async () => {
    keyring = await initKeyring();
    sigKeypair = await keyring.addFromUri('//Alice');
    provider = await buildConnection(constants.providerNetwork);
    ssidUrl = SSID_BASE_URL[constants.providerNetwork];
    sigKeypairBob = await keyring.addFromUri('//Bob');
    signKeypairEve = await keyring.addFromUri('//Eve');
    signKeypairDave = await keyring.addFromUri('//Dave');
  });

  it('VC is created in correct format', async () => {
    let tokenVC = {
      tokenName: 'test',
      reservableBalance: 1000,
      decimal: 6,
      currencyCode: 'OTH',
    };
    let owner = TEST_DID;
    let issuers = [
      TEST_SWN_DID,
      EVE_DID,
    ];
    actualHex = await vc.generateVC(tokenVC, owner, issuers, "TokenVC", sigKeypair);
    let actualObject = utils.decodeHex(actualHex, 'VC');
    let expectedObject = {
      hash: '0x1bfef48398ef3adcc90370f64c22d520ed45280455f6ef7df369005dd51989c7',
      owner: did.sanitiseDid(TEST_DID),
      issuers: [
        did.sanitiseDid(TEST_SWN_DID),
        did.sanitiseDid(EVE_DID)
      ],
      signatures: [''],
      is_vc_used: false,
      vc_type: "TokenVC",
      vc_property: '0x7465737400000000000000000000000000ca9a3b000000000000000000000000064f54480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    };
    let expectedHex = '0x1bfef48398ef3adcc90370f64c22d520ed45280455f6ef7df369005dd51989c76469643a737369643a726f636b65740000000000000000000000000000000000086469643a737369643a73776e00000000000000000000000000000000000000006469643a737369643a657665000000000000000000000000000000000000000004c42aa9c5f8a29f40668e5aa696e83e0c6cc20fa090e4bb612b7ae9817812497656456b9cc05232e6a709c2ea7852fb9d2a666f1840cb7a0d2ed754c49e0ce98300007465737400000000000000000000000000ca9a3b000000000000000000000000064f54480000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    assert.strictEqual(actualHex.substring(0, 32), expectedHex.substring(0, 32));
    assert.strictEqual(actualObject.hash, expectedObject.hash);
    assert.strictEqual(actualObject.owner, expectedObject.owner);
    assert.deepEqual(actualObject.issuers, expectedObject.issuers);
    assert.strictEqual(actualObject.vc_property, expectedObject.vc_property);
  });

  it('Mint Token VC is created correctly', async () => {
    let vc_property = {
      vc_id: '0x33abedba92bb1acd284419f93e687590af928c268b633786e61b2f2c5635662d',
      currency_code: utils.encodeData('OTH'.padEnd(utils.CURRENCY_CODE_BYTES, '\0'), 'CurrencyCode'),
      amount: 1000
    }
    const vc_property_hex = utils.encodeData(vc_property, 'SlashMintTokens');
    const actual_vc_property = utils.decodeHex(vc_property_hex, 'SlashMintTokens');
    assert.strictEqual(vc_property.vc_id, actual_vc_property.vc_id);
    assert.strictEqual(vc_property.currency_code, actual_vc_property.currency_code);
    assert.strictEqual(vc_property.amount, actual_vc_property.amount);
  })

  it('VC creation fails token name is not given', async () => {
    let tokenVC = {
      reservableBalance: 1000,
    };
    let owner = TEST_DID;
    let issuers = [
      TEST_SWN_DID,
      EVE_DID,
    ];
    try {
      await vc.generateVC(tokenVC, owner, issuers, "TokenVC", sigKeypairBob);
    } catch (e) {
      assert.strictEqual(e.message, "Token name is required");
    }
  });

  it('VC creation fails when token name length exceeds limit', async () => {
    let tokenVC = {
      tokenName: 'abcdefghijlkmnopq',
      reservableBalance: 1000,
      decimal: 6,
      currencyCode: 'OTH',
    };
    let owner = TEST_DID;
    let issuers = [
      TEST_SWN_DID,
      EVE_DID,
    ];
    try {
      await vc.generateVC(tokenVC, owner, issuers, "TokenVC", sigKeypairBob);
    } catch (e) {
      assert.strictEqual(e.message, "Token name should not exceed 16 chars");
    }
  });

  it('VC creation fails when currency code is not valid', async () => {
    let tokenVC = {
      tokenName: 'test',
      reservableBalance: 1000,
      currencyCode: 'abc'
    };
    let owner = TEST_DID;
    let issuers = [
      TEST_SWN_DID,
      EVE_DID,
    ];
    try {
      await vc.generateVC(tokenVC, owner, issuers, "TokenVC", sigKeypairBob);
    } catch (e) {
      assert.strictEqual(e.message, "Only Upper case characters with no space are allowed for currency code");
    }
    tokenVC.currencyCode = 'ABC12';
    try {
      await vc.generateVC(tokenVC, owner, issuers, "TokenVC", sigKeypairBob);
    } catch (e) {
      assert.strictEqual(e.message, "Only Upper case characters with no space are allowed for currency code");
    }
    tokenVC.currencyCode = 'AB C ';
    try {
      await vc.generateVC(tokenVC, owner, issuers, "TokenVC", sigKeypairBob);
    } catch (e) {
      assert.strictEqual(e.message, "Only Upper case characters with no space are allowed for currency code");
    }
  });

  // Note: Since we are not generating the signature independtly any more, no need to test the signature generation sperately
  // appoveVC is test is enough to test the signature generation 
  // it('VC is signed in correct format', async () => {
  //   let tokenVC = {
  //     tokenName: 'test',
  //     reservableBalance: 1000,
  //     decimal: 6,
  //     currencyCode: 'OTH',
  //   };

  //   let owner = TEST_DID;
  //   let issuers = [
  //     TEST_SWN_DID,
  //     EVE_DID,
  //   ];
  //   const toSign = {
  //     vcType: "TokenVC",
  //     vcProperty: tokenVC,
  //     owner,
  //     issuers,
  //   }
  //   eveSign = vc.approveVC(toSign, signKeypairEve);
  //   owner = did.sanitiseDid(owner);
  //   issuers = issuers.map(issuer => did.sanitiseDid(issuer));
  //   const encodedData = utils.encodeData({
  //     vc_type: "TokenVC",
  //     vc_property: vc.createTokenVC(tokenVC),
  //     owner,
  //     issuers,
  //   }, "VC_HEX");
  //   const hash = blake2AsHex(encodedData);
  //   let isSignValid = signatureVerify(hash, hexToU8a(eveSign), signKeypairEve.publicKey).isValid;
  //   assert.strictEqual(isSignValid, true);
  // });

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
        } catch (err) { }
        try {
          const didObjDave = {
            public_key: signKeypairDave.publicKey, // this is the public key linked to the did
            identity: TEST_DAVE_DID, // this is the actual did
            metadata: 'Metadata',
          };
          await did.storeDIDOnChain(didObjDave, sigKeypair, provider);
        } catch (err) { }
        try {
          const didObjEve = {
            public_key: signKeypairEve.publicKey, // this is the public key linked to the did
            identity: EVE_DID, // this is the actual did
            metadata: 'Metadata',
          };
          await did.storeDIDOnChain(didObjEve, sigKeypair, provider);
        } catch (err) { }

        try {
          const didObjDave = {
            public_key: signKeypairDave.publicKey, // this is the public key linked to the did
            identity: TEST_DAVE_DID, // this is the actual did
            metadata: 'Metadata',
          };
          await did.storeDIDOnChain(didObjDave, sigKeypair, provider);
        } catch (err) { }

        const didObjEve = {
          public_key: signKeypairEve.publicKey, // this is the public key linked to the did
          identity: EVE_DID, // this is the actual did
          metadata: 'Metadata',
        };
        try {
          await did.storeDIDOnChain(didObjEve, sigKeypair, provider);
        } catch (err) { }

        const nonce = await provider.rpc.system.accountNextIndex(sigKeypair.address);
        await tx.sendTransaction(sigKeypair, TEST_DID, '20000000', provider, nonce);
      }
    })

    it('Store VC works correctly', async () => {
      const transaction = await storeVC(actualHex, sigKeypairBob, sigKeypair, signKeypairDave, provider);
      assert.doesNotReject(transaction);
    });

    it('Get VC Ids by DID after storing VC works correctly', async () => {
      const vcs = await vc.getVCIdsByDID(TEST_DID, provider);
      vcId = vcs[vcs.length-1];
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

    // This test case is not needed any more
    // it('Sign VC works correctly', async () => {
    //   const didObj = {
    //     public_key: signKeypairEve.publicKey, // this is the public key linked to the did
    //     identity: EVE_DID, // this is the actual did
    //     metadata: 'Metadata',
    //   };
    //   try {
    //     await did.storeDIDOnChain(didObj, sigKeypair, provider);
    //   } catch(err) {}
    //   const transaction = await vc.addSignature(vcId, eveSign, signKeypairEve, provider);
    //   assert.doesNotReject(transaction);
    // });

    it('Get VCs works correctly after signing', async () => {
      const vcs = await vc.getVCs(vcId, provider);
      assert.notStrictEqual(vcs, null);
    });

    it('Update status works correctly', async () => {
      const transaction = await vc.updateStatus(vcId, { InActive: 1 }, sigKeypair, provider);
      assert.doesNotReject(transaction);
      const vcs = await vc.getVCs(vcId, provider);
      assert.strictEqual(vcs[1], 'Inactive');
    });

    it('Store Generic VC works correctly', async () => {
      let genericVC = {
        cid: 'yD5HYVIgzl3_3Ze3fMgc',
      };
      let owner = TEST_DID;
      let issuers = [
        TEST_SWN_DID,
        EVE_DID,
      ];
      const vcHex = await vc.generateVC(genericVC, owner, issuers, "GenericVC", sigKeypair, provider, ssidUrl);
      const transaction = await vc.storeVC(vcHex, sigKeypairBob, provider);
      const vcsByDid = await vc.getVCIdsByDID(TEST_DID, provider);
      vcId = vcsByDid[vcsByDid.length-1];
      await vc.approveVC(vcId, signKeypairEve, provider, ssidUrl);
      assert.doesNotReject(transaction);
      let data = await vc.getGenericVCData(vcId, ssidUrl, provider);
      let verifyData = await vc.verifyGenericVC(data.vcId, data.data, provider);
      assert.strictEqual(verifyData, true);
    });

    it('Auto Active VC Status on sign works correctly', async () => {
      let owner = TEST_DID;
      let issuers = [
        TEST_SWN_DID,
        EVE_DID,
        TEST_DAVE_DID
      ];
      let tokenVC = {
        tokenName: 'test',
        reservableBalance: 1000,
        decimal: 6,
        currencyCode: 'OTH',
      };
      actualHex = await vc.generateVC(tokenVC, owner, issuers, "TokenVC", sigKeypair);
      await sudoStoreVC(actualHex, sigKeypair, provider);
      const vcsByDid = await vc.getVCIdsByDID(TEST_DID, provider);
      vcId = vcsByDid[vcsByDid.length-1];
      let vcs = await vc.getVCs(vcId, provider);
      assert.strictEqual(vcs[1], 'Inactive');
      await vc.approveVC(vcId, signKeypairEve, provider);
      vcs = await vc.getVCs(vcId, provider);
      assert.strictEqual(vcs[1], 'Inactive');
      await vc.approveVC(vcId, signKeypairDave, provider);
      vcs = await vc.getVCs(vcId, provider);
      assert.strictEqual(vcs[1], 'Active');
    });
  }

  after(async () => {
    // Delete created DIDs
    if (constants.providerNetwork == 'local') {
      try {
        await removeDid(TEST_DID, sigKeypair, provider);
        await removeDid(EVE_DID, sigKeypair, provider);
        await removeDid(TEST_DAVE_DID, sigKeypair, provider);
      } catch (err) { }
    }
  });
});
