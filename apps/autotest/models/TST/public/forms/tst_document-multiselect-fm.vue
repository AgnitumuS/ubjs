<template>
  <div>
    <ul>
      <li>selected IDs: {{selectedID}}</li>
      <li>last removed: {{removed}}</li>
      <li>last added: {{added}}</li>
    </ul>

    <u-table-entity
      :max-height="500"
      entity-name="cdn_currency"
      :enable-multi-select="true"
      @selected="selectedID = $event"
      @remove-selected="removed = $event"
      :before-add-selection="checkCanBeSelected"
      @add-selected="added = $event"
    />
  </div>
</template>
<script>
const { Form } = require('@unitybase/adminui-vue')

module.exports.default = {
  methods: {
    checkCanBeSelected (items) {
      return items[0].code3 !== 'UAH'
    }
  },
  data () {
    return {
      selectedID: [],
      removed: [],
      added: []
    }
  }
}

module.exports.mount = function (cfg) {
  Form(cfg).mount()
}
</script>
