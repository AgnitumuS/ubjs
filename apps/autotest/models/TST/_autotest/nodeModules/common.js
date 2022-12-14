// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

const path = require('path')
const assert = require('assert')

exports.testDir = path.dirname(__filename)
exports.fixturesDir = path.join(exports.testDir, 'fixtures')
exports.libDir = path.join(exports.testDir, '../lib')
exports.tmpDir = path.join(exports.testDir, 'tmp')
exports.PORT = +process.env.NODE_COMMON_PORT || 12346

if (process.platform === 'win32') {
  exports.PIPE = '\\\\.\\pipe\\libuv-test'
} else {
  exports.PIPE = exports.tmpDir + '/test.sock'
}

const util = require('util')
for (const i in util) exports[i] = util[i]
// for (var i in exports) global[i] = exports[i];

function protoCtrChain (o) {
  const result = []
  for (; o; o = o.__proto__) { result.push(o.constructor) }
  return result.join()
}

exports.indirectInstanceOf = function (obj, cls) {
  if (obj instanceof cls) { return true }
  const clsChain = protoCtrChain(cls.prototype)
  const objChain = protoCtrChain(obj)
  return objChain.slice(-clsChain.length) === clsChain
}

exports.ddCommand = function (filename, kilobytes) {
  if (process.platform === 'win32') {
    const p = path.resolve(exports.fixturesDir, 'create-file.js')
    return '"' + process.argv[0] + '" "' + p + '" "' +
           filename + '" ' + (kilobytes * 1024)
  } else {
    return 'dd if=/dev/zero of="' + filename + '" bs=1024 count=' + kilobytes
  }
}

exports.spawnCat = function (options) {
  const spawn = require('child_process').spawn

  if (process.platform === 'win32') {
    return spawn('more', [], options)
  } else {
    return spawn('cat', [], options)
  }
}

exports.spawnPwd = function (options) {
  const spawn = require('child_process').spawn

  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/c', 'cd'], options)
  } else {
    return spawn('pwd', [], options)
  }
}

// Turn this off if the test should not check for global leaks.
exports.globalCheck = true

process.on('exit', function () {
  if (!exports.globalCheck) return
  const knownGlobals = [/* setTimeout,
                      setInterval,
                      setImmediate,
                      clearTimeout,
                      clearInterval,
                      clearImmediate, */
    console,
    // Buffer,
    process,
    global
  ]

  if (global.gc) {
    knownGlobals.push(gc)
  }
  if (global.__module) { // for a ub -f mode
    knownGlobals.push(__module)
  }
  if (global.__UB_int) {
    // knownGlobals.push(UB)
    knownGlobals.push(__UB_int)
    knownGlobals.push(Buffer)
    knownGlobals.push(setTimeout)
    knownGlobals.push(setInterval)
    knownGlobals.push(setImmediate)
    knownGlobals.push(clearTimeout)
    knownGlobals.push(clearInterval)
    // todo
    knownGlobals.push(_timerLoop)

    knownGlobals.push(id)
    knownGlobals.push(exports)
    knownGlobals.push(parent)
    knownGlobals.push(filename)
    knownGlobals.push(loaded)
    knownGlobals.push(children)
    // knownGlobals.push(paths)
    // TODO: remove in 1.9 require need
    knownGlobals.push(toLog)
    knownGlobals.push(objectToJSON)
    // knownGlobals.push(readDir)
    knownGlobals.push(relToAbs)
    knownGlobals.push(copyFile)
    knownGlobals.push(sleep)
    knownGlobals.push(createGuid)
    knownGlobals.push(shellExecute)
    knownGlobals.push(base64tofile)
    knownGlobals.push(sendMail)
    knownGlobals.push(sendUTFMail)
    knownGlobals.push(removeCommentsFromJSON)
    knownGlobals.push(ncrc32)
    knownGlobals.push(nsha256)
    knownGlobals.push(nhashFile)
    knownGlobals.push(nhmac_sha1)
    knownGlobals.push(nhmac_sha256)
    knownGlobals.push(startServer)
    knownGlobals.push(stopServer)
  }

  if (global.DTRACE_HTTP_SERVER_RESPONSE) {
    knownGlobals.push(DTRACE_HTTP_SERVER_RESPONSE)
    knownGlobals.push(DTRACE_HTTP_SERVER_REQUEST)
    knownGlobals.push(DTRACE_HTTP_CLIENT_RESPONSE)
    knownGlobals.push(DTRACE_HTTP_CLIENT_REQUEST)
    knownGlobals.push(DTRACE_NET_STREAM_END)
    knownGlobals.push(DTRACE_NET_SERVER_CONNECTION)
    knownGlobals.push(DTRACE_NET_SOCKET_READ)
    knownGlobals.push(DTRACE_NET_SOCKET_WRITE)
  }
  if (global.COUNTER_NET_SERVER_CONNECTION) {
    knownGlobals.push(COUNTER_NET_SERVER_CONNECTION)
    knownGlobals.push(COUNTER_NET_SERVER_CONNECTION_CLOSE)
    knownGlobals.push(COUNTER_HTTP_SERVER_REQUEST)
    knownGlobals.push(COUNTER_HTTP_SERVER_RESPONSE)
    knownGlobals.push(COUNTER_HTTP_CLIENT_REQUEST)
    knownGlobals.push(COUNTER_HTTP_CLIENT_RESPONSE)
  }

  if (global.ArrayBuffer) {
    knownGlobals.push(ArrayBuffer)
    knownGlobals.push(Int8Array)
    knownGlobals.push(Uint8Array)
    knownGlobals.push(Uint8ClampedArray)
    knownGlobals.push(Int16Array)
    knownGlobals.push(Uint16Array)
    knownGlobals.push(Int32Array)
    knownGlobals.push(Uint32Array)
    knownGlobals.push(Float32Array)
    knownGlobals.push(Float64Array)
    knownGlobals.push(DataView)
  }
  knownGlobals.push(internalBinding)

  // temporary hack - used by formatByPattern
  knownGlobals.push(_defaultLang)
  knownGlobals.push(_collator)

  for (const x in global) {
    let found = false
    if (x === 'exports' || x === 'require') continue
    for (const y in knownGlobals) {
      if (global[x] === knownGlobals[y]) {
        found = true
        break
      }
    }

    if (!found) {
      console.error(`Unknown global: '${x}'`, 'with value', global[x])
      assert.ok(false, 'Unknown global found')
    }
  }
})

