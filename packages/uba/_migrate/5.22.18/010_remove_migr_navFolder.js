const {deleteNavShortcuts} = require('../_helpers/_navigation')

/**
 * @param {SyncConnection} conn
 */
module.exports = function fixRelatedEntityFilterName({conn}) {
  console.log('Migration script start: ', __filename)

  deleteNavShortcuts({conn}, 'adm_folder_mirg')

  console.log('Migration script finish: %s', __filename)
}
