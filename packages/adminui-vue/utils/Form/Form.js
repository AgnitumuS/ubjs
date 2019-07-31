/**
 * @module Form
 * @memberOf module:@unitybase/adminui-vue
 * @author dmytro.rudnyk 31.05.2019
 */
module.exports = Form

const Vuex = require('vuex')
const createInstanceModule = require('./instance')
const { mountTab, mountModal } = require('./mount')
const createProcessingModule = require('./processing')
const {
  isExistAttr,
  mergeStore,
  required,
  transformCollections,
  hookWrap,
  initCollections
} = require('./helpers')
const createValidator = require('./validation')
const UB = require('@unitybase/ub-pub')

function Form (cfg) {
  return new UForm(cfg)
}

/**
 * @classdesc
 * Creates a store for the form and renders it to the tab or modal window.
 * Store track form changes and builds insert/delete requests.
 * Class build validation and check it before save.
 */
class UForm {
  /**
   * @param {object} cfg
   * @param {VueComponent} cfg.component Form component
   * @param {object} [cfg.props] Form component props
   * @param {string} [cfg.title] Form title
   * @param {string} cfg.entity Entity name for master record
   * @param {number} [cfg.instanceID] Instance ID
   * @param {boolean} [cfg.isModal=false] If true form will be displayed inside modal dialog. Otherwise - in tab (default)
   * @param {string} [cfg.modalClass] Modal class
   * @param {string} [cfg.modalWidth] Modal width
   * @param {string} [cfg.formCode] Required to provide form code for form constructor button in toolbar
   * @param {string} [cfg.tabId] Optional tabId. If omitted will be calculated using entity code and instanceID
   */
  constructor ({
    component = required('component'),
    props,
    title,
    entity = required('entity'),
    instanceID,
    isModal,
    modalClass,
    modalWidth,
    formCode,
    tabId
  }) {
    this.component = component
    this.props = props
    this.storeConfig = undefined
    this.$store = undefined
    this.title = title
    this.entity = entity
    this.entitySchema = UB.connection.domain.get(this.entity)
    this.fieldList = this.entitySchema.getAttributeNames()
    this.instanceID = instanceID
    this.formCode = formCode
    this.collections = {}

    this.tabId = tabId
    this.isModal = isModal
    this.modalClass = modalClass
    this.modalWidth = modalWidth

    this.validator = undefined

    this.isProcessingUsed = false
    this.isValidationUsed = false

    this.storeInitialized = false
    this.instanceInitilized = false
    this.canProcessingInit = false
    this.canValidationInit = false
  }

  store (storeConfig = {}) {
    if (this.storeInitialized) {
      throw new Error(`Store is already initialized. TIP: ".store()" should be called before ".instance()"`)
    }
    this.storeInitialized = true

    this.storeConfig = storeConfig
    return this
  }

  instance () {
    if (this.instanceInitilized) {
      throw new Error(`"UForm.instance()" should be called once`)
    }
    this.storeInitialized = true
    this.instanceInitilized = false
    this.canProcessingInit = true

    if (!this.storeConfig) {
      this.storeConfig = {}
    }

    const instanceModule = createInstanceModule()
    mergeStore(this.storeConfig, instanceModule)

    return this
  }

  /**
   * @param {Object} cfg
   * @param {Array<string>} cfg.masterFieldList
   * @param cfg.collections
   * @param {function} cfg.beforeInit
   * @param {function} cfg.inited
   * @param {function} cfg.beforeSave
   * @param {function} cfg.saved
   * @param {function} cfg.beforeCreate
   * @param {function} cfg.created
   * @param {function} cfg.beforeLoad
   * @param {function} cfg.loaded
   * @param {function} cfg.beforeDelete
   * @param {function} cfg.deleted
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
    deleted
  } = {}) {
    if (!this.canProcessingInit) {
      throw new Error(`You can use ".processing()" only after ".instance()" and before ".mount()". Or ".processing()" is already initialized`)
    }
    this.canProcessingInit = false
    this.canValidationInit = true

    this.isProcessingUsed = true

    if (masterFieldList) {
      const fieldList = new Set(masterFieldList)
      fieldList.add('ID')
      const isExistModifyDate = isExistAttr(this.entity, 'mi_modifyDate')
      if (isExistModifyDate) {
        fieldList.add('mi_modifyDate')
      }

      const isExistCreateDate = isExistAttr(this.entity, 'mi_createDate')
      if (isExistCreateDate) {
        fieldList.add('mi_createDate')
      }
      this.fieldList = [...fieldList]
    }

    this.collections = collections
    transformCollections(this.collections)

    const processingModule = createProcessingModule({
      entity: this.entity,
      entitySchema: this.entitySchema,
      fieldList: this.fieldList,
      instanceID: this.instanceID,
      collections,
      validator: () => this.validator,
      beforeInit: () => hookWrap(beforeInit, this.$store),
      inited: () => hookWrap(inited, this.$store),
      beforeSave: () => hookWrap(beforeSave, this.$store),
      saved: () => hookWrap(saved, this.$store),
      beforeCreate: () => hookWrap(beforeCreate, this.$store),
      created: () => hookWrap(created, this.$store),
      beforeLoad: () => hookWrap(beforeLoad, this.$store),
      loaded: () => hookWrap(loaded, this.$store),
      beforeDelete: () => hookWrap(beforeDelete, this.$store),
      deleted: () => hookWrap(deleted, this.$store)
    })
    mergeStore(this.storeConfig, processingModule)

    return this
  }

  validation () {
    if (!this.canValidationInit) {
      throw new Error(`You can use ".validation()" only after ".processing()" and before ".mount()". Or ".validation()" is already initialized`)
    }
    this.canValidationInit = false

    this.isValidationUsed = true
    return this
  }

  mount () {
    if (this.storeConfig) {
      this.$store = new Vuex.Store(this.storeConfig)
      if (this.entitySchema.hasMixin('softLock')) {
        this.$store.watch(
          (state, getters) => getters.isDirty,
          (dirty) => this.lockUnlockOnDirtyChanged(dirty)
        )
      }
    }
    if (this.isValidationUsed) {
      this.validator = createValidator(this.$store, this.entitySchema, this.fieldList)
    }

    if (this.isProcessingUsed) {
      initCollections(this.$store.commit, this.collections)
      this.$store.dispatch('init')
    }

    if (this.isModal) {
      mountModal({
        component: this.component,
        props: this.props,
        store: this.$store,
        validator: this.validator,
        title: this.title,
        modalClass: this.modalClass,
        modalWidth: this.modalWidth,
        provide: {
          formCode: this.formCode,
          entity: this.entity,
          entitySchema: this.entitySchema,
          fieldList: this.fieldList
        }
      })
    } else {
      if (!this.tabId) {
        this.tabId = this.entity
          ? this.entity + (this.instanceID ? this.instanceID : 'ext' + Ext.id(null, 'addNew')) // TODO portal: Ext.id -> portal.getId
          : undefined
      }
      mountTab({
        component: this.component,
        props: this.props,
        store: this.$store,
        validator: this.validator,
        title: this.title,
        tabId: this.tabId,
        provide: {
          formCode: this.formCode,
          entity: this.entity,
          entitySchema: this.entitySchema,
          fieldList: this.fieldList
        }
      })
    }
  }

  /**
   * Applicable for entities with softLock mixin.
   * - if dirty === true and entity is not already locked try to get a Temp lock
   * - if dirty === false and entity is locked by current user using Temp lock - unlock it
   * @param {boolean} dirty
   */
  lockUnlockOnDirtyChanged (dirty) {
    console.log('DIRTY', dirty)
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
