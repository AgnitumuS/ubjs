/* global ubm_desktop */
const me = ubm_desktop
const fs = require('fs')
const path = require('path')
const UB = require('@unitybase/ub')
const App = UB.App

me.entity.addMethod('changeUISettings')
me.entity.addMethod('getUIThemes')

/**
 * svg/gif/png extraction from dataUri
 *
 * @private
 * @param {string} dataUri
 * @returns {null|{content: Buffer, extension: string}}
 */
function dataURI2Blob (dataUri) {
  const possibleTypes = [
    { sw: 'data:image/svg+xml;base64,', extension: '.svg' },
    { sw: 'data:image/gif;base64,', extension: '.gif' },
    { sw: 'data:image/png;base64,', extension: '.png' }
  ]
  if (typeof dataUri !== 'string') return null
  for (const t of possibleTypes) {
    if (dataUri.startsWith(t.sw)) {
      const b = Buffer.from(dataUri.slice(t.sw.length), 'base64')
      return { content: b, extension: t.extension }
    }
  }
  return null
}
/**
 * Change (or set) user password for any user.
 * Call of this method should be restricted to a small number of roles/groups. By default can be called by supervisor role
 *
 * @param {ubMethodParams} ctx
 * @param {string} ctx.mParams.uiSettings Stringified `uiSetting.adminUI` block of settings
 * @memberOf ubm_desktop_ns.prototype
 * @memberOfModule @unitybase/ubm
 * @published
 */
me.changeUISettings = function changeUISettings (ctx) {
  const settingsModel = App.domainInfo.models.cust
  if (!settingsModel) {
    throw new UB.UBAbort('There is no place to store user settings: \'cust\' model not registered in domain (added automatically if folder \'cmodel/cust\' exists')
  }
  const partialPath = path.join(settingsModel.realPath, 'ubConfig-partial.json')
  const partial = fs.existsSync(partialPath)
    ? JSON.parse(fs.readFileSync(partialPath, 'utf8'))
    : {}
  if (!partial.uiSettings) partial.uiSettings = {}
  if (!partial.uiSettings.adminUI) partial.uiSettings.adminUI = {}

  if (ctx.mParams.reset) {
    ['loginWindowTopLogoURL', 'sidebarLogoURL', 'sidebarLogoBigURL',
      'applicationTitle', 'applicationName', 'supportMailTo', 'customTheme'
    ].forEach(pn => {
      delete partial.uiSettings.adminUI[pn]
    })
    console.log('\'cust\' model partial config is reset to default values')
  } else {
    const newS = JSON.parse(ctx.mParams.uiSettings)
    function dataURLSave (prmName) {
      const inPrmName = `${prmName}DataURL`
      if (!newS[inPrmName]) return
      const cnt = dataURI2Blob(newS[inPrmName])
      if (!cnt) throw new UB.UBAbort(`Wrong data for parameter ${prmName}`)
      const fn = `${prmName}${cnt.extension}`
      fs.writeFileSync(
        path.join(settingsModel.realPublicPath, fn),
        cnt.content
      )
      partial.uiSettings.adminUI[`${prmName}URL`] = `/models/cust/${fn}`
    }

    function strSave (inPrmName) {
      // eslint-disable-next-line no-prototype-builtins
      if (!newS.hasOwnProperty(inPrmName)) return
      partial.uiSettings.adminUI[inPrmName] = newS[inPrmName]
    }

    ;['loginWindowTopLogo', 'sidebarLogo', 'sidebarLogoBig'].forEach(dataURLSave)
    ;['applicationTitle', 'supportMailTo', 'customTheme'].forEach(strSave)
    if (newS.applicationName && newS.applicationName.startsWith('{')) {
      partial.uiSettings.adminUI.applicationName = JSON.parse(newS.applicationName)
    } else {
      strSave('applicationName')
    }
  }
  fs.writeFileSync(partialPath, JSON.stringify(partial, null, '  '))
  App.reloadConfig()
}

let loadedThemes
/**
 * Return available UI themes - a content of `ui-themes.json` files in models root.
 * If `uiSettings.adminUI.customTheme` is defined in ubConfig - theme will be injected in the end of index page
 *
 * @param {ubMethodParams} ctx
 * @memberOf ubm_desktop_ns.prototype
 * @memberOfModule @unitybase/ubm
 * @published
 */
me.getUIThemes = function getUIThemes (ctx) {
  if (!loadedThemes) {
    loadedThemes = []
    App.domainInfo.orderedModels.forEach(model => {
      const modelThemesFN = path.join(model.realPath || model.realPublicPath, 'ui-themes.json')
      if (!fs.existsSync(modelThemesFN)) return
      const t = require(modelThemesFN)
      loadedThemes = loadedThemes.concat(t)
    })
  }
  if (ctx) { // called as API
    ctx.mParams.themes = JSON.stringify(loadedThemes)
  } else {
    return loadedThemes
  }
}
