<template>
  <div
    v-if="renderType === 'image'"
    class="file-renderer"
  >
    <div class="file-renderer__scale-button-group">
      <u-button
        icon="u-icon-search-plus"
        appearance="plain"
        :disabled="scaleValue >= MAX_SCALE"
        @click="zoomIn"
      />
      <u-button
        icon="u-icon-search-minus"
        appearance="plain"
        :disabled="scaleValue <= MIN_SCALE"
        @click="zoomOut"
      />
    </div>
    <div class="file-renderer__inner">
      <img
        ref="view"
        :src="previewUrl"
        :alt="fileName"
        :style="{
          transform: `scale(${scaleValue})`
        }"
      >
    </div>
  </div>

  <iframe
    v-else-if="((renderType === 'pdf') || (renderType === 'html'))"
    ref="view"
    frameborder="0"
    width="100%"
    height="100%"
    :src="previewUrl"
  />

  <video
    v-else-if="renderType === 'video'"
    ref="view"
    controls
    preload="none"
    width="100%"
    height="100%"
  >
    <source :src="previewUrl" :type="file.ct">
    <p>Your browser doesn't support HTML5 video</p>
  </video>

  <audio
    v-else-if="renderType === 'audio'"
    ref="view"
    :src="previewUrl"
    controls
    preload="none"
  >
    <p>Your browser doesn't support <code>audion</code> element</p>
  </audio>

  <u-code-mirror
    v-else-if="renderType === 'js'"
    ref="view"
    :src="previewUrl"
    :readonly="readonly"
    style="height: 100%; width: 100%; display: grid"
  />

  <div
    v-else
    class="file-renderer"
    @click="openInApp"
  >
    <u-icon
      :icon="icon"
      size="large"
    />
    <div class="file-renderer__name">
      {{ fileName }}
    </div>
    <div class="file-renderer__size">
      {{ formatBytes(file.size) }}
    </div>
    <div
      v-if="!canOpenInApp"
      class="file-renderer__size"
    >
      <p class="file-renderer__tip">To open a document in the program (webDav), just double-click the icon or file name</p>
    </div>
  </div>
</template>

<script>
const { connection } = require('@unitybase/ub-pub')
const CONTENT_TYPE_ICONS = {
  'image/jpeg': 'u-icon-file-image',
  'image/png': 'u-icon-file-image',
  'image/vnd.wap.wbmp': 'u-icon-file-image',
  'image/bmp': 'u-icon-file-image',

  'text/html': 'u-icon-file-html',
  'text/xml': 'u-icon-file-html',
  'text/markdown': 'u-icon-file-html',
  'text/javascript': 'fas fa-cogs',
  'text/css': 'u-icon-file-html',
  'text/cmd': 'fas fa-cogs',

  'text/csv': 'u-icon-file-csv',

  'application/vnd.ms-excel': 'u-icon-file-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'u-icon-file-excel',
  'application/vnd.oasis.opendocument.spreadsheet': 'u-icon-file-excel',

  'application/pdf': 'u-icon-file-pdf',

  'text/plain': 'u-icon-file-text',

  'application/msword': 'u-icon-file-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'u-icon-file-word',
  'application/vnd.oasis.opendocument.text': 'u-icon-file-word',

  'application/vnd.ms-powerpoint': 'fa fa-file-powerpoint-o',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fa fa-file-powerpoint-o',
  'application/vnd.ms-powerpoint.presentation.macroenabled.12': 'fa fa-file-powerpoint-o',
  'application/vnd.oasis.opendocument.presentation': 'fa fa-file-powerpoint-o',

  'application/x-rar-compressed': 'fa fa-file-archive-o',
  'application/x-7z-compressed': 'fa fa-file-archive-o',
  'application/zip': 'fa fa-file-archive-o',
  'application/gzip': 'fa fa-file-archive-o'
}

