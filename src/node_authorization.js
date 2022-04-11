const { buildConnection } = require('./connection.js');
const did = require('./did');

/**
 * Store the generated DID object in blockchain
 * @param {String} identifier Did of the user
 * @param {Balance} amount Amount to be slashed (In Highest Form)
 * @param {ApiPromise} api
 * @returns {String} txnId Txnid for storage operation.
 */
 function slashValidator(identifier, amount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const amountLowest = amount * 1e6;
      const tx = provider.tx.sudo.sudo(
        provider.tx.nodeAuthorization.slashValidator(did.sanitiseDid(identifier), amountLowest)
      );

      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
      await signedTx.send(function ({ status, dispatchError }){
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { name, section } = decoded;
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  slashValidator,
}