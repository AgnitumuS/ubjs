const sessionBinding = process.binding('ub_session')
const EventEmitter = require('events').EventEmitter

// cache for lazy session props
let _id, _userID
let _sessionCached = {
  uData: undefined,
  callerIP: undefined,
  userRoles: undefined,
  userLang: undefined
}
/**
 * Contains information about the logged in user.
 * Server reassign properties of this object each time `endpoint` handler are executed
 *
 * Implements {@link EventEmitter} and will emit `login` event each time user logged in
 * or `loginFailed` event with 2 parameters(userID, isLocked) when user UB authentication failed
 * @namespace
 * @global
 * @mixes EventEmitter
 */
const Session = {
  /**
   * Fires just after user successfully logged-in but before auth response is written to client.
   * Model developer can subscribe to this event and add some model specific data to Session.uData.
   *
   * Since all uData content is passed to client and accessible on client via
   *  $App.connection.userData(`someCustomProperty`) do not add there a security sensitive data.
   *
   * Standard models like `@unitybase/uba` and `@unitybase/org` are subscribed to this event and add
   * most useful information to the uData - {@see Session.uData Session.uData} documentation.
   * Never override `uData` using `Session.uData = {...}`, in this case you delete uData properties,
   * defined in other application models.
   * Instead define or remove properties using `Session.uData.myProperty = ...`
   * or use `delete Session.uData.myProperty` if you need to undefine something.
   *
   * Example below add `someCustomProperty` to Session.uData:
   *
   *      // @param {THTTPRequest} req
   *      Session.on('login', function (req) {
   *          var uData = Session.uData
   *          uData.someCustomProperty = 'Hello!'
   *      })
   *
   * See real life example inside `@unitybase/org/org.js`.
   * @event login
   */

  /**
   * Fires in case new user registered in system and authentication schema support
   * "registration" feature.
   *
   * Currently only CERT and UB schemas support this feature
   *
   * For CERT schema user registered means `auth` endpoint is called with registration=1 parameter.
   *
   * For UB schema user registered means 'publicRegistration' endpoint has been called and user confirmed
   * registration by email otp
   *
   * Inside event handler server-side Session object is in INCONSISTENT state and you must not use it!!
   * Only parameter (stringified object), passed to event is valid user-relative information.
   *
   * For CERT schema parameter is look like
   *      {
   *          "authType": 'CERT',
   *          "id_cert": '<id_cert>',
   *          "user_name": '<user_name>',
   *          "additional": '',
   *          "certification_b64": '<certification_b64>'
   *      }
   *
   * For UB schema parameter is look like
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
   * @event registration
   */

  /**
   * Fires in case new user registered in system and authentication schema support
   * "registration" feature.
   *
   * Currently only CERT schemas
   *
   * For CERT schema user registered means `auth` endpoint is called with registration=1 parameter.
   *
   * Called before start event "registration" and before starting check the user. You can create new user inside this event.
   *
   * Parameter is look like
   *
   *      {
   *          "authType": 'CERT',
   *          "serialSign": '<serialSign>',
   *          "name": '<user name>',
   *          "additional": '',
   *          "issuer": '<issuer>',
   *          "serial": '<serial>',
   *          "certification_b64": '<certification_b64>'
   *      }
   *
   * Below is a sample code for CERT schema:
   *
   const iitCrypto = require('iitCrypto')
   iitCrypto.init()

   Session.on('newUserRegistration', function (registrationParams) {
        let params = JSON.parse(registrationParams)
        Session.runAsAdmin(function () {
          var
            storeCert, certData, certInfo,
            certID, userID,
            certParams, connectionName, roleStore,
            certExist

          let storeUser = UB.Repository('uba_user')
            .attrs(['ID', 'name', 'mi_modifyDate'])
            .where('name', '=', params.name).select()
          let userExist = !storeUser.eof

          if (userExist) {
            userID = storeUser.get('ID')
          }
          storeCert = UB.Repository('uba_usercertificate')
            .attrs(['ID', 'userID.name', 'disabled', 'revoked'])
            .where('serial', '=', params.serialSign)
          try {
            if (!App.serverConfig.security.dstu.findCertificateBySerial) {
              storeCert = storeCert.where('issuer_serial', '=', params.issuer)
            }
            storeCert = storeCert.select()
            certExist = !storeCert.eof
            if (certExist && ((storeCert.get('disabled') === 1) || (storeCert.get('revoked') === 1))) {
              throw new Error('Certificate is disabled')
            }
            if (!userExist && certExist) {
              throw new Error('Certificate already registered by another user')
            }

            if (certExist) {
              throw new Error('Certificate already registered')
              // throw new Error('User ' + params.name + ' already registred');
            }
          } finally {
            storeUser.freeNative()
            storeCert.freeNative()
          }

          certData = Buffer.from(params.certificationB64, 'base64')
          certInfo = iitCrypto.parseCertificate(certData.buffer)

          if (!userExist) {
            storeUser = new TubDataStore('uba_user')
            storeUser.run('insert', {
              fieldList: ['ID'],
              execParams: {
                name: params.name,
                email: certInfo.SubjEMail,
                disabled: 0,
                isPending: 0,
                // random
                uPasswordHashHexa: (new Date()).getTime().toString(27) + Math.round(Math.random() * 10000000000000000).toString(28),
                // phone
                // description:
                firstName: certInfo.SubjFullName // certInfo.SubjOrg
              }
            })
            userID = storeUser.get('ID')

            roleStore = UB.Repository('uba_role')
              .attrs(['ID', 'name'])
              .where('name', 'in', ['Admin']).select()
            while (!roleStore.eof) {
              storeUser.run('insert', {
                entity: 'uba_userrole',
                execParams: {
                  userID: userID,
                  roleID: roleStore.get('ID')
                }
              })
              roleStore.next()
            }
          }
          storeCert = new TubDataStore('uba_usercertificate')
          certID = storeCert.generateID()

          certParams = new TubList()
          certParams.ID = certID
          certParams.userID = userID
          certParams.issuer_serial = params.issuer
          certParams.serial = params.serialSign
          certParams.setBLOBValue('certificate', params.certificationB64)
          // issuer_cn: certInfo.issuerCapt,
          certParams.disabled = 0
          certParams.revoked = 0

          storeCert.run('insert', {
            fieldList: ['ID'],
            execParams: certParams
          })

          connectionName = App.byName('uba_user').connectionName
          if (App.dbInTransaction(connectionName)) {
            App.dbCommit(connectionName)
          }
          throw new Error('<UBInformation><<<Регистрация прошла успешно.>>>')
        })
      })
   *
   * @event newUserRegistration
   */

  /**
   * Fires in case `auth` endpoint is called with authentication schema UB and userName is founded in database,
   * but password is incorrect.
   *
   * If wrong passord is entered more  than `UBA.passwordPolicy.maxInvalidAttempts`(from ubs_settings) times
   * user will be locked
   *
   * 2 parameters passes to this event userID(Number) and isUserLocked(Boolean)
   *
   *      Session.on('loginFailed', function(userID, isLocked){
   *          if (isLocked)
   *              console.log('User with id ', userID, 'entered wrong password and locked');
   *          else
   *              console.log('User with id ', userID, 'entered wrong password');
   *      })
   *
   * @event loginFailed
   */

  /**
   * Fires in case of any security violation:
   *
   *  - user is blocked or not exists (in uba_user)
   *  - user provide wrong credential (password, domain, encripted secret key, certificate etc)
   *  - for 2-factor auth schemas - too many sessions in pending state (max is 128)
   *  - access to endpoint "%" deny for user (endpoint name not present in uba_role.allowedAppMethods for eny user roles)
   *  - password for user is expired (see ubs_settings UBA.passwordPolicy.maxDurationDays key)
   *  - entity method access deny by ELS (see rules in uba_els)
   *
   * 1 parameter passes to this event `reason: string`
   *
   *      Session.on('securityViolation', function(reason){
   *          console.log('Security violation for user with ID', Session.userID, 'from', Session.callerIP, 'reason', reason);
   *      })
   *
   * @event securityViolation
   */
}

