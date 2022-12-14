/* global nsha256 */
// eslint-disable-next-line node/no-deprecated-api
const sessionBinding = process.binding('ub_session')
const THTTPRequest = require('./HTTPRequest')
const EventEmitter = require('events').EventEmitter
const base = require('@unitybase/base')
const UBA_COMMON = require('@unitybase/base').uba_common
const Repository = require('@unitybase/base').ServerRepository.fabric
const App = require('./App')
const GROUP_CODES_LIMIT = App.serverConfig.security.limitGroupsTo
/** ID of groups from GROUP_CODES_LIMIT if any */
let GROUP_IDS_LIMIT
const GROUP_CODES_EXCLUDE = App.serverConfig.security.excludeGroups
/** ID of groups from GROUP_CODES_EXCLUDE if any */
let GROUP_IDS_EXCLUDE

// cache for lazy session props
let _userID = UBA_COMMON.USERS.ANONYMOUS.ID
let _id
const _sessionCached = {
  sessionID: undefined,
  uData: undefined,
  callerIP: undefined,
  userRoles: undefined,
  userLang: undefined,
  zone: undefined,
  roleNamesSet: undefined
}
/**
 * @classdesc
 * A global singleton what contains information about the logged in user.
 * Server reassign properties of this object each time `endpoint` handler are executed
 *
 * Implements {@link EventEmitter} and will emit `login` event each time user logged in
 * or `loginFailed` event with 2 parameters(isLocked, userName) when user UB authentication failed
 * @example

const UB = require('@unitybase/ub')
const Session = UB.Session

 * @class
 * @extends EventEmitter
 */
const Session = {
}

// add EventEmitter to Session object
EventEmitter.call(Session)
Object.assign(Session, EventEmitter.prototype)

