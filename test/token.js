const assert = require('assert');
const token = require('../src/token');
const tx = require('../src/transaction');
const vc = require('../src/vc');
const collective = require('../src/collective');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection');
const constants = require('./test_constants');
const { expect } = require('chai');
const did = require('../src/did');
const { hexToString } = require('../src/utils');
const { removeDid, storeVC, storeMintSlashVC } = require('./helper/helper');

describe('Token Module works correctly', () => {
  let sigKeypairRoot = null;
  let signKeypairOrgA;
  let sigKeypairMeta;
  let provider = null;
  let from = null;
  let keyring;
  const TEST_META_DID = 'did:ssid:rocket';
  const TEST_ORG_A_DID = "did:ssid:dave";
  const TEST_SWN_DID = "did:ssid:swn";

  before(async () => {
    keyring = await initKeyring();
    provider = await buildConnection(constants.providerNetwork);
    sigKeypairRoot = await keyring.addFromUri(constants.mnemonicWithBalance);
    signKeypairOrgA = await keyring.addFromUri("//Dave");
    from = sigKeypairRoot.address;
  });

  // These test cases should only run in local environment
  if (constants.providerNetwork == 'local') {
    let vcId;
    let currencyId;

    before(async () => {
      if (constants.providerNetwork == 'local') {
        sigKeypairMeta = await keyring.addFromUri('//Bob');
        const didObj = {
          public_key: sigKeypairMeta.publicKey, // this is the public key linked to the did
          identity: TEST_META_DID, // this is the actual did
          metadata: 'Metadata',
        };
        try {
          await did.storeDIDOnChain(didObj, sigKeypairRoot, provider);
        } catch(err) {}
        const nonce = await provider.rpc.system.accountNextIndex(sigKeypairRoot.address);
        await tx.sendTransaction(sigKeypairRoot, TEST_META_DID, '20000000', provider, nonce);
        let tokenVC = {
          tokenName: 'Org_A',
          reservableBalance: 10000,
        };
        let owner = TEST_ORG_A_DID;
        let issuers = [
          TEST_META_DID,
        ];
        const vcHex = vc.createVC(tokenVC, owner, issuers, "TokenVC", sigKeypairMeta);
        await storeVC(vcHex, sigKeypairMeta, sigKeypairRoot, signKeypairOrgA, provider);
        vcId = (await vc.getVCIdsByDID(TEST_ORG_A_DID))[0];
      }
    });

    it('Token Issuance works correctly', async () => {
      const transfer = await token.issueToken(
        vcId,
        10000000,
        signKeypairOrgA,
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
      let balance = await token.getTokenBalance(TEST_ORG_A_DID, currencyId, provider);
      assert.strictEqual(balance, 10);
    });

    it('Get Token Name from currency id works correctly', async () => {
      let tokenName = await token.getTokenNameFromCurrencyId(currencyId, provider);
      decodeTokName = hexToString(tokenName);
      assert.strictEqual(decodeTokName, 'Org_A');
    });

    it('Get tokens total supply works correctly', async () => {
      let tokensSupply = await token.getTokenTotalSupply(currencyId, provider);
      assert.strictEqual(tokensSupply, 10);
    });

    it('Get locks works correctly', async () => {
      let locks = await token.getLocks(TEST_META_DID, currencyId, provider);
      assert.strictEqual(locks.length, 0);
    });

    it('Get token issuer works correctly', async () => {
      let issuer = await token.getTokenIssuer(currencyId, provider);
      decodeIssuer = hexToString(issuer);
      assert.strictEqual(decodeIssuer, TEST_ORG_A_DID);
    });

    it('Mint Token works correctly', async () => {
      await storeMintSlashVC(vcId, currencyId, 1000000, "MintTokens", signKeypairOrgA, provider);
      let mintVcId = (await vc.getVCIdsByDID(TEST_ORG_A_DID))[1];
      const transaction = await token.mintToken(mintVcId, signKeypairOrgA, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after mint token works correctly', async () => {
      let balance = await token.getTokenBalance(TEST_ORG_A_DID, currencyId, provider);
      assert.strictEqual(balance, 11);
    });

    it('Withdraw from treasury works correctly', async () => {
      const data = await token.withdrawTreasuryReserve(TEST_SWN_DID, TEST_META_DID, 10000, sigKeypairMeta, provider);
      assert.doesNotReject(data);
    });

    it('Slash Token works correctly', async () => {
      await storeMintSlashVC(vcId, currencyId, 1000000, "SlashTokens", signKeypairOrgA, provider);
      let slashVcId = (await vc.getVCIdsByDID(TEST_ORG_A_DID))[2];
      const transaction = await token.slashToken(slashVcId, signKeypairOrgA, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after slash token works correctly', async () => {
      let balance = await token.getTokenBalance(TEST_ORG_A_DID, currencyId, provider);
      assert.strictEqual(balance, 10);
    });

    it('Token transfer works correctly', async () => {
      const transaction = await token.transferToken(TEST_SWN_DID, currencyId, 10000, signKeypairOrgA, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after transfer works correctly', async () => {
      let balance = await token.getTokenBalance(TEST_SWN_DID, currencyId, provider);
      assert.strictEqual(balance, 0.01);
    })

    it('Token transfer all works correctly', async () => {
      const transaction = await token.transferAll(TEST_SWN_DID, currencyId, signKeypairOrgA, provider);
      assert.doesNotReject(transaction);
    });

    it('Get Token Balance after transfer all works correctly', async () => {
      let balance = await token.getTokenBalance(TEST_SWN_DID, currencyId, provider);
      assert.strictEqual(balance, 10);
    });

    it('Tokens total supply is unchanged', async () => {
      let tokensSupply = await token.getTokenTotalSupply(currencyId, provider);
      assert.strictEqual(tokensSupply, 10);
    });
  }


  after(async () => {
    // Delete created DID (did:ssid:rocket)
    if (constants.providerNetwork == 'local') {
      await removeDid(TEST_META_DID, sigKeypairRoot, provider);
      await removeDid(TEST_ORG_A_DID, sigKeypairRoot, provider);
    }
  });
});
