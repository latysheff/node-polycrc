This module provides fast calculation of CRC ([Cyclic redundancy check][Wiki])
with custom parameters:

* width - any number 1 ... 32
* polynom
* XOR in
* XOR out
* reflect

Calculation is table-based. Tables are dynamically generated once per CRC model.
There are prebuilt models for CRC-6, CRC-8, CRC-10, CRC-16, CRC-24, CRC-32, CRC-32C.

Motivation for this module were checksums (CRC-6 and CRC-10) used in IuUP (3GPP TS 25.415).
No other module could provide them.
Until now there seems to be no other universal and fast CRC calculator module in npm registry.

CRC mathematics are mostly ported from https://pycrc.org/

## Installation
`npm install polycrc`

## API

#### crc6(buffer)
#### crc8(buffer)
#### crc10(buffer)
#### crc16(buffer)
#### crc24(buffer)
#### crc32(buffer)
#### crc32c(buffer)
Calculates checksum. Returns number.

#### crc(width, poly, xor_in, xor_out, reflect)
Generates new CRC function with custom parameters. Returns function.

#### new CRC(width, poly, xor_in, xor_out, reflect)
Generates new CRC model with custom parameters. Returns class.
Mostly for internal purposes.

For creating new CRC checksum functions use generator function *crc()*.

#### models
`module.exports.models` object holds prebuilt classes,
which can be used for pretty-printing generated CRC tables:

`console.log(polycrc.models.crc8.print_table())`


### Example
```
let crypto = require('crypto')
let polycrc = require('polycrc')
let crc10 = polycrc.crc10
let result = crc10(crypto.randomBytes(1024))
console.log(result)
let crc5 = polycrc.crc(5, 0x5, 0x1f, 0x1f, true)
console.log(crc5('Input is usually a buffer, but string is ok'))
console.log(polycrc.models.crc8.print_table())
```

### Prebuilt models
```
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
```
## Module comparison
There are benchmarks for several npm modules, compared to polycrc, below.
Each benchmark consumes 1Gb of data in 1kb chunks.

       algorythm           module            value         calc/sec

            crc6          polycrc               39           157918

            crc8          polycrc              139           425040
            crc8              crc              139           365867
            crc8         node-crc              139           247539
            crc8         crc-full              139           120636

           crc10          polycrc               27           157231

           crc16          polycrc            63191           288545
           crc16              crc            63191           317077
           crc16         node-crc            63191           248831
           crc16         crc-full            60271            21542

           crc24          polycrc          9247743           158971
           crc24              crc          9247743           181949

           crc32          polycrc       1904274110           287596
           crc32              crc       1904274110           353293
           crc32         node-crc       1904274110           239838
           crc32         crc-full       1904274110            19637

           crc32              crc       1904274110           276669
           crc32          polycrc       1904274110           245971
           crc32         node-crc       1904274110           223624
           crc32           crc-32       1904274110           312821
           crc32     buffer-crc32       1904274110           300796
           crc32        cyclic-32       1904274110           302357

          crc32c          polycrc       3222595308           281194
          crc32c    fast-crc32c *       3222595308          2162012
          crc32c  fast-crc32c(js)       3222595308           292571
          crc32c     sse4_crc32 *       3222595308          1804777

 binary modules marked *

[wiki]: https://en.wikipedia.org/wiki/Cyclic_redundancy_check

## Author
Copyright (c) 2018 Vladimir Latyshev

License: MIT