// add EventEmitter to Session object
EventEmitter.call(Session)
Object.assign(Session, EventEmitter.prototype)

/**
 * Called by server when server enter into new user context
 * @private
 * @param sessionID
 * @param userID
 */
Session.reset = function (sessionID, userID) {
  _id = sessionID
  _userID = userID
  _sessionCached.uData = undefined
  _sessionCached.callerIP = undefined
  _sessionCached.userRoles = undefined
  _sessionCached.userLang = undefined
}

/**
 * Current session identifier. === 0 if session not started, ===1 in case authentication not used, >1 in case user authorized
 * @member {number} id
 * @memberOf Session
 * @readonly
 */
Object.defineProperty(Session, 'id', {
  enumerable: true,
  get: function () {
    return _id
  }
})
/**
 * Logged-in user identifier (from uba_user.ID). Undefined if Session.id is 0 or 1 (no authentication running)
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
 * @deprecated Use Session.uData.roleIDs - an array of roles IDs
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
 * @deprecated Use Session.uData.roles
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
 * Properties documented below are added by `@unitybase/uba` model, but other model can define his own properties.
 *
 * @member {Object} uData
 * @memberOf Session
 * @property {number} userID Logged in user ID. The same as Session.userID. Added by `uba` model
 * @property {string} login Logged in user name. Added by `uba` model
 * @property {string} roles Logged in user roles names separated by comma. In most case better to use uData.roleIDs array. Added by `uba` model
 * @property {Array<number>} roleIDs Array or role IDs for logged in user roles. Added by `uba` model
 * @property {string} [employeeShortFIO] Short name of employee. Added by `org` model
 * @property {string} [employeeFullFIO] Full name of employee
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
 * @property {string} [tempPositions] stringified array ob temporary position objects: {staffUnitID, employeeOnStaffID}. Added by `org` model
 * @property {string} [assistantPositions] stringified array ob assistant position objects: {staffUnitID, employeeOnStaffID}. Added by `org` model
 * @property {string} [allPositions] stringified array of permanent + temporary + assistant position objects: {staffUnitID, employeeOnStaffID}. Added by `org` model
 * @readonly
 */
