<template>
  <el-dialog
    v-hold-focus
    append-to-body
    :close-on-click-modal="false"
    :visible.sync="visible"
    @close="done()"
  >
    <slot
      v-bind="$attrs"
      :done="done"
    />
  </el-dialog>
</template>

<script>
export default {
  name: 'BaseTemplate',

  props: {
    resolve: Function
  },

  data () {
    return {
      visible: false
    }
  },

  mounted () {
    this.visible = true
  },

  methods: {
    done (payload) {
      this.resolve(payload)
      this.visible = false
    }
  }
}
</script>
