/**
 * Command line module. Generate domain documentation into single HTML file.
 * Command line usage:

       ubcli generateDoc -?

 * @author pavel.mash 04.02.14
 * @module generateDoc
 * @memberOf module:@unitybase/ubcli
 */
const fs = require('fs')
const argv = require('@unitybase/base').argv
const options = require('@unitybase/base').options
const _ = require('lodash')
const http = require('http')
const path = require('path')
const mustache = require('mustache')

const SNIPPETS_FN = '.jsdoc_snippets.json'
const MIXIN_METHODS = {
  select: {
    src: 'mStorage_api.select',
    doc: null
  },
  insert: {
    src: 'mStorage_api.insert',
    doc: null
  },
  update: {
    src: 'mStorage_api.update',
    doc: null
  },
  delete: {
    src: 'mStorage_api.delete',
    doc: null
  },
  addnew: {
    src: 'mStorage_api.addnew',
    doc: null
  },
  lock: {
    src: 'softLock_api.lock',
    doc: null
  },
  unlock: {
    src: 'softLock_api.unlock',
    doc: null
  },
  renewLock: {
    src: 'softLock_api.renewLock',
    doc: null
  },
  isLocked: {
    src: 'softLock_api.isLocked',
    doc: null
  },
  getallroles: {
    src: 'als_api.getallroles',
    doc: null
  },
  getallstates: {
    src: 'als_api.getallstates',
    doc: null
  },
  newversion: {
    src: 'dataHistory_api.newversion',
    doc: null
  },
  fts: {
    src: 'fts_api.fts',
    doc: null
  },
  ftsreindex: {
    src: 'fts_api.ftsreindex',
    doc: null
  }
}


module.exports = function generateDoc (cfg) {
  let
    session, conn,
    outputFileName,
    domainI18n,
    i, j, len, lenj, k, lenk

  console.time('Generate documentation')
  if (!cfg) {
    let opts = options.describe('generateDoc',
      'Generate domain documentation into single HTML file\nDocumentation generated using default language for user, specified in -u',
      'ubcli'
    )
      .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
      .add({
        short: 'out',
        long: 'out',
        param: 'outputFileName',
        defaultValue: './domainDocumentation.html',
        help: 'Output file path'
      })
    cfg = opts.parseVerbose({}, true)
    if (!cfg) return
  }
  // increase receive timeout to 120s - in case DB server is slow we can easy reach 30s timeout
  http.setGlobalConnectionDefaults({ receiveTimeout: 120000 })
  session = argv.establishConnectionFromCmdLineAttributes(cfg)

  // must be required for translation
  // require('@unitybase/ub/i18n')

  console.log('Session.uData: ', session.uData, typeof session.uData)

  conn = session.connection
  outputFileName = cfg.out

  try {
    let domain = conn.getDomainInfo(true)
    const snippets = generateJsDocSnippets(domain)

    domainI18n = domain.entities

    // add entityCode for each entity in domain
    _.each(domainI18n, function (entity, entityCode) {
      entity.entityCode = entityCode
    })

    domainI18n = _.groupBy(domainI18n, 'modelName')
    // add modelCode for each model in domain
    _.each(domainI18n, function (value, key) {
      value.modelCode = key
      value.entities = []
      value.modelPackage = domain.models[key].packageJSON
    })
    // transform domain to array of entity
    let domainAsArray = _.values(domainI18n)

    for (i = 0, len = domainAsArray.length; i < len; ++i) {
      for (j = 0, lenj = domainAsArray[i].length; j < lenj; ++j) {
        domainAsArray[i].entities[j] = domainAsArray[i][j]
        let e = domainAsArray[i].entities[j]
        _.each(e.attributes, function (value, key) {
          value.attrCode = key
        })
        e.attributes = _.values(e.attributes)
        for (k = 0, lenk = e.attributes.length; k < lenk; ++k) {
          if (e.attributes[k].associatedEntity === '') {
            e.attributes[k].associatedEntity = null
          }
        }

        _.each(domainAsArray[i][j].mixins, function (value, key) {
          value.mixinCode = key
        })
        e.mixins = _.values(e.mixins)
        let methods = _.keys(e.entityMethods).sort()
        e.methodsArray = []
        methods.forEach(methodName => {
          let m = {
            name: methodName,
            jsdoc: {description: ''}
          }
          let snippetLongName = `${e.name}_ns#${methodName}`
          let snippet = snippets.find(s => s.longname === snippetLongName)
          if (snippet) {
            convertServerSideParamsToAPI(snippet)
          }
          if (!snippet && MIXIN_METHODS[methodName]) { // check mixin methods in case method not already documented
            snippet = MIXIN_METHODS[methodName].doc
          }
          if (snippet) {
            m.jsdoc = snippet
          } else {
            console.warn(`${e.name}.${methodName} \t\t - please add a JsDoc for me`)
          }
          e.methodsArray.push(m)
        })
      }
    }

    let tpl = fs.readFileSync(path.join(__dirname, 'templates', 'generateDoc_template.mustache'), 'utf8')
    let appInfo = conn.getAppInfo()
    let appName = appInfo.uiSettings.adminUI.applicationName
    if (typeof appName === 'object') {
      appName = appName[Object.keys(appName)[0]]
      appInfo.uiSettings.adminUI.applicationName = appName
    }
    let rendered = mustache.render(tpl, {
      domain: domainAsArray,
      appInfo: conn.getAppInfo(),
      i18n: function () {
        return function (word) {
          // console.log('translate for ', word, 'to', userLang);
          // return UB.i18n(word, userLang)
          return word
        }
      }
    })
    if (!fs.writeFileSync(outputFileName, rendered)) {
      console.error('Write to file ' + outputFileName + ' fail')
    }
    console.timeEnd('Generate documentation')
    console.info('Result file', outputFileName)
  } finally {
    if (session && session.logout) {
      session.logout()
    }
  }
}

