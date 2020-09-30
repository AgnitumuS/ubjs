/** ElementUI for UB Indonezian */
UB.i18nExtend({
  el: {
    colorpicker: {
      confirm: 'Pilih',
      clear: 'Kosongkan'
    },
    datepicker: {
      now: 'Sekarang',
      today: 'Hari ini',
      cancel: 'Batal',
      clear: 'Kosongkan',
      confirm: 'Ya',
      selectDate: 'Pilih tanggal',
      selectTime: 'Pilih waktu',
      startDate: 'Tanggal Mulai',
      startTime: 'Waktu Mulai',
      endDate: 'Tanggal Selesai',
      endTime: 'Waktu Selesai',
      prevYear: 'Previous Year', // to be translated
      nextYear: 'Next Year', // to be translated
      prevMonth: 'Previous Month', // to be translated
      nextMonth: 'Next Month', // to be translated
      year: 'Tahun',
      month1: 'Januari',
      month2: 'Februari',
      month3: 'Maret',
      month4: 'April',
      month5: 'Mei',
      month6: 'Juni',
      month7: 'Juli',
      month8: 'Agustus',
      month9: 'September',
      month10: 'Oktober',
      month11: 'November',
      month12: 'Desember',
      // week: 'minggu',
      weeks: {
        sun: 'Min',
        mon: 'Sen',
        tue: 'Sel',
        wed: 'Rab',
        thu: 'Kam',
        fri: 'Jum',
        sat: 'Sab'
      },
      months: {
        jan: 'Jan',
        feb: 'Feb',
        mar: 'Mar',
        apr: 'Apr',
        may: 'Mei',
        jun: 'Jun',
        jul: 'Jul',
        aug: 'Agu',
        sep: 'Sep',
        oct: 'Okt',
        nov: 'Nov',
        dec: 'Des'
      },
      format: {
        date: 'MM/dd/yyyy',
        daterange: 'MM/dd/yyyy',
        datetime: 'MM/dd/yyyy HH:mm',
        firstDayOfWeek: 7
      }
    },
    select: {
      loading: 'Memuat',
      noMatch: 'Tidak ada data yg cocok',
      noData: 'Tidak ada data',
      placeholder: 'Pilih'
    },
    cascader: {
      noMatch: 'Tidak ada data yg cocok',
      loading: 'Memuat',
      placeholder: 'Pilih'
    },
    pagination: {
      goto: 'Pergi ke',
      pagesize: '/laman',
      total: 'Total {total}',
      pageClassifier: ''
    },
    messagebox: {
      title: 'Pesan',
      confirm: 'Ya',
      cancel: 'Batal',
      error: 'Masukan ilegal'
    },
    upload: {
      deleteTip: 'press delete to remove', // to be translated
      delete: 'Hapus',
      preview: 'Pratinjau',
      continue: 'Lanjutkan'
    },
    table: {
      emptyText: 'Tidak ada data',
      confirmFilter: 'Konfirmasi',
      resetFilter: 'Atur ulang',
      clearFilter: 'Semua',
      sumText: 'Jml'
    },
    tree: {
      emptyText: 'Tidak ada data'
    },
    transfer: {
      noMatch: 'Tidak ada data yg cocok',
      noData: 'Tidak ada data',
      titles: ['Senarai 1', 'Senarai 2'],
      filterPlaceholder: 'Masukan kata kunci',
      noCheckedFormat: '{total} butir',
      hasCheckedFormat: '{checked}/{total} terpilih'
    }
  },
  isRequiredFieldFmt: '{0} wajib diisi',
  linkCopiedText: 'Tautan disalin ke papan klip',
  createdEntityCaption: 'Dibuat',
  updatedEntityCaption: 'Diperbarui',

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
  validationError: 'Unable to save.<br> Error in fields:<br> {0}',
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
      valueLabel: 'Value',
      date: {
        from: 'from',
        to: 'to',
        valuePlaceholder: 'Select date'
      },
      columnPlaceholder: 'Column'
    },
    pagination: {
      outOf: 'out of',
      nextPage: 'Next page',
      prevPage: 'Previous page'
    },
    columnLabel: 'Column',
    viewMode: {
      label: 'View mode',
      card: 'Card',
      table: 'Table'
    },
    sort: {
      label: 'Sort',
      direction: {
        label: 'Direction',
        asc: 'Ascending',
        desc: 'Descending',
        none: 'None'
      }
    },
    summary: {
      menuText: 'Show totals',
      header: 'Totals for "{forTitle:i18n}"',
      totalRowCount: 'Total row count',
      columnSummaries: 'Column summaries'
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
  },

  USelectEntity: {
    dropdown: {
      moreButton: 'More'
    }
  },

  UAclRlsInput: {
    access: 'Access',
    add: 'Add',
    table: {
      remove: 'Remove'
    },
    dialog: {
      addAccess: 'Give access to such entries:',
      entity: 'Entity',
      entityPlaceholder: 'Entity',
      add: 'Add'
    }
  }
})
