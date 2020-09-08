/**
 * Sets watchers for "view mode" and "filters".
 * Store results in localStorage and apply it by "onInitialLoad" method
 */
module.exports = {
  props: {
    /**
     * If passed will store applied filters in localStorage
     */
    shortcutCode: [String, undefined]
  },

  data () {
    return {
      unwatch: () => {} // no-op. in case passed shortcutCode will replaced by unwatch function
    }
  },

  beforeDestroy () {
    this.unwatch()
  },

  methods: {
    /**
     * Local storage key mask
     *
     * @param {string} moduleName
     * @returns {string}
     */
    localStorageKey (moduleName) {
      return `UTableEntity:${moduleName}:${this.shortcutCode}`
    },

    /**
     * Apply filters in case local storage has value for current shortcut
     *
     * @param {Store} store Master instance store
     */
    applySavedFilters (store) {
      const filtersStr = window.localStorage.getItem(this.localStorageKey('filters'))
      if (filtersStr) {
        const filters = JSON.parse(filtersStr)
        for (const filter of filters) {
          store.commit('APPLY_FILTER', filter)
        }
      }
    },

    /**
     * Apply view mode in case local storage has value for current shortcut
     */
    applySavedViewMode () {
      const viewMode = window.localStorage.getItem(this.localStorageKey('viewMode'))
      if (viewMode) {
        this.viewMode = viewMode
      }
    },

    /**
     * Watch filters and save it into local storage
     *
     * @param {Store} store Master instance store
     * @returns {function(): void} Unwatch store
     */
    watchFilters (store) {
      return store.watch(
        state => state.filters,
        value => {
          window.localStorage.setItem(
            this.localStorageKey('filters'),
            JSON.stringify(value)
          )
        }
      )
    },

    /**
     * Watch filters and save it into local storage
     *
     * @returns {function(): void} Unwatch store
     */
    watchViewMode () {
      return this.$watch(
        () => this.viewMode,
        value => {
          window.localStorage.setItem(
            this.localStorageKey('viewMode'),
            value
          )
        }
      )
    },

    /**
     * UTableEntity hook which used before load data
     *
     * @param {Vue} masterTableInstance Master table instance
     * @param {Store} masterTableInstance.$store Master instance store
     */
    initLocalStorageWatcher (masterTableInstance) {
      if (this.shortcutCode !== undefined) {
        this.applySavedFilters(masterTableInstance.$store)
        this.applySavedViewMode()
        const unwatchFilters = this.watchFilters(masterTableInstance.$store)
        const unwatchViewMode = this.watchViewMode()
        this.unwatch = () => {
          unwatchFilters()
          unwatchViewMode()
        }
      }
    }
  }
}