/**
 * Current session identifier
 * @member {string} id
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'id', {
  enumerable: true,
  get: function () {
    if (_sessionCached.sessionID === undefined) {
      if (sessionBinding.sessionID) {
        _sessionCached.sessionID = sessionBinding.sessionID()
      } else {
        _sessionCached.sessionID = '12345678' // compatibility with UB w/o redis
      }
    }
    return _sessionCached.sessionID
  }
})
/**
 * Logged-in user identifier (from uba_user.ID)
 * @member {number} userID
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'userID', {
  enumerable: true,
  get: function () {
    return _userID
  }
})
/**
 * Logged-in user role IDs in CSV format. ==="" if no authentication running
 * @deprecated To check user is a member of role use Session.hasRole('roleName');
 *   to get all roles as CSV string use `Session.uData.roles`,
 *   to get all roles IDs array - `Session.uData.roleIDs`
 * @member {number} userRoles
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'userRoles', {
  enumerable: true,
  get: function () {
    if (_sessionCached.userRoles === undefined) {
      _sessionCached.userRoles = this.uData.roleIDs.join(',')
    }
    return _sessionCached.userRoles
  }
})
/**
 * Logged-in user role names in CSV format. ==="" if no authentication running
 * @deprecated To check user is a member of role use Session.hasRole('roleName');
 *   to get all roles as CSV string use `Session.uData.roles`,
 *   to get all roles IDs array - `Session.uData.roleIDs`
 * @member {string} userRoleNames
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'userRoleNames', {
  enumerable: true,
  get: function () {
    return this.uData.roles
  }
})

/**
 * Logged-in user language. ==="" if no authentication running
 * @member {string} userLang
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'userLang', {
  enumerable: true,
  get: function () {
    if (_sessionCached.userLang === undefined) {
      _sessionCached.userLang = sessionBinding.userLang()
    }
    return _sessionCached.userLang
  }
})

/**
 * Custom properties, defined in {@link Session.login Session.on('login')} handlers for logged-in user.
 * We strongly recommend to **not modify** value of uData outside the `Session.on('login')` handler -
 * such modification is not persisted between calls.
 *
 * Properties documented below are added by `@unitybase/uba` and ``@unitybase/org` models, but other model can define his own properties.
 *
 * @member {Object} uData
 * @memberOf Session
 * @property {number} userID Logged in user ID. The same as Session.userID. Added by `ub` model
 * @property {string} login Logged in user name. Added by `ub` model
 * @property {string} roles Logged in user roles names separated by comma. In most case better to use uData.roleIDs array. Added by `ub` model
 * @property {Array<number>} roleIDs Array or role IDs for logged in user. Added by `ub` model
 * @property {Array<number>} groupIDs Array or group IDs for logged in user. Added by `ub` model
 * @property {string} [employeeShortFIO] Short name of the employee. Added by `ub` model from uba_user.firstName. `org` model override it
 * @property {string} [employeeFullFIO] Full name of the employee. Added by `ub` model from uba_user.fullName. `org` model override it
 * @property {number} [employeeID] Employee ID
 * @property {string} [staffUnitFullName]
 * @property {string} [staffUnitName]
 * @property {number} [staffUnitID] permanent staffUnitID. Added by `org` model
 * @property {number} [employeeOnStaffID] permanent employeeOnStaffID. Added by `org` model
 * @property {number} [parentID] permanent staffUnitID parent. Added by `org` model
 * @property {string} [parentUnityEntity] permanent staffUnitID parent entity type. Added by `org` model
 * @property {string} [orgUnitIDs] all orgUnit's IDs as CSV string. Added by `org` model
 * @property {string} [permanentOrgUnitIDs] all user orgUnit ID's permanent employeeOnStaffIDs in CSV. Added by `org` model
 * @property {string} [tempStaffUnitIDs] array temporary staffUnitIDs in CSV. Added by `org` model
 * @property {string} [tempEmployeeOnStaffIDs] array of temporary employeeOnStaffIDs in CSV. Added by `org` model
 * @property {string} [assistantStaffUnitIDs] array of assistant staffUnitIDs in CSV. Added by `org` model
 * @property {string} [assistantEmployeeOnStaffIDs] array of assistant employeeOnStaffIDs  in CSV. Added by `org` model
 * @property {string} [allStaffUnitIDs] array of all (permanent + temporary + assistant) staffUnitIDs in CSV. Added by `org` model
 * @property {string} [allEmployeeOnStaffIDs] array of all (permanent + temporary + assistant) employeeOnStaffIds in CSV. Added by `org` model
 * @property {string} [tempPositions] stringified array of temporary position objects: {staffUnitID, employeeOnStaffID}. Added by `org` model
 * @property {string} [assistantPositions] stringified array of assistant position objects: {staffUnitID, employeeOnStaffID}. Added by `org` model
 * @property {string} [allPositions] stringified array of permanent + temporary + assistant position objects: {staffUnitID, employeeOnStaffID}. Added by `org` model
 * @readonly
 */
Object.defineProperty(Session, 'uData', {
  enumerable: true,
  get: function () {
    if (_sessionCached.uData === undefined) {
      const d = sessionBinding.userDataJSON()
      _sessionCached.uData = d ? JSON.parse(d) : {}
    }
    return _sessionCached.uData
  }
})
/**
 * IP address of a user. May differ from IP address current user login from.
 * May be empty if request come from localhost.
 * @member {string} callerIP
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'callerIP', {
  enumerable: true,
  get: function () {
    if (_sessionCached.callerIP === undefined) {
      _sessionCached.callerIP = sessionBinding.callerIP()
    }
    return _sessionCached.callerIP
  }
})
/**
 * Security zone for current session. In UB SE empty string
 * @member {string} zone
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'zone', {
  enumerable: true,
  get: function () {
    if (_sessionCached.zone === undefined) {
      _sessionCached.zone = sessionBinding.zone()
    }
    return _sessionCached.zone
  }
})

/**
 * User name for authentication in pending state
 * @member {string} pendingUserName
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'pendingUserName', {
  enumerable: true,
  get: function () {
    if (typeof sessionBinding.pendingUserName === 'function') { // UB < 5.9.3
      return sessionBinding.pendingUserName()
    } else {
      return ''
    }
  }
})

/**
 * Create new session for userID
 * @method
 * @param {Number} userID ID of  user
 * @param {String} [secret] secret word. If defined then session secretWord is `JSON.parse(returns).result+secret`
 * @param {Boolean} [persist=true] Create persisted session (memorise session in session manager, so in can be used in future requests)
 * @returns {String} JSON string like answer on auth request
 */
