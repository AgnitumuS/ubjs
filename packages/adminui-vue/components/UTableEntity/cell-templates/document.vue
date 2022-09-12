<template>
  <div
    v-if="value"
    class="u-table-entity__document-col"
  >
    <span>{{ fileName }}</span>
    <u-button
      v-if="showDownloadButton"
      :title="$ut('UTableEntity.buttons.download')"
      icon="u-icon-download"
      size="small"
      color="control"
      appearance="inverse"
      class="u-table-entity__document-button"
      @click="download"
    />

    <u-button
      v-if="showOpenInAppButton"
      :title="$ut('UTableEntity.buttons.openInApp')"
      :disabled="!canOpenInApp || !canGetDirectLink"
      icon="u-icon-file-edit"
      size="small"
      color="control"
      appearance="inverse"
      class="u-table-entity__document-button"
      @click="openInApp"
    />

    <u-button
      v-if="showLinkButton"
      :title="$ut('UTableEntity.buttons.copyFileLink')"
      :disabled="!canGetDirectLink"
      icon="u-icon-link"
      size="small"
      color="control"
      appearance="inverse"
      class="u-table-entity__document-button"
      @click="copyFileLink"
    />
  </div>
</template>

<script>
/* global $App */
const { getMSOfficeApp } = require('../../../utils/MSOfficeAppSelector')

export default {
  name: 'DocumentCellTemplate',

  props: ['value', 'row', 'column'],

  computed: {
    document () {
      return JSON.parse(this.value)
    },

    fileName () {
      return this.document.origName || this.document.fName
    },

    providerName () {
      return this.$UB.connection.appConfig.uiSettings.adminUI.webDAVproviderName || 'dfx'
    },

    davHost () {
      return window.location.origin
    },

    canGetDirectLink () {
      return this.$UB.connection.authMethods.includes('Negotiate')
    },

    showDownloadButton () {
      return this.column.downloadButton !== false
    },

    showOpenInAppButton () {
      return this.column.openInAppButton !== false
    },

    showLinkButton () {
      return this.column.linkButton !== false
    },

    MSOfficeApp () {
      return getMSOfficeApp(this.fileName)
    },

    canOpenInApp () {
      return !!this.MSOfficeApp
    }
  },

  methods: {
    download () {
      const instanceInfo = this.getRecordParams()
      return $App.downloadDocument(instanceInfo, this.document)
    },

    getRecordParams () {
      const attribute = this.column.attribute.code
      const attributePath = this.column.id.split('.')
      const isMasterAttr = attributePath.length === 1
      let ID

      if (isMasterAttr) {
        ID = this.row.ID
      } else {
        const identifierAttribute = attributePath.slice(0, attributePath.length - 1).join('.')
        ID = this.row[identifierAttribute]
        if (!ID) {
          throw new Error(`Cannot download document, because "${identifierAttribute}" attribute is not in fieldList`)
        }
      }

      return {
        entity: this.column.attribute.entity.code,
        attribute,
        ID
      }
    },

    async openInApp () {
      if (!this.canOpenInApp) {
        return
      }

      window.localStorage.setItem(this.$UB.LDS_KEYS.PREVENT_CALL_LOGOUT_ON_UNLOAD, 'true')
      const { entity, attribute, ID } = this.getRecordParams()

      document.location.href = [
        this.MSOfficeApp + this.davHost,
        'folders',
        this.providerName,
        entity,
        attribute,
        ID,
        this.fileName
      ].join('/')
    },

    async copyFileLink () {
      if (!this.canGetDirectLink) {
        return
      }
      window.localStorage.setItem(this.$UB.LDS_KEYS.PREVENT_CALL_LOGOUT_ON_UNLOAD, 'true')
      const { entity, attribute, ID } = this.getRecordParams()

      const link = [
        this.davHost,
        'folders',
        this.providerName,
        entity,
        attribute,
        ID,
        this.fileName
      ].join('/')

      try {
        await navigator.clipboard.writeText(link)
      } catch (e) {
        // if browser very old (or IE) and do not support Clipboard API
        const input = document.createElement('input')
        input.value = link
        input.style.position = 'absolute'
        input.style.top = '100%'
        input.style.left = '100%'
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        document.body.removeChild(input)
      }

      this.$notify({
        title: this.$ut('link'),
        message: this.$ut('linkCopiedText'),
        duration: 5000
      })
    }
  }
}
</script>

<style>
.u-table-entity__document-col {
  display: flex;
  align-items: center;
}

.u-table-entity__document-col span {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.u-table-entity__document-button {
  margin-left: 5px;
}
</style>
