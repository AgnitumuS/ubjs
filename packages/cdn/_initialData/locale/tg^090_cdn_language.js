/**
* Language list localization to Tajik for CDN model
* Used by `ubcli initialize` command
* @param {ServerSession} session
*/

module.exports = function (session) {
  const loader = require('@unitybase/base').dataLoader
  const CSV = require('@unitybase/base').csv
  const fs = require('fs')
  const localizationConfig = {
    entity: 'cdn_language',
    keyAttribute: 'code',
    localization: []
  }
  let rawData = fs.readFileSync(__filename.replace(/\.js$/, '.csv'), 'utf8')
  let rows = CSV.parse(rawData)
  if (!rows.length) {
    console.error('CSV file with country localization is empty')
    return
  }
  let codeIndex = rows[0].indexOf('code')
  let languageNameIndex = rows[0].indexOf('languageName')
  if (codeIndex === -1 || languageNameIndex === -1) {
    console.error('CSV file must contains a columns with names code, languageName')
    return
  }
  for (let r = 1, l = rows.length; r < l; r++) {
    if (rows[r][codeIndex]) {
      localizationConfig.localization.push({
        keyValue: rows[r][codeIndex],
        execParams: {
          languageName: rows[r][languageNameIndex]
        }
      })
    } else {
      console.warn(`Empty code value in row ${r}`)
    }
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
