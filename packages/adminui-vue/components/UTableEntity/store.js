const Lookups = require('../../utils/lookups.js')
const UB = require('@unitybase/ub-pub')
const { Notification: $notify } = require('element-ui')

/**
 * Build store by UTableEntity props
 * @param {Vue} instance UTableEntity instance
 * @param {function} instance.getRepository ClientRepository
 * @param {string} instance.getEntityName Entity name
 * @param {array<UTableColumn>} instance.getColumns Columns
 * @param {number} instance.pageSize Pagination page size
 * @param {string} instance.dateFormat Date format
 * @param {string} instance.dateTimeFormat Date time format
 * @param {function} instance.buildAddNewConfig AddNew config builder
 * @param {function} instance.buildEditConfig Edit config builder
 * @param {function} instance.buildCopyConfig Copy config builder
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

      sort: null,

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
     * Returns repository with added filters, sorters, pagination and total requests from state
     * @return {ClientRepository}
     */
    currentRepository (state, getters) {
      const repo = getters.repository()
        .start(state.pageIndex * getters.pageSize)
        .limit(getters.pageSize + 1)

      if (!repo.fieldList.includes('ID')) {
        repo.attrs('ID')
      }
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
     * Need for open form on add new or edit record.
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
      return getters.schema.haveAccessToMethod('delete')
    },

    canAudit (state, getters) {
      return getters.schema.hasMixin('audit')
    },

    columns () {
      return instance.getColumns
    },

    pageSize () {
      return instance.pageSize
    },

    dateFormat () {
      return instance.dateFormat
    },

    dateTimeFormat () {
      return instance.dateTimeFormat
    },

    selectedColumn (state, getters) {
      const column = getters.columns.find(c => c.id === state.selectedColumnId)
      if (column) {
        return column
      } else {
        return {}
      }
    }
  },

  mutations: {
    ITEMS (state, items) {
      state.items.splice(0, state.items.length, ...items)
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

    SORT (state, sort) {
      state.sort = sort
    },

    APPLY_FILTER (state, filter) {
      const index = state.filters.findIndex(f => f.id === filter.id)

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

    REMOVE_FILTER (state, columnId) {
      const index = state.filters.findIndex(f => f.id === columnId)
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
      const repo = getters.currentRepository
      const response = await repo.selectAsArray()

      if (instance.useRequestFieldList) {
        response.resultData.fields = response.fieldList
      }

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
      /* Filter lookups columns and load it */
      await Promise.all(
        getters.columns
          .filter(c => c.isLookup)
          .filter(c => c.attribute.dataType === 'Entity' || c.attribute.dataType === 'Many')
          .map(({ attribute }) => {
            const entity = attribute.associatedEntity
            return Lookups.load(entity, attribute.associatedAttr)
          })
      )
      commit('ITEMS', items)
      commit('LOADING', false)
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
        id: state.selectedColumnId,
        label: getters.selectedColumn.label,
        description,
        whereList: whereList.map(whereItem => ({
          ...whereItem,
          expression: state.selectedColumnId
        }))
      })
      await dispatch('fetchItems')
    },

    async removeFilter ({ commit, dispatch }, columnId) {
      commit('PAGE_INDEX', 0)
      commit('REMOVE_FILTER', columnId)
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

    async deleteRecord ({ getters }, ID) {
      const answer = await UB.core.UBApp.dialogYesNo('deletionDialogConfirmCaption', 'vyHotiteUdalitSoderzhimoeDocumenta')

      if (answer) {
        await UB.connection.doDelete({
          entity: getters.entityName,
          execParams: { ID }
        })
        UB.connection.emit(`${getters.entityName}:changed`)

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
        addByCurrent: true,
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
    }
  }
})
