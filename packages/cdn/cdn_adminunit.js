/*
 * Created by igor.borisov on 25.10.13.
 * Changed by xmax 22.09.2017
 */
const UB = require('@unitybase/ub')
/* global cdn_adminunit */
// eslint-disable-next-line camelcase
const me = cdn_adminunit
me.on('insert:before', beforeInsert)
me.on('update:before', beforeUpdate)
me.on('update:after', afterUpdate)

function beforeInsert (ctxt) {
  updateCaption(ctxt, 'INS')
}

function beforeUpdate (ctxt) {
  updateCaption(ctxt, 'UPD')
}

function afterUpdate (ctxt) {
  const execParams = ctxt.mParams.execParams
  if (!ctxt.externalCall && ctxt.mParams.cascadeUpdate) {
    return true
  }

  const name = execParams.name
  const parentAdminUnitID = execParams.parentAdminUnitID
  console.debug('name:', name)
  console.debug('parentAdminUnitID:', parentAdminUnitID)

  if (name || parentAdminUnitID) {
    updateChildCascade(execParams.ID, execParams.caption)
  }
}

function updateChildCascade (id, caption) {
  const children = UB.Repository('cdn_adminunit')
    .attrs(['ID', 'name', 'parentAdminUnitID'])
    .where('[parentAdminUnitID]', '=', id)
    .selectAsObject()
  const adminUnitStore = UB.DataStore('cdn_adminunit')
  children.forEach(function (child) {
    const newCaption = makeCaption(child.name, caption)
    adminUnitStore.run('update', {
      execParams: {
        ID: child.ID,
        caption: newCaption
      },
      cascadeUpdate: true,
      __skipOptimisticLock: true
    })
    updateChildCascade(child.ID, newCaption)
  })
}

function updateCaption (ctxt, mode) {
  const execParams = ctxt.mParams.execParams
  if (!ctxt.externalCall && ctxt.mParams.cascadeUpdate) {
    return true
  }
  const dataStore = ctxt.dataStore
  let name = execParams.name
  let parentAdminUnitID = execParams.parentAdminUnitID

  if (name || parentAdminUnitID) {
    if (mode !== 'INS') {
      if (!name) {
        name = dataStore.get('name')
      }
      if (!parentAdminUnitID) {
        parentAdminUnitID = dataStore.get('parentAdminUnitID')
      }
    }

    if (parentAdminUnitID) {
      const info = UB.Repository('cdn_adminunit').attrs(['ID', 'name', 'caption']).selectById(parentAdminUnitID)
      execParams.caption = makeCaption(name, info ? info.caption || info.name : null)
    } else {
      execParams.caption = name
    }
  }
}

function makeCaption (name, parentCaption) {
  const caption = name + ', ' + (parentCaption || '?')
  return (caption.length >= 1024)
    ? caption.substr(0, 1023)
    : caption
}
