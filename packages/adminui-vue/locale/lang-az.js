/** ElementUI for UB Azerbaijani */
/* globals UB */
UB.i18nExtend({
  el: {
    colorpicker: {
      confirm: 'Tamam',
      clear: 'Təmizlə'
    },
    datepicker: {
      now: 'İndi',
      today: 'Bugün',
      cancel: 'İmtına',
      clear: 'Təmizlə',
      confirm: 'Tamam',
      selectDate: 'Tarixi seçmək',
      selectTime: 'Vaxtı seçmək',
      startDate: 'Başlanma tarixi',
      startTime: 'Başlanma vaxtı',
      endDate: 'Bitmə tarixi',
      endTime: 'Bitmə vaxtı',
      prevYear: 'Əvvəlki il',
      nextYear: 'Növbəti il',
      prevMonth: 'Əvvəlki ay',
      nextMonth: 'Növbəti ay',
      year: '',
      month1: 'Yanvar',
      month2: 'Fevral',
      month3: 'Mart',
      month4: 'Aprel',
      month5: 'May',
      month6: 'İyun',
      month7: 'İyul',
      month8: 'Avqust',
      month9: 'Sentyabr',
      month10: 'Oktyabr',
      month11: 'Noyabr',
      month12: 'Dekabr',
      // week: 'week',
      weeks: {
        sun: 'B.',
        mon: 'B.E.',
        tue: 'Ç.A.',
        wed: 'Ç.',
        thu: 'C.A.',
        fri: 'C.',
        sat: 'Ş.'
      },
      months: {
        jan: 'Yan',
        feb: 'Fev',
        mar: 'Mart',
        apr: 'Apr',
        may: 'May',
        jun: 'İyun',
        jul: 'İyun',
        aug: 'Avq',
        sep: 'Sent',
        oct: 'Okt',
        nov: 'Noy',
        dec: 'Dek'
      }
    },
    select: {
      loading: 'Yüklənmə',
      noMatch: 'Uyğunluq tapılmadı',
      noData: 'Məlumat yoxdur',
      placeholder: 'Seçmək'
    },
    cascader: {
      noMatch: 'Uyğunluq tapılmadı',
      loading: 'Yüklənmə',
      placeholder: 'Seçmək'
    },
    pagination: {
      goto: 'Keçmək',
      pagesize: ' Səhifədə',
      total: 'Cəmi {total}',
      pageClassifier: ''
    },
    messagebox: {
      title: 'İsmarış',
      confirm: 'Tamam',
      cancel: 'İmtına',
      error: 'Yanlış məlumat girişi'
    },
    upload: {
      deleteTip: 'Silmək üçün [Silmək] vurun',
      delete: 'Silmək',
      preview: 'İlkin baxış',
      continue: 'Davam etmək'
    },
    table: {
      emptyText: 'Məlumat yoxdur',
      confirmFilter: 'Təsdiq etmək',
      resetFilter: 'Sıfırlamaq',
      clearFilter: 'Bütün',
      sumText: 'Cəm'
    },
    tree: {
      emptyText: 'Məlumat yoxdur'
    },
    transfer: {
      noMatch: 'Uyğunluq tapılmadı',
      noData: 'Məlumat yoxdur',
      titles: ['Siyahı 1', 'Siyahı 2'],
      filterPlaceholder: 'Açar sözü daxil edin',
      noCheckedFormat: '{total} bəndlər',
      hasCheckedFormat: '{checked}/{total} seçilmişdir'
    }
  },
  isRequiredFieldFmt: '{0} mütləq doldurulmalı',
  linkCopiedText: 'link mübadilə buferinə əlavə olundu',
  createdEntityCaption: 'Yaradılıb',
  updatedEntityCaption: 'Yenilənib',

  searchByDateRange: 'Müddət aralığında',
  forAllTime: 'Bütün müddət üzrə',
  lastMonth: 'Son ay üzrə',
  lastQuarter: 'Son kvartal üzrə',
  last6Month: 'Son 6 ay üzrə',
  thisYear: 'Cari il üzrə',

  successfullySaved: 'Yadda saxlanılmışdır',
  formWasRefreshed: 'Forma yenilənmişdir',
  recordDeletedSuccessfully: 'Yazı uğurla silinmişdir',
  selectedValueWasDeleted: 'Seçilmiş yazı silinmişdir',
  recordWasDeleted: 'Yazı silinmişdir',
  validationError: 'Yadda saxlamaq mümkün deyil, sahələr yalnışdır - {0}',
  formCrashTitle: 'Formada xəta baş vermişdir',
  formCrashBody: 'Xəta baş vermişdir, fomranı yeniləyin və yaxud sistem administratorla əlaqə saxlayın',

  selectDate: 'Tarixi seçin',
  selectDateAndTime: 'Tarix və vaxtı seçin',

  sidebar: {
    desktopSelector: {
      title: 'İş masanı seçimi'
    }
  },

  table: {
    filter: {
      list: {
        title: 'Filtlər'
      },
      conditionPlaceholder: 'Şərt',
      valuePlaceholder: 'Qiymət',
      date: {
        from: 'dən',
        to: 'dək',
        valuePlaceholder: 'Tarixi seçin'
      }
    },
    pagination: {
      outOf: 'dan'
    }
  },

  sizeUnits: {
    b: 'Bytes',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
    tb: 'TB'
  },

  fileInput: {
    manyFilesTable: {
      label: 'Başlıq',
      size: 'Həcm',
      type: 'Tip',
      uploadDate: 'Yüklənmə tarixi'
    },
    dropZone: {
      caption: 'və ya faylları buraya sürükləyin',
      acceptError: 'Invalid file extension'
    }
  },

  select: {
    valueIsUndefined: 'Qiymət "{0}" obeyktdə tapılmadı "{1}"'
  }
})
