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
const { connection, did, config } = require('mui-metablockchain-sdk');
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

## Modules

- <a href="#connectionUtils">Connection</a>
- <a href="#balanceUtils">Balance</a>
- <a href="#cltvUtils">Collective</a>
- <a href="#didUtils">DID</a>
- <a href="#tokenUtils">token</a>
- <a href="#txnUtils">Transactions</a>
- <a href="#vcUtils">VC</a>
- <a href="#utils">Utils</a>


<a name="connectionUtils"></a>

## Connection Utilities
### Functions

<a name="buildConnection"></a>

## buildConnection(network, [ignoreCache])
Return an APIPromise object

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| network | <code>String</code> | <code>local</code> | MetaMUI network provider to connect |
| [ignoreCache] | <code>Boolen</code> | <code>false</code> | (optional) (default=true) Note : setting the ignoreCache value to true will create a new ws ws conection on every call |



<a name="balanceUtils"></a>

## Balance Utilities

### Functions

<dl>
<dt><a href="#getBalance">getBalance(did, [api])</a> ⇒ <code>String</code></dt>
<dd><p>Get account balance(Highest Form) based on the did supplied.</p>
</dd>
<dt><a href="#subscribeToBalanceChanges">subscribeToBalanceChanges(identifier, callback, [api])</a></dt>
<dd><p>Listen to balance changes for a DID and execute the callback.</p>
</dd>
</dl>

<a name="getBalance"></a>

## getBalance(did, [api]) ⇒ <code>String</code>
Get account balance(Highest Form) based on the did supplied.

**Kind**: global function  
**Returns**: <code>String</code> - Balance In Highest Form  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| did | <code>String</code> |  | Identifier of the user |
| [api] | <code>ApiPromse</code> | <code>false</code> | Api Object from Build Connection |

**Example**  
```js
await getBalanceFromDID(did, api)
```
<a name="subscribeToBalanceChanges"></a>

## subscribeToBalanceChanges(identifier, callback, [api])
Listen to balance changes for a DID and execute the callback.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| identifier | <code>String</code> |  | DID |
| callback | <code>function</code> |  | Cb function to execute with new balance in Highest Form |
| [api] | <code>ApiPromise</code> | <code>false</code> | Api Object from Build Connection |



<a name="cltvUtils"></a>

## Collective Utilities

### Functions

<dl>
<dt><a href="#setMembers">setMembers(newMembers, prime, oldCount, signingKeypair)</a> ⇒ <code>String</code></dt>
<dd><p>Set Members and prime of collective pallet</p>
</dd>
<dt><a href="#propose">propose(threshold, proposal, lengthCount, signingKeypair)</a></dt>
<dd><p>To create a proposal</p>
</dd>
<dt><a href="#execute">execute(proposal, lengthCount, signingKeypair)</a></dt>
<dd><p>To Execute a call</p>
</dd>
<dt><a href="#vote">vote(proposalHash, index, approve, signingKeypair)</a></dt>
<dd><p>Vote on a proposal</p>
</dd>
<dt><a href="#close">close(proposalHash, index, proposalWeightBond, lengthCount, signingKeypair)</a></dt>
<dd><p>Close a proposal manually, executes call if yes votes is greater than or equal to threshold</p>
</dd>
<dt><a href="#disapproveProposal">disapproveProposal(proposalHash, signingKeypair)</a></dt>
<dd><p>Disapprove proposal</p>
</dd>
<dt><a href="#getMembers">getMembers(api)</a></dt>
<dd><p>Get Members of Council</p>
</dd>
<dt><a href="#getPrime">getPrime(api)</a></dt>
<dd><p>Get Members of Council</p>
</dd>
<dt><a href="#getProposals">getProposals(api)</a></dt>
<dd><p>Get All Proposals</p>
</dd>
<dt><a href="#getProposalOf">getProposalOf(proposalHash, api)</a></dt>
<dd><p>Get Proposal of given hash</p>
</dd>
<dt><a href="#getVotes">getVotes(proposalHash, api)</a></dt>
<dd><p>Get Votes of given proposal hash</p>
</dd>
<dt><a href="#getProposalCount">getProposalCount(api)</a></dt>
<dd><p>Get Total proposals count</p>
</dd>
</dl>

<a name="setMembers"></a>

