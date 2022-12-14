const UB = require('@unitybase/ub-pub')
const { Notification: $notify } = require('element-ui')
const uDialogs = require('../../utils/uDialogs')
const { exportExcel, exportCsv, exportHtml } = require('../../utils/fileExporter')
const helpers = require('../../utils/Form/helpers')
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
 * @param {boolean} instance.withPagination To use pagination
 * @param {number} instance.pageSize Pagination page size
 * @param {function} instance.buildAddNewConfig AddNew config builder. Called with (cfg: configToMutate, instance: UTableEntity)
 * @param {function} instance.buildEditConfig Edit config builder. Called with (cfg: configToMutate, row: content of row to edit)
 * @param {function} instance.buildCopyConfig Copy config builder. Called with (cfg: configToMutate, row: content of row to edit)
 * @param {object[]} instance.getCardColumns Columns to show in card view
 * @param {boolean} instance.isModal Is parent opened from modal. Used to provide modal state to child
 * @param {string[]} instance.hideActions
 */
module.exports = instance => ({
  state () {
    return {
      /* table data */
      items: [],

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
      selectedRowIndex: -1,

      withTotal: false, // need for fetch with total always after click total btn
      viewMode: 'table',
      showOneItemActions: false, // used for hide/show actions like `delete`, `copy`, `edit` and another
      selectedOnPage: [],
      multiSelectKeyAttr: 'ID'
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

      if (instance.withPagination) {
        repo
          .start(state.pageIndex * getters.pageSize)
          .limit(getters.pageSize + 1)
      }

      /*
       * do not add 'ID' attribute to fieldList in case repository includes groupList to rename first attribute to 'ID'
       * (hack to fix groupBy)
       */
      if (!repo.groupList?.length) {
        repo.attrsIf(!repo.fieldList.includes('ID'), 'ID')
      }

      if (state.sort) {
        if (repo.orderList && repo.orderList.length) {
          // clean default repository sort
          repo.orderList = []
        }

        const { column, descriptionAttrColumn, order } = state.sort
        const sortColumn = descriptionAttrColumn || column
        repo.orderBy(sortColumn, order)
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

    showAddNew () {
      return !instance.hideActions.includes('addNew')
    },

    canAddNew (state, getters) {
      return getters.showAddNew && getters.schema.haveAccessToMethod('addnew')
    },

    showCopy () {
      return (
        !instance.hideActions.includes('copy') &&
        !instance.hideActions.includes('addNewByCurrent')
      )
    },

    canCopy (state, getters) {
      return getters.showCopy && getters.schema.haveAccessToMethod('addnew')
    },

    showDelete () {
      return (
        !instance.hideActions.includes('delete') &&
        !instance.hideActions.includes('del')
      )
    },

    canDelete (state, getters) {
      return (
        getters.showDelete &&
        getters.hasSelectedRow &&
        getters.schema.haveAccessToMethod('delete')
      )
    },

    showAudit () {
      return !instance.hideActions.includes('audit')
    },

    showCopyLink () {
      return (
        !instance.hideActions.includes('link') &&
        !instance.hideActions.includes('itemLink')
      )
    },

    showViewMode () {
      return !instance.hideActions.includes('viewMode')
    },

    canAudit (state, getters) {
      return (
        getters.hasSelectedRow &&
        getters.schema.hasMixin('audit') &&
        getters.showAudit &&
        UB.connection.domain.isEntityMethodsAccessible(AUDIT_ENTITY, 'select')
      )
    },

    showRefresh () {
      return !instance.hideActions.includes('refresh')
    },

    canRefresh (state, getters) {
      return getters.showRefresh && !state.loading
    },

    showEdit () {
      return !instance.hideActions.includes('edit')
    },

    canEdit (state, getters) {
      return getters.showEdit && getters.hasSelectedRow
    },

    showVersions () {
      return !instance.hideActions.includes('showVersions')
    },

    showCreateNewVersion () {
      return !instance.hideActions.includes('newVersion')
    },

    canCreateNewVersion (state, getters) {
      return (
        getters.showCreateNewVersion &&
        getters.schema.haveAccessToMethod(
          UB.core.UBCommand.methodName.NEWVERSION
        )
      )
    },

    hasDataHistoryMixin (state, getters) {
      return getters.schema.hasMixin('dataHistory')
    },

    showSummary () {
      return !instance.hideActions.includes('summary')
    },

    showExport () {
      return !instance.hideActions.includes('export')
    },

    showFilter () {
      return !instance.hideActions.includes('filter')
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
      return ID =>
        UB.core.UBApp.generateTabId({
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
      if (typeof state.total === 'number') ++state.total
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
          if (typeof state.total === 'number') --state.total
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
      state.selectedRowIndex = state.items.findIndex(i => i.ID === state.selectedRowId)
    },

    SELECT_ROW_BY_INDEX (state, selectedRowIndex) {
      state.selectedRowId = state.items[selectedRowIndex]?.ID || state.items[0]?.ID
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
    /**
     * clears all filters
     */
    CLEAR_FILTER (state) {
      state.filters.splice(0)
    },

    WITH_TOTAL (state) {
      state.withTotal = true
    },

    SET_VIEW_MODE (state, mode) {
      state.viewMode = mode
    },
    SHOW_ONE_ITEM_ACTIONS (state, flag) {
      state.showOneItemActions = flag
    },
    SET_SELECTED_ON_PAGE (state, payload = []) {
      const newValue = [...payload] // remove link to memory on selectedOnPage
      state.selectedOnPage.splice(0)
      state.selectedOnPage.push(...newValue)
    },
    SET_MULTISELECT_KEY_ATTR (state, attr) {
      state.multiSelectKeyAttr = attr
    },
    SET_ENABLE_MULTISELECT (state, flag) {
      state.enableMultiSelect = flag
    }
  },

  actions: {
    setSelectedOnPage ({ commit }, payload = []) {
      commit('SET_SELECTED_ON_PAGE', payload)
      const flag = payload.length <= 1
      commit('SHOW_ONE_ITEM_ACTIONS', flag)
    },

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
        /*
         * In case repository includes groupList rename first attribute of fieldList to ID and rename it back after items
         * creation for correct work of refresh (hack to fix groupBy)
         */
        let originalFirstFieldsItem
        if (!response.resultData.fields.includes('ID')) {
          originalFirstFieldsItem = response.resultData.fields[0]
          response.resultData.fields[0] = 'ID'
        }
        const items = UB.LocalDataStore.selectResultToArrayOfObjects(response)
        if (originalFirstFieldsItem) {
          response.resultData.fields[0] = originalFirstFieldsItem
        }

        if (instance.withPagination) {
          const isLastPage = items.length < getters.pageSize
          commit('LAST_PAGE_INDEX', isLastPage)
          /* We can get calculate total if this is last page. */
          if (isLastPage) {
            commit('TOTAL', state.pageIndex * getters.pageSize + items.length)
          } else {
            items.splice(getters.pageSize, 1)
          }
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

    async refresh ({ state, commit, dispatch, getters }) {
      commit('LOADING', true)
      try {
        commit('PAGE_INDEX', 0)
        await Promise.all(
          getters.lookupEntities.map(({ entity, associatedAttr }) =>
            lookups.refresh(entity, [associatedAttr])
          )
        )
        await dispatch('fetchItems')
      } finally {
        commit('SELECT_ROW_BY_INDEX', state.selectedRowIndex)
        commit('LOADING', false)
      }
    },

    async getTotal ({ commit, dispatch }) {
      commit('WITH_TOTAL')
      await dispatch('fetchItems')
    },

    async updateSort ({ state, commit, dispatch, getters }, sort) {
      if (sort !== null) {
        const columnConfig = getters.columns.find(
          column => column.id === sort.column
        )
        if (columnConfig.attribute.dataType === 'Entity') {
          const { associatedEntity } = columnConfig.attribute
          const descriptionAttribute = UB.connection.domain
            .get(associatedEntity)
            .getDescriptionAttribute()
          sort.descriptionAttrColumn = `${sort.column}.${descriptionAttribute}`
        }
      }

      commit('SORT', sort)
      commit('PAGE_INDEX', 0)
      await dispatch('fetchItems')
      if (!getters.hasSelectedRow) {
        commit('SELECT_ROW_BY_INDEX', state.selectedRowIndex)
      }
    },

    async updatePageIndex ({ commit, dispatch }, pageIndex) {
      commit('PAGE_INDEX', pageIndex)
      await dispatch('fetchItems')
    },

    async applyFilter (
      { state, getters, commit, dispatch },
      { whereList, description }
    ) {
      commit('PAGE_INDEX', 0)
      commit('APPLY_FILTER', {
        columnId: state.selectedColumnId,
        label: getters.selectedColumn.label,
        description,
        whereList: whereList.map(whereItem => ({
          ...whereItem,
          expression: whereItem.expression || state.selectedColumnId
        }))
      })
      commit('TOTAL', null)
      await dispatch('fetchItems')
      if (!getters.hasSelectedRow) {
        commit('SELECT_ROW_BY_INDEX', state.selectedRowIndex)
      }
    },

    async removeFilter ({ state, commit, dispatch, getters }, columnId) {
      commit('PAGE_INDEX', 0)
      commit('REMOVE_FILTER', columnId)
      commit('TOTAL', null)
      await dispatch('fetchItems')
      if (!getters.hasSelectedRow) {
        commit('SELECT_ROW_BY_INDEX', state.selectedRowIndex)
      }
    },

    async addNew ({ getters }) {
      if (instance.beforeAddNew) {
        const answer = await instance.beforeAddNew()
        if (answer === false) {
          return
        }
      }
      const config = await instance.buildAddNewConfig(
        {
          cmdType: 'showForm',
          entity: getters.entityName,
          formCode: getters.formCode,
          target: UB.core.UBApp.viewport.centralPanel,
          tabId: getters.generateTabId(),
          isModal: instance.isModal
        },
        instance
      )
      UB.core.UBApp.doCommand(config)
    },

    async editRecord ({ state, getters }, ID) {
      if (ID === null) return

      const item = state.items.find(i => i.ID === ID)
      const config = await instance.buildEditConfig(
        {
          cmdType: 'showForm',
          entity: getters.entityName,
          formCode: getters.formCode,
          instanceID: ID,
          target: UB.core.UBApp.viewport.centralPanel,
          tabId: getters.generateTabId(ID),
          isModal: instance.isModal
        },
        item
      )
      UB.core.UBApp.doCommand(config)
    },
    async deleteRecord ({ state, dispatch, getters }, ID) {
      let result = null
      if (!getters.canDelete) return
      // this if...else for backward compatibility, when was implemented multiselection mode
      if (!state.enableMultiSelect) {
        result = await dispatch('deleteOneRecord', ID)
      } else {
        result = await dispatch('deleteMultipleRecords')
      }
      return result
    },

    async deleteOneRecord ({ state, commit, getters, dispatch }, ID) {
      if (ID === null) return

      const item = state.items.find(i => i.ID === ID)
      const answer = await uDialogs.dialogDeleteRecord(getters.entityName, item)

      if (answer) {
        const resultDelete = await dispatch('doDelete', ID)
        if (!resultDelete) return
        UB.connection.emitEntityChanged(getters.entityName, {
          entity: getters.entityName,
          method: 'delete',
          resultData: { ID }
        })
        commit('SELECT_ROW', null)
        $notify.success(UB.i18n('recordDeletedSuccessfully'))
      }
    },
    async doDelete ({ getters }, ID, attr = 'ID') {
      try {
        await UB.connection.doDelete({
          entity: getters.entityName,
          execParams: { [attr]: ID }
        })
        return true
      } catch (err) {
        UB.showErrorWindow(err)
        console.error(new UB.UBAbortError(err))
        return false
      }
    },
    // delete elements in loop and forms an array of successfully deleted. Stops on first unsuccessful deletion
    async deleteMultipleRecords ({ state, commit, getters, dispatch }) {
      const attr = state.multiSelectKeyAttr
      const data = state.selectedOnPage

      const answer = await uDialogs.dialogYesNo(
        'deletionDialogConfirmCaption',
        UB.i18n('deleteMultipleFormConfirmCaption', data.length)
      )
      if (!answer) return
      commit('LOADING', true)
      const deletedItems = []
      for (const code of data) {
        const resultDelete = await dispatch('doDelete', code, attr)
        if (!resultDelete) break
        deletedItems.push(code)
      }
      commit('LOADING', false)
      commit('SELECT_ROW', null)
      UB.connection.emitEntityChanged(getters.entityName, {
        entity: getters.entityName,
        method: 'delete-multiple',
        resultData: deletedItems
      })
      return { resultData: deletedItems }
    },

    async copyRecord ({ state, getters }, ID) {
      const item = state.items.find(i => i.ID === ID)
      const config = await instance.buildCopyConfig(
        {
          cmdType: 'showForm',
          isCopy: true,
          addByCurrent: true, // TODO: remove it after drop ext.js from project
          entity: getters.entityName,
          formCode: getters.formCode,
          instanceID: ID,
          target: UB.core.UBApp.viewport.centralPanel,
          tabId: getters.generateTabId(ID),
          isModal: instance.isModal
        },
        item
      )
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
      const { columns, currentRepository, entityName } = getters
      const fileName = UB.i18n(entityName)

      const repository = currentRepository
        .clone()
        .withTotal(false)
        .start(0)
        .limit(50000)
      const exportFieldsMap = {}
      for (const { id, exportExpression } of columns) {
        if (exportExpression) {
          const expressionParts = id.split('.')
          expressionParts[expressionParts.length - 1] = exportExpression
          exportFieldsMap[id] = expressionParts.join('.')
        }
      }

      let resultFieldList
      if (Object.keys(exportFieldsMap).length > 0) {
        resultFieldList = Array.from(repository.fieldList)
        const exportFieldList = resultFieldList.map(field => exportFieldsMap[field] ?? field)
        repository.fieldList = [...new Set(exportFieldList)]
      }

      switch (exportFormat) {
        case 'xlsx': return exportExcel({
          repository,
          resultFieldList,
          columns,
          fileName,
          filters: state.filters
        })

        case 'csv': return exportCsv({
          repository,
          fileName
        })

        case 'html': return exportHtml({
          repository,
          resultFieldList,
          columns,
          fileName,
          filters: state.filters
        })
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
      try {
        await Promise.all(
          getters.lookupEntities.map(({ entity, associatedAttr }) =>
            lookups.subscribe(entity, [associatedAttr])
          )
        )
        await dispatch('fetchItems')
      } finally {
        commit('LOADING', false)
      }
    },

    unsubscribeLookups ({ getters }) {
      for (const { entity } of getters.lookupEntities) {
        lookups.unsubscribe(entity)
      }
    },

    async updateData ({ state, getters, commit, dispatch }, response) {
      // do nothing if response.resultData is not valid for correct processing (inserting, updating or deleting) in table grid
      if (
        response === undefined ||
        typeof response.resultData !== 'object' ||
        Array.isArray(response.resultData)
      ) {
        return
      }

      if (response.method === 'delete') {
        commit('REMOVE_ITEM', response.resultData.ID)
        // in case items count equal pageSize then probably has next page so need refresh it
        if (
          instance.withPagination &&
          state.items.length === getters.pageSize - 1
        ) {
          await dispatch('refresh')
        }
        return
      }

      // optimization - if record does not match whereList conditions (excluding sub-queries and custom conditions)
      // do not even tries to get a full record data
      if (!estimateRecordMatchWhereList(response, getters.currentRepository)) return

      const { fieldList } = getters.currentRepository
      const updatedItem = {}
      const hasAllDataInResponse = fieldList.every(
        attr => attr in response.resultData
      )

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
        commit('ADD_ITEM', updatedItem)
      } else if (response.method === 'update') {
        commit('UPDATE_ITEM', updatedItem)
      }
    },

    async showSummary ({ state, getters }) {
      const repo = getters.currentRepository
        .clone()
        .withTotal(false)
        .start(0)
        .limit(0) // clear total and possible pagination
        .misc({ __mip_disablecache: true }) // cached entities do not support group by
      repo.orderList = [] // clear possible order list
      repo.fieldList = ['COUNT([ID])'] // always calc count in first column
      const summaryColumns = []
      for (const column of getters.columns) {
        if (column.summaryAggregationOperator) {
          summaryColumns.push(column)
          repo.fieldList.push(
            column.summaryAggregationOperator + '([' + column.id + '])'
          )
        }
      }

      const sumRepo = await repo.selectAsArray()
      const resultRow = sumRepo.resultData.data[0]
      let resultHtml = `<h3>${UB.i18n('table.summary.header', {
        forTitle: getters.entityName
      })}</h3>`
      if (state.filters && state.filters.length) {
        const allFiltersDescr = state.filters
          .map(f => f.label + ' ' + f.description)
          .join('; ')
        resultHtml += `<h5>${allFiltersDescr}</h5>`
      }
      const sumsHtml = summaryColumns
        .map((column, idx) => {
          const sumTypeText =
            column.summaryAggregationOperator !== 'SUM'
              ? ` (${UB.i18n(
                'table.summary.' + column.summaryAggregationOperator
              )})`
              : ''
          return `<b>${
            column.label
          }</b>${sumTypeText}: ${UB.formatter.formatNumber(
            resultRow[idx + 1],
            'sum'
          )}`
        })
        .join('<br><br>')
      if (sumsHtml) {
        resultHtml += `<h4>${UB.i18n(
          'table.summary.columnSummaries'
        )}:</h4>${sumsHtml}`
      }
      resultHtml += `<br><br><b>${UB.i18n(
        'table.summary.totalRowCount'
      )}:</b> ${UB.formatter.formatNumber(resultRow[0], 'number')}`
      await uDialogs.dialogInfo(resultHtml, 'summary')
    },

    async createNewVersion ({ getters }, ID) {
      const { mi_data_id: dataHistoryId } = await UB.Repository(
        getters.entityName
      )
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

    async showRecordHistory ({ getters }, ID) {
      return helpers.showRecordHistory(
        getters.entityName,
        ID,
        getters.repository().fieldList,
        getters.columns
      )
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
  const fieldsSet = new Set(Object.keys(response.resultData))
  for (const whereItem of Object.values(whereList)) {
    if (whereItem.expression) {
      fieldsSet.add(whereItem.expression.replace(/\[|\]/g, ''))
    }
  }
  return {
    data: [Object.values(response.resultData)],
    fields: Array.from(fieldsSet),
    rowCount: 1
  }
}

/**
 * Estimate record is match whereList conditions
 *
 * @param {object} response
 * @param {ClientRepository} repository
 * @returns {boolean}
 */
function estimateRecordMatchWhereList (response, repository) {
  const query = repository.ubql()
  const filteredResponse = UB.LocalDataStore.doFiltration(
    transformResponseToTubCachedData(response, query.whereList),
    query,
    true
  )

  return filteredResponse.length > 0
}
