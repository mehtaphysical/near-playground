const fs = require('fs');

const getFiles = (dir, dirKey = '') => {
  const files = fs.readdirSync(dir, { encoding: 'utf-8' });

  return files
    .filter((file) => !file.includes('git'))
    .reduce((acc, file) => {
      const filePath = `${dirKey}/${file}`;
      if (fs.statSync(`${dir}/${file}`).isDirectory()) {
        return { ...acc, ...getFiles(`${dir}/${file}`, filePath) };
      } else {
        return {
          ...acc,
          [filePath]: fs.readFileSync(`${dir}/${file}`, 'utf-8'),
        };
      }
    }, {});
};

// console.log(getFiles('../../near-sdk-as'));
fs.writeFileSync(
  './src/fs.json',
  JSON.stringify(
    {
      ...getFiles('../../near-sdk-as/sdk', 'node_modules/near-sdk-as'),
      ...getFiles('../../near-sdk-as/sdk-core', 'node_modules/near-sdk-core'),
      ...getFiles('../../near-sdk-as/bindgen', 'node_modules/near-sdk-bindgen'),
      ...getFiles(
        '../../near-sdk-as/near-mock-vm',
        'node_modules/near-mock-vm'
      ),
      ...getFiles(
        '../../near-sdk-as/node_modules/as-bignum',
        'node_modules/as-bignum'
      ),
      ...getFiles(
        '../../near-sdk-as/node_modules/assemblyscript-temporal',
        'node_modules/assemblyscript-temporal'
      ),
      ...getFiles(
        '../../near-sdk-as/node_modules/assemblyscript-regex',
        'node_modules/assemblyscript-regex'
      ),
      ...getFiles(
        '../../near-sdk-as/node_modules/assemblyscript-json',
        'node_modules/assemblyscript-json'
      ),
    },
    null,
    2
  )
);
