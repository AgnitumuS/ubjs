/* global Ext */
require('./UBDetailTreeColumn')
/**
 * Container for detail tree.
 * TODO - describe usage
 * @author UnityBase core team
 */
Ext.define('UB.ux.UBDetailTree', {
  extend: 'Ext.tree.Panel',
  // requires: [
  //     'UB.ux.UBDetailTreeColumn'
  // ],
  alias: 'widget.ubdetailtree',
  cls: 'ub-tree',
  useArrows: true,
  hideHeaders: true,
  layout: 'fit',
  localXY: [0, 0],
  behaviors: {},
  expandedNodes: {},
  lastSelectionId: null,
  mixins: {
    ubPanelMixin: 'UB.core.UBPanelMixin'
  },
  statics: {
    actionId: {
      addNew: 'addNew',
      edit: 'edit',
      deleteItem: 'deleteItem',
      refresh: 'refresh',
      up: 'up',
      down: 'down'
    },

    eventId: {
      addnew: 'addnew',
      edit: 'edit',
      deleteItem: 'deleteitem',
      afterdel: 'afterdel',
      refresh: 'refresh',
      up: 'up',
      down: 'down'
    }
  },

  /**
   *  @cfg {Boolean} force If set to true will force tree to create and load underline store even if tree is placed onto inactive tab
   *  Be carefully - by default only first data page if loading. Set `pageSize to 0 to load lo all data (not recommended)
   */
  forceDataLoad: false,

  listeners: {
    resize: function () {
      if (this.editPanel.resizer) {
        this.editPanel.resizer.resizeTracker.maxHeight = this.getHeight()
      }
      this.editPanel.setHeight(Math.min(this.getHeight(), this.editPanel.getHeight()))
    },
    boxready: function () {
      if (!this.forceDataLoad) {
        this.reloadTree()
      }
    }
  },

  /**
   * @cfg {Boolean} readOnly
   * Read only grid do not show actions: addNew,  addNewByCurrent, del, edit, newVersion.
   */
  readOnly: false,

  initComponent: function () {
    var me = this
    me.columns = [
      {
        xtype: 'ubdetailtreecolumn',
        width: '100%',
        dataIndex: 'text',
        sortable: false,
        hideable: false,
        draggable: false,
        resizable: false,
        templates: null,
        renderer: function (value, metaData, record/*, rowIdx, colIdx, store, view */) {
          var template = this.templates[record.raw.nodeType]
          if (!template) {
            var msg = Ext.util.Format.format(UB.i18n('nodeTemplateNotFound'), record.raw.ID, record.raw.nodeType)
            UB.showErrorWindow(msg)
            throw new Error(msg)
          }
          return template.apply(record.raw)
        }
      }
    ]
    me.editPanel = Ext.widget({
      xtype: 'panel',
      header: false,
      dock: 'bottom',
      hidden: true,
      resizable: true,
      resizeHandles: 'n',
      minHeight: 200,
      layout: 'fit',
      parent: this,
      listeners: {
        show: function () {
          this.resizer.resizeTracker.maxHeight = this.parent.getHeight()
        },
        remove: function () {
          var toolBar = me.getDockedItems('toolbar[dock="top"]')[0]
          this.hide()
          if (toolBar) {
            toolBar.enable()
          }
          me.editing = false
        }
      }
    })

    me.actions = me.actions || {}

    me.preprocessPanel()
    me.dockedItems = me.dockedItems || []
    me.dockedItems.push(me.editPanel)

    me.callParent(arguments)

    me.on({
      beforeselect: me.onBeforeSelect,
      scope: me
    })
  },

  addBaseActions: function () {
    var
      me = this
    var actions = UB.ux.UBDetailTree.actionId
    var events = UB.ux.UBDetailTree.eventId
    // hotKeys = UB.ux.UBDetailTree.hotKeys;

    me.actions[actions.addNew] = new Ext.Action({
      actionId: actions.addNew,
      iconCls: 'u-icon-add',
      cls: 'add-new-action',
      tooltip: UB.i18n('actionAdd'), // + hotKeys[actions.addNew].text,
      eventId: events.addnew,
      disabled: true,
      // handler: me.onAction,
      menu: [],
      scope: me
    })

    me.actions[actions.refresh] = new Ext.Action({
      actionId: actions.refresh,
      iconCls: 'u-icon-refresh',
      cls: 'refresh-action',
      tooltip: UB.i18n('refresh'), // + hotKeys[actions.refresh].text,
      eventId: events.refresh,
      handler: me.onAction,
      scope: me
    })

    me.actions[actions.edit] = new Ext.Action({
      actionId: actions.edit,
      iconCls: 'u-icon-edit',
      cls: 'edit-action',
      tooltip: UB.i18n('Edit'), // + hotKeys[actions.addNew].text,
      eventId: events.edit,
      handler: me.onAction,
      scope: me
    })

    me.actions[actions.deleteItem] = new Ext.Action({
      actionId: actions.deleteItem,
      iconCls: 'u-icon-delete',
      cls: 'delete-action',
      tooltip: UB.i18n('Delete'), // + hotKeys[actions.addNew].text,
      eventId: events.deleteItem,
      handler: me.onAction,
      scope: me
    })

    me.actions[actions.up] = new Ext.Action({
      actionId: actions.up,
      iconCls: 'u-icon-arrow-up',
      cls: 'up-action',
      hidden: true,
      eventId: events.up,
      handler: me.onAction,
      scope: me
    })

    me.actions[actions.down] = new Ext.Action({
      actionId: actions.down,
      iconCls: 'u-icon-arrow-down',
      cls: 'down-action',
      hidden: true,
      eventId: events.down,
      handler: me.onAction,
      scope: me
    })
  },

  addBaseDockedItems: function () {
    var
      me = this
    var actions = UB.ux.UBDetailTree.actionId
    var menuAllActions = [
      me.actions[actions.refresh],
      me.actions[actions.addNew],
      me.actions[actions.edit],
      me.actions[actions.deleteItem],
      me.actions[actions.up],
      me.actions[actions.down]
    ]

    me.dockedItems = [{
      xtype: 'toolbar',
      dock: 'top',
      items: menuAllActions
    }]
  },

  addBaseListeners: function () {
    var
      me = this
    var events = UB.ux.UBDetailTree.eventId
    me.on('itemdblclick', me.onEditItem, me)
    me.on(events.addnew, me.onAddItem, me)
    me.on(events.edit, me.onEditItem, me)
    me.on(events.deleteItem, me.onDeleteItem, me)

    me.on(events.refresh, me.reloadTree, me)
    me.on(events.up, me.moveUp, me)
    me.on(events.down, me.moveDown, me)

    if (me.readOnly) {
      me.setReadOnly(me.readOnly)
    }
  },

  /**
   * @private
   * @param {String} actionName
   */
  hideAction: function (actionName) {
    var me = this; var action
    action = me.actions[actionName]
    if (action) {
      action.blocked = true
      action.disable()
      action.hide()
    }
  },

  /**
   * @private
   * @param {String} actionName
   */
  showAction: function (actionName) {
    var me = this; var action
    action = me.actions[actionName]
    if (action) {
      action.blocked = true
      action.setDisabled(false)
      action.show()
    }
  },

  /**
   * @param {Boolean} value
   * Disable or enable all action which potentially change data.
   */
  setReadOnly: function (value) {
    var me = this
    me.readOnly = value
    if (value) {
      me.hideAction('addNew')
      me.hideAction('deleteItem')
      me.hideAction('edit')
    } else {
      me.showAction('addNew')
      me.showAction('deleteItem')
      me.showAction('edit')
    }
  },

  onAction: function (action) {
    var
      me = this

    Ext.callback(me.eventHandler, me, [me, action.eventId])
    me.fireEvent(action.eventId, action)
  },

  onBeforeSelect: function (sender, selection) {
    var
      me = this
    var actions = UB.ux.UBDetailTree.actionId
    var nodeType = selection.raw.nodeType
    var behavior = me.behaviors[nodeType]
    if (me.editing) {
      return
    }
    me.lastSelectionId = selection.raw.ID

    if (behavior) {
      me.actions[actions.edit].setDisabled(!behavior.onEdit)
      if (!Ext.isDefined(selection.raw.deletable)) {
        selection.raw.deletable = true
      }
      me.actions[actions.deleteItem].setDisabled(!selection.raw.deletable)

      if (behavior.allowedMove) {
        var parent = selection.parentNode
        if (parent && parent.childNodes) {
          me.actions[actions.up].setDisabled(parent.childNodes.indexOf(selection) <= 0)
          me.actions[actions.down].setDisabled(parent.childNodes.indexOf(selection) >= parent.childNodes.length - 1)
        }
      } else {
        me.actions[actions.up].setDisabled(true)
        me.actions[actions.down].setDisabled(true)
      }
      var action = me.actions[actions.addNew]
      if (!behavior.allowedChildren || !behavior.allowedChildren.length) {
        action.disable()
        return
      }
      action.enable()
      action.each(function (cmp) {
        var menu = cmp.menu
        menu.removeAll(true)

        Ext.Array.each(behavior.allowedChildren || [], function (value) {
          menu.add({
            xtype: 'menuitem',
            text: me.behaviors[value].title,
            handler: function () {
              var action = me.actions[actions.addNew].items[0]
              me.fireEvent(action.eventId, action, value)
            }
          })
        })
      })
    }
  },

  applyData: function (root, templates, behaviors) {
    var me = this
    // toolBar = me.getDockedItems('toolbar[dock="top"]')[0],
    var actions = UB.ux.UBDetailTree.actionId
    var hasMoveableNodes = behaviors.some(function (behavior) {
      return behavior.allowedMove
    })

    me.actions[actions.up].setHidden(!hasMoveableNodes)
    me.actions[actions.down].setHidden(!hasMoveableNodes)
    me.behaviors = {}
    Ext.Array.each(behaviors, function (item) {
      me.behaviors[item.nodeType] = item
    })
    me.setTemplates(templates)
    me.expandNode(root)
    me.setRootNode(root)
    if (me.rendered) {
      me.getView().scrollBy(me.localXY)
    }
    var wasEditing = me.editing
    // need to temporary reset me.editing before selection, because if tree is in editing mode - selection doesn't work
    me.editing = false
    if (me.lastSelectionId) {
      var
        rec = null
      me.getRootNode().cascadeBy(function (node) {
        if (node && node.raw.ID === me.lastSelectionId) {
          rec = node
        }
      }, true)
      if (rec) {
        me.getSelectionModel().select([rec])
      }
    } else {
      me.getSelectionModel().select([me.getRootNode()])
    }
    // restore me.editing
    me.editing = wasEditing

    me.unmaskTree()
    me.fireEvent('applyData')
    this.on('afterrender', function () {
      me.getSelectionModel().select([me.getRootNode()])
    })
    // toolBar.enable();
  },

  setTemplates: function (templates) {
    this.columns[0].templates = templates
  },
  expandNode: function (node) {
    var
      me = this
    var expandedNodes = me.expandedNodes || {}
    var newNodes = {}
    var recursiveFn = function (node) {
      var i, len, arr
      if (expandedNodes[node.ID]) {
        node.expanded = true
      }
      newNodes[node.ID] = true
      if (node.children) {
        arr = node.children
        for (i = 0, len = arr.length; i < len; ++i) {
          recursiveFn(arr[i])
        }
      }
    }
    recursiveFn(node)
    Ext.Object.each(expandedNodes, function (key) {
      if (!newNodes[key]) {
        delete expandedNodes[key]
      }
    })
  },

  onDeleteItem: function () {
    const me = this
    const behaviors = me.behaviors
    const selection = me.getSelectionModel().getSelection()[0]

    if (!selection) return

    return $App.dialogYesNo('deletionDialogConfirmCaption', 'areYouSure')
      .then(choise => {
        if (choise) {
          const param = {
            entity: behaviors[selection.raw.nodeType].entity,
            method: UB.core.UBCommand.methodName.DELETE,
            execParams: { ID: selection.raw.ID }
          }
          me.maskTree()
          UB.core.UBService.runList([param], Ext.Function.bind(me.afterDelete, me, [param.entity], true), me)
        } else return
      })
  },

  afterDelete: function (response, request, entity) {
    var me = this
    // result = response ? UB.core.UBUtil.getByPropertyValue(response, 'entity', entity) : null;
    if (!response.serverFailure) {
      me.lastSelectionId = null
      me.reloadTree()
      me.fireEvent(UB.ux.UBDetailTree.eventId.afterdel)
    } else {
      me.unmaskTree()
    }
  },

  onEditItem: function () {
    var me = this
    var basepanel = me.up('basepanel')
    var selection = me.getSelectionModel().getSelection()[0]
    var parentNode = selection ? selection.parentNode : null
    var root = me.getRootNode()
    var editPanel = me.editPanel
    var toolBar = me.getDockedItems('toolbar[dock="top"]')[0]
    var instanceID; var behavior = {}; var promise
    if (basepanel) {
      promise = basepanel.saveForm()
    } else {
      promise = Promise.resolve(1)
    }
    promise.then(function (saveStatus) {
      if (saveStatus < 0) {
        return
      }
      if (selection && selection.raw) {
        behavior = me.behaviors[selection.raw.nodeType]
      }
      if (me.editing || !selection || ((root === selection) && !me.rootVisible) || !behavior.onEdit) {
        return
      }
      instanceID = selection.raw.ID

      var config = {}
      if (me.formViewType === 'window') {
        config = {
          instanceID: instanceID,
          entity: behavior.entity,
          formCode: behavior.onEdit,
          method: 'select',
          cmdType: UB.core.UBCommand.commandType.showForm,
          isModal: true,
          sender: me,
          eventHandler: Ext.Function.bind(me.eventHandler, me, [], true),
          customParams: {
            parentNode: parentNode
          }
        }
        if (behavior.onEditTitle) {
          config.description = behavior.onEditTitle
        }
        UB.core.UBApp.doCommand(config)
      } else {
        editPanel.show().expand()
        config = {
          instanceID: instanceID,
          entity: behavior.entity,
          formCode: behavior.onEdit,
          method: 'select',
          cmdType: UB.core.UBCommand.commandType.showForm,
          isModal: true,
          sender: me,
          cmpInitConfig: {
            closable: true
          },
          eventHandler: Ext.Function.bind(me.eventHandler, me, [], true),
          target: editPanel,
          customParams: {
            parentNode: parentNode
          }
        }
        if (behavior.onEditTitle) {
          config.description = behavior.onEditTitle
        }
        UB.core.UBApp.doCommand(config)
        toolBar.disable()
        me.editing = true
      }
    })
  },

  onAddItem: function (action, nodeType) {
    var
      me = this
    var basepanel = me.up('basepanel')
    var editPanel = me.editPanel
    var parentNode = me.getSelectionModel().getSelection()[0]
    var rootNode = me.getRootNode()
    var toolBar = me.getDockedItems('toolbar[dock="top"]')[0]
    var behavior = me.behaviors[nodeType]
    var initValue = {}
    var promise

    if (basepanel) {
      promise = basepanel.saveForm()
    } else {
      promise = Promise.resolve(1)
    }
    promise.then(function (saveStatus) {
      if (saveStatus < 0) {
        return
      }
      parentNode.expand()
      initValue[behavior.parentField] = parentNode.raw.ID
      initValue.docID = rootNode.raw.ID

      var config = {}
      switch (me.formViewType) {
        case 'window':
          config = {
            formCode: behavior.onAdd,
            cmdType: UB.core.UBCommand.commandType.showForm,
            entity: behavior.entity,
            initValue: initValue,
            isModal: true,
            sender: me,
            eventHandler: Ext.Function.bind(me.eventHandler, me, [], true),
            customParams: {
              parentNode: parentNode
            }
          }
          if (behavior.onAddTitle) {
            config.description = behavior.onAddTitle
          }
          UB.core.UBApp.doCommand(config)
          break
        default:
          editPanel.show().expand()
          config = {
            formCode: behavior.onAdd,
            cmdType: UB.core.UBCommand.commandType.showForm,
            entity: behavior.entity,
            cmpInitConfig: {
              closable: true
            },
            initValue: initValue,
            sender: me,
            eventHandler: Ext.Function.bind(me.eventHandler, me, [], true),
            target: editPanel,
            customParams: {
              parentNode: parentNode
            }
          }
          if (behavior.onAddTitle) {
            config.description = behavior.onAddTitle
          }
          UB.core.UBApp.doCommand(config)
          toolBar.disable()
          me.editing = true
          break
      }
    })
  },

  expandToCurrentNode: function (node) {
    if (node) {
      var parent = node.parentNode
      while (parent && (parent !== this.getRootNode())) {
        parent.expand()
        parent = parent.parentNode
      }
      return true
    } else {
      return false
    }
  },

  eventHandler: function (sender, event) {
    if (event === 'aftersave') {
      this.reloadTree()
    } else if (event === 'afterdelete') {
      this.lastSelectionId = null
      this.reloadTree()
    }
  },

  reloadTree: function () {
    var
      me = this
    var nodes = {}
    var root = me.getRootNode()

    var recursiveFn = function (node) {
      var i, len, arr
      nodes[node.raw.ID] = node.isExpanded()
      if (node.childNodes) {
        arr = node.childNodes
        for (i = 0, len = arr.length; i < len; ++i) {
          recursiveFn(arr[i])
        }
      }
    }

    me.maskTree()
    if (root) {
      recursiveFn(root)
      me.expandedNodes = nodes
      if (me.rendered) {
        var dom = me.getView().el.dom
        me.localXY = [dom.scrollLeft, dom.scrollTop]
      }
    }

    me.fireEvent('reloadtree')
  },

  maskTree: function () {
    var me = this
    if (me.rendered) {
      me.getEl().mask(UB.i18n('loadingData'))
    }
  },

  unmaskTree: function () {
    var me = this
    if (me.rendered) {
      me.getEl().unmask()
    }
  },

  moveUp: function () {
    var selection = this.getSelectionModel().getSelection()[0]
    var parent = selection.parentNode
    if (!parent) {
      return
    }
    var position = parent.childNodes.indexOf(selection)
    if (position > 0) {
      var other = parent.childNodes[position - 1]
      this.doExchange(selection, other, selection.raw.orderEntity)
    }
  },
  moveDown: function () {
    var selection = this.getSelectionModel().getSelection()[0]
    var parent = selection.parentNode
    if (!parent) {
      return
    }
    var position = parent.childNodes.indexOf(selection)
    if (position < parent.childNodes.length - 1 && position !== -1) {
      var other = parent.childNodes[position + 1]
      this.doExchange(selection, other, selection.raw.orderEntity)
    }
  },

  /**
   *
   * @param fst
   * @param snd
   * @param orderEntity - entity name with orderIndex field
   */
  doExchange: function (fst, snd, orderEntity) {
    var me = this; var isEntityLockable; var entity
    if (!orderEntity) {
      return
    }
    entity = orderEntity
    isEntityLockable = $App.domainInfo.get(entity).hasMixin('softLock')

    var tmp = fst.raw.orderIndex
    fst.raw.orderIndex = snd.raw.orderIndex
    snd.raw.orderIndex = tmp
    UB.core.UBService.runList([
      {
        entity: entity,
        method: 'update',
        lockType: isEntityLockable ? 'ltTemp' : undefined,
        execParams: {
          ID: fst.raw.orderKeyField,
          orderIndex: fst.raw.orderIndex,
          mi_modifyDate: fst.raw.mi_modifyDate
        }
      }, {
        entity: entity,
        method: 'update',
        lockType: isEntityLockable ? 'ltTemp' : undefined,
        execParams: {
          ID: snd.raw.orderKeyField,
          orderIndex: snd.raw.orderIndex,
          mi_modifyDate: snd.raw.mi_modifyDate
        }
      }
    ],
    function (response) {
      if (!response.serverFailure) {
        me.reloadTree()
        var result = response[0]
        if (result && result.resultLock && result.resultLock.success) {
          UB.ux.LockManager.checkUnlock(entity, result.resultLock.lockValue)
        }
        result = response[1]
        if (result && result.resultLock && result.resultLock.success) {
          UB.ux.LockManager.checkUnlock(entity, result.resultLock.lockValue)
        }
      }
    }, me
    )
  },

  /**
   * Wrapper for load tree data that is called by parent form BasePanel when starts
   * @param {Ext.data.Model} record
   * @param {String} parentEntityName
   */
  setValue: function (record, parentEntityName) {
    this.onRefreshDetail(record)
  },

  /**
   * Wrapper for reload tree data that is called by parent form BasePanel when refreshes
   * @param {Ext.data.Model} record
   */
  onRefreshDetail: function (record) {
    if (this.rendered || this.forceDataLoad) {
      this.reloadTree()
    }
  }
})
