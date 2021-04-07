const { initKeyring } = require('../config');
const { createSsidVC, signSsidVC, verifySsidVC} = require("../ssid_vc");

async function createAndVerifySSIDVC(){
    let test = {"did" : "did:ssid:sdfadsfadsfasdf", "public_key" : "0x5a6773c827b243dcb54af94e7ac922024c91d6f6a66d2a51bfa6db6049118a4e"};
    let ssid_vc = createSsidVC(test);
    console.log(ssid_vc);
    const keyring = await initKeyring();
    const sig_key_pair = await keyring.addFromUri('//Stan');
    let res = await signSsidVC(ssid_vc, sig_key_pair)
    console.log(JSON.stringify(JSON.stringify(res)));
    console.log(verifySsidVC(res));
}

createAndVerifySSIDVC();