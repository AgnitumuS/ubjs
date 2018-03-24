import { extSelector, getWindowError } from './ExtJSHelper/ExtJSSelector'
import { Selector, ClientFunction } from 'testcafe'

const testPage = `http://localhost:888/adm-dev`

fixture(`Preparing data for Move folder and shortcut to Desktop test`)
  .page(testPage)

test('Check Pure ExtJS Form', async t => {
  //login in systems
  let lw = await extSelector('.ub-login-window')
  await lw.loginWin().setCredentials('admin', 'admin')
  await lw.loginWin().loginBtnClick()
})

/*
async function checkPrecondition () {
  return await ClientFunction(() => {
    UB.Repository('ubm_desktop').attrs('ID', 'code').where('code', '=', 'adm_desktop').selectAsObject()
      .done(dst => {
        UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID').where('code', '=', 'test_folder').selectAsObject()
          .done(sht => {
            if (!sht.length) {
              $App.connection.query(
                {
                  entity: 'ubm_navshortcut',
                  method: 'insert',
                  fieldList: ['ID'],
                  execParams: {
                    desktopID: dst[0].ID,
                    code: 'test_folder',
                    caption: 'Test folder',
                    isFolder: true
                  }
                }
              ).done(res => {
                UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID', 'parentID').where('code', '=', 'test_shortcut').selectAsObject()
                  .done(shtTest => {
                    if (!shtTest.length) {
                      $App.connection.query(
                        {
                          entity: 'ubm_navshortcut',
                          method: 'insert',
                          fieldList: ['ID'],
                          execParams: {
                            desktopID: dst[0].ID,
                            code: 'test_shortcut',
                            caption: 'Test shortcut',
                            parentID: res.resultData.data[0][0],
                            isFolder: false
                          }
                        }
                      )
                    }
                  })
              })
            }
            else if (sht[0].desktopID != dst[0].ID) {
              $App.connection.query(
                {
                  entity: 'ubm_navshortcut',
                  method: 'update',
                  fieldList: [],
                  __skipOptimisticLock: true,
                  execParams: {
                    ID: sht[0].ID,
                    desktopID: dst[0].ID
                  }
                }
              )
            }
            return sht
          }).done(sht => {
          UB.Repository('ubm_navshortcut').attrs('ID', 'code', 'desktopID', 'parentID').where('code', '=', 'test_shortcut').selectAsObject()
            .done(shtTest => {
              if (!shtTest.length) {
                $App.connection.query(
                  {
                    entity: 'ubm_navshortcut',
                    method: 'insert',
                    fieldList: ['ID'],
                    execParams: {
                      desktopID: dst[0].ID,
                      code: 'test_shortcut',
                      caption: 'Test shortcut',
                      parentID: sht[0].ID,
                      isFolder: false
                    }
                  }
                )
              }
              else if (shtTest[0].desktopID != dst[0].ID || shtTest[0].parentID != sht[0].ID) {
                $App.connection.query(
                  {
                    entity: 'ubm_navshortcut',
                    method: 'update',
                    fieldList: [],
                    __skipOptimisticLock: true,
                    execParams: {
                      ID: shtTest[0].ID,
                      desktopID: dst[0].ID,
                      parentID: sht[0].ID
                    }
                  }
                )
              }
            })
        })
      })

  })()
}
*/