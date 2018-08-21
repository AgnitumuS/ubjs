/**
 * @author pavel.mash
 * Fill navigation shortcuts for TST model
 */

/**
 * Initial script for create desktop navigation shortcuts for TST model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  var
    desktopID, conn = session.connection

  desktopID = conn.lookup('ubm_desktop', 'ID', {expression: 'code', condition: 'equal', values: {code: 'tst_desktop'}})
  console.info('\tFill `Test` desktop')
  if (!desktopID) {
    console.info('\t\tcreate new `Test` desktop')
    desktopID = conn.insert({
      entity: 'ubm_desktop',
      fieldList: ['ID'],
      execParams: {
        code: 'tst_desktop',
        caption: 'Test'
      }
    })
  } else {
    console.info('\t\tuse existed desktop with code `tst_desktop`', desktopID)
  }

  console.log('\t\t\tcreate `tst_document` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_document',
      caption: 'Document test',
      iconCls: 'fa fa-folder',
      displayOrder: 10,
      cmdCode: JSON.stringify({cmdType: 'showList', cmdData: {params: [{ entity: 'tst_document', method: 'select', fieldList: ['favorites.code', 'docDate', 'code', 'description', 'fileStoreSimple']}]}}, null, '\t')
    }
  })

  console.log('\t\t\tcreate `tst_clob` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_clob',
      caption: 'CLOB test',
      displayOrder: 20,
      cmdCode: JSON.stringify({cmdType: 'showList', cmdData: {params: [{ entity: 'tst_clob', method: 'select', fieldList: ['code', 'description', 'text100', 'text2']}]}}, null, '\t')
    }
  })

  console.log('\t\t\tcreate `tst_IITSign` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_IITSign',
      caption: 'test IIT Sign',
      displayOrder: 30,
      cmdCode: JSON.stringify({cmdType: 'showForm', formCode: 'tst_service-IITSign'}, null, '\t')
    }
  })

  let displayOrder = 40;
  ['tst_maindata', 'tst_mainunity', 'tst_dictionary', 'tst_IDMapping', 'tst_histDict'].forEach(function (entityCode) {
    console.log('\t\t\tcreate `', entityCode, '` shortcut')
    conn.insert({
      fieldList: ['ID'],
      entity: 'ubm_navshortcut',
      execParams: {
        desktopID: desktopID,
        code: entityCode,
        caption: entityCode,
        displayOrder: displayOrder,
        cmdCode: JSON.stringify({cmdType: 'showList', cmdData: {params: [{ entity: entityCode, method: 'select', fieldList: '*'}]}}, null, '\t')
      }
    })
    displayOrder = displayOrder + 10
  })

  console.log('\t\t\tcreate `Vue test` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_document-vue',
      caption: 'VueJS form test',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({cmdType: 'showForm', formCode: 'tst_document-vue'}, null, '\t')
    }
  })

  console.log('\t\t\tcreate `tst_onlyOffice` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_onlyOffice',
      caption: 'tst_onlyOffice',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({cmdType: 'showList', cmdData: {params: [{ entity: 'tst_onlyoffice', method: 'select', fieldList: ['ID', 'caption']}]}}, null, '\t')
    }
  })
}
