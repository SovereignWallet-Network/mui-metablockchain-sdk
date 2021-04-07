const { createVC, signVC, verifyVC } = require('../vc.js');
const { buildConnection } = require('../connection.js');
const { initKeyring } = require('../config');

const TEST_MNEMONIC = '//Alice';
const KYC_SCHEMA_TESTNET = "0x15733EA25E1C3A1A8F2330D1B64E80B765971A370653943DB57A2099EF0EDF1F";

const testVC = {
  name: 'Mathew Joseph',
  email: 'mavanek261@fxmail.ws',
  country: 'India',
  owner_did: 'did:ssid:steve',
  issued_block: '106031',
};

async function createAndSignVC() {
  let provider = await buildConnection("dev");
  const rawVC = await createVC(testVC, KYC_SCHEMA_TESTNET, provider);
  const keyring = await initKeyring();
  const sig_key_pair = await keyring.addFromUri(TEST_MNEMONIC);
  console.log(rawVC);
  let signed_vc = await signVC(rawVC, 'Alice', sig_key_pair);
  console.log(signed_vc);
  return JSON.stringify(JSON.stringify(signed_vc));
}

async function verifySignedVC() {
  let provider = await buildConnection('dev');
  let result = await verifyVC(res, provider);
  console.log('VC verified>>', result);
}

createAndSignVC(testVC).then(res => {
  console.log(res);
});

