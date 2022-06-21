const { ApiPromise, WsProvider } = require('@polkadot/api');
const { METABLOCKCHAIN_PROVIDER } = require('./config.js');
const { METABLOCKCHAIN_TYPES } = require('./utils.js');

// assign network
const NETWORK_PROVIDER = {
  local: METABLOCKCHAIN_PROVIDER.LOCAL,
  dev: METABLOCKCHAIN_PROVIDER.DEV,
  demo: METABLOCKCHAIN_PROVIDER.DEMO,
  testnet: METABLOCKCHAIN_PROVIDER.TESTNET,
  mainnet: METABLOCKCHAIN_PROVIDER.MAINNET,
};

// global obj to cache ws connection
let providerInstance = null;

function buildNewConnection(network = 'local') {
  if (!(network in NETWORK_PROVIDER)) throw new Error('Invalid Network!');

  const provider = new WsProvider(NETWORK_PROVIDER[network]);
  return ApiPromise.create({
    provider,
    types: METABLOCKCHAIN_TYPES,
  });
}

/**
 * Return an APIPromise object
 * @param {String} network MetaMUI network provider to connect
 * @param {Boolen=} ignoreCache (optional) (default=true)
 * Note : setting the ignoreCache value to true will create a new ws
 * ws conection on every call
 */
function buildConnection(network = 'local', ignoreCache = false) {
  if (!providerInstance || ignoreCache) {
    console.log('Creating new websocket connection!');
    providerInstance = buildNewConnection(network);
  }
  return providerInstance;
}

module.exports = {
  buildConnection,
};
