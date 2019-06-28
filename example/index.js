const fs = require('fs');
const ParserStream = require('../src');

const parseXML = async () => {
  const readStream = fs
    .createReadStream('./mocks/sample.xml')
    .pipe(new ParserStream());

  return new Promise((resolve, reject) => {
    readStream.on('data', json => {
      resolve(json);
    });
    readStream.on('error', error => {
      reject(error);
    });
  });
};

const getJson = async () => {
  try {
    const json = await parseXML();

    console.log(JSON.stringify(json, null, 2));

    return json;
  } catch (err) {
    console.error(err);
  }
};

getJson();
