import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.join(__dirname, '../src/data/dictionary_classified.json');
const outputPath = path.join(__dirname, '../src/data/dictionary_classified.json.gz');

console.log('Reading dictionary...');
const jsonData = fs.readFileSync(inputPath, 'utf-8');

console.log('Compressing with Gzip...');
const compressed = gzipSync(jsonData, { level: 9 });

console.log('Writing compressed file...');
fs.writeFileSync(outputPath, compressed);

const originalSize = fs.statSync(inputPath).size;
const compressedSize = fs.statSync(outputPath).size;
const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

console.log(`✓ Compression complete`);
console.log(`  Original:   ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Reduction:  ${reduction}%`);

// Also remove unclassified dictionary
const unclassifiedPath = path.join(__dirname, '../src/data/dictionary.json');
if (fs.existsSync(unclassifiedPath)) {
    fs.unlinkSync(unclassifiedPath);
    console.log(`✓ Removed dictionary.json (21.42 MB saved)`);
}
