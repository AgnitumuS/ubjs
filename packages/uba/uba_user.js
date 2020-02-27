/* global uba_user ubs_settings uba_otp */
// eslint-disable-next-line camelcase
const me = uba_user
const UBA_COMMON = require('@unitybase/base').uba_common
const UB = require('@unitybase/ub')
const Session = UB.Session
const App = UB.App
const http = require('http')

App.registerEndpoint('changePassword', changePasswordEp)

me.entity.addMethod('changeLanguage')
me.entity.addMethod('setUDataKey')
me.entity.addMethod('publicRegistration')
me.entity.addMethod('changeOtherUserPassword')

me.on('insert:before', checkDuplicateUser)
me.on('update:before', checkDuplicateUser)
me.on('insert:before', fillFullNameIfMissing)
me.on('insert:after', ubaAuditNewUser)
me.on('update:after', ubaAuditModifyUser)
me.on('delete:after', ubaAuditDeleteUser)
me.on('delete:before', denyBuildInUserDeletion)

/**
 * Do not allow user with same name but in different case
 * @private
 * @param {ubMethodParams} ctxt
 */
function checkDuplicateUser (ctxt) {
  const params = ctxt.mParams.execParams
  const newName = params.name
  const ID = params.ID
  if (newName) {
    const store = UB.Repository('uba_user').attrs('ID')
      .where('name', '=', newName.toLowerCase())
      .whereIf(ID, 'ID', '<>', ID)
      .select()

    if (!store.eof) {
      throw new UB.UBAbort('<<<Duplicate user name (may be in different case)>>>')
    }
    params.name = newName.toLowerCase() // convert user name to lower case
  }
}

/**
 * Set fullName = name in case fullName is missing
 * Set lastPasswordChangeDate = maxDate in case user is domainUser
 * @private
 * @param {ubMethodParams} ctxt
 */
function fillFullNameIfMissing (ctxt) {
  const params = ctxt.mParams.execParams
  if (!params.fullName) {
    params.fullName = params.name
  }
  if (params.name && params.name.indexOf('\\') !== -1) {
    // domain/ldap user password never expire on UB level
    params.lastPasswordChangeDate = new Date(2099, 12, 31)
  }
}

/**
 * Change user password
 * @param {Number} userID
 * @param {String} userName Either userName or userID must be specified
 * @param  {String} password
 * @param {Boolean} [needChangePassword=false] If true the password will by expired
 * @param {String} [oldPwdHash] Optional for optimisation
 * @method changePassword
 * @memberOf uba_user_ns.prototype
 * @memberOfModule @unitybase/uba
 * @public
 */
