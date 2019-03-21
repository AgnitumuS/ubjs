<template>
  <el-dialog
    title="Tips"
    :visible.sync="visible"
    width="30%"
  >
    messages__list
    <span slot="footer">
      <el-button @click="visible = false">Cancel</el-button>
      <el-button @click="visible = false" type="primary">Confirm</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'UNavbarNotificationsPopup',

  props: {
    value: Boolean
  },

  computed: {
    visible: {
      get () {
        return this.value
      },

      set (value) {
        this.$emit('input', value)
      }
    }
  }
}
</script>
