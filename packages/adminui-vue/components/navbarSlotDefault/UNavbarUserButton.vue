<template>
  <el-dropdown
    ref="dropdown"
    size="big"
    class="ub-navbar__dropdown"
    trigger="click"
    :hide-on-click="false"
    @command="dropdownHandler"
  >
    <el-button
      circle
      style="padding: 2px"
    >
      <div
        v-if="svgIcon"
        v-html="svgIcon"
      />
    </el-button>
    <el-dropdown-menu
      slot="dropdown"
      class="ub-navbar__menu-dropdown"
    >
      <el-dropdown-item
        disabled
      >
        <i class="fa fa-user" />
        {{ userName }}
      </el-dropdown-item>

      <el-dropdown-item v-if="negotiateEnabled">
        <el-checkbox v-model="silenceKerberosLogin">
          {{ $ut('KerberosRememberUserMenu') }}
        </el-checkbox>
      </el-dropdown-item>

      <slot />

      <el-dropdown-item
        divided
        command="hide"
        @click.native="showSettings"
      >
        <i class="el-icon-setting" />
        {{ $ut('userSettings') }}
      </el-dropdown-item>

      <el-dropdown-item
        command="hide"
        @click.native="changePassword"
      >
        <i class="fa fa-key" />
        {{ $ut('changePassword') }}
      </el-dropdown-item>

      <el-popover
        ref="storedData"
        placement="left"
        trigger="hover"
        popper-class="ub-navbar__menu-dropdown__popover"
      >
        <el-dropdown-item
          slot="reference"
          divided
        >
          <i class="ub-navbar__dropdown__caret el-icon-caret-left" />
          <i class="fa fa-database" />
          {{ $ut('storedData') }}
        </el-dropdown-item>

        <el-dropdown-item @click.native="clearLocalStore">
          {{ $ut('clearLocalStore') }}
        </el-dropdown-item>

        <el-dropdown-item @click.native="resetGUIToDefault">
          {{ $ut('resetGUIToDefault') }}
        </el-dropdown-item>
      </el-popover>

      <el-popover
        v-if="supportedLanguages.length >= 1"
        ref="languages"
        placement="left"
        trigger="hover"
        popper-class="ub-navbar__menu-dropdown__popover"
      >
        <el-dropdown-item slot="reference">
          <i class="ub-navbar__dropdown__caret el-icon-caret-left" />
          <i class="fa fa-globe" />
          {{ $ut('changeLanguage') }}
        </el-dropdown-item>

        <el-dropdown-item
          v-for="lang in supportedLanguages"
          :key="lang"
          :disabled="lang === $UB.connection.userLang()"
          @click.native="changeLang(lang)"
        >
          {{ $ut(lang) }}
        </el-dropdown-item>
      </el-popover>

      <el-dropdown-item
        divided
        @click.native="doLogout"
      >
        <i class="fa fa-sign-out" />
        {{ $ut('logout') }}
      </el-dropdown-item>
      <el-dropdown-item
        divider
        disabled
      >
        <i class="fa fa-info" />
        {{ appVersion }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'UNavbarUserButton',

  data () {
    const silenceKerberosLogin = window.localStorage[this.$UB.LDS_KEYS.SILENCE_KERBEROS_LOGIN] === 'true'
    const negotiateEnabled = this.$UB.connection.authMethods.indexOf('Negotiate') > 0
    const userName = this.$UB.connection.userData('employeeShortFIO') || this.$UB.connection.userLogin()
    const cfg = this.$UB.connection.appConfig
    const appVersion = `${cfg.serverVersion} / ${cfg.appVersion}`
    return {
      silenceKerberosLogin,
      negotiateEnabled,
      userName,
      appVersion,
      iconClass: 'fa fa-user',
      svgIcon: '',
      supportedLanguages: this.$UB.connection.appConfig.supportedLanguages
    }
  },

  computed: {
  },

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
    dropdownHandler (command) {
      if (command === 'hide') {
        this.$refs.dropdown.hide()
      }
    },

    showSettings () {
      $App.doCommand({
        cmdType: this.$UB.core.UBCommand.commandType.showForm,
        formCode: 'ubm_desktop-userSettings'
      })
    },

    async changePassword () {
      const result = await $App.showModal({
        formCode: 'uba_user-changeUserPassword',
        description: this.$ut('changePassword'),
        customParams: 'self'
      })
      if (result.action === 'ok') {
        await this.$UB.connection.xhr({
          method: 'POST',
          url: 'changePassword',
          data: {
            newPwd: result.newPwd,
            pwd: result.pwd,
            needChangePassword: result.needChangePassword
          }
        })
        await this.$dialogInfo('passwordChangedSuccessfully')
      }
    },

    doLogout () {
      window.localStorage.setItem(this.$UB.LDS_KEYS.USER_DID_LOGOUT, 'true')
      $App.logout()
    },

    async clearLocalStore () {
      this.$refs.storedData.doClose()
      await this.$UB.connection.cacheClearAll()
      this.$notify({
        title: this.$ut('executed'),
        message: this.$ut('clearLocalStore'),
        type: 'success'
      })
    },

    resetGUIToDefault () {
      this.$refs.storedData.doClose()
      this.$UB.core.UBLocalStorageManager.removeUserDataUI()
      this.$notify({
        title: this.$ut('executed'),
        message: this.$ut('resetGUIToDefault'),
        type: 'success'
      })
    },

    async changeLang (lang) {
      this.$refs.languages.doClose()
      const choice = await this.$dialogYesNo('changeLanguage', 'changeLanguageRequireRestart')
      if (choice) {
        await this.$UB.connection.query({
          entity: 'uba_user',
          method: 'changeLanguage',
          newLang: lang
        })

        window.localStorage.setItem(this.$UB.LDS_KEYS.PREFERRED_LOCALE, lang)
        $App.logout()
      }
    }
  }
}
</script>
