const ElasticHttpClient = require('./ElasticHttpClient')
const ElasticDocument = require('./ElasticDocument')
const fs = require('fs')
const UB = require('@unitybase/ub')

class ElasticApi extends ElasticHttpClient {
  constructor (serverName, indexName, id) {
    const URL = `${serverName}/${indexName}/_doc/${id}?pipeline=attachment`
    super(URL)
  }

  _reindexEntity (entityName) {
    const rows = UB.Repository(entityName)
      .attrs(['ID', 'queueCode', 'msgCmd'])
      .limit(1000)
      .select()
    for (const row of rows) {
      this._update(entityName, row.ID)
    }
  }

  _reindexAll (connectionName) {
    const entityInfo = this._getEntityDomainInformation(connectionName)
    for (const entity of entityInfo) {
      this._reindexEntity(entity)
    }
  }

  _updateFile (index, fileName) {
    const fileContents = fs.readFileSync(fileName)
    const elasticDocument = new ElasticDocument()
    elasticDocument.date = '01.01.2021'
    elasticDocument.data = Buffer.from(fileContents).toString('base64')
    elasticDocument.rights = [111, 21, 321]
    elasticDocument.documentName = 'Отчет'
    elasticDocument.fileName = fileName
    elasticDocument.author = 'Иванов И.И,'
    this._jsonWithResult('Index file to Elastic', 'PUT', '', elasticDocument)
  }

  _update (entityName, id) {
    const elasticDocument = new ElasticDocument()
    elasticDocument.date = '01.01.2021'
    elasticDocument.data = Buffer.from('test').toString('base64')
    elasticDocument.rights = [111, 21, 321]
    elasticDocument.documentName = 'Отчет'
    elasticDocument.fileName = 'test'
    elasticDocument.author = 'Иванов И.И,'
    this._jsonWithResult('Index document to Elastic', 'PUT', '', elasticDocument)
  }

  deleteFromFTSIndex (entityName, id) {
    this._jsonWithResult('Delete document in the Elastic', 'DELETE', '')
  }

  updateFTSIndex (entityName, id) {
    this._update(entityName, id)
  }

  static _getEntityDomainInformation (entityName) {
    return UB.App.domainInfo.get(entityName)
  }

  static isElasticFtsEntity (entityName) {
    const entityInfo = this._getEntityDomainInformation(entityName)
    if (entityInfo) {
      return true
    } else {
      return false
    }
  }

  static isElasticConnection (connectionName) {
    const entityInfo = true// this.(connectionName)
    if (entityInfo) {
      return true
    } else {
      return false
    }
  }

  ftsElasticReindex (req) {
    const entityReindex = JSON.parse(req).entity
    if (entityReindex) {
      this._reindexAll()
    } else {
      this._reindexEntity(entityReindex)
    }
  }
}

module.exports = ElasticApi
