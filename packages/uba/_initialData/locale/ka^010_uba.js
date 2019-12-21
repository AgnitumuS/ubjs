const loader = require('@unitybase/base').dataLoader

/**
 * @author pavel.mash
 * Navigation shortcuts localization to Ukrainian for UBA model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  function localize (localizationConfig) {
    loader.localizeEntity(session, localizationConfig, __filename)
  }

  localize({
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [{
      keyValue: 'adm_desktop',
      execParams: {
        caption: 'ადმინისტრატორი',
        description: 'მომხმარებლის მენეჯმენტი, ინტერფეისის პარამეტრები, ჟურნალი (აუდიტის ბილიკი, დაცვა, რიგები)'
      }
    }]
  })

  localize({
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'uba_auditTrail', execParams: { caption: 'აუდიტის ბილიკი' } },
      { keyValue: 'adm_folder_users', execParams: { caption: 'ჯგუფები და მომხმარებლები' } },
      { keyValue: 'uba_user', execParams: { caption: 'მომხმარებლების სია' } },
      { keyValue: 'uba_userrole', execParams: { caption: 'მომხმარებლის როლი' } },
      { keyValue: 'uba_advSecurity', execParams: { caption: 'უსაფრთხოება' } },
      { keyValue: 'uba_group', execParams: { caption: 'ჯგუფის სია' } },
      { keyValue: 'uba_usergroup', execParams: { caption: 'მომხმარებელთა ჯგუფი' } },
      { keyValue: 'uba_usercertificate', execParams: { caption: 'სერთიფიკატები' } },
      { keyValue: 'adm_folder_security', execParams: { caption: 'უსაფრთხოება' } },
      { keyValue: 'uba_role', execParams: { caption: 'სისტემის როლი' } },
      { keyValue: 'uba_els', execParams: { caption: 'ერთეულის დონის უსაფრთხოება' } },
      { keyValue: 'uba_audit', execParams: { caption: 'უსაფრთხოების აუდიტი' } },
      { keyValue: 'uba_audit-securityDashboard', execParams: { caption: 'უსაფრთხოების დაფა' } },
      { keyValue: 'uba_als', execParams: { caption: 'ატრიბუტების დონის უსაფრთხოება' } },
      { keyValue: 'uba_otp', execParams: { caption: 'ერთჯერადი პაროლი' } }
    ]
  })

  localize({
    entity: 'uba_role',
    keyAttribute: 'name',
    localization: [
      { keyValue: 'Everyone', execParams: { description: 'ნებისმიერ მსურველს (ჩაშენებული როლი)' } },
      { keyValue: 'Admin', execParams: { description: 'ადმინისტრატორი (ჩაშენებული როლი)' } },
      { keyValue: 'Anonymous', execParams: { description: 'უნებართვო მომხმარებელი (ჩაშენებული როლი)' } },
      { keyValue: 'User', execParams: { description: 'ავტორიზებული მომხმარებელი (ჩაშენებული როლი)' } },
      { keyValue: 'Supervisor', execParams: { description: 'უსაფრთხოების ადმინისტრატორი (ჩაშენებული როლი)' } },
      { keyValue: 'Developer', execParams: { description: 'დეველოპერი (ჩაშენებული როლი)' } },
      { keyValue: 'Monitor', execParams: { description: 'მონიტორინგი (ჩაშენებული როლი)' } }
    ]
  })
}
