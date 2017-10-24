const me = tst_clob

/**
 * Pass additional attributes into select method result
 * @param {ubMethodParams} ctxt
 */
function tstClobAfterSelect (ctxt) {
  ctxt.mParams.additionalData = JSON.stringify({add1: 'MyName', add2: new Date(), add3: 128})
}
me.on('select:after', tstClobAfterSelect)
