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
      Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Loading...</div>'
    }
    if (Ext.view.View) {
      Ext.view.View.prototype.emptyText = '&lt List is empty&gt'
    }

    if (Ext.grid.Panel) {
      Ext.grid.Panel.prototype.ddText = '{0} row(s) selected'
    }

    if (Ext.TabPanelItem) {
      Ext.TabPanelItem.prototype.closeText = 'Close this tab'
    }

    if (Ext.form.field.Base) {
      Ext.form.field.Base.prototype.invalidText = 'This field contains a wrong value'
    }

    if (Ext.LoadMask) {
      Ext.LoadMask.prototype.msg = 'Loading...'
      Ext.LoadMask.msg = 'Loading...'
    }

    if (Ext.Date) {
      Ext.Date.monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]

      Ext.Date.shortMonthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ]

      Ext.Date.getShortMonthName = function (month) {
        return Ext.Date.shortMonthNames[month]
      }

      Ext.Date.monthNumbers = {
        'Jan': 0,
        'Feb': 1,
        'Mar': 2,
        'Apr': 3,
        'May': 4,
        'Jun': 5,
        'Jul': 6,
        'Aug': 7,
        'Sep': 8,
        'Okt': 9,
        'Nov': 10,
        'Dec': 11
      }

      Ext.Date.getMonthNumber = function (name) {
        return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()]
      }

      Ext.Date.dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ]

      Ext.Date.getShortDayName = function (day) {
        return Ext.Date.dayNames[day].substring(0, 3)
      }
    }

    if (Ext.MessageBox) {
      Ext.MessageBox.buttonText = {
        ok: 'OK',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel'
      }
      Ext.MessageBox.titleText = {
        confirm: 'Confirm',
        prompt: 'Prompt',
        wait: 'Loading...',
        alert: 'Attention'
      }
    }

    if (Ext.view.AbstractView) {
      Ext.view.AbstractView.prototype.loadingText = 'Loading...'
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
      todayText: 'Now',
      timeLabel: 'Time'
    })

    if (Ext.picker.Date) {
      Ext.apply(Ext.picker.Date.prototype, {
        todayText: 'Today',
        minText: 'This date less than minimal date',
        maxText: 'This date greater than maximal date',
        disabledDaysText: '',
        disabledDatesText: '',
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.dayNames,
        nextText: 'Next month (Control+Right)',
        prevText: 'Previous month (Control+Left)',
        monthYearText: 'Choose month (Control+Up/Down for choosing year)',
        todayTip: '{0} (Space)',
        format: Ext.util.Format ? Ext.util.Format.dateFormat : 'm/d/Y',
        altFormats: 'dmY|dmy|d.m.y|d/m/Y|j/m/y|d/n/y|j/m/Y|d/n/Y|d-m-y|d/m|d-m|dm|dmy|dmY|d',
        startDay: 1
      })
    }

    if (Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
        okText: '&#160;OK&#160;',
        cancelText: 'Cancel'
      })
    }

    if (Ext.toolbar.Paging) {
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText: 'Page',
        afterPageText: 'from {0}',
        firstText: 'First page',
        prevText: 'Previous page',
        nextText: 'Next page',
        lastText: 'Last page',
        refreshText: 'Refresh',
        displayMsg: 'Display rows from {0} to {1}, total {2}',
        emptyMsg: 'No data to display'
      })
    }

    if (Ext.form.field.Text) {
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText: 'Minimum length of this field is {0}',
        maxLengthText: 'Maximum length of this field is {0}',
        blankText: 'This is required field',
        regexText: '',
        emptyText: null
      })
    }

    if (Ext.form.field.Number) {
      Ext.apply(Ext.form.field.Number.prototype, {
        minText: 'Field value cannot be less than {0}',
        maxText: 'Field value cannot be greater than {0}',
        nanText: '{0} is not a number'
      })
    }

    if (Ext.form.field.Date) {
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText: 'Not accessible',
        disabledDatesText: 'Not accessible',
        minText: 'Date in this field must be greater then {0}',
        maxText: 'Date in this field must be less then {0}',
        invalidText: '{0} is not a correct. Date must be in format {1}',
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
        loadingText: 'Loading...'
      })
    }

    if (Ext.form.field.VTypes) {
      Ext.apply(Ext.form.field.VTypes, {
        emailText: 'This field must contains email address in format "user@example.com"',
        urlText: 'This field must contains email address URL in format "http:/' + '/www.example.com"',
        alphaText: 'This field must contains only latin letters and underscore character "_"',
        alphanumText: 'This field must contains only latin letters, digits and underscore character "_"'
      })
    }

    if (Ext.form.field.HtmlEditor) {
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText: 'Please, enter address:',
        buttonTips: {
          bold: {
            title: 'Bold (Ctrl+B)',
            text: 'Applying of boldface to selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic: {
            title: 'Italic (Ctrl+I)',
            text: 'Applying of italic style to selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline: {
            title: 'Underline (Ctrl+U)',
            text: 'Underline the selected text',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize: {
            title: 'Increase size',
            text: 'Increase font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize: {
            title: 'Decrease size',
            text: 'Decrease font size.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor: {
            title: 'Backcolor',
            text: 'Change the background color for the selected text or paragraph.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor: {
            title: 'Forecolor',
            text: 'Change the foreground color for the selected text or paragraph.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft: {
            title: 'Justify left',
            text: 'Justify text to the left.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter: {
            title: 'Justify center',
            text: 'Justify text to the center.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright: {
            title: 'Justify right',
            text: 'Justify text to the right.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist: {
            title: 'Bullets',
            text: 'Start bullet list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist: {
            title: 'Numbering',
            text: 'Start numbering list.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink: {
            title: 'Insert hyperlink',
            text: 'Create a hyperlink from selected text.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit: {
            title: 'Source code',
            text: 'Switch to the source code.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      })
    }

    if (Ext.grid.header.Container) {
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText: 'Sort ascending',
        sortDescText: 'Sort descending',
        lockText: 'Freeze column',
        unlockText: 'Remove the frozen column',
        columnsText: 'Columns'
      })
    }

    if (Ext.grid.feature.Grouping) {
      Ext.apply(Ext.grid.feature.Grouping.prototype, {
        emptyGroupText: '(Empty)',
        groupByText: 'Group by this field',
        showGroupsText: 'Show by groups'
      })
    }

    if (Ext.grid.PropertyColumnModel) {
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText: 'Name',
        valueText: 'Value',
        dateFormat: 'd.m.Y'
      })
    }

    if (Ext.SplitLayoutRegion) {
      Ext.apply(Ext.SplitLayoutRegion.prototype, {
        splitTip: 'Drag for changing the size.',
        collapsibleSplitTip: 'Drag for changing the size. Double click will hide the panel.'
      })
    }

    if (Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion) {
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip: 'Drag for changing the size.',
        collapsibleSplitTip: 'Drag for changing the size. Double click will hide the panel.'
      })
    }

    if (Ext.form.CheckboxGroup) {
      Ext.apply(Ext.form.CheckboxGroup.prototype, {
        blankText: 'Please select at least one item in the group'
      })
    }

    if (Ext.tab.Tab) {
      Ext.apply(Ext.tab.Tab.prototype, {
        closeText: 'Close tab'
      })
    }

    if (Ext.form.Basic) {
      Ext.form.Basic.prototype.waitTitle = 'Please wait...'
    }
  })
}
