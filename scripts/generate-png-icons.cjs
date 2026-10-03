const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const chunkCrc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(chunkCrc, 8 + len);
  return buf;
}

function createPng(width, height, isMaskable = false) {
  // Generate RGBA buffer
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pOffset = rowOffset + 1 + x * 4;
      const nx = (x - cx) / (width / 2);
      const ny = (y - cy) / (height / 2);
      const dist = Math.sqrt(nx * nx + ny * ny);

      // Squircle background corner radius
      const squircle = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);

      let r = 9, g = 9, b = 11, a = 255;

      if (!isMaskable && squircle > 1.05) {
        a = 0; // Transparent outside rounded icon
      } else {
        // Gradient base: Cyan #06b6d4 to Indigo #4f46e5
        const t = (x + y) / (width + height);
        const gradR = Math.round(6 * (1 - t) + 79 * t);
        const gradG = Math.round(182 * (1 - t) + 70 * t);
        const gradB = Math.round(212 * (1 - t) + 229 * t);

        if (squircle < 0.75) {
          // Central dark plate
          r = 14; g = 14; b = 18;
          
          // Fountain pen nib silhouette in center
          const nyCentered = (y - cy * 0.95) / (height * 0.35);
          const nxCentered = Math.abs(x - cx) / (width * 0.35);

          // Triangular pen tip
          if (nyCentered > -0.8 && nyCentered < 0.6) {
            const maxW = nyCentered < 0 ? (nyCentered + 0.8) * 0.75 : 0.6;
            if (nxCentered < maxW) {
              // Silver-white nib body
              r = 240; g = 245; b = 255;
              
              // Breather hole
              const dHole = Math.sqrt(Math.pow(nxCentered, 2) + Math.pow(nyCentered - 0.1, 2));
              if (dHole < 0.12) {
                r = 14; g = 14; b = 18;
              }
              // Central slit line
              if (nxCentered < 0.025 && nyCentered < 0.1) {
                r = 14; g = 14; b = 18;
              }
              // Cyan band
              if (nyCentered > 0.4 && nyCentered < 0.5) {
                r = 6; g = 182; b = 212;
              }
            }
          }
        } else {
          // Border gradient
          r = gradR; g = gradG; b = gradB;
        }
      }

      rawData[pOffset] = r;
      rawData[pOffset + 1] = g;
      rawData[pOffset + 2] = b;
      rawData[pOffset + 3] = a;
    }
  }

  // PNG Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter method
  ihdr[12] = 0; // Interlace: None
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), createPng(192, 192));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), createPng(512, 512));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), createPng(180, 180));
console.log('PNG PWA icons created successfully in /public!');
