<template>
  <div class="ub-tabbar">
    <div class="ub-tabbar__tabs-wrap" ref="tabWrap">
      <div 
        ref="tabInner"
        :class="{'disabled-transition': dragging}"
        :style="{transform: `translateX(${ offset }px)`}"
        @mousedown="startDrag"
        class="ub-tab-slider"
        >
        <transition-group
          @before-leave="beforeLeaveAnimation"
          @after-leave="afterLeaveAnimation"
          name="tab-anim"
          class="ub-tab-slider__transition-group"
          >
          <tab 
            v-for="(tab, index) in tabs"
            :key="tab.id"
            :tab-data="tab"
            :class="{'active': current === index}"
            @close="handleClose"
            @open="handleTabClick"
            @right-click="handleTabRightClick"
            />
        </transition-group>
      </div>
      <div 
        v-show="sliderPrevVisible"
        @click="navigate(1)"
        class="ub-tab-slider__ctrl ub-tab-slider__ctrl__prev"
        >
      </div>
      <div 
        v-show="sliderNextVisible"
        @click="navigate(-1)"
        class="ub-tab-slider__ctrl ub-tab-slider__ctrl__next"
        >
      </div>
    </div>

    <el-popover 
      class="ub-tabbar__overflow"
      placement="bottom"
      trigger="click"
      popper-class="ub-tabbar__overflow__tray"
      :class="{'hidden': this.visibleWidth >= this.tabsWidth}"
      >
      <div 
        slot="reference"
        class="ub-tabbar__overflow__icon"
        >
      </div>
      <div class="ub-tabbar__overflow__tabs">
        <tab 
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
  </div>
</template>

<script>
const {mapActions, mapGetters, mapMutations, mapState} = Vuex
const Tab = require('./tab.vue')
const context = require('../../tabbar-context/index')

module.exports = {
  name: 'tabbar',

  components: {Tab},

  data(){
    return {
      dragging: false,
      dragStart: null,
      offsetStart: null,
      disabledTabClick: false
    }
  },

  computed: {
    ...mapState([
      'tabs', 
      'current', 
      'offset', 
      'visibleWidth', 
      'tabsWidth', 
      'measurementPending'
    ]),
    ...mapGetters(['sliderPrevVisible', 'sliderNextVisible']),
  },

  watch: {
    measurementPending(isPending) {
      if (isPending) {
        // $nextTick is strictly required here, to allow DOM changes to be completed.
        // This code is often called after tab is added or removed or other DOM changes made, which might
        // impact on measurements, so let them finish.
        this.$nextTick(this.calcTabWidth)
      }
    }
  },

  mounted() {
    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('mousemove', this.doDrag)
    this._oldWindowOnResize = window.onresize
    window.onresize = _.debounce(this.calcTabWidth, 300)
  },

  beforeDestroy() {
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('mousemove', this.doDrag)
    window.onresize = this._oldWindowOnResize
    delete this._oldWindowOnResize
  },

  methods: {
    ...mapMutations({
      moveToView: 'MOVE_TO_VIEW',
      setOffset: 'OFFSET'
    }),

    ...mapActions([
      'navigate',
      'changeActiveTab',
      'positionActiveTab',
      'setMeasurements',
      'closeTabs'
    ]),

    beforeLeaveAnimation(el) {
      el.style.left = el.offsetLeft + 'px'
    },

    afterLeaveAnimation() {
      this.calcTabWidth()
    },

    calcTabWidth() {
      const points = []
      Array.prototype.forEach.call(this.$refs.tabInner.childNodes[0].childNodes, (item, index) => {
        points.push(index === 0 ? item.offsetLeft : item.offsetLeft)
      })

      this.setMeasurements({
        visibleWidth: this.$refs.tabWrap.offsetWidth,
        tabsWidth: this.$refs.tabInner.offsetWidth,
        points
      })
      
      this.positionActiveTab()
    },

    startDrag(e) {
      this.dragStart = e.clientX
      this.offsetStart = this.offset
      this.dragging = true
      this.disabledTabClick = false
      setTimeout(() => this.disabledTabClick = true, 200)
    },

    doDrag(e) {
      if (this.dragging) {
        this.setOffset(this.offsetStart + e.clientX - this.dragStart)
      }
    },

    stopDrag() {
      this.dragging = false
      this.moveToView()
    },

    handleTabClick(tab, ignoreDrag = false) {
      if (ignoreDrag || !this.disabledTabClick) {
        const index = this.tabs.indexOf(tab)
        if (index !== -1) {
          this.changeActiveTab(index)
        }
      }
    },

    handleClose(tabs, ignoreDrag) {
      if (!this.disabledTabClick || ignoreDrag) {
        this.closeTabs(tabs.map(t => t.id))
      }
    },

    async handleTabRightClick(e, tab){
      const action = await context(e)

      if (action === 'closeOther'){
        const other = this.tabs.filter(t => t.id !== tab.id)
        this.handleClose(other, true)

      } else if (action === 'closeAll'){
        this.handleClose(this.tabs, true)

      } else if (action === 'close'){
        this.handleClose([tab], true)
      }
    }
  }
}
</script>
