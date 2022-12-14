/* -------------------------------------------------------------------
 Ext.ux.form.TinyMCETextArea

 ExtJS form field - a text area with integrated TinyMCE WYSIWYG Editor

 Version: 4.0.1
 Release date: 17.12.2013
 ExtJS Version: 4.2.1
 TinyMCE Version: 4.0.11
 License: LGPL v2.1 or later, Sencha License

 Author: Oleg Schildt
 E-Mail: Oleg.Schildt@gmail.com

 Copyright (c) 2013 Oleg Schildt

 Adopted for UnityBase & TinyMCE Version: 4.5.1 by pavel.mash

 Following issues are covered:

 - Initialization in an initially visible and in an initially invisible tab.
 - Correct place occupation by the initialization in any ExtJS layout.
 - Correct resizing by the resizing of the underlying text area.
 - Activation and deactivation of the WYSIWYG editor.
 - Enabling and disabling of the WYSIWYG editor control.
 - ReadOnly state support.
 - Changing of WYSIWYG settings and CSS file for the editable contents on the fly.
 - Pre-formatting of the HTML text in visible and invisible modus.
 - Focusing of the WYSIWYG editor control.
 - Marking invalid.
 - Tracking dirty state.
 - Storing and restoring cursor position by inserting of a place holder over a popup window.
 ------------------------------------------------------------------- */

