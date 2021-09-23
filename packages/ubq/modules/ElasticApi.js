const ElasticUpdate = require('./ElasticUpdate')
const UB = require('@unitybase/ub')
const ElasticDocument = require('./ElasticDocument')

class ElasticApi {
  constructor () {
    this.defaultConnection = 'ftsDefault'
  }

  _reindexElement (entityName, id) {
    const fts = UB.App.domainInfo.get(entityName).mixins.fts
    const aclRls = UB.App.domainInfo.get(entityName).mixins.aclRls
    if (fts.dataProvider === 'Mixin') {
      const attrs = ElasticDocument.getSelectFieldsFromFts(fts)
      const element = UB.Repository(entityName)
        .attrs(attrs)
        .where('ID', '=', id)
        .selectAsObject()
      if (element) {
        const elasticUpdate = new ElasticUpdate(entityName)
        const elasticDocument = new ElasticDocument()
        elasticDocument.fillFromObjectAndFts(entityName, element, fts, elasticUpdate.fieldsWithDocuments)
        if (aclRls) {
          elasticDocument.fillRightsFromAclRls(aclRls)
        }
        elasticDocument.entity = entityName
        elasticUpdate._update(elasticDocument, element.ID)
      }
    }
  }

  _reindexEntity (entityName) {
    const fts = UB.App.domainInfo.get(entityName).mixins.fts
    const aclRls = UB.App.domainInfo.get(entityName).mixins.aclRls
    if (fts.dataProvider === 'Mixin') {
      const attrs = ElasticDocument.getSelectFieldsFromFts(fts)
      const elements = UB.Repository(entityName)
        .attrs(attrs)
        .limit(1000)
        .selectAsObject()
      const elasticUpdate = new ElasticUpdate(entityName)
      for (const element of elements) {
        const elasticDocument = new ElasticDocument()
        elasticDocument.fillFromObjectAndFts(entityName, element, fts, elasticUpdate.fieldsWithDocuments)
        if (aclRls) {
          elasticDocument.fillRightsFromAclRls(aclRls)
        }
        elasticDocument.entity = entityName
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
      if (fts && ((fts.connectionName && ElasticApi.isElasticConnection(fts.connectionName) && fts.connectionName === connectionName) ||
        (!fts.connectionName && ElasticApi.isElasticConnection(this.defaultConnection) && this.defaultConnection === connectionName))) {
        this._reindexEntity(entityName)
      }
    }
  }

  deleteFromFTSIndex (entityName, id) {
    const elasticUpdate = new ElasticUpdate(entityName)
    elasticUpdate._delete(id)
  }

  updateFTSIndex (entityName, id) {
    this._reindexElement(entityName, id)
  }

  static isElasticFtsEntity (entityName) {
    const entityInfo = UB.App.domainInfo.get(entityName)
    if (entityInfo) {
      return true
    } else {
      return false
    }
  }

  static isElasticConnection (connectionName) {
    const connectionInfo = UB.App.domainInfo.connections.find(el => el.name === connectionName)
    if (connectionInfo.dialect === 'Elastic') {
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
}

module.exports = ElasticApi
