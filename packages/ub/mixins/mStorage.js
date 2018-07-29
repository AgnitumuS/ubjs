const App = require('../modules/App')
/**
 * PureJS mStorage.addnew method implementation
 * @param {ubMethodParams} ctxt
 * @return {boolean}
 */
module.exports.addNew = function (ctxt) {
  let params = ctxt.mParams
  let requestedFieldList = params.fieldList
  let entityName = params.entity
  console.debug('run ' + entityName + 'addnew JS mixim method')
  let entity = App.domainInfo.get(entityName)
  // fill array by default values from metadata
  let defValues = requestedFieldList.map((attrName) => {
    let attr = entity.attr(attrName, true)
    return attr && attr.defaultValue
      ? attr.defaultValue
      : null
  })
  // and initialize store by default values as expected by `addnew` method
  ctxt.dataStore.initialize([defValues], requestedFieldList)
  return true
}
