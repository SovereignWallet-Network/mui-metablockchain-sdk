const { Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

const METABLOCKCHAIN_PROVIDER = {
  LOCAL: 'ws://127.0.0.1:9944',
  DEV: 'wss://n3testnet.metabit.exchange',
  TESTNET: 'wss://n3testnet.metabit.exchange',
  MAINNET: 'wss://mui.metablockchain.id',
};

const initKeyring = async (type = 'sr25519') => {
  await cryptoWaitReady();
  const keyring = await new Keyring({ type });
  return keyring;
};

module.exports = {
  METABLOCKCHAIN_PROVIDER,
  initKeyring,
};
