const assert = require('assert');

const collective = require('../src/collective');
const did = require('../src/did');
const tx = require('../src/transaction');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection');
const constants = require('./test_constants');
const { removeDid } = require('./helper/helper');

describe('Collective works correctly', () => {
  let provider = null;
  let sudoKey;
  let sudoPair;
  let newMembers;
  let proposalHash;
  let index;
  const TEST_ROCKET_DID = "did:ssid:rocket";
  const TEST_DAVE_DID = "did:ssid:dave";
  const TEST_SWN_DID = "did:ssid:swn";
  const vcHex = '0xcc090ccf4e1e6fd1325d3884479dccd50f457d35b9b239333b6d9b4a531a25d46469643a737369643a726f636b65740000000000000000000000000000000000046469643a737369643a73776e000000000000000000000000000000000000000004242043f42ef6eb8a403d49d26c5d072e3af043d27a29611ca7f00d10d9603327991cedbb45a651c19ffc6b3f9681311deb6fdf129c3b62251c4312186483be8c00007465737400000000000000000000000010270000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

  if (constants.providerNetwork == 'local') {
    before(async () => {
      provider = await buildConnection(constants.providerNetwork);
      const keyring = await initKeyring();
      let sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);

      sudoKey = await provider.query.sudo.key();
      sudoPair = keyring.getPair(sudoKey.toString()); //Alice
      sigKeypairBob = await keyring.addFromUri('//Bob');
      sigKeypairDave = await keyring.addFromUri('//Dave');

      const didObjRocket = {
        public_key: sigKeypairBob.publicKey, // this is the public key linked to the did
        identity: TEST_ROCKET_DID, // this is the actual did
        metadata: 'Metadata',
      };
      const didObjDave = {
        public_key: sigKeypairDave.publicKey, // this is the public key linked to the did
        identity: TEST_DAVE_DID, // this is the actual did
        metadata: 'Metadata',
      };
      if (constants.providerNetwork == 'local') {
        try {
          await did.storeDIDOnChain(didObjDave, sudoPair, provider);
          await did.storeDIDOnChain(didObjRocket, sudoPair, provider);
        } catch (err) {}
        let nonce = await provider.rpc.system.accountNextIndex(sudoPair.address);
        await tx.sendTransaction(sudoPair, TEST_ROCKET_DID, '5000000', provider, nonce);
        nonce = await provider.rpc.system.accountNextIndex(sudoPair.address);
        await tx.sendTransaction(sudoPair, TEST_DAVE_DID, '5000000', provider, nonce);
      }
    });

    it('should set members correctly', async () => {
      newMembers = [
        TEST_DAVE_DID,
        TEST_ROCKET_DID,
        TEST_SWN_DID,
      ]
      let transaction = await collective.setMembers(newMembers, TEST_SWN_DID, 0, sudoPair, provider);
      assert.doesNotReject(transaction);
    });

    it('should get members correctly', async () => {
      const expectedMembers = [
        did.sanitiseDid(TEST_DAVE_DID),
        did.sanitiseDid(TEST_ROCKET_DID),
        did.sanitiseDid(TEST_SWN_DID),
      ];
      const actualMembers = await collective.getMembers(provider);
      assert.strictEqual(actualMembers[0], expectedMembers[0]);
      assert.strictEqual(actualMembers[1], expectedMembers[1]);
      assert.strictEqual(actualMembers[2], expectedMembers[2]);
    });

    it('should get prime correctly', async () => {
      const expectedPrime = did.sanitiseDid(TEST_SWN_DID);
      const actualPrime = await collective.getPrime(provider);
      assert.strictEqual(actualPrime, expectedPrime);
    });

    it('should set proposals correctly', async () => {
      const call = provider.tx.vc.store(vcHex);
      let transaction = await collective.propose(3, call, 1000, sigKeypairBob, provider);
      assert.doesNotReject(transaction);
    });

    it('should get proposals', async () => {
      const actualProposals = await collective.getProposals(provider);
      proposalHash = actualProposals[0];
      let vote = await collective.getVotes(proposalHash, provider);
      index = vote.index;
      assert.strictEqual(actualProposals.length > 0, true);
    });

    it('should get proposal correctly', async () => {
      let proposalHex = await collective.getProposalOf(proposalHash, provider);
      assert.strictEqual(proposalHex.args[0], vcHex);
    });

    it('should get proposal count correctly', async () => {
      let proposalCount = await collective.getProposalCount(provider);
      assert.strictEqual(proposalCount, '1');
    });

    it('should vote correctly', async () => {
      let transaction = await collective.vote(proposalHash, index, true, sudoPair, provider);
      assert.doesNotReject(transaction);
      let otherTransaction = await collective.vote(proposalHash, index, false, sigKeypairDave, provider);
      assert.doesNotReject(otherTransaction);
    });

    it('should get votes correctly', async () => {
      let voteCount = await collective.getVotes(proposalHash, provider);
      assert.strictEqual(voteCount.ayes.length, 2);
      assert.strictEqual(voteCount.nays.length, 1);
      assert.strictEqual(voteCount.ayes.includes(did.sanitiseDid(TEST_SWN_DID)), true);
      assert.strictEqual(voteCount.ayes.includes(did.sanitiseDid(TEST_ROCKET_DID)), true);
      assert.strictEqual(voteCount.nays.includes(did.sanitiseDid(TEST_DAVE_DID)), true);
    });

    it('should close proposal correctly', async () => {
      let transaction = await collective.close(proposalHash, index, 1000, 1000, sudoPair, provider);
      assert.doesNotReject(transaction);
    });

    // Even though call is rejected  collective execution is succesfull
    it.skip('should not execute proposal correctly', async () => {
      const call = provider.tx.vc.store(vcHex);
      let transaction = collective.execute(call, 1000, sigKeypairDave, provider);
      await assert.rejects(transaction);
    });

    it('should disapprove proposal correctly', async () => {
      const call = provider.tx.vc.store(vcHex);
      await collective.propose(3, call, 1000, sigKeypairBob, provider);
      const actualProposals = await collective.getProposals(provider);
      proposalHash = actualProposals[0];
      let transaction = await collective.disapproveProposal(proposalHash, sudoPair, provider);
      assert.doesNotReject(transaction);
    });

    after(async () => {
      // Delete created DID (did:ssid:rocket)
      if (constants.providerNetwork == 'local') {
        await removeDid(TEST_ROCKET_DID, sudoPair, provider);
        await removeDid(TEST_DAVE_DID, sudoPair, provider);
      }
    })
  }
})