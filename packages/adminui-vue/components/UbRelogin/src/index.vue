<template>
  <el-dialog
    :show-close="false"
    width="340px"
    :visible.sync="visible"
    :close-on-click-modal="false"
  >
    <div
      slot="title"
      class="auth-page__header"
    >
      {{ $ut('Authentication') }}
    </div>
    <div class="auth-page__container">
      <div class="auth-page__logo-container">
        <img
          alt="Logo"
          :src="logoUrl"
          class="auth-page__logo"
        >
      </div>
      <hr>
      <component
        :is="'ub-auth-' + authSchema"
        :login="login"
        :resolve-auth="resolveAuth"
        @close="visible = false"
      />
    </div>
  </el-dialog>
</template>

<script>
let UbAuthCert2 = require('./UbAuthCert2.vue')
let UbAuthUb = require('./UbAuthUb.vue')
let UbAuthNegotiate = require('./UbAuthNegotiate.vue')

if (BOUNDLED_BY_WEBPACK) {
  UbAuthCert2 = UbAuthCert2.default
  UbAuthUb = UbAuthUb.default
  UbAuthNegotiate = UbAuthNegotiate.default
}

module.exports = {
  name: 'UbRelogin',

  components: {
    UbAuthCert2,
    UbAuthUb,
    UbAuthNegotiate
  },

  data () {
    return {
      visible: false,
      resolveAuth: null,
      login: ''
    }
  },

  computed: {
    authSchema () {
      return window.localStorage.getItem('lastAuthType').toLowerCase()
    },

    logoUrl () {
      return this.$UB.connection.appConfig.uiSettings.adminUI.loginWindowTopLogoURL
    }
  },

  created () {
    this.$UB.connection.setRequestAuthParamsFunction((connection /*, isRepeat */) => {
      connection._events.authorizationFail = ({message}) => {
        this.$message.error({
          message: this.$ut(message),
          customClass: 'auth-error-notify',
          duration: 7000
        })
      }
      this.login = connection.lastLoginName
      this.visible = true

      return new Promise((resolve /*, reject */) => {
        this.resolveAuth = resolve
      })
    })
  }
}
</script>
