const attrs = [
'dfx_DocType.events',
'dfx_Document.attrValues',
'dfx_DocumentItem.attrValues',
'dfx_DocTypeAction.roles',
'dfx_DocumentImgVersion.imageFile',
'dfx_OcrTemplate.template']

let s = `<% if (conn.dialect.startsWith('Oracle')) { %>`
attrs.forEach(a => {
  let [TBL, ATTR] = a.split('.')
  s += `
--
ALTER TABLE ${TBL} ADD (${ATTR}_c CLOB);
--
UPDATE ${TBL} SET ${ATTR}_c = ${ATTR} WHERE 1=1;
--
ALTER TABLE ${TBL} DROP COLUMN ${ATTR};
--
ALTER TABLE ${TBL} RENAME COLUMN ${ATTR}_c TO ${ATTR};
`
})
s += '<% } %>'

console.log(s)