module.exports.shortDoc = 'Generate domain documentation into HTML file'

/**
 * Generate JsDoc snippets for current domain. `npx ubcli generateDoc` is executed from folder with ubConfig
 * @param {UBDomain} domain
 */
function generateJsDocSnippets(domain) {
  const JSDOC_CONG_TMP = '.jsdoc_conf_tmp.json'
  const JSDOC_CONF_TMP_PATH = path.join(process.cwd(), JSDOC_CONG_TMP)
  // check jsdoc is installed
  const jsdocPath = path.join(process.cwd(), 'node_modules', 'jsdoc', 'jsdoc.js')
  if (!fs.existsSync(jsdocPath)) {
    console.warn(`Can't find jsdoc module (expected to be in ${jsdocPath}). API methods documentation generation is skipped`)
    return []
  }
  // create config for jsdoc based on available domain models
  let jsdocConf = {
    "tags": {
      "allowUnknownTags": true
    },
    "source": {
      "include": [
        "./node_modules/@unitybase/stubs/_UBMixinsAPI-stub.js" // mixins doc: mStorage etc
      ],
      "includePattern": ".+\\.js(m|x)?$"
    },
    "plugins": [
      "plugins/markdown",
      "./node_modules/ub-jsdoc/plugins/sripPFromDescription",
      "./node_modules/ub-jsdoc/plugins/memberOfModule.js",
      "./node_modules/ub-jsdoc/plugins/publishedTag.js"
    ]
  }
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules/@unitybase/stubs'))) {
    console.warn('@unitybase/stubs package should be added ad dev dependency for mixin methods documentation generation')
  }
  domain.orderedModels.forEach(m => {
    if (m.realPath) jsdocConf.source.include.push(m.realPath)
  })

  if (fs.existsSync(JSDOC_CONF_TMP_PATH)) fs.unlinkSync(JSDOC_CONF_TMP_PATH)
  fs.writeFileSync(JSDOC_CONF_TMP_PATH, JSON.stringify(jsdocConf, null, '\t'))
  let snippets_full_fn = path.join(process.cwd(), SNIPPETS_FN)
  if (fs.existsSync(snippets_full_fn))  fs.unlinkSync(snippets_full_fn)

  let cmd = `-c "${jsdocPath} -c ./${JSDOC_CONG_TMP} -X > ./${SNIPPETS_FN}"`
  let shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh'
  let res = shellExecute(shell, cmd)
  if (res !== 0) {
    console.error(`Got error from jsdoc while executing command: ${shell} ${cmd}`)
    return []
  }

  let snippets = require(snippets_full_fn)
  // fill build-in mixins
  // TODO - how to add a custom mixin documentation (ldoc etc)?
  Object.keys(MIXIN_METHODS).forEach(m => {
    let mdoc = MIXIN_METHODS[m]
    mdoc.doc = snippets.find(s => s.longname === mdoc.src)
  })
  return snippets
}

/*
{
 "params": [
  {
    "type": {
        "names": [
            "ubMethodParams"
        ]
    },
    "name": "ctxt"
  },
  {
    "type": {
        "names": [
            "string",
            "number"
        ]
    },
    "description": "Name or ID of the user for whom you want to change the password",
    "name": "ctxt.mParams.forUser"
  },
  {
    "type": {
        "names": [
            "string"
        ]
    },
    "description": "New password",
    "name": "ctxt.mParams.newPwd"
   },
]*/
/**
 * Convert a snipped what contains a server-side parameters description into client-side API
 * @param snipped
 */
function convertServerSideParamsToAPI(snippet) {
  let prms = snippet.params
  if (!prms || !prms.length) return
  prms.forEach(p => {
    // ubMethodParams -> object
    if (p.type && p.type.names) p.type.names = p.type.names.map(n => n === 'ubMethodParams' ? 'object' : n)
    // ctxt.mParams.newPwd -> ctxt.newPwd
    p.name = p.name.replace('.mParams', '')
  })
}