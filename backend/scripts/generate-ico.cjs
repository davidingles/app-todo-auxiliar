const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const svgPath = path.join(__dirname, '..', '..', 'frontend', 'assets', 'favicon.svg');
  const svg = fs.readFileSync(svgPath, 'utf-8');

  const iconSizes = [16, 32, 48, 64, 128, 256];
  const images = [];

  for (const size of iconSizes) {
    const png = await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toBuffer();

    const { data, info } = await sharp(png)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert RGBA to BGRA for ICO
    const bgra = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
      bgra[i] = data[i + 2];     // B
      bgra[i + 1] = data[i + 1]; // G
      bgra[i + 2] = data[i];     // R
      bgra[i + 3] = data[i + 3]; // A
    }

    // BMP info header (40 bytes)
    const infoHeader = Buffer.alloc(40);
    infoHeader.writeUInt32LE(40, 0);
    infoHeader.writeInt32LE(info.width, 4);
    infoHeader.writeInt32LE(info.height * 2, 8);
    infoHeader.writeUInt16LE(1, 12);
    infoHeader.writeUInt16LE(32, 14);
    infoHeader.writeUInt32LE(0, 16);
    infoHeader.writeUInt32LE(bgra.length, 20);
    infoHeader.writeInt32LE(0, 24);
    infoHeader.writeInt32LE(0, 28);
    infoHeader.writeUInt32LE(0, 32);
    infoHeader.writeUInt32LE(0, 36);

    // AND mask
    const andRowSize = Math.ceil(info.width / 32) * 4;
    const andMask = Buffer.alloc(andRowSize * info.height, 0xFF);

    const imageData = Buffer.concat([infoHeader, bgra, andMask]);
    images.push({ data: imageData, width: info.width, height: info.height });
  }

  // Build ICO
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = 6 + count * 16;
  const dirEntries = [];
  const imageDataArr = [];

  for (const img of images) {
    const size = img.data.length;
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(size, 8);
    entry.writeUInt32LE(offset, 12);

    dirEntries.push(entry);
    imageDataArr.push(img.data);
    offset += size;
  }

  const ico = Buffer.concat([header, ...dirEntries, ...imageDataArr]);
  fs.writeFileSync(path.join(__dirname, '..', '..', 'public', 'favicon.ico'), ico);
  console.log('ICO generated successfully!');
}

main().catch(console.error);