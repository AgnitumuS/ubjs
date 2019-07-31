const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for UBQ model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'adm_folder_UBQ', execParams: { caption: 'რიგი' } },
      { keyValue: 'ubq_messages', execParams: { caption: 'რიგირ' } },
      { keyValue: 'ubq_runstat', execParams: { caption: 'სტატისტიკა' } },
      { keyValue: 'ubq_scheduler', execParams: { caption: 'განრიგის შემქმნელი' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
