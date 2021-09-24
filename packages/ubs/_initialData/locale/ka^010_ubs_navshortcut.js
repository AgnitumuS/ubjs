﻿const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Georgian for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_misc', execParams: { caption: 'სხვადასხვა' } },
      { keyValue: 'ubs_settings', execParams: { caption: 'პარამეტრები' } },
      { keyValue: 'ubs_filter', execParams: { caption: 'შენახული ფილტრები' } },
      { keyValue: 'ubs_numcounter', execParams: { caption: 'ნუმერატორები' } },
      { keyValue: 'ubs_numcounterreserv', execParams: { caption: 'ნუმერატორები (რეზერვი)' } },
      { keyValue: 'ubs_softLock', execParams: { caption: 'დაბლოკვა (რბილი)' } },
      { keyValue: 'ubs_report', execParams: { caption: 'ანგარიშები' } },
      { keyValue: 'ubs_globalCache', execParams: { caption: 'სერვერის ქეში' } },
      { keyValue: 'ubs_message', execParams: { caption: 'შეტყობინებები' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}