## setMembers(newMembers, prime, oldCount, signingKeypair) ⇒ <code>String</code>
Set Members and prime of collective pallet

**Kind**: global function  
**Returns**: <code>String</code> - Hash  

| Param | Type | Description |
| --- | --- | --- |
| newMembers | <code>Array.&lt;String&gt;</code> | Array of Did |
| prime | <code>String</code> | Did of Prime |
| oldCount | <code>Number</code> | Old members count |
| signingKeypair | <code>KeyPair</code> | Key pair of Sender |

<a name="propose"></a>

## propose(threshold, proposal, lengthCount, signingKeypair)
To create a proposal

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| threshold | <code>Number</code> | Threshold to successfull execution |
| proposal | <code>Call</code> | Call to propose |
| lengthCount | <code>Number</code> | Length of call |
| signingKeypair | <code>KeyPair</code> | Key pair of sender |

<a name="execute"></a>

## execute(proposal, lengthCount, signingKeypair)
To Execute a call

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| proposal | <code>Call</code> | Call to propose |
| lengthCount | <code>Number</code> | Length of Call |
| signingKeypair | <code>KeyPair</code> | Key pair of sender |

<a name="vote"></a>

## vote(proposalHash, index, approve, signingKeypair)
Vote on a proposal

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| proposalHash | <code>String</code> | Hash of proposal |
| index | <code>Number</code> | Proposal index |
| approve | <code>Boolean</code> | True/false |
| signingKeypair | <code>KeyPair</code> | Key pair of sender |

<a name="close"></a>

## close(proposalHash, index, proposalWeightBond, lengthCount, signingKeypair)
Close a proposal manually, executes call if yes votes is greater than or equal to threshold

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| proposalHash | <code>String</code> | Hash |
| index | <code>Number</code> | Proposal index |
| proposalWeightBond | <code>Boolean</code> | Weight |
| lengthCount | <code>Number</code> | Length |
| signingKeypair | <code>KeyPair</code> | Key pair of sender |

<a name="disapproveProposal"></a>

## disapproveProposal(proposalHash, signingKeypair)
Disapprove proposal

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| proposalHash | <code>String</code> | Hash |
| signingKeypair | <code>KeyPair</code> | Key pair of sender |

<a name="getMembers"></a>

## getMembers(api)
Get Members of Council

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| api | <code>Boolean</code> | <code>false</code> | Network Provider |

<a name="getPrime"></a>

## getPrime(api)
Get Members of Council

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| api | <code>Boolean</code> | <code>false</code> | Network Provider |

<a name="getProposals"></a>

## getProposals(api)
Get All Proposals

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| api | <code>Boolean</code> | <code>false</code> | Network Provider |

<a name="getProposalOf"></a>

## getProposalOf(proposalHash, api)
Get Proposal of given hash

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| proposalHash | <code>Hash</code> |  | Hash of proposal |
| api | <code>Boolean</code> | <code>false</code> | Network Provider |

<a name="getVotes"></a>

## getVotes(proposalHash, api)
Get Votes of given proposal hash

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| proposalHash | <code>Hash</code> |  | Hash of proposal |
| api | <code>Boolean</code> | <code>false</code> | Network Provider |

<a name="getProposalCount"></a>

## getProposalCount(api)
Get Total proposals count

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| api | <code>Boolean</code> | <code>false</code> | Network Provider |




<a name="didUtils"></a>

## DID Utilties

### Functions

