/**
 * @module Form
 * @memberOf module:@unitybase/adminui-vue
 * @author dmytro.rudnyk 31.05.2019
 */
/* global $App */

const Vuex = require('vuex')
const { mountTab, mountModal, mountContainer } = require('./mount')
const createProcessingModule = require('./processing')
const {
  mergeStore,
  transformCollections,
  enrichFieldList
} = require('./helpers')
const { Validator } = require('./validation')
const UB = require('@unitybase/ub-pub')

/**
 * Creates a new instance of UI module what can be visualized in the application shell using `mount*()` call
 * @param {object} cfg
 * @param {Vue.Component} [cfg.component] Form component
 * @param {Vue.Component} [cfg.rootComponent] Alias for `cfg.component`
 * @param {object} [cfg.props] Form component props
 * @param {object} [cfg.props.parentContext] Attributes values what will be passed to addNew method
 *   in case instanceID is empty. Think of it as default values for attributes of a new record
 * @param {string} [cfg.title] Form title. Can contain macros `{attrName}`, such macros will be replaced by attributes values. Example - `({code}) {name}`
 * @param {string} cfg.entity Entity name for master record
 * @param {number} [cfg.instanceID] Instance ID
 * @param {boolean} [cfg.isModal=false] If true form will be displayed inside modal dialog. Otherwise - in tab (default)
 * @param {boolean} [cfg.openInBackgroundTab=false] If `true` - the tab with a newly opened form does not become active
 * @param {string} [cfg.modalClass] Modal class
 * @param {string} [cfg.modalWidth] Modal width
 * @param {string} [cfg.formCode] Required to provide form code for form constructor button in toolbar and for correct tabID generation
 * @param {string} [cfg.tabId] Optional tabId. If omitted will be calculated using entity code and instanceID
 * @param {object} [cfg.target] Optional target. Used for render form into form
 * @param {boolean} cfg.isCopy Required isCopy. Used for create new record with data of existing record
 * @method
 * @returns {UForm}
 */
module.exports.Form = function Form (cfg) {
  return new UForm(cfg)
}

const formCaptionMixin = (entity, titleTemplate) => ({
  watch: {
    formTitle: 'updateFormTitle'
  },

  computed: {
    formTitle () {
      const entityName = this.$ut(entity + '#captionSingular')
      if (this.$store.state.isNew) {
        return entityName
      }

      const entityInfo = this.$UB.connection.domain.get(entity)
      const captionMixin = entityInfo.mixins.caption
      const template = titleTemplate || captionMixin?.template

      // Parse arguments out of template
      const re = /{(\w+(\.\w+)*)}/g
      let reMatch
      let value = template
      while ((reMatch = re.exec(template)) !== null) {
        const attr = reMatch[1]
        const attrValue = this.$store.state.data[attr] || ''
        value = value.replace('{' + attr + '}', attrValue)
      }

      // If trimmedValue is empty, return entityName without parentheses
      const trimmedValue = value.trim()
      return trimmedValue ? `${trimmedValue} (${entityName})` : entityName
    }
  },

  mounted () {
    this.updateFormTitle()
  },

  methods: {
    updateFormTitle () {
      if (typeof this.setTitle === 'function') {
        this.setTitle(this.formTitle)
      }
    }
  }
})

/**
 * @.classdesc
 * Creates a store for the form and renders it to the tab or modal window.
 * Store track form changes and builds insert/delete requests.
 * Class build validation and check it before save.
 */
