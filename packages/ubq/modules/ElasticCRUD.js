const ElasticHttpClient = require('./ElasticHttpClient')
const UB = require('@unitybase/ub')

class ElasticCRUD extends ElasticHttpClient {
  constructor ({ entityName, connectionName }) {
    let fts, entityInfo
    if (entityName) {
      entityInfo = UB.App.domainInfo.get(entityName)
      fts = entityInfo.mixins.fts
      if (!fts) {
        throw new UB.UBAbort(`<<<No fts mixin in the entity: ${entityName}>>>`)
      }
      connectionName = fts.connectionName || 'ftsDefault'
    }
    const dbConnectionConfig = UB.App.domainInfo.connections.find(el => el.name === connectionName)
    if (!dbConnectionConfig) {
      throw new UB.UBAbort(`<<<No connection exists: ${connectionName}>>>`)
    }
    dbConnectionConfig.serverName = 'http://10.211.55.2:9200'
    const databaseName = `ub-index-${connectionName.toLowerCase()}`
    const url = `${dbConnectionConfig.serverName}/${databaseName}/`
    super({ url })
    this._entityName = entityName || ''
    this._entityInfo = entityInfo || {}
    this._fts = fts || {}
    this._query = {
      _source: true,
      query: {
        bool: {
          must: [
            {
              simple_query_string: {
                fields: [
                  'author^2',
                  'data^2',
                  'documentName^2',
                  'attachments.attachment.content'
                ],
                query: 'Світлик',
                default_operator: 'or',
                analyze_wildcard: true
              }
            }

          ]

        }
      },
      fields: [
        'ID',
        'date',
        'data',
        'documentName',
        'fileName',
        {
          field: 'attachment.date',
          format: 'dd.MM.yyyy HH:mm'
        }
      ],
      highlight: {
        fields: {
          'attachments.attachment.content': {
            fragment_size: 400,
            type: 'fvh'
          },
          data: {
            fragment_size: 400,
            type: 'fvh'
          }
        }
      }
    }
  }

  get fieldsWithDocuments () {
    return new Set(this._fts.indexedAttributes
      .map(el => this._entityInfo.attributes[el])
      .filter(el => el.dataType === 'Document')
      .map(el => el.name))
  }

  get _withPipeline () {
    return !!this.fieldsWithDocuments.size || false
  }

  get query () {
    return this._query
  }

  set query (queryText) {
    this._query.query.bool.must[0].simple_query_string.query = queryText
  }

  _select (queryText) {
    const requestOptions = '/_search?pretty'
    this.query = queryText
    const result = this._jsonWithResult('Search in Elastic', 'GET', requestOptions, this.query)
    return result
  }

  _update (elasticDocument, id, withPipeline = false) {
    const idDoc = `${this._entityName}-${id}`
    const withPipelineUrl = this._withPipeline ? '?pipeline=attachment' : ''
    const requestOptions = `/_doc/${idDoc}${withPipelineUrl}`
    this._jsonWithResult('Index document to Elastic', 'PUT', requestOptions, elasticDocument)
  }

  _delete (id) {
    const idDoc = `${this._entityName}-${id}`
    const requestOptions = `/_doc/${idDoc}`
    this._jsonWithResult('Delete document into Elastic', 'DELETE', requestOptions, null)
  }
}

module.exports = ElasticCRUD
