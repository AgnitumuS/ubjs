<template>
  <div>
    <div class="auth-page__text">
      <el-tooltip
        :content="$ut('KerberosTip')"
        placement="bottom"
        effect="light"
      >
        <i class="auth-page__tooltip fa fa-question-circle-o" />
      </el-tooltip>

      <p v-html="$ut('KerberosHeader')" />
    </div>

    <el-button
      type="primary"
      size="medium"
      class="auth-page__submit-btn"
      @click="doLogin"
    >
      {{ $ut('UBAuthContinue') }}
    </el-button>
  </div>
</template>

<script>
module.exports = {
  name: 'UbAuthNegotiate',

  props: {
    resolveAuth: Function
  },

  methods: {
    doLogin () {
      this.resolveAuth({
        authSchema: 'Negotiate',
        registration: 0
      })
      this.$emit('close')
    }
  }
}
</script>
