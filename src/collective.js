const did = require('../src/did');
const { buildConnection } = require('./connection.js');
const logger = require('./logger');

/**
 * Set Members and prime of collective pallet
 * @param  {Array<String>} newMembers Array of Did
 * @param  {String} prime Did of Prime
 * @param  {Number} oldCount Old members count
 * @param  {KeyPair} signingKeypair Key pair of Sender
 * @returns {String} Hash
 */
async function setMembers(newMembers, prime, oldCount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      newMembers = newMembers.map(newMember => did.sanitiseDid(newMember));
      prime = prime ? did.sanitiseDid(prime): null;
      const tx = provider.tx.sudo.sudo(
        provider.tx.council.setMembers(newMembers, prime, oldCount)
      );
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
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
          logger.debug('Transaction send to provider: '+ signedTx.hash.toHex());
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      logger.error(err);
      return false;
    }
  });
}


/**
 * To create a proposal
 * @param  {Number} threshold Threshold to successfull execution
 * @param  {Call} proposal Call to propose
 * @param  {Number} lengthCount Length of call
 * @param  {KeyPair} signingKeypair Key pair of sender
 */
async function propose(threshold, proposal, lengthCount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.propose(threshold, proposal, lengthCount);
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
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
          logger.debug('Transaction send to provider: '+ signedTx.hash.toHex());
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      logger.error(err);
      return false;
    }
  });
}

/**
 * To Execute a call
 * @param  {Call} proposal Call to propose
 * @param  {Number} lengthCount Length of Call
 * @param  {KeyPair} signingKeypair Key pair of sender
 */
 async function execute(proposal, lengthCount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.execute(proposal, lengthCount);
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
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
          logger.debug('Transaction send to provider: '+ signedTx.hash.toHex());
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      logger.error(err);
      return false;
    }
  });
}

/**
 * Vote on a proposal
 * @param  {String} proposalHash Hash of proposal
 * @param  {Number} index Proposal index
 * @param  {Boolean} approve True/false
 * @param  {KeyPair} signingKeypair Key pair of sender
 */
 async function vote(proposalHash, index, approve, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.vote(proposalHash, index, approve);
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
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
          logger.debug('Transaction send to provider: '+ signedTx.hash.toHex());
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      logger.error(err);
      return false;
    }
  });
}

/**
 * Close a proposal manually, executes call if yes votes is greater than or equal to threshold
 * @param  {String} proposalHash Hash
 * @param  {Number} index Proposal index
 * @param  {Boolean} proposalWeightBond Weight
 * @param  {Number} lengthCount Length
 * @param  {KeyPair} signingKeypair Key pair of sender
 */
 async function close(proposalHash, index, proposalWeightBond, lengthCount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.close(proposalHash, index, proposalWeightBond, lengthCount);
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
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
          logger.debug('Transaction send to provider: '+ signedTx.hash.toHex());
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      logger.error(err);
      return false;
    }
  });
}

/**
 * Disapprove proposal
 * @param  {String} proposalHash Hash
 * @param  {KeyPair} signingKeypair Key pair of sender
 */
 async function disapproveProposal(proposalHash, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.sudo.sudo(
        provider.tx.council.disapproveProposal(proposalHash)
      );
      let nonce = await provider.rpc.system.accountNextIndex(signingKeypair.address);
      let signedTx = tx.sign(signingKeypair, {nonce});
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
          logger.debug('Transaction send to provider: '+ signedTx.hash.toHex());
          resolve(signedTx.hash.toHex());
        }
      });
    } catch (err) {
      logger.error(err);
      return false;
    }
  });
}
/**
 * Get Members of Council
 * @param  {Boolean} api Network Provider
 */
async function getMembers(api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.members()).toHuman();
}
/**
 * Get Members of Council
 * @param  {Boolean} api Network Provider
 */
async function getPrime(api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.prime()).toHuman();
}
/**
 * Get All Proposals
 * @param  {Boolean} api Network Provider
 */
async function getProposals(api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.proposals()).toHuman();
}
/**
 * Get Proposal of given hash
 * @param {Hash} proposalHash Hash of proposal
 * @param  {Boolean} api Network Provider
 */
async function getProposalOf(proposalHash, api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.proposalOf(proposalHash)).toHuman();
}
/**
 * Get Votes of given proposal hash
 * @param {Hash} proposalHash Hash of proposal
 * @param  {Boolean} api Network Provider
 */
async function getVotes(proposalHash, api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.voting(proposalHash)).toHuman();
}
/**
 * Get Total proposals count
 * @param  {Boolean} api Network Provider
 */
async function getProposalCount(api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.proposalCount()).toHuman();
}

module.exports = {
  setMembers,
  propose,
  execute,
  vote,
  close,
  disapproveProposal,
  getMembers,
  getPrime,
  getProposals,
  getProposalOf,
  getVotes,
  getProposalCount,
}