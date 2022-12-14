/* global Session, nsha256 */
const argv = require('./argv')

const USERS = {
  ROOT: {
    ID: 7,
    NAME: 'root'
  },
  ADMIN: {
    ID: 10,
    NAME: 'admin'
  },
  ANONYMOUS: {
    ID: 20,
    NAME: 'anonymous'
  }
}
const ROLES = {
  EVERYONE: {
    ID: 0,
    NAME: 'Everyone',
    ENDPOINTS: 'auth,timeStamp,statics,getAppInfo,models',
    DESCR: 'Everyone built-in role',
    TIMEOUT: 1000
  },
  ADMIN: {
    ID: 1,
    NAME: 'Admin',
    ENDPOINTS: '*',
    DESCR: 'Admin built-in role',
    TIMEOUT: 10
  },
  ANONYMOUS: {
    ID: 2,
    NAME: 'Anonymous',
    ENDPOINTS: null,
    DESCR: 'Anonymous built-in role',
    TIMEOUT: 1000
  },
  USER: {
    ID: 3,
    NAME: 'User',
    ENDPOINTS: 'changePassword,checkDocument,getDocument,getDomainInfo,logout,rest,setDocument,ubql',
    DESCR: 'User built-in role',
    TIMEOUT: 30
  },
  SUPERVISOR: {
    ID: 4,
    NAME: 'Supervisor',
    ENDPOINTS: null,
    DESCR: 'Supervisor built-in role',
    TIMEOUT: 10
  },
  DEVELOPER: {
    ID: 5,
    NAME: 'Developer',
    ENDPOINTS: null,
    DESCR: 'Developer built-in role',
    TIMEOUT: 10
  },
  SYSOPS: {
    ID: 8,
    NAME: 'SysOps',
    ENDPOINTS: null,
    DESCR: 'Support Engineer built-in role',
    TIMEOUT: 10
  },
  DATA_MANAGER: {
    ID: 9,
    NAME: 'DataManager',
    ENDPOINTS: null,
    DESCR: 'Data Manager built-in role',
    TIMEOUT: 10
  },
  MONITOR: {
    ID: 6,
    NAME: 'Monitor',
    ENDPOINTS: 'stat',
    DESCR: 'Monitor built-in role',
    TIMEOUT: 100
  }
}

try {
  const serverConfig = argv.getServerConfiguration()
  const multitenancyConfig = serverConfig.security.multitenancy
  const multitenancyEnabled = multitenancyConfig && multitenancyConfig.enabled
  if (multitenancyEnabled) {
    ROLES.TENANT_USER = {
      ID: 100,
      NAME: 'TenantUser',
      ENDPOINTS: '',
      DESCR: 'TenantUser built-in role',
      TIMEOUT: 30
    }
  }
} catch (e) {
  // for command-line usage server config is not necessary
}

/**
 * Check logged in user is a superuser (either `admin` or `root`)
 * @returns {boolean}
 */
function isSuperUser () {
  const uID = Session.uData.userID
  return (uID === USERS.ROOT.ID) || (uID === USERS.ADMIN.ID)
}

/**
 * Check logged in user have `admin` role
 * @returns {boolean}
 */
function haveAdminRole () {
  return Session.uData.roleIDs.includes(ROLES.ADMIN.ID)
}

/**
 * Constants for administrative security model
 * @author pavel.mash 15.09.2016
 * @module uba_common
 * @memberOf module:@unitybase/base
 */

module.exports = {
  /** Build-in users */
  USERS: USERS,
  /** Build-in roles */
  ROLES: ROLES,
  /** Name of Audit Trail entity */
  AUDIT_TRAIL_ENTITY: 'uba_auditTrail',
  /**
   * Create a password hash for specified realm/login/password
   * @param {string} aRealm reserved
   * @param {string} aLogin User login
   * @param {string} aPassword User password in plain text
   * @returns {String}
   */
  ubAuthHash: function (aRealm, aLogin, aPassword) {
    return nsha256('salt' + aPassword)
  },
  /**
   * Do not allow assign of Everyone & Anonymous preudo-roles.
   * Allow assign `admins` role only by `admins` member.
   *
   *
   * @param {ubMethodParams} ctxt
   */
  denyBuildInRoleAssignmentAndAdminsOnlyForAdmins: function (ctxt) {
    const params = ctxt.mParams.execParams
    const role = params.roleID

    if (role === ROLES.EVERYONE.ID) {
      throw new Error(`<<<${ROLES.EVERYONE.ID} pseudo-role is assigned automatically>>>`)
    }
    if (role === ROLES.ANONYMOUS.ID) {
      throw new Error(`<<<${ROLES.ANONYMOUS.ID} pseudo-role is assigned automatically>>>`)
    }
    if (role === ROLES.USER.ID) {
      throw new Error(`<<<${ROLES.USER.ID} pseudo-role is assigned automatically>>>`)
    }
    if ((role === ROLES.ADMIN.ID) && (!haveAdminRole())) {
      throw new Error(`<<<Only members with ${ROLES.ADMIN.NAME} role are allowed for assign a ${ROLES.ADMIN.NAME} role to other members>>>`)
    }
  },
  /**
   * Check logged in user is a superuser (either `admin` or `root`)
   * @returns {boolean}
   */
  isSuperUser: isSuperUser,
  /**
   * Check logged in user have `admin` role
   * @returns {boolean}
   */
  haveAdminRole: haveAdminRole
}