<dl>
<dt><a href="#generateMnemonic">generateMnemonic()</a> ⇒ <code>String</code></dt>
<dd><p>Generate Mnemonic</p>
</dd>
<dt><a href="#generateDID">generateDID(mnemonic, identifier, metadata)</a> ⇒ <code>Object</code></dt>
<dd><p>Generate did object to be stored in blockchain.</p>
</dd>
<dt><a href="#storeDIDOnChain">storeDIDOnChain(DID, signingKeypair, api)</a> ⇒ <code>String</code></dt>
<dd><p>Store the generated DID object in blockchain</p>
</dd>
<dt><a href="#getDIDDetails">getDIDDetails(identifier)</a> ⇒ <code>JSON</code></dt>
<dd><p>Get did information from accountID</p>
</dd>
<dt><a href="#resolveDIDToAccount">resolveDIDToAccount(identifier, api, blockNumber)</a> ⇒ <code>String</code></dt>
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
<dt><a href="#sanitiseDid">sanitiseDid(did)</a> ⇒ <code>String</code></dt>
<dd><p>Checks if the given did is in hex format or not &amp; converts it into valid hex format.</p>
<p> Note: This util function is needed since dependant module wont convert the utf did to hex anymore</p>
</dd>
<dt><a href="#isDidValidator">isDidValidator(identifier, api)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Check if the user is an approved validator</p>
</dd>
<dt><a href="#getDidKeyHistory">getDidKeyHistory(identifier, api)</a> ⇒ <code>Array</code></dt>
<dd><p>Fetch the history of rotated keys for the specified DID</p>
</dd>
<dt><a href="#updateMetadata">updateMetadata(identifier, metadata, signingKeypair, api)</a></dt>
<dd></dd>
</dl>

<a name="generateMnemonic"></a>

## generateMnemonic() ⇒ <code>String</code>
Generate Mnemonic

**Kind**: global function  
**Returns**: <code>String</code> - Mnemonic  
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

## storeDIDOnChain(DID, signingKeypair, api) ⇒ <code>String</code>
Store the generated DID object in blockchain

**Kind**: global function  
**Returns**: <code>String</code> - txnId Txnid for storage operation.  

| Param | Type | Default |
| --- | --- | --- |
| DID | <code>Object</code> |  | 
| signingKeypair | <code>Object</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getDIDDetails"></a>

## getDIDDetails(identifier) ⇒ <code>JSON</code>
Get did information from accountID

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| identifier | <code>String</code> | DID Identifier |

<a name="resolveDIDToAccount"></a>

## resolveDIDToAccount(identifier, api, blockNumber) ⇒ <code>String</code>
Get the accountId for a given DID

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| identifier | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 
| blockNumber | <code>Number</code> | <code></code> | 

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

<a name="sanitiseDid"></a>

## sanitiseDid(did) ⇒ <code>String</code>
Checks if the given did is in hex format or not & converts it into valid hex format.

 Note: This util function is needed since dependant module wont convert the utf did to hex anymore

**Kind**: global function  
**Returns**: <code>String</code> - Hex did  

| Param | Type |
| --- | --- |
| did | <code>String</code> | 

<a name="isDidValidator"></a>

## isDidValidator(identifier, api) ⇒ <code>Boolean</code>
Check if the user is an approved validator

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| identifier | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getDidKeyHistory"></a>

## getDidKeyHistory(identifier, api) ⇒ <code>Array</code>
Fetch the history of rotated keys for the specified DID

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| identifier | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="updateMetadata"></a>

## updateMetadata(identifier, metadata, signingKeypair, api)
**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| identifier | <code>String</code> |  |  |
| metadata | <code>String</code> |  |  |
| signingKeypair | <code>KeyringObj</code> |  | of a validator account |
| api | <code>ApiPromise</code> | <code>false</code> |  |




<a name="tokenUtils"></a>

## Token Utilities

### Functions

