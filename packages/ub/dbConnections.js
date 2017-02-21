/**
 * Created by v.orel on 22.12.2016.
 */

const binding = process.binding('ub_dbConnection')
const bindingDatabases = binding.databases
const QueryString = require('querystring')
const databases = {}
const dbIndexSymbol = Symbol('dbIndex')
const chDblQuote = 34
const chQuote = 39
const chColon = 58
const chLRoundBrac = 40
const chRRoundBrac = 41
const chLBrac = 91
// const chRBrac = 93
const chZero = 48
const chNine = 57
const chPlus = 43
const chMinus = 45
const chQuestionMark = 63
const chPoint = 46
const chN = 110
const chU = 117
const chL = 108
const chEGr = 69
const chELw = 101
const chSpace = 32
const chLF = 10
const chCR = 13
//
    //    ;
class TubDatabase_ {
  constructor (index) {
    Object.defineProperty(this, dbIndexSymbol, {value: index})
  }
  get inTransaction () {
    return binding.inTransaction(this[dbIndexSymbol])
  }
  startTransaction () {
    return binding.startTransaction(this[dbIndexSymbol])
  }
  commit () {
    return binding.commit(this[dbIndexSymbol])
  }
  rollback () {
    return binding.rollback(this[dbIndexSymbol])
  }
  run (sql, params) {
    const {parsedSql, parsedParams} = this.parseSQL(sql, params)
    return binding.run(this[dbIndexSymbol], parsedSql, parsedParams)
  }
  exec (sql, params) {
    const {parsedSql, parsedParams} = this.parseSQL(sql, params)
    return binding.exec(this[dbIndexSymbol], parsedSql, parsedParams)
  }
  genID (entity) {
    return binding.genID(entity)
  }
  parseSQL (sql, params) {
    // return {parsedSql: sql, parsedParams: []}
    let parsedSql = []
    const parsedParams = []
    const paramPositions = []
    let unnamedParamsCount = 0
    params = params || {}
    for (let i = 0, ch = sql.charCodeAt(0); i < sql.length; ch = sql.charCodeAt(++i)) {
      if (ch === chDblQuote) {
        while ((i < sql.length) && (sql.charCodeAt(++i) !== chDblQuote)) {}
      } else if (ch === chQuote) {
        while ((i < sql.length) && (sql.charCodeAt(++i) !== chQuote)) {}
      } else if (ch === chColon) {
                // while ((i< sql.length) && (sql.charCodeAt(++i) !== chQuote)) {}
        if ((ch = sql.charCodeAt(++i)) === chColon) {
                    // MSSQL ALTER AUTHORIZATION ON database::testdb
        } else if (ch === chLRoundBrac) {
          // syn inline :(value):
          let inlineParamValue, paramStart, paramEnd
          ch = sql.charCodeAt(++i)
          paramStart = i
          if ((ch === chQuote) || (ch === chDblQuote)) {
            const quote = ch
            let curPosition = i + 1
            inlineParamValue = []
            while (i < sql.length) {
              ch = sql.charCodeAt(++i)
              if (ch === quote) {
                inlineParamValue.push(sql.slice(curPosition, i))
                if ((ch = sql.charCodeAt(++i)) === quote) {
                  // allow double quotes inside string
                  curPosition = i
                } else {
                  break
                }
              }
            }
            inlineParamValue = inlineParamValue.join('')
          } else if ((ch === chPlus) || (ch === chMinus) || ((ch >= chZero) && (ch <= chNine))) {
            while (((ch = sql.charCodeAt(++i)) >= chZero) && (ch <= chNine)) {}
            if (ch === chPoint) {
              while (((ch = sql.charCodeAt(++i)) >= chZero) && (ch <= chNine)) {}
            }
            if ((ch === chEGr) || (ch === chELw)) {
              ch = sql.charCodeAt(++i)
              if ((ch === chPlus) || (ch === chMinus)) {
                ch = sql.charCodeAt(++i)
              }
              while (((ch = sql.charCodeAt(++i)) >= chZero) && (ch <= chNine)) {}
            }
            inlineParamValue = Number.parseFloat(sql.slice(paramStart, paramEnd))
          } else if (ch === chLBrac) {
            let arraySearchPosition = paramStart
            while (i < sql.length) {
              i = sql.indexOf(']):', arraySearchPosition)
              i++
              try {
                inlineParamValue = JSON.parse(sql.slice(paramStart, i))
              } catch (e) {
                arraySearchPosition = i
              }
              if (inlineParamValue !== undefined) {
                if (inlineParamValue.length === 0) {
                  throw new Error('Empty array binding')
                }
                const requiredType = typeof inlineParamValue[0]
                if ((requiredType !== 'number') && (requiredType !== 'string')) {
                  throw new Error('Only String or Int64 array binding allowed')
                }
                for (let element of inlineParamValue) {
                  if (typeof element !== requiredType) {
                    throw new Error(`Array binding ${requiredType} type required`)
                  }
                }
                break
              }
            }
          } else if (ch === chN) {
            if (((ch = sql.charCodeAt(++i)) === chU) && ((ch = sql.charCodeAt(++i)) === chL) && ((ch = sql.charCodeAt(++i)) === chL)) {
              ch = sql.charCodeAt(++i)
              inlineParamValue = null
            }
          }
          paramEnd = i
          while ((ch = sql.charCodeAt(i)) <= chSpace) {
            i++
          }

          if ((ch !== chRRoundBrac) || ((ch = sql.charCodeAt(++i)) !== chColon)) {
            throw new Error('Error parsing SQL')
          }
          if (inlineParamValue === undefined) {
            throw new Error('Error parsing inline parameter')
          }
          parsedParams.push(inlineParamValue)
          paramPositions.push({paramStart: paramStart - 2, paramEnd: paramEnd + 2})
        } else {
          // UB :paramName: - replace by ? and add a named param to AOutParams
          const paramStart = i
          while ((ch = sql.charCodeAt(++i)) !== chColon) {}
          const paramEnd = i
          const paramName = sql.slice(paramStart, paramEnd)
          const paramValue = params[paramName]
          if (paramValue === undefined) {
            throw new Error(`Param ${paramName} not found`)
          } else {
            parsedParams.push(paramValue)
          }
          paramPositions.push({paramStart: paramStart - 1, paramEnd: paramEnd + 1})
        }
      } else if (ch === chQuestionMark) {
        const unnamedParamValue = params[unnamedParamsCount++]
        if (unnamedParamValue === undefined) {
          throw new Error(`Param ${unnamedParamsCount - 1} not found`)
        } else {
          parsedParams.push(unnamedParamValue)
        }
      } else if (ch === chMinus) {
        if ((ch = sql.charCodeAt(++i)) === chMinus) {
        // comments
          while ((i < sql.length) && ((ch = sql.charCodeAt(++i)) !== chLF) && (ch !== chCR)) {}
        }
      }
    }
    let startPos = 0
    for (let curParam = 0; curParam < paramPositions.length; curParam++) {
      parsedSql.push(sql.slice(startPos, paramPositions[curParam].paramStart))
      parsedSql.push('?')
      startPos = paramPositions[curParam].paramEnd
    }
    if (parsedSql.length === 0) {
      parsedSql = sql
    } else {
      parsedSql.push(sql.slice(startPos, sql.length))
      parsedSql = parsedSql.join('')
    }
    return {parsedSql, parsedParams}
  }
}

