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
      week: 'неделя',
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
      placeholder: 'Выбрать',
      noData: 'Нет данных'
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
    },
    image: {
      error: 'FAILED' // to be translated
    },
    pageHeader: {
      title: 'Back' // to be translated
    }
  },
  isRequiredFieldFmt: '{0} обязательно для заполнения',
  linkCopiedText: 'Ссылка скопирована в буфер обмена',
  createdEntityCaption: 'Создано',
  updatedEntityCaption: 'Обновлено',

  searchByDateRange: 'За период',
  forAllTime: 'За все время',
  lastMonth: 'За последний месяц',
  lastQuarter: 'За последний квартал',
  last6Month: 'За последние 6 месяцев',
  thisYear: 'За этот год',

  successfullySaved: 'Сохранено',
  formWasRefreshed: 'Форма была обновлена',
  recordDeletedSuccessfully: 'Запись успешно удалена',
  selectedValueWasDeleted: 'Выбраное значение удалено',
  recordWasDeleted: 'Запись была удалена',
  validationError: 'Невозможно сохранить, поля с ошибкой - {0}',
  formCrashTitle: 'Форма сломалась',
  formCrashBody: 'Что то пошло не так, перезагрузите форму или свяжитесь с системным администратором',

  selectDate: 'Выберите дату',
  selectDateAndTime: 'Выберите дату и время',

  sidebar: {
    desktopSelector: {
      title: 'Вибор рабочего стола'
    }
  },

  table: {
    filter: {
      list: {
        title: 'Фильтры'
      },
      conditionPlaceholder: 'Виражение',
      valuePlaceholder: 'Значение',
      date: {
        from: 'от',
        to: 'до',
        valuePlaceholder: 'Выберите дату'
      }
    },
    pagination: {
      outOf: 'из'
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
    dropZoneCaption: 'или перетащите файлы сюда'
  }
})
