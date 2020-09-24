const { getCurrentAdminSubjects } = require('./modules/aclRls')

const me = global.ubm_navshortcut

me.getCurrentAdminSubjects = getCurrentAdminSubjects
