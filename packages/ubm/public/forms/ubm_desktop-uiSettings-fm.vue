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
        {{ this.$ut('el.table.resetFilter') }}
      </u-button>
    </div>

    <u-form-container
      label-position="top"
    >
      <div>
        <u-grid row-gap="10px">
          <u-grid :columns="1" row-gap="10px">
            <u-form-row label="ubm_desktop-uiSettings.applicationTitle">
              <u-base-input
                v-model="applicationTitle"
              />
              <div class="u-form-row__description">
                {{ $ut('ubm_desktop-uiSettings.HTMLPageTitle') }}
              </div>
            </u-form-row>
            <u-form-row label="ubm_desktop-uiSettings.applicationName">
              <u-base-input
                v-model="applicationName"
              />
              <div class="u-form-row__description">
                {{ $ut('ubm_desktop-uiSettings.applicationNameDescription') }}
              </div>
            </u-form-row>
            <u-form-row label="ubm_desktop-uiSettings.supportEMailAddress">
              <u-base-input
                v-model="supportMailTo"
              />
              <div class="u-form-row__description">
                {{ $ut('ubm_desktop-uiSettings.supportEMailAddressDescription') }}
                <a
                  href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks#e-mail_links"
                  target="_blank"
                >a mailto: modifier </a>
              </div>
            </u-form-row>
          </u-grid>

          <u-form-row label="ubm_desktop-uiSettings.UIColorsTheme">
            <u-radio
              v-model="selectedTheme"
              id-prop="name"
              label-prop="description"
              :items="availableThemes"
            />
            <div class="u-form-row__description">
              {{ $ut('ubm_desktop-uiSettings.previewIsNotAvailable') }}
            </div>
          </u-form-row>

          <section>
            <u-form-row label="ubm_desktop-uiSettings.loginPageLogo">
              <u-file-input
                v-model="loginWindowTopLogoFile"
                accept=".svg,.png,.gif"
              />
            </u-form-row>
            <div class="u-form-row__description">
              {{ $ut('ubm_desktop-uiSettings.logoWindowData') }}
            </div>
            <div class="auth-page__logo-container">
              <img
                :src="loginWindowTopLogoDataURL"
                class="auth-page__logo"
              >
            </div>
          </section>

          <section>
            <u-form-row label="ubm_desktop-uiSettings.expandedSidebarTopLogo">
              <u-file-input
                v-model="sidebarLogoBigFile"
                accept=".svg,.png,.gif"
              />
            </u-form-row>
            <div class="u-form-row__description">
              {{ $ut('ubm_desktop-uiSettings.sidebarLogoExpandedData') }}
            </div>
          </section>

          <section>
            <u-form-row label="ubm_desktop-uiSettings.collapsedSidebarTopLogo">
              <u-file-input
                v-model="sidebarLogoFile"
                accept=".svg,.png,.gif"
              />
            </u-form-row>
            <div class="u-form-row__description">
              {{ $ut('ubm_desktop-uiSettings.sidebarLogoCollapsedData') }}
            </div>
          </section>

          <section>
            <u-form-row label="ubm_desktop-uiSettings.faviconLabel">
              <u-file-input
                v-model="faviconFile"
                accept=".ico"
              />
            </u-form-row>
            <div class="u-form-row__description">
              {{ $ut('ubm_desktop-uiSettings.faviconTip') }}
            </div>
          </section>
        </u-grid>
      </div>
    </u-form-container>
  </div>
</template>

<script>
const { Form, SidebarInstance } = require('@unitybase/adminui-vue')
let originalLogo, originalLogoBig
const changedMsg = 'ubm_desktop-uiSettings.configurationChanged'

module.exports.mount = function (cfg) {
  originalLogo = SidebarInstance.logo
  originalLogoBig = SidebarInstance.logoBig
  Form(cfg).mount()
}

const DEFAULT_THEME = 'built-in'

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
      faviconFile: [],
      faviconDataURL: '',
      applicationTitle: this.$UB.connection.appConfig.uiSettings.adminUI.applicationTitle,
      applicationName: typeof appName === 'string' ? appName : JSON.stringify(appName),
      supportMailTo: this.$UB.connection.appConfig.uiSettings.adminUI.supportMailTo,
      availableThemes: [],
      selectedTheme: this.$UB.connection.appConfig.uiSettings.adminUI.customTheme || DEFAULT_THEME
    }
  },

  async mounted () {
    const { $ut } = this
    const resp = await this.$UB.connection.query({
      entity: 'ubm_desktop',
      method: 'getUIThemes'
    })

    this.availableThemes = [
      {
        name: DEFAULT_THEME,
        description: $ut('ubm_desktop-uiSettings.defaultTheme')
      },
      ...JSON.parse(resp.themes)
    ]
  },

  methods: {
    async doSave () {
      await this.$UB.connection.query({
        entity: 'ubm_desktop',
        method: 'changeUISettings',
        uiSettings: JSON.stringify({
          loginWindowTopLogoDataURL: this.loginWindowTopLogoDataURL,
          sidebarLogoDataURL: this.sidebarLogoDataURL,
          sidebarLogoBigDataURL: this.sidebarLogoBigDataURL,
          faviconDataURL: this.faviconDataURL,
          applicationTitle: this.applicationTitle,
          applicationName: this.applicationName,
          supportMailTo: this.supportMailTo,
          customTheme: this.selectedTheme === DEFAULT_THEME ? '' : this.selectedTheme
        })
      })

      return this.$dialogInfo(changedMsg)
    },

    async doReset () {
      await this.$UB.connection.query({
        entity: 'ubm_desktop',
        method: 'changeUISettings',
        reset: true
      })

      return this.$dialogInfo(changedMsg)
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

    faviconFile: {
      deep: true,
      handler (files) {
        if (!files.length) {
          this.faviconDataURL = ''
          return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
          this.faviconDataURL = reader.result
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