const mustCallChecks = []

function runCallChecks (exitCode) {
  if (exitCode !== 0) return

  const failed = mustCallChecks.filter(function (context) {
    return context.actual !== context.expected
  })

  failed.forEach(function (context) {
    console.log('Mismatched %s function calls. Expected %d, actual %d.',
      context.name,
      context.expected,
      context.actual)
    console.log(context.stack.split('\n').slice(2).join('\n'))
  })

  if (failed.length) process.exit(1)
}

exports.mustCall = function (fn, expected) {
  if (typeof expected !== 'number') expected = 1

  const context = {
    expected: expected,
    actual: 0,
    stack: (new Error()).stack,
    name: fn.name || '<anonymous>'
  }

  // add the exit listener only once to avoid listener leak warnings
  if (mustCallChecks.length === 0) process.on('exit', runCallChecks)

  mustCallChecks.push(context)

  return function () {
    context.actual++
    return fn.apply(this, arguments)
  }
}

exports.platformTimeout = function (ms) {
/*  if (process.config.target_defaults.default_configuration === 'Debug')
    ms = 2 * ms;

  if (exports.isAix)
    return 2 * ms; // default localhost speed is slower on AIX

  if (process.arch !== 'arm')
    return ms;

  const armv = process.config.variables.arm_version;

  if (armv === '6')
    return 7 * ms;  // ARMv6

  if (armv === '7')
    return 2 * ms;  // ARMv7
*/
  return ms // ARMv8+
}

exports.skip = function (msg) {
  console.log(`1..0 # Skipped: ${msg}`)
}

// Useful for testing expected internal/error objects
exports.expectsError = function expectsError (fn, settings, exact) {
  if (typeof fn !== 'function') {
    exact = settings
    settings = fn
    fn = undefined
  }
  function innerFn (error) {
    assert.strictEqual(error.code, settings.code)
    if ('type' in settings) {
      const type = settings.type
      if (type !== Error && type !== TypeError && !Error.isPrototypeOf(type)) { // SyNode TypeError
        throw new TypeError('`settings.type` must inherit from `Error`')
      }
      assert(error instanceof type,
        `${error.name} is not instance of ${type.name}`)
      let typeName = error.constructor.name
      if (typeName === 'NodeError' && type.name !== 'NodeError') {
        typeName = Object.getPrototypeOf(error.constructor).name
      }
      assert.strictEqual(typeName, type.name)
    }
    if ('message' in settings) {
      const message = settings.message
      if (typeof message === 'string') {
        assert.strictEqual(error.message, message)
      } else {
        assert(message.test(error.message),
          `${error.message} does not match ${message}`)
      }
    }
    if ('name' in settings) {
      assert.strictEqual(error.name, settings.name)
    }
    if (error.constructor.name === 'AssertionError') {
      ['generatedMessage', 'actual', 'expected', 'operator'].forEach((key) => {
        if (key in settings) {
          const actual = error[key]
          const expected = settings[key]
          assert.strictEqual(actual, expected,
            `${key}: expected ${expected}, not ${actual}`)
        }
      })
    }
    return true
  }
  if (fn) {
    assert.throws(fn, innerFn)
    return
  }
  return exports.mustCall(innerFn, exact)
}
