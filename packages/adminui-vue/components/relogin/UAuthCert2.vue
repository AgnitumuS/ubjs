<template>
  <el-form @submit.native.prevent>

    <cert2-param-form :load-pk="doCert2Login" class="auth-inject-panel"></cert2-param-form>

  </el-form>
</template>

<script>
export default {
  name: 'UbAuthCert2',

  data () {
    return {
    }
  },

  props: {
    resolveAuth: Function
  },

  methods: {

    doCert2Login: function (pkParams) {
      this.resolveAuth(pkParams)
      this.$emit('close')
    }
  }
}
</script>
