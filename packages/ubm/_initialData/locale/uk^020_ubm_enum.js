const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to Ukrainian for UBM model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'code',
    localization: [
      // UBA_RULETYPE
      { keyValue: 'A', execParams: { name: 'Allow' } },
      { keyValue: 'C', execParams: { name: 'Complements' } },
      { keyValue: 'D', execParams: { name: 'Deny' } },
      // FORM_TYPE
      { keyValue: 'auto', execParams: { name: 'UB form' } },
      { keyValue: 'custom', execParams: { name: 'Pure ExtJS form' } },
      { keyValue: 'vue', execParams: { name: 'VueJS form' } },
      { keyValue: 'module', execParams: { name: 'Any module that exports mount()' } },
      // CMD_TYPE
      { keyValue: 'showList', execParams: { name: 'Show list' } },
      { keyValue: 'showForm', execParams: { name: 'Show form' } },
      { keyValue: 'runCode', execParams: { name: 'Code execution' } },
      // UBA_USER_GENDER
      { keyValue: 'male', execParams: { name: 'Чоловік' } },
      { keyValue: 'female', execParams: { name: 'Жінка' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
