const chokidar = require('chokidar')
const path = require('path')
global.XMLHttpRequest = require('xhr2')
const UB = require('@unitybase/ub-pub')
const fs = require('fs')
const WebSocket = require('ws')

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
    console.log(models)
    for (let modelName in models) {
      const model = models[modelName]
      let pp = model.realPublicPath
      if (pp) {
        if (fs.existsSync(pp)) {
          let replaceBy = model.moduleName.startsWith('@')
            ? model.moduleName + (model.moduleSuffix ? ('/' + model.moduleSuffix) : '')
            : model.path
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

  const wss = new WebSocket.Server({
    port: opts.port
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
  log('Watching:')
  log(pathsToWatch.join('\n'))
  let watcher = chokidar.watch(pathsToWatch, chokidarOpts).on('all', (event, onPath) => {
    let modelFolder = folders.find(f => onPath.startsWith(f.publicPath))
    if (!modelFolder) {
      log('Public path not found for', onPath)
      return
    }
    let clientPath = modelFolder.replaceBy + onPath.slice(modelFolder.publicPath.length - 1)
    if (path.sep === '\\') {
      clientPath = clientPath.replace(/\\/g, '/')
    }

    log('File', onPath, 'emitted:', event, 'with', clientPath)
    wss.clients.forEach(function each (client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({event: event, path: clientPath}))
      }
    })
  })

  function noop () {}

  function heartbeat () {
    this.isAlive = true
  }

  wss.on('connection', function connection (ws, req) {
    ws.isAlive = true
    ws.clientIP = req.connection.remoteAddress
    ws.on('pong', heartbeat)
    ws.on('close', function () {
      log('Close connection from', ws.clientIP)
    })
    log('New connection from', ws.clientIP)
  })

  const interval = setInterval(function ping () {
    wss.clients.forEach(function each (ws) {
      if (ws.isAlive === false) return ws.terminate()

      ws.isAlive = false
      ws.ping(noop)
    })
  }, 30000)

  return {
    wss: wss,
    watcher: watcher
  }
}
