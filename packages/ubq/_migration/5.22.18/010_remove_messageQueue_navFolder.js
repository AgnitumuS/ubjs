/**
 * @param {SyncConnection} conn
 */
module.exports = function fixRelatedEntityFilterName({conn}) {
  console.log('Migration script start: ', __filename)

  const folderName = 'adm_folder_UBQ'

  console.log('\tChecking folder %s exists...', folderName)
  const shortcutID = conn.Repository('ubm_navshortcut')
    .attrs('ID')
    .where('code', '=', folderName)
    .selectScalar()
  if (Number.isInteger(shortcutID)) {
    console.log('Checking the shortcut does not have child elements...')
    const childID = conn.Repository('ubm_navshortcut')
      .attrs('ID')
      .where('parentID', '=', shortcutID)
      .limit(1)
      .selectScalar()
    if (Number.isInteger(childID)) {
      console.warn('Child element(s) exist!  Do nothing.')
    } else {
      console.log('Deleting the folder...')
      conn.query({
        entity: 'ubm_navshortcut',
        method: 'delete',
        execParams: {
          ID: shortcutID
        }
      })
      console.log('Done')
    }
  } else {
    console.log('The shortcut does not exist, do nothing')
  }

  console.log('Migration script finish: %s', __filename)
}
