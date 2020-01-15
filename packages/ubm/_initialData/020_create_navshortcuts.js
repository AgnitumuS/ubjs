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
  'use strict'
  var desktopID; var folderID
  var conn = session.connection

  desktopID = conn.lookup('ubm_desktop', 'ID', { expression: 'code', condition: 'equal', values: { code: 'adm_desktop' } })
  console.info('\tFill `Administrator` desktop')
  if (!desktopID) {
    console.info('\t\tcreate new `Administrator` desktop')
    desktopID = conn.insert({
      entity: 'ubm_desktop',
      fieldList: ['ID'],
      execParams: {
        code: 'adm_desktop',
        caption: 'Administrator',
        iconCls: 'el-icon-setting'
      }
    })
  } else {
    console.info('\t\tuse existed desktop with code `adm_desktop`', desktopID)
  }

  folderID = conn.lookup('ubm_navshortcut', 'ID', { expression: 'code', condition: 'equal', values: { code: 'adm_folder_UI' } })
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
        iconCls: 'fa fa-picture-o',
        displayOrder: 30
      }
    })
  }

  console.log('\t\t\tcreate `Enumerations` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubm_enum',
      caption: 'Enumerations',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          repository: {
            entity: 'ubm_enum',
            method: 'select',
            fieldList: ['eGroup', 'sortOrder', 'code', 'shortName', 'name'],
            orderList: {
              eGroup: { expression: 'eGroup', order: 'asc' },
              sortOrder: { expression: 'sortOrder', order: 'asc' }
            }
          },
          columns: ['eGroup', 'sortOrder', 'code', 'shortName', 'name']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Desktops` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubm_desktop',
      caption: 'Desktops',
      displayOrder: 20,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubm_desktop'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Shortcuts` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubm_navshortcut',
      caption: 'Shortcuts',
      displayOrder: 30,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubm_navshortcut'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Forms` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubm_form',
      caption: 'Forms',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubm_form',
          columns: ['entity', 'code', 'description', 'caption', 'formType', 'isDefault']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Queries` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubm_query',
      caption: 'Queries',
      displayOrder: 50,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubm_query',
          columns: ['code', 'name']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `ER diagrams` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'ubm_diagram',
      caption: 'ER diagrams',
      displayOrder: 60,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'ubm_diagram'
        }
      }, null, '\t')
    }
  })
}
