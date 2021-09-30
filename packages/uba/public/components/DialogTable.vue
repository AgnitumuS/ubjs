<template>
  <ElDialog
    :visible.sync="dialogVisible"
    width="80%"
    top="5vh"
    lock-scroll
    destroy-on-close
    custom-class="dialog-table"
    @closed="closeDialog"
  >
    <ElTable
      ref="table"
      :data="dataTable"
      max-height="500px"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <ElTableColumn
        v-if="columns.length > 0"
        type="selection"
        width="45"
      />
      <ElTableColumn
        v-for="item in columns"
        :key="item.label"
        :property="item.property || item.label"
        :label="item.label || item.property"
      />
    </ElTable>
    <span
      v-if="dataTable.length > 0"
      slot="footer"
    >
      <ElButton
        v-for="btn in btns"
        :key="btn.action"
        :type="btn.type"
        :disabled="btn.disabled ? btn.disabled.call(this) : false"
        @click.native="hanndleClickOnBtn(btn)"
      >{{ btn.label }}</ElButton>
    </span>
  </ElDialog>
</template>

<script>
module.exports.default = {
  name: 'DialogTable',
  props: {
    dataTable: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    show: {
      type: Boolean,
      default: false
    },
    defaultSelection: { type: Array, default: () => [] }
  },
  data () {
    return {
      dialogVisible: this.show,
      multipleSelection: [],
      btns: [
        {
          type: 'primary',
          label: 'Apply',
          action: 'add',
          disabled: () => this.addDisabled
        },
        { label: 'Close', action: 'close' }
      ]
    }
  },
  computed: {
    addDisabled () {
      return this.multipleSelection.length === 0
    }
  },
  watch: {
    show (e) {
      this.dialogVisible = e
      if (this.dialogVisible) this.setDefaultSelection()
    }
  },
  mounted () {
    this.setDefaultSelection()
  },
  methods: {
    setDefaultSelection () {
      this.defaultSelection.forEach(i => {
        this.$refs.table.toggleRowSelection(i)
        this.setSelectionClass(i)
      })
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    handleRowClick (row, column, event) {
      this.$refs.table.toggleRowSelection(row)
      this.setSelectionClass(row)
    },
    setSelectionClass (row) {
      let { table } = this.$refs
      if (!table) return
      table = table.$el.querySelector('.el-table__body')
      if (!table) return
      const index = this.dataTable.findIndex(i => i === row)
      table.rows[index].classList.toggle('selection-row')
    },
    hanndleClickOnBtn (btn) {
      if (btn.action === 'close' || !btn.action) {
        this.closeDialog()
        return
      }
      if (btn.action === 'add') this.addAction()
    },
    addAction () {
      this.$emit('add', { selection: this.multipleSelection })
      this.closeDialog()
    },
    closeDialog () {
      this.dialogVisible = false
      this.$emit('closed')
    }
  }
}
</script>
<style>
.dialog-table {
  --border: hsl(var(--hs-border), var(--l-layout-border-default));
  max-width: 1200px;
}
.dialog-table .el-dialog__body {
  padding-bottom: 20px;
}

.dialog-table .el-table {
  border: 1px solid var(--border);
}
.dialog-table .el-table th {
  background-color: rgb(225, 229, 229);
  text-transform: capitalize;
}
.dialog-table .el-table tbody tr {
  cursor: pointer;
}
.el-table__row.selection-row {
  background-color: #e4f4ff;
}
</style>