Session.setUser = sessionBinding.switchUser
/**
 * Call function as build-in `admin` user. `runAs*` functions allow maximum of 2 level depth of recursion.
 *
 * Built-in "always alive"(newer expired) `admin` session is always created when the application starts,
 * so this is very cheap method - it will not trigger Session.login event every time context is switched (Session.setUser and Session.runAsUser does)
 * Can be used in scheduled tasks, not-authorized methods, etc. to obtain a `admin` Session context
 * @param {Function} func Function to be called in admin context
 * @returns {*}
 */
Session.runAsAdmin = function (func) {
  let result
  try {
    sessionBinding.switchToAdmin()
    result = func()
  } finally {
    sessionBinding.switchToOriginal()
  }
  return result
}
/**
 * Call function as a specified user. `runAs*` functions allow maximum of 2 level depth of recursion.
 *
 * New session will be created. Will fire `login` event.
 * @param userID ID of  user
 * @param func Function to be called in user's session.
 * @returns {*}
 */
Session.runAsUser = function (userID, func) {
  let result
  try {
    sessionBinding.switchUser(userID, '', false) // do not persist this session into sessionManager
    result = func()
  } finally {
    sessionBinding.switchToOriginal()
  }
  return result
}

/**
 * Switch current execution context language.
 * Can be used for example inside scheduler to create a report under admin but using target user language
 *
 * @param {string} newLang
 * @return {string} Previous language for context
 */
Session.switchLangForContext = function (newLang) {
  if (!new Set(App.serverConfig.application.domain.supportedLanguages).has(newLang)) {
    throw new Error(`Language ${newLang} is not supported by app`)
  }
  sessionBinding.setTempUserLang(newLang)
  const oldLang = this.userLang // call getter to fill _sessionCached.userLang (if not already filled)
  _sessionCached.userLang = newLang
  if (this.uData.lang) this.uData.lang = newLang // ensure language also changed in uData (if defined)
  return oldLang
}

/**
 * O(1) checks if the current user is a member of the specified role(s)
 *
 * If roles is array - at last one of passed roles.
 *
 * @example

const UB = require('@unitybae/ub')
const Session = UB.Session
if (Session.hasRole('accountAdmin')) {
  console.debug('current user has accountAdmin role')
}
if (Session.hasRole(['Admin', 'Supervisor'])) { // equal to Session.hasRole('Admin') || Session.hasRole('Supervisor')
  console.debug('current user is a member of `Admin` or/and `Supervisor` group')
}

 * @param {string|array<string>} roleName
 * @return {boolean}
 */
Session.hasRole = function (roleName) {
  if (!_sessionCached.roleNamesSet) {
    _sessionCached.roleNamesSet = new Set(this.uData.roles.split(','))
  }
  if (Array.isArray(roleName)) {
    return roleName.some(r => _sessionCached.roleNamesSet.has(r))
  } else {
    return _sessionCached.roleNamesSet.has(roleName)
  }
}

