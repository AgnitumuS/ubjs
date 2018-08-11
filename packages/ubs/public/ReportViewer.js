require('./UBReport')
const baseRepCSS = `body {
    background-color: #FFFFFF;
    color: #000000;
    font-family: Verdana, Arial, Helvetica, sans-serif;
    font-size: 14px;
    line-height: 1.3;
}
.word-wrap {
    word-wrap: break-word;
    hyphens: auto
}
td,th {
    font-family: Verdana,Arial,Helvetica,sans-serif;
    font-size: 14px
}
.mce-pagebreak {
    cursor: default;
    display: block;
    border: 0;
    width: 100%;
    height: 5px;
    border: 1px dashed #666;
    margin-top: 15px;
    page-break-before: always
}
@media print {
    .mce-pagebreak {
        border: 0
    }
}`
const tableResizeCSS = '@media screen{th { resize: both; overflow: auto; }}'
const printRepCSS = '@page{margin: 0mm;}' // this affects the margin in the printer settings
const repCSS = baseRepCSS + tableResizeCSS + printRepCSS

/**
 * Inject CSS o the documnet
 * @param doc
 * @param cssText
 */
function addStyleSheet (doc, cssText) {
  let head = doc.getElementsByTagName('head')[0]
  let styleEl = doc.createElement('style')
  styleEl.setAttribute('type', 'text/css')
  try {
    styleEl.appendChild(doc.createTextNode(cssText))
  } catch (e) {
    styleEl.cssText = cssText
  }
  head.appendChild(styleEl)
}

/**
 * Displays a report.
 * Example:
 *
 *    report = Ext.create('UBS.UBReport', {
 *      code: 'test',
 *      type: 'pdf',
 *      params: {userName: 'Helen'}
 *    });
 *    report.init().then(function(){
 *      var viewer = Ext.create('UBS.ReportViewer', {
 *        renderTo: Ext.getBody(),
 *        report: report
 *      });
 *    });
 *
 */
Ext.define('UBS.ReportViewer', {
  extend: 'Ext.form.Panel',
  layout: {type: 'vbox', align: 'stretch'},
  width: 700,
  height: 500,

  /**
   * @cfg {UBS.UBReport} report
   */
  initComponent: function () {
    var me = this, container, control

    if (me.report && !me.reportType) {
      me.reportType = me.report.reportType
    }

    if (!me.reportType) {
      throw new Error('config parameter reportType is undefined')
    }
    switch (me.reportType) {
      case 'pdf':
        control = container = Ext.create('UB.ux.PDFComponent', {
          flex: 1
        })
        break
      case 'html':
        control = Ext.create('Ext.Component', {
          flex: 1,
          margin: 0,
          autoEl: {
            tag: 'iframe'
          }
        })
        container = Ext.create('Ext.panel.Panel', {
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          flex: 1,
          items: [
            control,
            {
              padding: '2 0 2 0',
              layout: {
                type: 'hbox'
              },
              items: [
                {
                  flex: 1
                }, {
                  xtype: 'button',
                  ui: 'default-toolbar',
                  text: UB.i18n('Print'),
                  handler: function () {
                    let iFrame = me.reportControl.getEl().dom
                    iFrame.contentWindow.print()
                  }
                }]
            }]
        })
        break
      default:
        throw new Error('Unknown value ' + me.reportType + ' for reportType.')
    }
    me.items = [
      container
    ]
    me.reportControl = control

    me.report.init().then(function () {
      if (me.report.onParamPanelConfig) {
        let onParamForm = me.report.onParamPanelConfig()
        if (onParamForm) {
          me.addParamForm(onParamForm)
        }
        return true
      } else {
        return false
      }
    }).then(function (paramsFormRequired) {
      if (paramsFormRequired) return false // user enter params and press "show report" on params form

      return me.report.makeReport()
    }).done(function (data) {
      if (data && data.reportData) {
        me.showReport(data.reportData)
      }
      if (me.getEl()) {
        me.getEl().unmask()
      }
      me.reportDone = true
    })
    me.callParent(arguments)
  },

  /**
   *
   * @param {UBS.ReportParamForm|Array} paramForm
   */
  addParamForm: function (paramForm) {
    var me = this, prmCfg
    if (paramForm instanceof Array) {
      prmCfg = paramForm
      paramForm = Ext.create('UBS.ReportParamForm', {
        items: paramForm,
        getParameters: function (owner) {
          var result = {}, frm = owner.getForm()
          _.forEach(prmCfg, function (item) {
            result[item.name] = frm.findField(item.name).getValue()
          })
          return result
        }
      })
    }
    me.insert(0, paramForm)
    paramForm.on('buildReport', function (param, form) {
      me.getEl().mask(UB.i18n('pleaseWait'))
      me.report.makeReport(param).done(function (data) {
        me.showReport(data.reportData)
      })
    })
  },

  showReport: function (data) {
    var me = this
    switch (me.reportType) {
      case 'pdf':
        if (typeof (data) === 'string') {
          var pdfLength = data.length
          var pdfArray = new Uint8Array(new ArrayBuffer(pdfLength))

          for (let i = 0; i < pdfLength; i++) {
            pdfArray[i] = data.charCodeAt(i)
          }

          data = new Blob([pdfArray], { type: 'application/pdf' })
        } else if ((typeof (data) === 'object') && (data instanceof ArrayBuffer)) {
          data = new Blob([data], { type: 'application/pdf' })
        }

        me.reportControl.setSrc({ blobData: data })
        break
      case 'html':
        let iFrame = me.reportControl.getEl().dom
        let iFrameDoc = iFrame.contentDocument
        iFrameDoc.body.innerHTML = data
        addStyleSheet(iFrameDoc, repCSS)
        let orientation = me.report.reportOptions.pageOrientation
        if (orientation === 'landscape') {
          addStyleSheet(iFrameDoc, '@page{size: landscape;}')
        } else if (orientation === 'portrait') {
          addStyleSheet(iFrameDoc, '@page{size: portrait;}')
        }
        if (me.report.onReportClick) { // add onclick handler for all <a href="">
          var refs = iFrameDoc.getElementsByTagName('a')
          for (let i = 0, L = refs.length; i < L; i++) {
            refs[i].addEventListener('click', me.report.onReportClick, true)
          }
        }

        // me.reportControl.setValue(data)
        // let ed = me.reportControl.getEditor()
        // if (ed && ed.dom) {
        //   if (me.reportControl.orientation === 'landscape') {
        //     ed.dom.loadCSS('/models/adminui-pub/css/print-landscape.css')
        //   } else if (me.reportControl.orientation === 'portrait') {
        //     ed.dom.loadCSS('/models/adminui-pub/css/print-portrait.css')
        //   }
        // } else {
        //   me.reportControl.on('setup', function (editor) {
        //     editor.on('init', function () {
        //       if (me.reportControl.orientation === 'landscape') {
        //         editor.dom.loadCSS('/models/adminui-pub/css/print-landscape.css')
        //       } else if (me.reportControl.orientation === 'portrait') {
        //         editor.dom.loadCSS('/models/adminui-pub/css/print-portrait.css')
        //       }
        //     })
        //   }, me, {single: true})
        // }
        // me.reportControl.show()
        break
    }
    if (me.getEl()) {
      me.getEl().unmask()
    }
  },

  afterRender: function () {
    this.callParent()
    if (!this.reportDone) {
      this.getEl().mask(UB.i18n('pleaseWait'))
    }
  }
})
