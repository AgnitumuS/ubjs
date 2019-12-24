/*
 * Created by pavel.mash on 10.10.2014
 * Проверка русского комментария
 * на несколько строк
 */
const fs = require('fs')
const assert = require('assert')
const UB = require('@unitybase/ub')
const App = UB.App
const Session = UB.Session
const queryString = require('querystring')
App.registerEndpoint('echoToFile', echoToFile, false)

App.registerEndpoint('echoFromFile', echoFromFile, false)

if (process.isServer) {}

// disable ORG login handler for test purpose
if (global.ORG && ORG.checkOrgUnitRequired) {
  ORG.checkOrgUnitRequired = false
}

const path = require('path')
const GS_PATH = App.domainInfo.models['TST'].realPath
const FIXTURES = path.join(GS_PATH, '_autotest', 'fixtures')
/**
 * write custom request body to file FIXTURES/req and echo file back to client
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function echoToFile (req, resp) {
  fs.writeFileSync(path.join(FIXTURES, 'req'), req.read('bin'))
  resp.statusCode = 200
  resp.writeEnd(fs.readFileSync(path.join(FIXTURES, 'req'), { encoding: 'bin' }))
}

/**
 * Return content of respD.txt (TExtWriter buffer bug test)
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function echoFromFile (req, resp) {
  let str = fs.readFileSync(path.join(FIXTURES, 'respD.txt'), 'utf8')
  resp.statusCode = 200
  resp.writeEnd(str)
}

// for event emitter test
tst_clob.on('insert:before', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'insert:before;')
  console.log('insert:before fired on the tst_clob')
})
tst_clob.on('insert:after', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'insert:after;')
})
tst_service.on('multiply:before', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'multiply:before;')
})
tst_service.on('multiply:after', function () {
  App.globalCachePut('eventEmitterLog', App.globalCacheGet('eventEmitterLog') + 'multiply:after;')
})

/**
 * Perform logging of getDocument requests
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function getDocumentLog (req, resp) {
  var querystring = require('querystring')
  var params = querystring.parse(req.parameters)
  if (resp.statusCode === 200) {
    console.log('User with ID', Session.userID, 'obtain document using params', params)
  }
}
App.on('getDocument:before', function (req, resp) { console.log('User with ID', Session.userID, 'try to obtain document') })
App.on('getDocument:after', getDocumentLog)

App.on('timeStamp:before',
  /**
   * @param {THTTPRequest} req
   * @param {THTTPResponse} resp
   */
  function (req, resp) {
    console.log('timeStamp!')
    App.preventDefault()
    resp.statusCode = 200
  }
)
App.on('timeStamp:after', function (req, resp) { console.log('timeStamp after!') })

