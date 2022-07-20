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
      return UB.core.UBLocalStorageManager.getKeyUI(this.storegaKey)
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
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.baseData))
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
      UB.connection.on('removedUserDataUI', this.$refs.splitpane.equalize)
    }
  }
}
</script>

<style>
.splitpanes {
  --paneSize: 10px;
  --paneIconColor: hsl(var(--hs-control), var(--l-state-hover));
  --paneBorderColor: hsl(var(--hs-control), var(--l-state-disabled));;
}

.splitpanes .splitpanes__splitter {
  position: relative;
}
.splitpanes--vertical > .splitpanes__splitter,
.splitpanes--vertical > .splitpanes__splitter {
  width: var(--paneSize);
  border-left: 1px solid var(--paneBorderColor);
  border-right: 1px solid var(--paneBorderColor);
  margin-left: -1px;
  background-color: white;
}
.splitpanes--horizontal > .splitpanes__splitter,
.splitpanes--horizontal > .splitpanes__splitter {
  height: var(--paneSize);
  border-top: 1px solid var(--paneBorderColor);
  border-bottom: 1px solid var(--paneBorderColor);
  margin-top: -1px;
  background-color: white;
}

.splitpanes--vertical > .splitpanes__splitter:after,
.splitpanes--vertical > .splitpanes__splitter:before {
  content: '';
  position: absolute;
  width: 1px;
  height: 30px;
  top: 50%;
  left: 50%;
  background-color: var(--paneIconColor);
  transform: translateY(-50%);
}
.splitpanes--vertical > .splitpanes__splitter:after {
  margin-left: 1px;
}
.splitpanes--vertical > .splitpanes__splitter:before {
  margin-left: -2px;
}

.splitpanes--horizontal > .splitpanes__splitter:after,
.splitpanes--horizontal > .splitpanes__splitter:before {
  content: '';
  position: absolute;
  width: 30px;
  height: 1px;
  top: 50%;
  left: 50%;
  background-color: var(--paneIconColor);
  transform: translateX(-50%);
}
.splitpanes--horizontal > .splitpanes__splitter:after {
  margin-top: 1px;
}
.splitpanes--horizontal > .splitpanes__splitter:before {
  margin-top: -2px;
}
</style>
