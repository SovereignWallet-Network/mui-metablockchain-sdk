const { Keyring } = require('@polkadot/api');
const { buildConnection } = require('../connection.js');
const token = require('../token.js');

async function transfer_tokens() {
  const provider = await buildConnection('local');
  // Use the default validator to create new did
  const keyring = new Keyring({ type: 'sr25519' });
  const sig_key_pair = await keyring.addFromUri('//Alice');
  const vc_id = '0xdcc9a36b426a2f3ce3c1ddbd75905de3dd9f33d0e2e413d1b248a368fe43d624';
  let res = await token.transferToken(vc_id, "did:ssid:swn2", "1", "100", sig_key_pair, provider);
  console.log(res);
}

async function issue_tokens() {
    const provider = await buildConnection('dev');
    // Use the default validator to create new did
    const keyring = new Keyring({ type: 'sr25519' });
    const sig_key_pair = await keyring.addFromUri('//Alice');
    const vc_id = '0xdcc9a36b426a2f3ce3c1ddbd75905de3dd9f33d0e2e413d1b248a368fe43d624';
    let res = await token.issueToken(vc_id, "1000000", sig_key_pair, provider);
    console.log(res);
  }

async function get_token_bal() {
    const provider = await buildConnection('local');
    let res = await token.getTokenBalance("did:ssid:swn2", "1", provider);
    console.log(res);
}

async function gettokennametokenid() {
    const provider = await buildConnection('local');
    let res = await token.getTokenNameFromCurrencyId("1");
    console.log(res);
}

async function gettokenlist() {
  const provider = await buildConnection('dev');
  let res = await token.getTokenList(provider);
  console.log(res);
}

//issue_tokens();
//get_token_bal();
//gettokennametokenid();
//gettokenlist();