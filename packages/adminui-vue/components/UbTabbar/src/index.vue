<template>
  <div class="ub-tabbar">
    <i
      icon="fa fa-bars"
      class="fa fa-bars ub-tabbar__collapse-button"
      @click="$UB.core.UBApp.fireEvent('portal:sidebar:collapse')"
    />

    <div
      ref="tabWrap"
      class="ub-tabbar__tabs-wrap"
    >
      <div
        ref="tabInner"
        :class="{'disabled-transition': dragging}"
        :style="{transform: `translateX(${ offset }px)`}"
        class="ub-tab-slider"
        @mousedown="startDrag"
      >
        <transition-group
          name="tab-anim"
          class="ub-tab-slider__transition-group"
          @before-leave="beforeLeaveAnimation"
          @after-leave="afterLeaveAnimation"
        >
          <ub-tab
            v-for="(tab, index) in tabs"
            ref="tabs"
            :key="tab.id"
            :tab-data="tab"
            :class="{'active': current === index}"
            @close="handleClose"
            @open="handleTabClick"
            @right-click="$refs.context.show"
          />
        </transition-group>
      </div>
      <i
        v-show="sliderPrevVisible"
        class="ub-tab-slider__ctrl el-icon-arrow-left ub-tab-slider__ctrl__prev"
        @click="navigate(1)"
      />
      <i
        v-show="sliderNextVisible"
        class="ub-tab-slider__ctrl el-icon-arrow-right ub-tab-slider__ctrl__next"
        @click="navigate(-1)"
      />
    </div>

    <el-popover
      class="ub-tabbar__overflow"
      placement="bottom"
      trigger="click"
      popper-class="ub-tabbar__overflow__tray"
      :class="{'hidden': this.visibleWidth >= this.tabsWidth}"
    >
      <el-button
        slot="reference"
        icon="el-icon-more"
        circle
        class="ub-tabbar__button"
      />

      <div class="ub-tabbar__overflow__tabs">
        <ub-tab
          v-for="(tab, index) in tabs"
          :key="index"
          :tab-data="tab"
          in-tray
          :class="{'active': current === index}"
          @open="handleTabClick"
          @close="handleClose"
        />
      </div>
    </el-popover>

    <slot />

    <ub-context
      ref="context"
      :items="contextItems"
      click-outside-targets=".ub-tabbar__tab"
      @select="selectContext"
    />
  </div>
</template>

<script>
const UbTab = require('./UbTab.vue').default
const UbContext = require('../../controls/UbContext.vue').default

