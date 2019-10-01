const loader = require('@unitybase/base').dataLoader
const CSV = require('@unitybase/base').csv
const fs = require('fs')
/**
 * @author pavel.mash
 * Country localization to Ukrainian for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'cdn_region',
    keyAttribute: 'code',
    localization: [
      // {keyValue: 'CHECK',  execParams: {name: 'Розрахунковий'}}
    ]
  }
  let rawData = fs.readFileSync(__filename.replace(/\.js$/, '_ukraine.csv'), 'utf8')
  let rows = CSV.parse(rawData)
  if (!rows.length) {
    console.error('CSV file with region localisation is empty')
    return
  }
  let codeI = rows[0].indexOf('code')
  let regionTypeI = rows[0].indexOf('regionType')
  let nameI = rows[0].indexOf('name')
  let fullNameI = rows[0].indexOf('fullName')
  if (codeI === -1 || nameI === -1 || regionTypeI === -1 || fullNameI === -1) {
    console.error('CSV file must contains a columns with names code, regionType, name, fullName')
    return
  }
  for (let r = 1, l = rows.length; r < l; r++) {
    if (rows[r][codeI]) {
      localizationConfig.localization.push({
        keyValue: rows[r][codeI],
        execParams: {
          name: rows[r][nameI],
          caption: rows[r][nameI],
          fullName: rows[r][fullNameI]
        }
      })
    } else {
      console.warn(`Empty code in row ${r}`)
    }
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
