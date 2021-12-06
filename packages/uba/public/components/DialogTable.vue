<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="80%"
    top="5vh"
    lock-scroll
    destroy-on-close
    custom-class="dialog-table"
    @closed="closeDialog"
  >
    <u-table
      v-model="multipleSelection"
      :columns="columns"
      :items="dataTable"
      enable-multi-select
      :multi-select-key-attr="multiSelectKeyAttr"
    />
    <span
      v-if="dataTable.length > 0"
      slot="footer"
    >
      <el-button
        v-for="btn in btns"
        :type="btn.type"
        :disabled="btn.disabled ? btn.disabled.call(this) : false"
        @click.native="hanndleClickOnBtn(btn)"
      >{{ btn.label }}</el-button>
    </span>
  </el-dialog>
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
    defaultSelection: { type: Array, default: () => [] },
    multiSelectKeyAttr: { type: String, default: 'ID' }
  },
  data () {
    return {
      htmlTable: null,
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
      if (this.dialogVisible) {
        this.$nextTick(() => {
          this.setTable()
          this.setDefaultSelection()
        })
      }
    }
  },
  mounted () {
    this.setDefaultSelection()
  },
  methods: {
    setDefaultSelection () {
      this.defaultSelection.forEach(i => {
        this.$refs.table.toggleRowSelection(i)
      })
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
      this.dataTable.forEach((row, index) => {
        const flag = val.includes(row)
        this.setSelectionClass(row, index, flag)
      })
    },
    handleRowClick (row, column, event) {
      this.$refs.table.toggleRowSelection(row)
      this.setSelectionClass(row)
    },
    setTable () {
      let { table } = this.$refs
      if (!table) return
      table = table.$el.querySelector('.el-table__body')
      if (!table) return
      this.htmlTable = table
      return true
    },
    setSelectionClass (row, index, flag = true) {
      if (!this.htmlTable) return
      const elem = this.htmlTable.rows[index]
      if (!elem) return
      elem.classList.toggle('selection-row', flag)
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
