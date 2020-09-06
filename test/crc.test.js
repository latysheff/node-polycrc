const tape = require('tape')
const polycrc = require('../polycrc')

const string = 'Hello, world!'

tape('CRC of a string', function (t) {
  t.same(polycrc.crc1(string), 1)
  t.same(polycrc.crc6(string), 47)
  t.same(polycrc.crc8(string), 188)
  t.same(polycrc.crc10(string), 926)
  t.same(polycrc.crc16(string), 39498)
  t.same(polycrc.crc24(string), 1826690)
  t.same(polycrc.crc32(string), 3957769958)
  t.same(polycrc.crc32c(string), 3365996261)
  t.end()
})

const number = 12345

tape('CRC of a number', function (t) {
  t.same(polycrc.crc1(number), 0)
  t.same(polycrc.crc6(number), 3)
  t.same(polycrc.crc8(number), 86)
  t.same(polycrc.crc10(number), 201)
  t.same(polycrc.crc16(number), 4820)
  t.same(polycrc.crc24(number), 9061093)
  t.same(polycrc.crc32(number), 2701615591)
  t.same(polycrc.crc32c(number), 1081658169)
  t.end()
})

const buf = Buffer.from([1, 2, 3])

tape('CRC of a buffer', function (t) {
  t.same(polycrc.crc1(buf), 0)
  t.same(polycrc.crc6(buf), 20)
  t.same(polycrc.crc8(buf), 72)
  t.same(polycrc.crc10(buf), 928)
  t.same(polycrc.crc16(buf), 41232)
  t.same(polycrc.crc24(buf), 6775187)
  t.same(polycrc.crc32(buf), 1438416925)
  t.same(polycrc.crc32c(buf), 4046516766)
  t.end()
})
