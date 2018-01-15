let crypto = require('crypto')

let crc_modules = {}
// this module
crc_modules['polycrc'] = require('../polycrc')
// most popular module
crc_modules['crc'] = require('crc')
// modules with custom polynoms
let module_names = ['node-crc', 'crc-full']
module_names.forEach(lib => {
  crc_modules[lib] = require(lib)
})

let total_bytes = Math.pow(2, 10 * 3)
let length = 1024
let data = crypto.randomBytes(length)
let tab = str => (' '.repeat(16) + str).slice(-16)

function test_all() {
  for (let i = 6; i <= 32; i++) {
    let alg = 'crc' + i
    let have = false
    for (let lib in crc_modules) {
      let crc_module = crc_modules[lib]
      let crc = crc_module[alg]
      if (crc) {
        if (typeof crc !== 'function') {
          if (crc.calculate) {
            crc = crc.calculate.bind(crc)
          } else {
            console.log(crc)
          }
        }
      } else if (crc_module.CRC) {
        if (crc_module.CRC.default) {
          crc = crc_module.CRC.default(alg.toLocaleUpperCase())
          if (!crc && i === 16)
            crc = new crc_module.CRC(alg, 16, 0x8005, 0x0000, 0x0000, true)
          if (crc) {
            crc = crc.compute.bind(crc)
          }
        }
      } else if (crc_module.CrcDatabase) {
        crc = crc_module.CrcDatabase[alg.toLocaleUpperCase()]
        if (crc) {
          crc = new crc_module.Crc(crc)
          crc = crc.compute.bind(crc)
        }
      }
      if (typeof crc === 'function') {
        have = true
        benchmark(alg, lib, crc)
      }
    }
    if (have) console.log('\r')
  }
}

let algorythms = {
  'crc32': {
    'crc': require('crc').crc32,
    'polycrc': require('../polycrc').crc32,
    'node-crc': require('node-crc').crc32,
    'crc-32': require('crc-32').buf,
    'buffer-crc32': require('buffer-crc32'),
    'cyclic-32': require('cyclic-32'),
  },
  'crc32c': {
    'polycrc': require('../polycrc').crc32c,
    'fast-crc32c *': require('fast-crc32c').calculate,
    'fast-crc32c(js)': require('../node_modules/fast-crc32c/impls/js_crc32c').calculate,
    'sse4_crc32 *': require('sse4_crc32').calculate,
  }
}

function benchmark(alg, lib, crc) {
  let count = 0
  let value = 0
  let start = Date.now()
  let cycles = total_bytes / length
  while (count < cycles) {
    count++
    value = crc(data)
  }
  let cps = ~~(count / (Date.now() - start) * 1000)
  if (Buffer.isBuffer(value)) {
    // let len = Math.ceil(Math.log2(value.length) / 3)
    value = value.readUIntBE(0, value.length)
  }
  console.log(`${tab(alg)} ${tab(lib)} ${tab(value)} ${tab(cps)}`)
}

function test_selected() {
  for (let alg in algorythms) {
    let algorythm = algorythms[alg]
    for (let lib in algorythm) {
      let crc = algorythm[lib]
      benchmark(alg, lib, crc)
    }
    console.log('\r')
  }
}

console.log(`${tab('algorythm')} ${tab('module')} ${tab('value')} ${tab('calc/sec')}\n`)
test_all()
test_selected()