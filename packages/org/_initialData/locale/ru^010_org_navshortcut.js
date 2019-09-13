const loader = require('@unitybase/base').dataLoader

/**
 * @author pavel.mash
 * Navigation shortcuts localization to Russian for ORG model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      {keyValue: 'org_desktop', execParams: {caption: 'Орг. структура'}}
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      {keyValue: 'org_folder_internal', execParams: {caption: 'Орг. структура'}},
      {keyValue: 'org_department', execParams: {caption: 'Внутренние подразделения'}},
      {keyValue: 'org_organization', execParams: {caption: 'Внутренние организации'}},
      {keyValue: 'org_employeeonstaff', execParams: {caption: 'Внутренние назначения'}},
      {keyValue: 'org_employeeonstaff_all', execParams: {caption: 'Внутренние назначения (все)'}},
      {keyValue: 'org_staffunit', execParams: {caption: 'Штатные единицы'}},
      {keyValue: 'org_unit', execParams: {caption: 'Внутренние орг.единицы'}},
      {keyValue: 'org_employee', execParams: {caption: 'Внутренние сотрудники'}},
      {keyValue: 'org_execgroup', execParams: {caption: 'Группы исполнителей'}},
      {keyValue: 'org_folder_dict', execParams: {caption: 'Дополнительно'}},
      {keyValue: 'org_profession', execParams: {caption: 'Профессии'}},
      {keyValue: 'org_diagram', execParams: {caption: 'Органограммы'}}
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
