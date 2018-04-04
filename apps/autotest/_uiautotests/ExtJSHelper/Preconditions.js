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

export { deleteExistDesktop, getWindowError, insertDesktop, deleteExistShortcut, insertShortcut }