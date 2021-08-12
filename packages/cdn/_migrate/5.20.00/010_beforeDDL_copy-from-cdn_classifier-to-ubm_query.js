module.exports = copyFromCdnClassifierToUbmQuery
const argv = require('@unitybase/base').argv
/**
 * Migrate a cdn_classifier into ubm_query
 * @param {object} params
 * @param {Object<string, DBConnection>} params.dbConnections
 */
function copyFromCdnClassifierToUbmQuery ({ dbConnections }) {
  const cfg = argv.getServerConfiguration()
  const defaultLang = cfg.application.defaultLang
  const otherLangs = dbConnections.main.config.supportLang.filter(l => l !== defaultLang)
  const namesArr = otherLangs.map(l => 'name_' + l)
  namesArr.push('name')
  const namesForSQL = namesArr.join(',') // name_en, name_rum name
  const SQL = `INSERT INTO ubm_query (
  ID,
  code,
  ${namesForSQL},
  ubql,
  type,
  mi_unityEntity,
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
)
SELECT
  ID,
  code,
  ${namesForSQL},
  '{}',
  'classifier',
  'cdn_clasdifier',
  mi_owner,
  mi_createdate,
  mi_createuser,
  mi_modifydate,
  mi_modifyuser,
  mi_deletedate,
  mi_deleteuser
FROM cdn_classifier classifier
WHERE NOT EXISTS (
  SELECT ID
  FROM ubm_query query
  WHERE query.ID = classifier.ID
)`
  try {
    dbConnections.main.execParsed(SQL)
  } catch (e) {
    // in case of migration from very old version cdn_classifier may not exists
  }
}
