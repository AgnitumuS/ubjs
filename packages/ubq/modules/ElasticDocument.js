class ElasticDocument {
  constructor ({ date, data, rights, documentName, fileName, author, entity } = {}) {
    this.date = date
    this.data = data
    this.rights = rights
    this.documentName = documentName
    this.fileName = fileName
    this.author = author
    this.entity = entity
    return this
  }

  fillFromObjectAndFts(obj, { dateElement, indexedElements } ) {
    this.date = obj[dateElement]
    const indexedElements = fts.
    this.data = objdata
  }
}
module.exports = ElasticDocument
