const cheerio = require('cheerio');
const pretty = require('../index');
const fs = require('fs');

it('pretty', () => {
  const string = fs.readFileSync(`${__dirname}/AndroidManifest.xml`, 'utf8');
  const $ = cheerio.load(string, { xmlMode: true });
  expect(pretty($.xml())).toMatchSnapshot();
});
