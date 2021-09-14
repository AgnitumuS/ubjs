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

  console.log('\t\tcreate `public users` role')
  let roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskPublicUsers',
      description: 'public udisk users',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `public admins` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskPublicAdmins',
      description: 'public udisk admins',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `public micro admins` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskPublicAdminsDenyContent',
      description: 'public udisk micro admins',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `service users` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskServiceUsers',
      description: 'Service udisk users',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `service admins` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskServiceAdmins',
      description: 'Service udisk admins',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `service micro admins` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskServiceAdminsDenyContent',
      description: 'Service udisk micro admins',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `secret users` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskSecretUsers',
      description: 'Secret udisk users',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `secret admins` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskSecretAdmins',
      description: 'Secret udisk admins',
      sessionTimeout: 30
    }
  })
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

  console.log('\t\tcreate `secret micro admins` role')
  roleID = conn.insert({
    entity: 'uba_role',
    fieldList: ['ID'],
    execParams: {
      name: 'udiskSecretAdminsDenyContent',
      description: 'Secret udisk micro admins',
      sessionTimeout: 30
    }
  })
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
}
