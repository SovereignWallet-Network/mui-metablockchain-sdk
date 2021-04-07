const { Keyring } = require('@polkadot/api');
const { buildConnection } = require('../connection.js');
const token = require('../token.js');

async function transfer_tokens() {
  const provider = await buildConnection('local');
  // Use the default validator to create new did
  const keyring = new Keyring({ type: 'sr25519' });
  const sig_key_pair = await keyring.addFromUri('//Alice');
  let res = await token.transferToken("did:ssid:swn2", "1", "100", sig_key_pair, provider);
  console.log(res);
}

async function issue_tokens() {
    const provider = await buildConnection('dev');
    // Use the default validator to create new did
    const keyring = new Keyring({ type: 'sr25519' });
    const sig_key_pair = await keyring.addFromUri('//Alice');
    let res = await token.issueNewToken("did:ssid:swn2", "1", "XYZ", "100", sig_key_pair, provider);
    console.log(res);
  }

async function get_token_bal() {
    const provider = await buildConnection('local');
    let res = await token.getTokenBalance("did:ssid:swn2", "1", provider);
    console.log(res);
}

async function gettokennametokenid() {
    const provider = await buildConnection('local');
    let res = await token.getTokenNameFromTokenId("1");
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