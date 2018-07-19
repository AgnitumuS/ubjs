const chokidar = require('chokidar')
const path = require('path')
const socketsConnected = []
global.XMLHttpRequest = require('xhr2')
const UB = require('@unitybase/ub-pub')
const fs = require('fs')
module.exports = runServer

function getDomainFolders (opts) {
  return UB.connect({
    host: opts.host,
    onCredentialRequired: function (conn, isRepeat) {
      if (isRepeat) {
        throw new UB.UBAbortError('invalid')
      } else {
        return Promise.resolve({authSchema: 'UB', login: opts.user, password: opts.pwd})
      }
    },
    onAuthorizationFail: function (reason) {
      console.error(reason)
    }
  }).then(function (conn) {
    return conn.get(`getDomainInfo?v=4&userName=${opts.user}&extended=true`)
  }).then(function (res) {
    let models = res.data.models
    let folders = []
    for (let modelName in models) {
      let pp = models[modelName].realPublicPath
      if (pp) {
        if (fs.existsSync(pp)) {
          let replaceBy = models[modelName].moduleName.startsWith('@')
            ? models[modelName].moduleName
            : models[modelName].path
          folders.push({
            publicPath: pp,
            replaceBy
          })
        }
      }
    }
    return folders
  })
}

async function runServer (opts) {
  let folders = await getDomainFolders(opts)
  let log = opts.quiet ? () => {} : console.log.bind(console)
  if (!folders.length) {
    log('Public folders not found')
    process.exit(1)
  }
  let httpServer = require('http').createServer()

  let io = require('socket.io')(httpServer)
  httpServer.listen(opts.port, () => {
    log('UB HMR listening on', opts.port)
  })

  const pathsToWatch = folders.map(fc => fc.publicPath)
  let ignoredPaths = [
    /[/\\]\./,
    // Ignore relative, top-level dotfiles as well (e.g. '.gitignore').
    /^\.[^/\\]/,
    `node_modules${path.sep}**`,
    `.git${path.sep}**`
  ]
  let chokidarOpts = {
    ignored: ignoredPaths,
    ignoreInitial: true,
    depth: opts.depth
  }
  if (opts.poll) chokidarOpts.usePolling = true
  log('Options', chokidarOpts)
  log('Watching:')
  log(pathsToWatch.join('\n'))
  let watcher = chokidar.watch(pathsToWatch, chokidarOpts).on('all', (event, onPath) => {
    let modelFolder = folders.find(f => onPath.startsWith(f.publicPath))
    if (!modelFolder) {
      log('Public path not found for ', onPath)
      return
    }
    let clientPath = modelFolder.replaceBy + onPath.slice(modelFolder.publicPath.length - 1)
    if (path.sep === '\\') {
      clientPath = clientPath.replace(/\\/g, '/')
    }

    log('File', onPath, 'emitted:', event, 'with', clientPath)
    socketsConnected.forEach((socket) => {
      socket.emit(event, {path: clientPath})
    })
  })
  io.on('connection', (socket) => {
    let index = socketsConnected.push(socket)
    socket.on('disconnect', () => {
      socketsConnected.splice(index - 1, 1)
    })

    socket.on('identification', (name) => {
      log('connected client:' + name)
    })
  })

  return {
    io: io,
    app: httpServer,
    watcher: watcher,
    close: (callback) => {
      watcher.close()
      log('closing UB HMR')
      socketsConnected.forEach((socket) => {
        socket.disconnect()
      })
      io.httpServer.close(callback)
    }
  }
}
