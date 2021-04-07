// const assert = require('assert');
// const token = require('../src/token.js');
// const { initKeyring } = require('../src/config');
// const { buildConnection } = require('../src/connection.js');
// const constants = require('./test_constants');
// const { expect } = require('chai');

// describe('Token Module works correctly', () => {
//   let sigKeypairWithBal = null;
//   let sigKeypairWithoutBal = null;
//   let provider = null;
//   let from = null;
//   before(async () => {
//     const keyring = await initKeyring();
//     provider = await buildConnection('dev');
//     sigKeypairWithBal = await keyring.addFromUri(constants.mnemonicWithBalance);
//     sigKeypairWithoutBal = await keyring.addFromUri('//Test123');
//     from = sigKeypairWithBal.address;
//   });

//   // expensive operation to run continously!
//     // it('Token Issuance works correctly', async () => {
//     //   const transfer = await token.issueNewToken(
//     //     'did:ssid:swn2',
//     //     '1',
//     //     'XYZ',
//     //     '100',
//     //     sigKeypairWithBal,
//     //     provider
//     //   );
//     //   assert.doesNotReject(transfer);
//     // });

//   it('Token balance fetch works correctly', async () => {
//     //  Alice is expected in the test chain
//     const data = await token.getTokenBalance('did:ssid:swn2', '1');
//     assert.doesNotReject(data);
//   });

//   it('Token balance fetch works correctly for non existing tokens', async () => {
//     //  Alice is expected in the test chain
//     const data = await token.getTokenBalance('did:ssid:swn2', '990');
//     assert.doesNotReject(data);
//   });

//   it('Token name fetch works for existing tokens', async () => {
//     // token 1 is expected to be xyz on dev chain
//     const data = await token.getTokenNameFromTokenId('1');
//     assert.strictEqual(data, 'XYZ');
//   });

//   it('Token name fetch returns null for non existing tokens', async () => {
//     // token 785 is not expected to be xyz on dev chain
//     const data = await token.getTokenNameFromTokenId('785');
//     assert.strictEqual(data, null);
//   });

//   it('Token list fetch returns correctly', async () => {
//     // atleast one token expected on chain for this test to pass
//     const data = await token.getTokenList();
//     expect(data).to.have.length.above(0);
//     data.forEach(item => {
//       expect(item).to.haveOwnProperty('id');
//       expect(item).to.haveOwnProperty('name');
//     })
//   });

//   it('Token supply works correctly', async () => {
//     // tokenID one is expected to have some balance
//     const data = await token.getTokenTotalSupply('1');
//     expect(parseInt(data)).to.be.greaterThan(0);

//     // random tokenID -- not expected to be on chain
//     const data2 = await token.getTokenTotalSupply('123456');
//     assert.strictEqual(parseInt(data2), 0);
//   });

//   it('Withdraw from treasury works correctly', async () => {
//     // this account is expected to have created a token and have reserved balance
//     const to = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
//     const data = await token.withdrawTreasuryReserve(from, to, '1', sigKeypairWithBal, provider);
//     assert.doesNotReject(data);
//   });
// });
