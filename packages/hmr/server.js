const chokidar = require('chokidar')
const path = require('path')
global.XMLHttpRequest = require('xhr2')
const UB = require('@unitybase/ub-pub')
const fs = require('fs')
const WebSocket = require('ws')

module.exports = runServer

/**
 *
 * @param opts
 */
function getDomainFolders (opts) {
  return UB.connect({
    host: opts.host,
    onCredentialRequired: function (conn, isRepeat) {
      if (isRepeat) {
        throw new UB.UBAbortError('invalid')
      } else {
        return Promise.resolve({ authSchema: 'UB', login: opts.user, password: opts.pwd })
      }
    },
    onAuthorizationFail: function (reason) {
      console.error(reason)
    }
  }).then(function (conn) {
    return conn.get(`getDomainInfo?v=4&userName=${opts.user}&extended=true`)
  }).then(function (res) {
    const models = res.data.models
    const folders = []
    for (const modelName in models) {
      // noinspection JSUnfilteredForInLoop
      const model = models[modelName]
      const pp = model.realPublicPath
      if (pp) {
        if (fs.existsSync(pp)) {
          const replaceBy = model.moduleName.startsWith('@')
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

/**
 *
 * @param opts
 */
async function runServer (opts) {
  const folders = await getDomainFolders(opts)
  const log = opts.quiet ? () => {} : console.log.bind(console)
  if (!folders.length) {
    log('Public folders not found')
    process.exit(1)
  }

  const wss = new WebSocket.Server({
    port: opts.port
  })

  const pathsToWatch = folders.map(fc => fc.publicPath)
  const ignoredPaths = [
    /[/\\]\./,
    // Ignore relative, top-level dotfiles as well (e.g. '.gitignore').
    /^\.[^/\\]/,
    `node_modules${path.sep}**`,
    `.git${path.sep}**`
  ]
  const chokidarOpts = {
    ignored: ignoredPaths,
    ignoreInitial: true,
    depth: opts.depth
  }
  if (opts.poll) chokidarOpts.usePolling = true
  log('Watching:')
  log(pathsToWatch.join('\n'))
  const watcher = chokidar.watch(pathsToWatch, chokidarOpts).on('change', (onPath) => {
    const event = 'change'
    const modelFolder = folders.find(f => onPath.startsWith(f.publicPath))
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
        client.send(JSON.stringify({ event, path: clientPath }))
      }
    })
  })

  /**
   *
   */
  function noop () {}

  /**
   *
   */
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

  setInterval(function ping () {
    wss.clients.forEach(function each (ws) {
      if (ws.isAlive === false) return ws.terminate()

      ws.isAlive = false
      ws.ping(noop)
    })
  }, 30000)

  return {
    wss,
    watcher
  }
}
