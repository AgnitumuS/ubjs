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
      sortingProcess: false // as not to fall into an infinity loop
    }
  },
  created () {
    if (this.sorting) this.initSort()
  },
  methods: {
    // for reset sorting when sortOrder === 'none'
    createPrivateSortOrder () {
      this.items.forEach((el, index) => {
        el._privateSortOrder = index
      })
    },
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
      this.createPrivateSortOrder()
      if (Object.keys(initialSorting).length !== 2) return
      this.curColumnId = this.columns.find(i => i.id === initialSorting.id).id
      this.changeSorting(this.curColumnId, initialSorting.direction)
    },
    async changeSorting (colName, direction = 'asc') {
      this.sortingProcess = true
      this.sortOrder = direction
      this.columnCasheId = this.curColumnId
      let sortField = colName
      let sortDirection = direction
      if (this.sortOrder === 'none') {
        sortField = '_privateSortOrder'
        sortDirection = 'asc'
      }
      this.items.sort((a, b) => {
        const index = this.$UB.formatter.collationCompare(
          a[sortField],
          b[sortField]
        )
        return sortDirection === 'desc' ? index * -1 : index
      })
      await this.$nextTick()
      this.sortingProcess = false
    }
  }
}
