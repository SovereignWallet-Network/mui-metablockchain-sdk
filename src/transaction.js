const { buildConnection } = require('./connection.js');
const { resolveDIDToAccount } = require('./did.js');
const logger = require('./logger');

/**
 * The function will perform a metamui transfer operation from the account of senderAccount to the
 * receiverDID.
 * Note : balanceCheck has not been included in the checks since sender not having balance
 * is handled in extrinsic, check test/transaction.js
 * @param {KeyPair} senderAccountKeyPair
 * @param {String} receiverDID
 * @param {String} amount In Lowest Form
 * @param {APIPromise} api (optional)
 * @param {int} nonce (optional)
 * @returns {Uint8Array}
 */
async function sendTransaction(
  senderAccountKeyPair,
  receiverDID,
  amount,
  api = false,
  nonce = -1,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      // check if the recipent DID is valid
      const receiverAccountID = await resolveDIDToAccount(receiverDID, provider);
      if (!receiverAccountID) {
        throw new Error('balances.RecipentDIDNotRegistered');
      }
      const tx = await provider.tx.balances
        .transfer(receiverAccountID, amount);
      const nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      const signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
          logger.info('Transaction status: '+ status.type);
          if (dispatchError) {
            if (dispatchError.isModule) {
              // for module errors, we have the section indexed, lookup
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              const { documentation, name, section } = decoded;
              logger.error(`${section}.${name}: ${documentation.join(' ')}`);
              reject(new Error(`${section}.${name}`));
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              logger.error(dispatchError.toString());
              reject(new Error(dispatchError.toString()));
            }
          } else if (status.isFinalized) {
            logger.debug('Finalized block hash: ' + status.asFinalized.toHex());
            resolve(signedTx.hash.toHex())
          }
        });
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
}

/**
 * This function is similar to sendTransaction except that it provides the user to add the memo to transfer functionality.
 * 
 * @param {KeyPair} senderAccountKeyPair
 * @param {String} receiverDID
 * @param {String} amount In Lowest Form
 * @param {String} memo
 * @param {APIPromise} api (optional)
 * @param {int} nonce (optional)
 * @returns {Uint8Array}
 */
async function transfer(
  senderAccountKeyPair,
  receiverDID,
  amount,
  memo,
  api = false,
  nonce = -1,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      // check if the recipent DID is valid
      const receiverAccountID = await resolveDIDToAccount(receiverDID, provider);
      if (!receiverAccountID) {
        throw new Error('balances.RecipentDIDNotRegistered');
      }
      const tx = provider.tx.balances
        .transferWithMemo(receiverAccountID, amount, memo);
      const nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      const signedTx = tx.sign(senderAccountKeyPair, {nonce});
      return signedTx.send(function ({ status, dispatchError }) {
          logger.info('Transaction status: '+ status.type);
          if (dispatchError) {
            if (dispatchError.isModule) {
              // for module errors, we have the section indexed, lookup
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              const { documentation, name, section } = decoded;
              logger.error(`${section}.${name}: ${documentation.join(' ')}`);
              reject(new Error(`${section}.${name}`));
            } else {
              // Other, CannotLookup, BadOrigin, no extra info
              logger.error(dispatchError.toString());
              reject(new Error(dispatchError.toString()));
            }
          } else if (status.isFinalized) {
            logger.debug('Finalized block hash: ' + status.asFinalized.toHex());
            resolve(signedTx.hash.toHex());
          }
        });
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
}

module.exports = {
  sendTransaction,
  transfer
};
