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
    const keyring = await initKeyring();
    sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);
    sigKeypairWithoutBal = await keyring.addFromUri('//Test123');
  });

  // it('Transaction works correctly', async () => {
  //   const provider = await buildConnection('dev');
  //   const transfer = await tx.sendTransaction(sigKeypairWithBal, 'did:ssid:stanly', '1', provider);
  //   assert.doesNotReject(transfer);
  // });

  it('Transaction fails when sender has no balance', async () => {
    const provider = await buildConnection('dev');
    await tx.sendTransaction(sigKeypairWithoutBal, 'did:ssid:stanly', '1', provider).catch((err) => expect(err.toString()).to.contains('balances.InsufficentBalance'));
  });

  it('Transaction fails when recipent has no DID', async () => {
    const provider = await buildConnection('dev');
    await tx.sendTransaction(sigKeypairWithBal, 'Bob123', '1', provider).catch((err) => expect(err.toString()).to.contains('balances.RecipentDIDNotRegistered'));
  });
  return true;
});
