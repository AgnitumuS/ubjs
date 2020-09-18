const { getCurrentAdminSubjects, formatAclRlsExecParams } = require('./modules/aclRls')

const me = global.ubm_desktop

me.on('insert:before', formatAclRlsExecParams)

me.getCurrentAdminSubjects = getCurrentAdminSubjects
