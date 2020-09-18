const { Session, UBAbort } = require('@unitybase/ub')

module.exports = {
  getCurrentAdminSubjects,
  formatAclRlsExecParams
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

const NOT_FK_ACL_ATTRIBUTES = ['ID', 'instanceID', 'valueID']

/**
 * Copy foreign key (for example: subjID and ounitID) values to `valueID` attribute as it is required (notNull) field
 */
function formatAclRlsExecParams (ctx) {
  const { execParams } = ctx.mParams

  if (execParams.valueID === undefined) {
    const attributes = Object.keys(ctx.dataStore.entity.attributes)
    const foreignKeysOfAclRlsEntity = attributes.filter(key => !NOT_FK_ACL_ATTRIBUTES.includes(key))
    const valueID = foreignKeysOfAclRlsEntity.reduce((val, key) => val || execParams[key], null)

    if (valueID === null) {
      throw new UBAbort(`You should pass at least one of ${foreignKeysOfAclRlsEntity.join(', ')} attribute inside execParams`)
    }

    execParams.valueID = valueID
  }
}
