module.exports = {
  props: {
    /**
     * enable sort mode for table. Default `false`. Sorting in the browser
     */
    sorting: { type: Boolean, default: false },
    /**
     * options for sorting.
     *
     * `id` -  the column by which the sorting will be.
     *
     * `direction` - sorting direction. "asc" or "desc"
     */
    initialSorting: { type: Object, default: () => ({}) }
  },
  computed: {
    sortOrderInPopup () {
      const { columnCasheId, curColumnId, sortOrder } = this
      return curColumnId === columnCasheId ? sortOrder : 'none'
    }
  },
  data () {
    return {
      sortOrder: 'none',
      targetColumn: null,
      curColumnId: null,
      columnCasheId: null,
      currentItems: JSON.parse(JSON.stringify(this.items)) // for reset sorting when sortOrder === 'none'
    }
  },
  async mounted () {
    await this.$nextTick()
    if (this.sorting) this.initSort()
  },
  methods: {
    handlerClickOnHeadCell ($event, col) {
      const targetColumn = $event.target
      this.$emit('click-head-cell', col, targetColumn)
      if (!this.sorting) return
      this.$refs.dropdown.visible = false
      setTimeout(() => {
        this.targetColumn = targetColumn
        this.curColumnId = col.id
        this.toggleSortingPopup()
      }, 0)
    },
    toggleSortingPopup () {
      this.$refs.dropdown.toggleVisible()
    },
    handlerSelectSort (direction) {
      this.changeSorting(this.curColumnId, direction)
      this.toggleSortingPopup()
    },
    initSort () {
      const { initialSorting } = this
      if (Object.keys(initialSorting).length !== 2) return
      this.curColumnId = this.columns.find(i => i.id === initialSorting.id).id
      this.changeSorting(this.curColumnId, initialSorting.direction)
    },
    changeSorting (colName, direction = 'asc') {
      const { currentItems } = this
      this.sortOrder = direction
      this.columnCasheId = this.curColumnId
      if (this.sortOrder === 'none') {
        this.currentItems = JSON.parse(JSON.stringify(this.items))
        return
      }
      currentItems.sort((a, b) => {
        const index = this.$UB.formatter.collationCompare(
          a[colName],
          b[colName]
        )
        return direction === 'desc' ? index * -1 : index
      })
    }
  }
}
