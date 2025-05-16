// prepare-for-vercel.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
import archiver from 'archiver';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a file to stream archive data to
const output = createWriteStream(path.join(__dirname, 'vercel-deploy.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Archive created: ${archive.pointer()} total bytes`);
  console.log('Archive has been finalized and the output file descriptor has been closed.');
});

// Good practice to catch warnings
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Good practice to catch errors
archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add essential files
const essentialFiles = [
  'index.html',
  'package.json',
  'vite.config.js',
  'vercel.json',
  'tailwind.config.js',
  'postcss.config.js',
  '.env',
  'README.md'
];

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
  }
});

// Add src directory
archive.directory(path.join(__dirname, 'src'), 'src');

// Add public directory if it exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  archive.directory(publicDir, 'public');
}

// Finalize the archive
archive.finalize();
