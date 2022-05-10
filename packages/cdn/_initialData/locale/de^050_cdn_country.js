const loader = require('@unitybase/base').dataLoader
const CSV = require('@unitybase/base').csv
const fs = require('fs')
/**
 * @author pavel.mash
 * Country localization to German for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'cdn_country',
    keyAttribute: 'intCode',
    localization: []
  }
  let rawData = fs.readFileSync(__filename.replace(/\.js$/, '.csv'), 'utf8')
  let rows = CSV.parse(rawData)
  if (!rows.length) {
    console.error('CSV file with country localisation is empty')
    return
  }
  let intCodeIndex = rows[0].indexOf('intCode')
  let nameIndex = rows[0].indexOf('name')
  let fullNameIndex = rows[0].indexOf('fullName')
  if (intCodeIndex === -1 || nameIndex === -1 || fullNameIndex === -1) {
    console.error('CSV file must contains a columnus with names incCode, name, fullName')
    return
  }
  for (let r = 1, l = rows.length; r < l; r++) {
    if (rows[r][intCodeIndex]) {
      localizationConfig.localization.push({
        keyValue: rows[r][intCodeIndex],
        execParams: {
          name: rows[r][nameIndex],
          fullName: rows[r][fullNameIndex]
        }
      })
    } else {
      console.warn(`Empty intCode in row ${r}`)
    }
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
