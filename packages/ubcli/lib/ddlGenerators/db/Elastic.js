const DBAbstract = require('./DBAbstract')
const { TableDefinition } = require('../AbstractSchema')
const http = require('http')
const { UBDomain } = require('@unitybase/cs-shared')
const _ = require('lodash')

class Elastic {
  constructor (conn, dbConnectionConfig, referencedTables, isUnsafe = true) {
    this._advSettings = this._toObject(dbConnectionConfig.advSettings, this._advSettings)
    this._indexes = []
    this._withTokinizer = !!this._advSettings.Tokenizer || false
    this._analysis = {
      analysis: {
        filter: {
          uk_UA: {
            type: 'hunspell',
            language: 'uk_UA'
          },
          ru_RU: {
            type: 'hunspell',
            language: 'ru_RU'
          }
        },
        analyzer: {
          ru_RU_uk_UA: {
            tokenizer: 'standard',
            filter: ['lowercase', 'uk_UA', 'ru_RU']
          }
        }
      }
    }
    this._elasticDefaultIndexSettings = {
      mappings: {
        properties: {
          'attachment.content': {
            type: 'text',
            term_vector: 'with_positions_offsets'
          }
        }
      }
    }
    this.dbConnectionConfig = dbConnectionConfig
    this.dbConnectionConfig.serverName = 'http://10.211.55.2:9200'
    this.databaseName = `ub-index-${dbConnectionConfig.name.toLowerCase()}`
    this.conn = conn
    /** @type {Array<TableDefinition>} */
    this.dbTableDefs = []

    this.defaultLang = conn.getAppInfo().defaultLang
    this.isUnsafe = isUnsafe

    this.elasticPipeline = {
      description: 'Extract attachment information',
      processors: [
        {
          attachment: {
            field: 'data'
          }
        },
        {
          remove: {
            field: 'data',
            ignore_failure: true
          }
        }
      ]
    }
    this.elasticIndexSettings = {}
  }

  // transform String 'key = value, ...' to JS object {key: value}
  _toObject (str, result) {
    const regex = /([^=|^,|^\W]+)\s*=\s*([^,|^\W]+)/gm
    let m, key
    result = {}
    while ((m = regex.exec(str)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++
      }
      m.forEach((match, groupIndex) => {
        if (groupIndex === 1) {
          key = match
        } else if (groupIndex === 2) {
          result[key] = match
        }
      })
    }
    return result
  }

  _getIndexes () {
    const URL = `${this.dbConnectionConfig.serverName}/_cat/indices?format=json`
    const rq = http.request({
      URL: URL,
      method: 'GET',
      sendTimeout: 30000,
      receiveTimeout: 30000,
      keepAlive: true,
      compressionEnable: true
    })
    rq.setHeader('Content-Type', 'application/json')
    const response = rq.end()
    const responseData = JSON.parse(response.read())
    return responseData
  }

  /** compare referenced tables with database metadata */
  compare () {
    if (this._indexes.filter(el => el.index === this.databaseName).length === 0) {
      this.elasticIndexSettings = this._elasticDefaultIndexSettings
      if (this._withTokinizer) {
        this.elasticIndexSettings.settings = this._analysis
      }
    }
  }

