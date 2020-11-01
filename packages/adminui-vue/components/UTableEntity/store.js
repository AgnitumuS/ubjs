const UB = require('@unitybase/ub-pub')
const { Notification: $notify } = require('element-ui')
const { dialogDeleteRecord, dialogInfo } = require('../dialog/UDialog')
const { exportExcel, exportCsv, exportHtml } = require('../../utils/fileExporter')
const formatByPattern = require('@unitybase/cs-shared').formatByPattern
const lookups = require('../../utils/lookups')
const AUDIT_ENTITY = 'uba_auditTrail'
const Vue = require('vue')
const openDataHistoryDatePicker = require('./components/DataHistoryDatePicker/datePickerDialog')

/**
 * Build store by UTableEntity props
 * @param {Vue} instance UTableEntity instance
 * @param {function} instance.getRepository ClientRepository
 * @param {string} instance.getEntityName Entity name
 * @param {array<UTableColumn>} instance.getColumns Columns
 * @param {number} instance.pageSize Pagination page size
 * @param {function} instance.buildAddNewConfig AddNew config builder. Called with (cfg: configToMutate, instance: UTableEntity)
 * @param {function} instance.buildEditConfig Edit config builder. Called with (cfg: configToMutate, row: content of row to edit)
 * @param {function} instance.buildCopyConfig Copy config builder. Called with (cfg: configToMutate, row: content of row to edit)
 * @param {object[]} instance.getCardColumns Columns to show in card view
 * @param {boolean} instance.isModal Is parent opened from modal. Used to provide modal state to child
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

      withTotal: false, // need for fetch with total always after click total btn
      viewMode: 'table'
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
      return getters.hasSelectedRow &&
        getters.schema.hasMixin('audit') &&
      UB.connection.domain.isEntityMethodsAccessible(AUDIT_ENTITY, 'select')
    },

    canEdit (state, getters) {
      return getters.hasSelectedRow
    },

    canCreateNewVersion (state, getters) {
      return getters.schema.haveAccessToMethod(UB.core.UBCommand.methodName.NEWVERSION)
    },

    hasDataHistoryMixin (state, getters) {
      return getters.schema.hasMixin('dataHistory')
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
    },

    generateTabId (state, getters) {
      return ID => UB.core.UBApp.generateTabId({
        entity: getters.entityName,
        instanceID: ID,
        formCode: getters.formCode
      })
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
    },

    SET_VIEW_MODE (state, mode) {
      state.viewMode = mode
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
      const config = await instance.buildAddNewConfig({
        cmdType: 'showForm',
        entity: getters.entityName,
        formCode: getters.formCode,
        target: UB.core.UBApp.viewport.centralPanel,
        tabId: getters.generateTabId(),
        isModal: instance.isModal
      }, instance)
      UB.core.UBApp.doCommand(config)
    },

    async editRecord ({ state, getters }, ID) {
      if (ID === null) return

      const item = state.items.find(i => i.ID === ID)
      const config = await instance.buildEditConfig({
        cmdType: 'showForm',
        entity: getters.entityName,
        formCode: getters.formCode,
        instanceID: ID,
        target: UB.core.UBApp.viewport.centralPanel,
        tabId: getters.generateTabId(ID),
        isModal: instance.isModal
      }, item)
      UB.core.UBApp.doCommand(config)
    },

    async deleteRecord ({ state, commit, getters }, ID) {
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
        commit('SELECT_ROW', null)
        $notify.success(UB.i18n('recordDeletedSuccessfully'))
      }
    },

    async copyRecord ({ state, getters }, ID) {
      const item = state.items.find(i => i.ID === ID)
      const config = await instance.buildCopyConfig({
        cmdType: 'showForm',
        isCopy: true,
        addByCurrent: true, // TODO: remove it after drop ext.js from project
        entity: getters.entityName,
        formCode: getters.formCode,
        instanceID: ID,
        target: UB.core.UBApp.viewport.centralPanel,
        tabId: getters.generateTabId(ID),
        isModal: instance.isModal
      }, item)
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
      UB.core.UBApp.showAuditTrail({
        entityCode: getters.entityName,
        instanceID: ID,
        isModal: instance.isModal
      })
    },

    async exportTo ({ state, getters }, exportFormat) {
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
            fileName,
            filters: state.filters
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
        return
      }

      if (!isApplicableWhereList(response, getters.currentRepository)) return

      const { fieldList } = getters.currentRepository
      const updatedItem = {}
      const hasAllDataInResponse = fieldList
        .every(attr => attr in response.resultData)

      if (hasAllDataInResponse) {
        for (const attr of fieldList) {
          updatedItem[attr] = response.resultData[attr]
        }
      } else {
        Object.assign(
          updatedItem,
          await UB.Repository(response.entity)
            .attrs(fieldList)
            .where('ID', '=', response.resultData.ID)
            .selectAsArray()
            .then(response => {
              // Works like selectById except that returned
              // fieldList equal to fieldList in request.
              // For example in eav attrs.
              const { data } = response.resultData
              if (data.length > 0) {
                const item = {}
                for (const [index, attr] of fieldList.entries()) {
                  item[attr] = data[0][index]
                }
                return item
              }
            })
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
    },

    async showSummary ({ state, getters }) {
      const repo = getters.currentRepository.clone()
        .withTotal(false).start(0).limit(0) // clear total and possible pagination
      repo.orderList = [] // clear possible order list
      repo.fieldList = ['COUNT([ID])'] // always calc count in first column
      const numberColumns = []
      const NUMBER_TYPES = ['BigInt', 'Currency', 'Float', 'Int']
      for (const column of getters.columns) {
        const isNumber = column.attribute && NUMBER_TYPES.includes(column.attribute.dataType)
        if (isNumber) {
          numberColumns.push(column)
          repo.fieldList.push(`SUM([${column.attribute.code}])`)
        }
      }

      const sumRepo = await repo.selectAsArray()
      const resultRow = sumRepo.resultData.data[0]
      let resultHtml = `<h3>${UB.i18n('table.summary.header', { forTitle: getters.entityName })}</h3>`
      if (state.filters && state.filters.length) {
        const allFiltersDescr = state.filters.map(f => f.label + ' ' + f.description).join('; ')
        resultHtml += `<h5>${allFiltersDescr}</h5>`
      }
      const sumsHtml = numberColumns
        .map((column, idx) => {
          return `<b>${column.label}:</b> ${formatByPattern.formatNumber(resultRow[idx + 1], 'sum')}`
        })
        .join('<br><br>')
      if (sumsHtml) {
        resultHtml += `<h4>${UB.i18n('table.summary.columnSummaries')}:</h4>${sumsHtml}`
      }
      resultHtml += `<br><br><b>${UB.i18n('table.summary.totalRowCount')}:</b> ${formatByPattern.formatNumber(resultRow[0], 'number')}`
      await dialogInfo(resultHtml, 'summary')
    },

    async createNewVersion ({ getters }, ID) {
      const { mi_data_id: dataHistoryId } = await UB.Repository(getters.entityName)
        .attrs('ID', 'mi_data_id')
        .selectById(ID)

      const history = await UB.Repository(getters.entityName)
        .attrs('mi_dateFrom', 'mi_data_id')
        .where('mi_data_id', '=', dataHistoryId)
        .misc({ __mip_recordhistory_all: true })
        .orderByDesc('mi_dateFrom')
        .limit(1)
        .select()

      const { mi_dateFrom: dateFrom } = history[0]
      const selectedDate = await openDataHistoryDatePicker(dateFrom)

      if (selectedDate) {
        UB.core.UBApp.doCommand({
          cmdType: 'showForm',
          entity: getters.entityName,
          instanceID: ID,
          __mip_ondate: selectedDate,
          target: UB.core.UBApp.viewport.centralPanel,
          tabId: getters.generateTabId(ID),
          isModal: instance.isModal
        })
      }
    },

    async showRevision ({ getters }, ID) {
      const { mi_data_id: historyId } = await UB.Repository(getters.entityName)
        .attrs('ID', 'mi_data_id')
        .selectById(ID)

      UB.core.UBApp.doCommand({
        cmdType: 'showList',
        cmdData: {
          entityName: getters.entityName,
          columns: getters.columns.concat('mi_dateTo', 'mi_dateFrom')
        },
        isModal: instance.isModal,
        instanceID: historyId,
        __mip_recordhistory: true
      })
    }
  }
})

/**
 * Transform one record which returned by runTrans to TubCachedData.
 * Used to prepare data for method `LocalDataStore.doFiltration`
 *
 * @param {object} response
 * @param {object} [whereList]
 * @returns {TubCachedData}
 */
function transformResponseToTubCachedData (response, whereList = {}) {
  const fieldsSet = new Set(
    Object.keys(response.resultData)
  )
  for (const whereItem of Object.values(whereList)) {
    if (whereItem.expression) {
      fieldsSet.add(
        whereItem.expression.replace(/\[|\]/g, '')
      )
    }
  }
  return {
    data: [Object.values(response.resultData)],
    fields: Array.from(fieldsSet),
    rowCount: 1
  }
}

/**
 * Checks record is applicable to current repository whereList
 *
 * @param {object} response
 * @param {ClientRepository} repository
 * @returns {boolean}
 */
function isApplicableWhereList (response, repository) {
  const query = repository.ubql()
  const filteredResponse = UB.LocalDataStore.doFiltration(
    transformResponseToTubCachedData(response, query.whereList),
    query
  )

  return filteredResponse.length > 0
}
