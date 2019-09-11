﻿const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Tajik for ORG model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'PERMANENT', execParams: { name: 'Постоянный' } },
      { keyValue: 'TEMPORARY', execParams: { name: 'вр.и.о.' } },
      { keyValue: 'ASSISTANT', execParams: { name: 'Ассистент' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
