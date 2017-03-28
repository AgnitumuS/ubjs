require('./UBTinyMCETextArea')
const _ = require('lodash')

/* global tinymce */
/**
 * Report template editor.
 */
Ext.define('UB.ux.UBReportEditor', {
  extend: 'UB.ux.UBTinyMCETextArea',
  alias: 'widget.ubreporteditor',

  statics: {
    portrait: {width: 793},
    landscape: {width: 1121},

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
      let me = this
      let resStyle = []
      let i, y, attr, style, styleElm, stylePair, detail, subDetail, isInline, newNode

      if (node.nodeName.toLowerCase() === 'table') {
        me.filter_table(node)
      }
      if (node.attributes) {
        for (i = node.attributes.length - 1; i >= 0; i--) {
          attr = node.attributes[i]
          if (me.possibleElement.attributes.indexOf(attr.name.toLowerCase()) < 0) {
            node.removeAttribute(attr.name)
          }
        }
        style = node.attributes.getNamedItem('style')
        if (style && style.value) {
          style = style.value.split(';')
          for (i = 0; i < style.length; i++) {
            styleElm = style[i]
            if (styleElm) {
              stylePair = styleElm.split(':')
            }
            if (stylePair.length === 2 && (typeof (stylePair[0]) === 'string') &&
              (me.possibleElement.style.indexOf(stylePair[0].toLowerCase()) >= 0)
            ) {
              resStyle.push(styleElm)
            }
          }
          style.value = resStyle.join(';')
        }
      }
      if (node.childNodes) {
        for (i = 0; i < node.childNodes.length; i++) {
          detail = node.childNodes[i]
          if (me.possibleElement.node.indexOf(detail.nodeName.toLowerCase()) < 0) {
            isInline = true
            if (detail.childNodes) {
              for (y = 0; y < detail.childNodes.length; y++) {
                subDetail = detail.childNodes[y].nodeName.toLowerCase()
                if (me.possibleElement.inlineInnerNode.indexOf(subDetail) < 0) {
                  isInline = false
                  break
                }
              }
            }
            newNode = document.createElement(isInline ? 'SPAN' : 'DIV')
            me.copyNodeParams(detail, newNode)
            node.replaceChild(newNode, detail)
            detail = newNode
          }
          me.filter_node(detail)
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
      var tbody, attrWidth, styleWith

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
      var row, q, qi, qq, i, ii, y, cCnt, len, cell, cellLast, rowCount, rowCountR, cCntR,
        cSpan, rSpan, calc = false, fRow

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

          cSpan = getAttributeInt(cell, 'colspan', 0)
          rSpan = getAttributeInt(cell, 'rowspan', 0)
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
            for (var r = p + 1; r < p + rSpan; r++) {
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
      return {colCount: colCount, rowCount: rowCountR}
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
    var me = this

    Ext.getBody().getSize()

    me.width = UB.ux.UBReportEditor.portrait.width
    me.orientation = 'portrait'

    me.tinyMCEConfig = Ext.apply({
      convert_urls: false,
      object_resizing: 'img,table,p[class=isTopColontitle],p[class=isBottomColontitle]',
      plugins: [
        'advlist autolink lists charmap print preview hr anchor pagebreak', // link image
        'searchreplace wordcount visualblocks visualchars code ', // fullscreen
        'insertdatetime nonbreaking table contextmenu directionality', // save
        'emoticons template textcolor colorpicker image imagetools paste'  // templateEditor paste
      ],
      toolbar1: 'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | formatselect fontsizeselect | pageOrientation | Colontitle | borderL borderR borderT borderB borderE borderA | forecolor | bullist numlist outdent indent |',
      contextmenu: 'link image inserttable | cell row column deletetable | rowTemplate',
      paste_data_images: true,
      paste_postprocess: UB.ux.UBReportEditor.paste_postprocess,
      statusbar: false,
      menubar: 'edit insert view format table tools',
      toolbar_items_size: 'small',
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
            let id = 'blobid' + (new Date()).getTime()
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
    }, me.tinyMCEEditorConfig || {})

    me.tinyMCEConfig.reportEditor = me
    me.lastFrameHeight = '100%'
    me.callParent(arguments)
  },

  onStartSetup: function (ed) {
    let me = this
    ed.on('change', function (e) {
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
    var me = this, matches, re = /(<!--@\w+?\s*".+?"-->)/gi,
      reOptions = /(<!--%\w+?:(.+?)-->)/gi
    me.valuesSpecialComments = null
    if (value && typeof (value) === 'string') {
      matches = value.match(re)
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
