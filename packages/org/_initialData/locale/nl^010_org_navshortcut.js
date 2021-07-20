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
      { keyValue: 'org_desktop',
        execParams: {
          caption: 'Structuur van de organisatie',
          description: 'Afdelingen, functies, medewerkers, toewijzingen,...'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'org_folder_internal', execParams: { caption: 'Structuur van de organisatie' } },
      { keyValue: 'org_department', execParams: { caption: 'Interne verdeeldheid' } },
      { keyValue: 'org_organization', execParams: { caption: 'Interne organisaties' } },
      { keyValue: 'org_employeeonstaff', execParams: { caption: 'Interne toewijzingen' } },
      { keyValue: 'org_employeeonstaff_all', execParams: { caption: 'Interne toewijzingen (alle)' } },
      { keyValue: 'org_staffunit', execParams: { caption: 'Stafeenheden' } },
      { keyValue: 'org_execgroup', execParams: { caption: 'Groepen van uitvoerders' } },
      { keyValue: 'org_unit', execParams: { caption: 'Interne organisatie-eenheden' } },
      { keyValue: 'org_employee', execParams: { caption: 'Intern personeel' } },
      { keyValue: 'org_folder_dict', execParams: { caption: 'Extra' } },
      { keyValue: 'org_profession', execParams: { caption: 'Beroepen' } },
      { keyValue: 'org_diagram', execParams: { caption: 'Organogrammen' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
