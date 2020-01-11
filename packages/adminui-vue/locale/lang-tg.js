/** ElementUI for UB Tajik */
UB.i18nExtend({
  el: {
    colorpicker: {
      confirm: 'OK',
      clear: 'Ҳавз кардан'
    },
    datepicker: {
      now: 'Хозир',
      today: 'Имрӯз',
      cancel: 'Бекор кардан',
      clear: 'Ҳавз кардан',
      confirm: 'OK',
      selectDate: 'Интихоби сана',
      selectTime: 'Вақтро интихоб кунед',
      startDate: 'Санаи оғоз',
      startTime: 'Вақти оғоз',
      endDate: 'Санаи анҷом',
      endTime: 'Вақти анҷом',
      prevYear: 'Соли гузашта',
      nextYear: 'Соли оянда',
      prevMonth: 'Моҳи гузашта',
      nextMonth: 'Моҳи оянда',
      year: '',
      month1: 'Январ',
      month2: 'Феврал',
      month3: 'Март',
      month4: 'Апрел',
      month5: 'Май',
      month6: 'Июн',
      month7: 'Июл',
      month8: 'Август',
      month9: 'Сентябр',
      month10: 'Октябр',
      month11: 'Ноябр',
      month12: 'Декабр',
      // week: 'week',
      weeks: {
        sun: 'Яш',
        mon: 'Дш',
        tue: 'Сш',
        wed: 'Чш',
        thu: 'Ҷм',
        fri: 'Пш',
        sat: 'Шб'
      },
      months: {
        jan: 'Янв',
        feb: 'Фев',
        mar: 'Мар',
        apr: 'Апр',
        may: 'Май',
        jun: 'Июн',
        jul: 'Июл',
        aug: 'Авг',
        sep: 'Сен',
        oct: 'Окт',
        nov: 'Ноя',
        dec: 'Дек'
      }
    },
    select: {
      loading: 'Боргирӣ ',
      noMatch: 'Ҳеҷ мувофиқат пайдо нашуд',
      noData: 'Маълумот нест',
      placeholder: 'Интихоб кунед'
    },
    cascader: {
      noMatch: 'Ҳеҷ мувофиқат пайдо нашуд',
      loading: 'Боргирӣ ',
      placeholder: 'Интихоб кунед'
    },
    pagination: {
      goto: 'Гузаштан',
      pagesize: ' дар саҳифа',
      total: 'Ҳамагӣ {total}',
      pageClassifier: ''
    },
    messagebox: {
      title: 'Паём',
      confirm: 'OK',
      cancel: 'Бекор кардан',
      error: 'Вуруди нодурусти маълумот'
    },
    upload: {
      deleteTip: 'Барои нест кардан [Нест кардан] -ро клик кунед',
      delete: 'Ҳавз кардан',
      preview: 'Пешнамоиш',
      continue: 'Идома додан'
    },
    table: {
      emptyText: 'Маълумот нетс',
      confirmFilter: 'Тасдиқ кардан',
      resetFilter: 'Партофтан',
      clearFilter: 'Ҳама',
      sumText: 'Миқдор'
    },
    tree: {
      emptyText: 'Маълумот нест'
    },
    transfer: {
      noMatch: 'Тасодуфӣ пайдо нашуд?',
      noData: 'Маълумот нест',
      titles: ['Рӯйхат 1', 'Рӯйхат 2'],
      filterPlaceholder: 'Калимаи калидиро ворид намоед',
      noCheckedFormat: '{total} нуқтаҳо',
      hasCheckedFormat: '{checked}/{total} интихоб карда шуд'
    }
  },
  isRequiredFieldFmt: '{0} барои пур карданд ҳатмист ',
  linkCopiedText: 'Истинод нусхабардорӣ карда шуд ба буфери мубодила',
  createdEntityCaption: 'Офирида шудааст',
  updatedEntityCaption: 'Навсозӣ',

  searchByDateRange: 'Дар тӯли давра',
  forAllTime: 'Дар ҳама вақт',
  lastMonth: 'Моҳи гузашта',
  lastQuarter: 'Барои семоҳаи охир',
  last6Month: 'Дар давоми 6 моҳи охир',
  thisYear: 'Имсола',

  successfullySaved: 'Захира шуд',
  formWasRefreshed: 'Шакл нав карда шуд.',
  recordDeletedSuccessfully: 'Сабт бомуваффақият нест карда шуд',
  selectedValueWasDeleted: 'Қимати интихобшуда нест карда мешавад',
  recordWasDeleted: 'Маълумот нест карда шуд',
  validationError: 'Нигоҳ доштан ғайриимкон аст, маъмулот хатогӣ дорад - {0}',
  formCrashTitle: 'Шакл шикастааст',
  formCrashBody: 'Чизе нодуруст шуд, шаклро аз нав бор кунед ё бо мудири системаи худ дар тамос шавед',

  selectDate: 'Санаро интихоб кунед',
  selectDateAndTime: 'Сана ва вақтро интихоб кунед',

  sidebar: {
    desktopSelector: {
      title: 'Интихоби десктопа'
    }
  },

  table: {
    filter: {
      list: {
        title: 'Filters'
      },
      conditionPlaceholder: 'Condition',
      valuePlaceholder: 'Value',
      date: {
        from: 'from',
        to: 'to',
        valuePlaceholder: 'Select date'
      }
    },
    pagination: {
      outOf: 'out of'
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
      label: 'Label',
      size: 'Size',
      type: 'Type',
      uploadDate: 'Upload date'
    },
    dropZone: {
      caption: 'or drop files here',
      acceptError: 'Invalid file extension'
    }
  },

  select: {
    valueIsUndefined: 'Value "{0}" not found in entity "{1}"'
  }
})
