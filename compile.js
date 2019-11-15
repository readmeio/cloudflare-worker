const path = require('path');
const fs = require('fs');

const template = fs.readFileSync(path.join(__dirname, './dist/main.js'), 'utf8');

module.exports = function compile(bugsnagApiKey) {
  if (!bugsnagApiKey) throw new Error('Must provide an bugsnagApiKey');

  return template.replace('BUGSNAG_API_KEY', bugsnagApiKey);
};
