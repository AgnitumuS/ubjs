const path = require('path')
const fs = require('fs')
/*
 UnityBase startup script
 this script initializes working thread JavaScript context and is called by server for each thread.
 In case UB runs in batch mode, script is called once - for main thread only
 */
UB = {
  isServer: true,
  format: function (stringToFormat, ...values) {
    const FORMAT_RE = /{(\d+)}/g
    return stringToFormat.replace(FORMAT_RE, function (m, i) {
      return values[i]
    })
  }
}

//this.global = this
/**
 * Put something to log with log levels depending on method
 * @global
 * @type {Console}
 */
// eslint-disable-next-line no-global-assign
console = require('console')

process.emitWarning = console.warn
if (process.isServer) {
  //let startupModule = fs.realpathSync(path.join(process.configPath, 'node_modules', '@unitybase', 'ub'))
  let startupModule = process.configPath
  require(startupModule)
}


// function evalScript (name) {
//   var Module = require('module')
//   var path = require('path')
//   var cwd = process.cwd()
//
//   var module = new Module(name)
//   module.filename = path.join(cwd, name)
//   module.paths = Module._nodeModulePaths(cwd)
//   var script = process._eval
//   if (!Module._contextLoad) {
//     var body = script
//     script = 'global.__filename = ' + JSON.stringify(name) + ';\n' + 'global.exports = exports;\n' + 'global.module = module;\n' + 'global.__dirname = __dirname;\n' + 'global.require = require;\n' + 'return require("vm").runInThisContext(' + JSON.stringify(body) + ', ' + JSON.stringify(name) + ', true);\n'
//   }
//   var result = module._compile(script, name + '-wrapper')
//   if (process._print_eval) console.log(result)
// }

/*    if (!process.isServer){
 toLog('!!!!not server - run startup')
 var Module = NativeModule.require('module');
 Module._load(process.argv[1], null, true);
 } */
