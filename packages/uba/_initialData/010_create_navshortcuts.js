const dataLoader = require('@unitybase/base').dataLoader
const path = require('path')

/**
 * @author pavel.mash
 * Fill navigation shortcuts for UBA model
 */

/**
 * Initial script for create UnityBase Administration desktop navigation shortcuts for UBA model
 * Used by ubcli initialize command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let desktopID, folderID
  const conn = session.connection
  const domain = conn.getDomainInfo()
  if (!domain.has('ubm_desktop') || !domain.has('ubm_navshortcut')) {
    console.info('\tSkip shortcut initialization - entity ubm_navshortcut not in domain')
    return
  }
  desktopID = conn.lookup('ubm_desktop', 'ID', {
    expression: 'code',
    condition: 'equal',
    values: { code: 'adm_desktop' }
  })
  console.info('\tFill `Administrator` desktop')
  if (!desktopID) {
    console.info('\t\tcreate new `Administrator` desktop')
    desktopID = conn.insert({
      entity: 'ubm_desktop',
      fieldList: ['ID'],
      execParams: {
        code: 'adm_desktop',
        caption: 'Administrator',
        iconCls: 'u u-icon-desktop-administrator',
        description: 'User management, UI settings, logs (audit trail, security, queue)'
      }
    })
  } else {
    console.info('\t\tuse existed desktop with code `adm_desktop`', desktopID)
  }

  console.log('\t\tcreate `Users` folder')
  folderID = conn.insert({
    entity: 'ubm_navshortcut',
    fieldList: ['ID'],
    execParams: {
      desktopID: desktopID,
      code: 'adm_folder_users',
      caption: 'Groups and Users',
      isFolder: true,
      isCollapsed: false,
      iconCls: 'fa fa-folder-o',
      displayOrder: 10
    }
  })

  console.log('\t\t\tcreate `User list` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_user',
      caption: 'User list',
      iconCls: 'fa fa-user',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_user',
          columns: [
            'disabled',
            'isPending',
            'name',
            'firstName',
            'lastName'
          ]
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `User roles` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_userrole',
      caption: 'User roles',
      iconCls: 'el-icon-office-building',
      displayOrder: 20,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_userrole',
          columns: ['userID', 'roleID']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Group list` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_group',
      caption: 'Group list',
      iconCls: 'fa fa-group',
      displayOrder: 30,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_group',
          columns: ['name', 'description', 'code']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Advanced security')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_advSecurity',
      caption: 'Advanced security',
      displayOrder: 15,
      iconCls: 'fa fa-user-secret',
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_advSecurity'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `User groups` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_usergroup',
      iconCls: 'el-icon-school',
      caption: 'User groups',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_usergroup',
          columns: ['userID', 'groupID']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Certificates` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_usercertificate',
      caption: 'Certificates',
      iconCls: 'fa fa-key',
      isFolder: false,
      displayOrder: 50,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_usercertificate',
          columns: ['userID', 'issuer_cn', 'serial', 'disabled', 'revoked']
        }
      })
    }
  })

  console.log('\t\tcreate `Security` folder')
  folderID = conn.insert({
    entity: 'ubm_navshortcut',
    fieldList: ['ID'],
    execParams: {
      desktopID: desktopID,
      code: 'adm_folder_security',
      caption: 'Security',
      isFolder: true,
      isCollapsed: false,
      iconCls: 'fa fa-lock',
      displayOrder: 20
    }
  })

  console.log('\t\t\tcreate `System roles` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_role',
      caption: 'System roles',
      iconCls: 'fa fa-users',
      displayOrder: 10,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_role'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Entity level security` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_els',
      caption: 'Entity level security',
      iconCls: 'fa fa-shield',
      displayOrder: 20,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_els',
          columns: ['code', 'description', 'disabled', 'entityMask', 'methodMask', 'ruleType', 'ruleRole']
        }
      })
    }
  })

  console.log('\t\t\tcreate `Attribute level security` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_als',
      caption: 'Attribute level security',
      iconCls: 'fa fa-share-alt',
      displayOrder: 30,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_als'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `One-time passwords` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_otp',
      caption: 'One-time passwords',
      iconCls: 'fa fa-eye',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_otp'
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Security audit')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_audit',
      caption: 'Security audit',
      displayOrder: 60,
      iconCls: 'fa fa-lock',
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_audit',
          columns: ['entity', 'entityinfo_id', 'actionType', 'actionUser', 'actionTime', 'remoteIP', 'targetUser', 'targetGroup', 'targetRole']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Security monitor')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_audit-securityDashboard',
      caption: 'Security dashboard',
      displayOrder: 70,
      iconCls: 'fa fa-user-secret ',
      cmdCode: JSON.stringify({
        cmdType: 'showForm',
        formCode: 'uba_audit-securityDashboard'
      }, null, '\t')
    }
  })

  console.log('\t\t\tcreate `Audit Trail` shortcut')
  conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'uba_auditTrail',
      caption: 'Audit Trail',
      iconCls: 'el-icon-s-unfold',
      displayOrder: 40,
      cmdCode: JSON.stringify({
        renderer: 'vue',
        cmdType: 'showList',
        cmdData: {
          entityName: 'uba_auditTrail',
          columns: ['ID', 'entity', 'entityinfo_id', 'actionType', 'actionUserName', 'actionTime', 'remoteIP', 'request_id']
        }
      }, null, '\t')
    }
  })

  console.log('\t\t\tSetting up default uba navigation shortcuts access rights')
  dataLoader.loadSimpleCSVData(conn,
    path.join(__dirname, 'ubm_desktop_adm.csv'),
    'ubm_desktop_adm',
    'instanceID;admSubjID'.split(';'),
    [
      dataLoader.lookup(conn, 'ubm_desktop', 'code', 0),
      dataLoader.lookup(conn, 'uba_subject', 'code', 1)
    ],
    1)
  dataLoader.loadSimpleCSVData(conn,
    path.join(__dirname, 'ubm_navshortcut_adm.csv'),
    'ubm_navshortcut_adm',
    'instanceID;admSubjID'.split(';'),
    [
      dataLoader.lookup(conn, 'ubm_navshortcut', 'code', 0),
      dataLoader.lookup(conn, 'uba_subject', 'code', 1)
    ],
    1)
}
