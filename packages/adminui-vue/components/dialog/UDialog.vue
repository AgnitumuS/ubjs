<template>
  <el-dialog
    v-hold-focus
    :width="isDevInfo ? '90%' : '500px'"
    :visible.sync="visible"
    :append-to-body="true"
    @close="cancel"
    @open="setFocus"
  >
    <div
      slot="title"
      class="ub-dialog__title"
    >
      <i :class="`ub-dialog__info-icon el-icon-${type}`" />
      <span>{{ $ut(title) }}</span>
    </div>

    <div
      ref="msg"
      class="ub-dialog_break-word"
      :class="{'ub-error-dialog__dev': isDevInfo}"
      v-html="$ut(msg)"
    />

    <template slot="footer">
      <el-button
        v-if="isDevInfo"
        icon="fa fa-copy"
        @click="copyClipboard"
      />
      <el-button
        v-if="buttons.cancel"
        @click="cancel"
      >
        {{ $ut(buttons.cancel) }}
      </el-button>
      <el-button
        v-if="buttons.no"
        @click="decline"
      >
        {{ $ut(buttons.no) }}
      </el-button>
      <el-button
        ref="acceptButton"
        type="primary"
        @click="accept"
      >
        {{ $ut(buttons.yes) }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'UDialog',

  data () {
    return {
      title: '',
      msg: '',
      buttons: {},
      type: 'info',
      isDevInfo: false,
      resolver: null,
      visible: false
    }
  },

  methods: {
    decline () {
      this.resolver('no')
      this.$destroy()
    },

    accept () {
      this.resolver('yes')
      this.$destroy()
    },

    cancel () {
      this.resolver('cancel')
      this.$destroy()
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
    },

    async setFocus () {
      await this.$nextTick()
      const acceptButton = this.$refs.acceptButton
      acceptButton.$el.focus()
    }
  }
}
</script>

<style>
.ub-dialog_break-word {
  word-break: break-word;
}

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
  color: rgb(var(--info));
}

.ub-dialog__info-icon.el-icon-error{
  color: rgb(var(--danger));
}

.el-icon-error:before {
  /* change element error icon to ! because original very similar to close button
  content: "\e79d";*/
  content: "\e7a3" !important
}

.ub-dialog__info-icon.el-icon-question{
  color: rgb(var(--warning));
}

.ub-notification__error {
  background: hsl(0, 87%, 96%);
  border-color: hsl(0, 87%, 96%);
}

.ub-notification__error__btn-group{
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
}

.ub-notification__error__btn-group i{
  display: block;
  margin-left: 20px;
  font-size: 18px;
  color: rgba(var(--blue), 0.5);
  cursor: pointer;
}

.ub-notification__error__btn-group i:hover{
  color: rgb(var(--blue));
}

.ub-notification__error__content{
  --font-size: 14px;
  --line-height: 1.3;
  --lines-to-show: 5;

  display: block; /* Fallback for non-webkit */
  display: -webkit-box;
  max-height: calc(var(--font-size) * var(--line-height) * var(--lines-to-show)); /* Fallback for non-webkit */
  margin: 0 auto;
  font-size: var(--font-size);
  line-height: var(--line-height);
  -webkit-line-clamp: var(--lines-to-show);
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.ub-notification__error__content p{
  display: inline
}

.ub-error-dialog__dev{
  white-space: pre;
  overflow: auto;
  max-height: 50vh;
  line-height: 1.3;
}
</style>
