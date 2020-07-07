/** ElementUI for Kyrgyz */
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
        title: 'Фильтры'
      },
      conditionPlaceholder: 'Выражение',
      valuePlaceholder: 'Значение',
      date: {
        from: 'с',
        to: 'по',
        valuePlaceholder: 'Выберите дату'
      },
      columnPlaceholder: 'Колонка'
    },
    pagination: {
      outOf: 'из',
      nextPage: 'Следующая страница',
      prevPage: 'Предыдущая страница'
    }
  },

  sizeUnits: {
    b: 'Байт',
    kb: 'КБ',
    mb: 'МБ',
    gb: 'ГБ',
    tb: 'ТБ'
  },

  fileInput: {
    manyFilesTable: {
      label: 'Название',
      size: 'Размер',
      type: 'Тип',
      uploadDate: 'Дата загрузки'
    },
    dropZone: {
      caption: 'Перетащите файл сюда или нажмите для выбора',
      acceptError: 'Неверное расширение файла'
    }
  },

  select: {
    valueIsUndefined: 'Значение "{0}" не найдено в сущности "{1}"'
  },

  tableRegister: {
    hideDetails: 'Скрыть детали'
  },

  chat: {
    emptyMessage: 'Здесь пока нет ни одного сообщения...',
    inputPlaceholder: 'Введите сообщение',
    copyNotification: 'Сообщение скопировано в буфер обмена',
    removeMessageDialog: 'Удалить сообщение "{0}"',
    removeMessageNotification: 'Сообщение успешно удалено'
  },

  UFile: {
    webcam: {
      webcamLabel: 'Камера',
      pictureLabel: 'Изображение',
      emptyPicturePlaceholder: 'Ваше изображение',
      takePictureButton: 'Сделать скриншот',
      takeAnotherPictureButton: 'Сделать другой скриншот',
      error: {
        NotReadableError: 'Доступ к камере запрещен в настройках операционной системы',
        NotFoundError: 'Камера не найдена',
        NotAllowedError: 'Доступ к камере запрещен. Включите доступ в настройках браузера'
      }
    },

    addButtonTooltip: 'Добавить',
    downloadButtonTooltip: 'Скачать',
    previewButtonTooltip: 'Предпросмотр',
    removeButtonTooltip: 'Удалить',
    scanButtonTooltip: 'Сканировать',
    scanSettingsButtonTooltip: 'Настройки сканера',
    webcamButtonTooltip: 'Загрузить изображение с ваб-камеры',
    fullscreenButtonTooltip: 'Развернуть на весь экран'
  }
})
