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
It seems to be no other universal and fast CRC module in npm registry.

CRC mathematics are mostly ported from https://pycrc.org/

## Installation
`npm install polycrc`

## API

Where available, this library supports:
* Standard ECMAScript TypedArrays, DataView, ArrayBuffer
* Legacy Node.js Buffers

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
```js
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
```js
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
Here are benchmarks for several npm modules, compared to polycrc.
Benchmarking tool located in examples dir.

Binary modules marked *

#### 100 Mb of data in 300 byte chunks

       algorithm           module            value         calc/sec

            crc1          polycrc                1           742093
            crc1              crc              172          1588754

            crc6          polycrc                8           776724

            crc8          polycrc              115          1398104
            crc8              crc              115          1065628
            crc8       node-crc *              115           452168

           crc10          polycrc              451           771580

           crc16          polycrc            18086           960236
           crc16              crc            18086          1046485
           crc16       node-crc *            18086           484779

           crc24          polycrc          3554611           775002
           crc24              crc          3554611           604716

           crc32          polycrc       1459514028           976329
           crc32              crc       1459514028          1149756
           crc32       node-crc *       1459514028           466034

           crc32          polycrc       1459514028           970905
           crc32              crc       1459514028          1165086
           crc32         node-crc       1459514028           458094
           crc32           crc-32       1459514028          1127503
           crc32     buffer-crc32       1459514028           992971
           crc32        cyclic-32       1459514028          1157370

          crc32c          polycrc       4240566998           865163
          crc32c  fast-crc32c(js)       4240566998          1019026
          crc32c    fast-crc32c *       4240566998          2818758
          crc32c     sse4_crc32 *       4240566998          2410524

#### 100 Mb of data in 100 kb chunks

       algorithm           module            value         calc/sec

            crc1          polycrc                0             1572
            crc1              crc              193             5919

            crc6          polycrc               33             1651

            crc8          polycrc               27             4231
            crc8              crc               27             3250
            crc8       node-crc *               27             3683

           crc10          polycrc              119             1670

           crc16          polycrc            17776             2976
           crc16              crc            17776             3240
           crc16       node-crc *            17776             3592

           crc24          polycrc         14484065             2438
           crc24              crc         14484065             1738

           crc32          polycrc         61412246             2942
           crc32              crc         61412246             3518
           crc32       node-crc *         61412246             3567

           crc32          polycrc         61412246             2934
           crc32              crc         61412246             3592
           crc32         node-crc         61412246             3631
           crc32           crc-32         61412246             3580
           crc32     buffer-crc32         61412246             3555
           crc32        cyclic-32         61412246             3567

          crc32c          polycrc        587481699             3011
          crc32c  fast-crc32c(js)        587481699             3240
          crc32c    fast-crc32c *        587481699            53894
          crc32c     sse4_crc32 *        587481699            56888


[wiki]: https://en.wikipedia.org/wiki/Cyclic_redundancy_check

## Author
Copyright (c) 2018 Vladimir Latyshev

License: MIT
