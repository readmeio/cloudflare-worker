const path = require('path');
const fs = require('fs');

const template = fs.readFileSync(path.join(__dirname, './dist/main.js'), 'utf8');

module.exports = function compile(apiKey, bugsnagApiKey) {
  if (!apiKey) throw new Error('Must provide an apiKey');
  if (!bugsnagApiKey) throw new Error('Must provide an bugsnagApiKey');

  return template
    .replace('API_KEY', apiKey)
    .replace('BUGSNAG_API_KEY', bugsnagApiKey);
};

if (require.main === module) {
  console.log(module.exports(...process.argv.slice(2)))
}
