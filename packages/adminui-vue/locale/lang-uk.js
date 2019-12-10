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
      title: 'Вибір робочого стола'
    }
  },

  table: {
    filter: {
      list: {
        title: 'Фільтри'
      },
      conditionPlaceholder: 'Вираз',
      valuePlaceholder: 'Значення',
      date: {
        from: 'від',
        to: 'до',
        valuePlaceholder: 'Оберіть дату'
      }
    },
    pagination: {
      outOf: 'з'
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
    dropZoneCaption: 'або перетягніть файли сюди'
  },

  select: {
    valueIsUndefined: 'Занчення "{0}" не знайдено в сутності "{1}"'
  }
})
