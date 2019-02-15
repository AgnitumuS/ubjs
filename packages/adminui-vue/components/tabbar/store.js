module.exports = {
  state: () => ({
    tabs: [],
    current: 0,

    offset: 0,

    /**
     * Width of the visible area
     */
    visibleWidth: 0,

    /**
     * Total width of all tabs
     */
    tabsWidth: 0,

    sliderPrevWidth: 0,
    sliderNextWidth: 0,

    /**
     * Some actions have to wait until DOM elements measurements are done.  This flag tracks that.
     */
    measurementPending: false,

    /**
     * Making active tab visible is only allowed after measurements completed.  This flag tracks that action is
     * pending, it could be used to "setTimeout" changing offset, instead of immediately do it, to allow for
     * making measurements first.
     */
    activeTabPending: false
  }),

  getters: {
    sliderPrevVisible(state) {
      return state.visibleWidth < state.tabsWidth && state.offset < 0
    },

    sliderNextVisible(state) {
      return state.visibleWidth < state.tabsWidth && state.tabsWidth + state.offset > state.visibleWidth
    }
  },

  mutations: {
    /**
     * Change index of currently selected tab.
     * @param {object} state
     * @param {number} index
     */
    CURRENT(state, index) {
      if (index < 0 || state.tabs.length === 0) {
        index = 0
      } else if (index >= state.tabs.length) {
        index = state.tabs.length - 1
      }
      state.current = index
    },

    /**
     * Add a new tab to the end of tab list
     * @param {object} state
     * @param {object} tab
     */
    ADD(state, tab) {
      state.tabs.push(tab)
      state.measurementPending = true
    },

    /**
     * Remove a tab by its Id
     * @param {object} state
     * @param {string} tabId
     */
    REMOVE(state, tabId) {
      const index = state.tabs.findIndex(t => t.id === tabId)
      if (index !== -1) {
        state.tabs.splice(index, 1)
        state.measurementPending = true
      }
    },

    /**
     * Change tab title by tab ID
     * @param {object} state
     * @param {string} tabId
     * @param {string} title
     */
    TAB_TITLE(state, {tabId, title}) {
      const tab = state.tabs.find(t => t.id === tabId)
      if (tab) {
        tab.title = title
        state.measurementPending = true
      }
    },

    MEASUREMENTS(state, {visibleWidth, tabsWidth, points}) {
      state.visibleWidth = visibleWidth
      state.tabsWidth = tabsWidth
      for (let i = 0; i < points.length; i++) {
        // For some reason, when tab is deleted, DOM is still there during measurement, so need to check
        if (state.tabs[i]) {
          state.tabs[i].point = points[i]
        }
      }
      state.measurementPending = false
    },

    ACTIVE_TAB_PENDING(state, isPending) {
      state.activeTabPending = isPending
    },

    OFFSET(state, offset) {
      state.offset = Math.min(offset, 0)
    },

    MOVE_TO_VIEW(state) {
      if (state.tabsWidth <= state.visibleWidth || state.offset > 0) {
        // Content fully fits into visible area, or it is a positive offset, which should not be
        state.offset = 0

      } else if (state.tabsWidth + state.offset <= state.visibleWidth) {
        // Content does not fit, but the right border of the tabs ends within the visible area, so
        // shift content so that right border of content hits the right border of the visible area.
        state.offset = state.visibleWidth - state.tabsWidth
      }
    },

    NAVIGATE(state, direction) {
      state.offset += direction * state.visibleWidth * 0.3
    }
  },

  actions: {
    navigate({commit}, direction) {
      commit('NAVIGATE', direction)
      commit('MOVE_TO_VIEW')
    },

    /**
     * Reaction on change of the active tab.  Await for measurements, if needed.
     */
    onChangeActiveTab({commit, dispatch, state}, tabId) {
      const current = state.tabs.findIndex(t => t.id === tabId)
      commit('CURRENT', current)

      if (state.measurementPending) {
        if (!state.activeTabPending) {
          commit('ACTIVE_TAB_PENDING', true)
          setTimeout(() => dispatch('positionActiveTab'), 0)
        }
        return
      }

      dispatch('positionActiveTab')
    },

    /**
     * Make the current tab visible
     */
    positionActiveTab({commit, dispatch, state}) {
      const SLIDER_WIDTH = 35

      if (state.measurementPending) {
        // Still await for measurements
        setTimeout(() => dispatch('positionActiveTab'), 0)
        return
      }

      const {
        current,
        tabs,
        offset,
        tabsWidth,
        visibleWidth
      } = state

      let newOffset = 0

      if (current !== -1 && tabsWidth > visibleWidth) {
        // We have tabs and tabs do not fit into visible area

        // Calculate tab left and right coordinates
        const tabLeft = tabs[current].point
        const tabRight = current + 1 < tabs.length
          ? tabs[current + 1].point
          : tabsWidth

        const prevSliderVisible = current !== 0
        const prevSliderWidth = prevSliderVisible ? SLIDER_WIDTH : 0

        const nextSliderVisible = current + 2 < tabs.length ||
          tabRight - tabLeft - prevSliderWidth > visibleWidth
        const nextSliderWidth = nextSliderVisible ? SLIDER_WIDTH : 0

        if (current !== 0) {
          const offsetMakingTabRightVisible = visibleWidth - nextSliderWidth - tabRight

          if (tabLeft + offset < prevSliderWidth) {
            // Left side of the tab is beyond left side of the visible part.
            // Move it to the right, so that it would be visible
            // "+50" here is to make the part of right side of the previous tab visible to be able to click it
            newOffset = -(tabLeft - prevSliderWidth) + 50
          } else if (offset > offsetMakingTabRightVisible) {
            // Right side of the tab is beyond right side of the visible part (remember, offsets are negative!)

            // Use Math.max, because making right side visible may move left side outside the visible range,
            // and in that case, making left side visible takes priority
            newOffset = Math.max(-(tabLeft - prevSliderWidth), offsetMakingTabRightVisible)
          } else {
            // Stick the the current offset, if no need to adjust
            newOffset = offset
          }
        }
      }

      commit('OFFSET', newOffset)
      commit('ACTIVE_TAB_PENDING', false)
    },

    /**
     * Action is called in tab click.
     * @param context
     * @param {number} index Index of a tab
     */
    changeActiveTab(context, index) {
      $App.viewport.centralPanel.setActiveTab(index)
    },

    /**
     * Set measurements of the DOM.
     */
    setMeasurements({commit, state}, measurements) {
      commit('MEASUREMENTS', measurements)
      commit('MOVE_TO_VIEW')
    },

    /**
     * @description
     * There is no "clean" Vuex way to interact with AdminUI, and manipulating with tabs (such as closing tabs),
     * is more related to store actions than to the tab component itself.
     * So this action does some UI interactions, as an exception.
     *
     * @param commit
     * @param state
     * @param {string[]} tabIds
     */
    closeTabs({commit, state}, tabIds) {
      for (const tabId of tabIds) {
        const currentTab = $App.viewport.centralPanel.queryById(tabId)

        currentTab.close()
      }
    }
  }
}
