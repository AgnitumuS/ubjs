/**
 * @param {SyncConnection} conn
 * @param {string[]} codes
 */
function deleteNavShortcuts({conn}, codes) {
  console.log('\tSelecting folder(s) IDs for %j...', codes)
  const shortcutIDs = conn.Repository('ubm_navshortcut')
    .attrs('ID')
    .where('code', 'in', codes)
    .selectAsArrayOfValues()
  console.log('\tSelected %d IDs', shortcutIDs.length)
  for (const shortcutID of shortcutIDs) {
    console.log('Checking the shortcut %d does not have child elements...', shortcutID)
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
  }

  console.log('Migration script finish: %s', __filename)
}

module.exports = {
  deleteNavShortcuts
}