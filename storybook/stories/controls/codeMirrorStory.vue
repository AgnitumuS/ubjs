<template>
  <div>
    <h1>UCodeMirror</h1>
    <u-code-mirror
      v-model="value"
      @input="inputFn"
    ></u-code-mirror>
  </div>
</template>

<script>
import UCodeMirror from '@unitybase/adminui-vue/components/controls/UCodeMirror.vue'
import { action } from '@storybook/addon-actions'

export default {
  components: {
    UCodeMirror
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
