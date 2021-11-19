/**
 * Token pallet util functions. These functions will enable currency issuance and transfer
 * Every currency is identified by its currency_id. Each currency also has a human friendly
 * name, but the currency_id is what should be used during transactions.
 * @notice Token pallet not released to mainnet.
 * So uncomment in index after the release.
 */
const { resolveDIDToAccount } = require('./did');
const { buildConnection } = require('./connection.js');
const { sanitiseDid } = require('./did');

/**
 * Issue new token from given vc Id. Amount is in lowest form here 
 * but everywhere else it's in highest form
 * @param {String} vcId
 * @param {String} totalIssuanceAmt Amount is in lowest form
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
async function issueToken(
  vcId,
  totalIssuanceAmt,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const tx = provider.tx.tokens.issueToken(
        vcId,
        totalIssuanceAmt,
      );
      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Transfer token with given token_id to the recipent_did
 * @param {String} recipentDid
 * @param {String} currencyId
 * @param {String} tokenAmount In Highest Form
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function transferToken(
  recipentDid,
  currencyId,
  tokenAmount,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      // check if the recipent DID is valid
      const receiverAccountID = await resolveDIDToAccount(recipentDid, provider);
      if (!receiverAccountID) {
        throw new Error('tokens.RecipentDIDNotRegistered');
      }
      const tokenData = await getTokenData(currencyId, provider);
      tokenAmount = tokenAmount * (Math.pow(10,tokenData.decimal));
      const tx = provider.tx.tokens.transfer(receiverAccountID, currencyId, tokenAmount);
      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Transfer all token with given vc_id to the recipent_did
 * @param {String} recipentDid
 * @param {String} currencyId
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function transferAll(
  recipentDid,
  currencyId,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      // check if the recipent DID is valid
      const receiverAccountID = await resolveDIDToAccount(recipentDid, provider);
      if (!receiverAccountID) {
        throw new Error('tokens.RecipentDIDNotRegistered');
      }
      const tx = provider.tx.tokens.transferAll(receiverAccountID, currencyId);
      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Slash token from given currency
 * @param {String} vcId
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function slashToken(
  vcId,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const tx = provider.tx.tokens.slashToken(vcId);
      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Mint token to given currency
 * @param {String} vcId
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
async function mintToken(
  vcId,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const tx = provider.tx.tokens.mintToken(vcId);
      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Get the token balance for a given token for given did
 * @param {String} did
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {String} Balance In Highest Form
 */
async function getTokenBalance(did, currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(did);
  const tokenData = await getTokenData(currencyId, provider);
  const data = (await provider.query.tokens.accounts(did_hex, currencyId))
                  .toJSON().data.free/(Math.pow(10,tokenData.decimal));
  return data;
}

/**
 * Get the detailed token balance for a given token for given did
 * @param {String} did
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {Object} In Highest Form
 */
 async function getDetailedTokenBalance(did, currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(did);
  const tokenData = await getTokenData(currencyId, provider);
  const data = (await provider.query.tokens.accounts(did_hex, currencyId)).toJSON().data;
  return {
    frozen: data.frozen/(Math.pow(10,tokenData.decimal)),
    free: data.free/(Math.pow(10,tokenData.decimal)),
    reserved: data.reserved/(Math.pow(10,tokenData.decimal)),
  };
}

/**
 * Get the human friendly name of token from token id
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {tokenData} {token_name: String, currency_code: String, decimal: String}
 */
async function getTokenNameFromCurrencyId(currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.tokens.tokenData(currencyId)).toHuman();
  return data;
}

/**
 * Get the list of all active tokens in metablockchain network
 * @param {ApiPromise} api
 * @returns {Array} [ { id: '1', name: 'XYZ' }, { id: '2', name: 'ABC' } ]
 */
async function getTokenList(api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenData.entries();
  return data.map(([{ args: [CurrencyId] }, value]) => ({
    id: CurrencyId.toHuman(),
    name: value.toHuman().token_name,
    currencyCode: value.toHuman().currency_code,
    decimal: value.toHuman().decimal,
  }));
}

/**
 * Get the token by currency id in metablockchain network
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {Object}
 */
 async function getTokenData(currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenData(currencyId);
  return data.toHuman();
}

/**
 * Get the total issuance amount for given currency id
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {String} TotalSupply In Highest Form
 */
async function getTokenTotalSupply(currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const tokenData = await getTokenData(currencyId, provider);
  const data = await provider.query.tokens.totalIssuance(currencyId);
  return data.toJSON()/(Math.pow(10,tokenData.decimal));
}

/**
 * Get the lock for given currency id
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {Object} 
 */
 async function getLocks(did, currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const accountId = await resolveDIDToAccount(did, provider);
  if (!accountId) {
    throw new Error('tokens.RecipentDIDNotRegistered');
  }
  const data = await provider.query.tokens.locks(accountId, currencyId);
  return data.toHuman();
}

/**
 * Get the total issuance amount for given currency id
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {String}
 */
 async function getTokenIssuer(currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenIssuer(currencyId);
  return data.toHuman();
}

/**
 * Function to withdraw the treasury reserve amount locked at the time of
 * token creation. Only a validator can call this operation succesfully.
 * @param {String} destination (DID)
 * @param {String} from (DID)
 * @param {String} amount (MUI amount)
 * @param {KeyPair} senderAccountKeyPair
 * @param {ApiPromise} api
 * @returns {String} transaction_hex_id
 */
async function withdrawTreasuryReserve(
  destination,
  from,
  amount,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const fromAccountId = await resolveDIDToAccount(from, provider);
      if (!fromAccountId) {
        throw new Error('tokens.RecipentDIDNotRegistered');
      }
      const toAccountId = await resolveDIDToAccount(destination, provider);
      if (!toAccountId) {
        throw new Error('tokens.RecipentDIDNotRegistered');
      }
      const tx = provider.tx.tokens.withdrawReserved(toAccountId, fromAccountId, amount);
      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

/**
 * Transfer token of given currency to given Did from Currency owner account
 * @param {String} vcId
 * @param {String} receiverDID
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function transferTokenWithVC(
  vcId,
  receiverDID,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      // check if the recipent DID is valid
      const receiverAccountID = await resolveDIDToAccount(receiverDID, provider);
      if (!receiverAccountID) {
        throw new Error('tokens.RecipentDIDNotRegistered');
      }
      const tx = provider.tx.tokens.transferToken(vcId, receiverAccountID);
      let nonce = await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            // console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            // console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          // console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(signedTx.hash.toHex())
        }
      });
    } catch (err) {
      // console.log(err);
      reject(err);
    }
  });
}

module.exports = {
  transferToken,
  transferAll,
  issueToken,
  slashToken,
  mintToken,
  getTokenBalance,
  getDetailedTokenBalance,
  getTokenNameFromCurrencyId,
  getLocks,
  getTokenIssuer,
  getTokenList,
  getTokenData,
  getTokenTotalSupply,
  withdrawTreasuryReserve,
  transferTokenWithVC,
};
