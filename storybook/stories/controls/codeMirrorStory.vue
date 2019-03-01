<template>
  <div>
    <h1>UbCodeMirror</h1>
    <ub-code-mirror
      v-model="value"
    ></ub-code-mirror>
  </div>
</template>

<script>
import UbCodeMirror from '@unitybase/adminui-vue/components/controls/UbCodeMirror.vue'

export default {
  components: {
    UbCodeMirror
  },
  data () {
    return {
      value: this.$UB.connection.domain.get('tst_dictionary')
    }
  }
}
</script>
