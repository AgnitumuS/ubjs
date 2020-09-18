/**
 * User: xmax
 * Create roles
 */

/**
 * Initial script for UDISK model
 * Used by cmd\initialize command
 * @param {cmd.argv.serverSession} session
 */
module.exports = function (session) {
  const conn = session.connection
  let roles = {}

  console.log('\t\tcreate `users` role')
  let roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskPublicUsers',
      description: 'public udisk users',
      sessionTimeout: 30
    }
  })

  roles.publicUser = roleID
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_public_users',
      entityMask: 'udisk_card',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_public_users'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_public_usersp',
      entityMask: 'udisk_permission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_public_users'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskPublicAdmins',
      description: 'public udisk admins',
      sessionTimeout: 30
    }
  })
  roles.publicAdmin = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_public_admins',
      entityMask: 'udisk_card',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_public_admins'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_public_adminsp',
      entityMask: 'udisk_permission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_public_admins'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskPublicAdminsDenyContent',
      description: 'public udisk micro admins',
      sessionTimeout: 30
    }
  })
  roles.publicAdminDC = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_public_adminsda',
      entityMask: 'udisk_card',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_public_adminsda'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_public_adminsdap',
      entityMask: 'udisk_permission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_public_adminsda'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskServiceUsers',
      description: 'Service udisk users',
      sessionTimeout: 30
    }
  })
  roles.serviceUser = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_service_user',
      entityMask: 'udisk_servicecard',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_service_user'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_service_userp',
      entityMask: 'udisk_srvpermission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_service_user'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskServiceAdmins',
      description: 'Service udisk admins',
      sessionTimeout: 30
    }
  })

  roles.serviceAdmin = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_service_admin',
      entityMask: 'udisk_servicecard',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_service_admin'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_service_adminp',
      entityMask: 'udisk_srvpermission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_service_admin'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskServiceAdminsDenyContent',
      description: 'Service udisk micro admins',
      sessionTimeout: 30
    }
  })

  roles.serviceAdminDC = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_service_admindc',
      entityMask: 'udisk_servicecard',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_service_admindc'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_service_admindcp',
      entityMask: 'udisk_srvpermission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_service_admindc'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskSecretUsers',
      description: 'Secret udisk users',
      sessionTimeout: 30
    }
  })

  roles.secretUser = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_secret_user',
      entityMask: 'udisk_secretcard',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_secret_user'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_secret_userp',
      entityMask: 'udisk_spermission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_secret_user'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskSecretAdmins',
      description: 'Secret udisk admins',
      sessionTimeout: 30
    }
  })

  roles.secretAdmin = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_secret_admin',
      entityMask: 'udisk_secretcard',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_secret_admin'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_secret_adminp',
      entityMask: 'udisk_spermission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_secret_admin'
    }
  })

  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskSecretAdminsDenyContent',
      description: 'Secret udisk micro admins',
      sessionTimeout: 30
    }
  })

  roles.secretAdminDC = roleID

  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_secret_admindc',
      entityMask: 'udisk_secretcard',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_secret_admindc'
    }
  })
  conn.insert({
    entity: 'uba_els',
    execParams: {
      code: 'udisk_secret_admindcp',
      entityMask: 'udisk_spermission',
      methodMask: '[iudashc]*',
      ruleType: 'A',
      ruleRole: roleID,
      description: 'udisk_secret_admindc'
    }
  })

  let desktopID = conn.lookup('ubm_desktop', 'ID', { expression: 'code', condition: 'equal', values: { code: 'udisk_desktop' } })
  console.info('\tFill desktop')
  if (!desktopID) {
    console.info('\t\tcreate new `UDisk` desktop')
    desktopID = conn.insert({
      entity: 'ubm_desktop',
      fieldList: ['ID'],
      execParams: {
        code: 'udisk_desktop',
        caption: 'UDISK'
      }
    })
  } else {
    console.info('\t\tuse existed desktop with code `udisk_desktop`', desktopID)
  }

  Object.keys(roles).forEach(function (roleCode) {
    conn.insert({
      entity: 'ubm_desktop_acl',
      execParams: {
        instanceID: desktopID,
        subjID: roles[roleCode],
        valueID: roles[roleCode]
      }
    })
  })

  let folderID = null
  var newFolderID
  console.log('\t\t\tcreate `UDISK` shortcut')

  newFolderID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'UDISK_CARD',
      caption: 'UDISK',
      iconCls: 'fa',
      displayOrder: 10,
      cmdCode: JSON.stringify({ 'cmdType': 'showForm', 'formCode': 'udisk_card', 'entity': 'udisk_card' })
    }
  })

  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.publicUser,
      valueID: roles.publicUser
    }
  })

  newFolderID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'UDISK_CARD_ADM',
      caption: 'UDISK admin',
      iconCls: 'fa',
      displayOrder: 10,
      cmdCode: JSON.stringify({ 'cmdType': 'showForm',
        'formCode': 'udisk_card',
        'entity': 'udisk_card',
        'description': 'udisk_card_adm',
        'cmpInitConfig': { 'mode': 'admin' } })
    }
  })

  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.publicAdmin,
      valueID: roles.publicAdmin
    }
  })
  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.publicAdminDC,
      valueID: roles.publicAdminDC
    }
  })

  // service
  newFolderID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'UDISK_SERVICECARD',
      caption: 'Service UDISK',
      iconCls: 'fa',
      displayOrder: 10,
      cmdCode: JSON.stringify({ 'cmdType': 'showForm', 'formCode': 'udisk_card', 'entity': 'udisk_servicecard' })
    }
  })

  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.serviceUser,
      valueID: roles.serviceUser
    }
  })

  newFolderID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'UDISK_SERVICECARD_ADM',
      caption: 'Service UDISK admin',
      iconCls: 'fa',
      displayOrder: 10,
      cmdCode: JSON.stringify({ 'cmdType': 'showForm',
        'formCode': 'udisk_card',
        'entity': 'udisk_servicecard',
        'description': 'Service UDISK admin',
        'cmpInitConfig': { 'mode': 'admin' } })
    }
  })

  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.serviceAdmin,
      valueID: roles.serviceAdmin
    }
  })
  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.serviceAdminDC,
      valueID: roles.serviceAdminDC
    }
  })

  // secret
  newFolderID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'UDISK_SECRETECARD',
      caption: 'Secret UDISK',
      iconCls: 'fa',
      displayOrder: 10,
      cmdCode: JSON.stringify({ 'cmdType': 'showForm', 'formCode': 'udisk_card', 'entity': 'udisk_secretcard' })
    }
  })

  conn.insert({
    entity: 'ubm_navshortcut_acl',
    fieldList: ['ID'],
    execParams: {
      instanceID: newFolderID,
      subjID: roles.secretUser,
      valueID: roles.secretUser
    }
  })

  newFolderID = conn.insert({
    fieldList: ['ID'],
    entity: 'ubm_navshortcut',
    execParams: {
      desktopID: desktopID,
      parentID: folderID,
      code: 'UDISK_SECRETCARD_ADM',
      caption: 'Secret UDISK admin',
      iconCls: 'fa',
      displayOrder: 10,
      cmdCode: JSON.stringify({ 'cmdType': 'showForm',
        'formCode': 'udisk_card',
        'entity': 'udisk_secretcard',
        'description': 'Secret UDISK admin',
        'cmpInitConfig': { 'mode': 'admin' } })
    }
  })

  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.secretAdmin,
      valueID: roles.secretAdmin
    }
  })
  conn.insert({
    entity: 'ubm_navshortcut_acl',
    execParams: {
      instanceID: newFolderID,
      subjID: roles.secretAdminDC,
      valueID: roles.secretAdminDC
    }
  })
}
