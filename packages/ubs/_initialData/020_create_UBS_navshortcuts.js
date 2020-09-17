const { dataLoader, csv } = require('@unitybase/base')
const fs = require('fs')
const path = require('path')

/**
 * @author pavel.mash
 * Fill navigation shortcuts for UBM model
 */

/**
 * Initial script for create UnityBase Administration desktop navigation shortcuts for UBM model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  const conn = session.connection
  const domain = conn.getDomainInfo()
  if (!domain.has('ubm_desktop') || !domain.has('ubm_navshortcut')) {
    console.info('\tSkip shortcut initialization - entity ubm_navshortcut not in domain')
    return
  }

  let desktopID = conn.lookup('ubm_desktop', 'ID', {expression: 'code', condition: 'equal', values: {code: 'adm_desktop'}})
  if (!desktopID) {
    throw new Error('Can\'t find row in ubm_desktop with code="adm_desktop". May be UBA model initialized incorrectly?')
  }

  console.log('\t\tcreate `Miscellaneous` folder')
  let folderID = conn.insert({
    entity: 'ubm_navshortcut',
    fieldList: ['ID'],
    execParams: {
      desktopID: desktopID,
      code: 'adm_folder_misc',
      caption: 'Miscellaneous',
      isFolder: true,
      isCollapsed: true,
      iconCls: 'u-icon-setting',
      displayOrder: 40
    }
  })

  console.log('\t\t\tcreate `Settings` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_settings',
      caption: 'Settings',
      iconCls: 'u-icon-setting',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_settings'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Stored UI filters` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_filter',
      caption: 'Stored UI filters',
      displayOrder: 20,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_filter'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Registration counters` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_numcounter',
      caption: 'Counters',
      displayOrder: 30,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_numcounter'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Reserved counters` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_numcounterreserv',
      caption: 'Counters (reservation)',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_numcounterreserv'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Soft locks` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_softLock',
      caption: 'Soft locks',
      displayOrder: 50,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_softLock',
          columns: ['lockUser', 'entity', 'lockID', 'lockType', 'lockTime']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Notifications` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_message',
      caption: 'Notifications',
      displayOrder: 60,
      iconCls: 'u-icon-bell',
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_message_edit',
          columns: ['messageBody', 'messageType', 'complete', 'startDate', 'expireDate']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `GlobalCache` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_globalCache',
      caption: 'Server-side cache',
      displayOrder: 60,
      iconCls: 'u-icon-data',
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_globalCache',
          columns: ['ID', 'key', 'value']
        }
      }, null, '\t')
    }
  })

  folderID = conn.lookup('ubm_navshortcut', 'ID', {expression: 'code', condition: 'equal', values: {code: 'adm_folder_UI'}})
  if (!folderID) {
    console.log('\t\tcreate `UI` folder')
    folderID = conn.insert({
      entity: 'ubm_navshortcut',
      fieldList: ['ID'],
      execParams: {
        desktopID: desktopID,
        code: 'adm_folder_UI',
        caption: 'UI',
        isFolder: true,
        isCollapsed: false,
        iconCls: 'u-icon-image',
        displayOrder: 30
      }
    })
  }
  console.log('\t\tuse `UI` folder')

  console.log('\t\t\tcreate `Reports` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubs_report',
      caption: 'Reports',
      displayOrder: 60,
      iconCls: 'u-icon-book',
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubs_report',
          columns: ['ID', 'model', 'report_code', {
            id: 'name',
            format: 'return UB.i18n(value)'
          }]
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tSetting up default ubs navigation shortcuts access rights')
  dataLoader.loadSimpleCSVData(conn,
    path.join(__dirname, 'ubm_navshortcut_acl.csv'),
    'ubm_navshortcut_acl',
    'instanceID;subjID'.split(';'),
    [
      dataLoader.lookup(conn, 'ubm_navshortcut', 'code', 0),
      dataLoader.lookup(conn, 'uba_subject', 'code', 1)
    ],
    1)
}
