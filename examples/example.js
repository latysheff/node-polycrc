let crypto = require('crypto')
let polycrc = require('../polycrc')
let crc10 = polycrc.crc10
let result = crc10(crypto.randomBytes(1024))
console.log(result)
let crc5 = polycrc.crc(5, 0x5, 0x1f, 0x1f, true)
console.log(crc5('Input is usually a buffer, but string is ok'))
console.log(polycrc.models.crc8.print_table())