export default {
  name: 'UbTabbar',

  components: { UbTab, UbContext },

  data () {
    return {
      dragging: false,
      dragStart: null,
      offsetStart: null,
      disabledTabClick: false,

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
      activeTabPending: false,

      contextItems: [{
        label: 'close',
        action: 'close'
      }, {
        label: 'closeOther',
        action: 'closeOther'
      }, {
        label: '-'
      }, {
        label: 'closeAll',
        action: 'closeAll'
      }]
    }
  },

  computed: {
    sliderPrevVisible () {
      return this.visibleWidth < this.tabsWidth && this.offset < 0
    },

    sliderNextVisible () {
      return this.visibleWidth < this.tabsWidth && this.tabsWidth + this.offset > this.visibleWidth
    }
  },

  watch: {
    measurementPending (isPending) {
      if (isPending) {
        // $nextTick is strictly required here, to allow DOM changes to be completed.
        // This code is often called after tab is added or removed or other DOM changes made, which might
        // impact on measurements, so let them finish.
        this.$nextTick(this.calcTabWidth)
      }
    }
  },

  created () {
    this.subscribeCentralPanelEvents()
    $App.on('portal:tabbar:appendSlot', (Component, bindings) => {
      this.$slots.default = this.$createElement(Component, bindings)
    })
  },

  mounted () {
    this.initCreatedTabs()
    window.addEventListener('mouseup', this.stopDrag)
    this._oldWindowOnResize = window.onresize
    window.onresize = window._.debounce(this.calcTabWidth, 300)
  },

  beforeDestroy () {
    window.removeEventListener('mouseup', this.stopDrag)
    window.onresize = this._oldWindowOnResize
    delete this._oldWindowOnResize
  },

  methods: {
    beforeLeaveAnimation (el) {
      el.style.left = el.offsetLeft + 'px'
    },

    afterLeaveAnimation () {
      this.calcTabWidth()
    },

    calcTabWidth () {
      const points = []
      if (this.$refs.tabs) {
        for (const tab of this.$refs.tabs) {
          const { offsetLeft } = tab.$el
          points.push(offsetLeft)
        }
      }
      this.setMeasurements({
        visibleWidth: this.$refs.tabWrap.offsetWidth,
        tabsWidth: this.$refs.tabInner.offsetWidth,
        points
      })
      this.positionActiveTab()
    },

    startDrag ({ clientX }) {
      window.addEventListener('mousemove', this.doDrag)
      this.dragStart = clientX
      this.offsetStart = this.offset
      this.dragging = true
      this.disabledTabClick = false
      setTimeout(() => { this.disabledTabClick = true }, 200)
    },

    doDrag ({ clientX }) {
      this.offset = Math.min(this.offsetStart + clientX - this.dragStart, 0)
    },

    stopDrag () {
      window.removeEventListener('mousemove', this.doDrag)
      this.dragging = false
      this.moveToView()
    },

    handleTabClick (tab, ignoreDrag = false) {
      if (ignoreDrag || !this.disabledTabClick) {
        const index = this.tabs.indexOf(tab)
        if (index !== -1) {
          window.$App.viewport.centralPanel.setActiveTab(index)
        }
      }
    },

    handleClose (tabs, ignoreDrag) {
      if (!this.disabledTabClick || ignoreDrag) {
        for (const tabId of tabs.map(t => t.id)) {
          const currentTab = window.$App.viewport.centralPanel.queryById(tabId)

          currentTab.close()
        }
      }
    },

    selectContext (action, tab) {
      if (action === 'closeOther') {
        const other = this.tabs.filter(t => t.id !== tab.id)
        this.handleClose(other, true)
      } else if (action === 'closeAll') {
        this.handleClose(this.tabs, true)
      } else if (action === 'close') {
        this.handleClose([tab], true)
      }
    },

    moveToView () {
      if (this.tabsWidth <= this.visibleWidth || this.offset > 0) {
        // Content fully fits into visible area, or it is a positive offset, which should not be
        this.offset = 0
      } else if (this.tabsWidth + this.offset <= this.visibleWidth) {
        // Content does not fit, but the right border of the tabs ends within the visible area, so
        // shift content so that right border of content hits the right border of the visible area.
        this.offset = this.visibleWidth - this.tabsWidth
      }
    },

    navigate (direction) {
      this.offset += direction * this.visibleWidth * 0.3
      this.moveToView()
    },

    /**
     * Reaction on change of the active tab.  Await for measurements, if needed.
     */
    onChangeActiveTab (tabId) {
      let index = this.tabs.findIndex(t => t.id === tabId)

      /* Change index of currently selected tab */
      if (index < 0 || this.tabs.length === 0) {
        index = 0
      } else if (index >= this.tabs.length) {
        index = this.tabs.length - 1
      }
      this.current = index

      if (this.measurementPending) {
        if (!this.activeTabPending) {
          this.activeTabPending = true
          this.$nextTick(this.positionActiveTab)
        }
        return
      }

      this.positionActiveTab()
    },

    /**
     * Make the current tab visible
     */
    positionActiveTab () {
      const SLIDER_WIDTH = 35

      if (this.measurementPending) {
        // Still await for measurements
        this.$nextTick(this.positionActiveTab)
        return
      }

      const {
        current,
        tabs,
        offset,
        tabsWidth,
        visibleWidth
      } = this

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

      this.offset = newOffset
      this.activeTabPending = false
    },

    /**
     * Set measurements of the DOM.
     */
    setMeasurements ({ visibleWidth, tabsWidth, points }) {
      this.visibleWidth = visibleWidth
      this.tabsWidth = tabsWidth
      for (let i = 0; i < points.length; i++) {
        // For some reason, when tab is deleted, DOM is still there during measurement, so need to check
        if (this.tabs[i]) {
          this.tabs[i].point = points[i]
        }
      }
      this.measurementPending = false
      this.moveToView()
    },

    addTab (tab) {
      // When an ExtJS tab changes its title, need to sync it with tabbar
      tab.addListener('titlechange', (UBTab, newText) => {
        const tab = this.tabs.find(t => t.id === UBTab.id)
        if (tab) {
          tab.title = newText
          this.measurementPending = true
        }
      })

      /* Add a new tab to the end of tab list */
      this.tabs.push({
        id: tab.id,
        title: tab.title,
        point: null
      })

      this.measurementPending = true
    },

    initCreatedTabs () {
      const createdTabs = window.$App.viewport.centralPanel.items.items
      for (const tab of createdTabs) {
        this.addTab(tab)
      }
    },

    subscribeCentralPanelEvents () {
      window.$App.viewport.centralPanel.on({
        /**
         * React on adding a new tab to ExtJS "centralPanel".
         * @param sender
         * @param tab
         */
        add (sender, tab) {
          this.addTab(tab)
        },

        remove (sender, tab) {
          const { tabs, current } = this
          const index = tabs.findIndex(t => t.id === tab.id)
          if (index !== -1) {
            /* Remove a tab by its Id */
            this.tabs.splice(index, 1)
            this.measurementPending = true

            if (current > index) {
              this.onChangeActiveTab(tabs[current - 1].id)
            }
          }
        },

        async tabchange (sender, tab) {
          this.onChangeActiveTab(tab.id)
        },

        scope: this
      })
    }
  }
}
</script>

