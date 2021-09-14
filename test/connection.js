const assert = require('assert');
const { buildConnection } = require('../src/connection.js');
const sinon = require('sinon');

describe('Connection module works correctly', () => {
  it('Websocket is connected succesfully', async () => {
    //Create two websocket connections, a new connections should be created only once
    //check for console log of new websocket being created - maybe there is a better way to test this?
    const spy = sinon.spy(console, 'log');
    const ws1 = await buildConnection('testnet');
    const ws2 = await buildConnection('testnet');
    assert(spy.calledWith('Creating new websocket connection!'));
    sinon.assert.calledOnce(spy);
    spy.restore();
  });

  it('Websocket is connected succesfully with ignorecache flag', async () => {
    const spy = sinon.spy(console, 'log');
    const ws1 = await buildConnection('testnet', true);
    const ws2 = await buildConnection('testnet', true);
    assert(spy.calledWith('Creating new websocket connection!'));
    sinon.assert.calledTwice(spy);
    spy.restore();
  });
});
