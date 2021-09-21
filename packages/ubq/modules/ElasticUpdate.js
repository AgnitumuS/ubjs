const ElasticHttpClient = require('./ElasticHttpClient')
const UB = require('@unitybase/ub')

class ElasticUpdate extends ElasticHttpClient {
  constructor (entityName, id, withPipeline = false) {
    const entityInfo = UB.App.domainInfo.get(entityName)
    if (!entityInfo.fts) {
      throw new UB.UBAbort(`<<<No fts mixin in the entity: ${entityName}>>>`)
    }
    const connectionName = entityInfo.fts.connectionName || 'ftsDefault'
    const dbConnectionConfig = UB.App.domainInfo.connections.find(el => el.name === connectionName)
    dbConnectionConfig.serverName = 'http://10.211.55.2:9200'
    const databaseName = `ub-index-${connectionName.toLowerCase()}`
    const idDoc = `${id}-${entityName}`
    const withPipelineUrl = withPipeline && '?pipeline=attachment'
    const url = `${dbConnectionConfig.serverName}/${databaseName}/_doc/${idDoc}${withPipelineUrl}`
    super({ url })
  }

  _update (elasticDocument) {
    this._jsonWithResult('Index document to Elastic', 'PUT', '', elasticDocument)
  }

  _delete () {
    this._jsonWithResult('Delete document into Elastic', 'DELETE', '', '')
  }
}

module.exports = ElasticUpdate
