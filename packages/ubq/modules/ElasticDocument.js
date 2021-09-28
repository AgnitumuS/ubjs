const UB = require('@unitybase/ub')

class ElasticDocument {
  constructor ({ ID, date, data, rights, documentName, attachments, author, entity } = {}) {
    this.ID = ID
    this.date = date
    this.data = data
    this.rights = rights || null
    this.documentName = documentName
    this.author = author
    this.entity = entity
    this.attachments = attachments || []
  }

  fillFromObjectAndFts (entityName, obj, fieldsWithDocument) {
    const domainInfo = UB.App.domainInfo.get(entityName)
    const { dateAttribute, indexedAttributes, descriptionAttribute } = domainInfo.mixins.fts
    this.ID = obj.ID
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
    if (domainInfo.mixins.aclRls) {
      const entityConnectAttr = domainInfo.mixins.aclRls.entityConnectAttr.replace(/[[\]']+/g, '')
      const entityNameAcl = `${entityName}_acl`
      const elements = UB.Repository(entityNameAcl)
        .attrs('valueID')
        .where('instanceID', '=', obj[entityConnectAttr])
        .selectAsObject()
      this.rights = elements.map(el => el.valueID)
    }
  }

  static getSelectFieldsFromFts (domainInfo) {
    const { dateAttribute, indexedAttributes, descriptionAttribute } = domainInfo.mixins.fts
    const selectFields = [...indexedAttributes]
    selectFields.push('ID')
    selectFields.push(dateAttribute)
    selectFields.push(descriptionAttribute)
    if (domainInfo.aclRls) {
      selectFields.push(domainInfo.aclRls.entityConnectAttr)
    }
    return [...new Set(selectFields)].filter(el => el !== undefined)
  }
}
module.exports = ElasticDocument