  generateStatements () {
    const elasticJs = `const http = require('http')
                       function run() {
                           let data, rq, response, responseData
                           const requestParams = {
                             URL: '',
                             method: 'PUT',
                             sendTimeout: 30000,
                             receiveTimeout: 30000,
                             keepAlive: true,
                             compressionEnable: true
                           }
                           // Object.keys(this.elasticPipeline).length > 0
                           if (${Object.keys(this.elasticPipeline).length} > 0) {
                             requestParams.URL = '${this.dbConnectionConfig.serverName}/_ingest/pipeline/attachment'
                             data = ${JSON.stringify(this.elasticPipeline)}
                             rq = http.request(requestParams)
                             rq.setHeader('Content-Type', 'application/json')
                             response = rq.end(data, 'utf-8')
                             responseData = response.read()
                             if (responseData && JSON.parse(responseData).acknowledged) {
                               console.log(\`Elastic pipeline has been updated\`)
                             }  
                           }
                           // Object.keys(this.elasticIndexSettings).length > 0
                           if (${Object.keys(this.elasticIndexSettings).length} > 0) {
                             requestParams.URL = '${this.dbConnectionConfig.serverName}/${this.databaseName}'
                             data = ${JSON.stringify(this.elasticIndexSettings)}
                             rq = http.request(requestParams)
                             rq.setHeader('Content-Type', 'application/json')
                             response = rq.end(data, 'utf-8')
                             responseData = response.read()  
                             if (responseData && JSON.parse(responseData).acknowledged) {
                               console.log(\`Elastic settings for index: \${JSON.parse(responseData).index} has been created\`)
                             }  
                           }                                                 
                       }
                       module.exports = {run}
                       `
    return elasticJs
  }

  loadDatabaseMetadata () {
    this._indexes = this._getIndexes()
  }

  /**
   * Generate a DDL statement for column
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   */
  columnDDL (table, column) {
    // let res = column.name + ' ' +
    //   this.createTypeDefine(column) +
    //   (column.defaultValue ? ` DEFAULT (${column.defaultValue})` : '') +
    //   (column.allowNull ? ' NULL' : ' NOT NULL') +
    //   (column.name === 'ID' ? ' PRIMARY KEY' : '')
    // const checkConstraint = _.find(table.checkConstraints, { column: column.name })
    // if (checkConstraint) {
    //   res += (checkConstraint.type === 'bool'
    //     ? ` CHECK (${checkConstraint.column} IN (0,1) )`
    //     : ` CHECK (${checkConstraint.expression})`)
    // }
    // return res
  }

  /**
   * @param {FKAttributes} constraintFK
   */
  foreignKeyDDL (constraintFK) {
    // // lookup on mustBe tables, because asIs tatbe may noy exist yet
    // const referenceObj = _.find(this.refTableDefs, { _upperName: constraintFK.references.toUpperCase() })
    // if (!referenceObj) {
    //   throw new Error('Referenced object not found. Object name is ' + constraintFK.references)
    // }
    // if (constraintFK.generateFK) {
    //   return ' CONSTRAINT ' + constraintFK.name +
    //     ' FOREIGN KEY (' + constraintFK.keys.join(',') + ') REFERENCES ' +
    //     constraintFK.references + '(' + referenceObj.primaryKey.keys.join(',') + ')'
    // }
  }

  /**
   * @override
   */
  genCodeCreateTable (table) {
    // let res
    // const entity = table.__entity
    // const colLen = table.columns.length
    //
    // if (entity.isFTSDataTable) {
    //   res = ['CREATE VIRTUAL TABLE ', table.name, ' USING fts4(\r\n']
    // } else {
    //   res = ['CREATE TABLE ', table.name, ' (\r\n']
    // }
    //
    // table.columns.forEach((column, index) => {
    //   if (column.name === 'rowid') {
    //     return
    //   }
    //   res.push('\t', this.columnDDL(table, column))
    //   if (index < colLen - 1) res.push(',')
    //   if (column.caption) res.push(' --', column.caption)
    //   res.push('\r\n')
    // })
    // if (table.isIndexOrganized && table.primaryKey) {
    //   res.push(' ,CONSTRAINT ', table.primaryKey.name,
    //     ' PRIMARY KEY ( ', table.primaryKey.keys.join(','), ') \r\n')
    // }
    //
    // table.foreignKeys.forEach((fk) => {
    //   const fkText = this.foreignKeyDDL(fk)
    //   if (fkText) {
    //     res.push('\t,' + fkText + '\t\n')
    //   }
    // })
    //
    // function getParamValue (params, name) {
    //   let res
    //   for (const param of params) {
    //     if (param.startsWith(name + '=')) {
    //       res = param.slice(name.length + 1)
    //       break
    //     }
    //   }
    //   return res
    // }

    // if (entity.isFTSDataTable) { // add a tokenizer
    //   const advSettings = entity.connectionConfig.advSettings.split(',')
    //   if (advSettings.length) {
    //     const tokenizer = getParamValue(advSettings, 'Tokenizer') || ''
    //     if (tokenizer) {
    //       const aLang = table.name.split('_').pop() // get the language as a last part of name `fts_myEntity_uk` -> `uk`
    //       let tokenizerParams = getParamValue(advSettings, 'TokenizerParams') || ''
    //       if (tokenizerParams.indexOf('lang=') === -1) { // no lang is defined in params - add a lang
    //         tokenizerParams += 'lang=' + aLang
    //       }
    //       res.push(',tokenize=', tokenizer, ' ', tokenizerParams)
    //     }
    //   }
    //   res.push()
    // }
    // res.push(')')
    // this.DDL.createTable.statements.push(res.join(''))
    // this.DDL.createTable.statements.push('')
  }

