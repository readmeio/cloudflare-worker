/* eslint-env mocha */
const sinon = require('sinon');
const sendBugsnagError = require('../../src/lib/debug-handler.js');
const globals = require('../service-worker-globals');

describe('debug-handler()', () => {
  beforeEach(() => {
    Object.assign(global, globals());
  });

  it('should cover the version branch', async () => {
    const err = new Error('Temp Err');
    const event = {
      request: {
        method: 'POST',
        url: 'http://localhost',
      },
      waitUntil: sinon.spy(),
    };

    await sendBugsnagError(err, event);
    sinon.assert.calledOnce(event.waitUntil);
  });

  it('call the waituntil method on event argument', async () => {
    global.VERSION = '2.0.0';
    const err = new Error('Temp Err');
    const event = {
      request: {
        method: 'POST',
        url: 'http://localhost',
      },
      waitUntil: sinon.spy(),
    };

    await sendBugsnagError(err, event);
    sinon.assert.calledOnce(event.waitUntil);
  });
});
