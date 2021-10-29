const props = require('./props')

module.exports = {
  mixins: [props],
  model: {
    prop: 'selectedRows',
    event: 'selected'
  },
  data () {
    return {
      curSelection: this.selectedRows
    }
  },
  computed: {
    allSelected () {
      const { items, curSelection } = this
      return items.length === curSelection.length
    }
  },
  watch: {
    selectedRows (e) {
      this.curSelection = e
    }
  },
  methods: {
    handlerClickOnRow (row) {
      if (this.enableMultiSelect) this.handlerSelection(row)
      this.$emit('click', { row })
    },
    handlerSelection (row) {
      const { multiSelectKeyAttr, curSelection } = this
      const arr = curSelection
      const id = row[multiSelectKeyAttr]
      const hasIndex = arr.indexOf(id)
      if (hasIndex === -1) {
        arr.push(id)
        this.$emit('addSelected', { row })
      } else {
        arr.splice(hasIndex, 1)
        this.$emit('removeSelected', { row })
      }
      this.emitSelection()
    },
    emitSelection () {
      this.$emit('selected', this.curSelection)
    },
    handlerAllChecked () {
      const { items, allSelected, multiSelectKeyAttr } = this
      this.curSelection.splice(0)
      if (!allSelected) {
        items.forEach(i => this.curSelection.push(i[multiSelectKeyAttr]))
      }
      this.emitSelection()
    }
  }
}
