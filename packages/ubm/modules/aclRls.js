const { Session } = require('@unitybase/ub')

module.exports = {
  getCurrentAdminSubjects
}

function getCurrentAdminSubjects (aclParams, aclRlsEntityName) {
  aclParams.aclRlsResult = {
    entity: aclRlsEntityName,
    whereList: {
      byOwner: {
        expression: '[instanceID.mi_owner]',
        condition: 'equal',
        value: Session.userID
      },

      bySubject: {
        expression: '[subjID]',
        condition: 'in',
        value: [Session.userID, ...Session.uData.roleIDs, ...Session.uData.groupIDs]
      }
    },
    logicalPredicates: ['([byOwner] OR [bySubject])']
  }
}