/* global tinymce, Ext */
Ext.define('Ext.ux.form.TinyMCETextArea', {

  extend: 'Ext.form.field.TextArea',
  alias: ['widget.tinymce_textarea', 'widget.tinymce_field'],

  /*
   Flag for tracking the initialization state
   */
  wysiwygIntialized: false,
  intializationInProgress: false,

  lastHeight: null,
  lastFrameHeight: null,

  /*
   This properties enables starting without WYSIWYG editor.
   The user can activate it later if he wants.
   */
  noWysiwyg: false,

  /*
   Config object for the TinyMCE configuration options
   */
  tinyMCEConfig: {},

  ensureTinyMCELoaded: function () {
    // while boundled by WebPack we add a `BOUNDLED_BY_WEBPACK: true` condition variable
    // using webpack.DefinePlugin, so conditions below will be replaced by if(false) and if (true)
    window.BOUNDLED_BY_WEBPACK = false
    // eslint-disable-next-line no-undef
    if (BOUNDLED_BY_WEBPACK) {
      return import('./tinyMCE-async-all')
      // return Promise.resolve(window.tinymce)
    }
    // eslint-disable-next-line no-undef
    if (!BOUNDLED_BY_WEBPACK) {
      return System.import('@unitybase/adminui-pub/_src/ux/form/tinyMCE-async-all')
    }
  },

  afterRender: function () {
    var me = this

    me.callParent(arguments)

    me.on('blur', function () {
      var ctrl = document.getElementById(me.getInputId())

      if (me.wysiwygIntialized) {
        var ed = tinymce.get(me.getInputId())

        // In the HTML text modus, the contents should be
        // synchronized upon the blur event.
        if (ed && ed.isHidden()) {
          if (ctrl) {
            me.positionBeforeBlur = { start: ctrl.selectionStart, end: ctrl.selectionEnd }
          }

          ed.load()
        }
      } else {
        if (ctrl) {
          me.positionBeforeBlur = { start: ctrl.selectionStart, end: ctrl.selectionEnd }
        }
      }
    }, me)

    me.on('resize', function (elm, width, height /* , oldWidth, oldHeight, eOpts */) {
      if (!me.noWysiwyg && !me.wysiwygIntialized) {
        me.initEditor(height)
      } else {
        me.syncEditorHeight(height)
      }
    }, me)
  },

  syncEditorHeight: function (height) {
    var me = this

    me.lastHeight = height

    if (!me.wysiwygIntialized || !me.rendered) { return }

    var ed = tinymce.get(me.getInputId())

    // if the editor is hidden, we do not syncronize
    // because the size values of the hidden editor
    // are calculated wrong.
    if (!ed) { return }
    if (ed.isHidden()) { return }

    var edIframe = Ext.get(me.getInputId() + '_ifr')
    // MPV
    if (!edIframe) return

    var parent = edIframe.up('.mce-edit-area')
    parent = parent.up('.mce-container-body')

    var newHeight = height

    var edToolbar = parent.down('.mce-toolbar-grp')
    if (edToolbar) {
      newHeight -= edToolbar.getHeight()
    }

    var edMenubar = parent.down('.mce-menubar')
    if (edMenubar) {
      newHeight -= edMenubar.getHeight()
    }

    var edStatusbar = parent.down('.mce-statusbar')
    if (edStatusbar) {
      newHeight -= edStatusbar.getHeight()
    }

    me.lastFrameHeight = newHeight - 3

    edIframe.setHeight(newHeight - 3)

    return newHeight - 3
  },
  // -----------------------------------------------------------------
  initEditor: function (height) {
    var me = this

    if (me.noWysiwyg || me.intializationInProgress || me.wysiwygIntialized) { return }

    me.intializationInProgress = true

    if (!me.tinyMCEConfig) {
      me.tinyMCEConfig = {}
    } else {
      // We need clone, not reference.
      // The configuration of the wysiwyg might be passed as an object to
      // many editor instances. Through cloning, we prevent
      // side effects on other editors upon internal modifications
      // of the tinyMCEConfig
      var tmpCfg = me.tinyMCEConfig
      me.tinyMCEConfig = {}
      Ext.Object.merge(me.tinyMCEConfig, tmpCfg)
    }

    me.tinyMCEConfig.mode = 'exact'
    me.tinyMCEConfig.resize = false
    me.tinyMCEConfig.elements = me.getInputId()

    if (me.lastFrameHeight) {
      me.tinyMCEConfig.height = me.lastFrameHeight
    } else {
      me.tinyMCEConfig.height = 30
    }

    if (me.readOnly) {
      me.tinyMCEConfig.readonly = true
    }

    if (me.isDisabled()) {
      me.tinyMCEConfig.readonly = true
    }

    // This provides that the editor get focus
    // by click on the label

    if (me.labelEl) {
      me.labelEl.on('click', function () {
        me.focus(false)
      }, me.labelEl)
    }

    // We have to override the setup method of the TinyMCE.
    // If the user has define own one, we shall not loose it.
    // Store it and call it after our specific actions.
    var userSetup = null

    if (me.tinyMCEConfig.setup) { userSetup = me.tinyMCEConfig.setup }

    // BEGIN: setup
    me.tinyMCEConfig.setup = function (ed) {
      ed.on('init', function (e) {
        me.wysiwygIntialized = true
        me.intializationInProgress = false

        // This piece of code solves the problem of change propagation so that
        // there is no need to call triggerSave

        var setContent = ed.setContent
        ed.setContent = function () {
          setContent.apply(ed, arguments)
          ed.fire('change', {})
        }

        if (height) {
          // setTimeout is a hack. The problem is that the editor
          // it not realle ready, when init fires.
          setTimeout(function () { me.syncEditorHeight(height) }, 200)
        }
      })

      // Catch and propagate the change event
      ed.on('change', function () {
        var oldval = me.getValue()
        var newval = ed.getContent()

        ed.save()

        me.fireEvent('change', me, newval, oldval, {})

        if (me.validateOnChange) {
          me.validate()
        }
      })

      // This ensures that the focusing the editor
      // bring the parent window to front
      ed.on('focus', function () {
        var w = me.findParentByType('window')
        if (w) w.toFront(true)
      })

      if (userSetup) { userSetup(ed) }
    }
    // END: setup

    this.ensureTinyMCELoaded().then(() => {
      window.tinymce.init(me.tinyMCEConfig)
      me.intializationInProgress = false
    })
    // MPV me.wysiwygIntialized = true;
  },
  getEditor: function () {
    var me = this

    if (!me.wysiwygIntialized) { return }

    return tinymce.get(me.getInputId())
  },

  isEditorHidden: function () {
    var me = this

    if (!me.wysiwygIntialized) { return true }

    var ed = tinymce.get(me.getInputId())
    if (!ed) { return true }

    return ed.isHidden()
  },

  showEditor: function () {
    var me = this

    me.storedCursorPosition = null

    if (!me.wysiwygIntialized) {
      me.noWysiwyg = false
      me.initEditor(me.getHeight())
      return
    }

    var ed = tinymce.get(me.getInputId())
    if (!ed) { return }

    ed.show()

    ed.nodeChanged()

    if (me.lastHeight) {
      me.syncEditorHeight(me.lastHeight)
    }

    me.focus()
  },

  hideEditor: function () {
    var me = this

    if (!me.wysiwygIntialized) { return }

    var ed = tinymce.get(me.getInputId())
    if (!ed) { return }

    var node = ed.selection.getNode()

    if (!node || node.nodeName === '#document' || node.nodeName === 'BODY' || node.nodeName === 'body') {
      ed.hide()

      return
    }

    // otherwise try to position the cursor
    var marker = '<a id="_____sys__11223___"></a>'
    ed.selection.collapse(true)
    ed.execCommand('mceInsertContent', 0, marker)

    ed.hide()

    var ctrl = document.getElementById(me.getInputId())

    var pos = -1
    var txt = ''

    if (ctrl) {
      txt = ctrl.value
      pos = txt.indexOf(marker)
    }

    if (pos !== -1) {
      var re = new RegExp(marker, 'g')
      txt = txt.replace(re, '')
      ctrl.value = txt

      if (ctrl.setSelectionRange) {
        ctrl.focus()
        ctrl.setSelectionRange(pos, pos)
      }
    }
  },

  toggleEditor: function () {
    var me = this

    if (!me.wysiwygIntialized) {
      me.showEditor()
      return
    }

    var ed = tinymce.get(me.getInputId())

    if (ed.isHidden()) {
      me.showEditor()
    } else {
      me.hideEditor()
    }
  },

  removeEditor: function () {
    var me = this

    if (me.intializationInProgress) { return me }

    if (!me.wysiwygIntialized) { return me }

    var ed = tinymce.get(me.getInputId())
    if (ed) {
      ed.save()
      ed.destroy(false)
    }

    me.wysiwygIntialized = false

    return me
  }, // removeEditor
  // -----------------------------------------------------------------
  // Sometimes, the editor should be reinitilized on the fly, e.g.
  // if the body css has been changed (in a CMS the user changed
  // the design template of a page opened in the editor).
  // This method removes the editor from the textarea, adds the
  // changed properties to the base config object and initializes
  // the editor again.
  // -----------------------------------------------------------------
  reinitEditor: function (cfg) {
    var me = this

    if (me.noWysiwyg || me.intializationInProgress) { return me }

    if (!me.tinyMCEConfig) { me.tinyMCEConfig = {} }
    if (!cfg) { cfg = {} }

    Ext.apply(me.tinyMCEConfig, cfg)

    if (!me.wysiwygIntialized) { return me }

    var hidden = true

    var ed = tinymce.get(me.getInputId())
    if (ed) {
      hidden = ed.isHidden()
      ed.save()
      ed.destroy(false)
    }

    me.wysiwygIntialized = false

    if (!hidden) { me.initEditor(me.getHeight()) }

    return me
  },

  setValue: function (v) {
    var me = this

    var res = me.callParent(arguments)

    if (me.wysiwygIntialized) {
      // The editor does some preformatting of the HTML text
      // entered by the user.
      // The method setValue sets the value of the textarea.
      // We have to load the text into editor for the
      // preformatting and then to save it back to the textarea.

      var ed = tinymce.get(me.getInputId())
      if (ed) {
        ed.load()
        ed.save()
      }
    }

    return res
  },

  focus: function (selectText, delay) {
    var me = this

    if (me.isDisabled()) { return me }

    if (delay) {
      if (isNaN(delay)) { delay = 10 }

      setTimeout(function () {
        me.focus(selectText, false)
      }, delay)
      return me
    }

    if (!me.wysiwygIntialized) {
      return me.callParent(arguments)
    }

    var ed = tinymce.get(me.getInputId())

    if (ed && !ed.isHidden()) {
      me.callParent(arguments)

      ed.focus(true) // MPV
    } else {
      return me.callParent(arguments)
    }

    return me
  },

  enable: function (silent) {
    var me = this
    var result = me.callParent(arguments)

    if (!result) { return result }

    if (me.tinyMCEConfig.readonly) {
      me.reinitEditor({
        readonly: false
      })
    }

    return result
  },

  disable: function (silent) {
    var me = this
    var result = me.callParent(arguments)

    if (!result) { return result }

    if (!me.tinyMCEConfig.readonly) {
      me.reinitEditor({
        readonly: true
      })
    }

    return result
  },

  setReadOnly: function (readOnly) {
    var me = this

    var result = me.callParent(arguments)

    if (readOnly !== me.tinyMCEConfig.readonly) {
      me.reinitEditor({
        readonly: readOnly
      })
    }

    return result
  }, // setReadOnly

  storeCurrentSelection: function () {
    var me = this

    var wwgMode = false

    var ed = tinymce.get(me.getInputId())

    if (me.wysiwygIntialized) {
      if (ed && !ed.isHidden()) { wwgMode = true }
    }

    var ctrl = document.getElementById(me.getInputId())

    if (wwgMode) {
      me.storedCursorPosition = ed.selection.getBookmark('simple')
    } else if (ctrl) {
      me.storedCursorPosition = me.positionBeforeBlur
    }
  },

  restoreCurrentSelection: function () {
    var me = this

    if (!me.storedCursorPosition) {
      return
    }

    var wwgMode = false

    var ed = tinymce.get(me.getInputId())

    if (me.wysiwygIntialized) {
      if (ed && !ed.isHidden()) {
        wwgMode = true
      }
    }

    var ctrl = document.getElementById(me.getInputId())

    if (wwgMode) {
      ed.selection.moveToBookmark(me.storedCursorPosition)
    } else if (ctrl) {
      ctrl.setSelectionRange(me.storedCursorPosition.start, me.storedCursorPosition.end)
    }
  },

  insertText: function (txt) {
    var me = this

    var wwgMode = false

    var ed = tinymce.get(me.getInputId())

    if (me.wysiwygIntialized) {
      if (ed && !ed.isHidden()) {
        wwgMode = true
      }
    }

    var ctrl = document.getElementById(me.getInputId())

    if (wwgMode) {
      ed.focus()
      ed.execCommand('mceInsertContent', 0, txt)
    } else if (ctrl) {
      ctrl.focus()

      var start = ctrl.selectionStart + txt.length

      ctrl.value = ctrl.value.slice(0, ctrl.selectionStart) + txt + ctrl.value.slice(ctrl.selectionEnd)

      ctrl.setSelectionRange(start, start)
    }
  },

  beforeDestroy: function () {
    var me = this

    var ed = window.tinymce && tinymce.get(me.getInputId())

    if (ed) ed.destroy(false)
  },

  renderActiveError: function () {
    var me = this
    var activeError = me.getActiveError()
    var hasError = !!activeError

    var edIframe = Ext.get(me.getInputId() + '_ifr')
    if (!edIframe) { return me.callParent(arguments) }

    var ed = tinymce.get(me.getInputId())
    if (!ed) { return me.callParent(arguments) }

    var parent = edIframe.up('.mce-edit-area')
    parent = parent.up('.mce-container-body')

    if (!parent) { return me.callParent(arguments) }

    parent = parent.up('.mce-tinymce')

    if (!parent) { return me.callParent(arguments) }

    if (me.rendered && !me.isDestroyed && !me.preventMark) {
      var evHandler = function () {
        me.clearInvalid()
      }
      // Add/remove invalid class
      if (hasError) {
        parent.addCls('tinymce-error-field')
        ed.on('keydown', evHandler)
        ed.on('change', evHandler)
      } else {
        parent.removeCls('tinymce-error-field')
        ed.off('keydown', evHandler)
        ed.off('change', evHandler)
      }
    }
    return me.callParent(arguments)
  }
})
