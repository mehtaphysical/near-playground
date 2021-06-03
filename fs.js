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
      ...getFiles('./node_modules/near-sdk-as', 'node_modules/near-sdk-as'),
      ...getFiles('./node_modules/near-sdk-core', 'node_modules/near-sdk-core'),
      ...getFiles(
        './node_modules/near-sdk-bindgen',
        'node_modules/near-sdk-bindgen'
      ),
      ...getFiles('./node_modules/near-mock-vm', 'node_modules/near-mock-vm'),
      ...getFiles('./node_modules/as-bignum', 'node_modules/as-bignum'),
      ...getFiles(
        './node_modules/assemblyscript-temporal',
        'node_modules/assemblyscript-temporal'
      ),
      ...getFiles(
        './node_modules/assemblyscript-regex',
        'node_modules/assemblyscript-regex'
      ),
      ...getFiles(
        './node_modules/assemblyscript-json',
        'node_modules/assemblyscript-json'
      ),
    },
    null,
    2
  )
);
