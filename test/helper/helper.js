const vc = require('../../src/vc.js');
const did = require('../../src/did.js');
const collective = require('../../src/collective.js');
const tx = require('../../src/transaction.js');

const TEST_DID = 'did:ssid:rocket';
const TEST_DAVE_DID = "did:ssid:dave";
const TEST_SWN_DID = "did:ssid:swn";

// To remove DID after testing
/**
 * @param  {String} didString
 * @param  {KeyPair} sigKeyPair
 * @param  {Api} provider
 */
async function removeDid(didString, sigKeyPair, provider) {
  try {
    const tx = provider.tx.did.remove(did.sanitiseDid(didString));
    await new Promise((resolve, reject) => tx.signAndSend(sigKeyPair, ({ status, dispatchError }) => {
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
/**
 * Store VC with council
 * @param  {Hex} vcHex
 * @param  {KeyPair} sigKeypairOwner
 * @param  {KeyPair} sigKeypairRoot
 * @param  {KeyPair} sigKeypairCouncil
 * @param  {Api} provider
 */
async function storeVC(vcHex, sigKeypairOwner, sigKeypairRoot, sigKeypairCouncil, provider) {
  try {
    const didObjDave = {
      public_key: sigKeypairCouncil.publicKey, // this is the public key linked to the did
      identity: TEST_DAVE_DID, // this is the actual did
      metadata: 'Metadata',
    };
    await did.storeDIDOnChain(didObjDave, sigKeypairRoot, provider);
  } catch (err) { }
  let nonce = await provider.rpc.system.accountNextIndex(sigKeypairRoot.address);
  await tx.sendTransaction(sigKeypairRoot, TEST_DAVE_DID, '5000000', provider, nonce);
  let newMembers = [
    TEST_DAVE_DID,
    TEST_DID,
    TEST_SWN_DID,
  ];
  await collective.setMembers(newMembers, TEST_SWN_DID, 0, sigKeypairRoot, provider);
  const call = provider.tx.vc.store(vcHex);
  await collective.propose(3, call, 1000, sigKeypairOwner, provider);
  const actualProposals = await collective.getProposals(provider);
  proposalHash = actualProposals[0];
  let vote = await collective.getVotes(proposalHash, provider);
  index = vote.index;
  await collective.vote(proposalHash, index, true, sigKeypairRoot, provider);
  await collective.vote(proposalHash, index, true, sigKeypairCouncil, provider);
  await collective.close(proposalHash, index, 1000, 1000, sigKeypairRoot, provider);
}
/**
 * Store VC without council
 * @param  {Hex} vcId
 * @param  {Number} currencyId
 * @param  {Number} amount
 * @param  {VCType} vcType TokenVc, MintTokens, SlashTokens
 * @param  {KeyPair} sigKeypairOwner
 * @param  {KeyPair} sigKeypairRoot
 * @param  {KeyPair} sigKeypairCouncil
 * @param  {Api} provider
 */
async function storeVCDirectly(vcId, currencyId, amount, vcType, sigKeypairOwner, provider) {
  let vcProperty = {
    vcId,
    currencyId,
    amount,
  };
  let owner = TEST_DAVE_DID;
  let issuers = [
    TEST_DAVE_DID,
  ];
  let vcHex = await vc.createVC(vcProperty, owner, issuers, vcType, sigKeypairOwner);
  await vc.storeVC(vcHex, sigKeypairOwner, provider)
}

module.exports = {
  removeDid,
  storeVC,
  storeVCDirectly,
}