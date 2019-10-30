const readme = require('@readme/cloudflare-worker');
const Report = require('@bugsnag/core/report');
const ErrorStackParser = require('error-stack-parser')

let version = 'node';
/* istanbul ignore next */
try {
  version = VERSION;
} catch (e) {} // eslint-disable-line no-empty

addEventListener('fetch', event => {
  event.passThroughOnException();

  event.respondWith(respond(event));
});

async function respond(event) {
  try {
    const { response, har } = await readme.fetchAndCollect(event.request);

    event.waitUntil(readme.metrics('API_KEY', {
      id: response.headers.get('x-readme-id'),
      label: response.headers.get('x-readme-label'),
    }, event.request, har));

    return response;
  } catch(e) {
    const report = new Report(e.name, e.message, ErrorStackParser.parse(e));
    report.updateMetaData('request', {
      method: event.request.method,
      url: event.request.url,
    });
    report.app = {
      id: '@readme/cloudflare-worker',
      version,
    };
    console.log('Sending error to bugsnag', e.name, e.message, ErrorStackParser.parse(e), JSON.stringify(report));

    event.waitUntil(fetch('https://notify.bugsnag.com/', {
      method: 'POST',
      headers: {
        'Bugsnag-Api-Key': 'BUGSNAG_API_KEY',
      },
      body: JSON.stringify({
        notifier: {
          name: '@readme/cloudflare-worker',
          version,
          url: 'https://github.com/readmeio/cloudflare-worker/',
        },
        events: [
          report,
        ],
      }),
    }))
  }
}
