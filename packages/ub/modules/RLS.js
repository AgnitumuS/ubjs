const Session = require('./Session.js')
const Repository = require('@unitybase/base').ServerRepository.fabric
const ubaCommon = require('@unitybase/base').uba_common
/**
 * UnityBase Row Level Security routines. For use in rls mixin.
 * @author MPV
 * Comment by Felix: *WARNING* On Oracle table alias should not start with '_'
 */

/**
 * @namespace
 */
const RLS = global.RLS = {}
global['$'] = RLS

RLS.currentOwner = function () {
  return `( [mi_owner] = :(${Session.userID}): )`
}

/**
 * todo - OPTIMIZE using role cache
 * @param user
 * @param groupname
 * @return {String}
 */
RLS.userInGroup = function (user, groupname) {
  return `exists (select 1 from UBA_USERROLE ur inner join UBA_ROLE r ON ur.RoleID = r.ID WHERE  r.name = :('${groupname}'): AND ur.UserID = :(${user}): )`
}

/**
 * is current ( Session.userID) user have role with name roleName
 * @param groupname group name from uba_role
 * @return {*}
 */
RLS.currentUserInGroup = function (sender, roleName) {
  return Session.hasRole(roleName) ? '(1=1)' : '(0=1)'
}

/**
*   Check user in adm subtable
*   no user group check performed!
*/
RLS.userInAdmSubtable = function (sender, user) {
  return `exists (select 1 from ' + sender.entity.name + '_adm uast where uast.instanceID = [ID] and uast.admSubjID = :(${user}): )`
}

RLS.isOracle = function (entity) {
  return entity.connectionConfig.dialect.startsWith('Oracle')
}

/** Check user or any of user groups in adm subtable
/*  xmax using ORACLE
* _todo check oracle syntax!!
*/
RLS.userOrUserGroupInAdmSubtable = function (sender, user) {
  var result = `exists (select 1 from ${sender.entity.name}_adm ast where ast.instanceID = [ID] and ast.admSubjID in (select ur.RoleID from uba_userrole ur where ur.UserID = :(${user}): union select ${user}`
  if (RLS.isOracle(sender.entity)) {
    return result + ' from dual ))'
  } else {
    return result + '))'
  }
}

RLS.currentUserInAdmSubtable = function (sender) {
  return this.userInAdmSubtable(sender, Session.userID)
}

RLS.currentUserOrUserGroupInAdmSubtable = function (sender) {
  let subjects = `ast.admSubjID = :(${Session.userID}):`
  Session.uData.roleIDs.forEach(rID => {
    subjects += ` OR ast.admSubjID = :(${rID}):`
  })
  return `exists (select 1 from ${sender.entity.name}_adm ast where ast.instanceID = [ID] and (${subjects}))`
}

/**
 * Returns `true` in case current user is Superuser ( build-in root or admin) or member of Admin group
 * @returns {boolean}
 */
RLS.isSuperUserOrInAdminGroup = function () {
  return (ubaCommon.isSuperUser() || Session.hasRole(ubaCommon.ROLES.ADMIN.NAME))
}
/**
 * For members of Admin group and for users `root` and `admin` do nothing.
 *
 * For other users adds condition what
 *  - either current user is a record owner
 *  - OR user or one of user role in `{$entity}_adm` sub-table
 *
 * @param {ubMethodParams} ctxt
 */
RLS.allowForAdminOwnerAndAdmTable = function (ctxt) {
  // skip RLS for admin and root and Admin group member
  if (RLS.isUserAdminOrInAdminGroup()) return

  const mParams = ctxt.mParams
  let whereList = mParams.whereList
  if (!whereList) {
    mParams.whereList = {}
    // whereList = mParams.whereList = {} assign a {} to whereList instead of TubList instance
    whereList = mParams.whereList
  }
  // either current user is record owner
  const byOwner = whereList.getUniqKey()
  whereList[byOwner] = {
    expression: '[mi_owner]',
    condition: 'equal',
    value: Session.userID
  }
  // or User or one of user role in _adm sub-table
  const byAdm = whereList.getUniqKey()
  const eName = ctxt.dataStore.entity.name
  const subQ = Repository(`${eName}_adm`)
    .where('[admSubjID]', 'in', [Session.userID,...Session.uData.roleIDs, ...Session.uData.groupIDs])
    .correlation('instanceID', 'ID')
    .ubql()
  whereList[byAdm] = {
    expression: '',
    condition: 'subquery',
    subQueryType: 'exists',
    value: subQ
  }
  const logic = `([${byOwner}]) OR ([${byAdm}])`
  if (!mParams.logicalPredicates) {
    mParams.logicalPredicates = [logic]
  } else {
    // ubList.push NOT WORK!
    mParams.logicalPredicates = [...mParams.logicalPredicates, logic]
  }
}
