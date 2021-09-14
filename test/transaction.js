const assert = require('assert');
const { expect } = require('chai');
const tx = require('../src/transaction.js');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');

describe('Transaction works correctly', () => {
  let sigKeypairWithBal = null;
  let sigKeypairWithoutBal = null;
  before(async () => {
    const provider = await buildConnection('testnet');
    const keyring = await initKeyring();
    sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);
    sigKeypairWithoutBal = await keyring.addFromUri('//Test123');
    const transfer = await tx.sendTransaction(sigKeypairWithBal, 'did:ssid:metamui', '1', provider);
    assert.doesNotReject(transfer);
    // This is needed to perform the next test
    await sleep(5000);
  });

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

  it('Transaction works correctly with nonce', async () => {
    const provider = await buildConnection('testnet');
    const nonce = await provider.rpc.system.accountNextIndex(sigKeypairWithBal.address);
    const transfer = await tx.sendTransaction(sigKeypairWithBal, 'did:ssid:metamui', '1', provider, nonce);
    assert.doesNotReject(transfer);
  });

  it('Transaction fails when sender has no balance', async () => {
    const provider = await buildConnection('testnet');
    await tx.sendTransaction(sigKeypairWithoutBal, 'did:ssid:testing_mui', '1', provider).catch((err) => expect(err.toString()).to.contains('balances.InsufficentBalance'));
  });

  it('Transaction fails when recipent has no DID', async () => {
    const provider = await buildConnection('testnet');
    await tx.sendTransaction(sigKeypairWithBal, 'Bob123', '1', provider).catch((err) => expect(err.toString()).to.contains('balances.RecipentDIDNotRegistered'));
  });
  return true;
});
