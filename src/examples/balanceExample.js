const {buildConnection} = require('../connection');
const {subscribeToBalanceChanges} = require('../balance');

async function test() {
  const api = await buildConnection('dev');
  subscribeToBalanceChanges(
    'did:ssid:mathew',
    (val) => console.log('Balance Update', val),
    api,
  );
}

test();