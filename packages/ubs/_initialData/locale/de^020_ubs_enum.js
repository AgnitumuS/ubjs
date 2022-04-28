const loader = require('@unitybase/base').dataLoader
/**
 * @author pavel.mash
 * Enumeration localization to German for UBS model
 * Used by `ubcli initialize` command
 * @param {ServerSession} session
 */
module.exports = function (session) {
  let localizationConfig = {
    entity: 'ubm_enum',
    keyAttribute: 'eGroup;code',
    localization: [
      // AUDIT_ACTION
      { keyValue: 'AUDIT_ACTION;INSERT', execParams: { name: 'Einfügen' } },
      { keyValue: 'AUDIT_ACTION;UPDATE', execParams: { name: 'Aktualisieren' } },
      { keyValue: 'AUDIT_ACTION;DELETE', execParams: { name: 'Löschen' } },
      { keyValue: 'AUDIT_ACTION;LOGIN', execParams: { name: 'Angemeldet' } },
      { keyValue: 'AUDIT_ACTION;LOGIN_FAILED', execParams: { name: 'Anmeldung fehlgeschlagen' } },
      { keyValue: 'AUDIT_ACTION;LOGIN_LOCKED', execParams: { name: 'Anmeldeversuch von gesperrtem Benutzer fehlgeschlagen' } },
      { keyValue: 'AUDIT_ACTION;SECURITY_VIOLATION', execParams: { name: 'Sicherheitverstoß' } },
      { keyValue: 'AUDIT_ACTION;DOWNLOAD', execParams: { name: 'Datei heruntergeladen' } },
      { keyValue: 'AUDIT_ACTION;PRINT', execParams: { name: 'Datei gedruckt' } },
      // SOFTLOCK_TYPE
      { keyValue: 'SOFTLOCK_TYPE;None', execParams: { name: 'Nicht gesperrt' } },
      { keyValue: 'SOFTLOCK_TYPE;Persist', execParams: { name: 'Dauerhaft' } },
      { keyValue: 'SOFTLOCK_TYPE;Temp', execParams: { name: 'Vorübergehend' } },
      // UBS_MESSAGE_TYPE
      { keyValue: 'UBS_MESSAGE_TYPE;user', execParams: { name: 'Nach Benutzern' } },
      { keyValue: 'UBS_MESSAGE_TYPE;system', execParams: { name: 'System' } },
      { keyValue: 'UBS_MESSAGE_TYPE;warning', execParams: { name: 'Warnung' } },
      { keyValue: 'UBS_MESSAGE_TYPE;information', execParams: { name: 'Informationen' } }
    ]
  }
  loader.localizeEntity(session, localizationConfig, __filename)
}
