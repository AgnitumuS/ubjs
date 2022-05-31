<template>
  <div class="u-form-layout">
    <div class="u-toolbar">
      <u-button
        icon="u-icon-save"
        @click="doSave"
      >
        {{ $ut('save') }}
      </u-button>
      <u-button
        icon="u-icon-undo"
        @click="doReset"
      >
        {{ $ut('reset') }}
      </u-button>
    </div>

    <u-grid label-position="top">
      <u-grid>
        <section>
          <section>
            <u-form-row label="Login page logo">
              <u-file-input
                v-model="loginWindowTopLogoFile"
                accept=".svg,.png,.gif"
              />
            </u-form-row>
            <div class="auth-page__logo-container">
              <img
                :src="loginWindowTopLogoDataURL"
                class="auth-page__logo"
              >
            </div>
          </section>

          <u-form-row label="Expanded sidebar top logo">
            <u-file-input
              v-model="sidebarLogoBigFile"
              accept=".svg,.png,.gif"
            />
            <div class="u-form-row__description">
              SVG or image, visible in the top-left corner of the screen when sidebar is expanded
            </div>
          </u-form-row>

          <u-form-row label="Collapsed sidebar top logo">
            <u-file-input
              v-model="sidebarLogoFile"
              accept=".svg,.png,.gif"
            />
            <div class="u-form-row__description">
              SVG or image, visible in the top-left corner of the screen when sidebar is collapsed
            </div>
          </u-form-row>
        </section>
        <section>
          <u-form-row label="UI colors theme">
            <u-radio
              v-model="selectedTheme"
              id-prop="name"
              label-prop="description"
              :items="availableThemes"
            />
            <div class="u-form-row__description">
              Preview is not available. Page should be reloaded after save this setting to see effect
            </div>
          </u-form-row>

          <u-form-row label="Application title">
            <u-base-input
              v-model="applicationTitle"
            />
            <div class="u-form-row__description">
              Title of HTML page (text on the browser tab)
            </div>
          </u-form-row>
          <u-form-row label="Application name">
            <u-base-input
              v-model="applicationName"
            />
            <div class="u-form-row__description">
              Name of application for show on the login form. In case explicitly defined as empty string - not shown in login form.
              In simple case - string, for example <code>My App</code>,
              for localization can be specified as object with keys=locale: <code>{"en": "My App", "uk": "Мій додаток"}</code>
            </div>
          </u-form-row>

          <u-form-row label="Support E-Mail address">
            <u-base-input
              v-model="supportMailTo"
            />
            <div class="u-form-row__description">
              This field activate button on error message what allows to send an error text to specified address.
              The value must comply with the rules for generating an html-link with
              <a
                href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks#e-mail_links"
                target="_blank"
              >a mailto: modifier </a>
            </div>
          </u-form-row>
        </section>
      </u-grid>
    </u-grid>
  </div>
</template>

<script>
const { Form, SidebarInstance } = require('@unitybase/adminui-vue')
let originalLogo, originalLogoBig
const changedMsg = 'Configuration is changed. Reload page to see new settings in action. Some settings can be cached by browser, so better to use "Empty cache and hard reload" browser action to see it immediately'

module.exports.mount = function (cfg) {
  Form(cfg)
    .mount()
}

module.exports.mount = function (cfg) {
  originalLogo = SidebarInstance.logo
  originalLogoBig = SidebarInstance.logoBig
  Form(cfg).mount()
}

module.exports.default = {
  name: 'ubm_desktop-uiSettings',
  inject: ['$v'],
  data () {
    const appName = this.$UB.connection.appConfig.uiSettings.adminUI.applicationName
    return {
      loginWindowTopLogoFile: [],
      loginWindowTopLogoDataURL: '',
      sidebarLogoFile: [],
      sidebarLogoDataURL: '',
      sidebarLogoBigFile: [],
      sidebarLogoBigDataURL: '',
      applicationTitle: this.$UB.connection.appConfig.uiSettings.adminUI.applicationTitle,
      applicationName: typeof appName === 'string' ? appName : JSON.stringify(appName),
      supportMailTo: this.$UB.connection.appConfig.uiSettings.adminUI.supportMailTo,
      availableThemes: [],
      selectedTheme: this.$UB.connection.appConfig.uiSettings.adminUI.customTheme || 'buildin'
    }
  },
  mounted () {
    this.$UB.connection.run({
      entity: 'ubm_desktop',
      method: 'getUIThemes'
    }).then(resp => {
      const allThemes = [{
        name: 'buildin',
        description: 'Default theme'
      }].concat(JSON.parse(resp.themes))

      this.availableThemes = allThemes
    })
  },
  methods: {
    async doSave () {
      return this.$UB.connection.run({
        entity: 'ubm_desktop',
        method: 'changeUISettings',
        uiSettings: JSON.stringify({
          loginWindowTopLogoDataURL: this.loginWindowTopLogoDataURL,
          sidebarLogoDataURL: this.sidebarLogoDataURL,
          sidebarLogoBigDataURL: this.sidebarLogoBigDataURL,
          applicationTitle: this.applicationTitle,
          applicationName: this.applicationName,
          supportMailTo: this.supportMailTo,
          customTheme: this.selectedTheme === 'buildin' ? '' : this.selectedTheme
        })
      }).then(() => {
        return this.$dialogInfo(changedMsg)
      })
    },
    async doReset () {
      return this.$UB.connection.run({
        entity: 'ubm_desktop',
        method: 'changeUISettings',
        reset: true
      }).then(() => {
        return this.$dialogInfo(changedMsg)
      })
    },
    showPreview () {
      if (!this.loginWindowTopLogoFile.length) {
        this.loginWindowTopLogo = ''
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        this.loginWindowTopLogoDataURL = reader.result
        console.debug(this.loginWindowTopLogoDataURL)
      }
      reader.readAsDataURL(this.loginWindowTopLogoFile[0])
    }
  },
  watch: {
    loginWindowTopLogoFile: {
      deep: true,
      handler (files) {
        if (!files.length) {
          this.loginWindowTopLogoDataURL = ''
          return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
          this.loginWindowTopLogoDataURL = reader.result
        }
        reader.readAsDataURL(files[0])
      }
    },
    sidebarLogoBigFile: {
      deep: true,
      handler (files) {
        if (!files.length) {
          SidebarInstance.logoBig = originalLogoBig
          return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
          this.sidebarLogoBigDataURL = reader.result
          SidebarInstance.logoBig = this.sidebarLogoBigDataURL
          SidebarInstance.isCollapsed = false
        }
        reader.readAsDataURL(files[0])
      }
    },
    sidebarLogoFile: {
      deep: true,
      handler (files) {
        if (!files.length) {
          SidebarInstance.logo = originalLogo
          return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
          this.sidebarLogoDataURL = reader.result
          SidebarInstance.logo = this.sidebarLogoDataURL
          SidebarInstance.isCollapsed = true
        }
        reader.readAsDataURL(files[0])
      }
    },
    applicationTitle: (newTitle) => { document.title = newTitle }
  }
}
</script>
