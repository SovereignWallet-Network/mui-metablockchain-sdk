const assert = require('assert');
const utils = require('../src/utils.js');

describe('Utils Module works correctly', () => {
  it('Hex to string works as expected', async () => {
    assert.equal(utils.hexToString('0x6469643a737369643a6d6574616d756900000000000000000000000000000000'), 'did:ssid:metamui');
  });
});
