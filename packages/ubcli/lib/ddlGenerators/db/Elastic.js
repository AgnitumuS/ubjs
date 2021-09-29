const http = require('http')

class Elastic {
  constructor (conn, dbConnectionConfig, referencedTables, isUnsafe = true) {
    this._advSettings = this._toObject(dbConnectionConfig.advSettings, this._advSettings)
    this._indexes = []
    this._withTokinizer = !!this._advSettings.Tokenizer || false
    this._indexAlreadyExists = false
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
    this.elasticIndexSettings = {
      mappings: {
        properties: {
          'attachments.attachment.content': {
            type: 'text',
            term_vector: 'with_positions_offsets'
          },
          data: {
            type: 'text',
            term_vector: 'with_positions_offsets'
          }
        }
      }
    }
    if (this._withTokinizer) {
      this.elasticIndexSettings.settings = this._analysis
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
      description: 'Extract attachment information from arrays',
      processors: [
        {
          foreach: {
            field: 'attachments',
            processor: {
              attachment: {
                target_field: '_ingest._value.attachment',
                field: '_ingest._value.data'
              }
            }
          }
        },
        {
          foreach: {
            field: 'attachments',
            processor: {
              remove: {
                field: '_ingest._value.data',
                ignore_failure: true
              }
            }
          }
        }
      ]
    }
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
    const rq = http.request({ URL })
    rq.setHeader('Content-Type', 'application/json')
    const response = rq.end()
    const responseData = response.json()
    return responseData
  }

  /** compare referenced tables with database metadata */
  compare () {
    if (this._indexes.filter(el => el.index === this.databaseName).length) {
      this._indexAlreadyExists = true
    } else {
      this._indexAlreadyExists = false
    }
  }

  generateStatements () {
    const elasticJs = `const http = require('http')
                       function run() {
                           let URL, data, rq, response, responseData                               
                           // Object.keys(this.elasticPipeline).length > 0
                           if (${Object.keys(this.elasticPipeline).length} > 0) {
                             URL = '${this.dbConnectionConfig.serverName}/_ingest/pipeline/attachment'
                             data = ${JSON.stringify(this.elasticPipeline)}
                             rq = http.request({URL, method: 'PUT'})
                             rq.setHeader('Content-Type', 'application/json')
                             response = rq.end(data, 'utf-8')
                             responseData = response.read()
                             if (responseData && JSON.parse(responseData).acknowledged) {
                               console.log(\`Elastic pipeline has been updated\`)
                             } else {
                               console.error(\`Error occurred during Elastic pipeline update\${responseData}\`) 
                             } 
                           }
                           if (${this._indexAlreadyExists}) {
                             URL = '${this.dbConnectionConfig.serverName}/${this.databaseName}'                       
                             rq = http.request({URL, method: 'DELETE'})               
                             response = rq.end()
                             responseData = response.read()  
                             if (responseData && JSON.parse(responseData).acknowledged) {
                               console.log(\`Elastic index: \${JSON.parse(responseData).index} was deleted\`)
                             } else {
                               console.error(\`Error occurred during Elastic index delete \${responseData}\`) 
                             } 
                           }          
                           // Object.keys(this.elasticIndexSettings).length > 0                           
                           if (${Object.keys(this.elasticIndexSettings).length} > 0) {
                             URL = '${this.dbConnectionConfig.serverName}/${this.databaseName}'
                             data = ${JSON.stringify(this.elasticIndexSettings)}
                             rq = http.request({URL, method: 'PUT'})
                             rq.setHeader('Content-Type', 'application/json')
                             response = rq.end(data, 'utf-8')
                             responseData = response.read()  
                             if (responseData && JSON.parse(responseData).acknowledged) {
                               console.log(\`Elastic settings for index: \${JSON.parse(responseData).index} has been created\`)
                             } else {
                               console.error(\`Error occurred during Elastic index create \${responseData}\`) 
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

  genCodeRename (table, oldName, newName, typeObj) {
    throw new Error(`try to rename ${typeObj} for ${table.name} ${oldName} -> ${newName}`)
  }
}

module.exports = Elastic
