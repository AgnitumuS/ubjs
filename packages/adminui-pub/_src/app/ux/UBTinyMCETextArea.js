/* global tinymce */
// @require ..\..\ux\form\TinyMCETextArea.js
/**
 * Файл: UB.ux.UBTinyMCETextArea.js
 * Автор: Игорь Ноженко
 *
 * Расширение Ext.ux.form.TinyMCETextArea для конфигурации TinyMCE и отображения документов
 */
Ext.define('UB.ux.UBTinyMCETextArea', {
  extend: 'Ext.ux.form.TinyMCETextArea',
  alias: 'widget.ubtinymcetextarea',

  requires: ['Ext.ux.form.TinyMCETextArea'],

  initComponent: function () {
    var me = this
    if (me.tinyMCEConfig) {
      me.userSetup = me.tinyMCEConfig.setup
    }
    tinyMCE.baseURL = $App.connection.baseURL + 'clientRequire/tinymce/'
    me.tinyMCEConfig = Ext.apply({
          // language: UB.core.UBApp.getUiLanguage(),
      language_url: $App.connection.baseURL + 'models/adminui-pub/locale/tinymce/' + $App.connection.userLang() + '.js',
      skin_url: $App.connection.baseURL + 'clientRequire/tinymce/skins/lightgray/',
      table_default_attributes: {
        cellpadding: '3px',
        cellspacing: '0',
        border: '1px',
        width: me.pageWidth && me.pageWidth > 20 ? me.pageWidth - 20 : 20,
        style: { wordBreak: 'break-all'}
      },
      browser_spellcheck: true,
            /*
            plugins: [
                //"autosave layer noneditable",
                //disabled - " media"
                "advlist autolink lists link image charmap print preview hr anchor pagebreak",
                "searchreplace wordcount visualblocks visualchars code fullscreen",
                "insertdatetime nonbreaking save table contextmenu directionality",
                "emoticons template paste textcolor"
            ],
            */
      toolbar1: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | styleselect formatselect fontselect fontsizeselect | print',

      plugins: [
                // "autosave layer noneditable",
                // disabled - " media"
        'advlist autolink lists charmap print preview hr anchor pagebreak', // link image
        'searchreplace wordcount visualblocks visualchars code ', // fullscreen
        'insertdatetime nonbreaking table contextmenu directionality', // save
        'emoticons template textcolor image'  // paste
      ],
      contextmenu: 'link image inserttable | cell row column deletetable',
      paste_data_images: true,

            // content_css : "contents.css",
      statusbar: false,
      menubar: 'edit insert view format table tools',
            // menubar: true,
            /*
            menu : {
                //file   : {title : 'File'  , items : 'newdocument'},
                edit   : {title : 'Edit'  , items : 'undo redo | cut copy paste pastetext | selectall'},
                insert : {title : 'Insert', items : 'link media | template hr'},
                view   : {title : 'View'  , items : 'visualaid'},
                format : {title : 'Format', items : 'bold italic underline strikethrough superscript subscript | formats | removeformat'},
                table  : {title : 'Table' , items : 'inserttable tableprops deletetable | cell row column'},
                tools  : {title : 'Tools' , items : 'spellchecker code'}
            }, */
      toolbar_items_size: 'small',
      setup: me.onStartSetup.bind(me)
    }, me.tinyMCEConfig)
        // me.tinyMCEConfig.document_base_url = $App.connection.serverUrl + 'jslibs/tinymce/';
        // me.tinyMCEConfig.relative_urls = true;

    me.tinyMCEConfig.setup = me.onStartSetup.bind(me)

        /**
         * @event setOriginalValue
         * @param {String} originalValue
         * @param {Object} self
         * fire when initialize original value
         */
    me.addEvents('setup', 'setOriginalValue')

    this.callParent(arguments)
  },

  afterRender: function () {
    var me = this

    me.callParent(arguments)
    if (!me.wysiwygIntialized) {
      me.updateLayout()
    }
  },

  onStartSetup: function (ed) {
    var me = this
        // ed.baseURI = $App.connection.serverUrl + 'jslibs/tinymce1/';
    this.fireEvent('setup', ed)
    if (this.userSetup) {
      this.userSetup(ed)
    }
        // todo Update layout when frame ready. Perhaps there is a better solution.
    ed.on('init', function (e) {
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

    /*
    syncEditorHeight: function (height) {
        var me = this, input;

        me.lastHeight = height;

        if (!me.wysiwygIntialized || !me.rendered) { return; }

        var ed = tinymce.get(me.getInputId());

        // if the editor is hidden, we do not syncronize
        // because the size values of the hidden editor
        // are calculated wrong.

        if (ed.isHidden()) { return; }

        input =  Ext.get(me.getInputId());

        var edIframe = Ext.get(me.getInputId() + "_ifr");
        var parent;
        if (edIframe){
           parent = edIframe.up(".mce-edit-area");
        }
        if (parent){
           parent = parent.up(".mce-container-body");
        }

        var newHeight = height;

        if (parent) {
            var edToolbar = parent.down(".mce-toolbar-grp");
            if(edToolbar){
                newHeight -= edToolbar.getHeight();
            }

            var edMenubar = parent.down(".mce-menubar");
            if(edMenubar){
                newHeight -= edMenubar.getHeight();
            }

            var edStatusbar = parent.down(".mce-statusbar");
            if(edStatusbar){
                newHeight -= edStatusbar.getHeight();
            }
        }

        me.lastFrameHeight = newHeight - 3;

        if (edIframe){
           edIframe.setHeight(newHeight - 3);
        } else {
            input.setHeight(newHeight - 3);
        }

        return newHeight - 3;
    },
    */

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
    var me = this,
      blobData = cfg.blobData,
      resetOriginalValue = cfg.resetOriginalValue

    function onDataReady (response) {
      me.suspendCheckChange = true
      me.setValue(response)
      if (resetOriginalValue) {
        me.resetOriginalValue()
        me.fireEvent('setOriginalValue', response, me)
      }
      me.suspendCheckChange = false
      return response
    }

    if (blobData) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
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
        .then((response) => onDataReady(response))
    } else {
      return Promise.resolve(onDataReady(cfg.rawValue))
    }
  }
})
