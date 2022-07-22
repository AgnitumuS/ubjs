/**
 * Sets watchers for "view mode" and "filters".
 * Store results in the uiSettingsStorage and apply it by "onInitialLoad" method
 */
module.exports = {
  props: {
    /**
     * If passed will store applied filters in the uiSettingsStorage
     */
    shortcutCode: [String, undefined]
  },

  data () {
    return {
      unwatchList: []
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
    uiStorageKey (moduleName) {
      return this.$uiSettingsStorage.getKey('UTableEntity', moduleName, this.shortcutCode)
    },

    /**
     * Checks uiSettingsStorage value by key and run callback which apply this value
     *
     * @param {string} key
     * @param {function(string):void} applyFunc
     */
    applySavedValue (key, applyFunc) {
      const localStorageString = this.$uiSettingsStorage.getItem(this.uiStorageKey(key))
      if (localStorageString) {
        applyFunc(localStorageString)
      }
    },

    /**
     * Watch filters and save it into local storage
     *
     * @param {Store} store Master instance store
     * @returns {function} Unwatch
     */
    watchFilters (store) {
      return store.watch(
        state => state.filters,
        value => {
          this.$uiSettingsStorage.setItem(
            this.uiStorageKey('filters'),
            JSON.stringify(value)
          )
        }
      )
    },

    /**
     * Watch filters and save it into local storage
     *
     * @returns {function} Unwatch
     */
    watchViewMode () {
      return this.$watch(
        () => this.viewMode,
        value => {
          this.$uiSettingsStorage.setItem(
            this.uiStorageKey('viewMode'),
            value
          )
        }
      )
    },

    /**
     * Watch sort and save it into local storage
     *
     * @param {Store} store Master instance store
     * @returns {function} Unwatch
     */
    watchSort (store) {
      return store.watch(
        state => state.sort,
        value => {
          this.$uiSettingsStorage.setItem(
            this.uiStorageKey('sort'),
            JSON.stringify(value)
          )
        }
      )
    },

    applySaved (store) {
      this.applySavedValue('filters', (filtersStr) => {
        const filters = JSON.parse(filtersStr)
        for (const filter of filters) {
          store.commit('APPLY_FILTER', filter)
        }
      })
      this.applySavedValue('viewMode', (viewMode) => {
        this.viewMode = viewMode
      })
      this.applySavedValue('sort', (sortStr) => {
        const sort = JSON.parse(sortStr)
        store.commit('SORT', sort)
      })
    },

    /**
     * UTableEntity hook which used before load data
     *
     * @param {Vue} masterTableInstance Master table instance
     * @param {Store} masterTableInstance.$store Master instance store
     */
    initLocalStorageWatcher (masterTableInstance) {
      if (this.shortcutCode !== undefined) {
        this.applySaved(masterTableInstance.$store)

        this.unwatchList.push(
          this.watchFilters(masterTableInstance.$store),
          this.watchViewMode(),
          this.watchSort(masterTableInstance.$store)
        )
      }
    },

    unwatch () {
      for (const unwatch of this.unwatchList) {
        unwatch()
      }
    }
  }
}
