require('./UBOnlyOffice.js')

if (!UB.ux.UBDocument) {
  console.error('onlyoffice model must be loaded after admin-ui')
} else {
  let d = UB.ux.UBDocument
  d.editors.onlyOffice = 'UB.ux.UBOnlyOffice'

  d.contentTypeMapping['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = 'UB.ux.UBOnlyOffice'
  d.contentTypeMapping['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = 'UB.ux.UBOnlyOffice'
  d.contentTypeMapping['application/vnd.openxmlformats-officedocument.presentationml.presentation'] = 'UB.ux.UBOnlyOffice'
  d.contentTypeMapping['application/rtf'] = 'UB.ux.UBOnlyOffice'
}
