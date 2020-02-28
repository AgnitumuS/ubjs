require('./UBOnlyOffice.js')

if (UB.ux.UBDocument) {
  Ext.define('UB.ux.UBOnlyOfficeDocument', {
    override: 'UB.ux.UBDocument',
    statics: {
      editors: Object.assign(UB.ux.UBDocument.editors, {
        onlyOffice: 'UB.ux.UBOnlyOffice'
      }),
      contentTypeMapping: Object.assign(UB.ux.UBDocument.contentTypeMapping, {
        'application/word': 'UB.ux.UBOnlyOffice',
        'application/excel': 'UB.ux.UBOnlyOffice',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'UB.ux.UBOnlyOffice',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'UB.ux.UBOnlyOffice'
      })
    }
  })
}
