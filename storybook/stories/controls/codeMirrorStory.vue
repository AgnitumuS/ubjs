<template>
  <div>
    <h1>UbCodeMirror</h1>
    <ub-code-mirror
      v-model="value"
      @input="inputFn"
    ></ub-code-mirror>
  </div>
</template>

<script>
import UbCodeMirror from '@unitybase/adminui-vue/components/controls/UbCodeMirror.vue'
import { action } from '@storybook/addon-actions'

export default {
  components: {
    UbCodeMirror
  },
  methods: {
    inputFn: action('Entered value')
  },
  data () {
    return {
      value: this.$UB.connection.domain.get('tst_dictionary').asPlainJSON()
    }
  }
}
</script>
