const assert = require('assert');
const utils = require('../src/utils.js');

describe('Utils Module works correctly', () => {
  it('Hex to string works as expected', async () => {
    assert.equal(utils.hexToString('0x6469643a737369643a7374616e6c790000000000000000000000000000000000'), 'did:ssid:stanly');
  });
});
