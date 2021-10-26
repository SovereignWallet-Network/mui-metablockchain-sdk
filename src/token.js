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
 * Issue new token from given vc Id
 * @param {String} vcId
 * @param {String} totalIssuanceAmt
 * @param {KeyringObj} senderAccountKeyPair
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
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Transfer token with given token_id to the recipent_did
 * @param {String} vcId
 * @param {String} recipentDid
 * @param {String} currencyId
 * @param {String} tokenAmount
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function transferToken(
  vcId,
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
      const tx = provider.tx.tokens.transfer(vcId, receiverAccountID, currencyId, tokenAmount);
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Transfer all token with given vc_id to the recipent_did
 * @param {String} vcId
 * @param {String} recipentDid
 * @param {String} currencyId
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function transferAll(
  vcId,
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
      const tx = provider.tx.tokens.transferAll(vcId, receiverAccountID, currencyId);
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Slash token from given currency
 * @param {String} vcId
 * @param {String} currencyId
 * @param {Number} tokenAmount
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function slashToken(
  vcId,
  currencyId,
  tokenAmount,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const tx = provider.tx.tokens.slashToken(vcId, currencyId, tokenAmount);
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Mint token to given currency
 * @param {String} vcId
 * @param {String} currencyId
 * @param {Number} tokenAmount
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
async function mintToken(
  vcId,
  currencyId,
  tokenAmount,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const tx = provider.tx.tokens.mintToken(vcId, currencyId, tokenAmount);
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

/**
 * Get the token balance for a given token for given did
 * @param {String} did
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {String}
 */
async function getTokenBalance(did, currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(did);
  const data = (await provider.query.tokens.accounts(did_hex, currencyId)).toHuman().free;
  return data;
}

/**
 * Get the human friendly name of token from token id
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {String}
 */
async function getTokenNameFromCurrencyId(currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.tokens.tokenIdentifier(currencyId)).toHuman();
  return data;
}

/**
 * Get the list of all active tokens in metablockchain network
 * @param {ApiPromise} api
 * @returns {Array} [ { id: '1', name: 'XYZ' }, { id: '2', name: 'ABC' } ]
 */
async function getTokenList(api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenIdentifier.entries();
  return data.map(([{ args: [CurrencyId] }, value]) => ({
    id: CurrencyId.toHuman(),
    name: value.toHuman(),
  }));
}

/**
 * Get the total issuance amount for given currency id
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {String} totalSupply
 */
async function getTokenTotalSupply(currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.totalIssuance(currencyId);
  return data.toHuman();
}

/**
 * Get the lock for given currency id
 * @param {String} currencyId
 * @param {ApiPromise} api
 * @returns {id: String, amount: Number} totalSupply
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
 * @returns {String} totalSupply
 */
 async function getTokenIssuer(currencyId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenIssuer(currencyId);
  return data.toHuman();
}

/**
 * Function to withdraw the treasury reserve amount locked at the time of
 * token creation. Only a validator can call this operation succesfully.
 * @param {String} vcId
 * @param {String} destination (DID)
 * @param {String} from (DID)
 * @param {String} amount (MUI amount)
 * @param {KeyringObj} senderAccountKeyPair
 * @param {ApiPromise} api
 * @returns {String} transaction_hex_id
 */
async function withdrawTreasuryReserve(
  vcId,
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
      const tx = provider.tx.tokens.withdrawReserved(vcId, toAccountId, fromAccountId, amount);
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
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
  getTokenNameFromCurrencyId,
  getLocks,
  getTokenIssuer,
  getTokenList,
  getTokenTotalSupply,
  withdrawTreasuryReserve,
};
