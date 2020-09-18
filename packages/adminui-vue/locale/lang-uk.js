/** ElementUI for UB Ukrainian */
UB.i18nExtend({
  el: {
    colorpicker: {
      confirm: 'OK',
      clear: 'Очистити'
    },
    datepicker: {
      now: 'Зараз',
      today: 'Сьогодні',
      cancel: 'Відміна',
      clear: 'Очистити',
      confirm: 'OK',
      selectDate: 'Вибрати дату',
      selectTime: 'Вибрати час',
      startDate: 'Дата початку',
      startTime: 'Час початку',
      endDate: 'Дата завершення',
      endTime: 'Час завершення',
      prevYear: 'Попередній Рік',
      nextYear: 'Наступний Рік',
      prevMonth: 'Попередній Місяць',
      nextMonth: 'Наступний Місяць',
      year: '',
      month1: 'Січень',
      month2: 'Лютий',
      month3: 'Березень',
      month4: 'Квітень',
      month5: 'Травень',
      month6: 'Червень',
      month7: 'Липень',
      month8: 'Серпень',
      month9: 'Вересень',
      month10: 'Жовтень',
      month11: 'Листопад',
      month12: 'Грудень',
      // week: 'week',
      weeks: {
        sun: 'Нд',
        mon: 'Пн',
        tue: 'Вт',
        wed: 'Ср',
        thu: 'Чт',
        fri: 'Пт',
        sat: 'Сб'
      },
      months: {
        jan: 'Січ',
        feb: 'Лют',
        mar: 'Бер',
        apr: 'Кві',
        may: 'Тра',
        jun: 'Чер',
        jul: 'Лип',
        aug: 'Сер',
        sep: 'Вер',
        oct: 'Жов',
        nov: 'Лис',
        dec: 'Гру'
      },
      format: {
        date: 'dd.MM.yyyy',
        daterange: 'dd.MM.yyyy',
        datetime: 'dd.MM.yyyy HH:mm',
        firstDayOfWeek: 1
      }
    },
    select: {
      loading: 'Завантаження',
      noMatch: 'Співпадінь не знайдено',
      noData: 'Немає даних',
      placeholder: 'Обрати'
    },
    cascader: {
      noMatch: 'Співпадінь не знайдено',
      loading: 'Завантаження',
      placeholder: 'Обрати'
    },
    pagination: {
      goto: 'Перейти',
      pagesize: 'на сторінці',
      total: 'Всього {total}',
      pageClassifier: ''
    },
    messagebox: {
      title: 'Повідомлення',
      confirm: 'OK',
      cancel: 'Відміна',
      error: 'Неприпустимий ввід даних'
    },
    upload: {
      deleteTip: 'натисніть кнопку щоб видалити',
      delete: 'Видалити',
      preview: 'Перегляд',
      continue: 'Продовжити'
    },
    table: {
      emptyText: 'Немає даних',
      confirmFilter: 'Підтвердити',
      resetFilter: 'Скинути',
      clearFilter: 'Все',
      sumText: 'Сума'
    },
    tree: {
      emptyText: 'Немає даних'
    },
    transfer: {
      noMatch: 'Співпадінь не знайдено',
      noData: 'Обрати',
      titles: ['Список 1', 'Список 2'],
      filterPlaceholder: 'Введіть ключове слово',
      noCheckedFormat: '{total} пунктів',
      hasCheckedFormat: '{checked}/{total} вибрано'
    }
  },
  isRequiredFieldFmt: '{0} обов\'язкове для заповнення',
  linkCopiedText: 'Посилання скопійовано в буфер обміну',
  createdEntityCaption: 'Створено',
  updatedEntityCaption: 'Оновлено',

  searchByDateRange: 'За період',
  forAllTime: 'За весь час',
  lastMonth: 'За останній місяць',
  lastQuarter: 'За останній квартал',
  last6Month: 'За останні 6 місяців',
  thisYear: 'За цей рік',

  successfullySaved: 'Збережено',
  formWasRefreshed: 'Форма була оновлена',
  recordDeletedSuccessfully: 'Запис успішно видалено',
  selectedValueWasDeleted: 'Обраний запис видалено',
  recordWasDeleted: 'Запис було видалено',
  validationError: 'Неможливо зберегти, поля з помилкою - {0}',
  formCrashTitle: 'Форма зломалась',
  formCrashBody: 'Щось пішло не так, перезавантажте форму або зверніться до системного адміністратора',

  selectDate: 'Оберіть дату',
  selectDateAndTime: 'Оберіть дату та час',

  sidebar: {
    desktopSelector: {
      title: 'Вибір робочого столу'
    }
  },

  table: {
    filter: {
      list: {
        title: 'Фільтри'
      },
      conditionPlaceholder: 'Вираз',
      valueLabel: 'Значення',
      date: {
        from: 'з',
        to: 'до',
        valuePlaceholder: 'Оберіть дату'
      },
      columnPlaceholder: 'Колонка'
    },
    pagination: {
      outOf: 'з',
      nextPage: 'Наступна сторінка',
      prevPage: 'Попередня сторінка'
    },
    columnLabel: 'Колонка',
    viewMode: {
      label: 'Вид відображення',
      card: 'Картки',
      table: 'Таблиця'
    },
    sort: {
      label: 'Сортування',
      direction: {
        label: 'Напрямок',
        asc: 'По зростанню',
        desc: 'За зменшенням',
        none: 'Немає'
      }
    },
    summary: {
      menuText: 'Показати підсумки',
      header: 'Підсумки для "{forTitle:i18n}"',
      totalRowCount: 'Всього рядків',
      columnSummaries: 'Суми по колонкам'
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
      label: 'Назва',
      size: 'Размір',
      type: 'Тип',
      uploadDate: 'Дата завантаження'
    },
    dropZone: {
      caption: 'Перетягніть файл сюди або натисніть для вибору',
      acceptError: 'Невірний тип файлу(ів)',
      selectedFiles: 'Обрано'
    }
  },

  select: {
    valueIsUndefined: 'Значення "{0}" не знайдено в сутності "{1}"'
  },

  tableRegister: {
    hideDetails: 'Приховати деталі'
  },

  chat: {
    emptyMessage: 'Тут поки що немає жодного повідомлення...',
    inputPlaceholder: 'Введіть повідомлення',
    copyNotification: 'Повідомлення скопійовано в буфер обміну',
    removeMessageDialog: 'Видалити повідомлення "{0}"',
    removeMessageNotification: 'Повідомлення успішно видалено'
  },

  UFile: {
    webcam: {
      webcamLabel: 'Камера',
      pictureLabel: 'Зображення',
      emptyPicturePlaceholder: 'Ваше зображення',
      takePictureButton: 'Зробити знімок',
      takeAnotherPictureButton: 'Зробити інший знімок',
      error: {
        NotReadableError: 'Доступ до камери заборонений в налаштуваннях операційної системи',
        NotFoundError: 'Камера не знайдена',
        NotAllowedError: 'Доступ до камери заборонений. Ввімкніть доступ у налаштуваннях браузера'
      }
    },

    addButtonTooltip: 'Додати',
    downloadButtonTooltip: 'Завантажити',
    previewButtonTooltip: 'Попередній перегляд',
    removeButtonTooltip: 'Видалити',
    scanButtonTooltip: 'Сканувати',
    scanSettingsButtonTooltip: 'Параметри сканування',
    webcamButtonTooltip: 'Завантажити зображення з веб-камери',
    fullscreenButtonTooltip: 'Розгорнути на весь екран'
  },

  UNavbar: {
    allTabsButton: 'Усі відкриті вкладинки'
  }
})