<dl>
<dt><a href="#issueToken">issueToken(vcId, totalIssuanceAmt, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Issue new token from given vc Id</p>
</dd>
<dt><a href="#transferToken">transferToken(recipentDid, currencyId, tokenAmount, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Transfer token with given token_id to the recipent_did</p>
</dd>
<dt><a href="#transferAll">transferAll(recipentDid, currencyId, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Transfer all token with given vc_id to the recipent_did</p>
</dd>
<dt><a href="#slashToken">slashToken(vcId, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Slash token from given currency</p>
</dd>
<dt><a href="#mintToken">mintToken(vcId, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Mint token to given currency</p>
</dd>
<dt><a href="#getTokenBalance">getTokenBalance(did, currencyId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get the token balance for a given token for given did</p>
</dd>
<dt><a href="#getDetailedTokenBalance">getDetailedTokenBalance(did, currencyId, api)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the detailed token balance for a given token for given did</p>
</dd>
<dt><a href="#getTokenNameFromCurrencyId">getTokenNameFromCurrencyId(currencyId, api)</a> ⇒ <code>tokenIdentifier</code></dt>
<dd><p>Get the human friendly name of token from token id</p>
</dd>
<dt><a href="#getTokenList">getTokenList(api)</a> ⇒ <code>Array</code></dt>
<dd><p>Get the list of all active tokens in metablockchain network</p>
</dd>
<dt><a href="#getTokenTotalSupply">getTokenTotalSupply(currencyId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get the total issuance amount for given currency id</p>
</dd>
<dt><a href="#getLocks">getLocks(currencyId, api)</a> ⇒ <code>Object</code></dt>
<dd><p>Get the lock for given currency id</p>
</dd>
<dt><a href="#getTokenIssuer">getTokenIssuer(currencyId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get the total issuance amount for given currency id</p>
</dd>
<dt><a href="#withdrawTreasuryReserve">withdrawTreasuryReserve(destination, from, amount, senderAccountKeyPair, api)</a> ⇒ <code>String</code></dt>
<dd><p>Function to withdraw the treasury reserve amount locked at the time of
token creation. Only a validator can call this operation succesfully.</p>
</dd>
<dt><a href="#transferTokenWithVC">transferTokenWithVC(vcId, receiverDID, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Transfer token of given currency to given Did from Currency owner account</p>
</dd>
</dl>

<a name="issueToken"></a>

## issueToken(vcId, totalIssuanceAmt, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Issue new token from given vc Id

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| vcId | <code>String</code> |  | 
| totalIssuanceAmt | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="transferToken"></a>

## transferToken(recipentDid, currencyId, tokenAmount, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Transfer token with given token_id to the recipent_did

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| recipentDid | <code>String</code> |  | 
| currencyId | <code>String</code> |  | 
| tokenAmount | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="transferAll"></a>

## transferAll(recipentDid, currencyId, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Transfer all token with given vc_id to the recipent_did

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| recipentDid | <code>String</code> |  | 
| currencyId | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="slashToken"></a>

## slashToken(vcId, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Slash token from given currency

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| vcId | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="mintToken"></a>

## mintToken(vcId, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Mint token to given currency

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| vcId | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="getTokenBalance"></a>

## getTokenBalance(did, currencyId, api) ⇒ <code>String</code>
Get the token balance for a given token for given did

**Kind**: global function  
**Returns**: <code>String</code> - Balance In Lowest Form  

| Param | Type | Default |
| --- | --- | --- |
| did | <code>String</code> |  | 
| currencyId | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getDetailedTokenBalance"></a>

## getDetailedTokenBalance(did, currencyId, api) ⇒ <code>Object</code>
Get the detailed token balance for a given token for given did

**Kind**: global function  
**Returns**: <code>Object</code> - In lowest Form  

| Param | Type | Default |
| --- | --- | --- |
| did | <code>String</code> |  | 
| currencyId | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getTokenNameFromCurrencyId"></a>

## getTokenNameFromCurrencyId(currencyId, api) ⇒ <code>tokenIdentifier</code>
Get the human friendly name of token from token id

**Kind**: global function  
**Returns**: <code>tokenIdentifier</code> - {token_name: String, currency_code: String, decimal: String}  

| Param | Type | Default |
| --- | --- | --- |
| currencyId | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getTokenList"></a>

## getTokenList(api) ⇒ <code>Array</code>
Get the list of all active tokens in metablockchain network

**Kind**: global function  
**Returns**: <code>Array</code> - [ { id: '1', name: 'XYZ' }, { id: '2', name: 'ABC' } ]  

| Param | Type | Default |
| --- | --- | --- |
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getTokenTotalSupply"></a>

## getTokenTotalSupply(currencyId, api) ⇒ <code>String</code>
Get the total issuance amount for given currency id

**Kind**: global function  
**Returns**: <code>String</code> - TotalSupply In Lowest Form  

| Param | Type | Default |
| --- | --- | --- |
| currencyId | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getLocks"></a>

## getLocks(currencyId, api) ⇒ <code>Object</code>
Get the lock for given currency id

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| currencyId | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="getTokenIssuer"></a>

## getTokenIssuer(currencyId, api) ⇒ <code>String</code>
Get the total issuance amount for given currency id

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| currencyId | <code>String</code> |  | 
| api | <code>ApiPromise</code> | <code>false</code> | 

<a name="withdrawTreasuryReserve"></a>

## withdrawTreasuryReserve(destination, from, amount, senderAccountKeyPair, api) ⇒ <code>String</code>
Function to withdraw the treasury reserve amount locked at the time of
token creation. Only a validator can call this operation succesfully.

**Kind**: global function  
**Returns**: <code>String</code> - transaction_hex_id  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| destination | <code>String</code> |  | (DID) |
| from | <code>String</code> |  | (DID) |
| amount | <code>String</code> |  | (MUI amount) |
| senderAccountKeyPair | <code>KeyPair</code> |  |  |
| api | <code>ApiPromise</code> | <code>false</code> |  |

<a name="transferTokenWithVC"></a>

## transferTokenWithVC(vcId, receiverDID, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Transfer token of given currency to given Did from Currency owner account

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| vcId | <code>String</code> |  | 
| receiverDID | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 





<a name="txnUtils"></a>

## Transaction Utilities
### Functions

<dl>
<dt><a href="#sendTransaction">sendTransaction(senderAccountKeyPair, receiverDID, amount, api, nonce)</a> ⇒ <code>Uint8Array</code></dt>
<dd><p>The function will perform a metamui transfer operation from the account of senderAccount to the
receiverDID.
Note : balanceCheck has not been included in the checks since sender not having balance
is handled in extrinsic, check test/transaction.js</p>
</dd>
<dt><a href="#transfer">transfer(senderAccountKeyPair, receiverDID, amount, memo, api, nonce)</a> ⇒ <code>Uint8Array</code></dt>
<dd><p>This function is similar to sendTransaction except that it provides the user to add the memo to transfer functionality.</p>
</dd>
</dl>

<a name="sendTransaction"></a>

## sendTransaction(senderAccountKeyPair, receiverDID, amount, api, nonce) ⇒ <code>Uint8Array</code>
The function will perform a metamui transfer operation from the account of senderAccount to the
receiverDID.
Note : balanceCheck has not been included in the checks since sender not having balance
is handled in extrinsic, check test/transaction.js

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| senderAccountKeyPair | <code>KeyPair</code> |  |  |
| receiverDID | <code>String</code> |  |  |
| amount | <code>String</code> |  | In Lowest Form |
| api | <code>APIPromise</code> | <code>false</code> | (optional) |
| nonce | <code>int</code> |  | (optional) |

<a name="transfer"></a>

## transfer(senderAccountKeyPair, receiverDID, amount, memo, api, nonce) ⇒ <code>Uint8Array</code>
This function is similar to sendTransaction except that it provides the user to add the memo to transfer functionality.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| senderAccountKeyPair | <code>KeyPair</code> |  |  |
| receiverDID | <code>String</code> |  |  |
| amount | <code>String</code> |  | In Lowest Form |
| memo | <code>String</code> |  |  |
| api | <code>APIPromise</code> | <code>false</code> | (optional) |
| nonce | <code>int</code> |  | (optional) |



<a name="vcUtils"></a>

## Verifiable Credential (VC) Utilities

### Functions

<dl>
<dt><a href="#createTokenVC">createTokenVC(TokenVC)</a> ⇒ <code>String</code></dt>
<dd><p>Encodes Token VC and pads with appropriate bytes</p>
</dd>
<dt><a href="#createMintSlashVC">createMintSlashVC(vcProperty)</a> ⇒ <code>String</code></dt>
<dd><p>Encodes Token VC and pads with appropriate bytes</p>
</dd>
<dt><a href="#createTokenTransferVC">createTokenTransferVC(vcProperty)</a> ⇒ <code>String</code></dt>
<dd><p>Encodes Token VC and pads with appropriate bytes</p>
</dd>
<dt><a href="#createVC">createVC(vcProperty, owner, issuers, vcType, sigKeypair)</a> ⇒ <code>String</code></dt>
<dd><p>Create VC</p>
</dd>
<dt><a href="#signVC">signVC(tokenVC, sigKeypair)</a> ⇒ <code>String</code></dt>
<dd><p>Sign VC</p>
</dd>
<dt><a href="#verifyVC">verifyVC(vcJson)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the signature/verifier DID is valid and matches the given data in vc_json</p>
</dd>
<dt><a href="#storeVC">storeVC(vcHex, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Store vc hex</p>
</dd>
<dt><a href="#addSignature">addSignature(vcId, sign, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Store vc hex</p>
</dd>
<dt><a href="#updateStatus">updateStatus(vcId, vcStatus, senderAccountKeyPair, api)</a> ⇒ <code>hexString</code></dt>
<dd><p>Update Status</p>
</dd>
<dt><a href="#getVCs">getVCs(vcId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get VCs by VC id</p>
</dd>
<dt><a href="#getVCIdsByDID">getVCIdsByDID(did, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get VC Ids by did</p>
</dd>
<dt><a href="#getDIDByVCId">getDIDByVCId(vcId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get DID by VC Id</p>
</dd>
<dt><a href="#getVCHistoryByVCId">getVCHistoryByVCId(vcId, api)</a> ⇒ <code>String</code></dt>
<dd><p>Get DID by VC Id</p>
</dd>
</dl>

<a name="createTokenVC"></a>

## createTokenVC(TokenVC) ⇒ <code>String</code>
Encodes Token VC and pads with appropriate bytes

**Kind**: global function  
**Returns**: <code>String</code> - Token VC Hex String  

| Param | Type | Description |
| --- | --- | --- |
| TokenVC | <code>Object</code> |  |
| TokenVC.tokenName | <code>String</code> |  |
| TokenVC.reservableBalance | <code>String</code> | In Lowest Form |
| TokenVC.decimal | <code>String</code> |  |
| TokenVC.currencyCode | <code>String</code> |  |

<a name="createMintSlashVC"></a>

## createMintSlashVC(vcProperty) ⇒ <code>String</code>
Encodes Token VC and pads with appropriate bytes

**Kind**: global function  
**Returns**: <code>String</code> - Token VC Hex String  

| Param | Type | Description |
| --- | --- | --- |
| vcProperty | <code>Object</code> |  |
| vcProperty.vcId | <code>String</code> |  |
| vcProperty.currencyId | <code>String</code> |  |
| vcProperty.amount | <code>String</code> | In Lowest Form |

<a name="createTokenTransferVC"></a>

## createTokenTransferVC(vcProperty) ⇒ <code>String</code>
Encodes Token VC and pads with appropriate bytes

**Kind**: global function  
**Returns**: <code>String</code> - Token VC Hex String  

| Param | Type | Description |
| --- | --- | --- |
| vcProperty | <code>Object</code> |  |
| vcProperty.vcId | <code>String</code> |  |
| vcProperty.currencyId | <code>String</code> |  |
| vcProperty.amount | <code>String</code> | In Lowest Form |

<a name="createVC"></a>

## createVC(vcProperty, owner, issuers, vcType, sigKeypair) ⇒ <code>String</code>
Create VC

**Kind**: global function  
**Returns**: <code>String</code> - VC Hex String  

| Param | Type | Description |
| --- | --- | --- |
| vcProperty | <code>Object</code> |  |
| owner | <code>String</code> | Did |
| issuers | <code>Array.&lt;String&gt;</code> | Array of Did |
| vcType | <code>String</code> | TokenVC, MintTokens, SlashTokens, TokenTransferVC |
| sigKeypair | <code>KeyPair</code> | Owner Key Ring pair |

<a name="signVC"></a>

## signVC(tokenVC, sigKeypair) ⇒ <code>String</code>
Sign VC

**Kind**: global function  
**Returns**: <code>String</code> - Signature  

| Param | Type | Description |
| --- | --- | --- |
| tokenVC | <code>Object</code> |  |
| sigKeypair | <code>KeyPair</code> | Issuer Key Ring pair |

<a name="verifyVC"></a>

## verifyVC(vcJson) ⇒ <code>Boolean</code>
Verify if the signature/verifier DID is valid and matches the given data in vc_json

**Kind**: global function  
**Returns**: <code>Boolean</code> - true if valid VC  

| Param | Type |
| --- | --- |
| vcJson | <code>JSON</code> | 

<a name="storeVC"></a>

## storeVC(vcHex, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Store vc hex

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| vcHex | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="addSignature"></a>

## addSignature(vcId, sign, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Store vc hex

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| vcId | <code>String</code> |  | 
| sign | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="updateStatus"></a>

## updateStatus(vcId, vcStatus, senderAccountKeyPair, api) ⇒ <code>hexString</code>
Update Status

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| vcId | <code>String</code> |  | 
| vcStatus | <code>String</code> |  | 
| senderAccountKeyPair | <code>KeyPair</code> |  | 
| api | <code>APIPromise</code> | <code>false</code> | 

<a name="getVCs"></a>

## getVCs(vcId, api) ⇒ <code>String</code>
Get VCs by VC id

**Kind**: global function  
**Returns**: <code>String</code> - (false if not found)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| vcId | <code>String</code> |  | (hex/base64 version works) |
| api | <code>ApiPromise</code> | <code>false</code> |  |

<a name="getVCIdsByDID"></a>

## getVCIdsByDID(did, api) ⇒ <code>String</code>
Get VC Ids by did

**Kind**: global function  
**Returns**: <code>String</code> - (false if not found)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| did | <code>String</code> |  | (hex/base64 version works) |
| api | <code>ApiPromise</code> | <code>false</code> |  |

<a name="getDIDByVCId"></a>

## getDIDByVCId(vcId, api) ⇒ <code>String</code>
Get DID by VC Id

**Kind**: global function  
**Returns**: <code>String</code> - (false if not found)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| vcId | <code>String</code> |  | (hex/base64 version works) |
| api | <code>ApiPromise</code> | <code>false</code> |  |

<a name="getVCHistoryByVCId"></a>

## getVCHistoryByVCId(vcId, api) ⇒ <code>String</code>
Get DID by VC Id

**Kind**: global function  
**Returns**: <code>String</code> - (false if not found)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| vcId | <code>String</code> |  | (hex/base64 version works) |
| api | <code>ApiPromise</code> | <code>false</code> |  |



<a name="utils"></a>

## Other Utilities

### Functions

<dl>
<dt><a href="#bytesToHex">bytesToHex(inputBytes)</a></dt>
<dd></dd>
<dt><a href="#hexToBytes">hexToBytes(inputString)</a></dt>
<dd></dd>
<dt><a href="#base58ToBytes">base58ToBytes(bs58string)</a></dt>
<dd></dd>
<dt><a href="#stringToBytes">stringToBytes(inputString)</a></dt>
<dd></dd>
<dt><a href="#hexToString">hexToString(hexString)</a></dt>
<dd></dd>
<dt><a href="#encodeData">encodeData(data, typeKey)</a> ⇒ <code>String</code></dt>
<dd><p>Encodes object/ string of given type to hex</p>
</dd>
<dt><a href="#decodeHex">decodeHex(hexValue, typeKey)</a> ⇒ <code>Object</code> | <code>String</code></dt>
<dd><p>Decodes hex of given type to it&#39;s corresponding object/value</p>
</dd>
</dl>

<a name="bytesToHex"></a>

## bytesToHex(inputBytes)
**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| inputBytes | <code>Bytes</code> | u8[] |

<a name="hexToBytes"></a>

## hexToBytes(inputString)
**Kind**: global function  

| Param | Type |
| --- | --- |
| inputString | <code>String</code> | 

<a name="base58ToBytes"></a>

## base58ToBytes(bs58string)
**Kind**: global function  

| Param | Type |
| --- | --- |
| bs58string | <code>Base58</code> | 

<a name="stringToBytes"></a>

## stringToBytes(inputString)
**Kind**: global function  

| Param | Type |
| --- | --- |
| inputString | <code>String</code> | 

<a name="hexToString"></a>

## hexToString(hexString)
**Kind**: global function  

| Param | Type |
| --- | --- |
| hexString | <code>Hex</code> | 

<a name="encodeData"></a>

## encodeData(data, typeKey) ⇒ <code>String</code>
Encodes object/ string of given type to hex

**Kind**: global function  
**Returns**: <code>String</code> - Encoded Hex  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> \| <code>String</code> | Object to be encoded |
| typeKey | <code>String</code> | Key from METABLOCKCHAIN_TYPES which represents type of data |

<a name="decodeHex"></a>

## decodeHex(hexValue, typeKey) ⇒ <code>Object</code> \| <code>String</code>
Decodes hex of given type to it's corresponding object/value

**Kind**: global function  
**Returns**: <code>Object</code> \| <code>String</code> - Decoded Object/String  

| Param | Type | Description |
| --- | --- | --- |
| hexValue | <code>String</code> | Hex String to be decoded |
| typeKey | <code>String</code> | Key from METABLOCKCHAIN_TYPES which represents type of data |

