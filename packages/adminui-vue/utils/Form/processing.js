/* global $App */
module.exports = createProcessingModule

const UB = require('@unitybase/ub-pub')
const dialogs = require('../../components/dialog/UDialog')
const moment = require('moment')
const { Notification: $notify } = require('element-ui')
const { buildExecParams, buildDeleteRequest, enrichFieldList } = require('./helpers')

/**
 * @typedef {object} UbVuexStoreCollectionInfo
 *
 * Metadata describing a detail collection edited on a form.
 *
 * @property {function(store: Store): ClientRepository} repository
 * @property {boolean} [lazy]
 *   An optional flag, indicating that collection shall not be loaded right away, but on demand
 * @property {function(state: object, collection: UbVuexStoreCollectionInfo, execParams: object, fieldList: string[], item: VuexTrackedObject): object} buildRequest
 * @property {function(state: object, collection: UbVuexStoreCollectionInfo, item: VuexTrackedObject): object} buildDeleteRequest
 */

/**
 * Creates Vuex store object with basic processing actions:
 *  - isNew status for master record
 *  - list of pending loadings
 *  - master record entity information (name, fieldList, schema etc.)
 *  - canDelete, canSave, canRefresh getters
 *  - CRUD actions
 *
 * @param {string} masterEntityName Name of entity for master record
 * @param {array<string>} masterFieldList Master request fieldList. If unset will set all fields in an entity
 * @param {object<string, UbVuexStoreCollectionInfo|function(store: Store): ClientRepository>} initCollectionsRequests Collections requests map
 * @param {function} validator Function what returns Vuelidate validation object
 * @param {number} instanceID instanceID
 * @param {Object} [parentContext] Optional values for main instance attributes passed to addNew method
 * @param {UBEntity} entitySchema Entity schema
 * @param {function} [beforeInit] Callback which will be emit before init
 * @param {function} [inited] Callback which will be emit when data is inited
 * @param {function} [beforeSave] Callback which will be emit before save
 * @param {function} [saved] Callback which will be emit when data was saved
 * @param {function} [beforeDelete] Callback which will be emit before delete
 * @param {function} [deleted] Callback which will be emit when data was deleted
 * @param {function} [saveNotification] Callback which will be override default save notification
 * @return {object} Vue store cfg
 */