class UForm {
  /**
   * @param {object} cfg
   * @param {Vue.Component} [cfg.component] Form component
   * @param {Vue.Component} [cfg.rootComponent] Alias for cfg.component
   * @param {object} [cfg.props] Form component props
   * @param {object} [cfg.props.parentContext] Attributes values that will be passed to addNew method
   *   in case instanceID is empty. Think of it as default values for attributes of a new record
   * @param {string} [cfg.title] Form title
   * @param {string} cfg.entity Entity name for master record
   * @param {number} [cfg.instanceID] Instance ID
   * @param {boolean} [cfg.isModal=false] If true form will be displayed inside modal dialog. Otherwise - in tab (default)
   * @param {boolean} [cfg.openInBackgroundTab=false] If `true` - the tab with a newly opened form does not become active
   * @param {string} [cfg.modalClass] Modal class
   * @param {string} [cfg.modalWidth] Modal width
   * @param {string} [cfg.formCode] Required to provide form code for form constructor button in toolbar and for correct tabID generation
   * @param {string} [cfg.tabId] Optional tabId. If omitted will be calculated using entity code and instanceID
   * @param {string} [cfg.uiTag] Optional UI Tag for tracking subsystem
   * @param {object} [cfg.target] Optional target. Used for render form into form
   * @param {boolean} cfg.isCopy Required isCopy. Used for create new record with data of existing record
   * @param {string} [cfg.titleTooltip] Form title tooltip
   * @param {function} [cfg.onClose] Async callback, called (and awaited) before form is destroyed with 2 args:
   *    (ID: number|null, store: Vuex.Store); In case form is in isNew state, ID value is null, otherwise - an ID from store
   */
  constructor ({
    component,
    rootComponent,
    props,
    title,
    entity,
    instanceID,
    isModal,
    modalClass,
    modalWidth,
    formCode,
    tabId,
    uiTag,
    target,
    isCopy,
    openInBackgroundTab,
    titleTooltip,
    onClose
  }) {
    this.component = component || rootComponent
    this.props = props
    this.mixins = undefined
    this.storeConfig = {}
    this.$store = undefined
    this.entity = entity
    this.uiTag = uiTag
    if (this.entity && UB.connection.domain.has(this.entity)) {
      this.entitySchema = UB.connection.domain.get(this.entity)
      this.title = title || this.entitySchema.captionSingular || this.entitySchema.getEntityCaption()
      this.fieldList = this.entitySchema.getAttributeNames()
    } else {
      this.entitySchema = null
      this.title = title
      this.fieldList = []
    }
    this.titleTooltip = titleTooltip || this.title
    this.instanceID = instanceID
    this.formCode = formCode
    this.isCopy = isCopy
    this.collections = {}

    this.target = target
    this.tabId = tabId
    this.isModal = isModal
    this.openInBackgroundTab = openInBackgroundTab
    this.modalClass = modalClass
    this.modalWidth = modalWidth

    this.validator = undefined
    this.customValidationOptions = undefined

    this.isProcessingUsed = false
    this.isValidationUsed = false

    this.storeInitialized = false
    this.canValidationInit = false

    this.onClose = onClose
  }

  /**
   *
   * @param {Vuex.StoreOptions} [storeConfig={}] Vuex store constructor options - merged with UForm store
   * @return {UForm}
   */
  store (storeConfig = {}) {
    if (this.storeInitialized) {
      throw new Error('Store is already initialized. TIP: ".store()" should be called before ".processing()"')
    }
    this.storeInitialized = true
    mergeStore(this.storeConfig, storeConfig)

    return this
  }

  /**
   * @deprecated replaced to processing
   * @private
   */
  instance () {
    return this
  }

  /**
   * Sets store field list, collections and lifecycle hooks.
   * All hooks are called with one argument $store and this === current form.
   *
   * @param {Object} [cfg]
   * @param {string[]} [cfg.masterFieldList] form field list. By default all entity attributes
   * @param {Object} [cfg.collections]
   * @param {function} [cfg.beforeInit]
   * @param {function} [cfg.inited]
   * @param {function} [cfg.beforeSave] Called before form creates insert\update request.
   *   If returned value is resolved to `false` then save action is canceled
   * @param {function} [cfg.saved]
   * @param {function} [cfg.beforeCreate]
   * @param {function} [cfg.created]
   * @param {function} [cfg.beforeLoad]
   * @param {function} [cfg.loaded]
   * @param {function} [cfg.beforeDelete]
   * @param {function} [cfg.deleted]
   * @param {function} [cfg.beforeCopy]
   * @param {function} [cfg.copied]
   * @param {function} [saveNotification] Callback that overrides the default save notification
   * @param {function} [errorNotification] Callback that overrides the default error notification
   * @returns {UForm}
   */
  processing ({
    masterFieldList,
    collections = {},
    beforeInit,
    inited,
    beforeSave,
    saved,
    beforeCreate,
    created,
    beforeLoad,
    loaded,
    beforeDelete,
    deleted,
    beforeCopy,
    copied,
    saveNotification,
    errorNotification
  } = {}) {
    this.storeInitialized = true
    this.canValidationInit = true
    this.isProcessingUsed = true

    if (masterFieldList) {
      this.fieldList = enrichFieldList(this.entitySchema, masterFieldList, ['ID', 'mi_modifyDate', 'mi_createDate'])
    }

    this.collections = collections
    transformCollections(this.collections)

    const processingModule = createProcessingModule({
      entity: this.entity,
      entitySchema: this.entitySchema,
      fieldList: this.fieldList,
      instanceID: this.instanceID,
      parentContext: (this.props && this.props.parentContext) ? this.props.parentContext : undefined,
      collections,
      validator: () => this.validator,
      beforeInit: beforeInit ? () => beforeInit.call(this, this.$store) : null,
      inited: inited ? () => inited.call(this, this.$store) : null,
      beforeSave: beforeSave ? () => beforeSave.call(this, this.$store) : null,
      saved: saved ? (method) => saved.call(this, this.$store, method) : null,
      beforeCreate: beforeCreate ? () => beforeCreate.call(this, this.$store) : null,
      created: () => {
        this.tabId = UB.core.UBApp.generateTabId({
          entity: this.entity,
          instanceID: this.$store.state.data.ID,
          formCode: this.formCode ?? this.entity
        })
        return created ? created.call(this, this.$store) : null
      },
      beforeLoad: beforeLoad ? () => beforeLoad.call(this, this.$store) : null,
      loaded: loaded ? () => loaded.call(this, this.$store) : null,
      beforeDelete: beforeDelete ? () => beforeDelete.call(this, this.$store) : null,
      deleted: deleted ? () => deleted.call(this, this.$store) : null,
      beforeCopy: beforeCopy ? () => beforeCopy.call(this, this.$store) : null,
      copied: copied ? () => copied.call(this, this.$store) : null,
      saveNotification,
      errorNotification,
      isCopy: this.isCopy,
      isModal: this.isModal
    })
    mergeStore(this.storeConfig, processingModule)

    return this
  }

