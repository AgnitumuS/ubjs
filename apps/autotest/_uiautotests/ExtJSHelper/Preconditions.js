/* Global precondition functions */
import { ClientFunction, t } from 'testcafe'

const getWindowError = ClientFunction(prop => window.onerror = prop)

async function deleteExistDesktop (code) {
  await ClientFunction(code => {
    UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', code)
      .selectAsObject()
      .then(res => {
        if (res.length) {
          $App.connection.query({
            entity: 'ubm_desktop', method: 'delete', execParams: {ID: res[0].ID}
          }).then(res => { return res })
        }
      })
  })(code)
}

async function insertDesktop (code, caption) {
  await ClientFunction((code, caption) => {
    UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', code)
      .selectSingle()
      .then(res => {
        if (!res) {
          $App.connection.query({
            entity: 'ubm_desktop',
            method: 'insert',
            fieldList: ['ID', 'code', 'caption'],
            execParams: {
              code: code,
              caption: caption
            }
          }).then(res => { return res })
        }
      })
  })(code, caption)
}

async function deleteExistShortcut (code) {
  await ClientFunction(code => {
    UB.Repository('ubm_navshortcut').attrs('ID', 'code').where('code', '=', code)
      .selectSingle()
      .then(res => {
        if (res) {
          $App.connection.query({
            entity: 'ubm_navshortcut', method: 'delete', execParams: {ID: res.ID}
          }).then(res => { return res })
        }
      })
  })(code)
}

async function insertShortcut (code, caption, desktopCode, cmdCode) {
  await ClientFunction((code, caption, desktopCode, cmdCode) => {
    UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', desktopCode)
      .selectSingle()
      .then(desktop => {
        if (desktop) {
          UB.Repository('ubm_navshortcut').attrs('ID', 'code').where('code', '=', code)
            .selectSingle()
            .then(res => {
              if (!res) {
                $App.connection.query({
                  entity: 'ubm_navshortcut',
                  method: 'insert',
                  fieldList: ['ID'],
                  execParams: {
                    desktopID: desktop.ID,
                    code: code,
                    caption: caption,
                    cmdCode: cmdCode
                  }
                }).then(res => { return res })
              }
            })
        }
      })
  })(code, caption, desktopCode, cmdCode)
}

function insertOrUpdateFolder (desktop, folder, params) {
  if (!folder) {
    return $App.connection.query({
      entity: 'ubm_navshortcut',
      method: 'insert',
      fieldList: ['ID', 'code', 'desktopID'],
      execParams: {
        desktopID: desktop.ID,
        code: params.folderCode,
        caption: params.folderCaption,
        isFolder: true
      }
    }).then(newFolderData => {
      return {ID: newFolderData.resultData.data[0][0]}
    })
  } else if (folder.desktopID !== desktop.ID) {
    return $App.connection.query({
      entity: 'ubm_navshortcut',
      method: 'update',
      fieldList: ['ID', 'code', 'desktopID'],
      __skipOptimisticLock: true,
      execParams: {
        ID: folder.ID,
        desktopID: desktop.ID
      }
    }).then(newFolderData => {
      return {ID: newFolderData.resultData.data[0][0]}
    })
  } else {
    return Promise.resolve(folder)
  }
}
async function checkIsShortcutInFolder (params) {
  await ClientFunction((params) => {
    return Promise.all([
      UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', params.desktopCode).selectSingle(),
      UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID').where('code', '=', params.folderCode).selectSingle(),
      UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID', 'parentID').where('code', '=', params.shortcutCode).selectSingle()
    ]).then(([desktop, folder, shortcut]) => {
      return insertOrUpdateFolder(desktop, folder, params).then(newFolder => {
        return Promise.resolve([desktop, newFolder, shortcut])
      })
    }).then(([desktop, folder, shortcut]) => {
      if (!shortcut) {
        return $App.connection.query({
          entity: 'ubm_navshortcut',
          method: 'insert',
          fieldList: ['ID'],
          execParams: {
            desktopID: desktop.ID,
            code: params.shortcutCode,
            caption: params.shortcutCaption,
            parentID: folder.ID,
            isFolder: false
          }
        })
      } else if (shortcut.desktopID !== desktop.ID || shortcut.parentID !== folder.ID) {
        return $App.connection.query({
          entity: 'ubm_navshortcut',
          method: 'update',
          fieldList: [],
          __skipOptimisticLock: true,
          execParams: {
            ID: shortcut.ID,
            desktopID: desktop.ID,
            parentID: folder.ID
          }
        })
      }
    })
  }, {
    dependencies: {insertOrUpdateFolder}
  })(params)
}

export { deleteExistDesktop, getWindowError, insertDesktop, deleteExistShortcut, insertShortcut, checkIsShortcutInFolder }
