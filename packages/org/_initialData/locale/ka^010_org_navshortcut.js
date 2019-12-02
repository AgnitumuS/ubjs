const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'org_desktop', execParams: { caption: 'ორგანიზაციული სტრუქტურა' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'org_folder_internal', execParams: { caption: 'შიდა ორგანიზება' } },
      { keyValue: 'org_department', execParams: { caption: 'დეპარტამენტები' } },
      { keyValue: 'org_organization', execParams: { caption: 'ორგანიზაციები' } },
      { keyValue: 'org_employeeonstaff', execParams: { caption: 'თანამშრომელი პერსონალზე' } },
      { keyValue: 'org_employeeonstaff_all', execParams: { caption: 'თანამშრომელი პერსონალზე (სულ)' } },
      { keyValue: 'org_staffunit', execParams: { caption: 'პერსონალის ერთეული' } },
      { keyValue: 'org_execgroup', execParams: {caption: 'მხატვრული ჯგუფები'} },
      { keyValue: 'org_unit', execParams: { caption: 'ორგანიზების ერთეული' } },
      { keyValue: 'org_employee', execParams: { caption: 'თანამშრომლები' } },
      { keyValue: 'org_folder_dict', execParams: { caption: 'დამატებითი' } },
      { keyValue: 'org_profession', execParams: { caption: 'პროფესიები' } },
      { keyValue: 'org_diagram', execParams: { caption: 'ორგანიზაციული ჩარტი' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