for (let index in bindingDatabases) {
  Object.defineProperty(databases, bindingDatabases[index], {value: new TubDatabase_(Number.parseInt(index)), enumerable: true})
}

Object.defineProperty(App, 'databases_', {value: databases})
Object.defineProperty(App, 'defaultDatabase_', {value: databases[binding.defaultDb]})

/**
 *
 * @param {THTTPRequest} req
 * @param {THTTPResponse} resp
 * @private
 */
function runSQL_ (req, resp) {
  if (App.localIPs.indexOf(Session.callerIP) === -1) {
    throw new Error(`Only local execution allowed. Caller remoteIP="${Session.callerIP}"`)
  }

  let database,
    sql,
    sqlParams

  if (Object.keys(App.databases_).length === 0) {
    throw new Error('Application dose not support connections')
  }

  const parameters = QueryString.parse(req.parameters, null, null)
  const connectionName = parameters.connection
  if (connectionName) {
    database = App.databases_[connectionName]
  } else {
    database = App.defaultDatabase_
  }

  if (!database) { throw new Error('unknown connection name') }

  if (req.method === 'GET') {
    sql = parameters.sql
    sqlParams = null
  } else {
    sql = req.read()
    delete parameters.connection
    sqlParams = parameters
  }

  if (!sql) { throw new Error('no SQL statement passed') }

  resp.writeEnd(database.run(sql, sqlParams))
  resp.statusCode = 200
}

App.registerEndpoint('runSQL_', runSQL_, true)

