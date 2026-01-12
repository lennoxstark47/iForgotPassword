const fs = require('fs');
const path = require('path');

// Simple PNG creation function
function createSimplePNG(size) {
  // Create a minimal valid PNG file (1x1 transparent pixel)
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const width = size;
  const height = size;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = createChunk('IHDR', ihdrData);

  // Create image data (all purple/indigo gradient)
  const scanlineSize = 1 + (width * 4); // 1 filter byte + RGBA per pixel
  const imageDataSize = scanlineSize * height;
  const imageData = Buffer.alloc(imageDataSize);

  for (let y = 0; y < height; y++) {
    const offset = y * scanlineSize;
    imageData[offset] = 0; // No filter

    for (let x = 0; x < width; x++) {
      const pixelOffset = offset + 1 + (x * 4);
      // Gradient from indigo to purple
      const ratio = y / height;
      imageData[pixelOffset] = Math.floor(79 + ratio * (124 - 79));     // R
      imageData[pixelOffset + 1] = Math.floor(70 + ratio * (58 - 70));  // G
      imageData[pixelOffset + 2] = Math.floor(229 + ratio * (237 - 229)); // B
      imageData[pixelOffset + 3] = 255; // A (fully opaque)
    }
  }

  // Compress image data (we'll use uncompressed for simplicity, just add zlib header/footer)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(imageData);

  const idat = createChunk('IDAT', compressed);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');

  // Calculate CRC
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(calculateCRC(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function calculateCRC(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
  }
  return crc ^ 0xFFFFFFFF;
}

// Generate icons
const assetsDir = path.join(__dirname, 'src', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const png = createSimplePNG(size);
  const filename = path.join(assetsDir, `icon-${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
});

console.log('All icons generated successfully!');
