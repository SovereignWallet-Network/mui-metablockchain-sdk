### MUI Metablockchain SDK

JS SDK to interface with substrate node of MUI Metablockchain.

## Install
```
npm install mui-metablockchain-sdk
```

## Usage

### Network options

The best practice is to first create a websocket connection to the network you intend to connect with and then
pass this object to all function calls.
The available network options are `local`, `dev`, `testnet`, `mainnet`
If no network is specified, the functions default to either `dev` or `local`. 
In future when multiple nodes are being hosted, the user will have to option to pass url of the node itself.

### Example

- Create a DID and write on chain
```
const { connection, did, config } = require('metablockchain-sdk);
const NETWORK = "dev";

async function create_new_did(){

const mnemonic = "//Bob";
const new_did = "sample";

// create the DID object
let did_obj = await did.generateDID(mnemonic, new_did, "");

//Use the validator account to sign did operation
const keyring = await config.initKeyring();
const sig_key_pair = await keyring.addFromUri('//Alice');

let provider = await connection.buildConnection(NETWORK);
let tx_hash = await did.storeDIDOnChain(did_obj, sig_key_pair, provider);

return tx_hash;
}

```

## Test

```
npm test
```

## Functions

- <a href="#didUtils">DID</a>
- <a href="#balanceUtils">Balance</a>
- <a href="#txnUtils">Transactions</a>
- <a href="#vcUtils">VC</a>


<a name="didUtils"></a>
### DID Utilties

