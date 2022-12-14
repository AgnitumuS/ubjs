require('./UBTinyMCETextArea')
const _ = require('lodash')

/**
 * Report template editor.
 */
Ext.define('UB.ux.UBReportEditor', {
  extend: 'UB.ux.UBTinyMCETextArea',
  alias: 'widget.ubreporteditor',
  /**
   * Enable UBReport template editor (visual editor for mustache tags used by report builder)
   */
  enableTemplateEditor: true,
  statics: {
    portrait: { width: 793 },
    landscape: { width: 1121 },

    paste_postprocess: function (plugin, args) {
      UB.ux.UBReportEditor.filter_node(args.node)
    },

    possibleElement: {
      node: ['table', 'thead', 'tbody', 'tr', 'td', 'img', 'div', 'p', 'hr', 'strong', 'em', 'big', 'span', 'font',
        'li', 'ul', 'ol', 'blockquote',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', '#comment', '#text'],
      inlineInnerNode: ['#comment', '#text'],
      attributes: ['style', 'data-mce-style', 'src', 'rowspan', 'colspan'],
      style: ['font-family', 'font-weight', 'font-style', 'font-size', 'text-align', 'vertical-align', 'text-indent',
        'list-style-type',
        'list-style-position',
        'background-color',
        'width', 'height',
        'border-style', 'border-top-style', 'border-bottom-style', 'border-right-style', 'border-left-style', 'border',
        'border-width', 'border-top-width', 'border-bottom-width', 'border-right-width', 'border-left-width',
        'padding', 'padding-top', 'padding-bottom', 'padding-right', 'padding-left',
        'margin', 'margin-top', 'margin-bottom', 'margin-right', 'margin-left',
        'disable-split', 'disableSplit', 'disablesplit',
        'indissoluble-first-rows', 'indissoluble-end-rows', 'draw-border-onsplit', 'top-through-line'
      ]
    },

    filter_node: function (node) {
      let resStyle = []
      let i, y, attr, style, detail, subDetail, isInline, newNode

      if (node.nodeName.toLowerCase() === 'table') {
        this.filter_table(node)
      }
      if (node.attributes) {
        for (i = node.attributes.length - 1; i >= 0; i--) {
          attr = node.attributes[i]
          if (this.possibleElement.attributes.indexOf(attr.name.toLowerCase()) < 0) {
            node.removeAttribute(attr.name)
          }
        }
        style = node.attributes.getNamedItem('style')
        if (style && style.value) {
          style = style.value.split(';')
          for (i = 0; i < style.length; i++) {
            let styleElm = style[i]
            if (styleElm) {
              let stylePair = styleElm.split(':')
              if (stylePair.length === 2 && (typeof (stylePair[0]) === 'string') &&
                (this.possibleElement.style.indexOf(stylePair[0].toLowerCase()) >= 0)
              ) {
                resStyle.push(styleElm)
              }
            }
          }
          style.value = resStyle.join(';')
        }
      }
      if (node.childNodes) {
        for (i = 0; i < node.childNodes.length; i++) {
          detail = node.childNodes[i]
          if (this.possibleElement.node.indexOf(detail.nodeName.toLowerCase()) < 0) {
            isInline = true
            if (detail.childNodes) {
              for (y = 0; y < detail.childNodes.length; y++) {
                subDetail = detail.childNodes[y].nodeName.toLowerCase()
                if (this.possibleElement.inlineInnerNode.indexOf(subDetail) < 0) {
                  isInline = false
                  break
                }
              }
            }
            newNode = document.createElement(isInline ? 'SPAN' : 'DIV')
            this.copyNodeParams(detail, newNode)
            node.replaceChild(newNode, detail)
            detail = newNode
          }
          this.filter_node(detail)
        }
      }
    },

    copyNodeParams: function (oldNode, newNode) {
      let style, styleAttr
      if (oldNode.attributes) {
        styleAttr = oldNode.attributes.getNamedItem('style')
        style = styleAttr ? styleAttr.value : null
      }
      if (style) {
        newNode.setAttribute('style', style)
      }
      newNode.innerHTML = oldNode.innerHTML
    },

    filter_table: function (table) {
      let styles = []
      let attrWidth, styleWith

      let val = table.attributes.getNamedItem('width')
      if (val) {
        attrWidth = val.value
      }
      val = table.attributes.getNamedItem('style')
      if (val) {
        styles = val.value ? val.value.split(';') : []
        _.forEach(styles, function (elm) {
          if (elm) {
            let pair = elm.split(':')
            if (pair.length === 2 && pair[0].toLowerCase() === 'width') {
              styleWith = pair[1]
              return false
            }
          }
        })
      } else {
        val = document.createAttribute('style')
        table.attributes.setNamedItem(val)
      }
      if (!styleWith) {
        styles.push('width:' + (attrWidth || '100%'))
        val.value = styles.join(';')
      }

      let tbody
      _.forEach(table.childNodes, function (child) {
        if (child.nodeName.toLowerCase() === 'tbody') {
          tbody = child
          return false
        }
      })

      if (!tbody) {
        tbody = document.createElement('TBODY')
        table.appendChild(tbody)
      }

      // this function used only for correct rowSpan and colSpan. It was copy from csHtmlToPdf.js
      this.createSpanTableMap(tbody, [], [])
    },

    /**
     *
     * @param {Object} tbody
     * @param {Array} rowSpan
     * @param {Array} colSpan
     * @returns {Object}
     */
    createSpanTableMap: function (tbody, rowSpan, colSpan) {
      let colCount = 0
      let row, q, qi, qq, i, ii, y, cCnt, len, cell, cellLast, rowCount, rowCountR, cCntR,
        cSpan, rSpan, fRow
      let calc = false

      function getAttribute (node, name, defaultValue) {
        if (!node.attributes) return defaultValue
        let val = node.attributes.getNamedItem(name)
        if (val) {
          return val.value || defaultValue
        }
        return defaultValue
      }

      function getAttributeInt (node, name) {
        return parseInt(getAttribute(node, name, 0), 10)
      }

      function updateAttributeInt (node, name, value) {
        if (!node.attributes) return

        let val = node.attributes.getNamedItem(name)
        if (val) {
          val.value = value
        } else {
          val = document.createAttribute(name)
          val.value = value
          node.attributes.setNamedItem(val)
        }
      }

      for (let p = 0; p < tbody.childNodes.length; p++) {
        rowSpan[p] = []
        colSpan[p] = []
      }
      rowCountR = 0
      // create span maps
      rowCount = tbody.childNodes.length
      for (let p = 0; p < rowCount; p++) {
        row = tbody.childNodes[p]
        if (row.nodeName.toLowerCase() !== 'tr') {
          continue
        }
        rowCountR++
        // calc cell count
        if (!calc) {
          for (q = 0; q < row.childNodes.length; q++) {
            cell = row.childNodes[q]
            if (cell.nodeName.toLowerCase() !== 'td') {
              continue
            }
            cSpan = getAttributeInt(cell, 'colspan')
            if (cSpan > 1) {
              colCount += cSpan - 1
            }
            colCount++
          }
          calc = true
        }
        cCntR = 0
        for (q = 0, qi = 0; (q < colCount); q++) {
          if (colSpan[p][q] || rowSpan[p][q]) {
            cCntR++
            continue
          }
          if (qi >= row.childNodes.length) {
            continue
          }
          cell = row.childNodes[qi]
          while (cell.nodeName.toLowerCase() !== 'td') {
            qi++
            cell = row.childNodes[qi]
          }
          cellLast = cell
          cCntR++

          cSpan = getAttributeInt(cell, 'colspan')
          rSpan = getAttributeInt(cell, 'rowspan')
          // check valid rowSpan
          if (rSpan > 1) {
            if (rSpan - 1 + p >= rowCount) {
              rSpan = (rowCount - p) || 1
              updateAttributeInt(cell, 'rowspan', rSpan)
            }
            for (ii = p + 1, i = p + 1; (i < p + rSpan) && ii < tbody.childNodes.length; ii++) {
              fRow = tbody.childNodes[ii]
              if (fRow.nodeName.toLowerCase() !== 'tr') {
                continue
              }
              len = fRow.childNodes.length
              cCnt = 0
              for (y = 0; y < len; y++) {
                if (fRow.childNodes[y].nodeName.toLowerCase() === 'td') {
                  cCnt++
                  cCnt += (getAttributeInt(fRow.childNodes[y], 'colspan') || 1) - 1
                }
              }
              len = rowSpan[i].length
              for (y = 0; y < len; y++) {
                if (rowSpan[i][y]) {
                  cCnt++
                }
              }
              if (cCnt + ((cSpan || 1) - 1) >= colCount) {
                rSpan = i - p
                updateAttributeInt(cell, 'rowspan', rSpan)
                break
              }
              i++
            }
          }
          // check valid colSpan
          if (cSpan > 1) {
            cCnt = 0
            for (i = q; i < colCount; i++) {
              if (rowSpan[p][i]) {
                continue
              }
              cCnt++
            }
            if (cSpan > cCnt) {
              cSpan = cCnt || 1
              updateAttributeInt(cell, 'colspan', cSpan)
            }
          }
          if (rSpan > 1) {
            for (let r = p + 1; r < p + rSpan; r++) {
              rowSpan[r][q] = 1
              if (cSpan > 1) {
                for (qq = q + 1; qq < q + cSpan; qq++) {
                  if (!colSpan[r]) {
                    colSpan[r] = []
                  }
                  colSpan[r][qq] = 1
                }
              }
            }
          }
          if (cSpan > 1) {
            // cCntR += cSpan - 1;
            for (qq = q + 1; qq < q + cSpan; qq++) {
              colSpan[p][qq] = 1
            }
          }
          qi++
        }
        if (cCntR < colCount) {
          updateAttributeInt(cellLast, 'colspan', colCount - cCntR + 1)
        }
      }
      return { colCount: colCount, rowCount: rowCountR }
    }

  },

  pageWidth: 793,

  /**
   * Set page orientation
   * @param {String} value possible values: portrait, landscape.
   * @returns {boolean}
   */
  setOrientation: function (value) {
    if ((value !== 'landscape') && (value !== 'portrait')) return false

    this.setWidth(value === 'landscape' ? UB.ux.UBReportEditor.landscape.width : UB.ux.UBReportEditor.portrait.width)
    this.orientation = value
    return true
  },

  initComponent: function () {
    Ext.getBody().getSize()

    this.width = UB.ux.UBReportEditor.portrait.width
    this.orientation = 'portrait'

    this.tinyMCEConfig = Ext.apply({
      convert_urls: false,
      object_resizing: 'img,table,p[class=isTopColontitle],p[class=isBottomColontitle]',
      toolbar1: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | formatselect fontsizeselect | pageOrientation | Colontitle | borderL borderR borderT borderB borderE borderA | forecolor | bullist numlist outdent indent |',
      paste_postprocess: UB.ux.UBReportEditor.paste_postprocess
      // font_formats:
    }, this.tinyMCEConfig || {})
    this.tinyMCEConfig.reportEditor = this
    this.lastFrameHeight = '100%'
    this.callParent(arguments)
    this.tinyMCEConfig.plugins.push('paste') // add ability to paste MS Word, for example
    if (this.enableTemplateEditor) {
      this.tinyMCEConfig.plugins.push('templateEditor') // add row template in ReportBuilder
    }
  },

  onStartSetup: function (ed) {
    let me = this
    ed.on('change', function () {
      me.updateSize()
    }, me)
    this.callParent(arguments)
  },

  syncEditorHeight: function () {
    this.callParent(arguments)
    this.updateSize()
  },

  updateSize: function () {
    let menuHeight = 50
    let edIframe = Ext.get(this.getInputId() + '_ifr')
    if (!this.inResizing && edIframe && edIframe.dom && edIframe.dom.contentDocument) {
      let ed = this.getEditor()
      if (ed.editorContainer && ed.contentAreaContainer) {
        menuHeight = ed.editorContainer.offsetHeight - ed.contentAreaContainer.offsetHeight + 50
      }
      this.inResizing = true
      this.setHeight(edIframe.dom.contentDocument.body.offsetHeight + menuHeight)
      this.inResizing = false
    }
  },

  setValue: function (value) {
    let me = this

    me.valuesSpecialComments = null
    if (value && typeof (value) === 'string') {
      const re = /(<!--@\w+?\s*".+?"-->)/gi
      const reOptions = /(<!--%\w+?:(.+?)-->)/gi
      let matches = value.match(re)
      if (matches && matches.length > 0) {
        me.valuesSpecialComments = matches.join('\r\n')
        value = value.replace(re, '')
      }
      // parse options
      matches = value.match(reOptions)
      if (matches && matches.length > 0) {
        _.forEach(matches, function (item) {
          let itemVal = item.match(/<!--%(\w+?:.+?)-->/)[1]
          itemVal = itemVal.split(':')
          if (itemVal[0] === 'pageOrientation') {
            me.setOrientation(itemVal[1])
          }
        })
        value = value.replace(reOptions, '')
      }
    }
    me.callParent([value])
  },

  getValue: function (sender) {
    let value = this.callParent()
    value = '<!--%pageOrientation:' + this.orientation + '-->' + value
    if (sender === 'UBDocument' && this.valuesSpecialComments) {
      value = this.valuesSpecialComments + value
    }
    return value
  },

  /* todo make right function isDirty
  isDirty : function() {
      var me = this;
      return !me.disabled && !me.isEqual(me.getValue(), me.originalValue);
  },
  */

  // for get focus in BasePanel
  isFocusableField: true,
  isFocusable: function () {
    return !this.readOnly
  }
})