<style>
.ub-tabbar{
  padding: 8px;
  display:flex;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid rgba(var(--bg), 0.12);
}

.ub-tab-slider__ctrl{
  position: absolute;
  top: 0;
  width: 35px;
  height: 100%;
  display:flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 10;
  cursor: pointer;
}

.ub-tab-slider__ctrl__prev{
  background: linear-gradient(to left, transparent, #fefefe 45%);
  left: 0;
  justify-content: flex-start;
}

.ub-tab-slider__ctrl__next{
  background: linear-gradient(to right, transparent, #fefefe 45%);
  right: 0;
}

.ub-tabbar__tabs-wrap{
  position: relative;
  width: 100%;
  height: 32px;
  overflow: hidden;
}

.ub-tab-slider{
  position: absolute;
  top: 0;
  left: 0;
  transition:transform .2s;
}

.ub-tab-slider.disabled-transition{
  transition: none;
}

.ub-tabbar__overflow{
  width: 32px;
  min-width: 32px;
  height: 32px;
  margin-left: 30px;
  position: relative;
}

.ub-tabbar__overflow.hidden{
  visibility: collapse
}

.ub-tabbar__overflow__tray{
  background-color: rgba(var(--bg), 1);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.24);
  padding: 8px 0;
  border: none;
  line-height: 1;
}

.ub-tabbar__overflow__tray[x-placement^=bottom] .popper__arrow::after{
  border-bottom-color: rgba(var(--bg), 1);
}

.ub-tabbar__overflow__tabs{
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.tab-anim-move {
  transition: .23s;
}

.ub-tabbar__tab{
  transition:transform .23s, opacity .23s;
}

.tab-anim-enter,
.tab-anim-leave-to{
  opacity: 0;
  transform: translateY(30px);
}

.ub-tabbar__tab.tab-anim-leave-active{
  transition: all .23s;
  position: absolute;
  top: 0
}

.ub-tab-slider__transition-group{
  display: flex
}

.ub-tabbar__collapse-button{
  margin-right: 12px;
  font-size: 24px;
  width: 24px;
  color: rgba(var(--info), 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ub-tabbar__collapse-button:hover{
  color: rgb(var(--info));
}
</style>
