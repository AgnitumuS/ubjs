<template>
  <div>
    <input
      v-show="false"
      ref="input"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="upload"
    >
    <el-tooltip
      :content="$ut('UFile.addButtonTooltip')"
      :enterable="false"
    >
      <u-button
        color="primary"
        icon="u-icon-add"
        appearance="inverse"
        :disabled="instance.file || instance.disabled"
        @click="clickInput"
      />
    </el-tooltip>
  </div>
</template>

<script>
export default {
  name: 'UFileAddButton',

  props: {
    multiple: Boolean,
    accept: String
  },

  inject: {
    instance: 'fileComponentInstance'
  },

  methods: {
    clickInput () {
      this.$refs.input.click()
    },

    upload (e) {
      const files = e.target.files
      if (files && files.length) {
        this.instance.upload([...files])
        e.target.value = null
      }
    }
  }
}
</script>
