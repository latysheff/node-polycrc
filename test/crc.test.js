const tape = require('tape')
const polycrc = require('../polycrc')

const string = 'Hello, world!'

function checkString (t, string) {
  t.same(polycrc.crc1(string), 1)
  t.same(polycrc.crc6(string), 47)
  t.same(polycrc.crc8(string), 188)
  t.same(polycrc.crc10(string), 926)
  t.same(polycrc.crc16(string), 39498)
  t.same(polycrc.crc24(string), 1826690)
  t.same(polycrc.crc32(string), 3957769958)
  t.same(polycrc.crc32c(string), 3365996261)
}

const number = 12345
function checkNumber (t, number) {
  t.same(polycrc.crc1(number), 0)
  t.same(polycrc.crc6(number), 3)
  t.same(polycrc.crc8(number), 86)
  t.same(polycrc.crc10(number), 201)
  t.same(polycrc.crc16(number), 4820)
  t.same(polycrc.crc24(number), 9061093)
  t.same(polycrc.crc32(number), 2701615591)
  t.same(polycrc.crc32c(number), 1081658169)
}

const large = 12345 + Math.pow(2, 52)
function checkLarge (t, large) {
  t.same(polycrc.crc1(large), 1)
  t.same(polycrc.crc6(large), 8)
  t.same(polycrc.crc8(large), 133)
  t.same(polycrc.crc10(large), 964)
  t.same(polycrc.crc16(large), 54213)
  t.same(polycrc.crc24(large), 11462589)
  t.same(polycrc.crc32(large), 2062679371)
  t.same(polycrc.crc32c(large), 796528693)
}

const buf = Buffer.from([1, 2, 3])
function checkBuf (t, buf) {
  t.same(polycrc.crc1(buf), 0)
  t.same(polycrc.crc6(buf), 20)
  t.same(polycrc.crc8(buf), 72)
  t.same(polycrc.crc10(buf), 928)
  t.same(polycrc.crc16(buf), 41232)
  t.same(polycrc.crc24(buf), 6775187)
  t.same(polycrc.crc32(buf), 1438416925)
  t.same(polycrc.crc32c(buf), 4046516766)
}

tape('CRC of a string', function (t) {
  checkString(t, string)
  t.end()
})

tape('CRC of a number', function (t) {
  checkNumber(t, number)
  t.end()
})

tape('CRC of a large number', function (t) {
  checkLarge(t, large)
  t.throws(() => polycrc.crc1(2**54), /must be a nonnegative safe integer/)
  t.end()
})

tape('CRC of a 32-bit BigInt', function (t) {
  if (typeof BigInt !== 'undefined') {
    checkNumber(t, BigInt(number))
  }
  t.end()
})

tape('CRC of a >32-bit BigInt', function (t) {
  if (typeof BigInt !== 'undefined') {
    checkLarge(t, BigInt(large))
  }
  t.end()
})

tape('CRC of a really BigInt', function (t) {
  if (typeof BigInt !== 'undefined') {
    // Convert the string to a big-endian bigint.
    const bytes = new TextEncoder('utf-8').encode(string)
    const ints = [...bytes.values()].map(b => b.toString(16).padStart(2, '0'))
    const hex = ints.join('')
    const bignum = BigInt(`0x${hex}`)

    // Validate the same CRCs as the string.
    checkString(t, bignum)
  }
  t.end()
})

tape('CRC of a buffer', function (t) {
  checkBuf(t, buf)
  t.end()
})

tape('CRC of an ArrayBuffer', function (t) {
  if (typeof ArrayBuffer !== 'undefined') {
    const ubuf = new Uint8Array(buf.values())
    const abuf = ubuf.buffer
    checkBuf(t, abuf)
  }
  t.end()
})

tape('CRC of a Uint8Array', function (t) {
  if (typeof Uint8Array !== 'undefined') {
    const ubuf = new Uint8Array(buf.values())
    checkBuf(t, ubuf)
  }
  t.end()
})

tape('CRC of a DataView', function (t) {
  if (typeof DataView !== 'undefined') {
    const wideBuf = new Uint8Array([0, 1, 2, 3, 4])
    const buf = new DataView(wideBuf.buffer, 1, 3)
    checkBuf(t, buf)
  }
  t.end()
})
