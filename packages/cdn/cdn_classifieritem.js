/* global cdn_classifier */
// eslint-disable-next-line camelcase
const me = cdn_classifieritem
const UB = require('@unitybase/ub')

me.on('insert:before', setLevelAttribute)
me.on('update:before', setLevelAttribute)

/**
 * @private
 * @param {ubMethodParams} ctx
 */
function setLevelAttribute(ctx) {
  function calcLevelFromParent(parentID) {
    console.debug(`parentID=${parentID}`)
    let { hierarchyLevel } = UB.Repository('cdn_classifieritem').attrs('hierarchyLevel').selectById(parentID)
    return hierarchyLevel + 1
  }

  const execParams = ctx.mParams.execParams
  const dataStore = ctx.dataStore
  const parentID = execParams.parentID
  console.debug(`execParams=${JSON.stringify(execParams)}`)
  // order of processing below is important!
  if (Number.isSafeInteger(parentID)) {
    execParams.hierarchyLevel = calcLevelFromParent(parentID)
  } else if (parentID === null) { // explicitly defined top level node
    execParams.hierarchyLevel = 1
  } else if (dataStore.eof) { // new record with not defined parentID has level 1
    execParams.hierarchyLevel = 1
  } else if (execParams.mi_treePath === '') { // marker of call from "tree" mixin
    execParams.hierarchyLevel = calcLevelFromParent(dataStore.get('parentID')) // parentID here must be defined
  }
}
