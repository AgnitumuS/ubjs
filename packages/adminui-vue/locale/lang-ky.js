/** ElementUI for UB Russian */
UB.i18nExtend({
  el: {
    colorpicker: {
      confirm: 'OK',
      clear: 'Очистить'
    },
    datepicker: {
      now: 'Сейчас',
      today: 'Сегодня',
      cancel: 'Отмена',
      clear: 'Очистить',
      confirm: 'OK',
      selectDate: 'Выбрать дату',
      selectTime: 'Выбрать время',
      startDate: 'Дата начала',
      startTime: 'Время начала',
      endDate: 'Дата окончания',
      endTime: 'Время окончания',
      prevYear: 'Предыдущий год',
      nextYear: 'Следующий год',
      prevMonth: 'Предыдущий месяц',
      nextMonth: 'Следующий месяц',
      year: '',
      month1: 'Январь',
      month2: 'Февраль',
      month3: 'Март',
      month4: 'Апрель',
      month5: 'Май',
      month6: 'Июнь',
      month7: 'Июль',
      month8: 'Август',
      month9: 'Сентябрь',
      month10: 'Октябрь',
      month11: 'Ноябрь',
      month12: 'Декабрь',
      // week: 'week',
      weeks: {
        sun: 'Вс',
        mon: 'Пн',
        tue: 'Вт',
        wed: 'Ср',
        thu: 'Чт',
        fri: 'Пт',
        sat: 'Сб'
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
      },
      format: {
        date: 'MM/dd/yyyy',
        daterange: 'MM/dd/yyyy',
        datetime: 'MM/dd/yyyy HH:mm',
        firstDayOfWeek: 7
      }
    },
    select: {
      loading: 'Загрузка',
      noMatch: 'Совпадений не найдено',
      noData: 'Нет данных',
      placeholder: 'Выбрать'
    },
    cascader: {
      noMatch: 'Совпадений не найдено',
      loading: 'Загрузка',
      placeholder: 'Выбрать'
    },
    pagination: {
      goto: 'Перейти',
      pagesize: ' на странице',
      total: 'Всего {total}',
      pageClassifier: ''
    },
    messagebox: {
      title: 'Сообщение',
      confirm: 'OK',
      cancel: 'Отмена',
      error: 'Недопустимый ввод данных'
    },
    upload: {
      deleteTip: 'Нажмите [Удалить] для удаления',
      delete: 'Удалить',
      preview: 'Превью',
      continue: 'Продолжить'
    },
    table: {
      emptyText: 'Нет данных',
      confirmFilter: 'Подтвердить',
      resetFilter: 'Сбросить',
      clearFilter: 'Все',
      sumText: 'Сумма'
    },
    tree: {
      emptyText: 'Нет данных'
    },
    transfer: {
      noMatch: 'Совпадений не найдено',
      noData: 'Нет данных',
      titles: ['Список 1', 'Список 2'],
      filterPlaceholder: 'Введите ключевое слово',
      noCheckedFormat: '{total} пунктов',
      hasCheckedFormat: '{checked}/{total} выбрано'
    }
  },
  isRequiredFieldFmt: '{0} обязательно для заполнения',
  linkCopiedText: 'Ссылка скопирована в буфер обмена',
  createdEntityCaption: 'Создано',
  updatedEntityCaption: 'Обновлено',

  searchByDateRange: 'Date range',
  forAllTime: 'For all time',
  lastMonth: 'Last Month',
  lastQuarter: 'Last quarter',
  last6Month: 'Last 6 month',
  thisYear: 'This year',

  successfullySaved: 'Successfully saved',
  formWasRefreshed: 'Form was refreshed',
  recordDeletedSuccessfully: 'Record deleted successfully',
  selectedValueWasDeleted: 'Selected value was deleted',
  recordWasDeleted: 'Record was deleted',
  validationError: 'Unable to save, error in fields - {0}',
  formCrashTitle: 'Form was crashed',
  formCrashBody: 'Something going wrong please reload form or contact system administrator',

  selectDate: 'Select date',
  selectDateAndTime: 'Select date and time',

  sidebar: {
    desktopSelector: {
      title: 'Desktop selection'
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
      },
      columnPlaceholder: 'Column'
    },
    pagination: {
      outOf: 'out of',
      nextPage: 'Следующая страница',
      prevPage: 'Предыдущая страница'
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
      caption: 'Drop file(s) here or click to upload',
      acceptError: 'Invalid file extension'
    }
  },

  select: {
    valueIsUndefined: 'Value "{0}" not found in entity "{1}"'
  },

  tableRegister: {
    hideDetails: 'Hide details'
  },

  chat: {
    emptyMessage: 'No messages yet ...',
    inputPlaceholder: 'Enter a message',
    copyNotification: 'Message successfully copied in clipboard',
    removeMessageDialog: 'Remove message "{0}"',
    removeMessageNotification: 'Message successfully deleted'
  },

  UFile: {
    webcam: {
      webcamLabel: 'Webcam',
      pictureLabel: 'Picture',
      emptyPicturePlaceholder: 'Your picture',
      takePictureButton: 'Take picture',
      takeAnotherPictureButton: 'Take another',
      error: {
        NotReadableError: 'Access to webcam disabled by operation system settings',
        NotFoundError: 'Cannot see any webcam devices',
        NotAllowedError: 'Access to webcam disabled. Turn it on in browser settings'
      }
    },

    addButtonTooltip: 'Add',
    downloadButtonTooltip: 'Download',
    previewButtonTooltip: 'Preview',
    removeButtonTooltip: 'Remove',
    scanButtonTooltip: 'Scan',
    scanSettingsButtonTooltip: 'Scan settings',
    webcamButtonTooltip: 'Take image from webcam',
    fullscreenButtonTooltip: 'Full screen preview'
  }
})