/**
 * ID of the tenant (for multitenancy applications). 0 if multitenancy is not enabled (see `ubConfig.security.tenants`)
 * @member {number} tenantID
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'tenantID', {
  enumerable: true,
  get: function () {
    return sessionBinding.tenantID()
  }
})

/**
 * Set new tenant ID, fire `enterConnectionContext` for App object for all `active` connections
 *
 * Return original tenantID.
 *
 * **WARNING** - original tenantID should be set back, better in try...finally block
 * @example
const origTID = Session.setTempTenantID(5)
try {
  // do something in new tenant ID context
} finally {
 Session.setTempTenantID(origTID)
}
 * @param {number} newTenantID new tenantID
 * @returns {number} original tenantID
 */
Session.setTempTenantID = function (newTenantID) {
  return sessionBinding.setTempTenantID(newTenantID)
}

/**
 * Run a function in another tenant
 * @param {number} tenantID
 * @param {function} func
 * @return {*} Return result returned by the function
 */
Session.runInTenant = function (tenantID, func) {
  const oldTenantID = Session.tenantID
  let result
  try {
    sessionBinding.setTempTenantID(tenantID)
    result = func()
  } finally {
    sessionBinding.setTempTenantID(oldTenantID)
  }
  return result
}


/**
 * Fires just after user successfully logged-in but before auth response is written to client.
 * Model developer can subscribe to this event and add some model specific data to Session.uData.
 *
 * Since all uData content is passed to client and accessible on client via
 *  $App.connection.userData(`someCustomProperty`) do not add there a security sensitive data.
 *
 * Standard models like `@unitybase/uba` and `@unitybase/org` are subscribed to this event and add
 * most useful information to the uData - {@link namespace:Session.uData Session.uData} documentation.
 * Never override `uData` using `Session.uData = {...}`, in this case you delete uData properties,
 * defined in other application models.
 * Instead, define or remove properties using `Session.uData.myProperty = ...`
 * or use `delete Session.uData.myProperty` if you need to un-define something.
 *
 * Example below add `someCustomProperty` to Session.uData. See also a real life example in `@unitybase/org/org.js`
 * @example

// @ param {THTTPRequest} req
Session.on('login', function (req) {
  const uData = Session.uData
  uData.someCustomProperty = 'Hello!'
})

 * @event login
 * @memberOf Session
 * @param {THTTPRequest} req HTTP Request
 */

/**
 * Fires in case new user registered in system and authentication schema support
 * "registration" feature.
 *
 * Currently, only CERT and UB schemas support this feature.
 *
 * For CERT schema user registered means `auth` endpoint is called with registration=1 parameter.
 *
 * For UB schema user registered means 'publicRegistration' endpoint has been called and user confirmed
 * registration by email otp.
 *
 * Inside event handler server-side Session object is in INCONSISTENT state, and you must not use it!!
 * Only parameter (stringified object), passed to event is valid user-relative information.
 *
 * For CERT schema parameter is look like
 *
 *      {
 *          "authType": 'CERT',
 *          "id_cert": '<id_cert>',
 *          "user_name": '<user_name>',
 *          "additional": '',
 *          "certification_b64": '<certification_b64>'
 *      }
 *
 * For UB schema parameter is look like
 *
 *      {
 *          "authType": 'UB',
 *          "publicRegistration": true,
 *          userID,
            userOtpData
 *      }
 *
 * Each AUTH schema can pass his own object as a event parameter, but all schema add `authType`.
 * Below is a sample code for CERT schema:
 *
 *      Session.on('registration', function(registrationParams){
 *
 *      }
 *
 * @memberOf Session
 * @event registration
 */

/**
 * Fires in case `auth` endpoint is called with authentication schema UB and userName is founded in database,
 * but password is incorrect.
 *
 * If wrong password is entered more  than `UBA.passwordPolicy.maxInvalidAttempts`(from ubs_settings) times
 * user will be locked
 * @example

Session.on('loginFailed', function(shouldLock, userName){
 if (shouldLock)
   console.log('User ', userName, 'entered wrong password and locked')
 else
   console.log('User ', userName, 'entered wrong password')
})

 * @memberOf Session
 * @event loginFailed
 * @param {boolean} shouldLock
 * @param {string} userName
 */

