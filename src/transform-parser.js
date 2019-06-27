const fs = require('fs');
const stream = require('stream');
const util = require('util');

const parser = require('fast-xml-parser');
const he = require('he');
const camelcaseKeys = require('camelcase-keys');

class ParserStream extends stream.Transform {
  constructor({ xmlParsingOptions, camelfyJson }) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    });

    this.bufferList = {
      list: [],
      length: 0,
    };
    this.xml = '';
    this.json = null;

    // Defaults
    this.xmlParsingOptions = {
      attributeNamePrefix: '',
      attrNodeName: 'attributes',
      textNodeName: 'value',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: true,
      parseNodeValue: false,
      parseAttributeValue: false,
      trimValues: true,
      cdataPositionChar: '\\c',
      parseTrueNumberOnly: true,
    };
    this.camelfyJson = camelfyJson || true;
  }

  /**
   * Handles the bytes being written where we add chunks to the bufferList.
   *
   * @param {Buffer} chunk - The chunk to be transformed.
   * @param {string} encoding - If the chunk is a string, this will be the encoding type.
   * @param {function} next - Callback function to be called after the chunk has been processed.
   */
  _transform(chunk, encoding, next) {
    if (typeof chunk === 'string') {
      this.xml += chunk;
    } else {
      this.bufferList.list.push(chunk);
      this.bufferList.length = this.bufferList.length + chunk.length;
    }

    next();
  }

  /**
   * Called before the stream closes, delaying the 'finish' event until
   * the completed callback is called. We close up resources by reseting
   * the buffer and write the buffered data to wherever it needs to go.
   *
   * @param {function} callback - Called when we've finished writing any remaining data
   */
  _final(completed) {
    if (this.xml === '') {
      const buffer = Buffer.concat(
        this.bufferList.list,
        this.bufferList.length,
      );
      this.xml = buffer.toString();
    }

    const formattedXML = this._formatXML(this.xml);

    try {
      this.json = this._parseXMLtoJSON(formattedXML);
      this.push(JSON.stringify(this.json));
    } catch (err) {
      this.emit('error', err);
    }

    this._reset();

    completed();
  }

  _parseXMLtoJSON(xml) {
    if (!parser.validate(xml)) {
      this.emit('error', new Error('XML is invalid'));
    }

    try {
      const parsingOptions = this.xmlParsingOptions;
      const parsedJson = parser.parse(xml, parsingOptions);

      const json = this.camelfyJson
        ? camelcaseKeys(parsedJson, { deep: true })
        : parsedJson;

      return json;
    } catch (error) {
      this.emit('error', new Error('Failed to Parse XML'));
    }
  }

  _formatXML() {
    return this.xml
      .replace(/>\s*</g, '><') // Removes white spaces between elements
      .replace(/>\s*/g, '>') // Removes any white spaces at the end of the xml string
      .replace(/\s*</g, '<'); // Removes any white spaces left at the beginning of the xml string
  }

  _reset() {
    this.bufferList.list = [];
    this.bufferList.length = 0;
    this.xml = '';
    this.json = null;
  }
}

module.exports = ParserStream;
