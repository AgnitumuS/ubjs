<template>
  <Splitpanes
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </Splitpanes>
</template>

<script>
const { Splitpanes } = require('splitpanes')
require('splitpanes/dist/splitpanes.css')

export default {
  name: 'USplitter',
  components: { Splitpanes },
  mounted () {
    console.log(this)
  },
  methods: {
    restore () {
      const data = this.getDataFromStore()
      if (!Object.keys(data).length || !this.comp.panes) return
      this.comp.panes.forEach((pane, index) => {
        pane.size = data[index]
      })
      this.comp.updatePaneComponents()
    },
    getDataFromStore () {
      let data = localStorage[this.baseKey]
      if (data) data = JSON.parse(data)
      if (!data) data = {}
      if (!data[this.paneKey]) data[this.paneKey] = {}
      if (!data[this.paneKey][this.splitId]) { data[this.paneKey][this.splitId] = {} }
      this.baseData = data
      return data[this.paneKey][this.splitId]
    },
    setToStorage (data) {
      this.baseData[this.paneKey][this.splitId] = data
      localStorage[this.baseKey] = JSON.stringify(this.baseData)
    },
    savePosition (panes) {
      const data = this.getDataFromStore()
      panes.forEach((el, index) => {
        data[index] = el.size
      })
      this.setToStorage(data)
    },
    init () {
      this.baseKey = 'splitPane'
      this.paneKey = location.pathname
      this.comp = this.$slots.default[0].child
      this.restore()
      const that = this
      this.comp.$watch(
        'panes',
        function (newValue) {
          that.savePosition(newValue)
        },
        { deep: true }
      )
    }
  }
}
</script>

<style scoped>
.splitpanes__pane {
  background-color: grey;
}
.splitpanes__splitter {
  background: white;
}
.splitpanes--horizontal > .splitpanes__splitter {
  height: 7px;
  border-top: 1px solid #eee;
  margin-top: -1px;
}
.splitpanes--vertical > .splitpanes__splitter {
  width: 7px;
  border-top: 1px solid #eee;
  margin-top: -1px;
}
</style>
