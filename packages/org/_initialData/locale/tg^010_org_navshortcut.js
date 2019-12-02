const loader = require('@unitybase/base').dataLoader

/**
 * @author pavel.mash
 * Navigation shortcuts localization to Tajik for ORG model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      {keyValue: 'org_desktop', execParams: {caption: 'Сохтори корхона'}}
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      {keyValue: 'org_folder_internal', execParams: {caption: 'Сохтори корхона'}},
      {keyValue: 'org_department', execParams: {caption: 'Шӯъбаҳои дохилӣ'}},
      {keyValue: 'org_organization', execParams: {caption: 'Корхонаҳои дохилӣ'}},
      {keyValue: 'org_employeeonstaff', execParams: {caption: 'Таъинҳои дохилӣ'}},
      {keyValue: 'org_employeeonstaff_all', execParams: {caption: 'Таъинҳои дохилӣ (ҳама)'}},
      {keyValue: 'org_staffunit', execParams: {caption: 'Воҳиди корӣ'}},
      {keyValue: 'org_unit', execParams: {caption: 'Сохтори созмонии дохилӣ'}},
      {keyValue: 'org_employee', execParams: {caption: 'Кормандони дохилӣ'}},
      {keyValue: 'org_folder_dict', execParams: {caption: 'Иловагӣ'}},
      {keyValue: 'org_profession', execParams: {caption: 'Касбҳо'}},
      {keyValue: 'org_diagram', execParams: {caption: 'Органиграмма'}}
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
