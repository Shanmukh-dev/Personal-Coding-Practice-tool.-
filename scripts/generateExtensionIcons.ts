import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Pure Node.js PNG generator for crisp Omega icons
function createPng(width: number, height: number, rgbaBuffer: Buffer): Buffer {
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crc]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const scanlines: Buffer[] = [];
  for (let y = 0; y < height; y++) {
    scanlines.push(Buffer.from([0])); // filter byte None
    const row = rgbaBuffer.subarray(y * width * 4, (y + 1) * width * 4);
    scanlines.push(row);
  }
  const idatData = zlib.deflateSync(Buffer.concat(scanlines));

  return Buffer.concat([
    header,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Generate Omega Logo Badge (Dark background #0b1326, rounded corners, light omega #dae2fd)
function renderOmegaIcon(size: number): Buffer {
  const buf = Buffer.alloc(size * size * 4, 0);

  const bgR = 11, bgG = 19, bgB = 38; // #0b1326
  const borderR = 51, borderG = 65, borderB = 85; // #334155
  const fgR = 218, fgG = 226, fgB = 253; // #dae2fd
  const radius = Math.max(2, Math.round(size * 0.16));

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Rounded rect boundary check
      let inRect = true;
      let isBorder = false;

      const dx = Math.min(x, size - 1 - x);
      const dy = Math.min(y, size - 1 - y);

      if (dx < radius && dy < radius) {
        const cornerDist = Math.hypot(radius - dx, radius - dy);
        if (cornerDist > radius) {
          inRect = false;
        } else if (cornerDist > radius - 1.5) {
          isBorder = true;
        }
      } else if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
        isBorder = true;
      }

      if (!inRect) {
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Default background color
      buf[idx] = isBorder ? borderR : bgR;
      buf[idx + 1] = isBorder ? borderG : bgG;
      buf[idx + 2] = isBorder ? borderB : bgB;
      buf[idx + 3] = 255;

      // Draw Omega (Ω) symbol mathematically
      // Center of icon
      const cx = (size - 1) / 2;
      const cy = (size - 1) / 2 + size * 0.03;
      const scale = size / 32;

      const relX = (x - cx) / scale;
      const relY = (y - cy) / scale;

      // Circle part of Omega: center (0, -1.5), outer radius ~9, inner radius ~6
      const distFromCircle = Math.hypot(relX, relY + 1.5);
      const angle = Math.atan2(relY + 1.5, relX); // -pi to pi

      let isOmega = false;

      // Upper arch of Omega: from ~50 deg to ~130 deg down
      if (distFromCircle <= 8.8 && distFromCircle >= 5.6 && (angle < 0.65 || angle > 2.49 || relY < 3.2)) {
        isOmega = true;
      }

      // Feet / base curls of Omega:
      // Left foot: relX between -9.5 and -4.5, relY between 5.2 and 7.8
      if (relX >= -9.8 && relX <= -4.2 && relY >= 5.0 && relY <= 7.8) {
        isOmega = true;
      }
      // Right foot: relX between 4.5 and 9.5, relY between 5.2 and 7.8
      if (relX >= 4.2 && relX <= 9.8 && relY >= 5.0 && relY <= 7.8) {
        isOmega = true;
      }
      // Left upward neck
      if (relX >= -6.8 && relX <= -4.2 && relY >= 1.5 && relY <= 6.2) {
        isOmega = true;
      }
      // Right upward neck
      if (relX >= 4.2 && relX <= 6.8 && relY >= 1.5 && relY <= 6.2) {
        isOmega = true;
      }

      if (isOmega) {
        buf[idx] = fgR;
        buf[idx + 1] = fgG;
        buf[idx + 2] = fgB;
        buf[idx + 3] = 255;
      }
    }
  }

  return createPng(size, size, buf);
}

const iconsDir = path.join(process.cwd(), 'extension', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach((size) => {
  const png = renderOmegaIcon(size);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated ${outPath} (${png.length} bytes)`);
});

// Also create SVG copy
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <rect width="100" height="100" rx="16" fill="#0b1326" stroke="#334155" stroke-width="3"/>
  <text 
    x="50" 
    y="54" 
    font-family="Lora, Georgia, 'Times New Roman', serif" 
    font-weight="bold" 
    font-size="68" 
    text-anchor="middle" 
    dominant-baseline="central" 
    fill="#dae2fd"
  >Ω</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent, 'utf8');
console.log('Generated extension/icons/icon.svg');
