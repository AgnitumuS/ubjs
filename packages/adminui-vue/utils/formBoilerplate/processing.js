/* global $App */
module.exports = {
  buildExecParams,
  buildDeleteRequest,
  buildCollectionRequests,
  processingModule
}

const UB = require('@unitybase/ub-pub')
const { Notification: $notify } = require('element-ui')

/**
 * Will modify store.
 * New store config will be contain:
 *   - isNew status for master record
 *   - loading pandings
 *   - master record entity information (name, fieldList, schema etc.)
 *   - canDelete, canSave, canRefresh getters
 *   - CRUD actions
 * @param  {Object}               store                   Vuex store config
 * @param  {UbRepository}         initMasterRequest       Request for master record
 * @param  {Array<UbRepository>}  initCollectionsRequests Initialization for collection requests
 * @return {Object} Vuex store config
 */
function processingModule (store, initMasterRequest, initCollectionsRequests = {}) {
  if (!initMasterRequest) {
    throw new Error('Param initMasterRequest is required. Initial store config must containing entity params in state')
  }
  return {
    state: {
      ...(typeof store.state === 'function' ? store.state() : store.state),

      isNew: undefined,

      pendings: [],

      formCrashed: false
    },

    getters: {
      ...store.getters,

      /**
       * loading status
       * @return {Boolean}
       */
      loading (state) {
        return state.pendings.length > 0
      },

      /**
       * @return {String}
       */
      entityName () {
        return initMasterRequest.entityName
      },

      /**
       * @return {Object} Entity schema for master request
       */
      entitySchema (state, getters) {
        return UB.connection.domain.get(getters.entityName)
      },

      /**
       * @return {Array} Field list for master request
       */
      fieldList (state, getters) {
        const fieldList = new Set(initMasterRequest.fieldList)

        fieldList.add('ID')

        const isExistModifyDate = isExistAttr(getters.entityName, 'mi_modifyDate')
        if (isExistModifyDate) {
          fieldList.add('mi_modifyDate')
        }

        const isExistCreateDate = isExistAttr(getters.entityName, 'mi_createDate')
        if (isExistCreateDate) {
          fieldList.add('mi_createDate')
        }
        return [...fieldList]
      },

      canDelete (state, getters) {
        return !state.isNew && getters.entitySchema.haveAccessToMethod('delete')
      },

      canSave (state, getters) {
        return getters.isDirty && getters.entitySchema.haveAccessToAnyMethods(['insert', 'update'])
      },

      canRefresh (state, getters) {
        return !state.isNew && getters.isDirty
      }
    },

    mutations: {
      ...store.mutations,

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
       * @param {VuexState} state
       * @param {Boolean}   options.isLoading  add/remove action from pending
       * @param {String}    options.target     name of pending action
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
      ...store.actions,

      /**
       * Set is new,
       * creates empty collections which passed on init processing module
       * dispatch create or load action
       * @param  {Number|undefined} instanceID ID of master record
       */
      async init ({ state, commit, dispatch }, instanceID) {
        commit('IS_NEW', !instanceID)

        dispatch('initCollections')

        if (state.isNew) {
          await dispatch('create')
        } else {
          await dispatch('load', instanceID)
        }
      },

      /**
       * Creates empty collections which passed on init processing module
       */
      initCollections ({ commit }) {
        for (const [key, repository] of Object.entries(initCollectionsRequests)) {
          commit('LOAD_COLLECTION', {
            collection: key,
            entity: repository.entityName,
            items: []
          })
        }
      },

      /**
       * Send add new request and load to instance props
       * that are response by the server
       */
      async create ({ state, getters, commit, dispatch }) {
        commit('LOADING', {
          isLoading: true,
          target: 'create'
        })
        const data = await UB.connection.addNewAsObject({
          entity: getters.entityName,
          fieldList: getters.fieldList
        })
          .catch((err) => {
            commit('LOADING', {
              isLoading: false,
              target: 'create'
            })
            commit('ERROR', true)
            window.onerror.apply(UB, [ '', '', '', '', err ])
            throw err
          })

        commit('LOAD_DATA', data)
        commit('LOADING', {
          isLoading: false,
          target: 'create'
        })
      },

      /**
       * Load instance data by record ID
       * @param  {Number} instanceID  record ID
       */
      async load ({ state, getters, commit, dispatch }, instanceID) {
        commit('LOADING', {
          isLoading: true,
          target: 'loadMaster'
        })
        const data = await UB.connection
          .Repository(getters.entityName)
          .attrs(getters.fieldList)
          .selectById(instanceID)
          .catch((err) => {
            commit('LOADING', {
              isLoading: false,
              target: 'loadMaster'
            })
            commit('ERROR', true)
            window.onerror.apply(UB, [ '', '', '', '', err ])
            throw err
          })

        commit('LOAD_DATA', data)
        commit('LOADING', {
          isLoading: false,
          target: 'loadMaster'
        })
      },

      /**
       * Check if record not new
       * then check if collections inited when processing module is created
       * then fetch data from server for each collection
       * @param  {Array} collections    collections keys
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
        const results = await Promise.all(
          collections.map(key => {
            const req = initCollectionsRequests[key]

            req.fieldList.push('ID')

            const isExistModifyDate = isExistAttr(req.entityName, 'mi_modifyDate')
            if (isExistModifyDate) {
              req.fieldList.push('mi_modifyDate')
            }

            const isExistCreateDate = isExistAttr(req.entityName, 'mi_modifyDate')
            if (isExistCreateDate) {
              req.fieldList.push('mi_createDate')
            }

            req.fieldList = [...new Set(req.fieldList)]

            return req.select()
          })
        ).catch((err) => {
          commit('LOADING', {
            isLoading: false,
            target: 'loadCollections'
          })
          commit('ERROR', true)
          window.onerror.apply(UB, [ '', '', '', '', err ])
          throw err
        })

        results.forEach((collectionData, index) => {
          const collection = collections[index]
          const entity = initCollectionsRequests[collection].entityName
          commit('LOAD_COLLECTION', {
            collection,
            entity,
            items: collectionData
          })
        })
        commit('LOADING', {
          isLoading: false,
          target: 'loadCollections'
        })
      },

      /**
       * Check validation then
       * build requests for master and collections records
       * @param  {Object} $v vuelidate object
       */
      async save ({ state, getters, commit, dispatch }, $v) {
        if ($v) {
          $v.$touch()
          if ($v.$error) {
            const fields = Object.keys($v.$params)
            const errors = fields.filter(f => $v[f].$invalid)
            throw new Error('Validation error in fields ' + JSON.stringify(errors))
          }
        }
        commit('LOADING', {
          isLoading: true,
          target: 'save'
        })
        const masterExecParams = buildExecParams(state, getters.entityName)
        const collectionsRequests = Object.values(state.collections)
          .flatMap(collection => buildCollectionRequests(collection))

        /**
         * if changed collection record
         * but master record did not touched need to ignore master request
         */
        if (masterExecParams) {
          const masterRequest = {
            entity: getters.entityName,
            method: state.isNew ? 'insert' : 'update',
            execParams: masterExecParams,
            fieldList: Object.keys(masterExecParams)
          }

          const [masterResponse, ...collectionsResponse] = await UB.connection
            .runTransAsObject([masterRequest, ...collectionsRequests])
            .catch((err) => {
              commit('LOADING', {
                isLoading: false,
                target: 'save'
              })
              commit('ERROR', true)
              window.onerror.apply(UB, [ '', '', '', '', err ])
              throw err
            })

          commit('LOAD_DATA_PARTIAL', masterResponse.resultData)
          dispatch('updateCollectionsRecords', collectionsResponse)
        } else {
          const collectionsResponse = await UB.connection
            .runTransAsObject(collectionsRequests)
            .catch((err) => {
              commit('LOADING', {
                isLoading: false,
                target: 'save'
              })
              commit('ERROR', true)
              window.onerror.apply(UB, [ '', '', '', '', err ])
              throw err
            })

          dispatch('updateCollectionsRecords', collectionsResponse)
        }

        UB.connection.emit(`${getters.entityName}:changed`)

        if (state.isNew) {
          commit('IS_NEW', false)
        }
        commit('LOADING', {
          isLoading: false,
          target: 'save'
        })
        $notify({
          type: 'success',
          message: UB.i18n('successfullySaved')
        })
      },

      /**
       * Check form dirty if isDirty will show dialog
       * else will be send reload request for master record
       * and all collections record that was already loaded by loadCollections action
       * @param  {Object} $v vuelidate object
       */
      async refresh ({ state, getters, commit, dispatch }, $v) {
        if (getters.isDirty) {
          const result = await $App.dialogYesNo('obnovit', 'formWasChanged')

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

        if ($v) {
          $v.$reset()
        }

        $notify({
          type: 'success',
          message: UB.i18n('formWasRefreshed')
        })
      },

      /**
       * Ask if user is sure
       * then sends delete request for master record
       * @param  {Object} $formServices              form services
       * @param  {Function} $formServices.forceClose close form without questions
       */
      async deleteInstance ({ state, getters, commit }, $formServices) {
        const answer = await $App.dialogYesNo('deletionDialogConfirmCaption', 'vyHotiteUdalitSoderzhimoeDocumenta')

        if (answer) {
          await UB.connection.doDelete({
            entity: getters.entityName,
            execParams: { ID: state.data.ID }
          })
            .catch((err) => {
              commit('ERROR', true)
              window.onerror.apply(UB, [ '', '', '', '', err ])
              throw err
            })

          $formServices.forceClose()

          $notify({
            type: 'success',
            message: UB.i18n('recordDeletedSuccessfully')
          })
        }
      },

      /**
       * Write new data to collections records
       * clear all deleted arrays
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
       * Sends addNew request then fetch default params
       * and push it in collection
       * @param {[type]} options.commit     [description]
       * @param {String} options.collection Collection name
       * @param {Object} options.execParams if we need to create new item with specified params
       */
      async addCollectionItem ({ commit }, { collection, execParams }) {
        const entityName = initCollectionsRequests[collection].entityName
        const fieldList = initCollectionsRequests[collection].fieldList
        const item = await UB.connection.addNewAsObject({
          entity: entityName,
          fieldList,
          execParams
        })

        commit('ADD_COLLECTION_ITEM', { collection, item })
      }
    }
  }
}

/**
 * Build "execParams" out of the state tracked by "instance" module.
 * @param {VuexTrackedObject} trackedObj
 * @return {object|null}
 */
function buildExecParams (trackedObj, entity) {
  if (trackedObj.isNew) {
    return Object.entries(trackedObj.data)
      .reduce((execParams, [attr, value]) => {
        execParams[attr] = value
        return execParams
      }, {})
  }

  if (!Object.keys(trackedObj.originalData).length) {
    return null
  }

  const execParams = {
    ID: trackedObj.data.ID
  }
  const isExistModifyDate = isExistAttr(entity, 'mi_modifyDate')
  if (isExistModifyDate) {
    execParams.mi_modifyDate = trackedObj.data.mi_modifyDate
  }
  for (const key of Object.keys(trackedObj.originalData)) {
    execParams[key] = trackedObj.data[key]
  }
  return execParams
}

function buildDeleteRequest (entity, ID) {
  return {
    entity,
    method: 'delete',
    execParams: {
      ID
    }
  }
}

/**
 * @param {VuexTrackedCollection} collection
 * @param {string} entity
 * @return {Array}
 */
function buildCollectionRequests (collection) {
  const requests = []
  if (collection) {
    if (collection.deleted) {
      for (const deletedItem of collection.deleted) {
        requests.push(buildDeleteRequest(collection.entity, deletedItem.data.ID))
      }
    }
    if (collection.items) {
      for (const item of collection.items) {
        const itemExecParams = buildExecParams(item, collection.entity)
        if (itemExecParams) {
          requests.push({
            entity: collection.entity,
            method: item.isNew ? 'insert' : 'update',
            execParams: itemExecParams,
            fieldList: Object.keys(itemExecParams),
            collection: collection.key
          })
        }
      }
    }
  }
  return requests
}

/**
 * Check is attribute includes in entity
 * @param  {String}  attr   Attribute name
 * @param  {String}  entity Entity name
 * @return {Boolean}
 * @private
 */
function isExistAttr (entity, attr) {
  return UB.connection.domain.get(entity).attributes.hasOwnProperty(attr)
}