  genCodeRename (table, oldName, newName, typeObj) {
    throw new Error(`try to rename ${typeObj} for ${table.name} ${oldName} -> ${newName}`)
  }

  /**
   * Convert database types to universal.
   * @param dataType
   * @param {number} len
   * @param {number}  prec
   * @param {number}  scale
   * @return {string}
   */
  dataBaseTypeToUni (dataType, len, prec, scale) {
    // dataType = dataType.toUpperCase()
    // switch (dataType) {
    //   case 'NUMERIC':
    //     if (prec === 19 && scale === 2) {
    //       return 'CURRENCY'
    //     } else if (prec === 19 && scale > 2) {
    //       return 'FLOAT'
    //     } else {
    //       return 'BIGINT'
    //     }
    //   case 'INT8': return 'BIGINT'
    //   case 'INT4': return 'INTEGER'
    //   case 'SMALLINT': return 'BOOLEAN'
    //   case 'TIMESTAMP': return 'TIMESTAMP'
    //   case 'TIMESTAMP WITH TIME ZONE': return 'DATETIME'
    //   case 'TIMESTAMP WITHOUT TIME ZONE': return 'TIMESTAMP WITHOUT TIME ZONE'
    //   case 'DATE': return 'DATE'
    //   case 'CHARACTER VARYING': return 'UVARCHAR'
    //   case 'NVARYING': return 'UVARCHAR'
    //   case 'VARCHAR': return 'UVARCHAR'
    //   case 'TEXT': return 'TEXT'
    //   case 'BYTEA': return 'BLOB'
    //   default: return dataType
    // }
  }

  /**
   * Convert universal types to database
   * @param {string} dataType
   * @return {string}
   */
  uniTypeToDataBase (dataType) {
    // switch (dataType) {
    //   case 'VARCHAR': return 'VARCHAR'
    //   case 'NVARCHAR': return 'VARCHAR'
    //   case 'INTEGER': return 'INTEGER'
    //   case 'BIGINT': return 'BIGINT'
    //   case 'FLOAT': return 'FLOAT'
    //   case 'CURRENCY': return 'NUMERIC'
    //   case 'BOOLEAN': return 'SMALLINT'
    //   // case 'DATETIME': return 'TEXT COLLATE ISO8601';
    //   case 'DATETIME': return 'DATETIME'
    //   case 'TEXT': return 'TEXT'
    //   case 'DOCUMENT': return 'TEXT'
    //   case 'BLOB': return 'BLOB'
    //   default: return dataType
    // }
  }

  /**
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   * @param {boolean} [delayedNotNull] optional true to set not null in alter
   */
  genCodeAddColumn (table, column, delayedNotNull) {
    // if (!column.allowNull) column.allowNull = true // MPV TODO TEMPORARY!!
    // this.DDL.addColumn.statements.push(
    //   `ALTER TABLE ${table.name} ADD ${this.columnDDL(table, column)}`
    // )
  }

