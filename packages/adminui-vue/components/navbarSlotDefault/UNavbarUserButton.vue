<template>
  <u-dropdown class="u-navbar__dropdown">
    <el-button
      circle
      style="padding: 2px"
    >
      <div
        v-if="svgIcon"
        v-html="svgIcon"
      />
    </el-button>

    <template #dropdown>
      <u-dropdown-item
        :label="userName"
        disabled
        icon="fa fa-user"
      />

      <u-dropdown-item
        v-if="negotiateAvailable"
        prevent-close
      >
        <el-checkbox
          slot="label"
          v-model="silenceKerberosLogin"
        >
          {{ $ut('KerberosRememberUserMenu') }}
        </el-checkbox>
      </u-dropdown-item>

      <slot />

      <u-dropdown-item divider />

      <u-dropdown-item
        label="userSettings"
        icon="el-icon-setting"
        @click="showSettings"
      />

      <u-dropdown-item
        label="changePassword"
        icon="fa fa-key"
        @click="changePassword"
      />

      <u-dropdown-item divider />

      <u-dropdown-item
        label="storedData"
        icon="fa fa-database"
      >
        <u-dropdown-item
          label="clearLocalStore"
          @click="clearLocalStore"
        />
        <u-dropdown-item
          label="resetGUIToDefault"
          @click="resetGUIToDefault"
        />
      </u-dropdown-item>

      <u-dropdown-item
        v-if="supportedLanguages.length > 1"
        label="changeLanguage"
        icon="fa fa-globe"
      >
        <u-dropdown-item
          v-for="lang in supportedLanguages"
          :key="lang"
          :disabled="lang === $UB.connection.userLang()"
          :label="lang"
          @click="changeLang(lang)"
        />
      </u-dropdown-item>

      <u-dropdown-item divider />

      <u-dropdown-item
        label="logout"
        icon="fa fa-sign-out"
        @click="doLogout"
      />

      <u-dropdown-item
        disabled
        :label="appVersion"
        icon="fa fa-info"
      />
    </template>
  </u-dropdown>
</template>

<script>
export default {
  name: 'UNavbarUserButton',

  data () {
    const silenceKerberosLogin = window.localStorage[this.$UB.LDS_KEYS.SILENCE_KERBEROS_LOGIN] === 'true'
    const negotiateAvailable = this.$UB.connection.authMethods.indexOf('Negotiate') !== -1
    const userName = this.$UB.connection.userData('employeeShortFIO') || this.$UB.connection.userLogin()
    const cfg = this.$UB.connection.appConfig
    const customVersion = this.$UB.connection.userData('appVersion')
    const appVersion = customVersion || `${cfg.serverVersion} / ${cfg.appVersion}`
    return {
      silenceKerberosLogin,
      negotiateAvailable: negotiateAvailable,
      userName,
      appVersion,
      iconClass: 'fa fa-user',
      svgIcon: '',
      supportedLanguages: this.$UB.connection.appConfig.supportedLanguages
    }
  },

  computed: {},

  watch: {
    silenceKerberosLogin (value) {
      window.localStorage.setItem(this.$UB.LDS_KEYS.SILENCE_KERBEROS_LOGIN, value)
    }
  },

  created () {
    $App.on({
      'portal:navbar:userButton:appendSlot': (Component, bindings) => {
        if (Array.isArray(this.$slots.default)) {
          this.$slots.default.push(this.$createElement(Component, bindings))
        } else {
          this.$slots.default = [this.$slots.default, this.$createElement(Component, bindings)]
        }
        this.$forceUpdate()
      }
    })
  },

  mounted () {
    System.import('jdenticon/dist/jdenticon.min.js').then(jdenticon => {
      this.iconClass = ''
      this.svgIcon = jdenticon.toSvg(this.userName, 26)
    })
  },

  methods: {
    showSettings () {
      this.$UB.core.UBApp.doCommand({
        cmdType: this.$UB.core.UBCommand.commandType.showForm,
        formCode: 'ubm_desktop-userSettings'
      })
    },

    changePassword () {
      this.$UB.core.UBApp.doCommand({
        cmdType: 'showForm',
        formCode: 'uba_user-changeUserPassword',
        title: 'changePassword',
        isModal: true
      })
    },

    doLogout () {
      window.localStorage.setItem(this.$UB.LDS_KEYS.USER_DID_LOGOUT, 'true')

      if (window.localStorage.getItem('lastAuthType').toLowerCase() !== 'openidconnect') {
        this.$UB.core.UBApp.logout()
        return
      }
      const selectedProvider = window.localStorage.getItem('openIDProvider')
      if (!selectedProvider) {
        this.$UB.core.UBApp.logout()
        return
      }
      this.$UB.core.UBApp.dialogYesNo('', 'doYouWantLogoutFromExternalServer').then(choice => {
        if (choice) {
          const url = window.location.origin + '/openIDConnect/' + selectedProvider + '?logout=true'
          window.open(url, window.location.origin + 'login', 'toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0')
        }
        this.$UB.core.UBApp.logout()
      })
    },

    async clearLocalStore () {
      await this.$UB.connection.cacheClearAll()
      this.$notify({
        title: this.$ut('executed'),
        message: this.$ut('clearLocalStore'),
        type: 'success'
      })
    },

    resetGUIToDefault () {
      this.$UB.core.UBLocalStorageManager.removeUserDataUI()
      this.$notify({
        title: this.$ut('executed'),
        message: this.$ut('resetGUIToDefault'),
        type: 'success'
      })
    },

    async changeLang (lang) {
      const choice = await this.$dialogYesNo('changeLanguage', 'changeLanguageRequireRestart')
      if (choice) {
        await this.$UB.connection.query({
          entity: 'uba_user',
          method: 'changeLanguage',
          newLang: lang
        })

        window.localStorage.setItem(this.$UB.LDS_KEYS.PREFERRED_LOCALE, lang)
        this.$UB.core.UBApp.logout()
      }
    }
  }
}
</script>
