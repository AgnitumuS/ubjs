UB.i18nExtend({
  "NMInstallExtensionFirefox": "<p>Um diese Anwendung zu nutzen muss die Firefox-Erweiterung <b>\"UBExtension\"</b> installiert sein.</p> " +
    "<p>Über <a href=\"https://addons.mozilla.org/addon/ub-extension/\" target=\"_blank\">ERWEITERUNG HINZUFÜGEN</a> " +
    " gelangen Sie zu den Firefox Add-ons</p>" +
    "<p> Klicken Sie im Add-on-Fenster auf die Schaltfläche <b>+Add to Firefox</b></p>" +
    "<p>Bestätigen Sie das Hinzufügen der neuen Erweiterung.</p>" +
    "<p>Starten Sie Ihren Browser neu <b>nachdem Sie die Erweiterung installiert haben!</b></p>",
  "NMInstallExtensionChrome": "<p>Die Chrome-Erweiterung <b>\"UBExtension\"</b> muss installiert sein.</p> " +
    "<p>Folgen Sie <a href=\"https://unitybase-info.translate.goog/news/setup-ubextension-without-using-the-google-store.html?_x_tr_sl=uk&_x_tr_tl=en&_x_tr_hl=uk&_x_tr_pto=nui\" target=\"_blank\">zur Setup-Anleitung</a>.</p>" +
    "<p><b>Starten Sie den Browser nach der Installation neu!</b></p>",
  "NMInstallExtensionOpera": "<p>Um diese Anwendung zu nutzen, muss die Opera-Erweiterung <b>\"UBExtension\"</b> installiert sein.</p> " +
    "<p>Folgen Sie dem Link <a href=\"models/adminui-pub/ub-extension/UBExtension.crx\" target=\"_blank\">ERWEITERUNG HERUNTERLADEN</a>.</p>" +
    "<p>Nach dem Download der Erweiterung wird im oberen Teil Ihres Opera Browsers die Warnung \"Unbekannte Quelle\" angezeigt. " +
    "Drücken Sie die Schaltfläche \"Go\" in der Nachrichtenleiste – Opera öffnet die Erweiterungsseite. Gehen Sie auf dieser Seite zu \"UBExtension\" und betätigen Sie die Schaltfläche \"Installieren\" doppelt</p> " +
    "<p>Danach ist die Installation abgeschlossen und ein Neustart des Browsers zu empfehlen.</p>",
  "NMUpdateExtensionChrome": "<p>Um fortzufahren, müssen Sie Ihren Browser<b>{0}</b> auf Version <i>{2}</i> updaten.</p> " +
    "<p>Google Chrome aktualisiert Erweiterungen standardmäßig automatisch. Versuchen Sie, den Browser zu schließen/zu öffnen. " +
    " Gehen Sie für eine manuelle Aktualisierung zum Google Store<a href=\"https://chrome.google.com/webstore/detail/ubextension/{3}\" target=\"_blank\">und folgen Sie diesem Link</a> </p>",
  "NMUpdateExtensionOpera": "<p>Die neue Version <i>{2}</i> von <b>{0}</b> ist verfügbar und sollte installiert werden.</p> " +
    "Lesen Sie <a href=\"models/adminui-pub/ub-extension/extensionUpdateInstructionOpera.html\" target=\"_blank\"> die Update-Anleitung</a> " +
    "und folgen Sie <a href=\"https://chrome.google.com/webstore/detail/ubextension/{3}\" target=\"_blank\">UPDATE</a>. <p>Starten Sie Ihren Browser nach Abschluss der Aktualisierung neu.</p>",
  "NMInstallFeature": "<p>Um diese Funktion nutzen zu können, muss <b>{0}</b> installiert sein.</p> " +
    "<p>Folgen Sie <a href=\"{3}\" target=\"_blank\">SETUP HERUNTERLADEN</a>. Nachdem der Download abgeschlossen ist, führen Sie die Installation aus und folgen Sie den Anweisungen.</p>" +
    "<p>Nach Abschluss der Installation starten Sie Ihren Browser neu.</p>",
  "NMUpdateFeature": "<p>Die neue Version <i>{1}</i> der Anwendung <b>{0}</b> ist verfügbar und sollte installiert werden.</p> " +
    "<p>Folgen Sie <a href=\"{3}\" target=\"_blank\">UPDATE SETUP HERUNTERLADEN</a>. Nachdem der Download abgeschlossen ist, führen Sie die Installation aus und folgen Sie den Anweisungen.</p>" +
    "<p>Nachdem das Update abgeschlossen ist, starten Sie Ihren Browser neu.</p>"
})
if (typeof Ext !== 'undefined') {
  Ext.onReady(function () {
    if (Ext.Updater) {
      Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Wird geladen...</div>'
    }
    if (Ext.view.View) {
      Ext.view.View.prototype.emptyText = '&lt Keine Daten &gt'
    }

    if (Ext.grid.Panel) {
      Ext.grid.Panel.prototype.ddText = '{0} ausgewählte Zeilen'
    }

    if (Ext.TabPanelItem) {
      Ext.TabPanelItem.prototype.closeText = 'Diese Registerkarte schließen'
    }

    if (Ext.form.field.Base) {
      Ext.form.field.Base.prototype.invalidText = 'Der Wert in diesem Feld ist ungültig'
    }

    if (Ext.LoadMask) {
      Ext.LoadMask.prototype.msg = 'Wird geladen...'
      Ext.LoadMask.msg = 'Wird geladen...'
    }

    if (Ext.Date) {
      Ext.Date.monthNames = [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember'
      ]

      Ext.Date.shortMonthNames = [
        'Jan',
        'Feb',
        'Mär',
        'Apr',
        'Mai',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Okt',
        'Nov',
        'Dez'
      ]

      Ext.Date.getShortMonthName = function (month) {
        return Ext.Date.shortMonthNames[month]
      }

      Ext.Date.monthNumbers = {
        'Jan': 0,
        'Feb': 1,
        'Mär': 2,
        'Apr': 3,
        'Mai': 4,
        'Jun': 5,
        'Jul': 6,
        'Aug': 7,
        'Sep': 8,
        'Okt': 9,
        'Nov': 10,
        'Dez': 11
      }

      Ext.Date.getMonthNumber = function (name) {
        return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()]
      }

      Ext.Date.dayNames = [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag'
      ]

      Ext.Date.getShortDayName = function (day) {
        return Ext.Date.dayNames[day].substring(0, 3)
      }
    }

    if (Ext.MessageBox) {
      Ext.MessageBox.buttonText = {
        ok: 'OK',
        yes: 'Ja',
        no: 'Nein',
        cancel: 'Abbrechen'
      }
      Ext.MessageBox.titleText = {
        confirm: 'Bestätigung',
        prompt: 'Information',
        wait: 'Wird geladen...',
        alert: 'Achtung'
      }
    }

    if (Ext.view.AbstractView) {
      Ext.view.AbstractView.prototype.loadingText = 'Wird geladen...'
    }

    if (Ext.util.Format) {
      Ext.apply(Ext.util.Format, {
        dateFormat: 'm/d/Y',
        timeFormat: 'H:i:s',
        datetimeFormat: 'm/d/Y H:i',
        thousandSeparator: ' ',
        decimalSeparator: ',',
        currencySign: ''
      })
    }

    Ext.define('Ext.uk.ux.DateTimePicker', {
      override: 'Ext.ux.DateTimePicker',
      todayText: 'Heute',
      timeLabel: 'HH mm'
    })

    if (Ext.picker.Date) {
      Ext.apply(Ext.picker.Date.prototype, {
        todayText: 'Heute',
        minText: 'Dieses Datum liegt vor dem frühesten Datum',
        maxText: 'Dieses Datum liegt nach dem spätesten Datum',
        disabledDaysText: '',
        disabledDatesText: '',
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Nächster Monat (Strg+Rechts)',
        prevText: 'Vorheriger Monat (Strg+Links)',
        monthYearText: 'Monatsauswahl (Strg+Auf/Ab zur Auswahl des Jahres)',
        todayTip: '{0} (Leerzeichen)',
        format: Ext.util.Format ? Ext.util.Format.dateFormat : 'm/d/Y',
        altFormats: 'dmY|dmy|d.m.y|d/m/Y|j/m/y|d/n/y|j/m/Y|d/n/Y|d-m-y|d/m|d-m|dm|dmy|dmY|d',
        startDay: 1
      })
    }

    if (Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
        okText: '&#160;OK&#160;',
        cancelText: 'Abbrechen'
      })
    }

    if (Ext.toolbar.Paging) {
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText: 'Seite',
        afterPageText: 'von {0}',
        firstText: 'Erste Seite',
        prevText: 'Vorherige Seite',
        nextText: 'Nächste Seite',
        lastText: 'Letzte Seite',
        refreshText: 'Aktualisieren',
        displayMsg: 'Es werden die Einträge {0} bis {1} angezeigt, insgesamt {2}',
        emptyMsg: 'Keine Daten anzuzeigen'
      })
    }

    if (Ext.form.field.Text) {
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText: 'Minimale Feldlänge – {0}',
        maxLengthText: 'Maximale Feldlänge – {0}',
        blankText: 'Dieses Feld ist obligatorisch',
        regexText: '',
        emptyText: null
      })
    }

    if (Ext.form.field.Number) {
      Ext.apply(Ext.form.field.Number.prototype, {
        minText: 'Der Wert dieses Feldes darf nicht kleiner als {0} sein',
        maxText: 'Der Wert dieses Feldes darf nicht größer als {0} sein',
        nanText: '{0} ist keine Zahl'
      })
    }

    if (Ext.form.field.Date) {
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText: 'Nicht verfügbar',
        disabledDatesText: 'Nicht verfügbar',
        minText: 'Das Datum in diesem Feld muss nach dem {0} liegen',
        maxText: 'Das Datum in diesem Feld muss vor dem {0} liegen',
        invalidText: '{0} ist kein gültiges Datum – das Datum muss im Format {1} angegeben werden',
        format: Ext.util.Format ? Ext.util.Format.dateFormat : 'm/d/Y',
        startDay: 1,
        altFormats: 'dmY|dmy|d.m.y|d/m/Y|j/m/y|d/n/y|j/m/Y|d/n/Y|d-m-y|d/m|d-m|dm|dmy|dmY|d'
      })
    }

    if (Ext.form.field.ComboBox) {
      Ext.apply(Ext.form.field.ComboBox.prototype, {
        valueNotFoundText: undefined
      })
      Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
        loadingText: 'Wird geladen...'
      })
    }

    if (Ext.form.field.VTypes) {
      Ext.apply(Ext.form.field.VTypes, {
        emailText: 'Dieses Feld muss eine E-Mail Adresse im Format "Benutzer@Beispiel.com" enthalten',
        urlText: 'Dieses Feld muss eine URL im Format "http:/' + '/www.Beispiel.com" enthalten',
        alphaText: 'Dieses Feld darf nur lateinische Buchstaben und Unterstriche "_" enthalten',
        alphanumText: 'Dieses Feld darf nur lateinische Buchstaben, Zahlen und Unterstriche "_" enthalten'
      })
    }

    if (Ext.form.field.HtmlEditor) {
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText: 'Bitte geben Sie eine Adresse ein:',
        buttonTips: {
          bold: {
            title: 'Fett (Strg+B)',
            text: 'Fette Auszeichnung auf markierten Text anwenden.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic: {
            title: 'Kursiv (Strg+I)',
            text: 'Kursive Auszeichnung auf markierten Text anwenden.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline: {
            title: 'Unterstrichen (Strg+U)',
            text: 'Unterstreichung des markierten Texts.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize: {
            title: 'Vergrößern',
            text: 'Schriftgrad vergrößern.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize: {
            title: 'Verkleinern',
            text: 'Schriftgrad verkleinern.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor: {
            title: 'Füllung',
            text: 'Änderung der Hintergrundfarbe des markierten Textes oder Absatzes.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor: {
            title: 'Textfarbe',
            text: 'Änderung der Textfarbe.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft: {
            title: 'Text linksbündig ausrichten',
            text: 'Linksbündige Ausrichtung des Texts.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter: {
            title: 'Zentriert',
            text: 'Text zentrieren.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright: {
            title: 'Text rechtsbündig ausrichten',
            text: 'Rechtsbündige Ausrichtung des Texts.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist: {
            title: 'Aufzählungszeichen',
            text: 'Aufzählung beginnen.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist: {
            title: 'Nummerierung',
            text: 'Nummerierte Liste beginnen.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink: {
            title: 'Hyperlink einfügen',
            text: 'Link aus markiertem Text erstellen.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit: {
            title: 'Quellcode',
            text: 'Zum Quellcode wechseln.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      })
    }

    if (Ext.grid.header.Container) {
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText: 'Aufsteigend sortieren',
        sortDescText: 'Absteigend sortieren',
        lockText: 'Spalte fixieren',
        unlockText: 'Spaltenfixierung aufheben',
        columnsText: 'Spalten'
      })
    }

    if (Ext.grid.feature.Grouping) {
      Ext.apply(Ext.grid.feature.Grouping.prototype, {
        emptyGroupText: '(Leer)',
        groupByText: 'Nach diesem Feld gruppieren',
        showGroupsText: 'Anzeige nach Gruppen'
      })
    }

    if (Ext.grid.PropertyColumnModel) {
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText: 'Name',
        valueText: 'Wert',
        dateFormat: 'd.m.Y'
      })
    }

    if (Ext.SplitLayoutRegion) {
      Ext.apply(Ext.SplitLayoutRegion.prototype, {
        splitTip: 'Zum Ändern der Größe ziehen.',
        collapsibleSplitTip: 'Zum Ändern der Größe ziehen. Doppelklick zum Ausblenden der Leiste.'
      })
    }

    if (Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion) {
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip: 'Zum Ändern der Größe ziehen.',
        collapsibleSplitTip: 'Zum Ändern der Größe ziehen. Doppelklick zum Ausblenden der Leiste.'
      })
    }

    if (Ext.form.CheckboxGroup) {
      Ext.apply(Ext.form.CheckboxGroup.prototype, {
        blankText: 'Mindestens eine Position in der Gruppe muss ausgewählt werden'
      })
    }

    if (Ext.tab.Tab) {
      Ext.apply(Ext.tab.Tab.prototype, {
        closeText: 'Registerkarte schließen'
      })
    }

    if (Ext.form.Basic) {
      Ext.form.Basic.prototype.waitTitle = 'Bitte warten Sie...'
    }
  })
}
