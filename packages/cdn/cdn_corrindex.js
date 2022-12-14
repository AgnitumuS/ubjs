const UB = require('@unitybase/ub')
const App = UB.App
/* global cdn_corrindex */
// eslint-disable-next-line camelcase
const me = cdn_corrindex
me.on('update:after', updateOrganizationCaptions)

const ORG_ENTITY_CODE = 'cdn_organization'
/**
 * @private
 * @param {ubMethodParams} ctxt
 * @return {Boolean}
 */
function updateOrganizationCaptions (ctxt) {
  const params = ctxt.mParams
  if (params.caller !== ORG_ENTITY_CODE) {
    const execParams = params.execParams
    const organisations = UB.Repository(ORG_ENTITY_CODE).attrs(['ID'])
      .where('[corrIndexID]', '=', execParams.ID)
      .selectAsObject()
    if (organisations.length) {
      const inst = UB.DataStore(ORG_ENTITY_CODE)
      const updParams = {
        ['caption_' + App.defaultLang + '^']: '',
        ID: 0
      }
      organisations.forEach((org) => {
        updParams.ID = org.ID
        inst.run('update', {
          caller: me.entity.name,
          execParams: updParams,
          __skipOptimisticLock: true
        })
      })
    }
  }
  return true
}
