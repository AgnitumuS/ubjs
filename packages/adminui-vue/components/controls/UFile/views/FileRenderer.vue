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
    v-else-if="renderType === 'pdf'"
    ref="view"
    frameborder="0"
    width="100%"
    height="100%"
    :src="previewUrl"
  />

  <div
    v-else
    class="file-renderer"
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
  </div>
</template>

<script>
const FileLoader = require('../helpers/FileLoader')

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
    fileId: Number
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
      switch (this.file.ct) {
        case 'image/jpeg':
        case 'image/png':
        case 'image/vnd.wap.wbmp':
        case 'image/bmp':
          return 'u-icon-file-image'

        case 'text/html':
        case 'text/xml':
        case 'text/markdown':
        case 'text/javascript':
        case 'text/css':
        case 'text/cmd':
          return 'u-icon-file-html'

        case 'text/csv':
          return 'u-icon-file-csv'

        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.oasis.opendocument.spreadsheet':
          return 'u-icon-file-excel'

        case 'application/pdf':
          return 'u-icon-file-pdf'

        case 'text/plain':
          return 'u-icon-file-text'

        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/vnd.oasis.opendocument.text':
          return 'u-icon-file-word'

        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        case 'application/vnd.ms-powerpoint.presentation.macroenabled.12':
        case 'application/vnd.oasis.opendocument.presentation':
          return 'fa fa-file-powerpoint-o'

        case 'application/x-rar-compressed':
        case 'application/x-7z-compressed':
        case 'application/zip':
          return 'fa fa-file-archive-o'

        default:
          return 'u-icon-file'
      }
    },

    renderType () {
      if (this.withPreview) {
        if (this.file.ct === 'image/png' || this.file.ct === 'image/jpeg') {
          return 'image'
        }
        if (this.file.ct === 'application/pdf') {
          return 'pdf'
        }
      }

      return 'file'
    },

    fileName () {
      return this.file.origName || this.file.fName
    }
  },

  watch: {
    async file (file) {
      if (file) {
        if (this.renderType === 'image' || this.renderType === 'pdf') {
          return this.fileLoader.getPreviewUrl(this.file, this.fileId)
        }
      } else {
        this.revokeUrl()
      }
    }
  },

  async created () {
    this.fileLoader = new FileLoader(this.entityName, this.attributeName)
    if (this.withPreview) { // prevent download document for non-preview mode
      this.previewUrl = await this.fileLoader.getPreviewUrl(this.file, this.fileId)
    }
  },

  beforeDestroy () {
    this.revokeUrl()
  },

  methods: {
    revokeUrl () {
      if (this.previewUrl) {
        window.URL.revokeObjectURL(this.previewUrl)
        this.previewUrl = ''
      }
    },

    zoomIn () {
      this.scaleValue += this.SCALE_STEP
    },

    zoomOut () {
      this.scaleValue -= this.SCALE_STEP
    },

    openFullscreen () {
      this.$refs.view.requestFullscreen()
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
</style>