<dl>
<dt><a href="#generateDID">generateDID(mnemonic, identifier, metadata)</a> ⇒ <code>Object</code></dt>
<dd><p>Generate did object to be stored in blockchain.</p>
</dd>
<dt><a href="#storeDIDOnChain">storeDIDOnChain(DID, signingKeypair, api)</a> ⇒ <code>string</code></dt>
<dd><p>Store the generated DID object in blockchain</p>
</dd>
<dt><a href="#getDIDDetails">getDIDDetails(identifier)</a></dt>
<dd><p>Get did information from accountID</p>
</dd>
<dt><a href="#resolveDIDToAccount">resolveDIDToAccount(identifier, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get the accountId for a given DID</p>
</dd>
<dt><a href="#resolveAccountIdToDid">resolveAccountIdToDid(accountId, api)</a> ⇒ <code>String</code> | <code>Boolean</code></dt>
<dd><p>Get the DID associated to given accountID</p>
</dd>
<dt><a href="#updateDidKey">updateDidKey(identifier, newKey, signingKeypair, api)</a></dt>
<dd><p>This function will rotate the keys assiged to a DID
It should only be called by validator accounts, else will fail</p>
</dd>
<dt><a href="#convertFixedSizeHex">convertFixedSizeHex(data, size)</a> ⇒ <code>String</code></dt>
<dd><p>Convert to hex but return fixed size always, mimics substrate storage</p>
</dd>
<dt><a href="#isDidValidator">isDidValidator(identifier, api)</a> ⇒ <code>Bool</code></dt>
<dd><p>Check if the user is an approved validator</p>
</dd>
<dt><a href="#getDidKeyHistory">getDidKeyHistory(identifier, api)</a></dt>
<dd><p>Fetch the history of rotated keys for the specified DID</p>
</dd>
<dt><a href="#updateMetadata">updateMetadata(identifier, metadata, signingKeypair, api)</a></dt>
<dd></dd>
</dl>

<a name="generateDID"></a>

## generateDID(mnemonic, identifier, metadata) ⇒ <code>Object</code>
Generate did object to be stored in blockchain.

**Kind**: global function  
**Returns**: <code>Object</code> - Object containing did structure  

| Param | Type |
| --- | --- |
| mnemonic | <code>String</code> | 
| identifier | <code>String</code> | 
| metadata | <code>String</code> | 

<a name="storeDIDOnChain"></a>

## storeDIDOnChain(DID, signingKeypair, api) ⇒ <code>string</code>
Store the generated DID object in blockchain

**Kind**: global function  
**Returns**: <code>string</code> - txnId Txnid for storage operation.  

| Param | Type | Default |
| --- | --- | --- |
| DID | <code>Object</code> |  | 
| signingKeypair | <code>Object</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getDIDDetails"></a>

## getDIDDetails(identifier)
Get did information from accountID

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| identifier | <code>String</code> | DID Identifier returns {JSON} |

<a name="resolveDIDToAccount"></a>

## resolveDIDToAccount(identifier, api) ⇒ <code>String</code>
Get the accountId for a given DID

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| identifier | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="resolveAccountIdToDid"></a>

## resolveAccountIdToDid(accountId, api) ⇒ <code>String</code> \| <code>Boolean</code>
Get the DID associated to given accountID

**Kind**: global function  
**Returns**: <code>String</code> \| <code>Boolean</code> - (false if not found)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| accountId | <code>String</code> |  | (hex/base64 version works) |
| api | <code>ApiPromise</code> | <code>false</code> |  |

<a name="updateDidKey"></a>

## updateDidKey(identifier, newKey, signingKeypair, api)
This function will rotate the keys assiged to a DID
It should only be called by validator accounts, else will fail

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| identifier | <code>String</code> |  |
| newKey | <code>Uint8Array</code> |  |
| signingKeypair | <code>KeyringObj</code> | // of a validator account |
| api | <code>ApiPromise</code> |  |

<a name="convertFixedSizeHex"></a>

## convertFixedSizeHex(data, size) ⇒ <code>String</code>
Convert to hex but return fixed size always, mimics substrate storage

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| data | <code>String</code> |  | 
| size | <code>Int</code> | <code>64</code> | 

<a name="isDidValidator"></a>

## isDidValidator(identifier, api) ⇒ <code>Bool</code>
Check if the user is an approved validator

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| identifier | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getDidKeyHistory"></a>

## getDidKeyHistory(identifier, api)
Fetch the history of rotated keys for the specified DID

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| identifier | <code>String</code> |  |  |
| api | <code>ApiPromise</code> | <code>false</code> | returns Array |

<a name="updateMetadata"></a>

## updateMetadata(identifier, metadata, signingKeypair, api)
**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| identifier | <code>String</code> |  |  |
| metadata | <code>String</code> |  |  |
| signingKeypair | <code>KeyringObj</code> |  | // of a validator account |
| api | <code>ApiPromise</code> | <code>false</code> |  |

<a name="balanceUtils"></a>
### Balance Utilities

<dl>
<dt><a href="#getBalance">getBalance(did, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get account balance based on the did supplied.</p>
</dd>
<dt><a href="#subscribeToBalanceChanges">subscribeToBalanceChanges(identifier, callback, api)</a></dt>
<dd><p>Listen to balance changes for a DID and execute the callback.</p>
</dd>
</dl>

<a name="getBalance"></a>

## getBalance(did, api) ⇒ <code>String</code>
Get account balance based on the did supplied.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| did | <code>string</code> |  | Identifier of the user |
| api | <code>ApiPromse</code> | <code>false</code> |  |

**Example**  
```js
await getBalanceFromDID(did, true)
```
<a name="subscribeToBalanceChanges"></a>

## subscribeToBalanceChanges(identifier, callback, api)
Listen to balance changes for a DID and execute the callback.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| identifier | <code>String</code> |  | DID |
| callback | <code>function</code> |  | Cb function to execute with new balance. |
| api | <code>ApiPromise</code> | <code>false</code> | Api object of polkadot |

<a name="txnUtils"></a>
### Transaction Utilities

<a name="sendTransaction"></a>

## sendTransaction(senderAccountKeyPair, receiverDID, amount, api) ⇒ <code>Uint8Array</code>
The function will perform a metamui transfer operation from the account of senderAccount to the
receiverDID.
Note : balanceCheck has not been included in the checks since sender not having balance
is handled in extrinsic, check test/transaction.js

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| senderAccountKeyPair | <code>KeyringObj</code> |  |  |
| receiverDID | <code>String</code> |  |  |
| amount | <code>String</code> |  |  |
| api | <code>APIPromise</code> | <code>false</code> | (optional) |

<a name="vcUtils"></a>
### Verifiable Credential (VC) Utilities

<dl>
<dt><a href="#createVC">createVC(properties_json, schema_hash)</a> ⇒ <code>JSON</code></dt>
<dd><p>The function returns the VC in the expected format, the verifier and
signature fields are left blank to be filled by signing function</p>
</dd>
<dt><a href="#signVC">signVC(vcJson, verifierDid, signingKeyPair)</a> ⇒ <code>JSON</code></dt>
<dd><p>Sign a VC using the given verifier_pvkey</p>
</dd>
<dt><a href="#verifyVC">verifyVC(vcJson)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the signature/verifier DID is valid and matches the given data in vc_json</p>
</dd>
</dl>

<a name="createVC"></a>

## createVC(properties_json, schema_hash) ⇒ <code>JSON</code>
The function returns the VC in the expected format, the verifier and
signature fields are left blank to be filled by signing function

**Kind**: global function  

| Param | Type |
| --- | --- |
| properties_json | <code>JSON</code> | 
| schema_hash | <code>Hex</code> | 

<a name="signVC"></a>

## signVC(vcJson, verifierDid, signingKeyPair) ⇒ <code>JSON</code>
Sign a VC using the given verifier_pvkey

**Kind**: global function  

| Param | Type |
| --- | --- |
| vcJson | <code>JSON</code> | 
| verifierDid | <code>String</code> | 
| signingKeyPair | <code>KeyPair</code> | 

<a name="verifyVC"></a>

## verifyVC(vcJson) ⇒ <code>Boolean</code>
Verify if the signature/verifier DID is valid and matches the given data in vc_json

**Kind**: global function  
**Returns**: <code>Boolean</code> - true if valid VC  

| Param | Type |
| --- | --- |
| vcJson | <code>JSON</code> | 



<a name="tokenUtils"></a>
### Token Utilities

<dl>
<dt><a href="#transferToken">transferToken(recipent_did, token_id, token_amount, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Transfer token with given token_id to the recipent_did</p>
</dd>
<dt><a href="#issueNewToken">issueNewToken(recipent_did, token_id, token_name, total_issuance_amt, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd></dd>
<dt><a href="#getTokenBalance">getTokenBalance(did, tokenId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get the token balance for a given token for given did</p>
</dd>
<dt><a href="#getTokenNameFromTokenId">getTokenNameFromTokenId(tokenId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get the human friendly name of token from token id</p>
</dd>
<dt><a href="#getTokenList">getTokenList(api)</a> ⇒ <code>Array</code></dt>
<dd><p>Get the list of all active tokens in metablockchain network</p>
</dd>
<dt><a href="#getTokenTotalSupply">getTokenTotalSupply(tokenId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get the total issuance amount for given token_id</p>
</dd>
<dt><a href="#withdrawTreasuryReserve">withdrawTreasuryReserve(destination, from, amount, senderAccountKeyPair, api)</a> ⇒ <code>String</code></dt>
<dd><p>Function to withdraw the treasury reserve amount locked at the time of
token creation. Only a validator can call this operation succesfully.</p>
</dd>
</dl>

