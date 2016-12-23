/**
 * Main UnityBase Ext-based client file
 */

function launchApp () {
// for a unhandled rejection in bluebird-q
  if (window.Q && window.Q.getBluebirdPromise) {
    window.Q.onerror = function (error) {
      window.onerror.apply(this, [ '', '', '', '', error ])
    }
  }
// for unhandled rejection in bluebird/native promises (IE 10+)
  window.addEventListener('unhandledrejection', function (e) {
    // NOTE: e.preventDefault() must be manually called to prevent the default
    // action which is currently to log the stack trace to console.warn
    e.preventDefault()
    // NOTE: parameters are properties of the event detail property
    let reason = e.detail ? e.detail.reason : e.reason
    let promise = e.detail ? e.detail.promise : e.promise
    // See Promise.onPossiblyUnhandledRejection for parameter documentation
    if (window.onerror) window.onerror.apply(this, [ '', '', '', '', reason ])
    console.error('UNHANDLED', reason, promise);
  })

  window.onerror = function (msg, file, line, column, errorObj) {
    var message, detail = '', strace, isHandled

    if (errorObj && UB.UBAbortError && errorObj instanceof UB.UBAbortError) {
      console.log(errorObj)
      return
    }
    isHandled = errorObj && UB.UBError && errorObj instanceof UB.UBError

    if (errorObj && Error && errorObj instanceof Error) {
      message = errorObj.message
      detail = ''
      if (/q\.js/.test(file) === false) {
        detail += 'file: "' + file + '" line: ' + line
      }
      strace = errorObj.stack || ''
      detail += strace.replace(/\?ubver=\w*/g, '').replace(/\?ver=\w*/g, '') // remove any versions
      detail = detail.replace(new RegExp(window.location.origin.replace(/\:/g, '\\$&'), 'g'), '') // remove address if same as origin
      detail = detail.replace(/\/[\w-]+\.js:/g, '<b>$&</b>&nbsp;line ') // file name is BOLD
      detail = detail.replace(/\n/g, '<br>&nbsp;&nbsp;')
    } else if (errorObj && errorObj.data && errorObj.data.errMsg) {
      message = errorObj.data.errMsg
    } else if (errorObj && errorObj.status === 0) { // long network request
      message = 'serverIsBusy'
      isHandled = true
    } else if (errorObj && errorObj.errMsg) {
      message = errorObj.errMsg
      detail = errorObj.detail ? errorObj.detail : message
    } else {
      message = errorObj && (typeof errorObj === 'string') ? errorObj : msg
    }
    if (errorObj && errorObj.detail) {
      detail = errorObj.detail + (detail ? '<BR/>' + detail : '')
      // 405 Method Not Allowed
      if (errorObj.detail === 'Method Not Allowed') {
        message = 'recordNotExistsOrDontHaveRights'
      }
    }
    if (!message) {
      message = 'internalServerError'
    }

    if (!isHandled) {
      // MPV - message is already in datail (stack trace)
      // detail = message + '<BR/> ' + detail;
      message = 'unknownError'
    }
    try {
      if (UB.showErrorWindow) {
        UB.showErrorWindow(message, '', '', detail)
      } else {
        alert(message)
      }
    } catch (err) {
      alert(message)
    }
  }

// disable shadow for all floating window
  Ext.Window.prototype.floating = { shadow: false }

  var core = require('@unitybase/ub-pub')
  var addResourceVersion = core.addResourceVersion
  Ext.Loader.loadScriptBase = Ext.Loader.loadScript
  Ext.Loader.loadScript = function (options) {
    var config = this.getConfig(),
      isString = typeof options === 'string',
      opt = options
    if (!config.disableCaching) {
      if (!isString) {
        opt = Ext.clone(options)
        opt.url = addResourceVersion(opt.url)
      } else {
        opt = addResourceVersion(opt)
      }
    }
    this.loadScriptBase(opt)
  }

  Ext.Loader.loadScriptFileBase = Ext.Loader.loadScriptFile
  Ext.Loader.loadScriptFile = function (url, onLoad, onError, scope, synchronous) {
    // debugger
    // Ext.Loader.isLoading = true
    // System.import(url).then(
    //   function () {
    //     return onLoad.call(scope)
    //   },
    //   function () {
    //     return onError.call(scope)
    //   }
    // )
    var config = this.getConfig()
    if (!config.disableCaching) {
      url = addResourceVersion(url)
    }
    this.loadScriptFileBase(url, onLoad, onError, scope, synchronous)
  }

  Ext.require([
    'UB.core.UBApp',
    'UB.view.UBDropZone',
    'UB.view.ErrorWindow',
    'Ext.AbstractManager'
  ])
  Ext.onReady(extLoaded)
  /**
   * !!!
   * Patch for correct work with timezones
   * !!!
   * */
  Ext.JSON.encodeDate = JSON.stringify

  /**
   * Wrapper in global scope, that allows to use toLog() function on client in the same way
   * as on server. It forwards message to console.debug().
   * @param {String} message text, which you want to log
   * @param {String} [param] text which will replace '%' char in message
   */
  window.toLog = function (message, param) {
    if (console && console.debug) {
      if (param) {
        console.debug(message.replace('%', '%s'), param)
      } else {
        console.debug(message)
      }
    }
  }

  //Ext.onReady(function () {
  function extLoaded() {
    // this override is just for set separate mask for modal windows & loading mask
    // one line of code changed compared to original: cls: Ext.baseCSSPrefix + 'modal-mask', //mpv
    Ext.override(Ext.ZIndexManager, {
      _showModalMask: function (comp) {
        var me = this, zIndex = comp.el.getStyle('zIndex') - 4, maskTarget = comp.floatParent ? comp.floatParent.getTargetEl() : comp.container, mask = me.mask

        if (!mask) {
          // Create the mask at zero size so that it does not affect upcoming target measurements.
          mask = me.mask = Ext.getBody().createChild({
            role: 'presentation',
            cls: 'ub-mask'// Ext.baseCSSPrefix + 'modal-mask', //mpv
            // style: 'height:0;width:0'
          })
          mask.setVisibilityMode(Ext.Element.DISPLAY)
          mask.on('click', me._onMaskClick, me)
        }

        mask.maskTarget = maskTarget

        mask.setStyle('zIndex', zIndex)

        // setting mask box before showing it in an IE7 strict iframe within a quirks page
        // can cause body scrolling [EXTJSIV-6219]
        mask.show()
      }
    })

    /**
     * Patch for HUGE speed-up of all ext component destruction
     */
    Ext.override(Ext.AbstractManager, {
      unregister: function (item) {
        if (item.id) {
          this.all.removeAtKey(item.id)
        } else {
          this.all.remove(item)
        }
      }
    })

// Patch for "skip" form. When "Ext.LoadMask" use "visibility" for hide mask element and element extends beyond the screen the "viewPort" is expanding.
    Ext.override(Ext.LoadMask, {
      getMaskEl: function () {
        var me = this
        if (me.maskEl || me.el) {
          (me.maskEl || me.el).setVisibilityMode(Ext.Element.DISPLAY)
        }
        // MPV - bug in webpack, so I copypaste realization from Ext instead of callParent
        // return me.callParent(arguments)
        return me.maskEl || (me.maskEl = me.el.insertSibling({
            role: 'presentation',
            cls: me.maskCls,
            style: {
              zIndex: me.el.getStyle('zIndex') - 2
            }
          }, 'before'))
      }
    })

    // fix hide submenu (in chrome 43)
    Ext.override(Ext.menu.Menu, {
      onMouseLeave: function (e) {
        var me = this

        // BEGIN FIX
        var visibleSubmenu = false
        me.items.each(function (item) {
          if (item.menu && item.menu.isVisible()) {
            visibleSubmenu = true
          }
        })
        if (visibleSubmenu) {
          // console.log('apply fix hide submenu');
          return
        }
        // END FIX

        me.deactivateActiveItem()

        if (me.disabled) {
          return
        }

        me.fireEvent('mouseleave', me, e)
      }
    })

    Ext.util.CSS.refreshCache() // !!! Fix for 4.2.0 || в исходниках ExtJS согласно http://www.sencha.com/forum/showthread.php?251691-Ext.utils.CSS.getRule-always-throws-error&p=921906&viewfull=1#post921906
    delete Ext.tip.Tip.prototype.minWidth

    Ext.Ajax.timeout = 120000

    if ('onHashChange' in window) {
      window.addEventListener('hashchange', UB.core.UBApp.locationHashChanged, false)
    } else {
      window.onhashchange = UB.core.UBApp.locationHashChanged
    }

    Ext.setGlyphFontFamily('FontAwesome')

    Ext.tip.QuickTipManager.init()
    Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider'))
    // Ext.FocusManager.enable({focusFrame: true});
    $App.launch().fin(function () {
      Ext.get(Ext.query('html.loading')).removeCls('loading')
    })

    // Cancel the default behavior Ctrl+R to of the user input is not lost
    new Ext.util.KeyMap({
      target: window.document.body,
      binding: [ {
        ctrl: true,
        shift: false,
        key: Ext.EventObject.R,
        fn: function (keyCode, e) {
          e.stopEvent()
          return false
        }
      } ]
    })

    // Stop the backspace key from going to the previous page in your extjs app
    Ext.EventManager.addListener(Ext.getBody(), 'keydown', function (e) {
      var
        type = (e.getTarget().tagName || '').toLocaleLowerCase(),
        eKey = e.getKey()
      if (eKey === Ext.EventObject.BACKSPACE && 'textarea|input'.indexOf(type) < 0) {
        e.preventDefault()
      }

      if (e.getKey() === Ext.EventObject.C && e.ctrlKey && e.altKey) {
        UB.core.UBFormLoader.clearFormCache()
      }
    })

    // init dropzone
    UB.view.UBDropZone.init()

    window.onbeforeunload = function () {
      window.onbeforeunload = null
      window.toLog = null
      window.onerror = null
      if ($App.connection) {
        $App.connection.logout()
      }
    }
    // totally disable context menu for cases we do not handle it on application logic layer
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault()
    }, false)
  }
}

module.exports = launchApp