  /**
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   * @param baseColumn
   */
  genCodeAddColumnBase (table, column, baseColumn) {
    // if (!column.allowNull) column.allowNull = true // MPV TODO TEMPORARY!!
    // this.DDL.addColumn.statements.push(
    //   `ALTER TABLE ${table.name} ADD ${this.columnDDL(table, column)}`
    // )
    //
    // this.DDL.updateColumn.statements.push(
    //   `UPDATE ${table.name} SET ${column.name} = ${baseColumn} WHERE (1 = 1)`
    // )
    // if (!column.allowNull){
    //    this.resAlterColumnNotNullSQL.push(
    //        ['alter table ', table.name, ' alter column ', column.name , ' ',
    //            this.createTypeDefine(column), (column.allowNull ? ' null': ' not null') ].join('')
    //    );
    // }
  }

  getExpression (macro, column, table) {
    // function dateTimeExpression (val) {
    //   if (!val) { return val }
    //   switch (val) {
    //     case 'currentDate':
    //       return "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')"
    //     case 'maxDate':
    //       return "'9999-12-31'"
    //     default :
    //       throw new Error(`Unknown expression "${val}" for default value of ${table ? table.name : '?'}.${column ? column.name : '?'}`)
    //   }
    // }
    //
    // if (!column) return dateTimeExpression(macro)
    //
    // if (column.isBoolean) return ((macro === 'TRUE') || (macro === '1')) ? '1' : '0'
    // if (column.isString) return "'" + macro + "'"
    // if (column.dataType === 'DATETIME') return dateTimeExpression(macro)
    // return macro
  }

  genCodeSetCaption (tableName, column, value, oldValue) {
    // TODO - comments may be added directly to the DDL statement create table bla-_lka --table bla-bla
  }

  genCodeAlterColumn (table, tableDB, column, columnDB, typeChanged, sizeChanged, allowNullChanged) {
    // this.DDL.warnings.statements.push(`Attempt to alter a column ${tableDB.name}.${columnDB.name} as (typeChanged: ${typeChanged}, sizeChanged: ${sizeChanged}, allowNullChanged: ${allowNullChanged}`)
  }

  genCodeSetDefault (table, column) {
    // Real implementation for SQLIte3 is in the create table
    // alter table X alter column Y set default Z
  }

  genCodeCreatePK (table) {
    // Real implementation for SQLIte3 is in the create table
  }

  genCodeCreateFK (table, constraintFK) {
    // FK name is fake for SQLIte3, so warning doesn't matter
    // this.DDL.warnings.statements.push(
    //   `Attempt to create FK 'alter table ${table.name} add constraint ${constraintFK.name}...`
    // )
  }

  genCodeCreateIndex (table, indexSH, comment) {
    // if (table.__entity.isFTSDataTable) return // virtual tables may not be indexed
    // this.DDL.createIndex.statements.push(
    //   [comment ? '--' + comment + '\r\n' : '', indexSH.isUnique ? 'CREATE UNIQUE INDEX ' : 'CREATE INDEX ', indexSH.name, ' ON ', table.name,
    //     '(', indexSH.keys.join(','), ') '].join('')
    // )
  }

  genCodeCreateCheckC (table, checkConstr) {
    // moved to create table
  }

  genCodeDropColumn (tableDB, columnDB) {
    // this.DDL.dropColumn.statements.push(`alter table ${tableDB.name} drop column ${columnDB.name}`)
  }

  genCodeDropConstraint (tableName, constraintName) {
    // FK name is fake for SQLIte3, so warning doesn't matter
    // this.DDL.warnings.statements.push(`Attempt to drop a constraint ${constraintName} on table ${tableName}`)
  }

  genCodeAddSequence (sequenceObj) {
    // nothing to do
  }

  genCodeDropDefault (table, column) {
    // this.DDL.warnings.statements.push(`Attempt to drop a default for ${table.name}.${column.name}`)
  }

  genCodeDropIndex (tableDB, table, indexDB, comment, objCollect) {
    // this.DDL.warnings.statements.push(`Attempt to drop a index ${indexDB.name} on table ${tableDB.name}`)
  }
}

module.exports = Elastic
