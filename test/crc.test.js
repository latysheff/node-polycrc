const tape = require('tape')
const polycrc = require('../polycrc')

const string = 'Hello, world!'

function checkString (t, calcs, string) {
  t.same(calcs.crc1(string), 1)
  t.same(calcs.crc6(string), 47)
  t.same(calcs.crc8(string), 188)
  t.same(calcs.crc10(string), 926)
  t.same(calcs.crc16(string), 39498)
  t.same(calcs.crc24(string), 1826690)
  t.same(calcs.crc32(string), 3957769958)
  t.same(calcs.crc32c(string), 3365996261)
}

const number = 12345
function checkNumber (t, calcs, number) {
  t.same(calcs.crc1(number), 0)
  t.same(calcs.crc6(number), 3)
  t.same(calcs.crc8(number), 86)
  t.same(calcs.crc10(number), 201)
  t.same(calcs.crc16(number), 4820)
  t.same(calcs.crc24(number), 9061093)
  t.same(calcs.crc32(number), 2701615591)
  t.same(calcs.crc32c(number), 1081658169)
}

const large = 12345 + Math.pow(2, 52)
function checkLarge (t, calcs, large) {
  t.same(calcs.crc1(large), 1)
  t.same(calcs.crc6(large), 8)
  t.same(calcs.crc8(large), 133)
  t.same(calcs.crc10(large), 964)
  t.same(calcs.crc16(large), 54213)
  t.same(calcs.crc24(large), 11462589)
  t.same(calcs.crc32(large), 2062679371)
  t.same(calcs.crc32c(large), 796528693)
}

const buf = Buffer.from([1, 2, 3])
function checkBuf (t, calcs, buf) {
  t.same(calcs.crc1(buf), 0)
  t.same(calcs.crc6(buf), 20)
  t.same(calcs.crc8(buf), 72)
  t.same(calcs.crc10(buf), 928)
  t.same(calcs.crc16(buf), 41232)
  t.same(calcs.crc24(buf), 6775187)
  t.same(calcs.crc32(buf), 1438416925)
  t.same(calcs.crc32c(buf), 4046516766)
}

for (const preferTypedArray of [undefined, false, true]) {
  let calcs = polycrc
  let desc = 'default'
  if (preferTypedArray !== undefined) {
    calcs = {}
    desc = preferTypedArray ? 'TypedArray' : 'Buffer'
    for (let name in polycrc.models) {
      let model = polycrc.models[name]
      // Replace the converter with an explicit preference.
      model.converter = polycrc.makeBufferConverter(preferTypedArray)
      calcs[name] = model.calculate.bind(model)
    }
  }

  tape(`${desc} - CRC of a string`, function (t) {
    checkString(t, calcs, string)
    t.end()
  })

  tape(`${desc} - CRC of a number`, function (t) {
    checkNumber(t, calcs, number)
    t.end()
  })

  tape(`${desc} - CRC of a large number`, function (t) {
    checkLarge(t, calcs, large)
    t.throws(() => polycrc.crc1(2**54), /must be a nonnegative safe integer/)
    t.end()
  })

  tape(`${desc} - CRC of a 32-bit BigInt`, function (t) {
    if (typeof BigInt !== 'undefined') {
      checkNumber(t, calcs, BigInt(number))
    }
    t.end()
  })

  tape(`${desc} - CRC of a >32-bit BigInt`, function (t) {
    if (typeof BigInt !== 'undefined') {
      checkLarge(t, calcs, BigInt(large))
    }
    t.end()
  })

  tape(`${desc} - CRC of a really BigInt`, function (t) {
    if (typeof BigInt !== 'undefined') {
      // Convert the string to a big-endian bigint.
      const bytes = new TextEncoder('utf-8').encode(string)
      const ints = [...bytes.values()].map(b => b.toString(16).padStart(2, '0'))
      const hex = ints.join('')
      const bignum = BigInt(`0x${hex}`)

      // Validate the same CRCs as the string.
      checkString(t, calcs, bignum)
    }
    t.end()
  })

  tape(`${desc} - CRC of a buffer`, function (t) {
    checkBuf(t, calcs, buf)
    t.end()
  })

  tape(`${desc} - CRC of an ArrayBuffer`, function (t) {
    if (typeof ArrayBuffer !== 'undefined') {
      const ubuf = new Uint8Array(buf.values())
      const abuf = ubuf.buffer
      checkBuf(t, calcs, abuf)
    }
    t.end()
  })

  tape(`${desc} - CRC of a Uint8Array`, function (t) {
    if (typeof Uint8Array !== 'undefined') {
      const ubuf = new Uint8Array(buf.values())
      checkBuf(t, calcs, ubuf)
    }
    t.end()
  })

  tape(`${desc} - CRC of a DataView`, function (t) {
    if (typeof DataView !== 'undefined') {
      const wideBuf = new Uint8Array([0, 1, 2, 3, 4])
      const buf = new DataView(wideBuf.buffer, 1, 3)
      checkBuf(t, calcs, buf)
    }
    t.end()
  })
}
