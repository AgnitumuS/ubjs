/* global TubDataStore */
const Session = require('./Session.js')
/**
 * UnityBase Row Level Security routines. For use in rls mixin.
 * @author MPV
 * Comment by Felix: Внимание! Для Оракла НЕЛЬЗЯ начинать алиас таблицы с символа подчеркивания '_'
 */

/**
 * @namespace
 */
let RLS = global.RLS = {}
global['$'] = RLS

let roleCache // it's safe to cache roles here because uba_role table is readonly in production

RLS.initCache = function () {
  let rInst
  if (!roleCache) {
    roleCache = {}
    rInst = new TubDataStore('uba_role')
    // here is direct SQL because permission to uba_role dose not exist for non-supervisor user's
    rInst.runSQL('select ID, name FROM uba_role', {})
    while (!rInst.eof) {
      roleCache[rInst.get(1)] = rInst.get(0) // roleCashce['admin'] = 1 e.t.c.
      rInst.next()
    }
  }
}

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
 * is current ( Session.userID) user have role with name groupname
 * @param groupname group name from uba_role
 * @return {*}
 */
RLS.currentUserInGroup = function (sender, groupname) {
  let groupID

  RLS.initCache()
  groupID = roleCache[groupname]
  if (groupID && (Session.uData.roleIDs.indexOf(groupID) !== -1)) {
    return '(1=1)'
  } else {
    return '(0=1)'
  }
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
