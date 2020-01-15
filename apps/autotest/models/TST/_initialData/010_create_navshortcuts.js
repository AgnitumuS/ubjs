/**
 * @author pavel.mash
 * Fill navigation shortcuts for TST model
 */

const dataLoader = require('@unitybase/base').dataLoader

/**
 * Initial script for create desktop navigation shortcuts for TST model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let conn = session.connection

  let desktopID = conn.lookup('ubm_desktop', 'ID', { expression: 'code', condition: 'equal', values: { code: 'tst_desktop' } })
  console.info('\tFill `Test` desktop')
  if (!desktopID) {
    console.info('\t\tcreate new `Test` desktop')
    desktopID = conn.insert({
      entity: 'ubm_desktop',
      fieldList: ['ID'],
      execParams: {
        code: 'tst_desktop',
        caption: 'Test',
        iconCls: 'el-icon-lollipop'
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
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          repository: {
            entity: 'tst_document',
            method: 'select',
            fieldList: ['favorites.code', 'docDate', 'code', 'description', 'fileStoreSimple']
          },
          columns: ['favorites.code', 'docDate', 'code', 'description', 'fileStoreSimple']
        }
      }, null, '\t')
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
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'tst_clob',
          columns: ['code', 'description', 'text100', 'text2']
        }
      }, null, '\t')
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
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showForm',
        formCode: 'tst_service-IITSign'
      }, null, '\t')
    }
  })

  let displayOrder = 40;
  ['tst_mainunity', 'tst_IDMapping', 'tst_histDict'].forEach(function (entityCode) {
    console.log('\t\t\tcreate `', entityCode, '` shortcut')
    conn.insert({
      fieldList: ['ID'],
      entity: 'ubm_navshortcut',
      execParams: {
        desktopID: desktopID,
        code: entityCode,
        caption: entityCode,
        displayOrder: displayOrder,
        cmdCode: JSON.stringify({
          renderer: 'vue',
          cmdType: 'showList',
          cmdData: {
            entityName: entityCode
          }
        }, null, '\t')
      }
    })
    displayOrder = displayOrder + 10
  })
  console.log('\t\t\tcreate tst_maindata shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_maindata',
      iconCls: 'fa fa-database',
      caption: 'tst_maindata',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'tst_maindata'
        }
      }, null, '\t')
    }
  })
  displayOrder = displayOrder + 10

  console.log('\t\t\tcreate `', 'tst_dictionary', '` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_dictionary',
      iconCls: 'fa fa-book',
      caption: 'tst_dictionary',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          repository: {
            entity: 'tst_dictionary',
            method: 'select',
            fieldList: [
              'ID',
              'code',
              'caption',
              'filterValue',
              'currencyValue',
              'floatValue',
              'calculated',
              'booleanColumn',
              'jsonColumn',
              'jsonColumn.propI',
              'jsonColumn.propS'
            ]
          },
          columns: [
            'ID',
            'code',
            'caption',
            'filterValue',
            'currencyValue',
            'floatValue',
            'calculated',
            'booleanColumn',
            'jsonColumn',
            { id: 'jsonColumn.propI', label: 'Int json property' },
            { id: 'jsonColumn.propS', label: 'String json property' }
          ]
        }
      }, null, '\t')
    }
  })
  displayOrder = displayOrder + 10
  console.log('\t\t\tcreate `Vue test` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_document-vue',
      caption: 'VueJS form test',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showForm',
        formCode: 'tst_document-vue'
      }, null, '\t')
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
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'tst_onlyoffice',
          columns: ['ID', 'caption']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `tst_aclrls` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_aclrls',
      caption: 'tst_aclrls',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'tst_aclrls'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tSetting up default TST navigation shortcuts access rights')
  dataLoader.loadArrayData(conn,
    [['tst_desktop', 'User']],
    'ubm_desktop_adm',
    'instanceID;admSubjID'.split(';'),
    [
      dataLoader.lookup(conn, 'ubm_desktop', 'code', 0),
      dataLoader.lookup(conn, 'uba_subject', 'code', 1)
    ],
    1)
  dataLoader.loadArrayData(conn,
    [
      ['tst_document', 'User'],
      ['tst_document-vue', 'User'],
      ['tst_dictionary', 'User']
    ],
    'ubm_navshortcut_adm',
    'instanceID;admSubjID'.split(';'),
    [
      dataLoader.lookup(conn, 'ubm_navshortcut', 'code', 0),
      dataLoader.lookup(conn, 'uba_subject', 'code', 1)
    ],
    1)
}