  /**
   * Custom validator function. In case `validation` not called or called without argument then validator function
   *  is generated automatically based on entitySchema
   * @param {Vue.ComponentOptions} [validationOptions] Custom validation mixin in case we need to override default validation
   * @return {UForm}
   */
  validation (validationOptions) {
    if (validationOptions && (typeof validationOptions === 'function')) {
      throw new Error('Invalid parameter type for UForm.validation - must be object with at last computed or validation props')
    }
    if (!this.canValidationInit) {
      throw new Error('You can use ".validation()" only after ".processing()" and before ".mount()". Or ".validation()" is already initialized')
    }
    this.canValidationInit = false
    this.isValidationUsed = true

    if (validationOptions) {
      this.customValidationOptions = validationOptions
    }

    return this
  }

  async mount () {
    if (this.storeInitialized) {
      this.$store = new Vuex.Store(this.storeConfig)
    }

    if (this.isProcessingUsed && this.entitySchema.hasMixin('softLock')) {
      this.$store.watch(
        (state, getters) => getters.isDirty,
        (dirty) => this.lockUnlockOnDirtyChanged(dirty)
      )
    }

    if (this.isValidationUsed) {
      this.validator = Validator.initializeWithCustomOptions({
        store: this.$store,
        entitySchema: this.entitySchema,
        masterFieldList: this.fieldList,
        customValidationMixin: this.customValidationOptions
      })
    }

    if (this.isProcessingUsed) {
      try {
        await this.$store.dispatch('init')
      } catch (err) {
        throw new UB.UBError(err.message)
      }
    }

    if (this.title && this.title.indexOf('{') !== -1) {
      if (!this.mixins) {
        this.mixins = []
      }
      this.mixins.push(formCaptionMixin(this.entity, this.title))
    }

    const mountOptions = {
      component: this.component,
      props: this.props,
      mixins: this.mixins,
      store: this.$store,
      validator: this.validator,
      title: this.title,
      titleTooltip: this.titleTooltip,
      onClose: this.onClose,
      provide: {
        formCode: this.formCode,
        entity: this.entity,
        entitySchema: this.entitySchema,
        fieldList: this.fieldList
      }
    }

    if (this.isModal) {
      mountModal({
        ...mountOptions,
        modalClass: this.modalClass,
        modalWidth: this.modalWidth
      })
    } else if (this.target === undefined || (this.target.getId && this.target.getId() === 'ubCenterViewport')) {
      if (!this.tabId) {
        this.tabId = this.entity
          ? $App.generateTabId({ // TODO portal: $App.generateTabId -> portal.generateTabId
            entity: this.entity,
            instanceID: this.instanceID,
            formCode: this.formCode
          })
          : undefined
      }
      const existsTab = document.getElementById(this.tabId)
      if (existsTab) return // for slow network
      mountTab({
        ...mountOptions,
        tabId: this.tabId,
        uiTag: this.uiTag,
        openInBackgroundTab: this.openInBackgroundTab
      })
    } else {
      mountContainer({
        ...mountOptions,
        target: this.target
      })
    }
  }

  /**
   * Applicable for entities with softLock mixin.
   * - if dirty === true and entity is not already locked try to get a Temp lock
   * - if dirty === false and entity is locked by current user using Temp lock - unlock it
   * @private
   * @param {boolean} dirty
   */
  lockUnlockOnDirtyChanged (dirty) {
    // console.log('DIRTY', dirty)
    if (this.$store && this.$store.state.isNew) return
    if (dirty) {
      if (!this.$store.getters.isLockedByMe) {
        this.$store.dispatch('lockEntity')
      }
    } else {
      if ((this.$store.getters.isLockedByMe) && (this.$store.state.lockInfo.lockType === 'Temp')) {
        this.$store.dispatch('unlockEntity')
      }
    }
  }
}
