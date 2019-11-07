const readme = require('@readme/cloudflare-worker');
const Report = require('@bugsnag/core/report');
const ErrorStackParser = require('error-stack-parser')
const matchRouteWhitelist = require('./lib/cloudflare-routing.js');

addEventListener('fetch', event => {
  event.passThroughOnException();


  try {
    if (matchRouteWhitelist(event.request.url)) {
      event.respondWith(respond(event));
    }  else {
      event.respondWith(fetch(event.request));
    }
  } catch (e) {
    const report = new Report(e.name, e.message, ErrorStackParser.parse(e));
    report.updateMetaData('request', {
      method: event.request.method,
      url: event.request.url,
    });
    report.app = {
      id: '@readme/cloudflare-worker',
    };
    console.log('Sending error to bugsnag', e.name, e.message, ErrorStackParser.parse(e), JSON.stringify(report));

    event.waitUntil(fetch('https://notify.bugsnag.com/', {
      method: 'POST',
      headers: {
        'Bugsnag-Api-Key': '',
      },
      body: JSON.stringify({
        notifier: {
          name: '@readme/cloudflare-worker',
          url: 'https://github.com/readmeio/cloudflare-worker/',
        },
        events: [
          report,
        ],
      }),
    })
    .catch(e => {
      console.log('FETCHING ERROR');
      console.log(e);
    })
  )

 }

});

async function respond(event) {
  const { response, har } = await readme.fetchAndCollect(event.request);

  event.waitUntil(readme.metrics('', {
    id: response.headers.get('x-readme-id'),
    label: response.headers.get('x-readme-label'),
  }, event.request, har));

  return response;
}
