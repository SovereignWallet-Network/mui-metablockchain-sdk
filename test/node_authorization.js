const assert = require('assert');
const nodeAuth = require('../src/node_authorization.js');
const constants = require('./test_constants');
const { initKeyring } = require('../src/config');
const { buildConnection } = require('../src/connection.js');
const tx = require('../src/transaction.js');
const did = require('../src/did');
const balance = require('../src/balance.js')
const { removeDid } = require('./helper/helper');

describe('Node Authorization Module works correctly', () => {
  let provider = null;
  let sigKeypairRoot = null;
  let keyring = null;
  let bobDid = 'did:ssid:bob';
  let treasuryDid = 'did:ssid:treasury';

  before(async () => {
    keyring = await initKeyring();
    provider = await buildConnection(constants.providerNetwork);
    sigKeypairRoot = await keyring.addFromUri(constants.mnemonicWithBalance);
    if (constants.providerNetwork == 'local') {
      sigKeypairBob = await keyring.addFromUri('//Bob');
      const didObj = {
        public_key: sigKeypairBob.publicKey, // this is the public key linked to the did
        identity: bobDid, // this is the actual did
        metadata: 'Metadata',
      };
      try {
        await did.storeDIDOnChain(didObj, sigKeypairRoot, provider);
      } catch (err) { }
      await tx.sendTransaction(sigKeypairRoot, bobDid, '2000000000', provider);    
    }
  });

  if (constants.providerNetwork == 'local') {
    it('Slash validator works correctly', async () => {
      let amount = 1000; 
      await nodeAuth.slashValidator(bobDid, amount, sigKeypairRoot, provider);
      const balanceAmount = await balance.getBalance(treasuryDid, provider);
      assert.strictEqual(Math.floor(balanceAmount) >= amount, true);
    });
  }

  after(async () => {
    if (constants.providerNetwork == 'local') {
      await removeDid(bobDid, sigKeypairRoot, provider);
    }
  })
});
