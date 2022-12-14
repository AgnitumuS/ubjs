const loader = require('@unitybase/base').dataLoader
const CSV = require('@unitybase/base').csv
const fs = require('fs')
/**
 * @author pavel.mash
 * Region types localization to English for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'cdn_regiontype',
    keyAttribute: 'code',
    localization: [
      // {keyValue: 'CHECK',  execParams: {name: 'Розрахунковий'}}
    ]
  }
  let rawData = fs.readFileSync(__filename.replace(/\.js$/, '.csv'), 'utf8')
  let rows = CSV.parse(rawData)
  if (!rows.length) {
    console.error('CSV file with region types localisation is empty')
    return
  }
  let intCodeIndex = rows[0].indexOf('code')
  let nameIndex = rows[0].indexOf('name')
  if (intCodeIndex === -1 || nameIndex === -1) {
    console.error('CSV file must contains a columns with names code & name')
    return
  }
  for (let r = 1, l = rows.length; r < l; r++) {
    if (rows[r][intCodeIndex]) {
      localizationConfig.localization.push({
        keyValue: rows[r][intCodeIndex],
        execParams: {
          name: rows[r][nameIndex]
        }
      })
    } else {
      console.warn(`Empty intCode in row ${r}`)
    }
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
