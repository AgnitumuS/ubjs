/* global $App */
const Lookups = require('../../utils/lookups.js')
const UB = require('@unitybase/ub-pub')
const { Notification: $notify } = require('element-ui')

/**
 * Generetes store config by component props.
 *
 * @param {function:ClientRepository} repository Function returns ClientRepository
 * @param {CustomRepository.entityName} entityName Entity name
 * @param {array<UTableColumn>} columns
 * @param {number} pageSize
 *
 * @returns {Vuex} Store config
 */
module.exports = ({
  repository,
  entityName,
  columns,
  pageSize,
  dateFormat,
  dateTimeFormat
}) => ({
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
    repository () {
      return repository
    },

    entityName () {
      return entityName
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

    columns () {
      return columns
    },

    pageSize () {
      return pageSize
    },

    dateFormat () {
      return dateFormat
    },

    dateTimeFormat () {
      return dateTimeFormat
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
      const repo = getters.repository()
        .attrsIf(!getters.repository().fieldList.includes('ID'), 'ID')
        .start(state.pageIndex * getters.pageSize)
        .limit(getters.pageSize + 1)

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

      const response = await repo.selectAsArray()
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

    addNew ({ getters }) {
      const tabId = $App.generateTabId({
        entity: getters.entityName,
        formCode: getters.formCode
      })

      $App.doCommand({
        cmdType: 'showForm',
        entity: getters.entityName,
        formCode: getters.formCode,
        target: $App.viewport.centralPanel,
        tabId
      })
    },

    editRecord ({ getters }, ID) {
      const tabId = $App.generateTabId({
        entity: getters.entityName,
        instanceID: ID,
        formCode: getters.formCode
      })

      $App.doCommand({
        cmdType: 'showForm',
        entity: getters.entityName,
        formCode: getters.formCode,
        instanceID: ID,
        target: $App.viewport.centralPanel,
        tabId
      })
    },

    async deleteRecord ({ getters }, ID) {
      const answer = await $App.dialogYesNo('deletionDialogConfirmCaption', 'vyHotiteUdalitSoderzhimoeDocumenta')

      if (answer) {
        await UB.connection.doDelete({
          entity: getters.entityName,
          execParams: { ID }
        })
        UB.connection.emit(`${getters.entityName}:changed`)

        $notify({
          type: 'success',
          message: UB.i18n('recordDeletedSuccessfully')
        })
      }
    },

    copyRecord ({ getters }, ID) {
      const tabId = $App.generateTabId({
        entity: getters.entityName,
        instanceID: ID,
        formCode: getters.formCode
      })

      $App.doCommand({
        cmdType: 'showForm',
        addByCurrent: true,
        entity: getters.entityName,
        formCode: getters.formCode,
        instanceID: ID,
        target: $App.viewport.centralPanel,
        tabId
      })
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
    }
  }
})
