const mxLoader = require('../../ux/form/mxGraph.js')

/**
 * Organization Chart Diagram
 */
Ext.define('UB.ux.UBOrgChart', {
  extend: 'Ext.Panel',
  alias: 'widget.UBOrgChart',
  width: '100%',
  height: '100%',
  layout: 'fit',

  loadData: function (collback) {
    var me = this
    this.xmInitPromise.then(() => {
      var basepanel, diagramId
      basepanel = me.up('basepanel')
      if (basepanel && basepanel.record) {
        // me.rootElementID = basepanel.record.get('orgunitID');
        diagramId = basepanel.record.get('ID')
      }
      if (diagramId) {
        me.loadBy('org_diagram', ['ID', 'orgunitID'], 'ID', diagramId, function (store) {
          if (store.getCount() > 0) {
            me.rootElementID = store.getAt(0).get('orgunitID')
          }
          if (me.rootElementID) {
            me.loadBy('org_unit', ['ID', 'mi_treePath'], 'ID', me.rootElementID, function (store) {
              if (store.getCount() > 0) {
                me.rootTreePath = store.getAt(0).get('mi_treePath')
              }
              me.doLoadData(collback)
            })
          } else {
            me.doLoadData(collback)
          }
        })
      }
    })
  },

  doLoadData: function (collback) {
    let me = this
    let query = UB.Repository('org_unit')
      .attrs(['ID', 'parentID', 'code', 'caption', 'unitType', 'mi_treePath'])
      .orderBy('mi_treePath')

    if (me.rootTreePath) { // rootElementID
      query = query.where('[mi_treePath]', 'startWith', me.rootTreePath)
    }

    query.selectAsStore().then(
      (store) => {
        me.makeTree(store)
        collback.call(me)
      }
    )
  },

  treeData: [],

  makeTree: function (store) {
    var me = this, data = {}, id, parentID, parentEl, idEl, assignF

    me.treeData = []

    assignF = function (row, obj) {
      obj.ID = row.get('ID')
      obj.parentID = row.get('parentID')
      obj.caption = row.get('caption')
      obj.code = row.get('code')
      obj.unitType = row.get('unitType')
    }

    store.each(function (row) {
      id = row.get('ID')
      parentID = row.get('parentID')
      idEl = data[id]
      if (!idEl) {
        idEl = data[id] = {child: []}
      }
      assignF(row, idEl)
      if (me.rootElementID && me.rootElementID === id) {
        parentID = null
        idEl.parentID = null
      }

      if (parentID) {
        parentEl = data[parentID]
        if (!parentEl) {
          parentEl = data[parentID] = {child: []}
        }
        parentEl.child.push(idEl)
      } else {
        me.treeData.push(idEl)
      }
    }, me)
    me.allData = data
  },

  showElement: function (parentCell, element, pt) {
    var me = this, cell
    cell = me.addChild(me.graph, parentCell, element, true, pt)
    return cell
  },

  showChild: function (parentCell, element, expandChild, deep, level) {
    var me = this, cell, model
    if (!expandChild) {
      model = me.graph.getModel()
      model.beginUpdate()
    }
    try {
      Ext.Array.each(element.child, function (item, index) {
        cell = me.showElement(parentCell, item)
        if (expandChild && (!deep || (deep > level))) {
          me.showChild(cell, item, deep, level + 1)
        }
        /*
         if (index > 2){
         return false;
         } */
      }, me)
    } finally {
      if (!expandChild) {
        model.endUpdate()
      }
    }
  },

  defaultLayout: 'V', // vertical

  showTree: function () {
    var me = this, cell, model = me.graph.getModel(),
      deep = 1, level = 1, expandChild = true

    if (me.treeData.length === 1) {
      me.addChild(me.graph, null, me.treeData[0])
    } else {
      me.initRoot(me.treeData)
    }

    model.beginUpdate()
    try {
      if (me.treeData.length === 1) {
        me.showChild(me.rootVarex, expandChild, true, deep + 1, level)
      } else {
        Ext.Array.each(me.treeData, function (item, index) {
          cell = me.showElement(me.rootVarex, item)
          if (expandChild && (!deep || (deep > level))) {
            me.showChild(cell, expandChild, true, deep, level)
          }
          /*
           if (index > 2){
           return false;
           }
           */
        }, me)
      }
    } finally {
      model.endUpdate()
    }
    // me.horisontalLayout.execute(me.graph.getDefaultParent(), me.rootVarex);
    me.autoLayout(me.rootVarex, me.defaultLayout)
    me.setGraphVisiblePoint(me.rootVarex.geometry.x, me.rootVarex.geometry.y)
    me.changeFired = false
    me.undoManager.clear()
    // me.isGraphChanged = false;
  },

  setGraphVisiblePoint: function (x, y) {
    /*
     var me = this,
     fx = me.graph.container.offsetWidth,
     fy = me.graph.container.offsetHeight,
     px = me.graph.panDx,
     py = me.graph.panDy;

     //me.graph.scrollCellToVisible(me.rootVarex);
     //me.graph.panningManager.panTo()
     //me.graph.scrollPointToVisible(me.rootVarex.geometry.x, me.rootVarex.geometry.y );
     me.graph.panGraph( x - fx, y - fy);
     */
  },

  initComponent: function () {
    var me = this, id, html, outlineHtml
    me.layout = 'fit'

    me.initMetaInfo()
    me.tbar = me.createToolBar()

    me.idPrefix = Ext.id()
    me.containerId = id = me.idPrefix + 'graph'
    html = '<div id="' + id + '" class="graph-editor-holder" style="width: 100%; height: 100%; background-color: white; overflow: scroll; -moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;" tabindex="0"></div>'

    // me.toolbarId = id =  me.idPrefix + 'toolbar';
    // toolbarHtml = '<div id="' + id+'" tabindex="0"></div>';
    me.outlineId = id = me.idPrefix + 'outline'
    outlineHtml = '<div id="' + id + '" style="width: 100%; height: 100%; overflow: scroll;" ></div>'

    me.outlineWnd = Ext.create('Ext.Window', {
      title: UB.i18n('Overview'),
      width: 200,
      height: 200,
      closable: false,
      layout: 'fit',
      constrain: true,
      items: [{
        html: outlineHtml
      }]
    })

    /*
     me.toolbarWnd = Ext.create('Ext.Window', {
     title: 'Toolbar',
     width: 80,
     height: 200,
     closable: false,
     layout: 'fit',
     constrain: true,
     items:[
     {
     html:  toolbarHtml
     }
     ]
     });
     */

    me.xmInitPromise = new Promise((resolve, reject) => {
      me.mainPnl = Ext.create('Ext.panel.Panel', {
        flex: 1,
        html: html,
        items: [
          me.outlineWnd,
          {
            xtype: 'text',
            text: 'text',
            degrees: 90
          }
        ],
        listeners: {
          boxready: function (sender) {
            mxLoader.initAndCall().then(
              () => { me.initGraph(); resolve(me) }
            ).catch(
              (reason) => reject(reason)
            )
          },
          resize: function (sender, width, height, oldWidth, oldHeight) {
            if (me.graph) {
              me.graph.sizeDidChange()
            }
          },
          scope: me
        }
      })
    })

    if (!me.items) {
      me.items = []
    }

    // me.items.push(
    me.items.push(me.mainPnl)
    me.callParent(arguments)

    me.isLoadContent = false
  },

  beforeDestroy: function () {
    var
      me = this
    // if (me.editor) { me.editor.destroy();}

    if (me.outlineWnd) { me.outlineWnd.destroy() }
    if (me.toolbarWnd) { me.toolbarWnd.destroy() }
    if (me.rubberband) { me.rubberband.destroy() }

    if (me.keyHandler) { me.keyHandler.destroy() }
    if (me.toolbar) { me.toolbar.destroy() }
    if (me.outline) { me.outline.destroy() }
    if (me.graph) { me.graph.destroy() }

    me.callParent(arguments)
  },

  initGraph: function () {
    var me = this, container, f4, graph, outline, style, keyHandler, layout,
      mainWin, baseZIndex
    me.graphDivEl = Ext.get(me.containerId)
    mainWin = me.up('basewindow')
    if (!mainWin) {
      mainWin = $App.getViewport()
    }
    baseZIndex = mainWin.getEl().dom.style.zIndex || 1

    container = me.graphDivEl.dom
    container.style.position = 'absolute'
    container.style.overflow = 'hidden'
    container.style.left = '0px'
    container.style.top = '0px'
    container.style.right = '0px'
    container.style.bottom = '0px'

    const pnlBox = me.mainPnl.getBox()

    // me.toolbarWnd.showAt(0, 0);
    me.outlineWnd.showAt(pnlBox.width - me.outlineWnd.width, 0)
    // me.toolbarWnd.setXY([pnlBox.left, pnlBox.top]);
    me.outlineWnd.setXY([pnlBox.right - me.outlineWnd.width, pnlBox.top])

    outline = document.getElementById(me.outlineId)
    // outline.style.overflow = 'scroll';

    mxEvent.disableContextMenu(container)

    f4 = new mxDivResizer(container)
    f4 = new mxDivResizer(outline)

    // Creates the graph inside the given container
    me.graph = graph = new mxGraph(container)

    // Enables automatic sizing for vertices after editing and
    // panning by using the left mouse button.
    graph.setCellsMovable(true) // false
    graph.setAutoSizeCells(true)
    graph.setPanning(true)
    graph.setTooltips(true)
    graph.centerZoom = false

    // graph.allowAutoPanning = true;
    // graph.ignoreScrollbars = true;
    graph.panningHandler.useLeftButtonForPanning = true

    // Displays a popupmenu when the user clicks
    // on a cell (using the left mouse button) but
    // do not select the cell when the popup menu
    // is displayed
    graph.panningHandler.selectOnPopup = false
    graph.panningHandler.panningEnabled = true

    graph.cellsDisconnectable = false
    graph.cellsCloneable = false
    graph.allowDanglingEdges = false
    graph.disconnectOnMove = false
    graph.gridEnabled = false

    me.isGraphChanged = false
    graph.getModel().addListener(mxEvent.CHANGE, function () { me.graphChanged() })
    me.installDblClickHandler(graph)

    me.rubberband = new mxRubberband(graph)

    // Creates the outline (navigator, overview) for moving
    // around the graph in the top, right corner of the window.
    me.outline = new mxOutline(graph, outline)
    // me.outline.updateOnPan = true;

    // Disables tooltips on touch devices
    graph.setTooltips(!mxClient.IS_TOUCH)
    graph.tooltipHandler.zIndex = baseZIndex + 100

    me.undoManager = new mxUndoManager()
    me.installUndoHandler(graph)

    graph.setHtmlLabels(true)

    // Set some stylesheet options for the visual appearance of vertices
    style = graph.getStylesheet().getDefaultVertexStyle()
    style[mxConstants.STYLE_SHAPE] = 'label'
    style[mxConstants.STYLE_WHITE_SPACE] = 'wrap'

    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT
    style[mxConstants.STYLE_SPACING_LEFT] = 4 // 54
    // style[mxConstants.STYLE_SPACING_LEFT] = 24; // 54

    style[mxConstants.STYLE_GRADIENTCOLOR] = '#7d85df'
    style[mxConstants.STYLE_STROKECOLOR] = '#5d65df'
    style[mxConstants.STYLE_FILLCOLOR] = '#adc5ff'

    style[mxConstants.STYLE_FONTCOLOR] = '#1d258f'
    style[mxConstants.STYLE_FONTFAMILY] = 'Verdana'
    style[mxConstants.STYLE_FONTSIZE] = '10' // 12
    style[mxConstants.STYLE_FONTSTYLE] = '1'

    style[mxConstants.STYLE_SHADOW] = '1'
    style[mxConstants.STYLE_ROUNDED] = '1'
    style[mxConstants.STYLE_GLASS] = '1'

    // style[mxConstants.STYLE_IMAGE] = 'images/person.png';
    // style[mxConstants.STYLE_IMAGE_WIDTH] = '16'; // 48
    // style[mxConstants.STYLE_IMAGE_HEIGHT] = '16';
    style[mxConstants.STYLE_SPACING] = 12 // 8

    style = Ext.clone(style)
    // 'images/person.png';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#7DDF94'
    style[mxConstants.STYLE_STROKECOLOR] = '#5DDF71'
    style[mxConstants.STYLE_FILLCOLOR] = '#ADFFBD'
    graph.getStylesheet().putCellStyle('org_staffunit', style)

    style = Ext.clone(style)
    // style[mxConstants.STYLE_IMAGE] = 'images/user-group.png';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#D5DF7D'
    style[mxConstants.STYLE_STROKECOLOR] = '#D2DF5D'
    style[mxConstants.STYLE_FILLCOLOR] = '#F7FFAD'
    graph.getStylesheet().putCellStyle('org_department', style)

    style = Ext.clone(style)
    // style[mxConstants.STYLE_IMAGE] = 'images/office.png';
    style[mxConstants.STYLE_GRADIENTCOLOR] = '#7d85df'
    style[mxConstants.STYLE_STROKECOLOR] = '#5d65df'
    style[mxConstants.STYLE_FILLCOLOR] = '#adc5ff'
    graph.getStylesheet().putCellStyle('org_organization', style)

    // Sets the default style for edges
    style = graph.getStylesheet().getDefaultEdgeStyle()
    style[mxConstants.STYLE_ROUNDED] = true
    style[mxConstants.STYLE_STROKEWIDTH] = 3
    // style[mxConstants.STYLE_EXIT_X] = 0.5; // center
    // style[mxConstants.STYLE_EXIT_Y] = 1.0; // bottom
    // style[mxConstants.STYLE_EXIT_X] = 1.0; // right
    // style[mxConstants.STYLE_EXIT_Y] = 0.5; // center
    // style[mxConstants.STYLE_EXIT_PERIMETER] = 0; // disabled
    // style[mxConstants.STYLE_ENTRY_X] = 0.5; // center
    // style[mxConstants.STYLE_ENTRY_Y] = 0; // top
    // style[mxConstants.STYLE_ENTRY_X] = 0; // left
    // style[mxConstants.STYLE_ENTRY_Y] = 0.5; // center
    // style[mxConstants.STYLE_ENTRY_PERIMETER] = 0; // disabled

    // Disable the following for straight lines
    // style[mxConstants.STYLE_EDGE] = mxEdgeStyle.TopToBottom;
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.OrthConnector // SideToSide ElbowConnector EntityRelation SegmentConnector

    // Stops editing on enter or escape keypress
    me.keyHandler = keyHandler = new mxKeyHandler(graph)

    // Enables automatic layout on the graph and installs
    // a tree layout for all groups who's children are
    // being changed, added or removed.
    layout = new mxCompactTreeLayout(graph, false)
    layout.useBoundingBox = false
    layout.edgeRouting = false
    layout.levelDistance = 60
    layout.nodeDistance = 16

    // Allows the layout to move cells even though cells
    // aren't movable in the graph
    layout.isVertexMovable = function (cell) {
      return true
    }

    me.verticalLayout = layout

    layout = new mxCompactTreeLayout(graph, true)
    layout.useBoundingBox = false
    layout.edgeRouting = false
    layout.levelDistance = 60
    layout.nodeDistance = 16

    // Allows the layout to move cells even though cells
    // aren't movable in the graph
    layout.isVertexMovable = function (cell) {
      return true
    }

    // layout = new mxHierarchicalLayout(graph);
    me.horisontalLayout = layout

    /*
     layoutMgr = new mxLayoutManager(graph);

     layoutMgr.getLayout = function(cell)
     {
     if (cell.getChildCount() > 0)
     {
     return layout;
     }
     };
     */

    // Installs a popupmenu handler using local function (see below).
    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
      var frmDom = mainWin.getEl().dom,
        baseZ = frmDom.style.zIndex || 9999999999999
      menu.div.parent = frmDom
      menu.zIndex = baseZ + 1
      menu.div.style.zIndex = baseZ + 1
      return me.createPopupMenu(graph, menu, cell, evt)
    }

    // Fix for wrong preferred size
    var oldGetPreferredSizeForCell = graph.getPreferredSizeForCell
    graph.getPreferredSizeForCell = function (cell) {
      var result = oldGetPreferredSizeForCell.apply(this, arguments)

      if (result !== null) {
        result.width = Math.max(120, result.width - 40)
      }

      return result
    }

    // Sets the maximum text scale to 1
    graph.cellRenderer.getTextScale = function (state) {
      return Math.min(1, state.view.scale)
    }

    /*
     // Dynamically adds text to the label as we zoom in
     // (without affecting the preferred size for new cells)
     graph.cellRenderer.getLabelValue = function(state)
     {
     var result = state.cell.value;

     if (state.view.graph.getModel().isVertex(state.cell))
     {
     if (state.view.scale > 1)
     {
     result += '\nDetails 1';
     }

     if (state.view.scale > 1.3)
     {
     result += '\nDetails 2';
     }
     }

     return result;
     };
     */

    graph.convertValueToString = function (cell) {
      if (Ext.isString(cell.value)) {
        return cell.value
      } else {
        return cell.getAttribute('label')
      }
    }

    graph.getPreferredSizeForCell = Ext.bind(me.getPreferredSizeForCell, graph)

    /*
     toolbar = document.getElementById(me.toolbarId);
     toolbar.style.padding = '4px';
     me.toolbar = tb = new mxToolbar(toolbar);

     tb.addItem('Zoom In', 'images/zoom_in32.png',function(evt)
     {
     graph.zoomIn();
     });

     tb.addItem('Zoom Out', 'images/zoom_out32.png',function(evt)
     {
     graph.zoomOut();
     });

     tb.addItem('Actual Size', 'images/view_1_132.png',function(evt)
     {
     graph.zoomActual();
     });

     tb.addItem('Print', 'images/print32.png',function(evt)
     {
     var preview = new mxPrintPreview(graph, 1);
     preview.open();
     });

     tb.addItem('Poster Print', 'images/press32.png',function(evt)
     {
     var pageCount = mxUtils.prompt('Enter maximum page count', '1');

     if (pageCount !== null)
     {
     var scale = mxUtils.getScaleForPageCount(pageCount, graph);
     var preview = new mxPrintPreview(graph, scale);
     preview.open();
     }
     });

     tb.addItem('select', 'resources/mxGraph/images/select.gif',function(evt)
     {
     graph.panningHandler.useLeftButtonForPanning = false;
     graph.setConnectable(false);
     });

     tb.addItem('pan', 'resources/mxGraph/images/pan.gif',function(evt)
     {
     graph.panningHandler.useLeftButtonForPanning = true;
     graph.setConnectable(false);
     });
     */

    if (me.graph && me.dataUrl && !me.isActulData) {
      me.startLoadData().done(function (result) {
        if (me.loadDataDefer) {
          me.loadDataDefer.resolve(result)
        }
      }, function (reason) {
        me.loadDataDefer.reject(reason)
      })
    }
  },

  installUndoHandler: function (graph) {
    var listener = mxUtils.bind(this, function (sender, evt) {
      var edit = evt.getProperty('edit')
      this.undoManager.undoableEditHappened(edit)
    })

    graph.getModel().addListener(mxEvent.UNDO, listener)
    graph.getView().addListener(mxEvent.UNDO, listener)

    // Keeps the selection state in sync
    const undoHandler = function (sender, evt) {
      var changes = evt.getProperty('edit').changes
      graph.setSelectionCells(graph.getSelectionCellsForChanges(changes))
    }

    this.undoManager.addListener(mxEvent.UNDO, undoHandler)
    this.undoManager.addListener(mxEvent.REDO, undoHandler)
  },

  initRoot: function () {
    var me = this, parent, graph = me.graph, w, v1, doc, node
    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    parent = graph.getDefaultParent()

    if (!graph || !graph.container)
      return

    // Adds the root vertex of the tree
    graph.getModel().beginUpdate()
    try {
      doc = mxUtils.createXmlDocument()
      node = doc.createElement('ubOrgChart')
      node.setAttribute('label', UB.i18n('Organization'))
      node.setAttribute('unitType', 'ORG')
      node.setAttribute('isRoot', true)

      w = graph.container.offsetWidth
      v1 = graph.insertVertex(parent, 'treeRoot',
        node, w / 2 - 30, 20, 140, 60)// , 'image=' + 'models/adminui-pub/themes/UBGrayTheme/ubimages/office.png'/* $App.getImagePath('office.png') */)

      graph.updateCellSize(v1)

      me.addExpandOverlay(graph, v1, true)
      me.addIconOverlay(v1)
      // me.addAddOverlay(graph, vertex);
      // me.addOverlays(graph, v1, false);

      v1.isRoot = true
      me.rootVarex = v1
      // me.rootVarex.item = { child: me.treeData };
    } finally {
      // Updates the display
      graph.getModel().endUpdate()
    }
  },

  installDblClickHandler: function (graph) {
    graph.addListener(mxEvent.DOUBLE_CLICK,
      mxUtils.bind(this, function (sender, evt) {
        var cell = evt.getProperty('cell')

        if (cell &&
          graph.isEnabled() &&
          this.dblClickAction !== null) {
          this.dblClickAction(cell, evt)
          graph.tooltipHandler.hide()
          evt.consume()
        }
      })
    )
  },

  dblClickAction: function (cell, evt) {
    var me = this,
      unitType = cell.getAttribute('unitType'),
      ID = cell.getAttribute('ID'),
      entity
    entity = me.getEntityByUnitType(unitType)
    if (entity && ID) {
      me.openForm(entity, ID, null, function (sender) {
        me.refreshDiagram()
      })
    }
  },

  getEntityByUnitType: function (unitType) {
    /*
     var result = '';
     switch (unitType){
     case 'STAFF':
     result = 'org_staffunit';
     break;
     case 'ORG':
     result = 'org_organization';
     break;
     case 'DEP':
     result = 'org_department';
     break;
     }
     return result;
     */

    var mObj = this.orgUnity[unitType]
    return mObj ? mObj.code : ''
  },

  openForm: function (entityCode, instanceID, initialFieldValues, onClose) {
    this.openFormC(
      {
        entityCode: entityCode,
        instanceID: instanceID,
        initialFieldValues: initialFieldValues,
        onClose: onClose
      })
  },

  openFormC: function (config) {
    var form, formCode, description, cfg, isHistory, me = this,
      sysEntities = UB.core.UBAppConfig.systemEntities

    // entityCode, instanceID, initialFieldValues, onClose
    isHistory = $App.domainInfo.get(config.entityCode).hasMixin('dataHistory')

    config.isModal = !Ext.isEmpty(config.isModal) ? config.isModal : true

    form = UB.core.UBFormLoader.getFormByEntity(config.entityCode)
    if (form) {
      formCode = form.get(sysEntities.form.fields.code)
      description = UB.i18n(form.get(sysEntities.form.fields.description))
    }
    cfg = {
      cmdType: UB.core.UBCommand.commandType.showForm,
      formCode: formCode,
      description: description,
      entity: config.entityCode,
      instanceID: config.instanceID,
      initialFieldValues: config.initialFieldValues,
      customParams: config.customParams,
      isModal: config.isModal,
      callback: function (results) {
        if (config.onClose && results) {
          var bv = results.up('window')
          if (bv) {
            bv.on({
              beforeclose: config.onClose,
              scope: me
            })
          }
          // results.addListener("beforeclose", onClose, me);
        }
        // debugger;
      }
      // store: store,
      // addByCurrent: true,
      // __mip_ondate: isHistory ? new Date() : undefined !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! как работеает?
      // parent: me.parent,
      // parentID: me.parentID,
      // sender: me.getView() || me,
      // isModal: this.isModal,
      // additionalWhereList: me.additionalWhereList

    }

    UB.core.UBApp.doCommand(cfg)
  },

  createToolBar: function () {
    var me = this
    Ext.define('SelectPrinterFmt', {
      extend: 'Ext.data.Model',
      fields: [
        {name: 'ID', type: 'object'},
        {name: 'Caption', type: 'string'}
      ]
    })

    return {
      xtype: 'toolbar',
      items: [
        {
          xtype: 'button',
          text: UB.i18n('Undo'),
          iconCls: 'icon-undo',
          handler: function () {
            me.undoManager.undo()
          },
          scope: me
        },
        {
          xtype: 'button',
          text: UB.i18n('Redo'),
          iconCls: 'icon-redo',
          handler: function () {
            me.undoManager.redo()
          },
          scope: me
        },
        {
          xtype: 'button',
          text: UB.i18n('Zoom'),
          iconCls: 'icon-zoom-in',
          handler: function () {
            me.graph.zoomIn()
          },
          scope: me
        }, {
          xtype: 'button',
          text: UB.i18n('Zoom Out'),
          iconCls: 'icon-zoom-out',
          handler: function () {
            me.graph.zoomOut()
          },
          scope: me
        }, {
          xtype: 'button',
          text: UB.i18n('Actual Size'),
          iconCls: 'icon-view11',
          handler: function () {
            me.graph.zoomActual()
          },
          scope: me
        }, {
          xtype: 'combobox',
          store: Ext.create('Ext.data.Store', {
            model: 'SelectPrinterFmt',
            data: [
              {ID: 'A4P', Caption: UB.i18n('A4 portrait')},
              {ID: 'A4L', Caption: UB.i18n('A4 landscape')},
              {ID: 'A5P', Caption: UB.i18n('A5 portrait')},
              {ID: 'A5L', Caption: UB.i18n('A5 landscape')}
            ]
          }),
          forceSelection: true,
          editable: false,
          allowBlank: false,
          displayField: 'Caption',
          valueField: 'Caption',
          value: UB.i18n('A4 portrait'),
          width: 150,
          labelWidth: 0,
          queryMode: 'local',
          listeners: {
            select: function (combo, records) {
              if (records.length > 0) {
                switch (records[0].get('ID')) {
                  case 'A4P':
                    me.printerFormat = mxConstants.PAGE_FORMAT_A4_PORTRAIT
                    break
                  case 'A4L':
                    me.printerFormat = mxConstants.PAGE_FORMAT_A4_LANDSCAPE
                    break
                  case 'A5P':
                    me.printerFormat = new mxRectangle(0, 0, 1652, 1169)
                    break
                  case 'A5L':
                    me.printerFormat = new mxRectangle(0, 0, 1169, 1652)
                    break
                }
              }
            },
            scope: me
          }
        }, {
          xtype: 'button',
          text: UB.i18n('Print'),
          iconCls: 'icon-printer',
          handler: function () {
            // 1652, 1169
            var preview = new mxPrintPreview(me.graph, 1, me.printerFormat || null)
            preview.open()
          },
          scope: me
        }, {
          xtype: 'button',
          text: UB.i18n('Poster Print'),
          iconCls: 'icon-print',
          handler: function () {
            // var pageCount = mxUtils.prompt('Enter maximum page count', '1');

            Ext.Msg.prompt({
              msg: UB.i18n('Enter maximum page count'),
              prompt: true,
              title: '',
              minWidth: Ext.Msg.minPromptWidth,
              buttons: Ext.Msg.OKCANCEL,
              callback: function (btn, value) {
                if (btn !== 'ok') {
                  return
                }
                var pageCount = value
                if (pageCount !== null) {
                  var scale = mxUtils.getScaleForPageCount(pageCount, me.graph)
                  var preview = new mxPrintPreview(me.graph, scale, me.printerFormat || null)
                  preview.open()
                }
              },
              scope: me,
              multiline: false,
              value: '1'
            })
          },
          scope: me
        }, {
          xtype: 'button',
          text: UB.i18n('Select'),
          icon: 'models/adminui-pub/resources/images/select.gif',
          handler: function () {
            me.graph.panningHandler.useLeftButtonForPanning = false
            me.graph.setConnectable(false)
          },
          scope: me
        }, {
          xtype: 'button',
          text: UB.i18n('Pan'),
          icon: 'models/adminui-pub/resources/images/pan.gif',
          handler: function () {
            me.graph.panningHandler.useLeftButtonForPanning = true
            me.graph.setConnectable(false)
          },
          scope: me
        }, {
          xtype: 'button',
          text: UB.i18n('Select all'),
          handler: function () {
            me.graph.selectAll()
          },
          scope: me
        }
      ]
    }
  },

  // Function to create the entries in the popupmenu
  createPopupMenu: function (graph, menu, cell, evt) {
    var me = this, model = graph.getModel()

    if (!me.isLoadContent) {
      menu.addItem(UB.i18n('New organizational chart'), '', function () {
        me.loadData(function () {
          me.showTree()
          me.isLoadContent = true
        })
      })
    }

    if (cell !== null) {
      if (model.isVertex(cell)) {
        /*
         menu.addItem('Add child', 'editors/images/overlays/check.png', function()
         {
         me.addChild(graph, cell);
         });
         */

        // {code: metaObjName, unitType: unitType, caption: metaObj.caption }
        Ext.Object.each(me.orgUnity, function (unitType, mObj) {
          menu.addItem(UB.i18n('Create child') + ' ' + mObj.caption, '', function () {
            me.createChildElement(cell, unitType)
          })
        }, me)

        /*
         menu.addItem(UB.i18n('Create child') + ' organization', '', function()
         {
         me.createChildElement(cell, 'ORG');
         });

         menu.addItem(UB.i18n('Create child') + ' department', '', function()
         {
         me.createChildElement(cell, 'DEP');
         });

         menu.addItem(UB.i18n('Create child') + ' position', '', function()
         {
         me.createChildElement(cell, 'STAFF');
         });
         */

        menu.addSeparator()

        menu.addItem(UB.i18n('Open subordinate chart from this node'), '', function () {
          me.openDiagram(cell)
        })

        menu.addSeparator()

        menu.addItem(UB.i18n('Remove all child'), '', function () {
          me.deleteSubtree(graph, cell)
          me.graph.removeCellOverlays(cell)
          me.addIconOverlay(cell)
          me.addAddOverlay(me.graph, cell)
        })

        menu.addItem(UB.i18n('Select all child'), '', function () {
          me.selectAllChild(cell)
        })

        menu.addSeparator()

        menu.addItem(UB.i18n('Align child to right'), '', function () {
          // if (cell.isRoot){
          // var w = me.graph.container.offsetWidth;
          // w/2 - 30, 20
          // }
          me.autoLayout(cell, 'H')
          me.selectAllChild(cell)
          me.setGraphVisiblePoint(cell.geometry.x, cell.geometry.y)
        })

        menu.addItem(UB.i18n('Align child down me'), '', function () {
          me.autoLayout(cell, 'V')
          me.selectAllChild(cell)
          me.setGraphVisiblePoint(cell.geometry.x, cell.geometry.y)
        })
      } else {
        var cstyle = cell.getStyle() || 'edgeStyle=orthogonalEdgeStyle;'
        if (cstyle.indexOf('topToBottomEdgeStyle') < 0) {
          menu.addItem(UB.i18n('Format edge top to bottom'), '', function () {
            graph.setCellStyle('edgeStyle=topToBottomEdgeStyle;', [cell])
          })
        }
        if (cstyle.indexOf('sideToSideEdgeStyle') < 0) {
          menu.addItem(UB.i18n('Format edge left to right'), '', function () {
            graph.setCellStyle('edgeStyle=sideToSideEdgeStyle;', [cell])
          })
        }
        if (cstyle.indexOf('orthogonalEdgeStyle') < 0) {
          menu.addItem(UB.i18n('Format edge orthogonal'), '', function () {
            graph.setCellStyle('edgeStyle=orthogonalEdgeStyle;', [cell])
          })
        }
      }
      /*
       menu.addItem('Edit label', 'editors/images/text.gif', function()
       {
       graph.startEditingAtCell(cell);
       });
       */
      /*
       if (cell.id !== 'treeRoot' &&
       model.isVertex(cell))
       {
       menu.addItem('Delete', 'editors/images/delete.gif', function()
       {
       me.deleteSubtree(graph, cell);
       });
       }
       */

      menu.addSeparator()
    }

    menu.addItem(UB.i18n('Fit'), 'models/adminui-pub/themes/UBGrayTheme/ubimages/zoom_in.png' /* $App.getImagePath('zoom_in.png') */, function () {
      graph.fit()
    })

    menu.addItem(UB.i18n('Actual Size'), 'models/adminui-pub/themes/UBGrayTheme/ubimages/view_1_1.png' /* $App.getImagePath('view_1_1.png') */, function () {
      graph.zoomActual()
    })

    menu.addSeparator()

    menu.addItem(UB.i18n('Print'), 'models/adminui-pub/themes/UBGrayTheme/ubimages/print.png' /* $App.getImagePath('print.png') */, function () {
      var preview = new mxPrintPreview(graph, 1)
      preview.open()
    })

    menu.addItem(UB.i18n('Poster Print'), 'models/adminui-pub/themes/UBGrayTheme/ubimages/print.png' /* $App.getImagePath('print.png') */, function () {
      var pageCount = mxUtils.prompt(UB.i18n('Enter maximum page count'), '1')

      if (pageCount !== null) {
        var scale = mxUtils.getScaleForPageCount(pageCount, graph)
        var preview = new mxPrintPreview(graph, scale)
        preview.open()
      }
    })
  },

  setDetaileEdgeStyle: function (cell, style) {
    var me = this, edges = [], edgeCount, model = me.graph.model

    me.graph.traverse(cell, true, function (vertex) {
      edgeCount = model.getEdgeCount(vertex)
      if (edgeCount > 0) {
        for (var i = 0; i < edgeCount; i++) {
          var e = model.getEdgeAt(vertex, i)
          var isSource = model.getTerminal(e, true) === vertex
          if (isSource) {
            edges.push(e)
          }
        }
      }
      return true
    })

    /*
     Ext.Array.each(cell.edges, function(edge,index){
     if (edge.fromID !== cell.item.ID){
     edges.push(edge);
     }
     });
     */
    me.graph.setCellStyle('edgeStyle=' + style + ';', edges)
    // me.horisontalLayout.execute(graph.getDefaultParent(), cell); //graph.getDefaultParent()
    // me.setGraphVisiblePoint(cell.geometry.x, cell.geometry.y );
    // graph.setCellStyle('edgeStyle=topToBottomEdgeStyle;', edges );
    // me.verticalLayout.execute(graph.getDefaultParent(), cell);
  },

  autoLayout: function (cell, type) {
    var me = this
    switch (type) {
      case 'H':
        me.setDetaileEdgeStyle(cell, 'sideToSideEdgeStyle')
        me.horisontalLayout.execute(me.graph.getDefaultParent(), cell)
        break
      case 'V':
        me.setDetaileEdgeStyle(cell, 'topToBottomEdgeStyle')
        me.verticalLayout.execute(me.graph.getDefaultParent(), cell)
        break
    }
  },

  expandImage: 'models/adminui-pub/themes/UBGrayTheme/ubimages/expandLG.png', // $App.getImagePath('expandLG.png'),
  collapseImage: 'models/adminui-pub/themes/UBGrayTheme/ubimages/collapseLG.png', // $App.getImagePath('collapseLG.png'),
  appendImage: 'models/adminui-pub/themes/UBGrayTheme/ubimages/download.png', // $App.getImagePath('download.png'),

  addExpandOverlay: function (graph, cell, expanded) {
    var me = this, overlay = new mxCellOverlay(new mxImage(expanded ? me.collapseImage : me.expandImage, 24, 24), expanded ? UB.i18n('Collapse') : UB.i18n('Expand'))
    overlay.cursor = 'hand'
    overlay.align = mxConstants.ALIGN_CENTER

    overlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
      // me.addChild(graph, cell);
      me.expandORCollapse(cell, overlay)
    }))
    overlay.isExpandOvelay = true
    overlay.expanded = !expanded
    graph.addCellOverlay(cell, overlay)
  },

  addAddOverlay: function (graph, cell) {
    var me = this, addOverlay

    addOverlay = new mxCellOverlay(new mxImage(me.appendImage, 24, 24), UB.i18n('Append element'))
    addOverlay.cursor = 'hand'
    addOverlay.offset = new mxPoint(-4, 8)
    addOverlay.align = mxConstants.ALIGN_RIGHT
    addOverlay.verticalAlign = mxConstants.ALIGN_TOP
    addOverlay.addListener(mxEvent.CLICK, mxUtils.bind(this, function (sender, evt) {
      me.addChildElement(cell, addOverlay)
    }))
    addOverlay.isAddOverlay = true
    graph.addCellOverlay(cell, addOverlay)
  },

  addIconOverlay: function (cell) {
    var me = this, unitType, addOverlay, image, name, orgUnity
    unitType = cell.getAttribute('unitType')
    name = cell.getAttribute('label')

    orgUnity = me.orgUnity[unitType]
    image = orgUnity ? orgUnity.image : 'models/adminui-pub/themes/UBGrayTheme/ubimages/office.png'/* $App.getImagePath('office.png') */
    /*
     switch (unitType){
     case 'ORG':
     image = 'images/office.png';
     break;
     case 'DEP':
     image = 'images/user-group.png';
     break;
     default:
     image = 'images/person.png';
     break;
     }
     */
    addOverlay = new mxCellOverlay(new mxImage(image, 24, 24), name)
    // addOverlay.cursor = 'hand';
    addOverlay.offset = new mxPoint(4, 8)
    addOverlay.align = mxConstants.ALIGN_LEFT
    addOverlay.verticalAlign = mxConstants.ALIGN_TOP
    addOverlay.isIconOverlay = true
    me.graph.addCellOverlay(cell, addOverlay)
  },

  updateCell: function (cell) {
    var me = this
    //, state = me.graph.view.getState(cell);
    // if (state)
    // {
    //    me.graph.cellRenderer.redraw(state);
    // }
    me.graph.refresh(cell)
  },

  getAddOvelay: function (cell) {
    var me = this, result = null
    if (!cell.overlays || cell.overlays.length === 0) {
      return null
    }
    Ext.Array.each(cell.overlays, function (elm) {
      if (elm.isAddOverlay) {
        result = elm
        return false
      }
    }, me)
    return result
  },

  getExpandOvelay: function (cell) {
    var me = this, result = null
    if (!cell.overlays || cell.overlays.length === 0) {
      return null
    }
    Ext.Array.each(cell.overlays, function (elm) {
      if (elm.isExpandOvelay) {
        result = elm
        return false
      }
    }, me)
    return result
  },

  /**
   * добавление на диаграмму подчиненных елементов (если они еще не присуктствуют на схеме)
   * для запуска из оверлея
   * @param cell
   * @param overlay
   */
  addChildElement: function (cell, overlay) {
    var me = this,
      ID = cell.getAttribute('ID'),
      element = me.allData[ID],
      // minEdges = cell.isRoot ? 0 : 1,
      // edgeCnt = cell.getEdgeCount(),
      model = me.graph.getModel(),
      expandOverlay,
      existsCell, eID, pt,
      existIDs = {}, existIDCount = 0, cellToAdd = []

    existsCell = me.findChildCell(cell)
    Ext.Array.each(existsCell, function (ecell) {
      eID = ecell.getAttribute('ID')
      existIDs[eID * 1] = ecell
      existIDCount++
    })

    if (element && element.child.length > 0) {
      model.beginUpdate()
      try {
        pt = {x: cell.geometry.x, y: cell.geometry.y + 120}
        Ext.Array.each(element.child, function (childElm) {
          if (!existIDs[childElm.ID]) {
            me.showElement(cell, childElm, pt)
            cellToAdd.push(cell)
            pt.x += 100
          }
          // me.showChild( cell, element, false);
        })
      } finally {
        model.endUpdate()
      }

      if (existIDCount === 0) {
        me.autoLayout(cell, me.defaultLayout)
      }
      me.graph.removeCellOverlay(cell, overlay)
      // if (cell.overlays.length > 0){
      //  cell.overlays[0].image.src = me.collapseImage;
      // }
      expandOverlay = me.getExpandOvelay(cell)
      if (!expandOverlay) {
        me.addExpandOverlay(me.graph, cell, true)
      } else {
        if (expandOverlay.expanded) {
          me.expandORCollapse(cell)
        }
      }
      if (existIDCount === 0) {
        me.selectAllChild(cell)
      } else {
        me.graph.setSelectionCells(cellToAdd)
      }
    }
  },

  expandORCollapse: function (cell, overlay) {
    var me = this,
      ID = cell.getAttribute('ID'),
      element = me.allData[ID],
      child

    if (element) {
      child = element.child
    }
    if (cell.isRoot && !ID) {
      child = me.treeData
    }

    if (child.length > 0) {
      // show = me.hideOrShowCells(me.graph, cell, null );
      me.hideOrShowCells(me.graph, cell, overlay.expanded)
      // overlay.image.src = show ? me.collapseImage : me.expandImage;
      // overlay.expanded = show;
      overlay.expanded = !overlay.expanded
      overlay.image.src = !overlay.expanded ? me.collapseImage : me.expandImage
      overlay.tooltip = !overlay.expanded ? UB.i18n('Collapse') : UB.i18n('Expand')
    }

    me.updateCell(cell)
    // me.showChild( cell, element, false);
    // me.deleteSubtree(me.graph, cell);
  },

  hideOrShowCells: function (graph, cell, show) {
    var me = this, cells = [], overlay
    var hasInvisible = false
    graph.traverse(cell, true, function (vertex) {
      if (cell !== vertex) {
        cells.push(vertex)
        hasInvisible = hasInvisible || !vertex.isVisible()
      }

      return true
    })
    if (show === null) {
      show = hasInvisible
    }

    graph.toggleCells(show, cells, true)
    if (show) {
      Ext.Array.each(cells, function (cell) {
        overlay = me.getExpandOvelay(cell)
        if (overlay && overlay.expanded) {
          overlay.image.src = me.collapseImage
          me.updateCell(cell)
        }
      })
    }

    return show
  },

  changeElementParent: function (cell, newParent, item) {
    var me = this, model = me.graph.getModel(), edgeCount, e, src
    edgeCount = model.getEdgeCount(cell)
    // удаляем старую связь
    if (edgeCount > 0) {
      for (var i = 0; i < edgeCount; i++) {
        e = model.getEdgeAt(cell, i)
        src = model.getTerminal(e, true)
        if (src !== cell) {
          me.graph.cellsRemoved([e])
          break
        }
      }
    }
    // добавляем новую связь
    me.addElementEdge(cell, newParent, item)
  },

  /**
   * Добавить новый элемент на диаграму
   * @param {mxGraph} graph
   * @param {mxCell} cell Главный элемент
   * @param {Object} item Данные об элементе
   * @param inUpdateMode
   * @param {Object} pt позиция на листе
   * @return {*}
   */
  addChild: function (graph, cell, item, inUpdateMode, pt) {
    var doc, node, x, y
    var me = this, model = graph.getModel()
    var parent = graph.getDefaultParent()
    var vertex

    if (!inUpdateMode) {
      model.beginUpdate()
    }
    try {
      doc = mxUtils.createXmlDocument()
      node = doc.createElement('ubOrgChart')
      node.setAttribute('label', item.caption) // item.ID + ': ' +
      node.setAttribute('ID', item.ID)
      node.setAttribute('parentID', item.parentID)
      node.setAttribute('code', item.code)
      node.setAttribute('unitType', item.unitType)
      if (!cell) {
        node.setAttribute('isRoot', true)
      }

      if (pt) {
        x = pt.x
        y = pt.y
      }

      vertex = graph.insertVertex(parent, null, node, x, y)
      vertex.setStyle(me.getEntityByUnitType(item.unitType))
      // vertex.item = item;
      var geometry = model.getGeometry(vertex)

      // Updates the geometry of the vertex with the
      // preferred size computed in the graph
      var size = graph.getPreferredSizeForCell(vertex)
      geometry.width = size.width
      geometry.height = size.height

      if (cell) {
        me.addElementEdge(vertex, cell, item)
      } else {
        vertex.isRoot = true
        me.rootVarex = vertex
      }

      // me.addExpandOverlay(graph, vertex, true);
      if (item.child.length > 0) {
        me.addAddOverlay(graph, vertex)
      }
      me.addIconOverlay(vertex)
    } finally {
      if (!inUpdateMode) {
        model.endUpdate()
      }
    }

    return vertex
  },

  addElementEdge: function (cell, parentCell, item) {
    var graph = this.graph,
      parent = graph.getDefaultParent()
    // Adds the edge between the existing cell
    // and the new vertex and executes the
    // automatic layout on the parent
    var edge = graph.insertEdge(parent, null, '', parentCell, cell)

    edge.setAttribute('fromID', item.ID)
    edge.fromID = item.ID
    edge.setGeometry(new mxGeometry(0, 0, 0, 0))
    edge.geometry.relative = true

    // Configures the edge label "in-place" to reside
    // at the end of the edge (x = 1) and with an offset
    // of 20 pixels in negative, vertical direction.
    // edge.geometry.x = 1;
    // edge.geometry.y = 0;
    edge.geometry.setTerminalPoint(new mxPoint(0, 0), true)
    edge.geometry.setTerminalPoint(new mxPoint(80, 0), true)
    edge.geometry.setTerminalPoint(new mxPoint(160, 0), false)

    // edge.geometry.offset = new mxPoint(0, -20);
    // edge.geometry.offset = new mxPoint(10, 10);
  },

  selectAllChild: function (cell) {
    var me = this
    var cells = []
    me.graph.traverse(cell, true, function (vertex) {
      if (cell !== vertex) {
        cells.push(vertex)
      }

      return true
    })

    me.graph.setSelectionCells(cells)
  },

  deleteSubtree: function (graph, cell) {
    // Gets the subtree from cell downwards
    var cells = []
    graph.traverse(cell, true, function (vertex) {
      if (cell !== vertex) {
        cells.push(vertex)
      }

      return true
    })

    graph.removeCells(cells)
  },

  getPreferredSizeForCell: function (cell) {
    /*
     max wide for cell in auto format mode
     */
    var maxWidth = 100
    var result = null

    if (cell !== null) {
      var state = this.view.getState(cell)
      var style = state ? state.style : this.getCellStyle(cell)

      if (style !== null && !this.model.isEdge(cell)) {
        var fontSize = style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE
        var dx = 0
        var dy = 0

        // Adds dimension of image if shape is a label
        if (this.getImage(state) || style[mxConstants.STYLE_IMAGE]) {
          if (style[mxConstants.STYLE_SHAPE] === mxConstants.SHAPE_LABEL) {
            if (style[mxConstants.STYLE_VERTICAL_ALIGN] === mxConstants.ALIGN_MIDDLE) {
              dx += parseFloat(style[mxConstants.STYLE_IMAGE_WIDTH]) || mxLabel.prototype.imageSize
            }

            if (style[mxConstants.STYLE_ALIGN] !== mxConstants.ALIGN_CENTER) {
              dy += parseFloat(style[mxConstants.STYLE_IMAGE_HEIGHT]) || mxLabel.prototype.imageSize
            }
          }
        }

        // Adds spacings
        dx += 2 * (style[mxConstants.STYLE_SPACING] || 0)
        dx += style[mxConstants.STYLE_SPACING_LEFT] || 0
        dx += style[mxConstants.STYLE_SPACING_RIGHT] || 0

        dy += 2 * (style[mxConstants.STYLE_SPACING] || 0)
        dy += style[mxConstants.STYLE_SPACING_TOP] || 0
        dy += style[mxConstants.STYLE_SPACING_BOTTOM] || 0

        // Add spacing for collapse/expand icon
        // LATER: Check alignment and use constants
        // for image spacing
        var image = this.getFoldingImage(state)

        if (image !== null) {
          dx += image.width + 8
        }

        // Adds space for label
        var value = this.getLabel(cell)

        if (value && value.length > 0) {
          if (!this.isHtmlLabel(cell)) {
            value = value.replace(/\n/g, '<br>')
          }

          var size = mxUtils.getSizeForString(value,
            fontSize, style[mxConstants.STYLE_FONTFAMILY])
          if (size.width + dx > maxWidth) {
            size = mxUtils.getSizeForString(value,
              fontSize, style[mxConstants.STYLE_FONTFAMILY], maxWidth)
          }
          var width = size.width + dx
          var height = size.height + dy

          if (!mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
            var tmp = height

            height = width
            width = tmp
          }

          if (this.gridEnabled) {
            width = this.snap(width + this.gridSize / 2)
            height = this.snap(height + this.gridSize / 2)
          }

          result = new mxRectangle(0, 0, width, height)
        } else {
          var gs2 = 4 * this.gridSize
          result = new mxRectangle(0, 0, gs2, gs2)
        }
      }
    }

    return result
  },

  getValue: function () {
    var me = this, enc = new mxCodec(),
      data = enc.encode(me.graph.getModel())
    return mxUtils.getXml(data)

    // return this.initialValue;
  },

  resetOriginalValue: function () {
    this.changeFired = false
    this.isGraphChanged = false
    return null
  },

  graphChanged: function () {
    var me = this
    if (!me.isLoadComlete) {
      return
    }
    me.isGraphChanged = true
    if (!me.changeFired) {
      this.fireEvent('change', this, true)
    }
    me.changeFired = true
  },

  isDirty: function () {
    return this.isGraphChanged
  },

  updateDataBlob: function (inblob) {
    var me = this
    if (!me.useBlobForData) {
      Ext.Error.raise('object does not use Blob')
    }
    // debugger;
    if (me.dataBlob && !Ext.isEmpty(this.objUrl)) {
      window.URL.revokeObjectURL(this.objUrl)
    }
    me.data = null
    me.dataBlob = inblob
    me.objUrl = window.URL.createObjectURL(inblob)
    me.data = me.objUrl
  },

  onDestroy: function () {
    var me = this
    me.dataBlob = null
    me.data = null
    if (me.useBlobForData && !Ext.isEmpty(me.objUrl)) {
      window.URL.revokeObjectURL(me.objUrl)
    }
    me.objUrl = null
    this.callParent()
  },

  /**
   *
   * @param {Object} cfg
   * @param {Blob|File} [cfg.blobData]
   * @param {String} [cfg.url]
   * @returns {Promise}
   */
  setSrc: function (cfg) {
    var
      me = this,
      data = cfg.url,
      blobData = cfg.blobData, result

    if (cfg.rawValue) {
      throw new Error('The UBOrgChart component does not support rawValue')
    }

    me.dataUrl = data
    if (me.useBlobForData && blobData) {
      me.updateDataBlob(blobData)
    }

    me.isActulData = false
    me.changeFired = true
    if (me.graph) {
      result = me.startLoadData()
    } else {
      // возможно гдето понадобиться знать о завершении загрузки
      me.loadDataDefer = Q.defer()
      result = me.loadDataDefer.promise
      me.loadDataDefer.resolve(true)
    }
    me.changeFired = false
    return result
  },

  startLoadData: function () {
    var me = this, dec, xml, err, defer = Q.defer()
    if (!me.dataUrl || !me.graph) {
      return
    }
    me.isLoadComlete = false
    me.getEl().mask(UB.i18n('loadingData'))
    $App.connection.get(me.dataUrl).then(function (response) {
      xml = response.data
      if (typeof (xml) === 'string') {
        var parser = new DOMParser()
        xml = parser.parseFromString(xml, 'application/xml')
        err = xml.getElementsByTagName('parsererror')
        if (err.length > 0) {
          throw new Error(err[0].innerHTML)
        }
      }
      dec = new mxCodec(xml.documentElement.ownerDocument)
      dec.decode(xml.documentElement, me.graph.getModel())
      this.baseUrl = me.dataUrl

      me.isLoadComlete = true
      me.isLoadContent = true
      me.isGraphChanged = false
      me.undoManager.clear()
      me.isActulData = true
      return true
    }).done(function () {
      try {
        me.loadData(function () {
          try {
            me.validateDiagram()
            defer.resolve()
          } finally {
            me.getEl().unmask()
          }
        })
      } catch (err) {
        me.getEl().unmask()
        defer.reject(err)
        throw err
      }
    }, function (reason) {
      defer.reject(reason)
      me.getEl().unmask()
    })
    return defer.promise
  },

  // инициация нового документа
  initNewSrc: function () {
    var me = this
    me.loadData(function () {
      me.showTree()
      me.isLoadContent = true
      me.isLoadComlete = true
    })
    return null
  },

  findParentCell: function (cell) {
    var me = this, model = me.graph.getModel(), edgeCount, e, dest
    edgeCount = model.getEdgeCount(cell)
    if (edgeCount > 0) {
      for (var i = 0; i < edgeCount; i++) {
        e = model.getEdgeAt(cell, i)
        dest = model.getTerminal(e, true)
        if (dest !== cell) {
          return dest
        }
      }
    }
    return null
  },

  findChildCell: function (cell) {
    var me = this, model = me.graph.getModel(), edgeCount, e, dest, result = []
    edgeCount = model.getEdgeCount(cell)
    if (edgeCount > 0) {
      for (var i = 0; i < edgeCount; i++) {
        e = model.getEdgeAt(cell, i)
        dest = model.getTerminal(e, false)
        if (dest !== cell) {
          result.push(dest)
        }
      }
    }
    return result
  },

  refreshDiagram: function (callback) {
    var me = this
    me.loadData(function () {
      me.validateDiagram(true)
      if (callback) {
        callback.call(me)
      }
    })
  },

  validateDiagram: function (isUpdateMode) {
    var me = this, model = me.graph.getModel(), ID, hasItem = false,
      cellToDel = [], isRoot, parentCell, parentID, elmTree, cellChParent = [],
      dCells = {}, elm

    me.rootVarex = null

    // по всем вершинам в диаграмме
    Ext.Object.each(model.cells, function (id, cell) {
      if (cell.vertex) {
        ID = cell.getAttribute('ID')
        if (ID) { ID = ID * 1 }
        isRoot = cell.getAttribute('isRoot')  // cell.id === 'treeRoot';

        if (isRoot) {
          me.rootVarex = cell
          cell.isRoot = true
        }
        if (!ID) { // теоритически кроме рута без нашей ид не должно быть элементов
          // if (!isRoot){
          //   cellToDel.push(cell);
          // }
          return true
        }
        parentCell = me.findParentCell(cell)
        parentID = parentCell ? (parentCell.getAttribute('ID') || null) : null
        if (parentID) { parentID = parentID * 1 }  // Number(parentID)

        hasItem = true
        elmTree = me.allData[ID]
        if (!elmTree) { // в базе видно удалили такой элемент
          cellToDel.push(cell)
        } else {
          // освежим параметры
          if (cell.getAttribute('label') !== elmTree.caption) {
            cell.setAttribute('label', elmTree.caption)
          }
          if (cell.getAttribute('code') !== elmTree.code) {
            cell.setAttribute('code', elmTree.code)
          }
          if (cell.getAttribute('unitType') !== elmTree.unitType) {
            cell.setAttribute('unitType', elmTree.unitType)
          }

          if (elmTree.parentID !== parentID) { // у узла сменлся родитель
            cellChParent.push(cell)
          }

          // заносим все в древовидную стрктуру для дальнейшей проверки
          elm = dCells[ID]
          if (!elm) {
            dCells[ID] = elm = {cell: cell, child: []}
          } else {
            elm.cell = cell
          }
          elm = dCells[elmTree.parentID || 'root']
          if (!elm) {
            dCells[elmTree.parentID || 'root'] = elm = {child: [cell]}
          } else {
            elm.child.push(cell)
          }
        }
      }
    })

    // перенаправляем дугу, если сменлся родитель и если новый родитель на схеме иначе удаляем
    Ext.Array.each(cellChParent, function (cell) {
      ID = cell.getAttribute('ID')
      if (ID) { ID = ID * 1 }
      elmTree = me.allData[ID]
      elm = dCells[elmTree.parentID]
      if (elm) { // всеже новый родитель есть на схеме
        me.changeElementParent(cell, elm.cell, elmTree)
      } else {
        cellToDel.push(cell)
      }
      // cell
    }, me)

    me.graph.removeCells(cellToDel, true)

    // осталось найти все элемнты схемы где сменилось количество деток
    Ext.Object.each(dCells, function (eID, eCell) {
      if (eID === 'root') {
        me.updateCellOverlay(me.rootVarex, eCell.child, me.treeData.length, isUpdateMode)
        return true
      }
      elm = me.allData[eID]
      if (elm) {
        me.updateCellOverlay(eCell.cell, eCell.child, elm.child.length, isUpdateMode)
      }
    }, me)

    me.undoManager.clear()

    if (!me.rootVarex) {
      Ext.Msg.alert('', UB.i18n('Root is not found'))
      return
    }

    me.changeFired = false
    me.isGraphChanged = false
    me.isLoadComlete = true
  },

  updateCellOverlay: function (cell, childCell, newCount, isUpdateMode) {
    var me = this, hasInvisible = false, overlay
    Ext.Array.each(childCell, function (elm) {
      if (elm.isVisible()) {
        hasInvisible = true
        return false
      }
    }, me)
    if (isUpdateMode) {
      overlay = me.getAddOvelay(cell)
      if (childCell.length !== newCount && !overlay) {
        me.addAddOverlay(me.graph, cell)
      }
      if (newCount === 0 && overlay) {
        me.graph.removeCellOverlay(cell, overlay)
      }
      overlay = me.getExpandOvelay(cell)
      if (childCell.length === 0 && overlay) {
        me.graph.removeCellOverlay(cell, overlay)
      }
    } else {
      if (childCell.length !== newCount) {
        me.addAddOverlay(me.graph, cell)
      }
      if (newCount > 0 && childCell.length > 0) {
        me.addExpandOverlay(me.graph, cell, hasInvisible)
      }
      me.addIconOverlay(cell)
    }
  },

  createNewDiagram: function (parentID, caption, callback) {
    var me = this

    $App.connection.addNew({
      entity: 'org_diagram',
      fieldList: ['ID'],
      execParams: {}
    }).then(function (result) {
      var resultData, ID
      if (result) {
        resultData = result.resultData
        ID = resultData.data[0][0]
        $App.connection.insert({
          fieldList: ['ID', 'orgunitID', 'caption'],
          entity: 'org_diagram',
          execParams: {'ID': ID, 'orgunitID': parentID, 'caption': caption}
        }).then(function (result) {
          if (result.serverFailure) {
            return
          }
          callback.call(me, ID)
        })
      }
    })

    /*
     if (result[0] && !result[0].success) {
     Ext.MessageBox.alert('', result[0].errMsg);
     }
     */
  },

  openDiagram: function (cell) {
    var me = this, ID, caption, diagramID
    ID = cell.getAttribute('ID') * 1
    caption = cell.getAttribute('label')

    me.loadBy('org_diagram', ['ID', 'orgunitID', 'caption'], 'orgunitID', ID, function (store) {
      if (store.getCount() === 0) {
        Ext.Msg.show(
          {
            msg: UB.i18n('Chart for this item does not exist. Create a new one?'),
            prompt: false,
            title: '',
            minWidth: Ext.Msg.minPromptWidth,
            buttons: Ext.Msg.OKCANCEL,
            callback: function (btn, value) {
              if (btn !== 'ok') {
                return
              }
              me.createNewDiagram(ID, caption, function (nID) {
                diagramID = nID
                this.openFormC({
                  entityCode: 'org_diagram',
                  instanceID: diagramID,
                  isModal: false
                })
              })
            },
            scope: me,
            multiline: false
          })
      } else {
        diagramID = store.getAt(0).get('ID')
        this.openFormC(
          {
            entityCode: 'org_diagram',
            instanceID: diagramID,
            isModal: false
          })
      }
    })
  },

  createChildElement: function (cell, unitType) {
    var me = this, entity, ID
    entity = me.getEntityByUnitType(unitType)
    ID = cell.getAttribute('ID')
    ID = ID ? ID * 1 : null
    // initialFieldValues = {}
    if (entity) {
      me.openForm(entity, null, {parentID: ID}, function (sender) {
        // debugger;
        var panel = sender.down('basepanel')
        if (panel && panel.record) {
          me.checkElementId(panel.record.get('ID'), cell)
        }
      })
    }
  },

  /**
   * Отображает вновь добавленый элемент если он есть
   * @param ID
   * @param parentCell
   */
  checkElementId: function (ID, parentCell) {
    var me = this, overlay, item, parentItem, childCells, record, newcell, model
    me.loadBy('org_unit', ['ID', 'parentID', 'code', 'caption', 'unitType'], 'ID', ID,
      function (store) {
        if (store.getCount() === 0) {
          return
        }
        record = store.getAt(0)
        me.refreshDiagram(function () {
          parentItem = me.allData[parentCell.getAttribute('ID') * 1]
          item = me.allData[ID]
          childCells = me.findChildCell(parentCell)

          overlay = me.getAddOvelay(parentCell)
          if (parentItem.child.length === childCells.length + 1) {
            // var pt = mxUtils.convertPoint( me.graph.container, x, y);
            var pt = {x: parentCell.geometry.x, y: parentCell.geometry.y + 120}
            model = me.graph.getModel()
            model.beginUpdate()
            try {
              newcell = me.showElement(parentCell, item, pt)
              if (overlay) {
                me.graph.removeCellOverlay(parentCell, overlay)
              }
            } finally {
              model.endUpdate()
            }
            // pcellSt = me.graph.view.getState(parentCell);
            // me.graph.moveCells(newcell, parentCell.geometry.x, parentCell.geometry.y + 20);
          }
        })
      })
  },

  loadBy: function (entity, fieldList, field, value, collback) {
    var itemsStores, me = this

    itemsStores = [{
      entity: entity,
      requestName: entity,
      method: 'select',
      fieldList: fieldList,
      whereList: {
        By: {
          expression: '[' + field + ']',
          condition: 'equal',
          values: {field: value}
        }
      }
    }]

    UB.core.UBDataLoader.loadStores({
      ubRequests: itemsStores,
      setStoreId: true,
      scope: this
    }).then(function (stores) {
      collback.call(me, _.find(stores, {entityName: entity}))
    })
  },

  initMetaInfo: function () {
    var me = this,
      unitType, unity, orgUnity

    me.orgUnity = {}
    $App.domainInfo.eachEntity(function (metaObj, metaObjName) {
      if (metaObj.mixins && (unity = metaObj.mixins.unity) && unity.enabled &&
        unity.entity && (unity.entity.toLowerCase() === 'org_unit') &&
        unity.defaults) {
        unitType = unity.defaults.unitType
        // me.orgUnity[unitType] = metaObj;
        me.orgUnity[unitType] = orgUnity = {code: metaObjName, unitType: unitType, caption: metaObj.caption}
        switch (unitType) {
          case 'ORG':
            orgUnity.image = 'models/adminui-pub/themes/UBGrayTheme/ubimages/office.png'/* $App.getImagePath('office.png') */
            break
          case 'DEP':
            orgUnity.image = 'models/adminui-pub/themes/UBGrayTheme/ubimages/user-group.png'/* $App.getImagePath('user-group.png') */
            break
          default:
            orgUnity.image = 'models/adminui-pub/themes/UBGrayTheme/ubimages/person.png'/* $App.getImagePath('person.png') */
            break
        }
      }
    })
  }
})
