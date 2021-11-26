const props = require('./props')

module.exports = {
  mixins: [props],
  model: {
    prop: 'selectedRows',
    event: 'selected'
  },
  data () {
    return {
      curSelection: this.selectedRows,
      hoverIndex: -1
    }
  },
  created () {
    this.lastRow = null
    this.lastDirection = null
    this.startRowIndex = null
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
    // used in UCardView
    handlerCardClick (rowIndex, event) {
      const row = this.items[rowIndex]
      // the order in which the methods are called is important
      this.handlerSelection(row, event)
      this.handlerClick(rowIndex)
    },
    handlerClickOnInput (row, event) {
      this.handlerSelection(row, event)
      this.$emit('click', { row })
    },
    async handlerSelection (row, event) {
      this.$emit('click-cell', { row })
      if (!this.enableMultiSelect) return
      const { multiSelectKeyAttr, curSelection } = this
      const arr = curSelection
      const id = row[multiSelectKeyAttr]
      const hasIndex = arr.indexOf(id)
      if (hasIndex === -1) {
        if (event && event.shiftKey) {
          this.handlerCLickWithShift(row)
          return
        }
        if (!(await this.beforeAddSelection([row]))) return
        arr.push(id)
        this.emitAddSelectionEvent([row])
      } else {
        if (!(await this.beforeRemoveSelection([row]))) return
        arr.splice(hasIndex, 1)
        this.emitRemoveSelectionEvent([row])
      }
      if (event) this.lastRow = row
      this.emitSelectionEvent()
    },
    emitAddSelectionEvent (arr) {
      /**
       * Triggers when the user adds the selection
       *
       * @param {array<object>} selectedArr an array that includes the objects (rows) that were added to the the selection
       */
      this.$emit('add-selected', arr)
    },
    emitRemoveSelectionEvent (arr) {
      /**
       * Triggers when the user removes the selection
       *
       * @param {array<object>} removedArr an array that includes the objects (rows) that were removed from the selection
       */
      this.$emit('remove-selected', arr)
    },
    emitSelectionEvent () {
      /**
       * Triggers when the user removes or adds a selection
       *
       * @param {array<number>} selectedIDs an array that includes all currently selected values
       */
      this.$emit('selected', this.curSelection)
    },
    async handlerCheckedAll () {
      if (!this.enableMultiSelect) return
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
        if (!(await this.beforeAddSelection(addedCache))) return
        this.emitAddSelectionEvent(addedCache)
        this.curSelection = [...temp]
      } else {
        const removedCache = this.getSelectionRows()
        if (!(await this.beforeRemoveSelection(removedCache))) return
        this.emitRemoveSelectionEvent(removedCache)
        this.curSelection.splice(0)
      }
      this.emitSelectionEvent()
    },
    async handlerContextMenuEvent ($event, row, col) {
      const { multiSelectKeyAttr, curSelection } = this
      const value = row[multiSelectKeyAttr]
      if (!curSelection.includes(value)) {
        const cache = this.getSelectionRows()
        for (const row of cache) {
          await this.handlerSelection(row)
        }
        await this.handlerSelection(row)
      }
      // for backward compatibility with UCardView
      if (col === undefined) {
        this.$emit('contextmenu', { event: $event, row })
      } else {
        this.$emit('contextmenu-cell', { event: $event, row, column: col })
      }
    },
    getSelectionRows () {
      const { items, multiSelectKeyAttr } = this
      const rows = []
      const temp = new Set(this.curSelection)
      items.forEach(el => {
        const value = el[multiSelectKeyAttr]
        if (temp.has(value)) {
          temp.delete(value)
          rows.push(el)
        }
      })
      return rows
    },
    handlerCLickWithShift (row) {
      const { multiSelectKeyAttr, curSelection, items, lastRow } = this
      const lastTargetIndex = items.indexOf(lastRow)
      if (lastTargetIndex === -1) return
      this.lastRow = row
      const targetIndex = items.indexOf(row)

      if (targetIndex === lastTargetIndex) {
        this.handlerSelection(row)
        return
      }

      let startIndex =
        lastTargetIndex < targetIndex ? lastTargetIndex : targetIndex
      const endIndex =
        lastTargetIndex < targetIndex ? targetIndex : lastTargetIndex

      for (startIndex; startIndex <= endIndex; startIndex++) {
        const elem = items[startIndex]
        const value = elem[multiSelectKeyAttr]
        const isChecked = curSelection.includes(value)
        if (isChecked) continue
        this.handlerSelection(elem)
      }
    },
    handlerArrowWithShift (event, eventRow, direction) {
      if (!event.shiftKey) {
        this.lastRow = eventRow
        return
      }
      const {
        items,
        lastRow,
        lastDirection,
        multiSelectKeyAttr,
        curSelection
      } = this
      const lastIndex = items.indexOf(lastRow)
      let nextRow
      let nextIndex = direction === 'down' ? lastIndex + 1 : lastIndex - 1
      nextIndex =
        lastDirection !== null && lastDirection !== direction
          ? lastIndex
          : nextIndex

      nextRow = items[nextIndex]
      nextIndex =
        eventRow === nextRow
          ? direction === 'down'
            ? nextIndex + 1
            : nextIndex - 1
          : nextIndex

      if (nextIndex < 0 || nextIndex > items.length - 1) return

      nextRow = items[nextIndex]
      this.lastRow = nextRow
      this.lastDirection = direction
      if (!curSelection.includes(eventRow[multiSelectKeyAttr])) {
        this.handlerSelection(eventRow)
      }
      this.handlerSelection(nextRow)
    },
    handlerPressToArrow (event, direction) {
      const maxIndex = this.items.length - 1
      let nextIndex =
        direction === 'down' ? this.hoverIndex + 1 : this.hoverIndex - 1
      if (!event.shiftKey) {
        nextIndex = nextIndex < 0 ? maxIndex : nextIndex
        nextIndex = nextIndex > maxIndex ? 0 : nextIndex
        this.startRowIndex = nextIndex
        this.lastRow = this.items[nextIndex]
        this.hoverIndex = nextIndex
      } else {
        if (nextIndex < 0 || nextIndex > maxIndex) return
        this.hoverIndex = nextIndex
        const startRow = this.items[this.startRowIndex]
        this.handlerArrowWithShift(event, startRow, direction)
      }
    },
    handlerClick (rowIndex) {
      const row = this.items[rowIndex]
      this.$emit('click', { row })
      this.hoverIndex = rowIndex
      this.startRowIndex = rowIndex
      this.lastRow = row
    }
  }
}