export default {
  name: 'FileRenderer',

  mixins: [
    require('../helpers/formatterMixin')
  ],

  props: {
    file: Object,
    withPreview: Boolean,
    entityName: String,
    attributeName: String,
    fileId: Number,
    readonly: Boolean
  },

  data () {
    return {
      previewUrl: '',
      scaleValue: 1,
      SCALE_STEP: 0.5,
      MIN_SCALE: 1,
      MAX_SCALE: 3
    }
  },

  computed: {
    icon () {
      if (!this.file.ct) return 'u-icon-file'
      const ct = this.file.ct.split(';')[0] || '' // `text/plain; charset=utf8` -> text/plain
      if (CONTENT_TYPE_ICONS[ct]) {
        return CONTENT_TYPE_ICONS[ct]
      } else if (ct.startsWith('video/')) {
        return 'far fa-file-video'
      } else {
        return 'u-icon-file'
      }
    },

    renderType () {
      if (this.withPreview) {
        const ct = this.file.ct
        if (ct === 'image/png' || ct === 'image/jpeg') {
          return 'image'
        } else if (ct === 'application/pdf') {
          return 'pdf'
        } else if (ct.startsWith('video/')) {
          return 'video'
        } else if (ct.startsWith('audio/')) {
          return 'audio'
        } else if (ct.startsWith('text/html')) {
          return 'html'
        } else if ((ct === 'application/def') || (ct.startsWith('application/javascript'))) {
          return 'js'
        }
      }

      return 'file'
    },

    fileName () {
      return this.file.origName || this.file.fName
    },

    /**
     * Return application for MSOffice environment to open specific file for editing
     * https://docs.microsoft.com/ru-ru/office/client-developer/office-uri-schemes
     */
    MSOfficeApp () {
      const fileNameParts = this.fileName.split('.')
      const fileExtension = fileNameParts?.[fileNameParts.length - 1].toLowerCase()
      switch (fileExtension) {
        case 'docx':
        case 'doc':
          return 'ms-word:ofe|u|'
        case 'xlsx':
        case 'xls':
          return 'ms-excel:ofe|u|'
        case 'ppt':
        case 'pptx':
          return 'ms-powerpoint:ofe|u|'
        default:
          return null
      }
    },

    canOpenInApp () {
      return this.file &&
        connection.authMethods.includes('Negotiate') &&
        connection.appConfig.uiSettings.adminUI.webDAVproviderName &&
        this.MSOfficeApp
    }
  },

  async created () {
    if (!this.withPreview) { // prevent download document for non-preview mode
      return
    }
    const getDocumentParams = {
      entity: this.entityName,
      attribute: this.attributeName,
      ID: this.fileId
    }
    if (this.file.isDirty) {
      getDocumentParams.isDirty = this.file.isDirty
      getDocumentParams.fileName = this.file.origName
    }
    if (this.file.revision) getDocumentParams.revision = this.file.revision
    this.previewUrl = await this.$UB.connection.getDocumentURL(getDocumentParams)
  },

  methods: {
    async openInApp () {
      if (!this.canOpenInApp) return

      const providerName = connection.appConfig.uiSettings.adminUI.webDAVproviderName
      const davHost = window.location.origin
      window.localStorage.setItem(UB.LDS_KEYS.PREVENT_CALL_LOGOUT_ON_UNLOAD, 'true')

      document.location.href = [
        this.MSOfficeApp + davHost,
        'folders',
        providerName,
        this.entityName,
        this.attributeName,
        this.fileId,
        this.fileName
      ].join('/')
    },

    zoomIn () {
      this.scaleValue += this.SCALE_STEP
    },

    zoomOut () {
      this.scaleValue -= this.SCALE_STEP
    },

    openFullscreen () {
      return this.$refs.view.requestFullscreen()
    }
  }
}
</script>

<style>
.file-renderer {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
}

.file-renderer__name {
  margin-top: 4px;
  font-size: 14px;
  padding: 0 12px;
  text-align: center;
}

.file-renderer__size {
  font-size: 12px;
  color: hsl(var(--hs-text), var(--l-text-label));
  margin: 4px 0;
}

.file-renderer__inner {
  overflow: auto;
}

.file-renderer,
.file-renderer__inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-renderer img {
  max-width: 100%;
  display: block;
  transition: .1s;
  transform-origin: top left;
}

.file-renderer__scale-button-group {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2;
  display: grid;
  grid-gap: 8px;
}

.file-renderer__tip {
  font-size: 14px;
  color: hsla(var(--hs-primary), var(--l-state-default))
}
</style>
