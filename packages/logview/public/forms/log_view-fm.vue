<template>
  <u-log-view> </u-log-view>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const ULogView = require('./components/ULogView.vue').default

module.exports.mount = function (cfg) {
  Form(cfg).mount()
}

module.exports.default = {
  name: 'log_view',
  components: {
    ULogView
  }
}
</script>
