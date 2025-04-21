// Generate PNG icons for the Chrome extension
// Run: node generate-icons.js

const fs = require('fs');
const path = require('path');

// We'll create simple but recognizable PNG icons programmatically
// Using raw PNG encoding (no dependencies needed)

function createPNG(size) {
  // Create a simple canvas-like buffer
  const width = size;
  const height = size;
  const channels = 4; // RGBA
  const pixels = Buffer.alloc(width * height * channels);

  const bgColor = [0, 0, 0, 255]; // Black
  const redColor = [255, 59, 48, 255]; // Oasis red
  const whiteColor = [255, 255, 255, 255];
  const subtleBg = [28, 28, 30, 255]; // bg-subtle

  // Fill background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Rounded corners
      const cornerRadius = Math.floor(size * 0.18);
      const isCorner = isInCorner(x, y, width, height, cornerRadius);
      if (isCorner) {
        pixels[idx] = 0; pixels[idx + 1] = 0; pixels[idx + 2] = 0; pixels[idx + 3] = 0;
      } else {
        pixels[idx] = subtleBg[0]; pixels[idx + 1] = subtleBg[1]; pixels[idx + 2] = subtleBg[2]; pixels[idx + 3] = subtleBg[3];
      }
    }
  }

  // Draw center red dot
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const dotRadius = Math.floor(size * 0.22);
  const outerRadius = Math.floor(size * 0.35);

  // Outer ring
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist >= outerRadius - 1.5 && dist <= outerRadius + 1.5) {
        const idx = (y * width + x) * 4;
        const alpha = Math.max(0, 1 - Math.abs(dist - outerRadius) / 1.5);
        pixels[idx] = redColor[0];
        pixels[idx + 1] = redColor[1];
        pixels[idx + 2] = redColor[2];
        pixels[idx + 3] = Math.floor(alpha * 180);
      }
    }
  }

  // Inner filled circle
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= dotRadius) {
        const idx = (y * width + x) * 4;
        const edgeSmooth = Math.min(1, (dotRadius - dist) / 1.5);
        pixels[idx] = redColor[0];
        pixels[idx + 1] = redColor[1];
        pixels[idx + 2] = redColor[2];
        pixels[idx + 3] = Math.floor(edgeSmooth * 255);
      }
    }
  }

  return encodePNG(width, height, pixels);
}

function isInCorner(x, y, w, h, r) {
  // Check if pixel is outside rounded rectangle
  if (x < r && y < r) {
    return Math.sqrt((x - r) ** 2 + (y - r) ** 2) > r;
  }
  if (x >= w - r && y < r) {
    return Math.sqrt((x - (w - r - 1)) ** 2 + (y - r) ** 2) > r;
  }
  if (x < r && y >= h - r) {
    return Math.sqrt((x - r) ** 2 + (y - (h - r - 1)) ** 2) > r;
  }
  if (x >= w - r && y >= h - r) {
    return Math.sqrt((x - (w - r - 1)) ** 2 + (y - (h - r - 1)) ** 2) > r;
  }
  return false;
}

function encodePNG(width, height, pixels) {
  const zlib = require('zlib');

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // No filter
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // Build chunks
  function makeChunk(type, data) {
    const typeBuffer = Buffer.from(type, 'ascii');
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);

    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = crc32(crcData);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc, 0);

    return Buffer.concat([length, typeBuffer, data, crcBuffer]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 for PNG
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate all sizes
const sizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

sizes.forEach(size => {
  const png = createPNG(size);
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, png);
  console.log(`Generated ${filePath} (${png.length} bytes)`);
});

console.log('All icons generated!');
