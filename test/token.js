const assert = require('assert');
const token = require('../src/token');
const tx = require('../src/transaction');
const vc = require('../src/vc');
const balance = require('../src/balance');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection');
const constants = require('./test_constants');
const { expect } = require('chai');
const did = require('../src/did');
const { hexToString } = require('../src/utils');

describe('Token Module works correctly', () => {
  let sigKeypairWithBal = null;
  let sigKeypairWithoutBal = null;
  let provider = null;
  let from = null;
  const TEST_DID = 'did:ssid:rocket';
  let keyring;

  before(async () => {
    keyring = await initKeyring();
    provider = await buildConnection(constants.providerNetwork);
    sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);
    sigKeypairWithoutBal = await keyring.addFromUri('//Test123');
    from = sigKeypairWithBal.address;
  });

  it('Token balance fetch works correctly for non existing tokens', async () => {
    //  Alice is expected in the test chain
    const data = await token.getTokenBalance('did:ssid:swn', '990');
    assert.doesNotReject(data);
  });

  // These test cases should only run in local environment
  if (constants.providerNetwork == 'local') {
    let vcId;
    let currencyId;

    before(async () => {
      if (constants.providerNetwork == 'local') {
        sigKeypairBob = await keyring.addFromUri('//Bob');
        const didObj = {
          public_key: sigKeypairBob.publicKey, // this is the public key linked to the did
          identity: TEST_DID, // this is the actual did
          metadata: 'Metadata',
        };
        await did.storeDIDOnChain(didObj, sigKeypairWithBal, provider);
        const nonce = await provider.rpc.system.accountNextIndex(sigKeypairWithBal.address);
        await tx.sendTransaction(sigKeypairWithBal, TEST_DID, '20000000', provider, nonce);
        const vcHex = '0xcc090ccf4e1e6fd1325d3884479dccd50f457d35b9b239333b6d9b4a531a25d46469643a737369643a726f636b65740000000000000000000000000000000000046469643a737369643a73776e000000000000000000000000000000000000000004242043f42ef6eb8a403d49d26c5d072e3af043d27a29611ca7f00d10d9603327991cedbb45a651c19ffc6b3f9681311deb6fdf129c3b62251c4312186483be8c00007465737400000000000000000000000010270000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
        await vc.storeVC(vcHex, sigKeypairBob, provider);
        vcId = (await vc.getVCIdsByDID(didObj.identity))[0];
      }
    });

    it('Token Issuance works correctly', async () => {
      const transfer = await token.issueToken(
        vcId,
        '100000',
        sigKeypairBob,
        provider
      );
      assert.doesNotReject(transfer);
    });

    it('Get tokens list works correctly', async () => {
      let tokensList = await token.getTokenList(provider);
      currencyId = tokensList[0].id;
      tokensList.forEach(item => {
        expect(item).to.haveOwnProperty('id');
        expect(item).to.haveOwnProperty('name');
      });
    });

    it('Get Token Balance works correctly', async () => {
      let balance = await token.getTokenBalance(TEST_DID, currencyId, provider);
      assert.strictEqual(balance, '100.0000 mMUI');
    });

    it('Get Token Name from currency id works correctly', async () => {
      let tokenName = await token.getTokenNameFromCurrencyId(currencyId, provider);
      decodeTokName = hexToString(tokenName);
      assert.strictEqual(decodeTokName, 'test');
    });

    it('Get tokens total supply works correctly', async () => {
      let tokensSupply = await token.getTokenTotalSupply(currencyId, provider);
      assert.strictEqual(tokensSupply, '100.0000 mMUI');
    });

    it('Get locks works correctly', async () => {
      let locks = await token.getLocks(TEST_DID, currencyId, provider);
      assert.strictEqual(locks.length, 0);
    });

    it('Get token issuer works correctly', async () => {
      let issuer = await token.getTokenIssuer(currencyId, provider);
      decodeIssuer = hexToString(issuer);
      assert.strictEqual(decodeIssuer, TEST_DID);
    });

    it('Mint Token works correctly', async () => {
      const transaction = await token.mintToken(vcId, currencyId, '100000', sigKeypairBob, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after mint token works correctly', async () => {
      let balance = await token.getTokenBalance(TEST_DID, currencyId, provider);
      assert.strictEqual(balance, '200.0000 mMUI');
    });

    it('Withdraw from treasury works correctly', async () => {
      const data = await token.withdrawTreasuryReserve(vcId, 'did:ssid:swn', TEST_DID, '10000', sigKeypairBob, provider);
      assert.doesNotReject(data);
    });

    it('Slash Token works correctly', async () => {
      const transaction = await token.slashToken(vcId, currencyId, '100000', sigKeypairBob, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after slash token works correctly', async () => {
      let balance = await token.getTokenBalance(TEST_DID, currencyId, provider);
      assert.strictEqual(balance, '100.0000 mMUI');
    });

    it('Token transfer works correctly', async () => {
      const transaction = await token.transferToken(vcId, 'did:ssid:swn', currencyId, '10000', sigKeypairBob, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after transfer works works correctly', async () => {
      let balance = await token.getTokenBalance('did:ssid:swn', currencyId, provider);
      assert.strictEqual(balance, '10.0000 mMUI');
    })

    it('Token transfer all works correctly', async () => {
      const transaction = await token.transferAll(vcId, 'did:ssid:swn', currencyId, sigKeypairBob, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after transfer all works correctly', async () => {
      let balance = await token.getTokenBalance('did:ssid:swn', currencyId, provider);
      assert.strictEqual(balance, '100.0000 mMUI');
    });

    it('Tokens total supply is unchanged', async () => {
      let tokensSupply = await token.getTokenTotalSupply(currencyId, provider);
      assert.strictEqual(tokensSupply, '100.0000 mMUI');
    });
  }


  after(async () => {
    // Delete created DID (did:ssid:rocket)
    if (constants.providerNetwork == 'local') {
      await removeDid(TEST_DID, sigKeypairWithBal, provider);
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
