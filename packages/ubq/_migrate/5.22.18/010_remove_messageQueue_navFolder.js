const {deleteNavShortcuts} = require('@unitybase/uba/_migrate/_helpers/_navigation')

/**
 * @param {SyncConnection} conn
 */
module.exports = function fixRelatedEntityFilterName({conn}) {
  console.log('Migration script start: ', __filename)

  deleteNavShortcuts({conn}, 'adm_folder_UBQ')

  console.log('Migration script finish: %s', __filename)
}
