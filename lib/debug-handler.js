const Report = require('@bugsnag/core/report');
const ErrorStackParser = require('error-stack-parser');

module.exports = (e, event) => {
  const report = new Report(e.name, e.message, ErrorStackParser.parse(e));

  report.updateMetaData('request', {
    method: event.request.method,
    url: event.request.url,
  });

  report.app = {
    id: '@readme/cloudflare-worker',
    version: VERSION || 'node', // eslint-disable-line no-undef
  };

  event.waitUntil(
    fetch('https://notify.bugsnag.com/', {
      method: 'POST',
      headers: {
        'Bugsnag-Api-Key': 'BUGSNAG_API_KEY',
      },
      body: JSON.stringify({
        notifier: {
          name: '@readme/cloudflare-worker',
          version: VERSION || 'node', // eslint-disable-line no-undef
          url: 'https://github.com/readmeio/cloudflare-worker/',
        },
        events: [report],
      }),
    }),
  );
};
