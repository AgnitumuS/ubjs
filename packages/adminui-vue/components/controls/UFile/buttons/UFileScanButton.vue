<template>
  <el-tooltip
    :content="$ut('UFile.scanButtonTooltip')"
    :enterable="false"
  >
    <u-button
      icon="u-icon-scan"
      appearance="inverse"
      :disabled="instance.file || instance.disabled"
      @click="scanFile"
    />
  </el-tooltip>
</template>

<script>
export default {
  name: 'UFileScanButton',
  inject: {
    instance: 'fileComponentInstance'
  },

  methods: {
    async scanFile () {
      const scanResult = await this.$UB.core.UBApp.scan('Scan', {})
      const blob = typeof scanResult === 'string'
        ? this.$UB.base64toArrayBuffer(scanResult)
        : scanResult
      const file = new File(
        [blob],
        `Scan-${Date.now()}-.${this.$UB.core.UBApp.__scanService.lastScanedFormat}`
      )
      this.instance.upload([file])
    }
  }
}
</script>
