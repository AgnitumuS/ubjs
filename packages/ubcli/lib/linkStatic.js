/**
 * Command line module for creating folder with all static assets (models, modules) available for client using
 * `clientRequire` and `models` endpoints. Such folder can be served by nginx as a static folder.
 * This greatly reduce a UnityBase application logs size and speed up static files loading (about 1ms per file)
 * Command line usage:

 ubcli linkStatic -?

 * @author pavel.mash 2019-11-15
 * @module wwwStaticFolder
 * @memberOf module:@unitybase/ubcli
 */
const fs = require('fs')
const argv = require('@unitybase/base').argv
const options = require('@unitybase/base').options
const path = require('path')

const DEBUG = false
module.exports = linkStatic
module.exports.shortDoc = 'Create folder with static asserts'

function linkStatic (cfg) {
  let session, conn

  console.time('Generate documentation')
  if (!cfg) {
    let opts = options.describe('linkStatic',
      `Create folder with static asserts. Such folder can be used by nginx
as drop-in replacement to /clientRequire and /models endpoints`,
      'ubcli'
    )
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
      .add({
        short: 't',
        long: 'target',
        param: 'target',
        defaultValue: '*',
        help: 'Target folder. Default is inetPub value from config'
      })
      .add({
        short: 'run',
        long: 'run',
        defaultValue: false,
        help: 'Execute a bash/cmd script after creation'
      })
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  session = argv.establishConnectionFromCmdLineAttributes(cfg)
  conn = session.connection
  let cfgFN = argv.getConfigFileName()
  let ubCfg = argv.getServerConfiguration()
  let target = cfg.target || ubCfg.httpServer.inetPub
  if (!target || (typeof target !== 'string')) {
    throw new Error(`Target folder is not specified. Either set a "http.inetPub" value in config or pass switch --target path/to/target/folder`)
  }
  if (!path.isAbsolute(target)) target = path.join(process.cwd(), target)

  let CLIENT_REQUIRE_TARGET_ALIAS = '$CRT'
  let NODE_MODULES_SOURCES_ALIAS = '$NMS'
  try {
    let domain = conn.getDomainInfo(true)
    let domainModels = domain.models
    let cfgPath = path.dirname(cfgFN)
    let modulesPath = path.join(cfgPath, 'node_modules')
    if (!fs.existsSync(modulesPath)) {
      throw new Error(`node_modules folder not found in the folder with app config. Expected "${modulesPath}". May be you miss "npm i" command?`)
    }
    let tm = fs.readdirSync(modulesPath)
    let commands = []
    let clientRequireTarget = path.join(target, 'clientRequire')
    commands.push({
      type: 'comment',
      text: 'Modules for /clientRequire endpoint replacement'
    })
    tm.forEach(m => {
      if (m.startsWith('.')) return
      if (m.startsWith('@')) { // namespace
        let ttm = fs.readdirSync(path.join(modulesPath, m))
        commands.push({
          type: 'mkdir',
          to: path.join(CLIENT_REQUIRE_TARGET_ALIAS, m)
        })
        let L = commands.length
        ttm.forEach(sm => {
          if (sm.startsWith('.')) return
          tryAddModule(modulesPath, NODE_MODULES_SOURCES_ALIAS, path.join(m, sm), commands, CLIENT_REQUIRE_TARGET_ALIAS)
        })
        if (commands.length === L) {
          // no modules added - remove ns folder creation
          commands.pop()
        }
      } else {
        tryAddModule(modulesPath, NODE_MODULES_SOURCES_ALIAS, m, commands, CLIENT_REQUIRE_TARGET_ALIAS)
      }
    })
    // process models. In case model is already sym-linked for clientRequire - use a related link
    // TODO - This allow to copy full folder to remote fs
    let modelsTarget = path.join(clientRequireTarget, 'models')
    DEBUG && console.log(domainModels)
    let mNames = Object.keys(domainModels)
    commands.push({
      type: 'comment',
      text: 'Models for /model endpoint replacement'
    })
    mNames.forEach(mName => {
      let m = domainModels[mName]
      if (!m.packageJSON.config || !m.packageJSON.config.ubmodel || !m.packageJSON.config.ubmodel.name) {
        throw new Error(`package.json config for model ${mName} should contains a section "config": {"ubmodel": {"name":...}`)
      }
      let rpp = m.realPublicPath
      if (rpp.endsWith('/') || rpp.endsWith('\\')) rpp = rpp.slice(0, -1)
      if (!fs.existsSync(rpp)) { // no public folder
        DEBUG && console.info(`Skip model ${mName} - no public folder ${rpp}`)
        return
      }
      let moduleLink = commands.find(c => c.from === rpp)
      if (moduleLink) {
        commands.push({
          from: moduleLink.to,
          to: path.join(CLIENT_REQUIRE_TARGET_ALIAS, 'models', m.packageJSON.config.ubmodel.name),
          type: 'folder'
        })
      } else {
        commands.push({
          from: rpp,
          to: path.join(CLIENT_REQUIRE_TARGET_ALIAS, 'models', m.packageJSON.config.ubmodel.name),
          type: 'folder'
        })
      }
    })
    let script = [
      'err() { echo "err"; exit $?; }',
      `CRT=${clientRequireTarget}`,
      `NMS=${modulesPath}`,
      `rm -rf $CRT`, // prevent recursive symlinks
      `mkdir -p $CRT`,
      `mkdir -p $CRT/models`
    ]

    commands.forEach(cmd => {
      if (cmd.type === 'comment') {
        script.push(`# ${cmd.text}`)
      } else if (cmd.type === 'mkdir') {
        script.push(`mkdir -p ${cmd.to} || err`)
      } else if (cmd.type === 'folder') {
        script.push(`ln -s ${cmd.from} ${cmd.to} || err`)
      } else if (cmd.type === 'file') {
        script.push(`ln -s -f ${cmd.from} ${cmd.to} || err`)
      }
    })

    script.push(`# update modification time for files in modules updated by npm`)
    script.push(`find -L $CRT -type f -not -path "*/node_modules/*" -not -newermt '1986-01-01' -exec touch -m {} +`)
    // win
    // forfiles /P .\node_modules /S /D -01.01.1986 /C "cmd /c Copy /B @path+,,"
    let resFn = path.join(process.cwd(), '.linkStatic.sh')
    fs.writeFileSync(resFn, script.join('\n'))
    console.log(`

Bash script ${resFn} is created

Review a script, take care about target folder and package list

In case some package should not be exposed to client add a section
  "config": {"ubmodel": {} } 
into corresponding package.json
  
Use a command:
  chmod +x ./.linkStatic.sh && ./.linkStatic.sh
to link a static`)

    // let pjsPath = path.join(cfgPath, 'package.json')
    // if (!fs.existsSync(pjsPath)) {
    //   throw new Error(`package.json not found in the folder with app config. Expected path "${pjsPath}"`)
    // }
    // let appPackage = require(pjsPath)
    // console.log(domainModels)
    // console.log(appPackage)

    /*
    How to prevent server-side logic to be exposed for client

    First let's explain what packages are exposed:
      - packages without `config.ubmodel` section and packaged with `config.ubmodel.isPublic: true` inside package.json
        are exposed as is (sym-linked into ${httpServer.inetPub}/clientRequire)
      - for packages with `config.ubmodel && !config.ubmodel.isPublic` only `public` folder content and package.json itself
        is sym-linked into ${httpServer.inetPub}/clientRequire. All other model folders are hidden from client

    So, to hide all package files from client add a "config" : {"ubmodel": {} } section into package.json

     */
  } finally {
    if (session && session.logout) {
      session.logout()
    }
  }
}

/**
 * Check module should be exposed and if yes, add command to "to" array
 * @param {string} modulesPath node_modules root
 * @param {string} MPT alias for modulesPath
 * @param {string} module Name of module to check
 * @param {array<object>} commands
 * @param {string} target Target folder
 */
function tryAddModule (modulesPath, MPT, module, commands, target) {
  let pPath = path.join(modulesPath, module, 'package.json')
  if (!fs.existsSync(pPath)) return
  let p = require(pPath)

  let hasUbModel = p.config && p.config.ubmodel
  if (!hasUbModel || (hasUbModel && p.config.ubmodel.isPublic)) { // packages without `config.ubmodel` and public packages
    if (!hasUbModel) {
      DEBUG && console.info(`Add common module "${module}"`)
    } else {
      DEBUG && console.info(`Add public model  "${module}"`)
    }
    commands.push({
      type: 'folder',
      from: path.join(MPT, module),
      to: path.join(target, module)
    })
    if (!hasUbModel) { // add link to module entry point to use in `index .entryPoint.js` nginx directive
      let pkgEntryPoint = path.join(modulesPath, module, p.main || 'index.js')
      if (fs.existsSync(pkgEntryPoint)) {
        commands.push({
          type: 'file',
          from: path.join(MPT, module, p.main || 'index.js'),
          to: path.join(target, module, '.entryPoint.js')
        })
      } else {
        DEBUG && console.warn(`Entry point ${pkgEntryPoint} not exists. Skip linking of .entryPoint.js`)
      }
    }
  } else { // packages with `public` folder
    let pubPath = path.join(modulesPath, module, 'public')
    if (!fs.existsSync(pubPath)) {
      DEBUG && console.log(`Skip server-side "${module}"`)
      return
    }
    DEBUG && console.info(`Add public part  "${module}/public"`)
    commands.push({
      type: 'mkdir',
      to: path.join(target, module)
    })
    commands.push({
      type: 'folder',
      from: path.join(MPT, module, 'public'),
      to: path.join(target, module, 'public')
    })
    commands.push({
      from: path.join(MPT, module, 'package.json'),
      to: path.join(target, module, 'package.json'),
      type: 'file'
    })
  }
}
