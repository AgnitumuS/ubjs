/* global $App */
module.exports = createProcessingModule

const UB = require('@unitybase/ub-pub')
const dialogs = require('../../components/dialog/UDialog')
const moment = require('moment')
const { Notification: $notify } = require('element-ui')
const { buildExecParams, buildCollectionRequests } = require('./helpers')

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
 * @param {object<string, ClientRepository>} initCollectionsRequests Collections requests map
 * @param {function} validator Function what returns Vuelidate validation object
 * @param {number} instanceID instanceID
 * @param {UBEntity} entitySchema Entity schema
 * @param {function} [beforeInit] Callback which will be emit before init
 * @param {function} [inited] Callback which will be emit when data is inited
 * @param {function} [beforeSave] Callback which will be emit before save
 * @param {function} [saved] Callback which will be emit when data was saved
 * @param {function} [beforeDelete] Callback which will be emit before delete
 * @param {function} [deleted] Callback which will be emit when data was deleted
 * @return {object} Vue store cfg
 */
function createProcessingModule ({
  entity: masterEntityName,
  fieldList,
  collections: initCollectionsRequests,
  validator,
  instanceID,
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
  deleted
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
            fieldList
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
       * Load instance data by record ID
       */
      async load ({ commit, dispatch }) {
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
          const data = await repo.selectById(instanceID)

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
       * @param {Array} collections Collections keys
       */
      async loadCollections ({ state, commit }, collections) {
        if (state.isNew) {
          return
        }
        for (const key of collections) {
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
            collections.map(key => {
              const req = initCollectionsRequests[key].repository

              req.fieldList.push('ID')

              const schema = UB.connection.domain.get(req.entityName)
              if (schema.attributes['mi_modifyDate']) {
                req.fieldList.push('mi_modifyDate')
              }
              if (schema.attributes['mi_createDate']) {
                req.fieldList.push('mi_createDate')
              }

              req.fieldList = [...new Set(req.fieldList)]

              return req.select()
            })
          )
          results.forEach((collectionData, index) => {
            const collection = collections[index]
            const entity = initCollectionsRequests[collection].repository.entityName
            commit('LOAD_COLLECTION', {
              collection,
              entity,
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
      async save ({ state, commit, dispatch }) {
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
        const masterExecParams = buildExecParams(state, masterEntityName)
        const collectionsRequests = Object.values(state.collections)
          .flatMap(collection => buildCollectionRequests(collection, initCollectionsRequests[collection.key].repository.fieldList))

        try {
          /**
           * if changed collection record
           * but master record did not touched need to ignore master request
           */
          if (masterExecParams) {
            const masterRequest = {
              entity: masterEntityName,
              method: state.isNew ? 'insert' : 'update',
              execParams: masterExecParams,
              fieldList
            }

            const [masterResponse, ...collectionsResponse] = await UB.connection
              .runTransAsObject([masterRequest, ...collectionsRequests])

            commit('LOAD_DATA', masterResponse.resultData)
            await dispatch('updateCollectionsRecords', collectionsResponse)
          } else {
            const collectionsResponse = await UB.connection
              .runTransAsObject(collectionsRequests)

            await dispatch('updateCollectionsRecords', collectionsResponse)
          }

          UB.connection.emit(`${masterEntityName}:changed`)

          if (state.isNew) {
            commit('IS_NEW', false)
          }
          $notify({
            type: 'success',
            message: UB.i18n('successfullySaved')
          })
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
          isLoading: false,
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
       * Write new data to collections records clear all deleted arrays
       * @param {object} context
       * @param {object} context.state
       * @param {function} context.commit
       * @param  {Array<Object>} collectionsResponse
       */
      updateCollectionsRecords ({ state, commit }, collectionsResponse) {
        for (const response of collectionsResponse) {
          if (response.method === 'delete') continue

          const collection = response.collection
          const loadedState = response.resultData
          const index = state.collections[collection].items.findIndex(i => i.data.ID === loadedState.ID)

          commit('LOAD_COLLECTION_PARTIAL', {
            collection,
            index,
            loadedState
          })
        }

        commit('CLEAR_ALL_DELETED_ITEMS')
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
        const repo = initCollectionsRequests[collection].repository
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
