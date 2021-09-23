class ElasticDocument {
  constructor ({ date, data, rights, documentName, attachments, author, entity } = {}) {
    this.date = date
    this.data = data
    this.rights = rights
    this.documentName = documentName
    this.author = author
    this.entity = entity
    this.attachments = attachments || []
  }

  fillFromObjectAndFts (entityName, obj, { dateAttribute, indexedAttributes, descriptionAttribute }, fieldsWithDocument) {
    this.date = obj[dateAttribute]
    this.documentName = obj[descriptionAttribute]
    this.entity = entityName
    this.data = indexedAttributes.filter(el => !fieldsWithDocument.has(el)).map(el => obj[el]).join(' ')
    for (const field of fieldsWithDocument) {
      let base64File
      try {
        base64File = UB.App.blobStores.getContent({
          entity: entityName,
          attribute: field,
          ID: obj.ID
        }, { encoding: 'base64' })
      } catch (e) {
        console.error(e)
      }
      const docMeta = JSON.parse(obj[field])
      this.attachments.push({ data: base64File, fileName: docMeta.origName })
    }
  }

  fillRightsFromAclRls (aclRls) {
    this.rights = [1, 2]
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
