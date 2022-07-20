<template>
  <Splitpanes
    ref="splitpane"
    v-bind="$attrs"
    v-on="$listeners"
    @resized="savePosition"
  >
    <slot />
  </Splitpanes>
</template>

<script>
/* global UB */

const { Splitpanes } = require('splitpanes')
require('splitpanes/dist/splitpanes.css')

export default {
  name: 'USplitter',
  components: { Splitpanes },
  props: {
    splitId: {
      type: [String, Number],
      default: ''
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    getStorageKey () {
      return UB.core.UBLocalStorageManager.getFullKey(this.storegaKey)
    },
    restore () {
      const data = this.getDataFromStore()
      if (!Object.keys(data).length) return
      this.$refs.splitpane.panes.forEach((pane, index) => {
        pane.size = data[index]
      })
    },
    getDataFromStore () {
      let data = localStorage[this.getStorageKey()]
      if (data) data = JSON.parse(data)
      if (!data) data = {}
      if (!data[this.tabKey]) data[this.tabKey] = {}
      if (!data[this.tabKey][this.indexCurrSplitter]) {
        data[this.tabKey][this.indexCurrSplitter] = {}
      }
      this.baseData = data
      return data[this.tabKey][this.indexCurrSplitter]
    },
    setToStorage (data) {
      this.baseData[this.tabKey][this.indexCurrSplitter] = data
      UB.core.UBLocalStorageManager.setItem(this.storegaKey, this.baseData)
    },
    savePosition (panes) {
      const data = this.getDataFromStore()
      panes.forEach((el, index) => {
        data[index] = el.size
      })
      this.setToStorage(data)
    },
    getCurrentIndexInDOM () {
      const splitterElems = this.activeTab
        ? this.activeTab.el.dom.querySelectorAll('.splitpanes')
        : document.body.querySelectorAll('.splitpanes')
      let i = 0
      for (; i < splitterElems.length; ++i) {
        if (splitterElems[i] === this.$refs.splitpane.$el) break
      }
      return i
    },
    init () {
      this.storegaKey = 'splitter'
      this.activeTab = UB.core.UBApp.viewport.centralPanel.getActiveTab()
      this.tabKey = this.activeTab ? this.activeTab.id : location.pathname
      this.indexCurrSplitter = this.getCurrentIndexInDOM()
      this.restore()
    }
  }
}
</script>

<style>
.splitpanes--vertical > .splitpanes__splitter,
.splitpanes--vertical > .splitpanes__splitter {
  width: 7px;
  border-left: 1px solid #eee;
  border-right: 1px solid #eee;
  margin-left: -1px;
}
.splitpanes--horizontal > .splitpanes__splitter,
.splitpanes--horizontal > .splitpanes__splitter {
  height: 7px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  margin-top: -1px;
}
</style>
