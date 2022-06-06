const props = require('./props')

module.exports = {
  mixins: [props],
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
    },
    hoverIndex () {
      this.setFocusRow()
    }
  },
  methods: {
    onInputClickHandler (rowIndex, event) {
      const row = this.items[rowIndex]
      this.handlerSelection(row, event)
      this.onTableRowClickHandler(rowIndex)
    },
    async handlerSelection (row, event) {
      this.$emit('click-cell', { row, isMultipleSelectionCell: true })
      if (!this.enableMultiSelect) return
      const { multiSelectKeyAttr, curSelection } = this
      const arr = curSelection
      const id = row[multiSelectKeyAttr]
      const hasIndex = arr.indexOf(id)
      // disabled scrolling table
      if (event && event.code === 'Space') event.preventDefault()
      if (hasIndex === -1) {
        if (event && event.shiftKey) {
          this.cLickWithShiftHandler(row)
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
       * @param {object} addedArr: array<object> selectedArr an array that includes the objects (rows) that were added to the the selection
       */
      this.$emit('add-selected', { addedArr: arr })
    },
    emitRemoveSelectionEvent (arr) {
      /**
       * Triggers when the user removes the selection
       *
       * @param {object} removedArr: array<object>}  an array that includes the objects (rows) that were removed from the selection
       */
      this.$emit('remove-selected', { removedArr: arr })
    },
    emitSelectionEvent () {
      /**
       * Triggers when the user removes or adds a selection
       *
       * @param {Array<number>} selectedIDs an array that includes all currently selected values
       */
      this.$emit('selected', this.curSelection)
    },
    async checkedAllHandler () {
      if (!this.enableMultiSelect) return
      const { items, allSelected, multiSelectKeyAttr } = this
      const temp = new Set(this.curSelection)
      if (!allSelected) {
        const addedCache = []
        items.forEach((el) => {
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
    async contextMenuEventHandler ($event, rowIndex, col) {
      const row = this.items[rowIndex]
      this.setCurrentRow(rowIndex)
      if (this.enableMultiSelect) {
        const { multiSelectKeyAttr, curSelection } = this
        const value = row[multiSelectKeyAttr]
        if (!curSelection.includes(value)) {
          const cache = this.getSelectionRows()
          for (const rowInCache of cache) {
            await this.handlerSelection(rowInCache, $event)
          }
          await this.handlerSelection(row, $event)
        }
      }
      /**
       * Triggers when the user called contextmenu on table
       *
       * @param {object<event><row><column>} event: native event, row - item of tableItems, column - item of columns if available
       */
      this.$emit('contextmenu', { event: $event, row, column: col })
      /**
       *
       * @deprecated - exist for backward copability. Use contextmenu menu event and check column available field
       */
      if (col) { this.$emit('contextmenu-cell', { event: $event, row, column: col }) }
    },
    getSelectionRows () {
      const { items, multiSelectKeyAttr } = this
      const rows = []
      const temp = new Set(this.curSelection)
      items.forEach((el) => {
        const value = el[multiSelectKeyAttr]
        if (temp.has(value)) {
          temp.delete(value)
          rows.push(el)
        }
      })
      return rows
    },
    async cLickWithShiftHandler (row) {
      const { multiSelectKeyAttr, curSelection, items, lastRow } = this
      const lastTargetIndex = items.indexOf(lastRow)
      if (lastTargetIndex === -1) return
      this.lastRow = row
      const targetIndex = items.indexOf(row)

      if (targetIndex === lastTargetIndex) {
        await this.handlerSelection(row)
        return
      }
      const selection = window.getSelection()
      selection.removeAllRanges()

      let startIndex =
        lastTargetIndex < targetIndex ? lastTargetIndex : targetIndex
      const endIndex =
        lastTargetIndex < targetIndex ? targetIndex : lastTargetIndex

      const arrIterator = []
      for (startIndex; startIndex <= endIndex; startIndex++) {
        arrIterator.push(startIndex)
      }
      for (const index of arrIterator) {
        const elem = items[index]
        const value = elem[multiSelectKeyAttr]
        const isChecked = curSelection.includes(value)
        if (isChecked) continue

        await this.handlerSelection(elem)
      }
    },
    arrowWithShiftHandler (eventRow, direction) {
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
    toArrowPressHandler (event, direction) {
      const maxIndex = this.items.length - 1
      let nextIndex =
        direction === 'down' ? this.hoverIndex + 1 : this.hoverIndex - 1
      // moving through the rows of the table in a circle
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
        this.arrowWithShiftHandler(startRow, direction)
      }
    },
    onTableRowClickHandler (rowIndex) {
      const row = this.items[rowIndex]
      this.$emit('click', { row })
      this.$emit('click-row', { row })
      this.setCurrentRow(rowIndex)
    },
    setCurrentRow (rowIndex) {
      const row = this.items[rowIndex]
      this.hoverIndex = rowIndex
      this.startRowIndex = rowIndex
      this.lastRow = row
    },
    setFocusRow () {
      /**
       * Triggers when the user change active row with mouse or keyboard arrow
       *
       * @param {object<index>} index new active row in table items array
       */
      this.$emit('change-active-row', { index: this.hoverIndex })
      const { children } = this.$refs.content
      // because first tr in table it is head
      const shift = children.length - this.items.length
      const row = children[this.hoverIndex + shift]
      if (!row) return
      // needed to select row when pressing space button after navigating with arrow
      row.focus()
    }
  }
}
