const did = require('../src/did');
const { buildConnection } = require('./connection.js');

/**
 * @param  {String[]} newMembers Array of Did
 * @param  {String} prime
 * @param  {Number} oldCount
 * @param  {KeyPair} signingKeypair
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
      await tx.signAndSend(signingKeypair, ({ status, dispatchError }) => {
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
          console.log('Transaction send to provider', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  });
}


/**
 * @param  {Number} threshold
 * @param  {Call} proposal
 * @param  {Number} lengthCount
 * @param  {KeyPair} signingKeypair
 */
async function propose(threshold, proposal, lengthCount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.propose(threshold, proposal, lengthCount);
      await tx.signAndSend(signingKeypair, ({ status, dispatchError }) => {
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
          console.log('Transaction send to provider', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  });
}

/**
 * @param  {Call} proposal
 * @param  {Number} lengthCount
 * @param  {KeyPair} signingKeypair
 */
 async function execute(proposal, lengthCount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.execute(proposal, lengthCount);
      await tx.signAndSend(signingKeypair, ({ status, dispatchError }) => {
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
          console.log('Transaction send to provider', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  });
}

/**
 * @param  {String} proposalHash Hash
 * @param  {Number} index
 * @param  {Boolean} approve
 * @param  {KeyPair} signingKeypair
 */
 async function vote(proposalHash, index, approve, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.vote(proposalHash, index, approve);
      await tx.signAndSend(signingKeypair, ({ status, dispatchError }) => {
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
          console.log('Transaction send to provider', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  });
}

/**
 * @param  {String} proposalHash Hash
 * @param  {Number} index
 * @param  {Boolean} proposalWeightBond
 * @param  {Number} lengthCount
 * @param  {KeyPair} signingKeypair
 */
 async function close(proposalHash, index, proposalWeightBond, lengthCount, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.council.close(proposalHash, index, proposalWeightBond, lengthCount);
      await tx.signAndSend(signingKeypair, ({ status, dispatchError }) => {
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
          console.log('Transaction send to provider', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  });
}

/**
 * @param  {String} proposalHash Hash
 * @param  {KeyPair} signingKeypair
 */
 async function disapproveProposal(proposalHash, signingKeypair, api = false) {
  return new Promise(async (resolve, reject) => {
    try {
      const provider = api || await buildConnection('local');
      const tx = provider.tx.sudo.sudo(
        provider.tx.council.disapproveProposal(proposalHash)
      );
      await tx.signAndSend(signingKeypair, ({ status, dispatchError }) => {
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
          console.log('Transaction send to provider', status.asFinalized.toHex());
          resolve(status.asFinalized.toHex());
        }
      });
    } catch (err) {
      console.log(err);
      return false;
    }
  });
}

async function getMembers(api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.members()).toHuman();
}

async function getPrime(api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.prime()).toHuman();
}

async function getProposals(api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.proposals()).toHuman();
}

async function getProposalOf(proposalHash, api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.proposalOf(proposalHash)).toHuman();
}

async function getVotes(proposalHash, api = false) {
  const provider = api || (await buildConnection('local'));
  return (await provider.query.council.voting(proposalHash)).toHuman();
}

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