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
    handlerRowClick (row) {
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
        this.emitAddSelectionEvent([row])
      } else {
        arr.splice(hasIndex, 1)
        this.emitRemoveSelectionEvent([row])
      }
      this.emitSelectionEvent()
    },
    emitAddSelectionEvent (arr) {
      /**
       * Triggers when the user adds the selection
       *
       * @property {array} an array that includes the objects that were added to the the selection
       */
      this.$emit('add-selected', arr)
    },
    emitRemoveSelectionEvent (arr) {
      /**
       * Triggers when the user removes the selection
       *
       * @property {array} an array that includes the objects that were removed from the selection
       */
      this.$emit('remove-selected', arr)
    },
    emitSelectionEvent () {
      /**
       * Triggers when the user removes or adds a selection
       *
       * @property {array} an array that includes all currently selected values
       */
      this.$emit('selected', this.curSelection)
    },
    handlerCheckedAll () {
      const { items, allSelected, multiSelectKeyAttr } = this
      const temp = new Set(this.curSelection)
      if (!allSelected) {
        const addedCache = []
        items.forEach(el => {
          const value = el[multiSelectKeyAttr]
          if (!temp.has(value)) {
            temp.add(value)
            addedCache.push(el)
          }
        })
        this.emitAddSelectionEvent(addedCache)
        this.curSelection = [...temp]
      } else {
        const removedCache = []
        items.forEach(el => {
          const value = el[multiSelectKeyAttr]
          if (temp.has(value)) {
            temp.delete(value)
            removedCache.push(el)
          }
        })
        this.emitRemoveSelectionEvent(removedCache)
        this.curSelection.splice(0)
      }
      this.emitSelectionEvent()
    }
  }
}
