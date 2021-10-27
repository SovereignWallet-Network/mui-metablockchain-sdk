const assert = require('assert');
const utils = require('../src/utils.js');

describe('Utils Module works correctly', () => {
  it('Hex to string works as expected', async () => {
    assert.equal(utils.hexToString('0x6469643a737369643a6d6574616d756900000000000000000000000000000000'), 'did:ssid:metamui');
  });

  it('should encode and decode data correctly', async () => {
    let expectedHex = '0x8fcc460fd98b54c132cdcaed7d6d8a6026b42c8a39b916635738293e39246e916469643a737369643a726f636b65740000000000000000000000000000000000086469643a737369643a73776e00000000000000000000000000000000000000006469643a737369643a6576650000000000000000000000000000000000000000048caf7f9e8f5f3e318c0674b2b5b5c4a3b6b776220b4a991060ce2a5245bd0a513c154f1433364f085382561f26aeb30251ac73b110bcc75e8eb6e19e8cab9a80000074657374000000000000000000000000e8030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    let expectedObject = JSON.parse('{"hash":"0x8fcc460fd98b54c132cdcaed7d6d8a6026b42c8a39b916635738293e39246e91","owner":"0x6469643a737369643a726f636b65740000000000000000000000000000000000","issuers":["0x6469643a737369643a73776e0000000000000000000000000000000000000000","0x6469643a737369643a6576650000000000000000000000000000000000000000"],"signatures":["0x8caf7f9e8f5f3e318c0674b2b5b5c4a3b6b776220b4a991060ce2a5245bd0a513c154f1433364f085382561f26aeb30251ac73b110bcc75e8eb6e19e8cab9a80"],"is_vc_used":false,"vc_type":"TokenVC","vc_property":"0x74657374000000000000000000000000e8030000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"}');
    let actualHex = utils.encodeObject(expectedObject, 'VC');
    let actualObject = utils.decodeHex(actualHex, 'VC');
    assert.strictEqual(actualHex, expectedHex);
    assert.deepEqual(actualObject, expectedObject);
  })
});
