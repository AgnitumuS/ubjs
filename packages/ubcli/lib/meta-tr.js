const cmdLineOpt = require('@unitybase/base/options')
const path = require('path')
const fs = require('fs')

const fileList = []

/**
 * Creates a file path list for a directory (recursively)
 * @param {string} initialDirectory - path of initial directory
 */
function readDirectoryFiles (initialDirectory) {
  const directoryContent = fs.readdirSync(initialDirectory)
  directoryContent.forEach(element => {
    const elementPath = path.join(initialDirectory, element)
    if (fs.statSync(elementPath).isDirectory()) {
      readDirectoryFiles(elementPath)
    }
    if (fs.statSync(elementPath).isFile() && elementPath.indexOf('.meta') > 3) {
      fileList.push(elementPath)
    }
  })
}

module.exports = function metaTr (options) {
  if (!options) {
    let opts = cmdLineOpt.describe('meta-tr', '*.meta transformation to fit a latest meta JSON schema', 'ub')
      .add({ short: 'm', long: 'meta', param: 'metaFile', help: `Path to *.meta or *.meta.lang file or 
       to the directory contained *.meta files to transform` })
    options = opts.parseVerbose({}, true)
    if (!options) return
  }

  if (fs.statSync(options.meta).isFile()) {
    fileList.push(options.meta)
  } else if (fs.statSync(options.meta).isDirectory()) {
    readDirectoryFiles(options.meta)
  } else {
    console.info(`${options.meta} - not valid path to file or directory`)
    return
  }

  console.info(`Start convert files:\n ${fileList.join('\n')}`)
  const readyConvertedFiles = []
  fileList.forEach(filePath => {
    try {
      let metaContent = fs.readFileSync(filePath, {encoding: 'utf-8'})
      // remove all comments from JSON
      metaContent = metaContent.replace(/(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm, '')
      let jsonC = JSON.parse(metaContent)
      if (Array.isArray(jsonC.attributes)) {
        readyConvertedFiles.push(filePath.replace(options.meta, ''))
        return
      }
      let newAttributes = []
      for (let attrName in jsonC.attributes) {
        let oldAttr = jsonC.attributes[attrName]
        let attr = Object.assign({name: attrName}, oldAttr)
        if (attr.mapping) {
          if (!Array.isArray(attr.mapping)) {
            let newMappings = []
            for (let dialectName in attr.mapping) {
              // noinspection JSUnfilteredForInLoop
              let oldDialect = attr.mapping[dialectName]
              let newDialect = Object.assign({name: dialectName}, oldDialect)
              newMappings.push(newDialect)
            }
            attr.mapping = newMappings
          }
        }
        newAttributes.push(attr)
      }
      jsonC.attributes = newAttributes
      metaContent = JSON.stringify(jsonC, null, '  ')
      fs.writeFileSync(filePath, metaContent)
    } catch (e) {
      console.error(`!!!Error converting: ${filePath}`)
    }
  })
  console.info(`Meta-file attributes are already converted to array:\n${readyConvertedFiles.join(';')}`)
}

module.exports.shortDoc =
`Transform *.meta file attributes from Object to Array
\t\t\trepresentation as defined in latest entity JSON schema`
