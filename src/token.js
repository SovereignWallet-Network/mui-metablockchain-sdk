/**
 * Token pallet util functions. These functions will enable currency issuance and transfer
 * Every currency is identified by its currency_id. Each currency also has a human friendly
 * name, but the currency_id is what should be used during transactions.
 * @notice Token pallet not released to mainnet.
 * So uncomment in index after the release.
 */
const { resolveDIDToAccount } = require('./did');
const { buildConnection } = require('./connection.js');

/**
 * Transfer token with given token_id to the recipent_did
 * @param {String} recipentDid
 * @param {String} tokenId
 * @param {String} tokenAmount
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
async function transferToken(
  recipentDid,
  tokenId,
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
        throw new Error('balances.RecipentDIDNotRegistered');
      }
      const tx = provider.tx.tokens.transfer(receiverAccountID, tokenId, tokenAmount);
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(`${section}.${name}`);
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(dispatchError.toString());
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
 *
 * @param {String} recipentDid
 * @param {String} tokenId
 * @param {String} tokenName
 * @param {String} totalIssuanceAmt
 * @param {KeyringObj} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
async function issueNewToken(
  recipentDid,
  tokenId,
  tokenName,
  totalIssuanceAmt,
  senderAccountKeyPair,
  api = false,
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      // check if the recipent DID is valid
      const receiverAccountID = await resolveDIDToAccount(recipentDid, provider);
      if (!receiverAccountID) {
        throw new Error('balances.RecipentDIDNotRegistered');
      }
      const tx = provider.tx.tokens.issueToken(
        receiverAccountID,
        tokenId,
        tokenName,
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
            reject(`${section}.${name}`);
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(dispatchError.toString());
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
 * @param {String} tokenId
 * @param {ApiPromise} api
 * @returns {String}
 */
async function getTokenBalance(did, tokenId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.tokens.accounts(did, tokenId)).toHuman().free;
  return data;
}

/**
 * Get the human friendly name of token from token id
 * @param {String} tokenId
 * @param {ApiPromise} api
 * @returns {String}
 */
async function getTokenNameFromTokenId(tokenId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = (await provider.query.tokens.tokenIdentifier(tokenId)).toHuman();
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
 * Get the total issuance amount for given token_id
 * @param {String} tokenId
 * @param {ApiPromise} api
 * @returns {String} totalSupply
 */
async function getTokenTotalSupply(tokenId, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.totalIssuance(tokenId);
  return data.toHuman();
}

/**
 * Function to withdraw the treasury reserve amount locked at the time of
 * token creation. Only a validator can call this operation succesfully.
 * @param {String} destination (ss58 addresss)
 * @param {String} from (ss58 address)
 * @param {String} amount (MUI amount)
 * @param {KeyringObj} senderAccountKeyPair
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
      const tx = provider.tx.tokens.withdrawReserved(destination, from, amount);
      await tx.signAndSend(senderAccountKeyPair, ({ status, dispatchError }) => {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            console.log(`${section}.${name}: ${documentation.join(' ')}`);
            reject(`${section}.${name}`);
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            console.log(dispatchError.toString());
            reject(dispatchError.toString());
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
  issueNewToken,
  getTokenBalance,
  getTokenNameFromTokenId,
  getTokenList,
  getTokenTotalSupply,
  withdrawTreasuryReserve,
};