/**
 * Fires in case of any security violation:
 *
 *  - user is blocked or not exists (in uba_user)
 *  - user provide wrong credential (password, domain, encrypted secret key, certificate etc.)
 *  - for 2-factor auth schemas - too many sessions in pending state (max is 128)
 *  - access to endpoint "%" deny for user (endpoint name not present in uba_role.allowedAppMethods for eny user roles)
 *  - password for user is expired (see ubs_settings UBA.passwordPolicy.maxDurationDays key)
 *  - access to entity method is denied by ELS (see rules in uba_els)
 * @example
const Session = require('@unitybase/ub').Session
Session.on('securityViolation', function(reason){
   console.log('Security violation for user with ID', Session.userID, 'from', Session.callerIP, 'reason', reason);
})
 * @memberOf Session
 * @event securityViolation
 * @param {string} reason
 */

/**
 * Called by server when server enter into new user context
 * @private
 * @param sessionID
 * @param userID
 */
Session.reset = function (sessionID, userID) {
  _userID = userID
  _sessionCached.uData = undefined
  _sessionCached.callerIP = undefined
  _sessionCached.userRoles = undefined
  _sessionCached.userLang = undefined
  _sessionCached.zone = undefined
  _sessionCached.roleNamesSet = undefined
}

/**
 * Called by server during login to emit a `login` event on Session object
 * @private
 */
Session.emitLoginEvent = function () {
  const req = new THTTPRequest()
  this.emit('login', req)
}

/**
 * Build password hash based on user login and plain password
 * Called by server during authorization handshake.
 *
 * In case application need to use it's own hash algorithm in can override this function inside model initialization.
 * Maximum result length is 64 char. Result is case sensitive.
 *
 * @param {string} uName
 * @param {string} uPwdPlain
 * @return {string} password hash to be stored/compared with uba_used.uPasswordHashHexa
 */
Session._buildPasswordHash = function (uName, uPwdPlain) {
  return nsha256('salt' + uPwdPlain)
}

function fillGroupIDsLimit () {
  if (GROUP_IDS_LIMIT !== undefined) return
  GROUP_IDS_LIMIT = []
  let allGroups
  if ((GROUP_CODES_LIMIT && GROUP_CODES_LIMIT.length) ||
      (GROUP_CODES_EXCLUDE && GROUP_CODES_EXCLUDE.length)) {
    allGroups = Repository('uba_group')
      .attrs(['ID', 'code'])
      .selectAsObject()
  }
  if (GROUP_CODES_LIMIT && GROUP_CODES_LIMIT.length) {
    GROUP_CODES_LIMIT.forEach(groupCode => {
      const group = allGroups.find(g => g.code === groupCode)
      if (group) {
        GROUP_IDS_LIMIT.push(group.ID)
      } else {
        console.warn(
          'Group with code "%s" listed in appConfig.security.limitGroupsTo but not found in uba_group',
          groupCode
        )
      }
    })
  }

  GROUP_IDS_EXCLUDE = []
  if (GROUP_CODES_EXCLUDE && GROUP_CODES_EXCLUDE.length) {
    GROUP_CODES_EXCLUDE.forEach(groupCode => {
      const group = allGroups.find(g => g.code === groupCode)
      if (group) {
        GROUP_IDS_EXCLUDE.push(group.ID)
      } else {
        console.warn(
          'Group with code "%s" listed in appConfig.security.excludeGroups but not found in uba_group',
          groupCode
        )
      }
    })
  }
}
/**
 * Private method called by server during authorization process just after user credentials is verified
 * but before session is actually created
 *
 * This method fills user details (role ID's, user data (uData)
 * @param userID
 * @returns {{uPasswordHashHexa: (String|*), lastPasswordChangeDate: Date, uData: {userID: *}}}
 * @private
 */
