/**
 * VC IMPLEMENTATION (MVP)
 * VC in metablockchain network is used as a certificate to prove certain details.
 * All VCs have to follow the params mentioned in the respective SCHEMA.
 *
 * VC is just a simple JSON document (for now), that contains the values
 * and is signed by the verifying authority.
 * We have to modify it to an interface or class to support generalised SCHEMAs.
 *
 * VC Format (For schemas and verifier DID already registered on blockchain) :
 * {
 *   "schema" : "Hash of the schema that the VC is using",
 *   "properties" : {
 *          // the properties JSON, this should be the same as the schema definition
 *          },
 *   "hash" : "SHA256 hash of the properties field",
 *   "verifier" : "The metablock did of the verifying authority",
 *   "signature" : "The signature of the verifier, verifying the hash"
 * }
 */
 const { stringToU8a, u8aToHex, hexToU8a } = require('@polkadot/util');
 const { signatureVerify } = require('@polkadot/util-crypto');
 const sha256 = require('js-sha256');
 const { getDIDDetails, getDidKeyHistory, isDidValidator } = require('./did');
 const { buildConnection } = require('./connection.js');
 const { doesSchemaExist } = require('./schema.js');
 
 /**
  * The function returns the VC in the expected format, the verifier and
  * signature fields are left blank to be filled by signing function
  * @param {JSON} properties_json
  * @param {Hex} schema_hash
  *
  * @returns {JSON}
  */
 async function createVC(propertiesJson, schemaHash, api=false) {
   // Check to validate schemaHash
   // if (!(await doesSchemaExist(schemaHash, api))) {
   //   throw Error('SchemaHash not valid!');
   // }
   return {
     schema: schemaHash,
     properties: propertiesJson,
     hash: u8aToHex(sha256(stringToU8a(JSON.stringify(propertiesJson)))),
     verifier: undefined,
     signature: undefined,
   };
 }
 
 /**
  * Sign a VC using the given verifier_pvkey
  * @param {JSON} vcJson
  * @param {String} verifierDid
  * @param {KeyPair} signingKeyPair
  * @returns {JSON}
  */
 async function signVC(vcJson, verifierDid, signingKeyPair) {
   // check if the hash and the properties are a match
   const expectedHash = u8aToHex(sha256(stringToU8a(JSON.stringify(vcJson.properties))));
   if (expectedHash !== vcJson.hash) {
     throw new Error('Data Mismatch!');
   }
 
   // sign the VC
   const dataToSign = hexToU8a(vcJson.hash);
   const signedData = signingKeyPair.sign(dataToSign);
   const resVC = vcJson;
   resVC.verifier = verifierDid;
   resVC.signature = u8aToHex(signedData);
 
   return resVC;
 }
 
 /**
  * Verify if the signature/verifier DID is valid and matches the given data in vc_json
  * @param {JSON} vcJson
  *
  * @returns {Boolean} true if valid VC
  */
 async function verifyVC(vcJson, api = false) {
   const provider = api || (await buildConnection('local'));
 
   // check if the vc has signature and verifier
   if (!vcJson.verifier || !vcJson.signature) {
     throw new Error('VC Not signed!');
   }
 
   // check if the hash and the properties are a match
   const expectedHash = u8aToHex(sha256(stringToU8a(JSON.stringify(vcJson.properties))));
   if (expectedHash !== vcJson.hash) {
     throw new Error('Data Mismatch!');
   }
 
   // check if the signer is a validator
   const isSignerValidator = await isDidValidator(vcJson.verifier, provider);
   if (!isSignerValidator) throw new Error('Signer is not a validator!');
 
   // fetch the details of the DID
   const didDetails = await getDIDDetails(vcJson.verifier, provider);
   let signerAddress = didDetails.public_key;
 
   // if the pubkey has been rotated, check for older versions
   // naive implementation need to reafactor later handling edge cases
   if (didDetails.added_block > parseInt(vcJson.properties.issued_block, 10)) {
     console.log('Signing key has been rotated, searching for previous key history!');
     const prevKeyDetails = await getDidKeyHistory(vcJson.verifier);
     prevKeyDetails.forEach(([accountId, blockNo]) => {
       if (parseInt(vcJson.properties.issued_block, 10) > blockNo) {
         console.log('Signing key found!');
         signerAddress = accountId;
       }
     });
   }
 
   return signatureVerify(hexToU8a(vcJson.hash), hexToU8a(vcJson.signature), signerAddress.toString()).isValid;
 }
 
 module.exports = {
   createVC,
   signVC,
   verifyVC,
   doesSchemaExist,
 };