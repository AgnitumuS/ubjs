UB.i18nExtend({
  "NMInstallExtensionFirefox": "<p>İşi davam etdirmək üçün Firefox brauzeri üçün <b>\"UBExtension\"</b> genişlənməsini quraşdırmaq lazımdır.</p> " +
  "<p> \"Google\" mağazasına keçmək üçün <a href=\"https://addons.mozilla.org/addon/ub-extension/\" target=\"_blank\">GENİŞLƏNMƏNİ QURAŞDIR</a> keçidi üzərində vurun</p>" +
  "<p>Genişlənməni quraşdırdıqdan sonra <b>brauzeri söndürüb yandırın!</b></p>",
  "NMInstallExtensionChrome": "<p>Brauzer üçün <b>\"UBExtension\"</b> genişləmdirməni quraşdırlması tələb olunur.</p> " +
  "<p>Quraşdırma təlimatına<a href=\"https://unitybase-info.translate.goog/news/setup-ubextension-without-using-the-google-store.html?_x_tr_sl=uk&_x_tr_tl=az&_x_tr_hl=uk&_x_tr_pto=nui\" target=\"_blank\">davam edin</a>.</p>" +
  "<p>Quraşdırıldıqdan sonra <b>brauzerinizi yenidən işə salın!</b></p>",
  "NMInstallExtensionOpera": "<p>İşi davam etdirmək üçün \"Opera\" brauzeri üçün <b>\"UBExtension\"</b> genişlənməsini quraşdırmaq lazımdır.</p> " +
  "<p><a href=\"models/adminui-pub/ub-extension/UBExtension.crx\" target=\"_blank\">GENİŞLƏNMƏNİ QURAŞDIR</a> keçidi üzərində vurun.</p>" +
  "<p>Brauzer genişlənməni yükləyəcək və ekranın yuxarı hissəsində ismarış görsənəcək. " +
  "Xəbərdarlığın əks olunduğu paneldə \"Go\"(keçid) düyməsini sıxın, bu zaman \"Opera\" quraşdırılmış genişlənmələrin əks olunduğu səhifəni açacaq. Burada \"UBExtension\" tapıb \"Install\"(Quraşdır) əmri üzərində vurun</p> " +
  "<p>Artıq quraşdırma başa çatmışdır və brauzeri söndürüb yandırmaq olar.</p>",
  "NMUpdateExtensionChrome": "<p>İşi davam etdirmək üçün <b>{0}</b>ni <i>{2}</i> versiyasınadək yeniləmək lazımdır.</p> " +
  "<p>Adətən \"Google Chrome\" brauzeri genişlənmələri avtomatik olaraq yeniləyir. Brauzeri bağlamağa/açmağa cəhd edin. " +
  " Əllə yeniləmək üçün <a href=\"https://chrome.google.com/webstore/detail/ubextension/{3}\" target=\"_blank\"> keçidindən istifadə edərək \"Google\" mağazasına keçin</a> </p>",
  "NMUpdateExtensionOpera": "<p>İşi davam etdirmək üçün <b>{0}</b>ni <i>{2}</i> versiyasınadək yeniləmək lazımdır.</p> " +
  "<p>Adətən \"Opera\" brauzeri genişlənmələri avtomatik olaraq yeniləyir. Brauzeri bağlamağa/açmağa cəhd edin. " +
  " Əllə yeniləmək üçün <a href=\"models/adminui-pub/ub-extension/UBExtension.crx\" target=\"_blank\"> keçidindən istifadə edərək \"Google\" mağazasına keçin</a> </p>",
  "NMInstallFeature": "<p>Bu funksionaldan istifadə etmək üçün <b>{0}</b> quraşdırmaq lazımır.</p> " +
  "<p><a href=\"{3}\" target=\"_blank\">QURAŞDIRMANI YÜKLƏ</a> keçidi üzərində vurun. Yüklənmə başa çatdıqdan sonra quraşdırmanı işə salıb yarımçı məsləhətlərə riayət edin.</p>" +
  "<p>Quraşdırma başa çatdıqdan sonra brauzeri söndürüb yandırmaq lazımdır.</p>",
  "NMUpdateFeature": "<p> <b>{0}</b> tətbiq proqramının yeni <i>{1}</i>  versiyası işlənib hazırlanmışdır.</p> " +
  "<p> <a href=\"{3}\" target=\"_blank\">YENİLƏNMƏNİ YÜKLƏ</a> keçidi üzərində vurun. Yüklənmə başa çatdıqdan sonra yenilənməni işə salıb yarımçı məsləhətlərə riayət edin.</p>" +
  "<p>Quraşdırma başa çatdıqdan sonra brauzeri söndürüb yandırmaq lazımdır.</p>"
})

