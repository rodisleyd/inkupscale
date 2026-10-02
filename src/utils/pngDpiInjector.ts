/**
 * Injects 300 / 600 DPI metadata into a PNG DataURL or ArrayBuffer via standard pHYs chunk.
 */

// CRC table for PNG chunk checksum calculation
const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function updateCrc(crc: number, buf: Uint8Array): number {
  let c = crc ^ -1;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ -1) >>> 0;
}

export function setPngDpi(dataUrl: string, dpi: number = 300): string {
  try {
    // Decode base64
    const base64Parts = dataUrl.split(',');
    const header = base64Parts[0];
    const byteString = atob(base64Parts[1]);
    const len = byteString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }

    // Check PNG signature: 137 80 78 71 13 10 26 10
    if (
      bytes[0] !== 0x89 ||
      bytes[1] !== 0x50 ||
      bytes[2] !== 0x4e ||
      bytes[3] !== 0x47
    ) {
      return dataUrl; // Not a PNG
    }

    // 1 inch = 0.0254 meters
    const ppm = Math.round(dpi / 0.0254); // e.g. 11811 for 300 DPI

    // pHYs chunk length = 9 bytes (4 bytes X, 4 bytes Y, 1 byte unit (1 = meters))
    const physChunk = new Uint8Array(21);
    const view = new DataView(physChunk.buffer);

    // Length (9)
    view.setUint32(0, 9);
    // Chunk type "pHYs"
    physChunk[4] = 0x70; // 'p'
    physChunk[5] = 0x48; // 'H'
    physChunk[6] = 0x59; // 'Y'
    physChunk[7] = 0x73; // 's'

    // Pixels per unit X
    view.setUint32(8, ppm);
    // Pixels per unit Y
    view.setUint32(12, ppm);
    // Unit specifier: 1 = meter
    physChunk[16] = 1;

    // CRC of chunk type + data
    const crc = updateCrc(0, physChunk.subarray(4, 17));
    view.setUint32(17, crc);

    // The pHYs chunk should appear immediately after IHDR chunk
    // PNG signature is 8 bytes. IHDR is length(4) + type(4) + data(13) + crc(4) = 25 bytes.
    // Total 33 bytes.
    const insertPos = 33;

    const newBytes = new Uint8Array(bytes.length + physChunk.length);
    newBytes.set(bytes.subarray(0, insertPos), 0);
    newBytes.set(physChunk, insertPos);
    newBytes.set(bytes.subarray(insertPos), insertPos + physChunk.length);

    // Re-encode to base64
    let binary = '';
    const chunk = 8192;
    for (let i = 0; i < newBytes.length; i += chunk) {
      binary += String.fromCharCode.apply(
        null,
        Array.from(newBytes.subarray(i, i + chunk))
      );
    }
    return `${header},${btoa(binary)}`;
  } catch (err) {
    console.warn('Failed to inject DPI into PNG, returning original:', err);
    return dataUrl;
  }
}
