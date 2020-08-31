const UB = require('@unitybase/ub-pub')
const { Notification: $notify } = require('element-ui')
const { dialogDeleteRecord } = require('../dialog/UDialog')
const { exportExcel, exportCsv, exportHtml } = require('../../utils/fileExporter')
const lookups = require('../../utils/lookups')

/**
 * Build store by UTableEntity props
 * @param {Vue} instance UTableEntity instance
 * @param {function} instance.getRepository ClientRepository
 * @param {string} instance.getEntityName Entity name
 * @param {array<UTableColumn>} instance.getColumns Columns
 * @param {number} instance.pageSize Pagination page size
 * @param {function} instance.buildAddNewConfig AddNew config builder
 * @param {function} instance.buildEditConfig Edit config builder
 * @param {function} instance.buildCopyConfig Copy config builder
 * @param {object[]} instance.getCardColumns Columns to show in card view
 */
module.exports = (instance) => ({
  state () {
    return {
      items: [], /* table data */

      loading: false,

      /* pagination */
      pageIndex: 0,
      isLastPageIndex: true,
      total: null,

      /** @type {UTableSort} */
      sort: null,

      /** @type {UTableFilterDefinition[]} */
      filters: [],

      /* cell selected by keyboard or mouse */
      selectedColumnId: null,
      selectedRowId: null,

      withTotal: false // need for fetch with total always after click total btn
    }
  },

  getters: {
    // non reactive, returns function
    /**
     * Returns a function what returns initial repository passed to UTableEntity
     * @return {Function<ClientRepository>}
     */
    repository () {
      return instance.getRepository
    },

    /**
     * Returns repository with added 'ID' field is missed, filters, sorters, pagination and total requests from state
     * @param {object} state
     * @param {UTableSort} state.sort
     * @param {UTableFilterDefinition[]} state.filters
     * @param {object} getters
     * @return {ClientRepository}
     */
    currentRepository (state, getters) {
      const repo = getters.repository()
        .start(state.pageIndex * getters.pageSize)
        .limit(getters.pageSize + 1)

      repo.attrsIf(!repo.fieldList.includes('ID'), 'ID')

      if (state.sort) {
        repo.orderBy(state.sort.column, state.sort.order)
      }

      for (const filter of state.filters) {
        for (const { expression, condition, value } of filter.whereList) {
          repo.where(expression, condition, value)
        }
      }

      if (state.withTotal) {
        repo.withTotal()
      }
      return repo
    },

    entityName () {
      return instance.getEntityName
    },

    /**
     * Used to open form on add new or edit record.
     */
    formCode (state, getters) {
      const form = UB.core.UBFormLoader.getFormByEntity(getters.entityName)
      if (form) {
        return form.get('code')
      }
    },

    schema (state, getters) {
      return UB.connection.domain.get(getters.entityName)
    },

    canAddNew (state, getters) {
      return getters.schema.haveAccessToMethod('addnew')
    },

    canDelete (state, getters) {
      return getters.hasSelectedRow && getters.schema.haveAccessToMethod('delete')
    },

    canAudit (state, getters) {
      return getters.hasSelectedRow && getters.schema.hasMixin('audit')
    },

    canEdit (state, getters) {
      return getters.hasSelectedRow
    },

    columns () {
      return instance.getColumns
    },

    pageSize () {
      return instance.pageSize
    },

    selectedColumn (state, getters) {
      const column = getters.columns.find(c => c.id === state.selectedColumnId)
      if (column) {
        return column
      } else {
        return {}
      }
    },

    hasSelectedRow (state) {
      return state.items.findIndex(i => i.ID === state.selectedRowId) !== -1
    },

    lookupEntities (state, getters) {
      return getters.columns
        .filter(c => c.isLookup && c.attribute && c.attribute.associatedEntity)
        .map(c => ({
          entity: c.attribute.associatedEntity,
          associatedAttr: c.attribute.associationAttr || 'ID'
        }))
    },

    cardColumns () {
      return instance.getCardColumns
    }
  },

  mutations: {
    ITEMS (state, items) {
      state.items.splice(0, state.items.length, ...items)
    },

    ADD_ITEM (state, item) {
      state.items.push(item)
    },

    UPDATE_ITEM (state, updatedItem) {
      const item = state.items.find(i => i.ID === updatedItem.ID)
      if (item) {
        Object.assign(item, updatedItem)
      }
    },

    REMOVE_ITEM (state, deleteID) {
      if (deleteID) {
        const deleteIndex = state.items.findIndex(i => i.ID === deleteID)
        if (deleteIndex !== -1) {
          state.items.splice(deleteIndex, 1)
        }
      }
    },

    LAST_PAGE_INDEX (state, isLastPageIndex) {
      state.isLastPageIndex = isLastPageIndex
    },

    LOADING (state, isLoad) {
      state.loading = isLoad
    },

    TOTAL (state, total) {
      state.total = total
    },

    PAGE_INDEX (state, pageIndex) {
      state.pageIndex = pageIndex
    },

    /**
     * @param {object} state
     * @param {UTableSort} state.sort
     * @param {UTableSort} sort
     */
    SORT (state, sort) {
      state.sort = sort
    },

    /**
     * @param {object} state
     * @param {UTableFilterDefinition[]} state.filters
     * @param {UTableFilterDefinition} filter
     */
    APPLY_FILTER (state, filter) {
      const index = state.filters.findIndex(f => f.columnId === filter.columnId)

      if (index !== -1) {
        state.filters.splice(index, 1, filter)
      } else {
        state.filters.push(filter)
      }
    },

    SELECT_COLUMN (state, selectedColumnId) {
      state.selectedColumnId = selectedColumnId
    },

    SELECT_ROW (state, selectedRowId) {
      state.selectedRowId = selectedRowId
    },

    /**
     * @param {object} state
     * @param {UTableFilterDefinition[]} state.filters
     * @param {UTableFilterDefinition.columnId} columnId
     */
    REMOVE_FILTER (state, columnId) {
      const index = state.filters.findIndex(f => f.columnId === columnId)
      if (index !== -1) {
        state.filters.splice(index, 1)
      }
    },

    WITH_TOTAL (state) {
      state.withTotal = true
    }
  },

  actions: {
    async fetchItems ({ state, getters, commit }) {
      commit('LOADING', true)

      try {
        const response = await getters.currentRepository.selectAsArray()
        /*
         * Replace result keys with fieldList
         * Sometimes, server returns result with altered fieldList, like entities with Entity-Attribute-Value mixin
         * (see `@unitybase/forms`).  Below we force to stick with original fieldList from request,
         * rather than using fieldList from response
         */
        response.resultData.fields = getters.currentRepository.fieldList
        const items = UB.LocalDataStore.selectResultToArrayOfObjects(response)

        const isLastPage = items.length < getters.pageSize
        commit('LAST_PAGE_INDEX', isLastPage)
        /* We can get calculate total if this is last page. */
        if (isLastPage) {
          commit('TOTAL', state.pageIndex * getters.pageSize + items.length)
        } else {
          items.splice(getters.pageSize, 1)
        }

        if (state.withTotal) {
          commit('TOTAL', response.total)
        }
        commit('ITEMS', items)
      } catch (err) {
        UB.showErrorWindow(err)
      } finally {
        commit('LOADING', false)
      }
    },

    async refresh ({ commit, dispatch }) {
      commit('PAGE_INDEX', 0)
      await dispatch('fetchItems')
    },

    async getTotal ({ commit, dispatch }) {
      commit('WITH_TOTAL')
      await dispatch('fetchItems')
    },

    async updateSort ({ commit, dispatch }, sort) {
      commit('SORT', sort)
      commit('PAGE_INDEX', 0)
      await dispatch('fetchItems')
    },

    async updatePageIndex ({ commit, dispatch }, pageIndex) {
      commit('PAGE_INDEX', pageIndex)
      await dispatch('fetchItems')
    },

    async applyFilter ({ state, getters, commit, dispatch }, { whereList, description }) {
      commit('PAGE_INDEX', 0)
      commit('APPLY_FILTER', {
        columnId: state.selectedColumnId,
        label: getters.selectedColumn.label,
        description,
        whereList: whereList.map(whereItem => ({
          ...whereItem,
          expression: state.selectedColumnId
        }))
      })
      commit('TOTAL', null)
      await dispatch('fetchItems')
    },

    async removeFilter ({ commit, dispatch }, columnId) {
      commit('PAGE_INDEX', 0)
      commit('REMOVE_FILTER', columnId)
      commit('TOTAL', null)
      await dispatch('fetchItems')
    },

    async addNew ({ getters }) {
      if (instance.beforeAddNew) {
        const answer = await instance.beforeAddNew()
        if (answer === false) {
          return
        }
      }
      const tabId = UB.core.UBApp.generateTabId({
        entity: getters.entityName,
        formCode: getters.formCode
      })
      const config = instance.buildAddNewConfig({
        cmdType: 'showForm',
        entity: getters.entityName,
        formCode: getters.formCode,
        target: UB.core.UBApp.viewport.centralPanel,
        tabId
      })
      UB.core.UBApp.doCommand(config)
    },

    editRecord ({ getters }, ID) {
      if (ID === null) return

      const tabId = UB.core.UBApp.generateTabId({
        entity: getters.entityName,
        instanceID: ID,
        formCode: getters.formCode
      })
      const config = instance.buildEditConfig({
        cmdType: 'showForm',
        entity: getters.entityName,
        formCode: getters.formCode,
        instanceID: ID,
        target: UB.core.UBApp.viewport.centralPanel,
        tabId
      })
      UB.core.UBApp.doCommand(config)
    },

    async deleteRecord ({ state, getters }, ID) {
      if (ID === null) return

      const item = state.items.find(i => i.ID === ID)
      const answer = await dialogDeleteRecord(getters.entityName, item)

      if (answer) {
        try {
          await UB.connection.doDelete({
            entity: getters.entityName,
            execParams: { ID }
          })
        } catch (err) {
          UB.showErrorWindow(err)
          throw new UB.UBAbortError(err)
        }
        UB.connection.emit(`${getters.entityName}:changed`, {
          entity: getters.entityName,
          method: 'delete',
          resultData: { ID }
        })
        $notify.success(UB.i18n('recordDeletedSuccessfully'))
      }
    },

    copyRecord ({ getters }, ID) {
      const tabId = UB.core.UBApp.generateTabId({
        entity: getters.entityName,
        instanceID: ID,
        formCode: getters.formCode
      })
      const config = instance.buildCopyConfig({
        cmdType: 'showForm',
        isCopy: true,
        addByCurrent: true, // TODO: remove it after drop ext.js from project
        entity: getters.entityName,
        formCode: getters.formCode,
        instanceID: ID,
        target: UB.core.UBApp.viewport.centralPanel,
        tabId
      })
      UB.core.UBApp.doCommand(config)
    },

    createLink ({ getters }, ID) {
      const query = [
        'cmdType=showForm',
        `entity=${getters.entityName}`,
        `instanceID=${ID}`
      ].join('&')
      const linkToEntity = `${window.location.protocol}//${window.location.host}${window.location.pathname}#${query}`

      const input = document.createElement('input')
      input.value = linkToEntity
      input.style.position = 'absolute'
      input.style.top = '100%'
      input.style.left = '100%'
      document.body.appendChild(input)
      input.select()
      if (document.execCommand('copy')) {
        document.body.removeChild(input)
        $notify({
          title: UB.i18n('link'),
          message: UB.i18n('linkCopiedText'),
          duration: 5000
        })
      }
      window.getSelection().removeAllRanges()
    },

    audit ({ getters }, ID) {
      const tabId = UB.core.UBApp.generateTabId({
        entity: getters.entityName,
        instanceID: ID
      })
      UB.core.UBApp.doCommand({
        cmdType: 'showList',
        tabId,
        title: `${UB.i18n('Audit')} (${UB.i18n(getters.entityName)})`,
        renderer: 'vue',
        cmdData: {
          repository () {
            return UB.Repository('uba_auditTrail')
              .attrs(['ID', 'actionTime', 'actionType', 'actionUserName', 'remoteIP'])
              .where('entity', '=', getters.entityName)
              .where('entityinfo_id', '=', ID)
              .orderByDesc('actionTime')
          },
          columns: ['actionTime', 'actionType', 'actionUserName', 'remoteIP']
        }
      })
    },

    async exportTo ({ getters }, exportFormat) {
      const repository = getters.currentRepository
        .clone()
        .withTotal(false)
        .start(0)
        .limit(50000)
      const fileName = UB.i18n(getters.entityName)

      switch (exportFormat) {
        case 'xlsx':
          await exportExcel({
            columns: getters.columns,
            repository,
            fileName
          })
          break
        case 'csv':
          await exportCsv({
            repository,
            fileName: 'fileName'
          })
          break
        case 'html':
          await exportHtml({
            repository,
            fileName
          })
          break
      }
    },

    /**
     * Used only on first loading
     *
     * @private
     * @param getters
     * @param commit
     * @param dispatch
     * @returns {Promise<void>}
     */
    async loadData ({ getters, commit, dispatch }) {
      commit('LOADING', true)
      for (const { entity, associatedAttr } of getters.lookupEntities) {
        await lookups.subscribe(entity, [associatedAttr])
      }
      await dispatch('fetchItems')
      commit('LOADING', false)
    },

    unsubscribeLookups ({ getters }) {
      for (const { entity } of getters.lookupEntities) {
        lookups.unsubscribe(entity)
      }
    },

    async updateData ({ state, getters, commit, dispatch }, response) {
      if (response === undefined) {
        await dispatch('refresh')
        return
      }

      if (response.method === 'delete') {
        commit('REMOVE_ITEM', response.resultData.ID)
        // in case items count equal pageSize then probably has next page so need refresh it
        if (state.items.length === getters.pageSize - 1) {
          await dispatch('refresh')
        }
      }

      const updatedItem = {}
      const hasAllDataInResponse = getters.currentRepository.fieldList
        .every(attr => attr in response.resultData)

      if (hasAllDataInResponse) {
        for (const attr of getters.currentRepository.fieldList) {
          updatedItem[attr] = response.resultData[attr]
        }
      } else {
        Object.assign(
          updatedItem,
          await UB.Repository(response.entity)
            .attrs(getters.currentRepository.fieldList)
            .selectById(response.resultData.ID)
        )
      }

      if (response.method === 'insert') {
        if (state.items.length < getters.pageSize) {
          commit('ADD_ITEM', updatedItem)
        }
      }

      if (response.method === 'update') {
        commit('UPDATE_ITEM', updatedItem)
      }
    }
  }
})
