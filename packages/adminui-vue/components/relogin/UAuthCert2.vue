<template>
  <div>
    <p class="auth-page__cert-info" v-html="$ut('useCertificateInfoSimple')"></p>
    <el-button type="primary" style="min-width: 8rem" @click="doCert2Login">{{ $ut('UBAuthContinue') }}</el-button>
  </div>
</template>

<script>
export default {
  name: 'UbAuthCert2',
  props: {
    resolveAuth: {
      type: Function,
      default: null
    }
  },
  methods: {
    doCert2Login: function (pkParams) {
      this.resolveAuth({
        authSchema: 'CERT2'
      })
      this.$emit('close')
    }
  }
}
</script>
