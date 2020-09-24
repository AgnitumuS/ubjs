const { getCurrentAdminSubjects } = require('./modules/aclRls')

const me = global.ubm_desktop

me.getCurrentAdminSubjects = getCurrentAdminSubjects
