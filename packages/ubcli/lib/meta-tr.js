const cmdLineOpt = require('@unitybase/base/options')
const fs = require('fs')

module.exports = function metaTr (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('meta-tr', '*.meta transformation to fit a latest meta JSON schema', 'ub')
      .add({ short: 'm', long: 'meta', param: 'metaFile', help: 'Path to *.meta or *.meta.lang file to transform' })
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  let metaContent = fs.readFileSync(options.meta, { encoding: 'utf-8' })
  let jsonC = JSON.parse(metaContent)
  if (Array.isArray(jsonC.attributes)) {
    console.info('metafile attributes are already converted to array')
    return
  }
  let newAttributes = []
  for (let attrName in jsonC.attributes) {
    let oldAttr = jsonC.attributes[attrName]
    let attr = Object.assign({ name: attrName }, oldAttr)
    if (attr.mapping) {
      if (!Array.isArray(attr.mapping)) {
        let newMappings = []
        for (let dialectName in attr.mapping) {
          // noinspection JSUnfilteredForInLoop
          let oldDialect = attr.mapping[dialectName]
          let newDialect = Object.assign({ name: dialectName }, oldDialect)
          newMappings.push(newDialect)
        }
        attr.mapping = newMappings
      }
    }
    newAttributes.push(attr)
  }
  jsonC.attributes = newAttributes
  metaContent = JSON.stringify(jsonC, null, '  ')

  fs.writeFileSync(options.meta, metaContent)
}

module.exports.shortDoc =
`Transform *.meta file attributes from Object to Array
\t\t\trepresentation as defined in latest entity JSON schema`
