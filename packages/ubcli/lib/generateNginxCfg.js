/**
 * Generate include for NGINX config based on `reverseProxy` section of application config:
 *
 *  - add proxy_pass directive to the URL from specified ubConfig
 *  - add host and client IP passthrow using `reverseProxy.remoteIPHeader` from NGINX to UB
 *  - in case `reverseProxy.sendFileHeader` if configured - add a internal locations for app and all defined BLOB stores
 *
 *
 * Result can be included to the main NGINX config using `include path-to-generated-config.conf` directive (inside the `server` directive)
 *
 * Usage from a command line:

 npx ubcli generateNginxCfg -?

 * Usage from code:

 const DDLGenerator = require('@unitybase/ubcli/generateDDL')
 var options = {
          host: 'http://localhost:888',
          user: "admin",
          pwd:  "admin",
          out:  process.cwd(),
          autorun: true,
          optimistic: false
     }
 DDLGenerator(options)

 * @author pavel.mash 2018-04-07
 * @module generateDDL
 */
const fs = require('fs')
const path = require('path')
const {options, argv} = require('@unitybase/base')
const mustache = require('mustache')

module.exports = function generateNginxCfg (cfg) {
  if (!cfg) {
    let opts = options.describe('generateNginxCfg',
      'Generate include for NGINX config based on reverseProxy section of application config',
      'ubcli'
    )
      .add({short: 'cfg', long: 'cfg', param: 'localServerConfig', defaultValue: 'ubConfig.json', searchInEnv: true, help: 'Path to UB server config'})
      .add({short: 'host', long: 'host', param: 'hostName', defaultValue: 'default_server', help: 'Host nginx server configured for'})
      .add({short: 'ssl', long: 'ssl', param: 'ssl', defaultValue: 'no', help: `Add ssl. yes|no|only. Of 'only' then do not add http listener`})
      .add({short: 'sslkey', long: 'sslkey', param: 'pathToSSLKey', defaultValue: '', help: `Full path to ssl private key *.key file`})
      .add({short: 'sslcert', long: 'sslcert', param: 'pathToSSLCert', defaultValue: '', help: `Full path to ssl public certificate key *.pem file`})
      .add({short: 'ipv6', long: 'ipv6', defaultValue: false, help: `Bind to IPv6 address`})
      .add({short: 'maxDocBody', long: 'maxDocBody', param: 'maxDocBodySize', defaultValue: '5m', help: 'Max body size for setDocument endpoint. See http://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size'})
      .add({short: 'out', long: 'out', param: 'outputPath', defaultValue: path.join(process.cwd(), 'ub-proxy.conf'), help: 'Full path to output file'})
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  let cfgPath = path.dirname(argv.getConfigFileName())
  let serverConfig = argv.getServerConfiguration()
  const reverseProxyCfg = serverConfig.httpServer.reverseProxy
  if (reverseProxyCfg.kind !== 'nginx') {
    console.error('serverConfig.reverseProxy.kind !== \'nginx\'. Terminated')
    return
  }
  if ((cfg.ssl !== 'no') && (!cfg.sslkey)) {
    console.error('ssl is ON but "sslkey" parameter is missing')
    return
  }
  if ((cfg.ssl !== 'no') && (!cfg.sslcert)) {
    console.error('ssl is ON but "sslcert" parameter is missing')
    return
  }
  if (!reverseProxyCfg.sendFileHeader) console.warn('`reverseProxy.sendFileHeader` not defined in ub config. Skip internal locations generation')
  let vars = {
    ubURL: argv.serverURLFromConfig(serverConfig),
    host: cfg.host,
    appPath: cfgPath.replace(/\\/g, '/'),
    addHTTP: cfg.ssl !== 'only',
    addHTTPS: cfg.ssl !== 'no',
    sslkey: cfg.sslkey,
    sslcert: cfg.sslcert,
    ipv6: cfg.ipv6,
    remoteIPHeader: reverseProxyCfg.remoteIPHeader,
    maxDocBodySize: cfg.maxDocBody,
    sendFileHeader: reverseProxyCfg.sendFileHeader,
    sendFileLocationRoot: reverseProxyCfg.sendFileLocationRoot,
    blobStores: []
  }
  let configuredStores = serverConfig.application.blobStores
  if (configuredStores) {
    configuredStores.forEach((storeCfg) => {
      if (storeCfg.path) {
        let pathForConfig = path.isAbsolute(storeCfg.path) ? storeCfg.path : path.join(cfgPath, storeCfg.path)
        pathForConfig = pathForConfig.replace(/\\/g, '/')
        vars.blobStores.push({
          storeName: storeCfg.name,
          storePath: pathForConfig
        })
      }
    })
  }
  let tpl = fs.readFileSync(path.join(__dirname, 'templates', 'nginx-cfg.mustache'), 'utf8')

  let rendered = mustache.render(tpl, vars)
  if (!fs.writeFileSync(cfg.out, rendered)) {
    console.error(`Write to file ${cfg.out} fail`)
  }
  console.info(`
  Config generated and can be included inside nginx.conf using 'include ${cfg.out.replace(/\\/g, '/')};'
  or linked to /etc/nginx/sites-enabled if you are on linux:
  sudo ln -s ${cfg.out.replace(/\\\\/g, '/')} /etc/nginx/sites-available/${cfg.host}.cfg
  sudo ln -s /etc/nginx/sites-available/${cfg.host}.cfg /etc/nginx/sites-enabled
  sudo nginx -s reload
  `)
}
