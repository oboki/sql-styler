const format = require('./sql-styler.js');

const fs = require('fs');
const path = require('path');
const loadedSql = fs.readFileSync(path.resolve(__dirname, 'sample.sql')).toString();

const refinedSql = loadedSql.replace(
    /--(.*)/g, '/* $1 */'
).replace(
    /(\r\n|\r|\n)/g, ' '
).replace(
    /\s+/g, ' '
);

console.log(format(refinedSql));