App.registerEndpoint('getIDTest', getIDTest, false)
/**
 * Test daw
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
let __testIDStore = UB.DataStore('tst_IDMapping')
function getIDTest (req, resp) {
  resp.statusCode = 200
  resp.writeEnd(__testIDStore.generateID())
}

App.registerEndpoint('testTimeout', testTimeout, false)
/**
 * Test http timeout
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testTimeout (req, resp) {
  sleep(40000)
  resp.statusCode = 200
  resp.writeEnd('OK')
}

/**
 * Test server-side BLOB stores
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function testServerSideBLOB (req, resp) {
  const DOC_CODE = '2014-01-01'
  const DOC_ENTITY = 'tst_document'
  const DOC_ATTRIBUTE = 'fileStoreSimple'
  resp.statusCode = 200
  let err
  try {
    let firstDoc = UB.Repository(DOC_ENTITY)
      .attrs(['ID', DOC_ATTRIBUTE, 'mi_modifyDate'])
      .where('code', '=', DOC_CODE)
      .limit(1).selectSingle()
    assert.ok(firstDoc, `${DOC_ENTITY} with code "${DOC_CODE}" not found`)

    let content = fs.readFileSync(__filename, { encoding: 'bin' })
    let fn = path.basename(__filename)
    let blobItem = App.blobStores.putContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, fileName: fn },
      content
    )
    assert.strictEqual(blobItem.store, 'simple')
    assert.strictEqual(blobItem.origName, fn)
    assert.strictEqual(blobItem.ct, 'application/javascript; charset=utf-8')
    let fStat = fs.statSync(__filename)
    assert.strictEqual(blobItem.size, fStat.size)
    assert.strictEqual(blobItem.isDirty, true, 'BLOB should be dirty after putContent')
    let tmpContent = App.blobStores.getContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, isDirty: true },
      { encoding: 'bin' }
    )
    assert.strictEqual(tmpContent.byteLength, fStat.size, `temp content size ${tmpContent.byteLength} not match real ${fStat.size}`)

    let tmpStrContent = App.blobStores.getContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE, isDirty: true },
      { encoding: 'utf-8' }
    )
    let realStrContent = fs.readFileSync(__filename, 'utf8')
    assert.strictEqual(tmpStrContent, realStrContent, 'BLOB store content obtained as string must match')

    let dataStore = UB.DataStore(DOC_ENTITY)
    dataStore.run('lock', {
      lockType: 'ltTemp',
      ID: firstDoc.ID
    })
    dataStore.run('update', {
      fieldList: ['ID', DOC_ATTRIBUTE],
      execParams: {
        ID: firstDoc.ID,
        [DOC_ATTRIBUTE]: JSON.stringify(blobItem),
        mi_modifyDate: firstDoc.mi_modifyDate
      }
    })
    dataStore.currentDataName = dataStore.DATA_NAMES.AFTER_UPDATE
    let newBlobItem = dataStore.get(DOC_ATTRIBUTE)
    dataStore.run('unlock', {
      ID: firstDoc.ID
    })
    assert.ok(newBlobItem, 'updated blobItem content should be non empty')
    let i = JSON.parse(newBlobItem)
    assert.strictEqual(i.v, 1, 'blobstore v1 implementation')
    assert.strictEqual(i.store, 'simple')
    assert.strictEqual(i.origName, fn)
    // assert.equal(i.relPath, '')

    let binContent = App.blobStores.getContent(
      { ID: firstDoc.ID, entity: DOC_ENTITY, attribute: DOC_ATTRIBUTE },
      { encoding: 'bin' }
    )
    assert.strictEqual(binContent.byteLength, fStat.size, `content size ${binContent.byteLength} not match real ${fStat.size}`)
  } catch (e) {
    err = e.message + 'Server-side all stack: ' + e.stack
  }
  if (err) {
    resp.writeEnd({ success: false, reason: err })
  } else {
    resp.writeEnd({ success: true })
  }
}
App.registerEndpoint('testServerSideBLOB', testServerSideBLOB, false)

/**
 * Evaluate script (for test purpose)
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function evaluateScript (req, resp) {
  if (App.localIPs.indexOf(Session.callerIP) === -1) {
    throw new Error('evaluateScript: remote execution is not allowed')
  }
  let script
  if (req.method === 'GET') {
    script = queryString.parse(req.parameters).script
  } else if (req.method === 'POST') {
    script = req.read('utf-8')
  } else {
    return resp.badRequest('invalid HTTP verb ' + req.method)
  }
  // eslint-disable-next-line no-new-func
  let wrapped = new Function(script)
  wrapped = wrapped.bind(this)
  let funcRes = wrapped()
  resp.writeEnd(funcRes)
  resp.statusCode = 200
}
App.registerEndpoint('evaluateScript', evaluateScript)

const HttpProxy = require('@unitybase/http-proxy')
let proxy = new HttpProxy({
  endpoint: 'cms',
  targetURL: 'http://localhost:889/',
  nonAuthorizedURLs: [/./]
})

const SQL = 'select id, name from uba_user'
const dataStore = UB.DataStore('uba_user')

/**
 * Single database query (RAW) for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function dbRaw (req, resp) {
  dataStore.runSQL(SQL, {})
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd({ id: dataStore.get(0), name: dataStore.get(1) })
}
App.registerEndpoint('dbRaw', dbRaw, false)

/**
 * Single database query (ORM)  for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function db (req, resp) {
  let data = UB.Repository('uba_user').attrs(['ID', 'name']).where('ID', '>', 0).selectAsObject()
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd(data[0])
}
App.registerEndpoint('db', db, false)

/**
 * Single database query (ORM)  for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function dbLong (req, resp) {
  let data = UB.Repository('tst_document').attrs('*').selectAsObject()
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd(data)
}
App.registerEndpoint('dbLong', dbLong, false)

/**
 * Single database query (ORM)  for performance test
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 */
function arrayBind (req, resp) {
  let s = UB.DataStore('uba_user')
  // s.execSQL(`
  //     CREATOR.PKI_ACCOUNTCONTR_API.contragent_insert(
  //       ADDRESS => :ADDRESS:, ADDR_BUILDING => :ADDR_BUILDING:, ADDR_CITY
  // => :ADDR_CITY:, ADDR_COUNTRYID => :ADDR_COUNTRYID:,
  //       ADDR_COUNTRYNAME => :ADDR_COUNTRYNAME:, ADDR_DISTRICT =>
  // :ADDR_DISTRICT:, ADDR_FLAT => :ADDR_FLAT:,
  //       ADDR_HOUSENO => :ADDR_HOUSENO:, ADDR_POSTCODE => :ADDR_POSTCODE:,
  // ADDR_REGION => :ADDR_REGION:,
  //       ADDR_REGIONALCODEID => :ADDR_REGIONALCODEID:, ADDR_STREET =>
  // :ADDR_STREET:, ALTERNATENAME => :ALTERNATENAME:,
  //       BAD_STATUS_FLAG => :BAD_STATUS_FLAG:, BANKID => :BANKID:, BIC =>
  // :BIC:, BIRTHCOUNTRYID => :BIRTHCOUNTRYID:,
  //       BIRTHPLACE => :BIRTHPLACE:, BPSYNC => :BPSYNC:, BREAKOPENACCOUNT
  // => :BREAKOPENACCOUNT:,
  //       BUSINESSTYPE1 => :BUSINESSTYPE1:, BUSINESSTYPE2 =>
  // :BUSINESSTYPE2:, BUSINESSTYPE3 => :BUSINESSTYPE3:,
  //       BUSINESSTYPE4 => :BUSINESSTYPE4:, BUSINESSTYPE5 =>
  // :BUSINESSTYPE5:, BUSINESSTYPE6 => :BUSINESSTYPE6:,
  //       BUSINESSTYPE7 => :BUSINESSTYPE7:, BUSINESSTYPE8 =>
  // :BUSINESSTYPE8:, BUSINESSTYPE9 => :BUSINESSTYPE9:,
  //       BUSINESSTYPE10 => :BUSINESSTYPE10:, CANUSEINMARKETING =>
  // :CANUSEINMARKETING:,
  //       CITIZENSHIPCOUNTRYID => :CITIZENSHIPCOUNTRYID:, CLIENTBIRTHDAY =>
  // :CLIENTBIRTHDAY:, CLIENTLASTNAME => :CLIENTLASTNAME:,
  //       CLIENTNAME => :CLIENTNAME:, CLIENTPATRONYMICNAME =>
  // :CLIENTPATRONYMICNAME:, CLIENTTYPEK014 => :CLIENTTYPEK014:,
  //       CLOSEDATE => :CLOSEDATE:, CLOSEREASONID => :CLOSEREASONID:,
  // CONTRAGENTSEGMENT1ID => :CONTRAGENTSEGMENT1ID:,
  //       CONTRAGENTSEGMENT2ID => :CONTRAGENTSEGMENT2ID:, CONTRAGENTSTATEID
  // => :CONTRAGENTSTATEID:,
  //       CONTRAGENTTYPEID => :CONTRAGENTTYPEID:, CONTRAGRANKID =>
  // :CONTRAGRANKID:, COUNTRYID => :COUNTRYID:,
  //       CURRENCYINFLOW => :CURRENCYINFLOW:, DELIVERMETHOD =>
  // :DELIVERMETHOD:, ECONOMICBRANCHID => :ECONOMICBRANCHID:,
  //       EDUCATIONID => :EDUCATIONID:, EMAIL => :EMAIL:, ENTERPRISETYPEID
  // => :ENTERPRISETYPEID:,
  //       FAMILY_STATUSID => :FAMILY_STATUSID:, FAX => :FAX:, FIRSTNAME_LAT
  // => :FIRSTNAME_LAT:,
  //       FMIDENTIFYDATE => :FMIDENTIFYDATE:, GENDER => :GENDER:, ID =>
  // :ID:, IDENTIFYCODE => :IDENTIFYCODE:,
  //       IDENTIFYCODE2 => :IDENTIFYCODE2:, INSIDERID => :INSIDERID:,
  // INSTITUTESECTORID => :INSTITUTESECTORID:,
  //       ISPUBLICPERSON => :ISPUBLICPERSON:, JURADDR_BUILDING =>
  // :JURADDR_BUILDING:,
  //       JURADDR_COUNTRYNAME => :JURADDR_COUNTRYNAME:, JURADDR_CITY =>
  // :JURADDR_CITY:, JURADDR_COUNTRYID => :JURADDR_COUNTRYID:,
  //       JURADDR_DISTRICT => :JURADDR_DISTRICT:, JURADDR_FLAT =>
  // :JURADDR_FLAT:, JURADDR_HOUSENO => :JURADDR_HOUSENO:,
  //       JURADDR_POSTCODE => :JURADDR_POSTCODE:, JURADDR_REGION =>
  // :JURADDR_REGION:,
  //       JURADDR_REGIONALCODEID => :JURADDR_REGIONALCODEID:,
  // JURADDR_STREET => :JURADDR_STREET:,
  //       JURIDICALADDRESS => :JURIDICALADDRESS:, LASTNAME_LAT =>
  // :LASTNAME_LAT:, MILITARYLIABLEID => :MILITARYLIABLEID:,
  //       MOBILEPHONE => :MOBILEPHONE:, NACE => :NACE:, NALOGCODEID =>
  // :NALOGCODEID:, NALOGREGISTERDATE => :NALOGREGISTERDATE:,
  //       NALOGREGISTERNO => :NALOGREGISTERNO:, NAME => :NAME:,
  // NATIONALITYID => :NATIONALITYID:,
  //       NBUCONTRAGENTFIELD1 => :NBUCONTRAGENTFIELD1:, NBUCONTRAGENTFIELD2
  // => :NBUCONTRAGENTFIELD2:,
  //       NBUCONTRAGENTFIELD3 => :NBUCONTRAGENTFIELD3:, NICKNAME =>
  // :NICKNAME:, NOTE => :NOTE:,
  //       NR_IDENTIFYCODE => :NR_IDENTIFYCODE:, NR_SSN => :NR_SSN:,
  // NR_STATEGIVEDATE => :NR_STATEGIVEDATE:,
  //       NR_STATEREGISTERADDINFO => :NR_STATEREGISTERADDINFO:,
  // NR_STATEREGISTERCOUNTRYID => :NR_STATEREGISTERCOUNTRYID:,
  //       NR_STATEREGISTERDATE => :NR_STATEREGISTERDATE:,
  // NR_STATEREGISTERNO => :NR_STATEREGISTERNO:,
  //       NR_STATEREGISTERPLACE => :NR_STATEREGISTERPLACE:,
  // NR_STATEREGISTRATOR => :NR_STATEREGISTRATOR:,
  //       OLAVCODE => :OLAVCODE:, OPENEDINTOBOID => :OPENEDINTOBOID:,
  // OWNERSHIPTYPEID => :OWNERSHIPTYPEID:,
  //       PASSPORTENDDATE => :PASSPORTENDDATE:, PASSPORTISSUEDATE =>
  // :PASSPORTISSUEDATE:,
  //       PASSPORTISSUEPLACE => :PASSPORTISSUEPLACE:, PASSPORTNO =>
  // :PASSPORTNO:, PASSPORTPHOTOEXISTS => :PASSPORTPHOTOEXISTS:,
  //       PASSPORTTYPE => :PASSPORTTYPE:, PASSPORT_NO => :PASSPORT_NO:,
  // PASSPORT_SERIAL => :PASSPORT_SERIAL:,
  //       PHONES => :PHONES:, PHONE_HOME => :PHONE_HOME:, PROFESSIONID =>
  // :PROFESSIONID:, REESTRTYPEID => :REESTRTYPEID:,
  //       REGIONALCODEID => :REGIONALCODEID:, RELMANAGER => :RELMANAGER:,
  // RISKGROUPID => :RISKGROUPID:, SITEID => :SITEID:,
  //       SMALLBUSINESSID => :SMALLBUSINESSID:, SNAME => :SNAME:,
  // STATEGIVEDATE => :STATEGIVEDATE:,
  //       STATEREESTRBLANKNO => :STATEREESTRBLANKNO:,
  // STATEREESTRBLANKSERIAL => :STATEREESTRBLANKSERIAL:,
  //       STATEREGISTERDATE => :STATEREGISTERDATE:, STATEREGISTERNO =>
  // :STATEREGISTERNO:,
  //       STATEREGISTERPLACE => :STATEREGISTERPLACE:, SWIFTNAME =>
  // :SWIFTNAME:, TAXPAYERCODE => :TAXPAYERCODE:,
  //       UNIQUECODE => :UNIQUECODE:, VISAEXPIRED => :VISAEXPIRED:,
  // WORKDATE => :WORKDATE:, WORKPLACE => :WORKPLACE:,
  //       WORKPOSITION => :WORKPOSITION:, YREPCONTRAGBUSINESSSEGMID =>
  // :YREPCONTRAGBUSINESSSEGMID:,
  //       YREPCONTRAGRAITINGID => :YREPCONTRAGRAITINGID:, YREPCONTRAGSEGMID
  // => :YREPCONTRAGSEGMID:,
  //       YREPISBIGBANK => :YREPISBIGBANK:, YREPLOANHISTDATE =>
  // :YREPLOANHISTDATE:
  //     );
  //   `, {
  //   ADDRESS: '',
  //   ADDR_BUILDING: '',
  //   ADDR_CITY: '',
  //   ADDR_COUNTRYID: '',
  //   ADDR_COUNTRYNAME: '',
  //   ADDR_DISTRICT: '',
  //   ADDR_FLAT: '',
  //   ADDR_HOUSENO: '',
  //   ADDR_POSTCODE: '',
  //   ADDR_REGION: '',
  //   ADDR_REGIONALCODEID: '',
  //   ADDR_STREET: '',
  //   ALTERNATENAME: '',
  //   BAD_STATUS_FLAG: '',
  //   BANKID: '',
  //   BIC: '',
  //   BIRTHCOUNTRYID: '',
  //   BIRTHPLACE: '',
  //   BPSYNC: '',
  //   BREAKOPENACCOUNT: '',
  //   BUSINESSTYPE1: '',
  //   BUSINESSTYPE2: '',
  //   BUSINESSTYPE3: '',
  //   BUSINESSTYPE4: '',
  //   BUSINESSTYPE5: '',
  //   BUSINESSTYPE6: '',
  //   BUSINESSTYPE7: '',
  //   BUSINESSTYPE8: '',
  //   BUSINESSTYPE9: '',
  //   BUSINESSTYPE10: '',
  //   CANUSEINMARKETING: '',
  //   CITIZENSHIPCOUNTRYID: '',
  //   CLIENTBIRTHDAY: '',
  //   CLIENTLASTNAME: '',
  //   CLIENTNAME: '',
  //   CLIENTPATRONYMICNAME: '',
  //   CLIENTTYPEK014: '',
  //   CLOSEDATE: '',
  //   CLOSEREASONID: '',
  //   CONTRAGENTSEGMENT1ID: '',
  //   CONTRAGENTSEGMENT2ID: '',
  //   CONTRAGENTSTATEID: '',
  //   CONTRAGENTTYPEID: '',
  //   CONTRAGRANKID: '',
  //   COUNTRYID: '',
  //   CURRENCYINFLOW: '',
  //   DELIVERMETHOD: '',
  //   ECONOMICBRANCHID: '',
  //   EDUCATIONID: '',
  //   EMAIL: '',
  //   ENTERPRISETYPEID: '',
  //   FAMILY_STATUSID: '',
  //   FAX: '',
  //   FIRSTNAME_LAT: '',
  //   FMIDENTIFYDATE: '',
  //   GENDER: '',
  //   ID: '',
  //   IDENTIFYCODE: '',
  //   IDENTIFYCODE2: '',
  //   INSIDERID: '',
  //   INSTITUTESECTORID: '',
  //   ISPUBLICPERSON: '',
  //   JURADDR_BUILDING: '',
  //   JURADDR_CITY: '',
  //   JURADDR_COUNTRYID: '',
  //   JURADDR_COUNTRYNAME: '',
  //   JURADDR_DISTRICT: '',
  //   JURADDR_FLAT: '',
  //   JURADDR_HOUSENO: '',
  //   JURADDR_POSTCODE: '',
  //   JURADDR_REGION: '',
  //   JURADDR_REGIONALCODEID: '',
  //   JURADDR_STREET: '',
  //   JURIDICALADDRESS: '',
  //   LASTNAME_LAT: '',
  //   MILITARYLIABLEID: '',
  //   MOBILEPHONE: '',
  //   NACE: '',
  //   NALOGCODEID: '',
  //   NALOGREGISTERDATE: '',
  //   NALOGREGISTERNO: '',
  //   NAME: '',
  //   NATIONALITYID: '',
  //   NBUCONTRAGENTFIELD1: '',
  //   NBUCONTRAGENTFIELD2: '',
  //   NBUCONTRAGENTFIELD3: '',
  //   NICKNAME: '',
  //   NOTE: '',
  //   NR_IDENTIFYCODE: '',
  //   NR_SSN: '',
  //   NR_STATEGIVEDATE: '',
  //   NR_STATEREGISTERADDINFO: '',
  //   NR_STATEREGISTERCOUNTRYID: '',
  //   NR_STATEREGISTERDATE: '',
  //   NR_STATEREGISTERNO: '',
  //   NR_STATEREGISTERPLACE: '',
  //   NR_STATEREGISTRATOR: '',
  //   OLAVCODE: '',
  //   OPENEDINTOBOID: '',
  //   OWNERSHIPTYPEID: '',
  //   PASSPORTENDDATE: '',
  //   PASSPORTISSUEDATE: '',
  //   PASSPORTISSUEPLACE: '',
  //   PASSPORTNO: '',
  //   PASSPORTPHOTOEXISTS: '',
  //   PASSPORTTYPE: '',
  //   PASSPORT_NO: '',
  //   PASSPORT_SERIAL: '',
  //   PHONES: '',
  //   PHONE_HOME: '',
  //   PROFESSIONID: '',
  //   REESTRTYPEID: '',
  //   REGIONALCODEID: '',
  //   RELMANAGER: '',
  //   RISKGROUPID: '',
  //   SITEID: '',
  //   SMALLBUSINESSID: '',
  //   SNAME: '',
  //   STATEGIVEDATE: '',
  //   STATEREESTRBLANKNO: '',
  //   STATEREESTRBLANKSERIAL: '',
  //   STATEREGISTERDATE: '',
  //   STATEREGISTERNO: '',
  //   STATEREGISTERPLACE: '',
  //   SWIFTNAME: '',
  //   TAXPAYERCODE: '',
  //   UNIQUECODE: '',
  //   VISAEXPIRED: '',
  //   WORKDATE: '',
  //   WORKPLACE: '',
  //   WORKPOSITION: '',
  //   YREPCONTRAGBUSINESSSEGMID: '',
  //   YREPCONTRAGRAITINGID: '',
  //   YREPCONTRAGSEGMID: '',
  //   YREPISBIGBANK: '',
  //   YREPLOANHISTDATE: ''
  // })
  s.execSQL('insert into uba_user (ID, name) values (?,?)', { ids: [1, 2], names: ['aa', 'bb'] })
  resp.statusCode = 200
  resp.writeHead('Content-Type: application/json; charset=UTF-8')
  resp.writeEnd({ ok: true })
}
App.registerEndpoint('arrayBind', arrayBind, false)
