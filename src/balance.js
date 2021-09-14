const { buildConnection } = require('./connection.js');
const { sanitiseDid } = require('./did.js');

/**
 * Get account balance based on the did supplied.
 * @param {string} did Identifier of the user
 * @param {ApiPromse} api
 * @returns {String}
 * @example await getBalanceFromDID(did, true)
 */
const getBalance = async (did, api = false) => {
  // Resolve the did to get account ID
  try {
    const provider = api || await buildConnection('local');
    const did_hex = sanitiseDid(did);
    const accountInfo = await provider.query.did.account(did_hex);
    const { data } = accountInfo.toJSON();
    return data.free / 1e6;
  } catch (err) {
    console.log(err);
    return null;
  }
};
/**
 * Listen to balance changes for a DID and execute the callback.
 * @param {String} identifier DID
 * @param {Function} callback Cb function to execute with new balance.
 * @param {ApiPromise} api Api object of polkadot
 */
const subscribeToBalanceChanges = async (identifier, callback, api = false) => {
  try {
    const provider = api || await buildConnection('local');
    const did_hex = sanitiseDid(identifier);
    return provider.query.did.account(did_hex, ({ data: { free: currentBalance } }) => {
      callback(currentBalance.toNumber() / 1e6);
    });
  } catch (err) {
    return null;
  }
};

module.exports = {
  getBalance,
  subscribeToBalanceChanges,
};
