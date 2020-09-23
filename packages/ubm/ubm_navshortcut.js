const { getCurrentAdminSubjects, formatAclRlsExecParams } = require('./modules/aclRls')

const me = global.ubm_navshortcut

me.getCurrentAdminSubjects = getCurrentAdminSubjects

global.ubm_navshortcut_acl.on('insert:before', formatAclRlsExecParams)
