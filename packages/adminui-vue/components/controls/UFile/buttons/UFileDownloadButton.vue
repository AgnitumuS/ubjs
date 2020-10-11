<template>
  <el-tooltip
    :content="$ut('UFile.downloadButtonTooltip')"
    :enterable="false"
  >
    <u-button
      color="primary"
      icon="u-icon-download"
      appearance="inverse"
      :disabled="isDisabled"
      @click="downloadFile"
    />
  </el-tooltip>
</template>

<script>
export default {
  name: 'UFileDownloadButton',

  props: {
    multiple: Boolean
  },

  inject: {
    instance: 'fileComponentInstance'
  },

  computed: {
    isDisabled () {
      if (this.multiple) {
        return !this.instance.selectedFileId
      } else {
        return !this.instance.file
      }
    }
  },

  methods: {
    downloadFile () {
      const instance = this.instance
      if (this.multiple) {
        const file = instance.files.find(f => f.ID === instance.selectedFileId)
        if (file) {
          instance.fileLoader.saveAs(file, file.ID)
        }
      } else {
        instance.fileLoader.saveAs(instance.file, instance.recordId)
      }
    }
  }
}
</script>
