const readme = require('@readme/cloudflare-worker');
const matchRouteWhitelist = require('./lib/cloudflare-routing.js');
const sendBugsnagError = require('./lib/debug-handler.js');

addEventListener('fetch', event => {
  event.passThroughOnException();

  if (matchRouteWhitelist(event.request.url)) {
    event.respondWith(respond(event));
  } else {
    event.respondWith(fetch(event.request));
  }
});

async function respond(event) {
  try {
    const { response, har } = await readme.fetchAndCollect(event.request);

    event.waitUntil(
      readme.metrics(
        INSTALL_OPTIONS.token,
        {
          id: response.headers.get('x-readme-id'),
          label: response.headers.get('x-readme-label'),
        },
        event.request,
        har,
      ),
    );

    return response;
  } catch (e) {
    return sendBugsnagError(e, event);
  }
}
