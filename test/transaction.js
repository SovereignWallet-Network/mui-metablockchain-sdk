const assert = require('assert');
const { expect } = require('chai');
const tx = require('../src/transaction.js');
const did = require('../src/did.js');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');
const { removeDid } = require('./helper/helper.js');

describe('Transaction works correctly', () => {
  let sigKeypairWithBal = null;
  let sigKeypairWithoutBal = null;
  let provider;
  before(async () => {
    provider = await buildConnection(constants.providerNetwork);
    const keyring = await initKeyring();
    sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);
    sigKeypairWithoutBal = await keyring.addFromUri('//Test123');
    if (constants.providerNetwork == 'local') {
      let sigKeypairEve = await keyring.addFromUri('//Eve');
      const didObj = {
        public_key: sigKeypairEve.publicKey, // this is the public key linked to the did
        identity: 'did:ssid:metamui', // this is the actual did
        metadata: 'Metadata',
      };
      let sigKeypairDave = await keyring.addFromUri('//Dave');
      const didObjDave = {
        public_key: sigKeypairDave.publicKey, // this is the public key linked to the did
        identity: 'did:ssid:testing_mui', // this is the actual did
        metadata: 'Metadata',
      };
      try {
        await did.storeDIDOnChain(didObjDave, sigKeypairWithBal, provider);
      } catch(err) {
        console.log(err);
      }
      try {
        await did.storeDIDOnChain(didObj, sigKeypairWithBal, provider);
      } catch(err) {
        console.log(err);
      }
    }
    const transfer = await tx.sendTransaction(sigKeypairWithBal, 'did:ssid:metamui', '1', provider);
    assert.doesNotReject(transfer);
  });

  it('Transaction works correctly with nonce', async () => {
    const provider = await buildConnection(constants.providerNetwork);
    const nonce = await provider.rpc.system.accountNextIndex(sigKeypairWithBal.address);
    const transfer = await tx.sendTransaction(sigKeypairWithBal, 'did:ssid:metamui', '1', provider, nonce);
    assert.doesNotReject(transfer);
  });

  it('Transaction throws error for unregistered DID', async () => {
    const provider = await buildConnection(constants.providerNetwork);
    const nonce = await provider.rpc.system.accountNextIndex(sigKeypairWithBal.address);
    const transfer = tx.sendTransaction(sigKeypairWithBal, 'did:ssid:nonexistentdid', '1', provider, nonce);
    await assert.rejects(transfer, err => {
      assert.strictEqual(err.message, 'balances.RecipentDIDNotRegistered');
      return true;
    });
  });

  it('Transaction fails when sender has no balance', async () => {
    const provider = await buildConnection(constants.providerNetwork);
    await tx.sendTransaction(sigKeypairWithoutBal, 'did:ssid:testing_mui', '1', provider)
      .catch((err) => expect(err.toString()).to.contains('balances.InsufficientBalance'));
  });

  it('Transaction fails when recipent has no DID', async () => {
    const provider = await buildConnection(constants.providerNetwork);
    await tx.sendTransaction(sigKeypairWithBal, 'Bob123', '1', provider)
      .catch((err) => expect(err.toString()).to.contains('balances.RecipentDIDNotRegistered'));
  });

  it('Transaction with Memo works correctly with nonce', async () => {
    const provider = await buildConnection(constants.providerNetwork);
    const nonce = await provider.rpc.system.accountNextIndex(sigKeypairWithBal.address);
    const transfer = await tx.transfer(sigKeypairWithBal, 'did:ssid:metamui', '1', 'Memo Test', provider, nonce);
    assert.doesNotReject(transfer);
  });

  it('Transaction with Memo throws error for unregistered DID', async () => {
    const provider = await buildConnection(constants.providerNetwork);
    const nonce = await provider.rpc.system.accountNextIndex(sigKeypairWithBal.address);
    const transfer = tx.transfer(sigKeypairWithBal, 'did:ssid:nonexistentdid', '1', 'Memo Test', provider, nonce);
    await assert.rejects(transfer, err => {
      assert.strictEqual(err.message, 'balances.RecipentDIDNotRegistered');
      return true;
    });
  });

  after(async () => {
    // Delete created DIDs
    if (constants.providerNetwork == 'local') {
      await removeDid('did:ssid:metamui', sigKeypairWithBal, provider);
      await removeDid('did:ssid:testing_mui', sigKeypairWithBal, provider);
    }
  })
  
  return true;
});
