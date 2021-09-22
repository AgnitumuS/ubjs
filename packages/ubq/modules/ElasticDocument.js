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

  fillFromObjectAndFts (obj, { dateAttribute, indexedAttributes, descriptionAttribute }) {
    this.date = obj[dateAttribute]
    this.documentName = obj[descriptionAttribute]
    this.data = indexedAttributes.map(el => obj[el]).join(' ')
  }

  static getSelectFieldsFromFts ({ dateAttribute, indexedAttributes, descriptionAttribute }) {
    const selectFields = [...indexedAttributes]
    selectFields.push('ID')
    selectFields.push(dateAttribute)
    selectFields.push(descriptionAttribute)
    return [...new Set(selectFields)].filter(el => el !== undefined)
  }
}
module.exports = ElasticDocument
