const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Navigation shortcuts localization to O'zbek for CDN model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_desktop',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_desktop',
        execParams: {
          caption: 'Umumiy kataloglar',
          description: 'Mavzular kataloglari, manzillar, boshqa tasniflagichlar'
        }
      }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)

  localizationConfig = {
    entity: 'ubm_navshortcut',
    keyAttribute: 'code',
    localization: [
      { keyValue: 'cdn_folder_territorial', execParams: { caption: 'Admin. bo`linish' } },
      { keyValue: 'cdn_region', execParams: { caption: 'Hududlar' } },
      { keyValue: 'cdn_city', execParams: { caption: 'Hisob -kitoblar' } },
      { keyValue: 'cdn_country', execParams: { caption: 'Mamlakatlar' } },
      { keyValue: 'cdn_adminunit', execParams: { caption: 'Ma`muriy birliklar' } },
      { keyValue: 'cdn_street', execParams: { caption: 'Ko`chalar' } },
      { keyValue: 'cdn_regiontype', execParams: { caption: 'Hudud turlari' } },
      { keyValue: 'cdn_citytype', execParams: { caption: 'Aholi punktlarining turlari' } },
      { keyValue: 'cdn_folder_subjects', execParams: { caption: 'Mavzular' } },
      { keyValue: 'cdn_organization', execParams: { caption: 'Tashkilot' } },
      { keyValue: 'cdn_employee', execParams: { caption: 'Xodimlar' } },
      { keyValue: 'cdn_department', execParams: { caption: 'Bo`limlar' } },
      { keyValue: 'cdn_person', execParams: { caption: 'Shaxslar' } },
      { keyValue: 'cdn_bank', execParams: { caption: 'Banklar' } },
      { keyValue: 'cdn_folder_misc', execParams: { caption: 'Har xil' } },
      { keyValue: 'cdn_currency', execParams: { caption: 'Valyutalar' } },
      { keyValue: 'cdn_language', execParams: { caption: 'Tillar' } },
      { keyValue: 'cdn_classifier', execParams: { caption: 'Tasniflagichlar' } }
    ]
  }

  loader.localizeEntity(session, localizationConfig, __filename)
}
