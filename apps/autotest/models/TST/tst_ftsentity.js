'use strict'

const me = tst_ftsentity
const _attrForFTS = ['caption', 'regDate']

me.entity.addMethod('getFTSData')

/**
 * Create and return string for fts index
 * @param {ubMethodParams} ctx
 * @return {Boolean}
 */
me.getFTSData = function (ctx) {
  const mp = ctx.mParams
  let fldValue = ''
  let res = ''

  const iDoc = UB.Repository('tst_ftsentity').attrs(_attrForFTS)
    .where('[ID]', '=', mp.ID)
    .select()

  if (!iDoc.eof) {
    for (let i = 0, L = _attrForFTS.length; i < L; i++) {
      fldValue = iDoc.get(i)
      if (fldValue) {
        res += ' z' + _attrForFTS[i] + 'z:' + fldValue
      }
    }
    mp._ftsContent = res
    mp._ftsDescription = iDoc.get('caption')
    mp._ftsDate = iDoc.get('regDate')
  }

  return true
}
