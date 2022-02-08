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
// 8 bytes for currency_code
const CURRENCY_CODE_LENGTH = 16;
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
 * @param {String} currencyCode
 * @param {String} tokenAmount In Highest Form
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function transferToken(
  recipentDid,
  currencyCode,
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
      const ccode = sanitiseCCode(currencyCode);
      tokenAmount = await getFormattedTokenAmount(ccode, tokenAmount, provider);
      const tx = provider.tx.tokens.transfer(receiverAccountID, ccode, tokenAmount);
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
 * @param {String} currencyCode
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function transferAll(
  recipentDid,
  currencyCode,
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
      const tx = provider.tx.tokens.transferAll(receiverAccountID, sanitiseCCode(currencyCode));
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
 * @param {String} currencyCode
 * @param {ApiPromise} api
 * @returns {String} Balance In Highest Form
 */
async function getTokenBalance(did, currencyCode, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(did);
  const ccode = sanitiseCCode(currencyCode);
  const tokenData = await getTokenData(ccode, provider);
  const data = (await provider.query.tokens.accounts(did_hex, ccode))
                  .toJSON().data.free/(Math.pow(10,tokenData.decimal));
  return data;
}

/**
 * Get the detailed token balance for a given token for given did
 * @param {String} did
 * @param {String} currencyCode
 * @param {ApiPromise} api
 * @returns {Object} In Highest Form
 */
 async function getDetailedTokenBalance(did, currencyCode, api = false) {
  const provider = api || (await buildConnection('local'));
  const did_hex = sanitiseDid(did);
  const ccode = sanitiseCCode(currencyCode);
  const tokenData = await getTokenData(ccode, provider);
  const data = (await provider.query.tokens.accounts(did_hex, ccode)).toJSON().data;
  return {
    frozen: data.frozen/(Math.pow(10,tokenData.decimal)),
    free: data.free/(Math.pow(10,tokenData.decimal)),
    reserved: data.reserved/(Math.pow(10,tokenData.decimal)),
  };
}

/**
 * Get the list of all active tokens in metablockchain network
 * @param {ApiPromise} api
 * @returns {Array} [ { id: '1', name: 'XYZ' }, { id: '2', name: 'ABC' } ]
 */
async function getTokenList(api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenData.entries();
  return data.map(([{ args: [currency_code] }, value]) => ({
    name: value.toHuman().token_name,
    currencyCode: value.toHuman().currency_code,
    decimal: value.toHuman().decimal,
    blockNumber: value.toHuman().block_number,
  }));
}

/**
 * Get the token by currency id in metablockchain network
 * @param {String} currencyCode
 * @param {ApiPromise} api
 * @returns {Object}
 */
 async function getTokenData(currencyCode, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenData(sanitiseCCode(currencyCode));
  if(!data) {
    throw new Error("Token Data does not exist");
  }
  return data.toHuman();
}

/**
 * Get the total issuance amount for given currency id
 * @param {String} currencyCode
 * @param {ApiPromise} api
 * @returns {String} TotalSupply In Highest Form
 */
async function getTokenTotalSupply(currencyCode, api = false) {
  const provider = api || (await buildConnection('local'));
  const tokenData = await getTokenData(sanitiseCCode(currencyCode), provider);
  const data = await provider.query.tokens.totalIssuance(sanitiseCCode(currencyCode));
  return data.toJSON()/(Math.pow(10,tokenData.decimal));
}

/**
 * Get the lock for given currency id
 * @param {String} currencyCode
 * @param {ApiPromise} api
 * @returns {Object} 
 */
 async function getLocks(did, currencyCode, api = false) {
  const provider = api || (await buildConnection('local'));
  const accountId = await resolveDIDToAccount(did, provider);
  if (!accountId) {
    throw new Error('tokens.RecipentDIDNotRegistered');
  }
  const data = await provider.query.tokens.locks(accountId, sanitiseCCode(currencyCode));
  return data.toHuman();
}

/**
 * Get the issuer for given token code
 * @param {String} currencyCode
 * @param {ApiPromise} api
 * @returns {String}
 */
 async function getTokenIssuer(currencyCode, api = false) {
  const provider = api || (await buildConnection('local'));
  const data = await provider.query.tokens.tokenIssuer(sanitiseCCode(currencyCode));
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

/**
 * Set balance of did with given token_id
 * Can be called only token owner
 * @param {String} dest
 * @param {String} currencyCode
 * @param {String} amount In Highest Form
 * @param {KeyPair} senderAccountKeyPair
 * @param {APIPromise} api
 * @returns {hexString}
 */
 async function setBalance(
  dest,
  currencyCode,
  amount,
  senderAccountKeyPair,
  api = false,
  nonce
) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || (await buildConnection('local'));
      const ccode = sanitiseCCode(currencyCode);
      const tokenData = await getTokenData(ccode, provider);
      amount = amount * (Math.pow(10,tokenData.decimal));
      if (amount < 1) {
        throw new Error(`Invalid token amount, max supported decimal for this token is ${tokenData.decimal}`);
      }
      const tx = provider.tx.tokens.setBalance(
        sanitiseDid(dest),
        ccode,
        amount,
      );
      nonce = nonce || await provider.rpc.system.accountNextIndex(senderAccountKeyPair.address);
      let signedTx = tx.sign(senderAccountKeyPair, {nonce});
      await signedTx.send(function ({ status, dispatchError }) {
        console.log('Transaction status:', status.type);
        if (dispatchError) {
          if (dispatchError.isModule) {
            // for module errors, we have the section indexed, lookup
            const decoded = api.registry.findMetaError(dispatchError.asModule);
            const { documentation, name, section } = decoded;
            reject(new Error(`${section}.${name}`));
          } else {
            // Other, CannotLookup, BadOrigin, no extra info
            reject(new Error(dispatchError.toString()));
          }
        } else if (status.isFinalized) {
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
 * Checks if the given currency_code is in hex format or not & converts it into valid hex format.
 * 
 *  Note: This util function is needed since dependant module wont convert the utf did to hex anymore
 * 
 * @param {String} currency_code
 * @return {String} Hex currency_code
 */
 const sanitiseCCode = (code) => {
  
  if (code.startsWith('0x')) {
    // already hex string
    return code.padEnd(CURRENCY_CODE_LENGTH, '0');
  }
  // console.log('Converting to hex');
  let hex_code = Buffer.from(code, 'utf8').toString('hex');
  hex_code = '0x'+ hex_code.padEnd(CURRENCY_CODE_LENGTH, '0');
  return hex_code;
}

/**
 * Formats the given amount into lowest form based on the decimals supported by given token.
 * 
 * @param {String} currency_code in the sanitised form
 * @param {String} tokenAmount in the highest form
 * @param {APIPromise} provider
 * @return {Number} tokenAmount in lowest form else error
 */
async function getFormattedTokenAmount(currencyCode, tokenAmount, provider) {
  let amount_decimals = 0;
  tokenAmount = String(tokenAmount);
  // Check if valid number or not
  if (isNaN(tokenAmount)) {
    throw new Error(`Invalid token amount!`);
  }
  if (tokenAmount.includes('.')) {
    amount_decimals = tokenAmount.split('.')[1].length;
  };
  const tokenData = await getTokenData(currencyCode, provider);
  if (amount_decimals > tokenData.decimal) {
    throw new Error(`Invalid token amount, max supported decimal by ${tokenData.currency_code} is ${tokenData.decimal}`);
  }
  tokenAmount = Math.round(parseFloat(tokenAmount) * (Math.pow(10,tokenData.decimal)));
  return tokenAmount;
}

module.exports = {
  transferToken,
  transferAll,
  issueToken,
  slashToken,
  mintToken,
  getTokenBalance,
  getDetailedTokenBalance,
  getLocks,
  getTokenIssuer,
  getTokenList,
  getTokenData,
  getTokenTotalSupply,
  withdrawTreasuryReserve,
  transferTokenWithVC,
  setBalance,
  sanitiseCCode,
  getFormattedTokenAmount,
};
