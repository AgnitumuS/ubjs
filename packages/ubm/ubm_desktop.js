const { getCurrentAdminSubjects, formatAclRlsExecParams } = require('./modules/aclRls')

const me = global.ubm_desktop

me.getCurrentAdminSubjects = getCurrentAdminSubjects

global.ubm_desktop_acl.on('insert:before', formatAclRlsExecParams)
