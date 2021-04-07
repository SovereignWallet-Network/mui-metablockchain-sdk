const { buildConnection } = require('./connection.js');
const { resolveDIDToAccount } = require('./did.js');

/**
 * The function will perform a metamui transfer operation from the account of senderAccount to the
 * receiverDID.
 * Note : balanceCheck has not been included in the checks since sender not having balance
 * is handled in extrinsic, check test/transaction.js
 * @param {KeyringObj} senderAccountKeyPair
 * @param {String} receiverDID
 * @param {String} amount
 * @param {APIPromise} api (optional)
 * @returns {Uint8Array}
 */
async function sendTransaction(
  senderAccountKeyPair,
  receiverDID,
  amount,
  api = false,
) {
  const provider = api || (await buildConnection('local'));
  // check if the recipent DID is valid
  const receiverAccountID = await resolveDIDToAccount(receiverDID, provider);
  if (!receiverAccountID) {
    throw new Error('balances.RecipentDIDNotRegistered');
  }
  return provider.tx.balances.transfer(receiverAccountID, amount).signAndSend(senderAccountKeyPair);
}

module.exports = {
  sendTransaction,
};
