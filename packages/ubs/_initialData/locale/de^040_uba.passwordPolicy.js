const loader = require('@unitybase/base').dataLoader
/**
 * @author
 * Password policy localization to German for UBA model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubs_settings',
    keyAttribute: 'settingKey',
    localization: [
      // UBS_MESSAGE_TYPE
      { keyValue: 'UBA.passwordPolicy.maxDurationDays', execParams: { name: 'Gültigkeitsdauer des Kennworts', description: 'Zeitraum (Anzahl der Tage), nach dessen Ablauf das System die Änderung des Kennworts verlangt. 0 für unbegrenzt' } },
      { keyValue: 'UBA.passwordPolicy.checkPrevPwdNum', execParams: { name: '... vorherige Kennwörter nicht erneut als Kennwort verwenden', description: 'Anzahl der vorherigen Kennwörter, die nicht als neues Kennwort verwendet werden dürfen' } },
      { keyValue: 'UBA.passwordPolicy.minLength', execParams: { name: 'Mindestlänge des Kennworts', description: 'Mindestzeichenzahl des Kennworts' } },
      { keyValue: 'UBA.passwordPolicy.checkCmplexity', execParams: { name: 'Komplexes Kennwort', description: 'Kennwort muss Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten' } },
      { keyValue: 'UBA.passwordPolicy.checkDictionary', execParams: { name: 'Keine Kennwörter aus Wörterbuch erlauben', description: 'Lange Kennwörter aus Wörterbuch ablehnen' } },
      { keyValue: 'UBA.passwordPolicy.allowMatchWithLogin', execParams: { name: 'Übereinstimmung mit Benutzernamen zulassen', description: 'Festlegen eines Kennworts erlauben, das mit dem Benutzernamen übereinstimmt' } },
      { keyValue: 'UBA.passwordPolicy.maxInvalidAttempts', execParams: { name: 'Anzahl der versuchten Kennworteingaben', description: 'Maximale Anzahl von Versuchen, bevor der Benutzer gesperrt wird' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
