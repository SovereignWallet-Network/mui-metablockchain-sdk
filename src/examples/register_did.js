const { Keyring } = require('@polkadot/api');
const { buildConnection } = require('../connection.js');
const { storeDIDOnChain, generateDID, updateDidKey } = require('../did.js');
const did = require('../did.js');


async function create_new_did(){
const mnemonic2 = "finish glad dog menu stadium always gaze day analyst expose opinion print";
const new_did = "hidden";

let did_obj = await generateDID(mnemonic2, new_did, "");
console.log(did_obj);

let provider = await buildConnection("dev");

//Use the default validator to create new did
const keyring = new Keyring({ type: 'sr25519' });
const sig_key_pair = await keyring.addFromUri('//Bob');
console.log(sig_key_pair.address);

const did2 = {
  "identity" : "did:ssid:amit",
  "public_key" : "5DPQ9khQ1yPDxNEGgUJMT71Xh5zqua3nL5VeXdheXhAPYH9f",
  "metadata" : ""
}


storeDIDOnChain(did_obj, sig_key_pair, provider)
  .then(res => console.log('Store DID function response', res))

}

create_new_did();



