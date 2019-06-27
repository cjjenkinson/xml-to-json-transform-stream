#

## Usage

### Options

#### XML Parsing Options

#### Camelfy JSON

Create new parser stream to pipe a readable stream:

```javascript
const pptions = {
  xmlParsingOptions: {},
  camelfyJson: true,
};

const parseStream = new ParserStream(options);
```

### Node Streams

### S3 Object Reads

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
