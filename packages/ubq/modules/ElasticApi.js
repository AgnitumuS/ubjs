const ElasticUpdate = require('./ElasticUpdate')
const UB = require('@unitybase/ub')
const ElasticDocument = require('./ElasticDocument')

class ElasticApi {
  constructor () {
    this.defaultConnection = 'ftsDefault'
  }

  _reindexElement (entityName, id) {
    const domainInfo = UB.App.domainInfo.get(entityName)
    if (domainInfo.mixins.fts.dataProvider !== 'Mixin') {
      console.error(`For Elastic indexes now supported only Mixin data provider for entity: ${entityName}>>>`)
      return
    }
    const attrs = ElasticDocument.getSelectFieldsFromFts(domainInfo)
    const element = UB.Repository(entityName)
      .attrs(attrs)
      .where('ID', '=', id)
      .selectSingle()
    if (element) {
      const elasticUpdate = new ElasticUpdate(entityName)
      const elasticDocument = new ElasticDocument()
      elasticDocument.fillFromObjectAndFts(entityName, element, elasticUpdate.fieldsWithDocuments)
      elasticUpdate._update(elasticDocument, element.ID)
    }
  }

  _reindexEntity (entityName) {
    const domainInfo = UB.App.domainInfo.get(entityName)
    if (domainInfo.mixins.fts.dataProvider !== 'Mixin') {
      console.error(`For Elastic indexes now supported only Mixin data provider for entity: ${entityName}>>>`)
      return
    }
    const attrs = ElasticDocument.getSelectFieldsFromFts(domainInfo)
    let start = 0
    const limit = 1000
    let elements
    // if elements is not initialized yet or length of elements more then zero
    while (!elements || elements.length > 0) {
      elements = UB.Repository(entityName)
        .attrs(attrs)
        .start(start)
        .limit(limit)
        .selectAsObject()
      start = start + limit
      const elasticUpdate = new ElasticUpdate(entityName)
      for (const element of elements) {
        const elasticDocument = new ElasticDocument()
        elasticDocument.fillFromObjectAndFts(entityName, element, elasticUpdate.fieldsWithDocuments)
        elasticUpdate._update(elasticDocument, element.ID)
      }
    }
  }

  _reindexConnection (connectionName) {
    const entities = UB.App.domainInfo.entities
    for (const entityName of Object.keys(entities)) {
      const entity = entities[entityName]
      const fts = entity.mixins.fts
      // fts mixin is exist and connectionName is exist and this connection is Elastic and it's currently indexed or
      // fts minix exists and connection is default and default connection is Elastic and it's currently indexed
      if (fts && fts.enabled && ((fts.connectionName && ElasticApi.isElasticConnection(fts.connectionName) && fts.connectionName === connectionName) ||
        (!fts.connectionName && ElasticApi.isElasticConnection(this.defaultConnection) && this.defaultConnection === connectionName))) {
        this._reindexEntity(entityName)
      }
    }
  }

  _search (search) {
    return { id: 2342123, entity: 'test', entitydescr: 'test', snippet: 'test' }
  }

  deleteFromFTSIndex (entityName, id) {
    const elasticUpdate = new ElasticUpdate(entityName)
    elasticUpdate._delete(id)
  }

  updateFTSIndex (entityName, id) {
    this._reindexElement(entityName, id)
  }

  static isElasticFtsEntity (entityName) {
    const fts = UB.App.domainInfo.get(entityName).mixins.fts
    if (fts && fts.enabled && ((fts.connectionName && this.isElasticConnection(fts.connectionName)) ||
      (!fts.connectionName && this.isElasticConnection('ftsDefault')))) {
      return true
    } else {
      return false
    }
  }

  static isElasticConnection (connectionName) {
    const connectionInfo = UB.App.domainInfo.connections.find(el => el.name === connectionName)
    if (connectionInfo && connectionInfo.dialect === 'Elastic') {
      return true
    } else {
      return false
    }
  }

  ftsElasticReindexEntity (entityName) {
    this._reindexEntity(entityName)
  }

  ftsElasticReindexConnection (connectionName) {
    this._reindexConnection(connectionName)
  }

  fts (search) {
    this._search(search)
  }
}

module.exports = ElasticApi
