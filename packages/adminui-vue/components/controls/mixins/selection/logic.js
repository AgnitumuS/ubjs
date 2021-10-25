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
      if (this.multiple) this.handlerSelection(row)
      this.$emit('click', { row })
    },
    handlerSelection (row) {
      const { selectionField, curSelection } = this
      const arr = curSelection
      const id = row[selectionField]
      const hasIndex = arr.indexOf(id)
      if (hasIndex === -1) {
        arr.push(id)
      } else {
        arr.splice(hasIndex, 1)
      }
      this.emitSelection()
    },
    emitSelection () {
      this.$emit('selected', this.curSelection)
    },
    handlerAllChecked () {
      const { items, allSelected, selectionField } = this
      this.curSelection.splice(0)
      if (!allSelected) {
        items.forEach(i => this.curSelection.push(i[selectionField]))
      }
      this.emitSelection()
    }
  }
}