function createProcessingModule ({
  entity: masterEntityName,
  fieldList,
  collections: initCollectionsRequests,
  validator,
  instanceID,
  parentContext,
  entitySchema,
  beforeInit,
  inited,
  beforeCreate,
  created,
  beforeLoad,
  loaded,
  beforeSave,
  saved,
  beforeDelete,
  deleted,
  saveNotification
}) {
  const autoLoadedCollections = Object.entries(initCollectionsRequests)
    .filter(([coll, collData]) => !collData.lazy)
    .map(([coll]) => coll)

  const isLockable = function () { return entitySchema.hasMixin('softLock') }

  return {
    state: {
      isNew: undefined,
      /**
       * result of previous lock() operation (in case softLock mixin assigned to entity)
       */
      lockInfo: {},

      pendings: [],

      formCrashed: false
    },

    getters: {
      /**
       * loading status
       * @return {Boolean}
       */
      loading (state) {
        return state.pendings.length > 0
      },

      canDelete (state) {
        return !state.isNew && entitySchema.haveAccessToMethod('delete')
      },

      canSave (state, getters) {
        return getters.isDirty && entitySchema.haveAccessToAnyMethods(['insert', 'update'])
      },

      canRefresh (state, getters) {
        return !state.isNew && getters.isDirty
      },

      isLocked (state) {
        return !!state.lockInfo.lockExists
      },

      isLockedByMe (state) {
        return state.lockInfo.lockExists && (state.lockInfo.lockUser === UB.connection.userLogin())
      },

      lockInfoMessage (state) {
        if (!state.lockInfo.lockExists) {
          return UB.i18n('recordNotLocked')
        } else if ((state.lockInfo.lockUser === UB.connection.userLogin())) {
          if (state.lockInfo.lockType === 'Temp') {
            return UB.i18n('recordLockedThisUserByTempLock')
          } else {
            return UB.i18n('entityLockedOwn')
          }
        } else { // locked by another user
          if (state.lockInfo.lockType === 'Temp') {
            return UB.i18n('tempSoftLockInfo', state.lockInfo.lockUser)
          } else {
            return UB.i18n('softLockInfo', state.lockInfo.lockUser, moment(state.lockInfo.lockTime).format('lll'))
          }
        }
      }
    },

    mutations: {
      /**
       * Set formCrashed status when some request was rejected or something going wrong
       * @param {VuexTrackedInstance} state
       * @param {Boolean} isCrashed
       */
      ERROR (state, isCrashed) {
        state.formCrashed = isCrashed
      },

      /**
       * Set "IsNew" flag for the master record.
       * @param {VuexTrackedInstance} state
       * @param {boolean} isNew
       */
      IS_NEW (state, isNew) {
        state.isNew = isNew
      },

      /**
       * add or delete loading pending for some action
       * @param {object} state
       * @param {object}  payload
       * @param {Boolean} payload.isLoading  add/remove action from pending
       * @param {String}  payload.target     name of pending action
       */
      LOADING (state, { isLoading, target }) {
        const index = state.pendings.indexOf(target)
        if (isLoading) {
          if (index === -1) {
            state.pendings.push(target)
          }
        } else {
          if (index !== -1) {
            state.pendings.splice(index, 1)
          }
        }
      }
    },

    actions: {
      /**
       * Initialize store:
       *  - sets isNew
       *  - creates empty collections which passed on init processing module
       *  - dispatch `create` or `load` action
       */
      async init ({ state, commit, dispatch }) {
        if (beforeInit) {
          await beforeInit()
        }
        commit('IS_NEW', !instanceID)

        if (state.isNew) {
          await dispatch('create')
        } else {
          await dispatch('load')
          await dispatch('loadCollections', autoLoadedCollections)
        }
        if (inited) {
          await inited()
        }
      },

      /**
       * Send add new request and load to instance props
       * that are response by the server
       */
      async create ({ commit }) {
        if (beforeCreate) {
          await beforeCreate()
        }
        commit('LOADING', {
          isLoading: true,
          target: 'create'
        })

        try {
          const data = await UB.connection.addNewAsObject({
            entity: masterEntityName,
            fieldList,
            execParams: parentContext
          })
          commit('LOAD_DATA', data)
          if (created) {
            await created()
          }
        } catch (err) {
          commit('ERROR', true)
          UB.showErrorWindow(err)
        } finally {
          commit('LOADING', {
            isLoading: false,
            target: 'create'
          })
        }
      },

      /**
       * Load instance data by record ID or newInstanceID in case this record is just created
       * @param {number} [newInstanceID] optional row id to load. If omitted instanceID will be used
       */
      async load ({ commit, dispatch }, newInstanceID) {
        if (beforeLoad) {
          await beforeLoad()
        }
        commit('LOADING', {
          isLoading: true,
          target: 'loadMaster'
        })

        try {
          const repo = UB.connection
            .Repository(masterEntityName)
            .attrs(fieldList)
            .miscIf(isLockable(), { lockType: 'None' }) // get lock info
          const data = await repo.selectById(instanceID || newInstanceID)

          commit('LOAD_DATA', data)

          if (isLockable()) {
            let rl = repo.rawResult.resultLock
            commit('SET', { // TODO - create mutation SET_LOCK_RESULT
              key: 'lockInfo',
              value: rl.success
                ? rl.lockInfo
                : { // normalize response - ub api is ugly here
                  lockExists: true,
                  lockType: rl.lockType,
                  lockUser: rl.lockUser,
                  lockTime: rl.lockTime,
                  lockValue: rl.lockInfo.lockValue
                }
            })
          }

          if (loaded) {
            await loaded()
          }
        } catch (err) {
          commit('ERROR', true)
          UB.showErrorWindow(err)
        } finally {
          commit('LOADING', {
            isLoading: false,
            target: 'loadMaster'
          })
        }
      },

      /**
       * Check if record not new
       * then check if collections inited when processing module is created
       * then fetch data from server for each collection
       * @param {object} store
       * @param {string[]} collectionKeys Collections keys
       */
      async loadCollections (store, collectionKeys) {
        const { state, commit } = store

        if (state.isNew) {
          return
        }
        for (const key of collectionKeys) {
          const inCollection = key in initCollectionsRequests
          if (!inCollection) {
            console.error(`${key} not included in the collections, please check initCollectionsRequests param`)
            return
          }
        }
        commit('LOADING', {
          isLoading: true,
          target: 'loadCollections'
        })

        try {
          const results = await Promise.all(
            collectionKeys.map(key => {
              const req = initCollectionsRequests[key].repository(store)
              req.fieldList = enrichFieldList(
                UB.connection.domain.get(req.entityName),
                req.fieldList,
                ['ID', 'mi_modifyDate', 'mi_createDate']
              )
              return req.select()
            })
          )
          results.forEach((collectionData, index) => {
            const collection = collectionKeys[index]
            commit('LOAD_COLLECTION', {
              collection,
              items: collectionData
            })
          })
        } catch (err) {
          commit('ERROR', true)
          UB.showErrorWindow(err)
        } finally {
          commit('LOADING', {
            isLoading: false,
            target: 'loadCollections'
          })
        }
      },

      /**
       * Check validation then
       * build requests for master and collections records
       */
      async save (store) {
        const { state, commit } = store

        if (beforeSave) {
          const answer = await beforeSave()
          if (answer === false) {
            return
          }
        }
        const $v = validator()
        if ($v) {
          $v.$touch()
          if ($v.$error) {
            const fields = Object.keys($v.$params)
            const errors = fields
              .filter(f => $v[f].$invalid)
              .map(f => UB.i18n(f))
            const err = new UB.UBError(UB.i18n('validationError', errors.join(', ')))
            UB.showErrorWindow(err)
            throw err
          }
        }

        commit('LOADING', {
          isLoading: true,
          target: 'save'
        })

        const requests = []
        const responseHandlers = []

        const masterExecParams = buildExecParams(state, masterEntityName)
        if (masterExecParams) {
          requests.push({
            entity: masterEntityName,
            method: state.isNew ? 'insert' : 'update',
            execParams: masterExecParams,
            fieldList
          })
          responseHandlers.push(response => commit('LOAD_DATA', response.resultData))
        }

        for (const [collectionKey, collectionInfo] of Object.entries(initCollectionsRequests)) {
          const collection = state.collections[collectionKey]
          if (!collection) continue

          const req = collectionInfo.repository(store)
          const collectionEntityName = req.entityName

          for (const deletedItem of collection.deleted || []) {
            const request = typeof collectionInfo.buildDeleteRequest === 'function'
              ? collectionInfo.buildDeleteRequest({ state, collection, item: deletedItem })
              : buildDeleteRequest(collectionEntityName, deletedItem.data.ID)
            requests.push(request)

            // Deleted items are cleared all at once using CLEAR_ALL_DELETED_ITEMS mutation
            responseHandlers.push(() => {})
          }

          const collectionFieldList = enrichFieldList(
            UB.connection.domain.get(collectionEntityName),
            req.fieldList,
            ['ID', 'mi_modifyDate', 'mi_createDate']
          )

          for (const item of collection.items || []) {
            const execParams = buildExecParams(item, collectionEntityName)
            if (execParams) {
              const request = typeof collectionInfo.buildRequest === 'function'
                ? collectionInfo.buildRequest({ state, collection, execParams, fieldList: collectionFieldList, item })
                : {
                  entity: collectionEntityName,
                  method: item.isNew ? 'insert' : 'update',
                  execParams,
                  fieldList: collectionFieldList
                }
              requests.push(request)

              responseHandlers.push(response => {
                const loadedState = response.resultData
                if (loadedState && Number.isInteger(loadedState.ID)) {
                  const index = collection.items.findIndex(i => i.data.ID === loadedState.ID)
                  commit('LOAD_COLLECTION_PARTIAL', {
                    collection: collectionKey,
                    index,
                    loadedState
                  })
                }
              })
            }
          }
        }

        try {
          const responses = await UB.connection.runTransAsObject(requests)
          for (let i = 0, count = Math.min(responses.length, responseHandlers.length); i < count; i++) {
            const response = responses[i]
            const responseHandler = responseHandlers[i]
            responseHandler(response)
          }

          commit('CLEAR_ALL_DELETED_ITEMS')

          UB.connection.emit(`${masterEntityName}:changed`)

          if (state.isNew) {
            commit('IS_NEW', false)
          }
          if (typeof saveNotification === 'function') {
            saveNotification()
          } else {
            $notify({
              type: 'success',
              message: UB.i18n('successfullySaved')
            })
          }
          if (saved) {
            await saved()
          }
        } catch (err) {
          commit('ERROR', true)
          UB.showErrorWindow(err)
        } finally {
          commit('LOADING', {
            isLoading: false,
            target: 'save'
          })
        }
      },

      /**
       * Check form dirty if isDirty will show dialog
       * else will be send reload request for master record
       * and all collections record that was already loaded by loadCollections action
       */
      async refresh ({ state, getters, commit, dispatch }) {
        if (getters.isDirty) {
          const result = await $App.dialogYesNo('refresh', 'formWasChanged')

          if (!result) return
        }
        commit('LOADING', {
          isLoading: true,
          target: 'master'
        })
        await dispatch('load', state.data.ID)
        commit('LOADING', {
          isLoading: false,
          target: 'master'
        })
        await dispatch('loadCollections', Object.keys(state.collections))

        if (validator()) {
          validator().$reset()
        }

        $notify({
          type: 'success',
          message: UB.i18n('formWasRefreshed')
        })
      },

      /**
       * Asks for user confirmation and sends delete request for master record
       * @param  {Function} closeForm Close form without confirmation
       */
      async deleteInstance ({ state, getters, commit }, closeForm = () => {}) {
        if (beforeDelete) {
          const answer = await beforeDelete()
          if (answer === false) {
            return
          }
        }
        const answer = await $App.dialogYesNo('deletionDialogConfirmCaption', 'vyHotiteUdalitSoderzhimoeDocumenta')

        if (answer) {
          commit('LOADING', {
            isLoading: true,
            target: 'delete'
          })
          try {
            await UB.connection.doDelete({
              entity: masterEntityName,
              execParams: { ID: state.data.ID }
            })
            UB.connection.emit(`${masterEntityName}:changed`)

            closeForm()

            $notify({
              type: 'success',
              message: UB.i18n('recordDeletedSuccessfully')
            })
            if (deleted) {
              await deleted()
            }
          } catch (err) {
            commit('ERROR', true)
            UB.showErrorWindow(err)
          } finally {
            commit('LOADING', {
              isLoading: false,
              target: 'delete'
            })
          }
        }
      },

      /**
       * Sends addNew request then fetch default params and push it in collection
       * @param {object} context
       * @param {function} context.commit
       * @param {object} payload
       * @param {String} payload.collection Collection name
       * @param {Object} payload.execParams if we need to create new item with specified params
       */
      async addCollectionItem ({ commit }, { collection, execParams }) {
        const repo = initCollectionsRequests[collection].repository()
        const entity = repo.entityName
        const fieldList = repo.fieldList
        const item = await UB.connection.addNewAsObject({
          entity,
          fieldList,
          execParams
        })

        commit('ADD_COLLECTION_ITEM', { collection, item })
      },

      /**
       * Lock entity. Applicable for entities with "softLock" mixin
       * @param {object} context
       * @param {object} context.state
       * @param {function} context.commit
       * @param {boolean} [persistentLock=false] Lock with persistent locking type
       * @return {Promise<void>}
       */
      lockEntity ({ state, commit }, persistentLock = false) {
        return UB.connection.query({
          entity: masterEntityName,
          method: 'lock',
          lockType: persistentLock ? 'Persist' : 'Temp',
          ID: state.data.ID
        }).then(resp => {
          let resultLock = resp.resultLock
          if (resultLock.success) {
            commit('SET', { // TODO - create mutation SET_LOCK_RESULT
              key: 'lockInfo',
              value: { ...resultLock.lockInfo, ownLock: resultLock.ownLock }
            })
            $notify({
              type: 'success',
              message: UB.i18n('lockSuccessCreated')
            })
          } else {
            return dialogs.dialogError(UB.i18n('softLockInfo', resultLock.lockUser, moment(resultLock.lockTime).format('lll')))
          }
        }).catch(e => {
          UB.showErrorWindow(e)
        })
      },

      /**
       * Unlock entity. Applicable for entities with "softLock" mixin
       * @param {object} context
       * @param {object} context.state
       * @param {function} context.commit
       * @return {Promise<void>}
       */
      unlockEntity ({ state, commit }) {
        return UB.connection.query({
          entity: masterEntityName,
          method: 'unlock',
          lockType: state.lockInfo.lockType,
          lockID: state.lockInfo.lockValue // MPV - why not lockID ?
        }).then(resp => {
          if (resp.resultLock.success) {
            commit('SET', { // TODO - create mutation SET_LOCK_RESULT
              key: 'lockInfo',
              value: {}
            })
            $notify({
              type: 'success',
              message: UB.i18n('lockSuccessDeleted')
            })
          }
        }).catch(e => {
          UB.showErrorWindow(e)
        })
      },

      /**
       * Get lock information. Applicable for entities with "softLock" mixin
       * @param {object} context
       * @param {object} context.state
       * @param {function} context.commit
       * @return {Promise<void>}
       */
      retrieveLockInfo ({ state, commit }) {
        return UB.connection.query({
          entity: masterEntityName,
          method: 'isLocked',
          ID: state.data.ID
        }).then(resp => {
          commit('SET', { // TODO - create mutation SET_LOCK_RESULT
            key: 'lockInfo',
            value: resp.lockInfo.isLocked ? resp.lockInfo : {}
          })
        }).catch(e => {
          UB.showErrorWindow(e)
        })
      }
    }
  }
}
