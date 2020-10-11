<template>
  <el-tooltip
    :content="$ut('UFile.scanSettingsButtonTooltip')"
    :enterable="false"
  >
    <u-button
      color="primary"
      icon="u-icon-scan-settings"
      appearance="inverse"
      @click="runSettings"
    />
  </el-tooltip>
</template>

<script>
export default {
  name: 'UFileScanSettingsButton',

  methods: {
    async runSettings () {
      this.$UB.core.UBApp.scannerSettings()
    }
  }
}
</script>
