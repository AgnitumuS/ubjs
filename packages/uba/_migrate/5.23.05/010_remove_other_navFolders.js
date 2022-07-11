const { deleteNavShortcuts } = require('../_helpers/_navigation')

/**
 * @param {SyncConnection} conn
 */
module.exports = function fixRelatedEntityFilterName ({ conn }) {
  console.log('Migration script start: ', __filename)

  deleteNavShortcuts({ conn }, ['adm_folder_UI', 'adm_folder_devTools'])

  console.log('Migration script finish: %s', __filename)
}
