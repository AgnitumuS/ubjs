/* global Ext, Blob */
require('./UBReport')
const UB = require('@unitybase/ub-pub')
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
    a {
      text-decoration: none
    }
    @page { margin: 1cm; }
    #Header, #Footer { display: none !important; }
}`
const tableResizeCSS = '@media screen{th { resize: both; overflow: auto; }}'
const repCSS = baseRepCSS + tableResizeCSS
const HTML_PAGEBREAK_RE = new RegExp('<!-- pagebreak -->', 'gi')
const HTML_PAGEBREAK_EL = '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="mce-pagebreak"/>'

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
 *      allowExcelExport: true,
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
  reportCSSAdded: false,
  paramForm: null,

  /**
   * @cfg {UBS.UBReport} report
   */
  initComponent: function () {
    let me = this

    if (me.report && !me.reportType) {
      me.reportType = me.report.reportType
    }

    if (!me.reportType) {
      throw new Error('config parameter reportType is undefined')
    }
    let container, control
    let excelBtn = null
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
        if (me.report.allowExportToExcel) {
          excelBtn = {
            xtype: 'button',
            ui: 'default-toolbar',
            text: UB.i18n('Excel'),
            handler: function () {
              me.exportToXLSX()
            }
          }
        }
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
                }, excelBtn]
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
      if (paramsFormRequired) {
        let paramsPassed = me.report.incomeParams && (Object.keys(me.report.incomeParams).length !== 0)
        if (!paramsPassed) return false // user enter params and press "show report" on params form
        let paramForm = me.down('reportparamform')
        paramForm.collapse(Ext.Component.DIRECTION_TOP, false)
      }

      return me.report.makeReport(me.report.incomeParams)
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

  exportToXLSX: function () {
    let me = this
    let repParams
    // do we need to get parameters from parameters enter form?
    if (me.paramForm && (!me.report.incomeParams || (Object.keys(me.report.incomeParams).length === 0))) {
      if (!me.paramForm.isValid()) {
        $App.dialogInfo('reportParamsRequired')
        return
      }
      repParams = me.paramForm.getParameters(me.paramForm)
    } else {
      repParams = me.report.incomeParams
    }
    Ext.create('UBS.UBReport', {
      code: me.report.reportCode,
      type: 'xlsx',
      params: repParams,
      language: $App.connection.userLang()
    }).makeReport().then(function (data) {
      let blobData = new Blob(
        [data.reportData],
        {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}
      )
      window.saveAs(blobData, me.report.reportCode + '.xlsx')
    })
  },

  /**
   * @param {UBS.ReportParamForm|Array} paramForm
   */
  addParamForm: function (paramForm) {
    var me = this
    if (paramForm instanceof Array) {
      let prmCfg = paramForm
      paramForm = Ext.create('UBS.ReportParamForm', {
        items: paramForm,
        getParameters: function (owner) {
          let result = {}
          let frm = owner.getForm()
          _.forEach(prmCfg, function (item) {
            result[item.name] = frm.findField(item.name).getValue()
          })
          return result
        }
      })
    }
    me.paramForm = paramForm
    me.insert(0, paramForm)
    paramForm.on('buildReport', function (param, form) {
      me.getEl().mask(UB.i18n('pleaseWait'))
      me.report.makeReport(param).done(function (data) {
        me.showReport(data.reportData)
      })
    })
  },

  showReport: function (data) {
    let me = this
    switch (me.reportType) {
      case 'pdf':
        if (typeof (data) === 'string') {
          let pdfLength = data.length
          let pdfArray = new Uint8Array(new ArrayBuffer(pdfLength))

          for (let i = 0; i < pdfLength; i++) {
            pdfArray[i] = data.charCodeAt(i)
          }

          data = new Blob([pdfArray], { type: 'application/pdf' })
        } else if ((typeof (data) === 'object') && (data instanceof ArrayBuffer)) {
          data = new Blob([data], { type: 'application/pdf' })
        }

        me.reportControl.setSrc({blobData: data})
        break
      case 'html':
        let iFrame = me.reportControl.getEl().dom
        let iFrameDoc = iFrame.contentDocument
        iFrameDoc.body.innerHTML = data.replace(HTML_PAGEBREAK_RE, HTML_PAGEBREAK_EL)
        if (!me.reportCSSAdded) {
          addStyleSheet(iFrameDoc, repCSS)
          let orientation = me.report.reportOptions.pageOrientation
          if (orientation === 'landscape') {
            addStyleSheet(iFrameDoc, '@page{size: landscape;}')
          } else if (orientation === 'portrait') {
            addStyleSheet(iFrameDoc, '@page{size: portrait;}')
          }
          me.reportCSSAdded = true
        }
        if (me.report.onReportClick) { // add onclick handler for all <a href="">
          let refs = iFrameDoc.getElementsByTagName('a')
          for (let i = 0, L = refs.length; i < L; i++) {
            refs[i].addEventListener('click', me.report.onReportClick, true)
          }
        }
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
