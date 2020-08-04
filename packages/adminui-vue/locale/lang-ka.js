/** ElementUI for UB Georgian */
UB.i18nExtend({
  el: {
    colorpicker: {
      confirm: 'OK',
      clear: 'Clear'
    },
    datepicker: {
      now: 'Now',
      today: 'Today',
      cancel: 'Cancel',
      clear: 'Clear',
      confirm: 'OK',
      selectDate: 'Select date',
      selectTime: 'Select time',
      startDate: 'Start Date',
      startTime: 'Start Time',
      endDate: 'End Date',
      endTime: 'End Time',
      prevYear: 'Previous Year',
      nextYear: 'Next Year',
      prevMonth: 'Previous Month',
      nextMonth: 'Next Month',
      year: '',
      month1: 'January',
      month2: 'February',
      month3: 'March',
      month4: 'April',
      month5: 'May',
      month6: 'June',
      month7: 'July',
      month8: 'August',
      month9: 'September',
      month10: 'October',
      month11: 'November',
      month12: 'December',
      // week: 'week',
      weeks: {
        sun: 'Sun',
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat'
      },
      months: {
        jan: 'Jan',
        feb: 'Feb',
        mar: 'Mar',
        apr: 'Apr',
        may: 'May',
        jun: 'Jun',
        jul: 'Jul',
        aug: 'Aug',
        sep: 'Sep',
        oct: 'Oct',
        nov: 'Nov',
        dec: 'Dec'
      },
      format: {
        date: 'dd.MM.yyyy',
        daterange: 'dd.MM.yyyy',
        datetime: 'dd.MM.yyyy HH:mm',
        firstDayOfWeek: 1
      }
    },
    select: {
      loading: 'Loading',
      noMatch: 'No matching data',
      noData: 'No data',
      placeholder: 'Select'
    },
    cascader: {
      noMatch: 'No matching data',
      loading: 'Loading',
      placeholder: 'Select'
    },
    pagination: {
      goto: 'Go to',
      pagesize: '/page',
      total: 'Total {total}',
      pageClassifier: ''
    },
    messagebox: {
      title: 'Message',
      confirm: 'OK',
      cancel: 'Cancel',
      error: 'Illegal input'
    },
    upload: {
      deleteTip: 'press delete to remove',
      delete: 'Delete',
      preview: 'Preview',
      continue: 'Continue'
    },
    table: {
      emptyText: 'No Data',
      confirmFilter: 'Confirm',
      resetFilter: 'Reset',
      clearFilter: 'All',
      sumText: 'Sum'
    },
    tree: {
      emptyText: 'No Data'
    },
    transfer: {
      noMatch: 'No matching data',
      noData: 'No data',
      titles: ['List 1', 'List 2'], // to be translated
      filterPlaceholder: 'Enter keyword', // to be translated
      noCheckedFormat: '{total} items', // to be translated
      hasCheckedFormat: '{checked}/{total} checked' // to be translated
    }
  },
  isRequiredFieldFmt: '{0} is required',
  linkCopiedText: 'Link copied to clipboard',
  createdEntityCaption: 'Created',
  updatedEntityCaption: 'Updated',

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
      nextPage: 'შემდეგი გვერდი',
      prevPage: 'წინა გვერდი'
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
      acceptError: 'Invalid file(s) type',
      selectedFiles: 'Selected'
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
  },

  UNavbar: {
    allTabsButton: 'All opened tabs'
  }
})
