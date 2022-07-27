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
    /**
     * Used to identify splitpane on the page. Recommended for use. If `splitId` is not passed,  will be used the index splitpane in DOM
     */
    splitId: {
      type: [String, Number],
      default: ''
    },
    /**
     * whether the split panel can be stored in localStorage
     */
    canSaveInStorage: {
      type: Boolean,
      default: true
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    restore () {
      if (!this.baseData.length) return
      this.$refs.splitpane.panes.forEach((pane, index) => {
        pane.size = this.baseData[index]
      })
    },
    getDataFromStore () {
      return this.$uiSettings.getByKey(this.storageKey) || []
    },
    savePosition (panes) {
      this.$uiSettings.putByKey(panes.map(p => p.size), this.storageKey)
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
    verification () {
      return this.$refs.splitpane.panes.length === this.baseData.length
    },
    init () {
      if (!this.canSaveInStorage) return
      this.activeTab = UB?.core?.UBApp?.viewport?.centralPanel.getActiveTab()
      this.tabKey = this.activeTab ? this.activeTab.id : location.pathname
      this.indexCurrSplitter = this.splitId || this.splitId === 0 ? this.splitId : this.getCurrentIndexInDOM()
      this.storageKey = this.$uiSettings.buildKey('splitter', this.tabKey, this.indexCurrSplitter.toString())
      this.baseData = this.getDataFromStore()
      if (!this.verification()) return
      this.restore()
    }
  }
}
</script>

<style>
.splitpanes {
  --paneSize: 10px;
  --paneIconColor: hsl(var(--hs-control), var(--l-state-hover));
  --paneBorderColor: hsl(var(--hs-control), var(--l-state-disabled));
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.splitpanes--horizontal > .splitpanes__splitter:before {
  margin-top: -2px;
}
</style>
