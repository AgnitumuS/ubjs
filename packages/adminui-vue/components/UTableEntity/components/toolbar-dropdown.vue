<template>
  <u-dropdown
    class="u-table-entity__head__dropdown"
    :width="210"
  >
    <toolbar-button icon="el-icon-more-outline" />

    <template slot="dropdown">
      <u-dropdown-item
        icon="el-icon-refresh"
        :label="$ut('refresh') + ' (Ctrl + R)'"
        @click="refresh"
      />
      <u-dropdown-item
        icon="el-icon-plus"
        :label="$ut('actionAdd') + ' (Ctrl + Ins)'"
        :disabled="!canAddNew"
        @click="addNew"
      />
      <u-dropdown-item divider />
      <u-dropdown-item
        icon="el-icon-edit"
        :label="$ut('Edit') + ' (Ctrl + E)'"
        :disabled="!selectedRowId"
        @click="editRecord(selectedRowId)"
      />
      <u-dropdown-item
        icon="el-icon-copy-document"
        label="Copy"
        :disabled="!selectedRowId"
        @click="copyRecord(selectedRowId)"
      />
      <u-dropdown-item
        icon="el-icon-delete"
        :label="$ut('Delete') + ' (Ctrl + Delete)'"
        :disabled="!selectedRowId || !canDelete"
        @click="deleteRecord(selectedRowId)"
      />

      <!-- TODO: excel export -->
      <!--      <u-dropdown-item-->
      <!--        icon="fa fa-file-excel-o"-->
      <!--        label="exportXls"-->
      <!--        @click="exportExcel"-->
      <!--      />-->
    </template>
  </u-dropdown>
</template>

<script>
const { mapState, mapGetters, mapActions } = require('vuex')
const ToolbarButton = require('./toolbar-button.vue').default

export default {
  components: { ToolbarButton },

  computed: {
    ...mapGetters([
      'canAddNew',
      'canDelete'
    ]),
    ...mapState(['items', 'selectedRowId'])
  },

  methods: {
    ...mapActions([
      'refresh',
      'addNew',
      'deleteRecord',
      'editRecord',
      'copyRecord'
    ])

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