me.changePassword = function (userID, userName, password, needChangePassword, oldPwdHash) {
  if (!(userID || userName) || !password) throw new Error('Invalid parameters')

  const store = UB.DataStore('uba_user')
  if (userID && (!userName || !oldPwdHash)) {
    UB.Repository('uba_user').attrs(['ID', 'name', 'uPasswordHashHexa']).where('[ID]', '=', userID).select(store)
    userName = store.get('name')
    oldPwdHash = store.get('uPasswordHashHexa')
  } else if (userName && (!userID || !oldPwdHash)) {
    UB.Repository('uba_user').attrs(['ID', 'name', 'uPasswordHashHexa']).where('[name]', '=', userName.toLowerCase()).select(store)
    userID = store.get('ID')
    oldPwdHash = store.get('uPasswordHashHexa')
  }

  // eslint-disable-next-line camelcase
  const passwordPolicy = ubs_settings ? {
    minLength: ubs_settings.loadKey('UBA.passwordPolicy.minLength', 3),
    checkCmplexity: ubs_settings.loadKey('UBA.passwordPolicy.checkCmplexity', false),
    checkDictionary: ubs_settings.loadKey('UBA.passwordPolicy.checkDictionary', false),
    allowMatchWithLogin: ubs_settings.loadKey('UBA.passwordPolicy.allowMatchWithLogin', false),
    checkPrevPwdNum: ubs_settings.loadKey('UBA.passwordPolicy.checkPrevPwdNum', 4)
  } : {}

  let newPwd = password || ''
  // minLength
  if (passwordPolicy.minLength > 0) {
    if (newPwd.length < passwordPolicy.minLength) {
      throw new Error('<<<Password is too short>>>')
    }
  }

  // checkCmplexity
  if (passwordPolicy.checkCmplexity) {
    if (!(/[A-Z]/.test(newPwd) && /[a-z]/.test(newPwd) &&
      /[0-9]/.test(newPwd) && /[~!@#$%^&*()_+|\\=\-/'":;<>]/.test(newPwd))
    ) {
      throw new Error('<<<Password is too simple>>>')
    }
  }
  // checkDictionary
  if (passwordPolicy.checkDictionary) {
    // todo - check password from dictionary
    // if (false) {
    //   throw new Error('<<<Password is dictionary word>>>')
    // }
  }

  // allowMatchWithLogin
  if (!passwordPolicy.allowMatchWithLogin) {
    if (newPwd.includes(userName)) {
      throw new Error('<<<Password matches with login>>>')
    }
  }

  newPwd = Session._buildPasswordHash(userName, newPwd)
  // checkPrevPwdNum
  if (passwordPolicy.checkPrevPwdNum > 0) {
    UB.Repository('uba_prevPasswordsHash')
      .attrs('uPasswordHashHexa')
      .where('userID', '=', userID)
      .limit(passwordPolicy.checkPrevPwdNum)
      .orderBy('mi_createDate', 'desc').select(store)
    store.first()
    while (!store.eof) {
      if (store.get('uPasswordHashHexa') === newPwd) {
        throw new Error('<<<Previous password is not allowed>>>')
      }
      store.next()
    }
  }

  // since attribute uPasswordHashHexa is not defined in entity metadata
  // for security reason we need to execute SQL
  // It's always better to not use execSQL at all!
  store.execSQL(
    'update uba_user set uPasswordHashHexa=:newPwd:, lastPasswordChangeDate=:lastPasswordChangeDate: where id = :userID:',
    {
      newPwd: newPwd,
      lastPasswordChangeDate: needChangePassword ? new Date(2000, 1, 1) : new Date(),
      userID: userID
    }
  )
  // store oldPwdHash
  if (oldPwdHash) {
    store.run('insert', {
      entity: 'uba_prevPasswordsHash',
      execParams: {
        userID: userID,
        uPasswordHashHexa: oldPwdHash
      }
    })
  }
}

/**
 * Change (or set) user password for currently logged in user.
 * Members of `Supervisor` role can change password for other users using uba_user.changeOtherUserPassword method
 * @private
 * @param {THTTPRequest}req
 * @param {THTTPResponse}resp
 */
function changePasswordEp (req, resp) {
  const reqBody = req.read()
  const params = JSON.parse(reqBody)
  let forUser = params.forUser
  const newPwd = params.newPwd || ''
  const pwd = params.pwd || ''
  const needChangePassword = params.needChangePassword || false
  const store = UB.DataStore('uba_user')
  let dbPwdHash

  let failException = null
  let userID = Session.userID || UBA_COMMON.USERS.ANONYMOUS.ID
  try {
    if (!newPwd) throw new UB.ESecurityException('changePassword: newPwd parameter is required')
    userID = Session.userID
    UB.Repository('uba_user').attrs('name', 'uPasswordHashHexa').where('ID', '=', userID).select(store)
    if (!store.eof) {
      forUser = store.get('name')
      dbPwdHash = store.get('uPasswordHashHexa')
    }
    // check password
    const currentPwdHash = Session._buildPasswordHash(forUser, pwd)
    if (currentPwdHash !== dbPwdHash) {
      throw new UB.ESecurityException('<<<Incorrect old password>>>')
    }
    me.changePassword(userID, forUser, newPwd, needChangePassword, dbPwdHash)
  } catch (e) {
    failException = e
  }

  // make uba_audit record
  if (App.domainInfo.has('uba_audit')) {
    store.run('insert', {
      entity: 'uba_audit',
      execParams: {
        entity: 'uba_user',
        entityinfo_id: userID, // Session.userID,
        actionType: failException ? 'SECURITY_VIOLATION' : 'UPDATE',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetUser: forUser.toLowerCase(),
        toValue: failException
          ? JSON.stringify({ action: 'changePassword', reason: failException.message })
          : JSON.stringify({ action: 'changePassword' })
      }
    })
    App.dbCommit()
  }
  if (failException) throw failException
  resp.statusCode = 200
}

/**
 * Change (or set) user password for any user.
 * Call of this method should be restricted to a small number of roles/groups. By default can be called by supervisor role
 *
 * @param {ubMethodParams} ctxt
 * @param {string|number} ctxt.mParams.execParams.forUser Name or ID of the user for whom you want to change the password
 * @param {string} ctxt.mParams.execParams.newPwd New password
 * @param {boolean} [ctxt.mParams.execParams.needChangePassword=false] Indicates that the user must change the password at the first login
 * @memberOf uba_user_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 */
function changeOtherUserPassword (ctxt) {
  const { newPwd, needChangePassword, forUser } = ctxt.mParams.execParams
  const store = UB.DataStore('uba_user')

  if (!newPwd) throw new Error('newPwd parameter is required')

  let failException = null
  const userID = UBA_COMMON.USERS.ANONYMOUS.ID
  try {
    UB.Repository('uba_user').attrs('ID', 'uPasswordHashHexa').where('[name]', '=', '' + forUser.toLowerCase()).select(store)
    if (store.eof) throw new Error('User not found')

    const userID = store.get('ID')
    const oldPwd = store.get('uPasswordHashHexa')

    me.changePassword(userID, forUser, newPwd, needChangePassword || false, oldPwd)
  } catch (e) {
    failException = e
  }

  // make uba_audit record
  if (App.domainInfo.has('uba_audit')) {
    store.run('insert', {
      entity: 'uba_audit',
      execParams: {
        entity: 'uba_user',
        entityinfo_id: userID,
        actionType: failException ? 'SECURITY_VIOLATION' : 'UPDATE',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetUser: forUser.toLowerCase(),
        toValue: failException
          ? JSON.stringify({ action: 'changePassword', reason: failException.message })
          : JSON.stringify({ action: 'changePassword' })
      }
    })
    App.dbCommit()
  }
  if (failException) throw failException
}
me.changeOtherUserPassword = changeOtherUserPassword

/**
 * Change uba_user.uData JSON key to value
 * @param {string} key
 * @param {*} value
 */
function internalSetUDataKey (key, value) {
  const userID = Session.userID
  const user = UB.Repository('uba_user').attrs(['name', 'uData', 'mi_modifyDate']).where('ID', '=', userID).select()
  if (user.eof) {
    throw new Error('user is unknown or not logged in')
  }
  let newUData
  try {
    newUData = JSON.parse(user.get('uData'))
  } catch (e) {
    newUData = {}
  }
  if (!newUData) {
    newUData = {}
  }
  newUData[key] = value
  user.run('update', {
    execParams: {
      ID: userID,
      uData: JSON.stringify(newUData),
      mi_modifyDate: user.get('mi_modifyDate')
    }
  })
}

/**
 * Change (or set) current user language.
 * After call to this method UI must logout user and reload itself.
 *
 * @param {ubMethodParams} ctxt
 * @param {String} ctxt.mParams.newLang new user language
 * @memberOf uba_user_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 */
function changeLanguage (ctxt) {
  const params = ctxt.mParams
  const newLang = params.newLang

  if (!newLang) {
    throw new Error('newLang parameter is required')
  }

  const supportedLangs = uba_user.entity.connectionConfig.supportLang
  if (supportedLangs.indexOf(newLang) < 0) {
    throw new Error(`Language "${newLang}" not supported`)
  }
  internalSetUDataKey('lang', newLang)
}
me.changeLanguage = changeLanguage

/**
 * Set key value inside `uba_user.uData` and store new JSON do DB.
 * All other uData JSON keys will remain unchanged.
 *
 * **WARNING** - overall length of uba_user.uData is 2000 characters, so only short values should be stored there
 *
 * @param {ubMethodParams} ctxt
 * @param {String} ctxt.mParams.key key to change
 * @param {String} ctxt.mParams.value new value
 * @memberOf uba_user_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 */
function setUDataKey (ctxt) {
  const params = ctxt.mParams
  const key = params.key
  const value = params.value
  if (!key) throw new Error('key parameter is required')
  if (value === undefined) throw new Error('value parameter is required')

  internalSetUDataKey(key, value)
}
me.setUDataKey = setUDataKey

/**
 * After inserting new user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditNewUser (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  const params = ctx.mParams.execParams
  const store = UB.DataStore('uba_audit')
  store.run('insert', {
    execParams: {
      entity: 'uba_user',
      entityinfo_id: params.ID, // Session.userID,
      actionType: 'INSERT',
      actionUser: Session.uData.login,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetUser: params.name,
      toValue: JSON.stringify(params)
    }
  })
}

/**
 * After updating user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditModifyUser (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  const params = ctx.mParams.execParams
  const store = UB.DataStore('uba_audit')
  const origStore = ctx.dataStore
  const origName = origStore.currentDataName
  let oldValues, oldName

  try {
    origStore.currentDataName = 'selectBeforeUpdate'
    oldValues = origStore.getAsTextInObjectNotation()
    oldName = origStore.get('name')
  } finally {
    origStore.currentDataName = origName
  }

  if (params.name) {
    store.run('insert', {
      execParams: {
        entity: 'uba_user',
        entityinfo_id: params.ID,
        actionType: 'DELETE',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetUser: oldName,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
    store.run('insert', {
      execParams: {
        entity: 'uba_user',
        entityinfo_id: params.ID,
        actionType: 'INSERT',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetUser: params.name,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
  } else {
    store.run('insert', {
      execParams: {
        entity: 'uba_user',
        entityinfo_id: params.ID,
        actionType: 'UPDATE',
        actionUser: Session.uData.login,
        actionTime: new Date(),
        remoteIP: Session.callerIP,
        targetUser: oldName,
        fromValue: oldValues,
        toValue: JSON.stringify(params)
      }
    })
  }
}

/**
 * After deleting user - log event to uba_audit
 * @private
 * @param {ubMethodParams} ctx
 */
function ubaAuditDeleteUser (ctx) {
  if (!App.domainInfo.has('uba_audit')) return

  const params = ctx.mParams.execParams
  const store = UB.DataStore('uba_audit')
  const origStore = ctx.dataStore
  const origName = origStore.currentDataName
  let oldValues, oldName

  try {
    origStore.currentDataName = 'selectBeforeDelete'
    oldValues = origStore.getAsTextInObjectNotation()
    oldName = origStore.get('name')
  } finally {
    origStore.currentDataName = origName
  }

  store.run('insert', {
    execParams: {
      entity: 'uba_user',
      entityinfo_id: params.ID,
      actionType: 'DELETE',
      actionUser: Session.uData.login,
      actionTime: new Date(),
      remoteIP: Session.callerIP,
      targetUser: oldName,
      fromValue: oldValues
    }
  })
}

/**
 * Prevent delete a build-in user
 * @private
 * @param {ubMethodParams} ctx
 */
function denyBuildInUserDeletion (ctx) {
  const ID = ctx.mParams.execParams.ID

  for (const user in UBA_COMMON.USERS) {
    if (UBA_COMMON.USERS[user].ID === ID) {
      throw new UB.UBAbort('<<<Removing of built-in user is prohibited>>>')
    }
  }
}

// eslint-disable-next-line no-useless-escape
const EMAIL_VALIDATION_RE = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
/**
 * Check provided Email is look like Email address
 * @private
 * @param {string} email
 * @returns {boolean}
 */
function validateEmail (email) {
  return email && (email.length < 60) && EMAIL_VALIDATION_RE.test(email)
}

const RECAPTCHA_SECRET_KEY = App.serverConfig.application.customSettings &&
  App.serverConfig.application.customSettings.reCAPTCHA
  ? App.serverConfig.application.customSettings.reCAPTCHA.secretKey
  : ''
/**
 * Validate a reCAPTCHA from client request. See <a href="https://developers.google.com/recaptcha/docs/verify"reCAPTCHA doc</a>
 * App.serverConfig.application.customSettings.reCAPTCHA.secretKey must be defined
 * @private
 * @param {string} recaptcha
 * @returns {boolean}
 */
function validateRecaptcha (recaptcha) {
  if (!RECAPTCHA_SECRET_KEY) return true
  const resp = http.request({
    URL: 'https://www.google.com/recaptcha/api/siteverify' + '?' + 'secret=' + RECAPTCHA_SECRET_KEY + '&response=' + recaptcha,
    method: 'POST',
    sendTimeout: 30000,
    receiveTimeout: 30000,
    keepAlive: true,
    compressionEnable: true
  }).end('')
  const data = JSON.parse(resp.read())
  return data.success
}

const confirmationRedirectURI = App.serverConfig.application.customSettings &&
  App.serverConfig.application.customSettings.publicRegistration &&
  App.serverConfig.application.customSettings.publicRegistration.confirmationRedirectURI
  ? App.serverConfig.application.customSettings.publicRegistration.confirmationRedirectURI
  : '/'

const QueryString = require('querystring')

/**
 * Process a user registration step 2 - OneTime password received
 * @private
 * @param {THTTPResponse} resp
 * @param {string} otp One Time Password
 * @param {string} login user login
 */
function processRegistrationStep2 (resp, otp, login) {
  let userID
  let userOtpData = null
  const store = UB.DataStore(me.entity.name)
  uba_otp.authAndExecute(otp, 'EMail', function (uData) {
    userID = Session.userID
    userOtpData = uData
  })
  if (userID) {
    Session.runAsAdmin(function () {
      UB.Repository('uba_user').attrs(['name', 'mi_modifyDate']).where('ID', '=', userID).select(store)

      store.run('update', {
        execParams: {
          ID: userID,
          isPending: false,
          lastPasswordChangeDate: new Date(),
          mi_modifyDate: store.get('mi_modifyDate')
        }
      })
    })

    login = store.get('name')

    Session.emit('registration', {
      authType: 'UB',
      publicRegistration: true,
      userID,
      login,
      userOtpData
    })
  } else {
    // check that login is correct
    Session.runAsAdmin(function () {
      UB.Repository('uba_user').attrs(['ID']).where('name', '=', login)
        .select(store)
    })

    if (store.eof) {
      throw new UB.UBAbort('Invalid OTP')
    }
  }
  resp.writeHead(`Location: ${App.externalURL + confirmationRedirectURI}?login=${encodeURIComponent(login)}`)
  resp.statusCode = 302
}

/**
 * Two-step new user public registration **rest** endpoint. Optionaly can use google Re-captcha.
 * To enable re-captcha on server side provide a valid [re-captcha SECRET](https://www.google.com/recaptcha/admin#list)
 *  in `serverConfig.application.customSettings.reCAPTCHA.secretKey` application config.
 *
 * 1-st step: web page pass a registration parameters as JSON:
 *
 *      POST /rest/uba_user/publicRegistration
 *      {email: "<email>", phone: "", utmSource: '', utmCampaign: '', recaptca: "googleRecaptchaValue"}
 *
 *
 * Server will:
 *
 *  - create a new uba_user (in pending state isPending===true) and generate a password for user
 *  - generate OTP, and put a optional `utmSource` and `utmCampaign` parameters to the OTP uData
 *  - create a e-mail using using report code, provided by `uba.user.publicRegistrationReportCode` ubs_setting key.
 *    Report take a parameters {login, password, activateUrl, appConfig}
 *  - schedule a confirmation e-mail for user
 *
 * 2-nd step: user follow the link from e-mail
 *
 *      GET /rest/uba_user/publicRegistration?otp=<one time pwd value>&login=<user_login>
 *
 * Server will:
 *
 *  - check the provided OTP and if it is valud
 *  - remove a `pending` from uba_user row
 *  - fire a `registration` event for {@link Session}
 *
 * Access to endpoint is restricted by default. To enable public registration developer should grant ELS access for
 * `uba_user.publicRegistration` method to `Anonymous` role.
 *
 * @param fake
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @method publicRegistration
 * @memberOf uba_user_ns.prototype
 * @memberOfModule @unitybase/uba
 * @published
 */
me.publicRegistration = function (fake, req, resp) {
/*
- if otp parameter present
1. check otp
2. activate user
3. get redirect page address
4. answer redirect
*/
  const mailQueue = require('@unitybase/ubq/modules/mail-queue')
  const UBReport = require('@unitybase/ubs/modules/UBServerReport')

  const publicRegistrationSubject = ubs_settings.loadKey('uba.user.publicRegistrationSubject')
  const publicRegistrationReportCode = ubs_settings.loadKey('uba.user.publicRegistrationReportCode')

  const { otp, login } = QueryString.parse(req.parameters, null, null, { maxKeys: 3 })
  const store = UB.DataStore(me.entity.name)

  if (otp && login) {
    processRegistrationStep2(resp, otp, login)
  } else {
    const body = req.read('utf-8')
    const { email, phone, utmSource, utmCampaign, recaptcha } = JSON.parse(body)
    if (!validateEmail(email)) {
      throw new UB.UBAbort('Provided email address is invalid')
    }
    if (!validateRecaptcha(recaptcha)) {
      throw new UB.UBAbort('reCAPTCTA check fail')
    }
    Session.emit('registrationStart', {
      authType: 'UB',
      publicRegistration: true,
      params: { email, phone, utmSource, utmCampaign, recaptcha }
    })
    Session.runAsAdmin(function () {
      store.run('insert', {
        execParams: {
          name: email,
          email: email,
          phone: phone,
          isPending: true,
          lastPasswordChangeDate: new Date()
        },
        fieldList: ['ID']
      })
      const userID = store.get(0)
      const password = (Math.random() * 100000000000 >>> 0).toString(24)
      me.changePassword(userID, email, password)
      const userOtp = uba_otp.generateOtp('EMail', userID, { utmSource, utmCampaign })

      const registrationAddress = `${App.externalURL}rest/uba_user/publicRegistration?otp=${encodeURIComponent(userOtp)}&login=${encodeURIComponent(email)}`

      const reportResult = UBReport.makeReport(publicRegistrationReportCode, 'html', {
        login: email,
        password: password,
        activateUrl: registrationAddress,
        appConfig: App.serverConfig
      })
      const mailBody = reportResult.reportData

      mailQueue.queueMail({
        to: email,
        subject: publicRegistrationSubject,
        body: mailBody
      })
    })
    resp.statusCode = 200
    resp.writeEnd({ success: true, message: '<strong>Thank you for your request!</strong> We have sent your access credentials via email. You should receive them very soon.' })
  }
}
