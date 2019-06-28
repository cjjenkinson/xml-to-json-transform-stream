# XML to JSON parser transform stream

Extends Node's Stream Transform to parse XML to JSON

## Usage

Using the parser transform is as simple as passing a new instance of the ParserStream to a readable stream through the `.pipe` method.

#### Camelfy JSON

Create new parser stream to pipe a readable stream:

```javascript
const pptions = {
  camelfyJson: true,
};

const parseStream = new ParserStream(options);
```

### File System Read Streams

```javascript
const fs = require('fs');
const ParserStream = require('../src');

const parseXML = async () => {
  const readStream = fs
    .createReadStream('path-to-xml-file.xml')
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

    return json;
  } catch (err) {
    // throw
  }
};
```

### S3 Object Read Stream

```javascript
const parseS3GetObjectRead = async (record) => {
  const parseStream = new ParserStream();

  const { bucket, key } = record.s3;

  const stream = S3.getObject({ Bucket: bucket, Key: key }).createReadStream().pipe(parseStream);

  return new Promise((resolve, reject) => {
    stream.on('data', (json) => {
      resolve(json);
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

const parsedJSON = await parseS3GetObjectRead(event.Records[0]);
```
