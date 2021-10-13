const assert = require('assert');

const balance = require('../src/balance.js')
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const constants = require('./test_constants');

describe('Balances works correctly', () => {
  let provider = null;
  let sigKeypairWithBal = null;

  before(async () => {
    provider = await buildConnection(constants.providerNetwork);
    const keyring = await initKeyring();
    sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);
  });

  it('getBalance works correctly', async () => {
    const balanceAmount = await balance.getBalance('did:ssid:swn', provider);
    assert.strictEqual(Math.floor(balanceAmount) >= 0, true);
  });

  it('subscribeToBalanceChanges works correctly', (done) => {
    let isCallbackCalled = false;
    balance.subscribeToBalanceChanges('did:ssid:swn', (balanceAmount) => {
      if(isCallbackCalled) return;
      isCallbackCalled = true;
      assert.strictEqual(Math.floor(balanceAmount) >= 0, true);
      done();
    }, provider);
  });

})