const fs = require('fs');

const visitorAs = fs.readFileSync(
  './node_modules/visitor-as/as/index.js',
  'utf8'
);
fs.writeFileSync(
  './node_modules/visitor-as/as/index.js',
  visitorAs.replace('assemblyscript/cli/asc', 'assemblyscript/dist/asc')
);
