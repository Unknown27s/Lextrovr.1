import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';
import pako from 'pako';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Reading transformed dictionary...');
const transformedPath = path.join(__dirname, '../src/data/dictionary_api_format.json.gz');
const compressedData = fs.readFileSync(transformedPath);
const decompressed = pako.inflate(compressedData, { to: 'string' });
const words = JSON.parse(decompressed);

console.log('Creating optimized indexed format...');

// Create an index: word -> array position
// This allows binary search and O(1) lookup
const index = {};
const wordList = [];

words.forEach((wordData, idx) => {
    index[wordData.word.toLowerCase()] = idx;
    wordList.push(wordData.word);
});

const indexedData = {
    version: 1,
    totalWords: words.length,
    words: words,
    index: index,
    wordList: wordList,
    buildDate: new Date().toISOString()
};

console.log('Compressing indexed dictionary...');
const jsonData = JSON.stringify(indexedData);
const compressed = gzipSync(jsonData, { level: 9 });

const indexedPath = path.join(__dirname, '../src/data/dictionary_indexed.json.gz');
fs.writeFileSync(indexedPath, compressed);

const compressedSize = fs.statSync(indexedPath).size;

console.log(`✓ Index creation complete`);
console.log(`  Total words:    ${words.length}`);
console.log(`  Index entries:  ${Object.keys(index).length}`);
console.log(`  File size:      ${(compressedSize / 1024 / 1024).toFixed(2)} MB (gzipped)`);
console.log(`  Output file:    ${indexedPath}`);
