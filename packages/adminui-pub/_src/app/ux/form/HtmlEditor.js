require('../UBTinyMCETextArea')
/**
 * This control render html with the ability to edit it. Html rendered with fixed width (parameter pageWidth).
 * When html more then control space it render scroll bar. Also implemented the ability to call a full-fledged
 * editor with a turn on the full screen. When control get focus or mouse cursor fly over it in top right corner the visible button to call up the editor.
 * Example:
 *
 *      var e = Ext.widget('ubhtmleditor', {
 *            renderTo: document.body,
 *            labelAlign: 'top',
 *            height: 90,
 *      });
 *      e.setValue('your html text');
 *      // .... on save
 *      var editedHtml = e.getValue();
 */
Ext.define('UB.ux.form.HtmlEditor', {
  extend: 'UB.ux.UBTinyMCETextArea',
  alias: 'widget.ubhtmleditor',

  overflowX: 'auto',
  overflowY: 'auto',
  minHeight: 65,

  /**
   * @cfg Fixed page width.
   */
  pageWidth: 793,

  initComponent: function () {
    var me = this
    Ext.getBody().getSize()

    me.elementStyle = me.elementStyle || '' + 'width: ' + me.pageWidth + 'px;'

    me.tinyMCEConfig = Ext.apply({
      paste_postprocess: UB.ux.UBReportEditor.paste_postprocess,
      statusbar: false,
      menubar: false,
      toolbar: false,
      toolbar1: false,
      toolbar2: false,
      toolbar3: false,

      setup: me.onsetup.bind(me)
    }, me.tinyMCEConfig || {})
    me.callParent(arguments)
  },

  fieldSubTpl: [
    '<div id="{id}_editButton" style="visibility: hidden; z-index: 2; text-align: right; position: absolute; left: -10px; top: 10px;"></div>',
    '<div id="{id}_mframe" role="{role}" tabindex="0" {inputAttrTpl} style="width:100%; owerflow-x:auto; overflow-y: hidden;" >',
    '<textarea id="{id}" tabindex="0"  ',
    '<tpl if="name"> name="{name}"</tpl>',
    '<tpl if="rows"> rows="{rows}" </tpl>',
    '<tpl if="cols"> cols="{cols}" </tpl>',
    '<tpl if="placeholder"> placeholder="{placeholder}"</tpl>',
    '<tpl if="size"> size="{size}"</tpl>',
    '<tpl if="maxLength !== undefined"> maxlength="{maxLength}"</tpl>',
    '<tpl if="readOnly"> readonly="readonly"</tpl>',
    '<tpl if="disabled"> disabled="disabled"</tpl>',
    '<tpl if="tabIdx"> tabIndex="{tabIdx}"</tpl>',
    ' class="{fieldCls} {typeCls} {inputCls}" ',
    '<tpl if="fieldStyle"> style="{fieldStyle}"</tpl>',
    ' autocomplete="off">\n',
    '<tpl if="value">{[Ext.util.Format.htmlEncode(values.value)]}</tpl>',
    '</textarea>',
    '</div>',
    {
      disableFormats: true
    }
  ],

  afterRender: function () {
    var me = this
    var size = Ext.getBody().getSize()
    var input, frame, parent, height

    me.callParent(arguments)

    me.mainFrame = frame = Ext.get(me.getInputId() + '_mframe')
    me.mainFrame.dom.select = function () {}

    input = Ext.get(me.getInputId())
    input.dom.tabindex = 0
    height = input.getHeight() - 20
    if (height < me.minHeight) {
      height = me.minHeight
    }
    frame.setHeight(height)
    input.on('resize', function () {
      frame.setHeight(input.getHeight() - 20)
    })

    input.setWidth(me.pageWidth)
    input.setHeight(size.height)
    input.setStyle('owerflow-y', 'hidden')
    input.setStyle('owerflow-x', 'hidden')

    me.editBtn = Ext.get(me.getInputId() + '_editButton')
    me.editBtn.dom.style.position = 'relative'
    me.editBtn.dom.style.height = '0px'

    me.initContextMenu()

    parent = frame.parent()
    parent.on('mouseover', function () {
      if (!me.editBtn.isVisible() && !me.readOnly) {
        me.editBtnCtrl.hide()
        me.editBtn.hide()
        me.editBtn.show()
        me.editBtnCtrl.show()
      }
    })
    parent.on('mouseleave', function () {
      if (!me.hasInputFocus) {
        me.editBtn.hide()
      }
    })

    me.on('focus', function () {
      if (me.readOnly) {
        return
      }
      me.editBtnCtrl.hide()
      me.hasInputFocus = true
      me.editBtn.hide()
      me.editBtn.show()
      me.editBtnCtrl.show()
    }, me)
    me.on('blur', function () {
      me.hasInputFocus = false
      Ext.defer(function () {
        me.editBtn.hide()
      }, 100)
    }, me)
  },

  // for get focus in BasePanel
  getFocusEl: function () {
    return this.iframe
  },

  initEditor: function () {
    var me = this
    me.callParent(arguments)
  },

  onsetup: function (ed) {
    var me = this
    var size = Ext.getBody().getSize()
    var ifr
    ed.on('init', function () {
      me.iframe = ifr = Ext.get(me.getInputId() + '_ifr')
      me.iframe.dom.tabindex = 0
      me.iframe.dom.select = function () {}
      ifr.setWidth(me.pageWidth)
      ifr.setHeight(size.height)
    })
  },

  getSubTplMarkup: function () {
    var me = this
    return me.callParent(arguments)
  },

  editContent: function () {
    var me = this
    var size = Ext.getBody().getSize()
    var editorWnd, pnl

    function showInPDF (blobUrl) {
      var adobePdfPanel, form, pObj

      adobePdfPanel = Ext.widget('panel', {
        border: true,
        flex: 1
      })

      form = Ext.create('UB.view.BaseWindow', {
        title: 'PDF',
        width: 800,
        height: 600,
        modal: true,
        layout: {
          type: 'vbox',
          align: 'stretch'
        },
        items: [
          adobePdfPanel
        ]
      })

      pObj = Ext.create('UB.ux.UBObject')
      pObj.setXSize({
        width: '100%',
        height: '100%'
      })
      adobePdfPanel.add(pObj)
      pObj.setSrc({
        url: blobUrl,
        contentType: 'application/pdf'
      })
      form.show()
    }

    function makePDF (htmlText) {
      SystemJS.import('@unitybase/pdf').then((PDF) => {
        return PDF.PrintToPdf.requireFonts({
          fonts: [
            { fontName: 'TimesNewRoman', fontStyle: 'Normal' },
            { fontName: 'TimesNewRoman', fontStyle: 'Bold' },
            { fontName: 'TimesNewRoman', fontStyle: 'Italic' },
            { fontName: 'TimesNewRoman', fontStyle: 'BoldItalic' }
          ]
        }).then(() => PDF)
      }).then((PDF) => {
        let pdfConfig = {
          font: { name: 'TimesNewRoman', size: 10, type: 'Normal' },
          margin: { top: 11, right: 8, bottom: 8, left: 20 },
          bottomColontitle: {
            height: 8,
            font: { size: 7, wide: 0 }
          },
          listeners: {
            initColontitle: function (obj, result) {
              if (!result.colontitle.isTop) {
                result.align = PDF.PrintToPdf.alignType.center
                result.text = ' page ' + result.pageNumber + ' of ' + result.totalPages
              } else {
                result.align = PDF.PrintToPdf.alignType.center
                result.text = 'test report - page ' + result.pageNumber + ' of ' + result.totalPages
              }
            }
          }
        }
        let pdf = new PDF.PrintToPdf(pdfConfig)
        pdf.writeHtml({
          html: htmlText
        })
        showInPDF(pdf.output('blobUrl'))
      })
    }

    editorWnd = Ext.create('UB.view.BaseWindow', {
      title: UB.i18n('Edit'),
      modal: true,
      maximizable: true,
      maximized: false,
      width: size.width,
      height: size.height,
      style: {
        background: '#959596'
      },
      overflowX: 'auto',
      overflowY: 'auto',
      stateful: true,
      stateId: 'HtmlEditorForm',
      // layout: { type: 'fit', align: 'stretch' },
      layout: { type: 'hbox', pack: 'center', align: 'stretch' },
      items: [
        pnl = Ext.create('UB.ux.UBTinyMCETextArea', {
          // flex: 1,
          width: me.pageWidth,
          tinyMCEConfig: me.tinyMCEEditorConfig,
          value: me.getRawValue()
        })
      ],
      buttons: [
        {
          //disabled: !window.PDF,
          text: UB.i18n('preViewInPDF'),
          handler: function () {
            makePDF(pnl.getValue())
          }
        }, {
          xtype: 'panel',
          flex: 1
        }, {
          text: UB.i18n('Change'),
          iconCls: 'u-icon-save',
          handler: function () {
            var result = pnl.getValue()
            me.setValue(result)
            editorWnd.close()
          }
        }, {
          text: UB.i18n('cancel'),
          iconCls: 'u-icon-close',
          handler: function () {
            editorWnd.close()
          }
        }
      ],
      listeners: {
        afterrender: function () {
          // me.tinyMCEConfig.selector = '#' + pnl.getEl().id;
          // me.initEditor();
        },
        beforeclose: function () {
          // var result = pnl.getValue();
          // me.setValue(result);

        }
      }
    })
    editorWnd.show()
    pnl.updateLayout()
  },

  initContextMenu: function () {
    var me = this
    me.editBtnCtrl = Ext.create('Ext.Button', {
      renderTo: me.editBtn,
      cls: 'ub-btn-flat ub-btn-rounded',
      tooltip: UB.i18n('Edit'),
      focusOnToFront: false,
      style: 'z-index: 3;',
      iconCls: 'u-icon-edit', // faEdit,
      handler: me.editContent,
      scope: me
    })
  },

  // for get focus in BasePanel
  isFocusableField: true,

  isFocusable: function () {
    return !this.readOnly
  },

  setValue: function () {
    var me = this
    me.callParent(arguments)
  }
})
