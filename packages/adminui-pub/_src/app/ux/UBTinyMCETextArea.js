require('../../ux/form/TinyMCETextArea')
/* global tinymce */
/**
 * Файл: UB.ux.UBTinyMCETextArea.js
 * Автор: Игорь Ноженко
 *
 * Расширение Ext.ux.form.TinyMCETextArea для конфигурации TinyMCE и отображения документов
 */
Ext.define('UB.ux.UBTinyMCETextArea', {
  extend: 'Ext.ux.form.TinyMCETextArea',
  alias: 'widget.ubtinymcetextarea',

  initComponent: function () {
    if (this.tinyMCEConfig) {
      this.userSetup = this.tinyMCEConfig.setup
    }
    this.ensureTinyMCELoaded()
    // tinyMCE.baseURL = $App.connection.baseURL + 'clientRequire/tinymce/'
    this.tinyMCEConfig = Ext.apply({
      language_url: $App.connection.baseURL + 'models/adminui-pub/locale/tinymce/' + $App.connection.userLang() + '.js',
      // skin_url: $App.connection.baseURL + 'clientRequire/tinymce/skins/lightgray/',
      table_default_attributes: {
        cellpadding: '3px',
        cellspacing: '0',
        border: '1px',
        width: this.pageWidth && this.pageWidth > 20 ? this.pageWidth - 20 : 20,
        style: {wordBreak: 'break-all'}
      },
      browser_spellcheck: true,
      toolbar1: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect | print',
      plugins: [
        'advlist autolink lists charmap print preview hr anchor pagebreak', // link image
        'searchreplace wordcount visualblocks visualchars code ', // fullscreen
        'insertdatetime nonbreaking table contextmenu directionality', // save
        'emoticons template textcolor image'  // paste
      ],
      contextmenu: 'link image inserttable | cell row column deletetable',
      paste_data_images: true,
      statusbar: false,
      menubar: 'edit insert view format table tools',
      toolbar_items_size: 'small',
      setup: this.onStartSetup.bind(this)
    }, this.tinyMCEConfig)

    this.tinyMCEConfig.setup = this.onStartSetup.bind(this)

    /**
     * @event setOriginalValue
     * @param {String} originalValue
     * @param {Object} self
     * fire when initialize original value
     */
    this.addEvents('setup', 'setOriginalValue')

    this.callParent(arguments)
  },

  afterRender: function () {
    this.callParent(arguments)
    if (!this.wysiwygIntialized) {
      this.updateLayout()
    }
  },

  onStartSetup: function (ed) {
    let me = this

    tinymce.baseURL = $App.connection.baseURL + 'clientRequire/tinymce/'
    this.fireEvent('setup', ed)
    if (this.userSetup) {
      this.userSetup(ed)
    }
    // todo Update layout when frame ready. Perhaps there is a better solution.
    ed.on('init', function () {
      if (me.ownerLayout) {
        me.ownerLayout.onContentChange()
      }
    })
  },

  // for get focus in BasePanel
  isFocusableField: true,
  isFocusable: function () {
    return !this.readOnly
  },

  /**
   *
   * @param {Object} cfg
   * @param {Blob|File} [cfg.blobData]
   * @param {String} [cfg.rawValue]
   * @param {Boolean} [cfg.resetOriginalValue=true] Reset original value if true.
   * @param {Object} [cfg.params] The parameters necessary to obtain the document
   * @returns {Promise}
   */
  setSrc: function (cfg) {
    let me = this

    function onDataReady (response) {
      me.suspendCheckChange = true
      me.setValue(response)
      if (cfg.resetOriginalValue) {
        me.resetOriginalValue()
        me.fireEvent('setOriginalValue', response, me)
      }
      me.suspendCheckChange = false
      return response
    }

    let blobData = cfg.blobData
    if (blobData) {
      return new Promise((resolve, reject) => {
        let reader = new window.FileReader()
        reader.addEventListener('loadend', function () {
          resolve(onDataReady(reader.result))
        })
        reader.addEventListener('error', function () {
          reject(onDataReady(reader.error))
        })
        reader.readAsText(blobData)
      })
    } else if (cfg.params) {
      return UB.core.UBService.getDocument(cfg.params)
        .then(function (response) {
          return onDataReady(response)
        })
    } else {
      return Promise.resolve(onDataReady(cfg.rawValue))
    }
  }
})
