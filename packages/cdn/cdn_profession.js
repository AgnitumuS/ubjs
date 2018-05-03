// User: banyai Date: 20.09.13
/* global cdn_profession */
// eslint-disable-next-line camelcase
const me = cdn_profession
const svc = require('@unitybase/ubs/modules/service').Service
me.on('insert:before', setCodeIfEmpty)

function setCodeIfEmpty (ctxt) {
  svc.setCode(ctxt, '----', 12)
}
