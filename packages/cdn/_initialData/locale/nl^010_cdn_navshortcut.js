const loader = require('@unitybase/base').dataLoader
/**
 * Navigation shortcuts localization to En for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_desktop', execParams: { caption: 'Common dictionaries' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_folder_territorial', execParams: { caption: 'Territoriaal' } },
      { keyValue: 'cdn_region', execParams: { caption: 'Regio\'s' } },
      { keyValue: 'cdn_city', execParams: { caption: 'Steden' } },
      { keyValue: 'cdn_country', execParams: { caption: 'Landen' } },
      { keyValue: 'cdn_adminunit', execParams: { caption: 'Beheerderseenheden' } },
      { keyValue: 'cdn_street', execParams: { caption: 'Straten' } },
      { keyValue: 'cdn_regiontype', execParams: { caption: 'Regiotypen' } },
      { keyValue: 'cdn_citytype', execParams: { caption: 'Soorten steden' } },
      { keyValue: 'cdn_folder_subjects', execParams: { caption: 'Onderwerpen' } },
      { keyValue: 'cdn_organization', execParams: { caption: 'Organisaties' } },
      { keyValue: 'cdn_employee', execParams: { caption: 'Werknemer' } },
      { keyValue: 'cdn_department', execParams: { caption: 'Afdelingen' } },
      { keyValue: 'cdn_person', execParams: { caption: 'Personen' } },
      { keyValue: 'cdn_bank', execParams: { caption: 'Banken' } },
      { keyValue: 'cdn_folder_misc', execParams: { caption: 'Overige toepassingen' } },
      { keyValue: 'cdn_currency', execParams: { caption: 'Valuta' } },
      { keyValue: 'cdn_language', execParams: { caption: 'Talen' } },
      { keyValue: 'cdn_classifier', execParams: { caption: 'Classificaties' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
