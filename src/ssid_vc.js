// Helper function to create and verify SSID VC
// SSID VC is expected in the following format
// * {
// *   "properties" : {
// *          // the properties JSON, this should be the same as the schema definition
// *          },
// *   "hash" : "SHA512 hash of the properties field",
// *   "signature" : "The signature of the verifier, verifying the hash"
// * }
const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
const { signatureVerify } = require('@polkadot/util-crypto');
const sha256 = require('js-sha256');
/**
 * The function returns the VC in the expected format, the
 * signature field is left blank to be filled by signing function
 * @param {JSON} properties_json
 * @returns {JSON}
 */
function createSsidVC(propertiesJson) {
  return {
    properties: propertiesJson,
    hash: u8aToHex(sha256(stringToU8a(JSON.stringify(propertiesJson)))),
    signature: undefined,
  };
}

/**
 * Sign a VC using the given verifier_pvkey
 * @param {JSON} vcJson
 * @param {KeyPair} signerKeyPair
 * @returns {JSON}
 */
async function signSsidVC(vcJson, signerKeyPair) {
  // sign the VC
  const dataToSign = hexToU8a(vcJson.hash);
  const signedData = signerKeyPair.sign(dataToSign);
  const resVC = vcJson;
  resVC.signature = u8aToHex(signedData);
  return resVC;
}

/**
 * Verify if the signature is valid and matches the given public_key in ssid_vc
 * @param {JSON} vcJson
 * @returns {Boolean} true if valid SSID_VC
 */
async function verifySsidVC(vcJson) {
  return signatureVerify(
    hexToU8a(vcJson.hash),
    hexToU8a(vcJson.signature),
    vcJson.properties.public_key.toString(),
  ).isValid;
}

module.exports = {
  createSsidVC,
  signSsidVC,
  verifySsidVC,
};