/* ExtJS Translation into Azerbaijani */
if (typeof Ext !== 'undefined') {
  Ext.onReady(function () {
    if (Ext.Updater) {
      Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Yüklənir ...</div>'
    }

    if (Ext.view.View) {
      Ext.view.View.prototype.emptyText = '&lt Məlumat yoxdur &gt'
    }

    if (Ext.grid.Panel) {
      Ext.grid.Panel.prototype.ddText = 'seçilmiş {0} sətir'
    }

    if (Ext.MessageBox) {
      Ext.MessageBox.buttonText = {
        ok: 'OK',
        cancel: 'Ləğv et',
        yes: 'Bəli',
        no: 'Xeyr'
      }
      Ext.MessageBox.titleText = {
        confirm: 'Təsdiq',
        prompt: 'Məlumat',
        wait: 'Yüklənmə...',
        alert: 'Diqqət'
      }
    }

    if (Ext.view.AbstractView) {
      Ext.view.AbstractView.prototype.loadingText = 'Yüklənir...'
    }

    if (Ext.util.Format) {
      Ext.apply(Ext.util.Format, {
        thousandSeparator: ' ',
        decimalSeparator: ',',
        currencySign: '', // 'AZM',
        timeFormat: 'H:i:s',
        datetimeFormat: 'd.m.Y H:i',
        dateFormat: 'd.m.Y'
      })
    }

    Ext.define('Ext.az.ux.DateTimePicker', {
      override: 'Ext.ux.DateTimePicker',
      todayText: 'Bugün',
      timeLabel: 'Vaxt'
    })

    if (Ext.picker.Date) {
      Ext.apply(Ext.picker.Date.prototype, {
        todayText: 'Bugün',
        minText: 'Bu tarix  mümkün ən kiçik tarixdən daha kiçikdir',
        maxText: 'Bu tarix  mümkün ən böyük tarixdən daha böyükdür',
        disabledDaysText: '',
        disabledDatesText: '',
        monthNames: Ext.Date.monthNames,
        dayNames: Ext.Date.shortDayNames,
        nextText: 'Gələcək Ay (Control+Right)',
        prevText: 'Önceki Ay (Control+Left)',
        monthYearText: 'Bir ay seçin (Yýlý artırmak/azaltmak için Control+Up/Down)',
        todayTip: '{0} (BoþŸluk TuþŸu - Spacebar)',
        format: 'd.m.Y',
        altFormats: 'dmY|dmy|d.m.y|d/m/Y|j/m/y|d/n/y|j/m/Y|d/n/Y|d-m-y|d/m|d-m|dm|dmy|dmY|d',
        startDay: 1
      })
    }

    if (Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
        okText: '&#160;Tamam&#160;',
        cancelText: 'Ləğv et'
      })
    }

    if (Ext.form.field.Number) {
      Ext.apply(Ext.form.field.Number.prototype, {
        minText: 'Ən az giriş sayı {0} olmalıdır',
        maxText: 'Ən çox giriş sayı {0} olmalıdır',
        nanText: '{0} ola bilməz'
      })
    }

    if (Ext.toolbar.Paging) {
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText: 'Səhifə',
        afterPageText: ' / {0}',
        firstText: 'İlk səhifə',
        prevText: 'Əvvəlki səhifə',
        nextText: 'Sonrakı səhifə',
        lastText: 'Son səhifə',
        refreshText: 'Yenilə',
        displayMsg: 'Göstərilən {0} - {1} / {2}',
        emptyMsg: 'Boşdur'
      })
    }

    if (Ext.form.field.Text) {
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText: 'Minimal uzunluq {0} olmalıdır',
        maxLengthText: 'Maksimal uzunluq {0} olmalıdır',
        blankText: 'Bu xana mütləq doldurulmalıdır',
        regexText: '',
        emptyText: null
      })
    }

    Ext.define('Ext.locale.az.view.View', {
      override: 'Ext.view.View',
      emptyText: ''
    })

    Ext.define('Ext.locale.az.grid.Grid', {
      override: 'Ext.grid.Grid',
      ddText: 'Sətir sayı : {0}'
    })

    Ext.define('Ext.locale.az.TabPanelItem', {
      override: 'Ext.TabPanelItem',
      closeText: 'Bağla'
    })

    Ext.define('Ext.locale.az.form.field.Base', {
      override: 'Ext.form.field.Base',
      invalidText: 'Bu xanadakı qiymət uyğun deyil'
    })

    // changing the msg text below will affect the LoadMask
    Ext.define('Ext.locale.az.view.AbstractView', {
      override: 'Ext.view.AbstractView',
      msg: 'Yüklənir ...'
    })

    if (Ext.LoadMask) {
      Ext.LoadMask.prototype.msg = 'Yüklənir...'
      Ext.LoadMask.msg = 'Yüklənir...'
    }

    if (Ext.Date) {
      Ext.Date.monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']

      Ext.Date.getShortMonthName = function (month) {
        return Ext.Date.monthNames[month].substring(0, 3)
      }

      Ext.Date.monthNumbers = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
      }

      Ext.Date.getMonthNumber = function (name) {
        return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()]
      }

      Ext.Date.dayNames = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə']

      Ext.Date.shortDayNames = ['B', 'B.e', 'Ç.a', 'Ç', 'C.a', 'C', 'Ş']

      Ext.Date.getShortDayName = function (day) {
        return Ext.Date.shortDayNames[day]
      }

      Ext.picker.Date.prototype.getDayInitial = function (value) {
        return Ext.Date.shortDayNames[Ext.Date.dayNames.indexOf(value)]
      }
    }

    if (Ext.form.field.Date) {
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText: 'De-aktiv edilmişdir',
        disabledDatesText: 'De-aktiv edilmişdir',
        minText: 'Bu tarix, {0} tarixindən daha sonra olmalıdır',
        maxText: 'Bu tarix, {0} tarixindən daha əvvəl olmalıdır',
        invalidText: '{0} ola bilməz - tarix formatı{1} kimi olmalıdır',
        format: 'd.m.Y',
        startDay: 1,
        altFormats: 'dmY|dmy|d.m.y|d/m/Y|j/m/y|d/n/y|j/m/Y|d/n/Y|d-m-y|d/m|d-m|dm|dmy|dmY|d'
      })
    }

    if (Ext.form.field.ComboBox) {
      Ext.apply(Ext.form.field.ComboBox.prototype, {
        valueNotFoundText: undefined
      })
      Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
        loadingText: 'Yükleniyor ...'
      })
    }

    if (Ext.form.field.VTypes) {
      Ext.apply(Ext.form.field.VTypes, {
        emailText: 'Bu sahə "user@example.com" şəklində elektron poçt formatında olmalıdır',
        urlText: '"http://www.example.com" şəklində URL adres formatında olmalıdır',
        alphaText: 'Bu sahə sadəcə hərf və _ ibarət olmalıdır',
        alphanumText: 'Bu sahə sadəcə hərf, rəqəm və _ ibarət olmalıdır'
      })
    }

    if (Ext.form.field.HtmlEditor) {
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText: 'Xahiş edirik, lazımi URL ünvanından istifadə edin:',
        buttonTips: {
          bold: {
            title: 'Qalın(Bold) (Ctrl+B)',
            text: 'Seçilmiş yazını qalın edir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic: {
            title: 'İtalik(Italic) (Ctrl+I)',
            text: 'Seçilmiş yazını italik edir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline: {
            title: 'Alt Xətli(Underline) (Ctrl+U)',
            text: 'Seçilmiş yazının altını xətliyir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize: {
            title: 'Fontu böyüt',
            text: 'Yazı fontunu böyüdür.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize: {
            title: 'Fontu kiçilt',
            text: 'Yazı fontunu kiçildir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor: {
            title: 'Arka Fonun Rəngi',
            text: 'Seçilmiş yazının arxa fon rəngini dəyişdir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor: {
            title: 'Yazı Rəngi',
            text: 'Seçili yazının rengini dəyişdir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft: {
            title: 'Sola sıx',
            text: 'Yazını sola sıx.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter: {
            title: 'Mərkəzləşdir',
            text: 'Yazını editorda mərkəzləşdir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright: {
            title: 'Sağa sıx',
            text: 'Yazını sağa sıx.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist: {
            title: 'Nöqtəli List',
            text: 'Nöqtəli list düzəlt.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist: {
            title: 'Nömrəli List',
            text: 'Nömrəli list düzəlt.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink: {
            title: 'Web Adresi(Hyperlink)',
            text: 'Seçili yazını web adresi(hyperlink) et.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit: {
            title: 'Mənbə kodu düzəlt',
            text: 'Mənbə kodu düzəltmə rejiminə keç.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      })
    }

    if (Ext.grid.header.Container) {
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText: 'Artan sırada sırala',
        sortDescText: 'Azalan sırada sırala',
        lockText: 'Kolonu blokla',
        unlockText: 'Kolon blokunu qaldır',
        columnsText: 'Kolonlar'
      })
    }

    if (Ext.grid.feature.Grouping) {
      Ext.apply(Ext.grid.feature.Grouping.prototype, {
        emptyGroupText: '(Boş)',
        groupByText: 'Bu xanaya əsasən qruplaşdır',
        showGroupsText: 'Qruplar Halında Göstər'
      })
    }

    if (Ext.grid.PropertyColumnModel) {
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText: 'Ad',
        valueText: 'Dəyər',
        dateFormat: 'd.m.Y'
      })
    }

    if (Ext.SplitLayoutRegion) {
      Ext.apply(Ext.SplitLayoutRegion.prototype, {
        splitTip: 'Ölçü üçün çəkin.',
        collapsibleSplitTip: 'Ölçü üçün çəkin. Gizlətmək üçün cüt sıxın.'
      })
    }

    if (Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion) {
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip: 'Ölçü üçün çəkin.',
        collapsibleSplitTip: 'Ölçü üçün çəkin. Gizlətmək üçün cüt sıxın.'
      })
    }

    if (Ext.form.CheckboxGroup) {
      Ext.apply(Ext.form.CheckboxGroup.prototype, {
        blankText: 'Qrupda heç olmasa bir vəzifə seçmək lazımdır'
      })
    }

    if (Ext.tab.Tab) {
      Ext.apply(Ext.tab.Tab.prototype, {
        closeText: 'Əlavəni bağla'
      })
    }

    if (Ext.form.Basic) {
      Ext.form.Basic.prototype.waitTitle = 'Xahiş edirik gözləyin...'
    }
  })
}
