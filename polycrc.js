/*

 https://en.wikipedia.org/wiki/Cyclic_redundancy_check

 Copyright (c) 2018 Vladimir Latyshev

 License: MIT

 Algorithms ported from https://pycrc.org/

*/

class CRC {
  constructor(width, poly, xor_in, xor_out, reflect) {
    this.width = width
    this.poly = poly
    this.xor_in = xor_in
    this.reflected_xor_in = mirror(xor_in, width)
    this.xor_out = xor_out
    this.reflect = reflect
    this.msb_mask = 1 << (this.width - 1)
    this.mask = ((this.msb_mask - 1) << 1) | 1
    this.crc_shift = this.width < 8 ? 8 - this.width : 0
    this.shifted_xor_in = this.xor_in << this.crc_shift

    let table = this.gen_table()
    this.table = table

    if (this.width === 8 && !this.xor_in && !this.xor_out && !this.reflect) {
      this.calculate = function (buffer) {
        buffer = validate_buffer(buffer)
        let crc = 0
        for (let i = 0; i < buffer.length; i++)
          crc = table[crc ^ buffer[i]]
        return crc
      }
    }
  }

  calculate(buffer) {
    buffer = validate_buffer(buffer)
    let crc
    let {table, width, crc_shift,mask} = this
    if (this.reflect) {
      crc = this.reflected_xor_in
      for (let i = 0; i < buffer.length; i++) {
        let byte = buffer[i]
        crc = (table[(crc ^ byte) & 0xff] ^ crc >>> 8) & mask
      }
    } else {
      crc = this.shifted_xor_in
      for (let i = 0; i < buffer.length; i++) {
        crc = table[((crc >> (width - 8 + crc_shift)) ^ buffer[i]) & 0xff] << crc_shift
          ^ crc << (8 - crc_shift)
          & mask << crc_shift
      }
      crc >>= crc_shift
    }
    crc ^= this.xor_out
    return crc >>> 0
  }

  calculate_no_table(buffer) {
    buffer = validate_buffer(buffer)
    let crc = this.xor_in
    for (let i = 0; i < buffer.length; i++) {
      let octet = buffer[i]
      if (this.reflect) octet = mirror(octet, 8)
      for (let i = 0; i < 8; i++) {
        let topbit = crc & this.msb_mask
        if (octet & (0x80 >> i)) topbit ^= this.msb_mask
        crc <<= 1
        if (topbit) crc ^= this.poly
      }
      crc &= this.mask
    }
    if (this.reflect) crc = mirror(crc, this.width)
    crc ^= this.xor_out
    return crc >>> 0
  }

  gen_table() {
    let table_length = 256
    let table = []
    for (let i = 0; i < table_length; i++) {
      let reg = i
      if (this.reflect) reg = mirror(reg, 8)
      reg = reg << (this.width - 8 + this.crc_shift)
      for (let j = 0; j < 8; j++) {
        if ((reg & (this.msb_mask << this.crc_shift)) !== 0) {
          reg <<= 1
          reg ^= this.poly << this.crc_shift
        } else {
          reg <<= 1
        }
      }
      if (this.reflect) reg = mirror(reg >> this.crc_shift, this.width) << this.crc_shift
      reg = (reg >> this.crc_shift) & this.mask
      table[i] = reg >>> 0
    }
    return new Int32Array(table)
  }

  print_table() {
    let table = this.table
    let digits = Math.ceil(this.width / 4)
    let shift = (digits < 4) ? 4 : 3
    let rows = table.length >> shift
    let columns = 1 << shift
    let result = ''
    for (let r = 0; r < rows; r++) {
      let row = ''
      for (let c = 0; c < columns; c++) {
        let val = table[r << shift | c]
        val = '000000000' + val.toString(16)
        val = val.substr(val.length - digits)
        row += '0x' + val + ', '
      }
      result += '  ' + row + '\n'
    }
    result = '[\n' + result.slice(0, -3) + '\n]'
    return result
  }
}

const hasTypedArrays = typeof ArrayBuffer !== 'undefined' && typeof Uint8Array !== 'undefined';
const hasBuffer = typeof Buffer !== 'undefined';
if (!hasTypedArrays && !hasBuffer) {
  throw Error('either need TypedArrays or Buffer');
}

function validate_buffer(data) {
  switch (typeof data) {
    case 'number':
      if (hasTypedArrays) {
        const buffer = new Uint8Array(4);
        const dv = new DataView(buffer.buffer);
        dv.setUint32(0, data);
        return buffer;
      } else if (hasBuffer) {
        const buffer = Buffer.alloc(4)
        buffer.writeUInt32BE(data)
        return buffer;
      }
      break;
    case 'string':
      if (hasTypedArrays) {
        return new TextEncoder("utf-8").encode(data);
      } else if (hasBuffer) {
        return Buffer.from(data)
      }
      break;
    default:
      if (hasTypedArrays) {
        if (data instanceof ArrayBuffer) {
          return new Uint8Array(data);
        }
        if (ArrayBuffer.isView(data)) {
          return new Uint8Array(data.buffer);
        }
      }
      if (hasBuffer) {
        if (Buffer.isBuffer(data)) return data
      }
      throw new Error(`Unrecognized data type ${typeof data}: ${data}`);
  }
  throw Error(`Internal error: no buffer conversion for ${typeof data}: ${data}`);
}

function mirror(data, width) {
  let res = 0
  for (let i = 0; i < width; i++) {
    res = res << 1 | data & 1
    data >>= 1
  }
  return res
}

const models = {
  crc1: new CRC(1, 0x01, 0x00, 0x00, false),
  crc6: new CRC(6, 0x2F, 0x00, 0x00, false),
  crc8: new CRC(8, 0x07, 0x00, 0x00, false),
  crc10: new CRC(10, 0x233, 0x0000, 0x0000, false),
  crc16: new CRC(16, 0x8005, 0x0000, 0x0000, true),
  crc24: new CRC(24, 0x864CFB, 0xB704CE, 0x000000, false),
  crc32: new CRC(32, 0x04C11DB7, 0xFFFFFFFF, 0xFFFFFFFF, true),
  crc32c: new CRC(32, 0x1EDC6F41, 0xFFFFFFFF, 0xFFFFFFFF, true)
}

module.exports = {
  CRC,
  models,
  crc
}

function crc(width, poly, xor_in, xor_out, reflect) {
  let model = new CRC(width, poly, xor_in, xor_out, reflect)
  return model.calculate.bind(model)
}

for (let name in models) {
  let model = models[name]
  module.exports[name] = model.calculate.bind(model)
}