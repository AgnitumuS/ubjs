/* global removeCommentsFromJSON */
const fs = require('fs')
const _ = require('lodash')

const INVALID_ATTRS = 'Entity merging require attributes in meta file to be an array. In: '
const INVALID_MAPPING = 'Entity merging require all mappings in meta file to be an array. In: '
const META_TR = ' "ubcli meta-tr" command can be used for transformation from old format'

module.exports = mergeMeta

function checkMetadataFormat (e, ePath) {
  if (e.attributes && !Array.isArray(e.attributes)) {
    throw new Error(INVALID_ATTRS + ePath)
  }
  if (e.mapping && !Array.isArray(e.mapping)) {
    throw new Error(INVALID_MAPPING + ePath + META_TR)
  }
  if (e.attributes) {
    e.attributes.forEach(attr => {
      if (attr.mapping && !Array.isArray(attr.mapping)) {
        throw new Error(INVALID_MAPPING + ePath)
      }
    })
  }
}

/**
 * Recursively merge two named collection
 * This method **mutate** `orig` or return `desc` if `orig` is empty collection
 *
 * @private
 * @param {*} orig
 * @param {*} desc
 */
function mergeNamedCollections (orig, desc) {
  if (Array.isArray(orig) && Array.isArray(desc) &&
    ((orig.length && orig[0].name) || (desc.length && desc[0].name))
  ) {
    if (!orig.length) return desc
    desc.forEach(dItem => {
      let oItem = orig.find(oItem => oItem.name === dItem.name)
      if (oItem) {
        _.mergeWith(oItem, dItem, mergeNamedCollections)
      } else {
        orig.push(dItem)
      }
    })
    return orig
  } else {
    return undefined // let's lodash do a merge
  }
}
/**
 * Merge two meta file definitions.
 * Named collections (attributes , mapping) in both files should be in array-of-object format
 *
 * @param originalEntityPath
 * @param descendantEntityPath
 * @return {string}
 */
function mergeMeta (originalEntityPath, descendantEntityPath) {
  let txt = fs.readFileSync(originalEntityPath, 'utf-8')
  let e1 = JSON.parse(removeCommentsFromJSON(txt))
  checkMetadataFormat(e1, originalEntityPath)
  txt = fs.readFileSync(descendantEntityPath, 'utf-8')
  let e2 = JSON.parse(removeCommentsFromJSON(txt))
  checkMetadataFormat(e2, descendantEntityPath)
  _.mergeWith(e1, e2, mergeNamedCollections)
  return JSON.stringify(e1, null, ' ')
}
