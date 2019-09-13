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
      { keyValue: 'cdn_desktop', execParams: { caption: 'Общие справочники' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_folder_territorial', execParams: { caption: 'Territorial' } },
      { keyValue: 'cdn_region', execParams: { caption: 'Regions' } },
      { keyValue: 'cdn_city', execParams: { caption: 'Cities' } },
      { keyValue: 'cdn_country', execParams: { caption: 'Countries' } },
      { keyValue: 'cdn_adminunit', execParams: { caption: 'Admin units' } },
      { keyValue: 'cdn_regiontype', execParams: { caption: 'Region types' } },
      { keyValue: 'cdn_citytype', execParams: { caption: 'City types' } },
      { keyValue: 'cdn_folder_subjects', execParams: { caption: 'Subjects' } },
      { keyValue: 'cdn_organization', execParams: { caption: 'Organizations' } },
      { keyValue: 'cdn_employee', execParams: { caption: 'Employee' } },
      { keyValue: 'cdn_department', execParams: { caption: 'Departments' } },
      { keyValue: 'cdn_person', execParams: { caption: 'Persons' } },
      { keyValue: 'cdn_folder_misc', execParams: { caption: 'Miscellaneous' } },
      { keyValue: 'cdn_currency', execParams: { caption: 'Currency' } },
      { keyValue: 'cdn_language', execParams: { caption: 'Language list' } },
      { keyValue: 'cdn_classifier', execParams: { caption: 'Classifier list' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
