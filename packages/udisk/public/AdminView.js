/* global saveAs, Ext, UDISK, UBNativeDocEdit, $App, Blob */
const UB = require('@unitybase/ub-pub')
/**
 * Client form for UDISK
 *
 * @example
 *
    {
      "cmdType":"showForm",
      "formCode":"udisk_card",
      "entity":"udisk_secretcard",
      "cmpInitConfig":{
        "treeHidden": false
      }
    }
 *
 */
Ext.define('UDISK.AdminView', {
  extend: 'Ext.form.Panel',
  layout: {type: 'border'},
  statics: {
    /**
     * return priority level of accessType
     * @param {String} accessType
     * @returns {number}
     */
    accessTypePriority: function (accessType) {
      switch (accessType) {
        case 'owner': return 4
        case 'delegate': return 3
        case 'write': return 2
        case 'read': return 1
        default: return 0
      }
    },
    /**
     * return true if "first" > "second"
     * @param {String} first
     * @param {String} second
     * @returns {boolean}
     */
    compareAccessType: function (first, second) {
      return (this.accessTypePriority(first) > this.accessTypePriority(second))
    },
    /**
     * @param {Number} id
     * @param {String} accessType
     * @param {String} [entityName]
     * @returns {Promise}
     */
    hasAccess: function (id, accessType, entityName) {
      return $App.connection.run({
        entity: entityName /* || 'udisk_card' */,
        method: 'hasAccess',
        ID: id,
        accessType: accessType
      }).then(function (result) {
        return result && result.hasAccess
      })
    },
    /**
     *
     * @param {Number} id
     * @param {String} accessType
     * @param {String} [entityName]
     * @returns {Promise}
     */
    checkAccess: function (id, accessType, entityName) {
      return this.hasAccess(id, accessType, entityName)
        .then(function (res) {
          if (!res) {
            throw new UB.UBError('accessDeny')
          }
        })
    }
  },

  initComponent: function () {
    var me = this /*, model */

    me.adminMode = false // me.mode === 'admin';
    me.addEvents('foldersLoadOver')

    if (!me.entityName) {
      me.entityName = 'udisk_card'
    }
    me.permissionEntity = $App.domainInfo.get(me.entityName).attr('name').customSettings.permissionEntityName
    me.diskType = $App.domainInfo.get(me.entityName).attr('name').customSettings.diskType
    // "udiscFileTemplates": "models/udisc/fileTemplates",

    /* $App.connection.query({
            entity: me.entityName, method: 'getDiskType'
        }).done(function(result){
            me.diskType = result.diskType;
        }); */
    if (!me.WebdavProviderName) {
      me.WebdavProviderName = 'UDISK'
    }
    me.mainTreeStore = Ext.create('Ext.data.TreeStore', {
      root: me.dataMainDisk(),
      sortOnLoad: false
    })
    me.reloadFolders().done()

    me.mainTree = Ext.create('Ext.tree.Panel', { //
      rootVisible: false,
      region: 'west',
      width: 200,
      hidden: (me.treeHidden !== false),
      hideHeaders: true,
      split: true,

      columns: [{
        xtype: 'udiskfoldercolumn',
        width: '100%',
        dataIndex: 'text'
      }],
      store: me.mainTreeStore
    })

    me.mainTree.on('itemcontextmenu', me.onFileGridItemContextMenuTree, me)

    me.mainTree.on('select', me.onNodeSelect, me)

    me.orderList = { '0': {expression: 'isFolder', order: 'desc'} }
    me.fieldList = ['ID', 'name', 'parentID', 'isFolder', 'ownerID', 'fsize', 'contentType', 'isTemporary', 'fileData', 'mi_treePath', /* 'permission.accessType', */ 'mi_modifyDate']
    me.isTempWhere = {
      expression: '[isTemporary]',
      condition: 'notEqual',
      values: {'isTemporary': true}
    }
    me.selectedFolderID = 0 // main disk
    me.fileGridStore = Ext.create('UB.ux.data.UBStore', {
      ubRequest: {
        entity: me.entityName,
        method: (me.mode === 'admin') ? 'adminSelect' : 'select',
        fieldList: me.fieldList,
        whereList: {
          temp: me.isTempWhere
          //, permUserWhere: me.permUserWhere
        },
        mode: me.mode,
        // joinAs: me.joinAs,
        orderList: me.orderList
      },
      sorters: 'name',
      filters: [{
        condition: 'isNull',
        property: 'parentID'
      }],
      // model: model,
      autoLoad: false,
      autoDestroy: true
    })
    me.fileGridStore.on('load', function () {
      me.updateAction()
    })
    me.fileGridStore.load()

    var metric = {
      byte: UB.i18n('sizeByte'),
      kiloByte: UB.i18n('sizeKiloByte'),
      megaByte: UB.i18n('sizeMegaByte')
    }

    me.fileGrid = Ext.create('UB.view.EntityGridPanel', { // Ext.grid.Panel
      region: 'center',
      rowHeight: 28,
      cls: 'ub-entity-grid',
      entityName: me.entityName,
      hideActionToolbar: true,
      selType: 'rowmodel',
      forbidSelectOnContextMenu: true,
      selModel: {
        mode: 'MULTI',
        ignoreRightMouseSelection: true,
        pruneRemoved: false
      },
      onItemDblClick: function () {},
      columns: [
        { text: ' ',
          dataIndex: 'isFolder',
          renderer: function (value, obj, record) {
            var fd, classes = 'fa fa-folder udisk-folder-icon'
            if (!value) {
              classes = 'fa fa-file-o'
              fd = record.get('fileData')
              if (fd) {
                fd = JSON.parse(fd)
                if (fd.ct) {
                  switch (fd.ct.toLowerCase()) {
                    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    case 'application/vnd.ms-excel':
                      classes = 'fa fa-file-excel-o'
                      break
                    case 'application/pdf':
                      classes = 'fa fa-file-pdf-o'
                      break
                    case 'application/msword':
                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                      classes = 'fa fa-file-word-o'
                      break
                    case 'application/x-rar-compressed':
                    case 'application/x-7z-compressed':
                    case 'application/zip':
                      classes = 'fa fa-file-archive-o'
                      break
                    case 'application/vnd.ms-powerpoint':
                    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                    case 'application/vnd.ms-powerpoint.presentation.macroenabled.12':
                      classes = 'fa fa-file-powerpoint-o'
                      break
                    case 'image/jpeg':
                    case 'image/vnd.wap.wbmp':
                    case 'image/bmp':
                      classes = 'fa fa-file-image-o'
                      break
                    default:
                      if (fd.ct.indexOf('image/') === '0') {
                        classes = 'fa fa-file-image-o'
                      }
                  }
                }
              }
            }
            return '<i class="udisk-icon ' + classes + '"></i>'
            /*
             1 fa-file-excel-o - *.xls, *.xlsx
             2 fa-file-pdf-o - *.pdf
             3 fa-file-word-o - *.doc, *.docx
             4 fa-file-archive-o - *.rar, *.zip
             5 fa-file-image-o - *.jpg, *.jpeg *, jpe, *.bmp, *.png, *.gif (изображение)
             6 fa-file-powerpoint-o - *.pptx, *.pptm, *.ppt
             */
            // return '<img src=\"data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAIC\" class="x-tree-icon ' + (value ? ' fa fa-folder-o': 'fa fa-file-o') + '" />'; //udisk-folder-img udisk-file-img
          }
        },
        { text: UB.i18n('name'), dataIndex: 'name', flex: 1 },
        {text: UB.i18n('size'),
          dataIndex: 'fsize',
          renderer: function (value) {
            if (!value) {
              return ''
            }
            return value < 1500 ? value + ' ' + metric.byte
              : (value < 1048576 ? Math.round(value * 100 / 1024) / 100 + ' ' + metric.kiloByte
                : Math.round(value * 100 / 1048576) / 100 + ' ' + metric.megaByte)
          }
        },
        {
          text: UB.i18n('udiskUpdateDate'),
          dataIndex: 'mi_modifyDate',
          renderer: Ext.util.Format.dateRenderer(Ext.util.Format.datetimeFormat || 'd.m.Y G:i')
        }
      ],
      store: me.fileGridStore
    })
    var downOverEl, divGrdEl, divGrdBorder
    me.fileGrid.on('itemdblclick', me.onFileGridDblClick, me)
    me.fileGrid.on('containercontextmenu', me.onFileGridContextMenu, me)
    me.fileGrid.on('selectionchange', me.onFileSelectionChange, me)
    me.fileGrid.on('itemcontextmenu', me.onFileGridItemContextMenu, me)
    me.fileGrid.on('boxready', function () {
      var elDom = me.fileGrid.getEl().dom
      elDom.addEventListener('dragenter', function (e) {
        e.stopPropagation()
        e.preventDefault()
      }, false)
      elDom.addEventListener('dragenter', function (e) {
        e.stopPropagation()
        e.preventDefault()
      }, false)
      elDom.addEventListener('dragover', function (e) {
        e.stopPropagation()
        e.preventDefault()
        if (!downOverEl) {
          divGrdEl = me.fileGrid.getEl().down('[class~=x-grid-view]')
          if (divGrdEl) {
            downOverEl = Ext.DomHelper.append(divGrdEl,
              '<div style="position: absolute; left: ' + divGrdEl.dom.scrollLeft + 'px; top: ' + divGrdEl.dom.scrollTop +
              'px; width: ' + divGrdEl.dom.clientWidth + 'px; height: ' + divGrdEl.dom.clientHeight +
              'px;" class="udisk-drop-zone"><div class="udisk-drop-zone-msg">' + UB.i18n('downFilesHear') + '</div>',
              true)

            downOverEl.dom.addEventListener('dragleave', function (e) {
              e.stopPropagation()
              e.preventDefault()
              if (downOverEl) {
                downOverEl.remove()
                downOverEl = null
                divGrdEl.setStyle('border', divGrdBorder)
              }
            }, false)
            downOverEl.dom.addEventListener('drop', function (e) {
              e.stopPropagation()
              e.preventDefault()
              var
                dt = e.dataTransfer,
                files = dt.files,
                frm

              if (downOverEl) {
                downOverEl.remove()
                downOverEl = null
                divGrdEl.setStyle('border', divGrdBorder)
              }

              frm = Ext.create('UDISK.AdminUploadForm', {
                scope: this,
                parentID: me.selectedFolderID < 3 ? null : me.selectedFolderID,
                entityName: me.entityName
              })
              frm.upLoadFiles(files).done(function (response) {
                if (response !== 0) {
                  me.refreshCurrent()
                }
              })
            }, false)
          }
        }
      }, false)

      elDom.addEventListener('dragend', function (e) {

      }, false)
    }, me)

    me.breadCrumbs = Ext.widget('toolbar', {
      cls: 'udisk-breadcrumbs',
      region: 'north'
    })
    me.buildMenuPath()

    me.createSearchMenu()

    me.builtActionMenu()
    me.initFileTemplates()

    me.toolBar = Ext.widget('toolbar', {
      region: 'north',
      height: 50,
      items: [
        me.searchToolBarMenu, '-',

        Ext.apply(Ext.create('Ext.button.Button', me.actions.refresh), {btnInMenu: true, text: ''}),
        Ext.apply(Ext.create('Ext.button.Button', me.actions.share), {btnInMenu: true, text: '', hidden: (me.diskType === 'secret' && !me.adminMode)}),
        Ext.apply(Ext.create('Ext.button.Button', me.actions.add), {btnInMenu: true, text: ''}),
        Ext.apply(Ext.create('Ext.button.Button', me.actions.upload), {btnInMenu: true, text: ''}),
        Ext.apply(Ext.create('Ext.button.Button', me.actions.download), {btnInMenu: true, text: ''}),
        // Ext.apply(Ext.create('Ext.button.Button', me.actions.scan), {text: ''} ),

        Ext.apply(Ext.create('Ext.button.Button', me.actions.editFileByWebDaw), {btnInMenu: true, text: ''}),
        Ext.apply(Ext.create('Ext.button.Button', me.actions.del), {btnInMenu: true, text: ''}),
        Ext.apply(Ext.create('Ext.button.Button', me.actions.showHideTree), {btnInMenu: true, text: ''})

      ]
    })

    me.items = [
      me.toolBar,
      me.breadCrumbs,
      me.mainTree,
      me.fileGrid
    ]

    me.createPopupMenu()

    me.callParent(arguments)
  },

  onFileSelectionChange: function (grid, selected, eOpts) {
    var me = this
    me.updateAction()
  },

  onFileGridContextMenu: function (grid, event) {
    event.stopEvent()
    this.treeMenuActive = false
    this.menu.showAt(event.xy)
  },

  onFileGridItemContextMenuTree: function (grid, record, item, index, event, eOpts) {
    event.stopEvent()
    if (!grid || !record) {
      return
    }
    var sm = grid.getSelectionModel()
    if (!sm) {
      return
    }
    // sm.select(record);
    this.treeMenuActive = true
    this.treeMenu.showAt(event.xy)
  },
  onFileGridItemContextMenu: function (grid, record, item, index, event, eOpts) {
    event.stopEvent()
    if (!grid || !record) {
      return
    }
    var sm = grid.getSelectionModel()
    if (!sm) {
      return
    }
    // sm.select(record);
    this.treeMenuActive = false
    this.menu.showAt(event.xy)
  },

  createPopupMenu: function () {
    var me = this,
      popupMenuItems

    popupMenuItems = [
      me.actions.copy,
      me.actions.cut,
      me.actions.paste,
      '-',
      me.actions.del,
      '-',
      me.actions.editFileByWebDaw,
      me.actions.add,
      me.actions.download,
      '-',
      me.actions.share,
      me.actions.upload,
      me.actions.findItemInFolder,
      me.actions.properties,
      me.actions.audit,
      me.actions.auditRight
    ]

    me.menu = Ext.create('Ext.menu.Menu', {
      items: popupMenuItems
    })
    me.popupMenuItems = popupMenuItems

    me.treeMenu = Ext.create('Ext.menu.Menu', {
      items: [
        /* me.actions.copy,
        me.actions.cut,
        me.actions.paste,
        '-', */
        me.actions.del,
        '-',
        me.actions.add,
        '-',
        me.actions.share,
        me.actions.findItemInFolder,
        me.actions.properties,
        me.actions.audit,
        me.actions.auditRight
      ]
    })
  },

  downloadFile: function (name, docSrc, id) {
    let me = this
    let params = {
      entity: me.entityName,
      attribute: 'fileData',
      id: id,
      isDirty: docSrc.isDirty === true
    }

    $App.connection.getDocument(params, {resultIsBinary: true, bypassCache: true})
      .then(function (dataAsArray) {
        let blobData
        blobData = new Blob(
          [dataAsArray],
          {type: docSrc.ct}
        )
        saveAs(blobData, name || docSrc.origName || docSrc.filename || me.getInstanceID() + '_' + docSrc.ct)
      }).done()
  },

  updateAction: function () {
    var me = this, currentNode,
      selection = me.fileGrid.getSelectionModel().getSelection()

    if (me.selectedFolderID >= 0) {
      currentNode = me.mainTreeStore.getNodeById(me.selectedFolderID)
    }
    if (selection && selection.length === 1) {
      me.actions.editFileByWebDaw.setDisabled(!!selection[0].get('isFolder') || me.adminMode)
    } else {
      me.actions.editFileByWebDaw.disable()
    }

    me.actions.copy.setDisabled(!selection || !selection.length || me.adminMode)
    me.actions.cut.setDisabled(!selection || !selection.length || me.adminMode)

    me.actions.download.setDisabled(!selection || selection.length === 0 || selection[0].get('isFolder') || me.adminMode)
    // me.actions.properties.setDisabled(!selection || !selection.length);

    me.actions.paste.setDisabled(!me.copyContext /* || accessTypePriority < 2 */ || me.adminMode)
    if (me.adminMode) {
      me.actions.del.setDisabled(!selection || selection.length === 0 || !selection[0].get('isFolder'))

      me.actions.scan.disable()
      me.actions.upload.disable()
    }
  },

  onFileGridDblClick: function (grid, record, item, index, e, eOpts) {
    var me = this, promise = Promise.resolve(true)

    if (record.get('isFolder')) {
      me.lastSelectedFolderId = me.selectedFolderID
      if (!me.mainTreeStore.getNodeById(record.get('ID'))) {
        promise = me.reloadFolders().then()
      }
      promise.done(function () {
        me.selectedFolderID = record.get('ID')
        me.mainTree.getSelectionModel().deselectAll(true)
        me.fileGrid.getSelectionModel().deselectAll(true)
        me.refreshCurrent()
      })
    } else {
      me.openEditForm()
    }
  },

  openEditForm: function (btn) {
    var me = this,
      config,
      instanceID,
      selection, loaded

    config = {
      cmdType: 'showForm',
      formCode: me.formParam && me.formParam.formCode ? me.formParam.formCode : 'udisk_card-def',
      description: me.formParam && me.formParam.description ? me.formParam.description : UB.i18n('udiskProperties'),
      entity: me.entityName,
      // instanceID: instanceID,
      isModal: true,
      // store: store,
      isModalDialog: true,
      cmpInitConfig: {
        mode: me.mode,
        selectMethod: me.adminMode ? 'adminSelect' : 'select',
        updateMethod: me.adminMode ? 'adminUpdate' : 'update'
      }
      // addByCurrent: eOpts && eOpts.addByCurrent,
      // __mip_ondate: eOpts && eOpts.__mip_ondate,
      // parentContext: context,
      // detailAttribute: me.detailAttribute,
      // parentID: me.parentID,
      // sender: me
    }
    if (me.formParam && me.formParam.cmpInitConfig) {
      config.cmpInitConfig = me.formParam.cmpInitConfig
    }

    if (!config.cmpInitConfig) {
      config.cmpInitConfig = {}
    }

    config.cmpInitConfig.WebdavProviderName = me.WebdavProviderName
    if (me.treeMenuActive && !btn.btnInMenu) {
      instanceID = me.selectedFolderID
      if (!instanceID) {
        return
      }
      config.instanceID = instanceID

      config.store = Ext.create('UB.ux.data.UBStore', {
        ubRequest: {
          entity: me.entityName,
          method: (me.mode === 'admin') ? 'adminSelect' : 'select',
          fieldList: me.fieldList,
          mode: me.mode,
          orderList: me.orderList,
          ID: instanceID
        },
        autoLoad: false,
        autoDestroy: true
      })
      config.onClose = function () {
        me.reloadFolders()
      }
      loaded = false
      config.store.on('load', function () {
        $App.doCommand(config)
      }, me, {single: true})
      config.store.load()
    } else {
      selection = me.fileGrid.getSelectionModel().getSelection()
      if (selection.length < 1) {
        return
      }
      config.instanceID = selection[0].get('ID')
      config.store = me.fileGridStore
      config.onClose = function () {
        me.reloadFolders()
      }
      $App.doCommand(config)
    }
  },

  builtActionMenu: function () {
    var me = this
    me.actions = {}
    me.actions.download = new Ext.Action({
      actionId: 'download',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faDownload,
      tooltip: UB.i18n('download'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('download'),
      eventId: 'download',
      cls: 'download-action',
      handler: me.doDownload,
      // disabled: true,

      scope: me
    })
    me.actions.upload = new Ext.Action({
      actionId: 'upload',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faUpload,
      tooltip: UB.i18n('upload'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('upload'),
      eventId: 'upload',
      cls: 'upload-action',
      handler: me.doUpload,
      // disabled: true,
      scope: me
    })
    me.actions.del = new Ext.Action({
      actionId: 'del',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faTrashO,
      tooltip: UB.i18n('delete'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('delete'),
      eventId: 'del',
      cls: 'delete-action',
      handler: me.doDelete,
      // disabled: true,
      scope: me
    })
    me.actions.share = new Ext.Action({
      actionId: 'share',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faUsers,
      tooltip: UB.i18n('share'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('share'),
      eventId: 'share',
      cls: 'share-action',
      handler: me.doEditShare,
      hidden: (me.diskType === 'secret' && !me.adminMode),
      // disabled: true,
      scope: me
    })
    me.actions.refresh = new Ext.Action({
      actionId: 'refresh',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faRefresh,
      cls: 'refresh-action',
      tooltip: UB.i18n('refresh'),
      text: UB.i18n('refresh'),
      eventId: 'refresh',
      handler: me.doRefresh,
      scope: me
    })

    me.actions.makeFolder = new Ext.Action({
      actionId: 'makeFolder',
      scale: 'medium',
      cls: 'add-new-action',
      text: UB.i18n('udiskNewFolder'),
      tooltip: UB.i18n('udiskNewFolder'),
      eventId: 'makeFolder',
      handler: me.doMakeFolder,
      scope: me
    })
    me.actions.showHideTree = new Ext.Action({
      actionId: 'showHideTree',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faHierarche,
      tooltip: UB.i18n('showHideTree'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('showHideTree'),
      eventId: 'showHideTree',
      cls: 'showHideTree-action',
      handler: me.doShowHideTree,
      treeHidden: true,
      scope: me
    })
    me.actions.findItemInFolder = new Ext.Action({
      actionId: 'findItemInFolder',
      scale: 'medium',
      tooltip: UB.i18n('findItemInFolder'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('findItemInFolder'),
      eventId: 'findItemInFolder',
      cls: 'findItemInFolder-action',
      handler: me.doFindItemInFolder,
      hidden: true,
      scope: me
    })
    me.actions.editFileByWebDaw = new Ext.Action({
      actionId: 'editFileByWebDaw',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faPencil,
      tooltip: UB.i18n('editFileByWebDaw'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('editFileByWebDaw'),
      eventId: 'editFileByWebDaw',
      cls: 'editFileByWebDaw-action',
      handler: me.doEditFileByWebDaw,
      scope: me
    })
    me.actions.properties = new Ext.Action({
      actionId: 'properties',
      scale: 'medium',
      tooltip: UB.i18n('udiskProperties'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('udiskProperties'),
      eventId: 'properties',
      cls: 'properties-action',
      handler: me.openEditForm,
      scope: me
    })

    me.actions.copy = new Ext.Action({
      actionId: 'copy',
      scale: 'medium',
      tooltip: UB.i18n('udiskcopy'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('udiskcopy'),
      eventId: 'copy',
      cls: 'copy-action',
      handler: me.doCopyAction,
      scope: me
    })
    me.actions.cut = new Ext.Action({
      actionId: 'cut',
      scale: 'medium',
      tooltip: UB.i18n('udiskcut'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('udiskcut'),
      eventId: 'cut',
      cls: 'cut-action',
      handler: me.doCutAction,
      scope: me
    })
    me.actions.paste = new Ext.Action({
      actionId: 'paste',
      scale: 'medium',
      tooltip: UB.i18n('udiskpaste'), // + hotKeys[actions.saveAndClose].text,
      text: UB.i18n('udiskpaste'),
      eventId: 'paset',
      cls: 'paste-action',
      handler: me.doPasteAction,
      scope: me
    })
    me.actions.scan = new Ext.Action({
      actionId: 'scan',
      iconCls: 'iconScanner',
      tooltip: UB.i18n('skanirovat'),
      text: UB.i18n('skanirovat'),
      eventId: 'scan',
      handler: me.doScan,
      scope: me
    })
    me.actions.audit = new Ext.Action({
      actionId: 'audit',
      scale: 'medium',
      text: UB.i18n('showAudit'),
      eventId: 'audit',
      handler: me.onAudit,
      disabled: false, //! $App.domainInfo.get('ubs_audit').haveAccessToMethod('select'),
      hidden: !me.adminMode,

      tooltip: UB.i18n('showAudit'),
      scope: me
    })
    me.actions.auditRight = new Ext.Action({
      actionId: 'audit',
      scale: 'medium',
      text: UB.i18n('showAuditRight'),
      eventId: 'audit',
      handler: me.onAuditRight,
      hidden: !me.adminMode,
      disabled: false, //! $App.domainInfo.get('ubs_audit').haveAccessToMethod('select'),

      tooltip: UB.i18n('showAuditRight'),
      scope: me
    })

    me.createMenu = Ext.create('Ext.menu.Menu', {
      style: {
        overflow: 'visible'
      },
      items: [
        me.actions.makeFolder,
        me.actions.scan
      ]
    })
    me.actions.add = new Ext.Action({
      actionId: 'makeFolder',
      scale: 'medium',
      glyph: UB.core.UBUtil.glyphs.faPlusCircle,
      cls: 'add-new-action',
      text: UB.i18n('udiskAdd'),
      tooltip: UB.i18n('udiskAdd'),
      eventId: 'makeFolder',
      menu: me.createMenu,
      scope: me
    })
  },

  onAddTemplate: function (sender) {
    var me = this, params, fileName
    params = sender.actionParams
    fileName = params.fileName
    UDISK.AdminView.checkAccess(me.selectedFolderID, 'write', me.entityName)
      .then(function () {
        return $App.connection.run({
          method: 'checkNames',
          entity: me.entityName,
          execParams: {
            fileNames: [fileName],
            parentID: me.selectedFolderID
          }
        })
      }).then(function (response) {
        var nameInfo = JSON.parse(response.resultInfo)
        if (nameInfo[0].newName) {
          fileName = nameInfo[0].newName
        }
        return UB.xhr({
          url: params.path,
          responseType: 'arraybuffer'
        })
      }).then(function (result) {
        var entityID, lockExist = false, record
        return $App.connection.addNew({
          entity: me.entityName,
          fieldList: ['ID', 'name', 'parentID', 'fcomment', 'isFolder', 'ownerID', 'fileData']
        }).then(function (respAdd) {
          respAdd = UB.LocalDataStore.selectResultToArrayOfObjects(respAdd)
          var params = respAdd[0]
          params.name = fileName
          params.parentID = me.selectedFolderID || null
          params.isFolder = false
          return $App.connection.insert({
            entity: me.entityName,
            fieldList: ['ID', 'name', 'parentID', 'fcomment', 'isFolder', 'ownerID', 'fileData', 'mi_modifyDate'],
            execParams: params
          })
        }).then(function (respIns) {
          record = UB.LocalDataStore.selectResultToArrayOfObjects(respIns)
          record = record[0]
          entityID = record.ID
          return $App.connection.select({
            entity: me.entityName,
            ID: entityID,
            fieldList: ['ID'],
            lockType: 'ltTemp'
          }).then(function () {
            lockExist = true
            return respIns
          })
        }).then(function () {
          params = {
            entity: me.entityName,
            attribute: 'fileData',
            origName: fileName,
            filename: fileName,
            id: entityID
          }
          return $App.connection.post('setDocument', result.data, {
            params: params,
            headers: {'Content-Type': 'application/octet-stream'}
          }).then(function (resp) {
            resp.recordParams = record
            return resp
          })
        }).then(function (response) {
          params = {
            ID: entityID,
            fileData: JSON.stringify(response.data.result),
            mi_modifyDate: record.mi_modifyDate
          }
          return $App.connection.update({entity: me.entityName,
            fieldList: ['ID', 'fileData', 'mi_modifyDate'],
            execParams: params
          })
        }).fin(function (res) {
          if (lockExist) {
            return $App.connection.run({
              entity: me.entityName,
              method: 'unlock',
              ID: entityID
            }).then(function (result) {
              if (!result || !result.resultLock || !result.resultLock.success) {
                // todo  throw new Error();
              }
              return res
            })
          } else {
            return res
          }
        }).then(function () {
          me.refreshCurrent([entityID])
        })
      }).done()
  },

  initFileTemplates: function () {
    console.log('HURRAY' + UB.appConfig.udiscFileTemplates)
    var me = this
    me.templateActions = {}
    if (true) { // UB.appConfig.udiscFileTemplates){
      UB.xhr({
        url: 'models/UDISK/fileTemplates/' + me.entityName + '.JSON'
        //                url: UB.appConfig.udiscFileTemplates + '/' + me.entityName + '.JSON'
      }).done(function (result) {
        _.forEach(result.data, function (item, index) {
          var code = item.code || 'fileTemplateItem' + index
          me.templateActions[code] = new Ext.Action({
            actionId: code,
            scale: 'medium',
            actionParams: item,
            text: item.name,
            tooltip: item.name,
            handler: me.onAddTemplate,
            eventId: code,
            scope: me
          })
          me.createMenu.add(me.templateActions[code])
        })
      }, function (reason) {
        console.error(reason)
        return true
      })
    }
  },

  onAudit: function () {
    this.fileGrid.onAudit()
  },

  onAuditRight: function () {
    var
      me = this,
      sel = this.fileGrid.getSelectionModel().getSelection(),
      fieldList = ['actionTime', 'actionType', 'actionUser', 'remoteIP'],
      entityName = $App.domainInfo.get(me.entityName).attr('name').customSettings.permissionEntityName

    if (sel.length < 1) {
      return
    }

    var whereList = {
      entityExpr: {
        expression: '[entity]',
        condition: 'equal',
        values: {
          entity: entityName
        }
      },
      parentExpr: {
        expression: '[parentEntityInfo_id]',
        condition: 'equal',
        values: {
          parentEntityInfo_id: sel[0].get('ID')
        }
      }
    }

    $App.doCommand({
      cmdType: 'showList',
      isModalDialog: true,
      hideActions: ['addNew', 'addNewByCurrent', 'edit', 'del', 'newVersion'],
      cmdData: {
        params: [
          {
            entity: 'ubs_audit',
            method: UB.core.UBCommand.methodName.SELECT,
            fieldList: fieldList,
            whereList: whereList,
            orderList: {
              actionTime: {
                'expression': 'actionTime',
                'order': 'desc'
              }
            }
          }
        ]
      },
      cmpInitConfig: {
        onItemDblClick: function (grid, record, item, index, e, eOpts) {
          this.doOnEdit(eOpts)
        },
        afterInit: function () {
          var grid = this, grouper

          grid.store.oldGroup = grid.store.group
          grid.store.group = function (groupers, direction, suppressEvent) {
            var me = this
            if (!me.groupOptions) {
              me.oldGroup(groupers, direction, suppressEvent)
            }

            var newGroupers
            if (Ext.isArray(groupers)) {
              newGroupers = groupers
            } else if (Ext.isObject(groupers)) {
              newGroupers = [groupers]
            } else if (Ext.isString(groupers)) {
              grouper = me.groupers.get(groupers)

              if (!grouper) {
                grouper = {
                  property: groupers,
                  direction: direction || 'ASC'
                }
                newGroupers = [grouper]
              } else if (direction === undefined) {
                grouper.toggle()
              } else {
                grouper.setDirection(direction)
              }
            }

            _.forEeach(newGroupers, function (item) {
              var gc = me.groupOptions[item.property]
              if (gc) {
                item.getGroupString = gc.getGroupString
              }
            })
            me.oldGroup(newGroupers, direction, suppressEvent)
          }

          var dateTimeColumnInGrid = function (grid, columnName, format, formatGroup) {
            if (grid && grid.columns && columnName && format) {
              _.forEach(grid.columns, function (col) {
                if (col.dataIndex === columnName) {
                  col.format = format
                  col.renderer = Ext.util.Format.dateRenderer(format)

                  var store = grid.store
                  if (!store.groupOptions) {
                    store.groupOptions = {}
                  }

                  if (!store.groupOptions[columnName]) {
                    store.groupOptions[columnName] = {}
                  }

                  var gc = store.groupOptions[columnName]
                  gc.getGroupString = function (instance) {
                    return Ext.Date.format(instance.get(columnName), formatGroup)
                  }
                }
              })
            }
          }
          dateTimeColumnInGrid(grid, 'actionTime', 'd.m.Y H:i:s', 'd.m.Y')
        }
      }
    })
  },

  doScan: function () {
    var
      me = this, newID, mi_modifyDate,
      title = UB.i18n('skanirovanieAtributa'),
      resDS

    $App.scan(title, {})
      .then(function (result) {
        var fileName = UB.i18n('udiskScan') + ' ' + Ext.Date.format(new Date(), 'd.m.y G:i') + '.PDF'

        return new Promise((resolve, reject) => {
          Ext.Msg.prompt(UB.i18n('udiskNewFileName'), UB.i18n('udiskNewFileNamePrompt'), function (btn, text) {
            if (btn === 'ok') {
              fileName = text
              resolve(fileName)
            } else {
              reject(new UB.UBAbortError())
            }
          }, me, false, fileName)
        }).then(function () {
          return $App.connection.addNew({
            entity: me.entityName,
            method: 'addNew',
            fieldList: ['ID', 'name']
          })
        })
          .then(function (result) {
            resDS = UB.LocalDataStore.selectResultToArrayOfObjects(result)
            resDS = resDS[0]
            resDS.parentID = me.selectedFolderID > 0 ? me.selectedFolderID : null
            resDS.isTemporary = true
            resDS.isFolder = false
            resDS.name = fileName
            newID = resDS.ID
            return $App.connection.insert({
              entity: me.entityName,
              fieldList: ['ID', 'name', 'mi_modifyDate'],
              execParams: resDS
            })
          })
          .then(function (insertResult) {
            resDS = UB.LocalDataStore.selectResultToArrayOfObjects(insertResult)
            resDS = resDS[0]
            mi_modifyDate = resDS.mi_modifyDate
            return $App.connection.select({
              entity: me.entityName,
              ID: newID,
              fieldList: ['ID'],
              lockType: 'ltTemp'
            })
          })
          .then(function () {
            return $App.connection.post('setDocument', UB.base64toArrayBuffer(result), {
              params: {
                entity: me.entityName,
                attribute: 'fileData',
                id: newID,
                origName: fileName,
                filename: fileName
              },
              headers: {
                'Content-Type': 'application/octet-stream'
              }
            })
          })
          .then(function (resultDocument) {
            resDS = JSON.stringify(resultDocument.data.result)
            return $App.connection.update({
              entity: me.entityName,
              fieldList: ['ID', 'name'],
              execParams: {
                ID: newID,
                isTemporary: false,
                mi_modifyDate: mi_modifyDate,
                fileData: resDS
              }
            })
          })
          .then(function (res) {
            return $App.connection.run({
              entity: me.entityName,
              method: 'unlock',
              ID: newID
            }).then(function (result) {
              // if (!result || !result.resultLock || !result.resultLock.success){
              // todo  throw new Error();
              // }
              return res
            })
          })
      })
      .fail(function (fileError) {
        if (newID && mi_modifyDate) {
          $App.connection.select({
            entity: me.entityName,
            ID: newID,
            fieldList: ['ID'],
            lockType: 'ltTemp'
          }).then(function () {
            return $App.connection.delete({
              entity: me.entityName,
              fieldList: ['ID', 'name', 'mi_modifyDate'],
              execParams: {
                ID: newID,
                mi_modifyDate: mi_modifyDate
              }
            })
          }).done()
        }
        throw fileError
      })
      .done(function () {
        me.refreshCurrent([newID])
      })
  },

  doPasteAction: function (action) {
    var me = this, replaceAction, renamed = []
    if (!me.copyContext) {
      return
    }

    function doPasteInner () {
      me.copyContext.replaceAction = replaceAction
      $App.connection.run({
        entity: me.entityName,
        method: 'copy',
        fieldList: ['ID'],
        execParams: me.copyContext
      }).done()
      me.copyContext = null
      me.refreshCurrent()
      me.reloadFolders().done()
      me.buildMenuPath()
      me.updateAction()
    }
    me.copyContext.targetFolderID = me.selectedFolderID
    if (action === 'copy') {
      UB.Repository(me.entityName).attrs(['ID', 'name'])
        .where('parentID', '=', me.selectedFolderID)
        .where('name', 'in', me.copyContext.fileNames)
        .select().done(function (response) {
          if (response.lenght === 0) {
            doPasteInner()
          } else {
            _.forEach(response, function (rec) {
              renamed.push(rec.name)
            })
            Ext.Msg.confirm({
              buttons: Ext.MessageBox.YESNOCANCEL,
              icon: Ext.MessageBox.WARNING,
              buttonText: {
                yes: UB.i18n('udiskReplace'),
                no: UB.i18n('udiskAddNew'),
                cancel: UB.i18n('cancel')
              },
              minWidth: 320, // wrong layout when button protrudes beyond form
              title: UB.i18n('udiskReplaceFiles'),
              msg: Ext.String.format(UB.i18n('udiskReplaceFilesConfirm'), renamed.join(', ')),
              fn: function (btn) {
                if (btn === 'yes') {
                  replaceAction = 'replace'
                  doPasteInner()
                }
                if (btn === 'no') {
                  replaceAction = 'addNew'
                  doPasteInner()
                }
                if (btn === 'cancel') {

                }
              }
            })
          }
        })
    } else {
      doPasteInner()
    }
  },

  doCopy: function (action) {
    var me = this,
      selection, selectedIDs = [], selectedNames = []
    selection = me.fileGrid.getSelectionModel().getSelection()
    if (selection.length < 1) {
      me.copyContext = null
      return
    }
    _.forEach(selection, function (selected) {
      selectedIDs.push(selected.get('ID'))
      selectedNames.push(selected.get('name'))
    })
    me.copyContext = {
      sourceFolderID: me.selectedFolderID,
      selected: selectedIDs,
      fileNames: selectedNames,
      action: action
    }
    me.updateAction()
    me.reloadFolders().done()
  },

  doCopyAction: function (button) {
    this.doCopy('copy')
  },

  doCutAction: function (button) {
    this.doCopy('cut')
  },

  doEditFileByWebDaw: function (button) {
    var me = this, rec,
      plugin, host, port,
      selection = me.fileGrid.getSelectionModel().getSelection()
    if (selection.length < 1) {
      return
    }
    rec = selection[0]
    if (rec.get('isFolder')) {
      return
    }

    $App.connection.query({
      method: 'isLocked',
      entity: me.entityName,
      ID: rec.get('ID')
    }).done(function (result) {
      // result.lockInfo.lockExists
      if (result.lockInfo.lockExists && result.lockInfo.lockType !== 'None'
      // && result.lockInfo.lockUser !== $App.connection.userLogin()
      ) {
        throw new UB.UBError(
          Ext.String.format(UB.i18n('tempSoftLockInfo'),
            result.lockInfo.lockUser, Ext.Date.format(new Date(result.lockInfo.lockTime), 'd.m.Y H:i:s'))
        )
      }

      UDISK.AdminView.hasAccess(rec.get('ID'), 'write', me.entityName)
        .then(function (hasAccess) {
          if (!hasAccess) {
            return $App.dialogYesNo('udiskAcceptAction', 'udiskNoWriteAccess')
          }
          return hasAccess
        })
        .done(function (hasAccess) {
          if (hasAccess) {
            host = $App.connection.serverUrl.split('/')[2] // host:port
            host = host.split(':')
            if (host.length === 2) {
              port = host[1]
            }
            host = host[0]
            plugin = new UBNativeDocEdit()
            plugin.init().then(function () {
              return plugin.editDocument(
                ['\\', host + '@' + (port || '80'), me.WebdavProviderName, me.entityName, rec.get('ID'), rec.get('name')].join('\\')
              )
            }).done()
          }
        })
    })
  },

  doFindItemInFolder: function (button) {
    var me = this, rec, selection = me.fileGrid.getSelectionModel().getSelection()
    if (selection.length < 1) {
      return
    }
    rec = selection[0]
    me.selectedFolderID = rec.get('parentID') || 0
    me.refreshCurrent()
  },

  doShowHideTree: function (button) {
    if (this.mainTree.isHidden()) { // button.treeHidden
      this.mainTree.show()
    } else {
      this.mainTree.hide()
    }
    // button.treeHidden = !button.treeHidden;
  },

  doMakeFolder: function () {
    var me = this, win

    if (me.selectedFolderID < 0) {
      return
    }
    win = Ext.create('Ext.window.Window', {
      modal: true,
      title: UB.i18n('makeFolder'),
      height: 200,
      width: 400,
      layout: 'fit',
      items: [{
        xtype: 'form',
        margin: '4 4 4 4',
        layout: 'form',
        items: [
          {
            xtype: 'textfield',
            fieldLabel: UB.i18n('name'),
            allowBlank: false
          }]
      }],
      buttons: [{
        text: UB.i18n('ok'),
        handler: function () {
          var frm = win.down('form')
          if (!frm.isValid()) {
            return
          }
          $App.connection.addNew({ entity: me.entityName, fieldList: ['ID', 'name', 'parentID', 'fcomment', 'isFolder', 'ownerID', 'fileData']})
            .then(function (respAdd) {
              respAdd = UB.LocalDataStore.selectResultToArrayOfObjects(respAdd)
              var params = respAdd[0], textfield
              textfield = win.down('textfield')
              params.name = textfield.getValue()
              params.parentID = me.selectedFolderID < 3 ? null : me.selectedFolderID
              params.isFolder = true
              return $App.connection.insert({entity: me.entityName,
                fieldList: ['ID', 'name', 'parentID', 'fcomment', 'isFolder', 'ownerID', 'fileData', 'mi_modifyDate'],
                mode: me.mode,
                execParams: params
              })
            })
            .done(function (respIns) {
              win.close()
              me.refreshCurrent()
              me.reloadFolders().done()
            })
        }
      }, {
        text: UB.i18n('cancel'),
        handler: function () {
          win.close()
        }
      }]

    })
    win.show()
  },

  doEditShare: function (btn) {
    var me = this, rec, selection, store

    if (me.treeMenuActive && !btn.btnInMenu) {
      if (!me.selectedFolderID) {
        return
      }
      store = Ext.create('UB.ux.data.UBStore', {
        ubRequest: {
          entity: me.entityName,
          method: (me.mode === 'admin') ? 'adminSelect' : 'select',
          fieldList: me.fieldList,
          mode: me.mode,
          diskType: me.diskType,
          orderList: me.orderList,
          ID: me.selectedFolderID
        },
        autoLoad: false,
        autoDestroy: true
      })
      store.on('load', function () {
        me.editShare(store.first())
      }, me, {single: true})
      store.load()
    } else {
      selection = me.fileGrid.getSelectionModel().getSelection()
      if (selection.length < 1) {
        return
      }
      rec = selection[0]
      me.editShare(rec)
    }
  },

  editShare: function (record) {
    var me = this, entityName, win, itemId, treePath
    entityName = $App.domainInfo.get(me.entityName).attr('name').customSettings.permissionEntityName // 'udisk_permission';
    itemId = record.get('ID')
    treePath = record.get('mi_treePath')

    win = Ext.create('UDISK.AdminEditShare', {
      entityName: entityName,
      mainEntityName: me.entityName,
      mode: me.mode,
      itemId: itemId,
      diskType: me.diskType,
      fileName: me.treeMenuActive ? me.currentPathText : me.currentPathText + '\\' + record.get('name'),
      isFolder: record.get('isFolder'),
      treePath: treePath
    })
    win.show()
  },

  doUpload: function () {
    var me = this, frm, parentID = me.selectedFolderID < 3 ? null : me.selectedFolderID
    // UDISK.AdminView.checkAccess(parentID, 'write' )
    // .done(function() {

    frm = Ext.create('UDISK.AdminUploadForm', {
      scope: this,
      parentID: parentID,
      entityName: me.entityName,
      callback: function (result) {
        me.refreshCurrent()
      }
    })
    frm.upLoad().done(function (response) {
      if (response !== 0) {
        me.refreshCurrent()
      }
    })
    // });
  },

  doDownload: function () {
    var me = this, rec, selection = me.fileGrid.getSelectionModel().getSelection()
    if (selection.length < 1) {
      return
    }
    rec = selection[0]
    me.downloadFile(rec.get('name'), /* rec.get('fileInfo') */ JSON.parse(rec.get('fileData')), rec.get('ID'))
  },

  createSearchMenu: function () {
    var me = this, textField, plugins, multifilter

    plugins = me.fileGrid.plugins || []
    plugins.forEach(function (item) {
      if (item.ptype === 'multifilter') {
        multifilter = item
        return false
      }
    })

    textField = Ext.widget('textfield', {
      labelWidth: 0

    })
    textField.on('specialkey', function (sender, e) {
      if (e.getKey() === e.ENTER) {
        e.stopEvent()
        me.doSearch(textField)
      }
    }, me)
    me.searchToolBarMenu = Ext.widget('toolbar', {
      items: [
        multifilter,
        textField,
        {
          xtype: 'button',
          glyph: UB.core.UBUtil.glyphs.faSearch,
          tooltip: UB.i18n('search'),
          handler: function (button) {
            me.doSearch(textField, button)
          }
        }
      ]
    })
  },

  doSearchInternal: function (treePath, textField) {
    var me = this, filter, request
    request = {
      entity: me.entityName,
      method: 'select',
      fieldList: me.fieldList,
      whereList: {
        temp: me.isTempWhere
        //, permUserWhere: me.permUserWhere
      },
      // joinAs: me.joinAs,
      orderList: me.orderList
    }

    if (treePath) {
      request.whereList = {
        parent: {
          expression: '[mi_treePath]',
          condition: 'startWith',
          values: {'mi_treePath': treePath}
        }
      }
    }

    filter = {
      condition: 'like',
      property: 'name',
      value: textField.getValue()
    }
    me.fileGridStore.ubRequest = request

    me.fileGridStore.clearFilter(true)
    me.fileGridStore.filter([filter])

    me.buildMenuPath()
    me.actions.findItemInFolder.show()
    me.updateAction()
  },

  doSearch: function (textField) {
    var me = this
    if (me.selectedFolderID >= 0) {
      me.lastSelectedFolderId = me.selectedFolderID
    }
    me.selectedFolderID = -1

    if (me.lastSelectedFolderId > 0) {
      UB.Repository(me.entityName).attrs(['ID', 'parentID', 'mi_treePath'])
        .where('ID', '=', me.lastSelectedFolderId)
        .using(me.adminMode ? 'adminSelect' : 'select')
        .select().done(function (response) {
          me.doSearchInternal(response[0].mi_treePath, textField)
          // here response is in [{ID: 10, code: 'value1'}, .... {}] format
        })
    } else {
      me.doSearchInternal(null, textField)
    }
  },

  /**
     * build path like "Breadcrumbs" in top toolbar menu
     */
  buildMenuPath: function () {
    var me = this, id, currentNode, pathCmp = []
    id = me.selectedFolderID
    me.currentPathText = ''
    if (id < 0) {
      id = me.lastSelectedFolderId
    }

    function addFolder (node) {
      var btn, parentNode = node.parentNode // && node.parentNode.get('id') > 0 ? node.parentNode: null;

      me.currentPathText = node.get('text') + (me.currentPathText.length > 0 ? '\\' : '') + me.currentPathText
      btn = Ext.create('Ext.button.Button', {
        text: node.get('text'),
        margin: '0 0 0 0',
        style: {marginLeft: '1px', marginRight: '1px'},
        handler: me.menuButtonClick.bind(me)
      })
      btn.nodeId = node.get('id')
      pathCmp.unshift(btn)
      if (parentNode) {
        pathCmp.unshift({xtype: 'component', html: '>', margin: '0 0 0 0'})
        addFolder(parentNode)
      }
    }
    function buildPath () {
      currentNode = me.mainTreeStore.getNodeById(id)
      addFolder(currentNode)
      if (me.selectedFolderID < 0) {
        pathCmp.push({xtype: 'component', html: UB.i18n('searchResult')})
      }

      Ext.suspendLayouts()
      try {
        me.breadCrumbs.removeAll(true)
        me.breadCrumbs.add(pathCmp)
      } finally {
        Ext.resumeLayouts()
      }
      me.breadCrumbs.updateLayout()
    }
    if (me.isReloadFolders) {
      me.on('foldersLoadOver', function () {
        buildPath()
      }, me, {single: true})
    } else {
      buildPath()
    }
  },

  menuButtonClick: function (button) {
    var me = this //, currentNode;
    me.selectedFolderID = button.nodeId
    // currentNode = me.mainTreeStore.getNodeById(me.selectedFolderID);
    // me.mainTree.getSelectionModel().select(currentNode);
    me.mainTree.getSelectionModel().deselectAll(true)
    me.fileGrid.getSelectionModel().deselectAll(true)

    me.refreshCurrent()
  },

  refreshCurrent: function (idToSelect) {
    var me = this, id, filter, request
    id = me.selectedFolderID
    request = {
      entity: me.entityName,
      method: (me.mode === 'admin') ? 'adminSelect' : 'select',
      fieldList: me.fieldList,
      mode: me.mode,
      whereList: {
        temp: me.isTempWhere
        //, permUserWhere: me.permUserWhere
      },
      // joinAs: me.joinAs,
      orderList: me.orderList
    }

    filter = {
      condition: 'equal',
      property: 'parentID'
    }
    switch (id) {
      case 0: filter.condition = 'isNull'; break
      default:
        filter.value = id
    }
    me.fileGridStore.ubRequest = request

    me.fileGridStore.clearFilter(true)
    me.fileGridStore.on('load', function () {
      var selRec = []
      me.buildMenuPath()
      me.updateAction()
      me.actions.findItemInFolder.hide()
      if (idToSelect) {
        _.forEach(idToSelect, function (itemId) {
          var rec = me.fileGridStore.findRecord('ID', itemId)
          if (rec) {
            selRec.push(rec)
          }
        })
        if (selRec.length > 0) {
          me.fileGrid.getSelectionModel().select(selRec, true)
        }
      }
    }, me, {single: true})
    if (filter) {
      me.fileGridStore.filter([filter])
    } else {
      me.fileGridStore.reload()
    }
  },

  onNodeSelect: function (selModel, record, index, eOpts) {
    var me = this, id = record.get('id')

    me.selectedFolderID = id
    me.refreshCurrent()
  },

  doRefresh: function () {
    var me = this
    me.reloadFolders().done(function () {
      me.refreshCurrent()
    })
  },

  doDelete: function (btn) {
    var me = this, selection = me.fileGrid.getSelectionModel().getSelection(), count, parentID

    if (me.treeMenuActive && !btn.btnInMenu) {
      if (!me.selectedFolderID) {
        return
      }
      count = 1
    } else {
      if (selection.length < 1) {
        return
      }
      count = selection.length
    }

    function delFile (ID) {
      return UB.Repository(me.entityName).attrs(['ID', 'mi_modifyDate'])
        .where('ID', '=', ID)
        .misc('mode', me.mode)
        .using(me.adminMode ? 'adminSelect' : 'select')
        .select()
        .then(function (ds) {
          if (!ds || ds.length === 0) {
            return true
          }
          return $App.connection.doDelete({entity: me.entityName,
            fieldList: ['ID'],
            method: me.adminMode ? 'adminDelete' : 'delete',
            mode: me.adminMode ? 'admin' : '',
            execParams: ds[0]
          })
        })
    }

    $App.dialogYesNo('podtverditUdalenije', Ext.String.format(UB.i18n('willBeDeleteFiles'), count))
      .then(function (res) {
        if (!res) {
          throw new UB.UBAbortError()
        }
        if (me.treeMenuActive) {
          parentID = me.mainTreeStore.getNodeById(me.selectedFolderID).parentNode
          parentID = parentID ? parentID.get('id') : null
          return delFile(me.selectedFolderID)
        } else {
          return Q.all(selection.map(function (record) {
            return delFile(record.get('ID'))
          }))
        }
      }).done(function () {
        if (parentID) {
          me.selectedFolderID = parentID
        }
        me.reloadFolders().done(function () {
          me.refreshCurrent()
        })
      })
  },

  /**
     *
     * @returns {Promise}
     */
  reloadFolders: function () {
    var me = this, treeRoot
    treeRoot = me.mainTreeStore.getRootNode()
    me.isReloadFolders = true

    function openCurrentPath (root) {
      var selectedFolder
      if (!me.selectedFolderID) {
        return
      }
      function checkFolder (master) {
        if (master.id === me.selectedFolderID) {
          selectedFolder = master
          master.expanded = true
          return false
        }
        if (master.children) {
          _.forEach(master.children, checkFolder)
        }
        if (selectedFolder) {
          // master.expanded = true;
          return false
        }
      }
      checkFolder(root)
    }
    function expandTree (node) {
      node.expand()
      if (node.parentNode) {
        expandTree(node.parentNode)
      }
    }

    return $App.connection.select({entity: me.entityName,
      method: (me.mode === 'admin') ? 'adminSelect' : 'select',
      fieldList: ['ID', 'name', 'parentID', 'isFolder', 'ownerID', 'fileData' /*, 'permission.accessType' */ ],
      mode: me.mode,
      whereList: {
        isFolder: {condition: 'equal', expression: '[isFolder]', values: {isFolder: true }}
      }
    })
      .then(function (response) {
        var data = UB.LocalDataStore.selectResultToArrayOfObjects(response),
          treeData, lroot, selEl
        treeData = data.map(function (item) {
          return {
            id: item.ID,
            leaf: false, //! item.isFolder,
            parentId: item.parentID,
            text: item.name,
            expanded: false,
            // accessType: item['permission.accessType'],
            iconCls: 'udisk-folder-img'
          }
        })

        lroot = UB.core.UBUtilTree.arrayToTreeRootNode(treeData)
        // openCurrentPath(lroot);

        Ext.suspendLayouts()
        try {
          treeRoot.removeAll(false, true)
          UB.core.UBUtilTree.addToParent(treeRoot, lroot.children)
          if (me.selectedFolderID) {
            selEl = me.mainTreeStore.getNodeById(me.selectedFolderID)
            if (selEl) {
              expandTree(selEl)
              /*
              if (selEl.childNodes.length > 0) {
                  selEl.expand(true);
              } else {
                  if (selEl.parentNode) {
                      selEl.parentNode.expand(true);
                  }
              }
              */
            }
          }
          // me.mainTree.updateLayout();
          me.isReloadFolders = false

          me.fireEvent('foldersLoadOver', me)
          me.mainTree.updateLayout()

          me.buildMenuPath()
        } finally {
          Ext.resumeLayouts()
        }
        me.breadCrumbs.updateLayout()
      }, function (reason) {
        me.isReloadFolders = false
        throw reason
      })
  },

  dataMainDisk: function () {
    var root
    root = {
      text: UB.i18n('mainDisk'),
      leaf: false,
      id: 0,
      expanded: false,
      iconCls: 'udisk-folder-img',
      accessType: 'owner',
      children: []
    }
    return root
  }
})
