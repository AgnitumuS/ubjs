// eslint-disable-next-line no-undef,camelcase
const me = tst_aclrls
const ubaCommon = require('@unitybase/base').uba_common
const UB = require('@unitybase/ub')
const Session = UB.Session

/**
 * Сформировать и вернуть массив динамических ролей для записи сущности
 * @param {TubList} params
 * @param {string} aclRlsEntityName
 * @return {Boolean}
 */
me.tstAclRlsExpr = function tstAclRlsExpr (params, aclRlsEntityName) {
  if (ubaCommon.isSuperUser() || ubaCommon.haveAdminRole()) {
    return
  }

  const subjectIds = [Session.userID, ...Session.uData.roleIDs, ...Session.uData.groupIDs]
  console.log('selectionRule=', params.selectionRule)
  params.aclRlsResult = {
    entity: aclRlsEntityName,
    fieldList: ['instanceID'],
    whereList: {
      byInstanceID: {
        expression: `[instanceID] = ${params.contextEntitySqlAlias}.ID`,
        condition: 'custom'
      },

      byValueID: {
        expression: '[valueID]',
        condition: 'in',
        value: subjectIds
      }
    }
  }
}
