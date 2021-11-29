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
    },
    hoverIndex () {
      this.setFocusRow()
    }
  },
  methods: {
    // used in UCardView
    handlerCardClick (rowIndex, event) {
      // const row = this.items[rowIndex]
      // the order in which the methods are called is important
      // this.handlerSelection(row, event)
      this.handlerClickOnTableRow(rowIndex, event)
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
      // disabled scroling table
      if (event && event.code === 'Space') event.preventDefault()
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
      if (this.enableMultiSelect) {
        const { multiSelectKeyAttr, curSelection } = this
        const value = row[multiSelectKeyAttr]
        if (!curSelection.includes(value)) {
          const cache = this.getSelectionRows()
          for (const row of cache) {
            await this.handlerSelection(row)
          }
          const rowIndex = this.items.indexOf(row)
          this.setCurrentRow(rowIndex)
          await this.handlerSelection(row)
        }
      }

      this.$emit('contextmenu', { event: $event, row, column: col })

      // I think that this will not break the functionality  - 29.11.2021 :)
      // else {
      //   this.$emit('contextmenu-cell', { event: $event, row, column: col })
      // }
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
    async handlerCLickWithShift (row) {
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
    handlerArrowWithShift (eventRow, direction) {
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
        this.handlerArrowWithShift(startRow, direction)
      }
    },
    handlerClickOnTableRow (rowIndex) {
      const row = this.items[rowIndex]
      this.$emit('click', { row })
      this.setCurrentRow(rowIndex)
    },
    setCurrentRow (rowIndex) {
      const row = this.items[rowIndex]
      this.hoverIndex = rowIndex
      this.startRowIndex = rowIndex
      this.lastRow = row
    },
    handlerSelectionStart (e) {
      e.preventDefault()
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
      row.focus()
    }
  }
}
