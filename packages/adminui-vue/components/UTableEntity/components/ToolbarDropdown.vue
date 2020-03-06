<template>
  <u-dropdown
    class="u-table-entity__head__dropdown"
    :width="210"
  >
    <u-toolbar-button icon="el-icon-more-outline" />

    <template slot="dropdown">
      <slot name="prepend" />

      <u-dropdown-item
        icon="el-icon-refresh"
        :label="$ut('refresh') + ' (Ctrl + R)'"
        @click="refresh"
      />
      <slot name="add-new">
        <u-dropdown-item
          icon="el-icon-plus"
          :label="$ut('actionAdd') + ' (Ctrl + Ins)'"
          :disabled="!canAddNew"
          @click="addNew"
        />
      </slot>
      <u-dropdown-item divider />
      <slot name="edit">
        <u-dropdown-item
          icon="el-icon-edit"
          :label="$ut('Edit') + ' (Ctrl + E)'"
          :disabled="!selectedRowId"
          @click="editRecord(selectedRowId)"
        />
      </slot>
      <slot name="copy">
        <u-dropdown-item
          icon="el-icon-copy-document"
          label="Copy"
          :disabled="!selectedRowId || !canAddNew"
          @click="copyRecord(selectedRowId)"
        />
      </slot>
      <slot name="delete">
        <u-dropdown-item
          icon="el-icon-delete"
          :label="$ut('Delete') + ' (Ctrl + Delete)'"
          :disabled="!selectedRowId || !canDelete"
          @click="deleteRecord(selectedRowId)"
        />
      </slot>
      <slot name="audit">
        <u-dropdown-item
          icon="el-icon-data-analysis"
          label="showAudit"
          :disabled="!selectedRowId || !canAudit"
          @click="audit(selectedRowId)"
        />
      </slot>
      <slot name="exports">
        <u-dropdown-item divider />
        <u-dropdown-item
          icon="fas fa-file-export"
          label="export"
        >
          <u-dropdown-item
            icon="fas fa-file-excel"
            label="exportXls"
            @click="exportExcel"
          />
          <u-dropdown-item
            icon="fas fa-table"
            label="exportHtml"
            @click="exportHtml"
          />
          <u-dropdown-item
            icon="fas fa-file-csv"
            label="exportCsv"
            @click="exportCsv"
          />
        </u-dropdown-item>
      </slot>
      <slot name="append" />
    </template>
  </u-dropdown>
</template>

<script>
const { mapState, mapGetters, mapActions } = require('vuex')

export default {
  computed: {
    ...mapGetters([
      'canAddNew',
      'canDelete',
      'canAudit',
      'entityName',
      'currentRepository'
    ]),
    ...mapState(['items', 'selectedRowId'])
  },

  methods: {
    ...mapActions([
      'refresh',
      'addNew',
      'deleteRecord',
      'editRecord',
      'copyRecord',
      'audit'
    ]),
    /**
     * Query server for content of current repository (without pagination) in specified contentType
     * @param contentType
     * @param resultFileExtension
     */
    exportTo (contentType, resultFileExtension) {
      const repo = this.currentRepository.clone().withTotal(false).start(0).limit(0)
      repo.connection.xhr({
        method: 'POST',
        url: 'ubql',
        data: [repo.ubql()],
        responseType: 'blob',
        headers: { 'Content-Type': contentType }
      }).then(res => {
        window.saveAs(res.data, `${this.entityName}.${resultFileExtension}`)
      })
    },
    exportExcel () {
      this.exportTo('application/vnd.oasis.opendocument.spreadsheet', 'ods')
    },
    exportHtml () {
      this.exportTo('text/html; charset=UTF-8', 'html')
    },
    exportCsv () {
      this.exportTo('text/csv; charset=UTF-8', 'csv')
    }
    // exportExcel () {
    //   const xlsx = require('@unitybase/xlsx')
    //   const workbook = new xlsx.XLSXWorkbook()
    //   workbook.useSharedString = true
    //
    //   workbook.addRow()
    //   const file = workbook.render()
    //   const blob = new Blob([file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    //   window.saveAs(blob, 'origName.xlsx')
    // }
  }
}
</script>
