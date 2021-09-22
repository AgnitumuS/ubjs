const ElasticHttpClient = require('./ElasticHttpClient')
const UB = require('@unitybase/ub')

class ElasticUpdate extends ElasticHttpClient {
  constructor (entityName) {
    const fts = UB.App.domainInfo.get(entityName).mixins.fts
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
  }

  _update (elasticDocument, id, withPipeline = false) {
    const idDoc = `${id}-${this._entityName}`
    const withPipelineUrl = withPipeline && '?pipeline=attachment'
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
