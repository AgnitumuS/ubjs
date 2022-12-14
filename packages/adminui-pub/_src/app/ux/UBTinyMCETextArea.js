require('../../ux/form/TinyMCETextArea')
/* global tinymce, Ext, $App */
/**
 * @author Igor Nozhenko
 *
 * Extends Ext.ux.form.TinyMCETextArea to show a ubDocument
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
        style: 'word-break: break-all'
      },
      browser_spellcheck: true,
      toolbar1: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect forecolor | print',
      plugins: [
        'advlist autolink lists charmap print preview hr anchor pagebreak', // link image
        'searchreplace wordcount visualblocks visualchars code ', // fullscreen
        'insertdatetime nonbreaking table contextmenu directionality', // save
        'emoticons template textcolor colorpicker image imagetools'  // paste
      ],
      contextmenu: 'link image inserttable | cell row column deletetable',
      paste_data_images: true,
      statusbar: false,
      menubar: 'edit insert view format table tools',
      toolbar_items_size: 'small',
      // image insertion
      automatic_uploads: false,
      // here we add custom filepicker only to Image dialog
      file_picker_types: 'image',
      // and here's our custom image picker
      file_picker_callback: function (cb, value, meta) {
        let input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')

        // Note: In modern browsers input[type="file"] is functional without
        // even adding it to the DOM, but that might not be the case in some older
        // or quirky browsers like IE, so you might want to add it to the DOM
        // just in case, and visually hide it. And do not forget do remove it
        // once you do not need it anymore.

        input.onchange = function () {
          let file = this.files[0]

          // Note: Now we need to register the blob in TinyMCEs image blob
          // registry. In the next release this part hopefully won't be
          // necessary, as we are looking to handle it internally.
          let reader = new window.FileReader()
          let blob = new window.Blob([file], {type: file.type})
          reader.addEventListener('loadend', function () {
            let id = 'blobid' + Date.now()
            let blobCache = tinymce.activeEditor.editorUpload.blobCache
            // MPV - we need a base64 representation to embed image to document
            let b64 = reader.result.split(',', 2)[1]
            let blobInfo = blobCache.create(id, blob, b64)
            blobCache.add(blobInfo)
            // call the callback and populate the Title field with the file name
            cb(blobInfo.blobUri(), { title: file.name })
          })
          reader.addEventListener('error', function (event) {
            throw new Error(event)
          })
          reader.readAsDataURL(blob)
        }
        input.click()
      }
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

    tinymce.baseURL = $App.connection.baseURL + 'clientRequire/tinymce'
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
