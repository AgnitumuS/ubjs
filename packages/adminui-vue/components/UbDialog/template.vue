<template>
  <el-dialog
    :width="isDevInfo ? '90%' : '500px'"
    :visible.sync="visible"
    @close="cancel"
    @closed="doDestroy"
  >
    <div class="ub-dialog__title" slot="title">
      <i :class="`ub-dialog__info-icon el-icon-${type}`"/>
      <span>{{ $ut(title) }}</span>
    </div>

    <div
      ref="msg"
      :class="isDevInfo && 'ub-error-dialog__dev'"
      v-html="$ut(msg)"
    />

    <template slot="footer">
      <el-button
        v-if="isDevInfo"
        icon="fa fa-copy"
        @click="copyClipboard"
      />
      <el-button
        v-if="buttonText.cancel"
        @click="cancel"
      >
        {{ $ut(buttonText.cancel) }}
      </el-button>
      <el-button
        v-if="buttonText.no"
        @click="decline"
      >
        {{ $ut(buttonText.no) }}
      </el-button>
      <el-button
        type="primary"
        @click="accept"
      >
        {{ $ut(buttonText.yes) }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
module.exports = {
  name: 'UbDialog',
  data () {
    return {
      visible: false
    }
  },

  methods: {
    doDestroy () {
      this.$destroy(true)
      this.$el.remove()
    },

    decline () {
      this.resolveConfirm('decline')
      this.visible = false
    },

    accept () {
      this.resolveConfirm('accept')
      this.visible = false
    },

    cancel () {
      this.resolveConfirm('cancel')
      this.visible = false
    },

    copyClipboard () {
      window.getSelection().removeAllRanges()
      const range = document.createRange()
      range.selectNode(this.$refs.msg)
      window.getSelection().addRange(range)
      try {
        const isOk = document.execCommand('copy')
        if (isOk) {
          this.$message({
            message: 'Error code copied to clipboard',
            type: 'success'
          })
        }
      } catch (err) {
        console.log('Can`t copy, boss')
      }
      window.getSelection().removeAllRanges()
    }
  },

  mounted () {
    this.visible = true
  }
}
</script>

<style>
.ub-dialog__title {
  display: flex;
  align-items: center;
}

.ub-dialog__title span {
  font-size: 18px;
  font-weight: 600;
}

.ub-dialog__info-icon {
  font-size: 32px;
  margin-right: 12px;
  color: rgb(var(--grey));
}

.ub-dialog__info-icon.el-icon-error{
  color: rgb(var(--red));
}

.ub-dialog__info-icon.el-icon-question{
  color: rgb(var(--yellow));
}

.ub-notification__error {
  background: hsl(0, 87%, 96%);
  border-color: hsl(0, 87%, 96%);
}

.ub-error-dialog__dev{
  white-space: pre;
  overflow: auto;
  max-height: 50vh;
  line-height: 1.3;
}
</style>
