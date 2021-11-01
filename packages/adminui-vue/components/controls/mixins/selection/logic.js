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
    },
    showMultiSelectionColumn () {
      return this.enableMultiSelect && this.items.length > 0
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
        this.emitAddSelection([row])
      } else {
        arr.splice(hasIndex, 1)
        this.emitRemoveSelection([row])
      }
      this.emitSelection()
    },
    emitAddSelection (arr) {
      this.$emit('addSelected', arr)
    },
    emitRemoveSelection (arr) {
      this.$emit('removeSelected', arr)
    },
    emitSelection () {
      this.$emit('selected', this.curSelection)
    },
    handlerAllChecked () {
      const { items, allSelected, multiSelectKeyAttr } = this
      const temp = new Set(this.curSelection)
      if (!allSelected) {
        const addedCash = []
        items.forEach(el => {
          const value = el[multiSelectKeyAttr]
          if (!temp.has(value)) {
            temp.add(value)
            addedCash.push(el)
          }
        })
        this.emitAddSelection(addedCash)
        this.curSelection = [...temp]
      } else {
        const removedCash = []
        items.forEach(el => {
          const value = el[multiSelectKeyAttr]
          if (temp.has(value)) {
            temp.delete(value)
            removedCash.push(el)
          }
        })
        this.emitRemoveSelection(removedCash)
        this.curSelection.splice(0)
      }
      this.emitSelection()
    }
  }
}
