let crypto = require('crypto')

let crc_modules = {}

crc_modules['polycrc'] = require('../polycrc') // this module
crc_modules['crc'] = require('crc') // most popular module
crc_modules['node-crc *'] = require('node-crc') // modules with custom polynoms
// crc_modules['crc-full'] = require('crc-full')

let algorithms = {
  'crc32': {
    'polycrc': require('../polycrc').crc32,
    'crc': require('crc').crc32,
    'node-crc': require('node-crc').crc32,
    'crc-32': require('crc-32').buf,
    'buffer-crc32': require('buffer-crc32'),
    'cyclic-32': require('cyclic-32')
  },
  'crc32c': {
    'polycrc': require('../polycrc').crc32c,
    'fast-crc32c(js)': require('../node_modules/fast-crc32c/impls/js_crc32c').calculate,
    'fast-crc32c *': require('fast-crc32c').calculate,
    'sse4_crc32 *': require('sse4_crc32').calculate
  }
}

let total_bytes = 1024 * 1024 * 100

console.log(`Testing available algorithms in modules ${Object.keys(crc_modules)}\n`)

console.log(`${tab('algorithm')} ${tab('module')} ${tab('value')} ${tab('calc/sec')}\n`)
let chunk_length = 300
let data = crypto.randomBytes(chunk_length)
test_all_bits()

console.log(`Testing algorithms ${Object.keys(algorithms)}\n in specific modules`)
console.log(`${tab('algorithm')} ${tab('module')} ${tab('value')} ${tab('calc/sec')}\n`)
test_selected()

function tab (str) {
  return (' '.repeat(16) + str).slice(-16)
}

function test_all_bits () {
  for (let i = 1; i <= 32; i++) {
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
          if (!crc && i === 16) { crc = new crc_module.CRC(alg, 16, 0x8005, 0x0000, 0x0000, true) }
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
        benchmark(alg, lib, crc, total_bytes, chunk_length)
      }
    }
    if (have) console.log('\r')
  }
}

function benchmark (alg, lib, crc) {
  let count = 0
  let value = 0
  let start = Date.now()
  let cycles = total_bytes / chunk_length
  while (count < cycles) {
    count++
    value = crc(data)
  }
  let cps = ~~(count / (Date.now() - start) * 1000)
  if (Buffer.isBuffer(value)) {
    value = value.readUIntBE(0, value.length)
  }
  console.log(`${tab(alg)} ${tab(lib)} ${tab(value >>> 0)} ${tab(cps)}`)
}

function test_selected () {
  for (let alg in algorithms) {
    let algorithm = algorithms[alg]
    for (let lib in algorithm) {
      let crc = algorithm[lib]
      benchmark(alg, lib, crc)
    }
    console.log('\r')
  }
}
