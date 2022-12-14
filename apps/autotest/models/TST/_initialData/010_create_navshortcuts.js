/**
 * @author pavel.mash
 * Fill navigation shortcuts for TST model
 */

const dataLoader = require('@unitybase/base').dataLoader

/**
 * Initial script for create desktop navigation shortcuts for TST model
 * Used by `ubcli initialize` command
 *
 * @param {ServerSession} session
 */
module.exports = function (session) {
  const conn = session.connection

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
        displayOrder: 9000,
        iconCls: 'u-icon-desktop-document-types'
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
      iconCls: 'u-icon-folder',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'tst_document',
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
        cmdType: 'showForm',
        formCode: 'tst_service-IITSign'
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `tst_crypto` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_service-crypto',
      caption: 'test server-side crypto',
      displayOrder: 35,
      cmdCode: JSON.stringify({
        cmdType: 'showForm',
        formCode: 'tst_service-crypto'
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
      iconCls: 'u-icon-data',
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
  console.log('\t\t\tcreate tst_maindataItems shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_maindataItems',
      iconCls: 'u-icon-data',
      caption: 'tst_maindataItems',
      displayOrder: displayOrder + 5,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'tst_maindataItems',
          columns: [
            'ID',
            'txt',
            'mainData.code',
            'mainData.caption',
            'mainData.manyValue'
          ]
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
      iconCls: 'u-icon-dictionary',
      caption: 'tst_dictionary',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'tst_dictionary',
          columns: [
            'ID',
            'code',
            'caption',
            {
              id: 'filterValue',
              summaryAggregationOperator: 'MAX'
            },
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
        cmdType: 'showForm',
        formCode: 'tst_document-vue'
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
      code: 'tst_document-chart',
      caption: 'UChart test form',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        cmdType: 'showForm',
        formCode: 'tst_document-chart'
      }, null, '\t')
    }
  })

  displayOrder = displayOrder + 10
  console.log('\t\t\tcreate `tst_multiselect` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_multiselect',
      caption: 'Multiselect test',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        cmdType: 'showForm',
        formCode: 'tst_document-multiselect'
      }, null, '\t')
    }
  })

  displayOrder += 10
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

  displayOrder += 10
  console.log('\t\t\tcreate `tst_onlyOffice` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'uba_auditTrail_summary',
      caption: 'Audit with summary',
      iconCls: 'u-icon-signature',
      displayOrder: displayOrder,
      cmdCode: JSON.stringify({
        renderer: 'ext',
        cmdType: 'showList',
        summary: { entity: 'count', request_id: 'sum' },
        summaryDataOnClient: false, // true will calc using loaded store (only current page)
        cmdData: {
          params: [{
            entity: 'uba_auditTrail',
            method: 'select',
            fieldList: [
              'ID',
              'entity',
              'entityinfo_id',
              'actionType',
              'actionUserName',
              'actionTime',
              'remoteIP',
              'request_id'
            ]
          }]
        }
      }, null, '\t')
    }
  })

  // displayOrder += 10
  // console.log('\t\t\tcreate `tst_aclrls` shortcut')
  // conn.insert({
  //   fieldList: ['ID'],
  //   entity: 'ubm_navshortcut',
  //   execParams: {
  //     desktopID: desktopID,
  //     code: 'tst_aclrls',
  //     caption: 'tst_aclrls',
  //     displayOrder: displayOrder,
  //     cmdCode: JSON.stringify({
  //       renderer: 'vue',
  //       cmdType: 'showList',
  //       cmdData: {
  //         entityName: 'tst_aclrls'
  //       }
  //     }, null, '\t')
  //   }
  // })

  displayOrder += 10
  console.log('\t\t\tcreate `tst_gridAction` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      code: 'tst_gridAction',
      caption: 'Grid action test',
      iconCls: 'u-icon-wrench',
      displayOrder: displayOrder,
      cmdCode: `{cmdType: 'showList', cmdData: {
  repository: () => UB.Repository('tst_dictionary')
    .attrs(["ID", "code","caption"]),
  scopedSlots: TST.addGridActions  
}}
`
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