Session._getRBACInfo = function (userID) {
  const userInfo = Repository('uba_user')
    .attrs(['name', 'uData', 'uPasswordHashHexa', 'lastPasswordChangeDate', 'firstName', 'lastName', 'fullName'])
    .selectById(userID)
  if (!userInfo) throw new Error(`User with ID=${userID} not found`)
  let uData = {}
  if (userInfo.uData) {
    try {
      uData = JSON.parse(userInfo.uData)
      if (!uData.lang) uData.lang = App.serverConfig.application.defaultLang
    } catch (e) {
      console.error(
        'Invalid uData attribute content for user %s: "%s". Must be valid JSON',
        userInfo.name,
        userInfo.uData
      )
    }
  }
  uData.userID = userID
  uData.roleIDs = [UBA_COMMON.ROLES.EVERYONE.ID]
  uData.login = userInfo.name
  uData.employeeShortFIO = userInfo.firstName || userInfo.name
  if (userInfo.fullName) uData.employeeFullFIO = userInfo.fullName
  const result = {
    uData: uData,
    uPasswordHashHexa: userInfo.uPasswordHashHexa,
    lastPasswordChangeDate: userInfo.lastPasswordChangeDate
  }

  const roleNamesArr = [UBA_COMMON.ROLES.EVERYONE.NAME]
  if (userID === UBA_COMMON.USERS.ANONYMOUS.ID) {
    roleNamesArr.push(UBA_COMMON.ROLES.ANONYMOUS.NAME)
    uData.roleIDs.push(UBA_COMMON.ROLES.ANONYMOUS.ID)
  } else {
    roleNamesArr.push(UBA_COMMON.ROLES.USER.NAME)
    uData.roleIDs.push(UBA_COMMON.ROLES.USER.ID)
  }
  if (Session.tenantID > 1) {
    // Multi-tenant mode, and the current tenant is not the system tenant
    roleNamesArr.push(UBA_COMMON.ROLES.TENANT_USER.NAME)
    uData.roleIDs.push(UBA_COMMON.ROLES.TENANT_USER.ID)
  }
  fillGroupIDsLimit()
  const roles = Repository('uba_role')
    .attrs('ID', 'name')
    .exists(
      Repository('uba_userrole')
        .where('userID', '=', userID)
        .correlation('roleID', 'ID'),
      'userHasRole'
    )
    .exists(
      Repository('uba_grouprole')
        .attrs('ID')
        .exists(
          Repository('uba_usergroup')
            .where('userID', '=', userID)
            .whereIf(GROUP_IDS_LIMIT.length, 'groupID', 'in', GROUP_IDS_LIMIT)
            .whereIf(GROUP_IDS_EXCLUDE.length, 'groupID', 'notIn', GROUP_IDS_EXCLUDE)
            .correlation('groupID', 'groupID')
        )
        .correlation('roleID', 'ID'),
      'groupHasRole'
    )
    .logic('(([userHasRole]) OR ([groupHasRole]))')
    .selectAsObject()

  for (const role of roles) {
    uData.roleIDs.push(role.ID)
    roleNamesArr.push(role.name)
  }
  // if (Session.userID === UBA_COMMON.USERS.ADMIN.ID) {
  //   // Admin account is a special account, which is used in scenarios like application initialization, when
  //   // database is not fully created yet.
  //   data.groupIDs = []
  // } else {
  uData.groupIDs = Repository('uba_usergroup')
    .attrs('groupID')
    .where('userID', '=', userID)
    .whereIf(GROUP_IDS_LIMIT.length, 'groupID', 'in', GROUP_IDS_LIMIT)
    .whereIf(GROUP_IDS_EXCLUDE.length, 'groupID', 'notIn', GROUP_IDS_EXCLUDE)
    .selectAsArray()
    .resultData.data
    .map(r => r[0])

  uData.roles = roleNamesArr.join(',')

  return result
}

module.exports = Session