Object.defineProperty(Session, 'uData', {
  enumerable: true,
  get: function () {
    if (_sessionCached.uData === undefined) {
      let d = sessionBinding.userDataJSON()
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
 * Create new session for userID
 * @method
 * @param {Number} userID ID of  user
 * @param {String} [secret] secret word. If defined then session secretWord is `JSON.parse(returns).result+secret`
 * @returns {String} JSON string like answer on auth request
 */
Session.setUser = sessionBinding.switchUser
/**
 * Call function as admin.
 * Built-in "always alive"(newer expired) `admin` session is always created when the application starts,
 * so this is very cheap method - it will not trigger Session.login event every time context is switched (Session.setUser and Session.runAsUser does)
 * Can be used in scheduled tasks, not-authorized methods, etc. to obtain a `admin` Session context
 * @param {Function} func Function to be called in admin context
 * @returns {*}
 */
Session.runAsAdmin = function (func) {
  let result
  sessionBinding.switchToAdmin()
  try {
    result = func()
  } finally {
    sessionBinding.switchToOriginal()
  }
  return result
}
/**
 * Call function as custom user.
 * New session will be created. Will fire `login` event.
 * @param userID ID of  user
 * @param func Function to be called in user's session.
 * @returns {*}
 */
Session.runAsUser = function (userID, func) {
  let result
  sessionBinding.switchUser(userID)
  try {
    result = func()
  } finally {
    sessionBinding.switchToOriginal()
  }
  return result
}

module.exports = Session
