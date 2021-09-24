const ElasticHttpClient = require('./ElasticHttpClient')
const UB = require('@unitybase/ub')

class ElasticUpdate extends ElasticHttpClient {
  constructor (entityName) {
    const entityInfo = UB.App.domainInfo.get(entityName)
    const attributes = entityInfo.attributes
    const fts = entityInfo.mixins.fts
    if (!fts) {
      throw new UB.UBAbort(`<<<No fts mixin in the entity: ${entityName}>>>`)
    }
    const connectionName = fts.connectionName || 'ftsDefault'
    const dbConnectionConfig = UB.App.domainInfo.connections.find(el => el.name === connectionName)
    dbConnectionConfig.serverName = 'http://10.211.55.2:9200'
    const databaseName = `ub-index-${connectionName.toLowerCase()}`
    const url = `${dbConnectionConfig.serverName}/${databaseName}/_doc`
    super({ url })
    this._entityName = entityName
    this.fieldsWithDocuments = new Set(fts.indexedAttributes.map(el => attributes[el]).filter(el => el.dataType === 'Document').map(el => el.name))
    this._withPipeline = !!this.fieldsWithDocuments.size
  }

  _update (elasticDocument, id, withPipeline = false) {
    const idDoc = `${id}-${this._entityName}`
    const withPipelineUrl = this._withPipeline ? '?pipeline=attachment' : ''
    const requestOptions = `/${idDoc}${withPipelineUrl}`
    this._jsonWithResult('Index document to Elastic', 'PUT', requestOptions, elasticDocument)
  }

  _delete (id) {
    const idDoc = `${id}-${this._entityName}`
    const requestOptions = `/${idDoc}`
    this._jsonWithResult('Delete document into Elastic', 'DELETE', requestOptions, null)
  }
}

module.exports = ElasticUpdate
