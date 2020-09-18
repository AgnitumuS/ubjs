const { getCurrentAdminSubjects, formatAclRlsExecParams } = require('./modules/aclRls')

const me = global.ubm_navshortcut

me.on('insert:before', formatAclRlsExecParams)

me.getCurrentAdminSubjects = getCurrentAdminSubjects
