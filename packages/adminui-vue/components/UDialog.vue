<template>
  <el-dialog
    v-hold-focus
    :width="isDevInfo ? '90%' : '500px'"
    :visible.sync="visible"
    :append-to-body="true"
    :close-on-click-modal="false"
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
      <a
        v-if="isDevInfo && mailForSendErr !== undefined"
        class="ub-dialog__footer__item ub-dialog__mail-link"
        :href="`mailto:${getMailUrl()}`"
        >
        <u-button
          appearance="plain"
          icon="u-icon-share"
        />
      </a>
      <u-button
        v-if="isDevInfo"
        class="ub-dialog__footer__item"
        appearance="plain"
        icon="u-icon-copy"
        @click="copyClipboard"
      />
      <u-button
        v-if="buttons.cancel"
        ref="cancelButton"
        class="ub-dialog__footer__item"
        appearance="plain"
        @click="cancel"
      >
        {{ $ut(buttons.cancel) }}
      </u-button>
      <u-button
        v-if="buttons.no"
        class="ub-dialog__footer__item"
        appearance="plain"
        @click="decline"
      >
        {{ $ut(buttons.no) }}
      </u-button>
      <u-button
        class="ub-dialog__footer__item"
        color="primary"
        @click="accept"
      >
        {{ $ut(buttons.yes) }}
      </u-button>
    </template>
  </el-dialog>
</template>

<script>
/**
 * Modal dialog (message box) for showing errors, information and confirmation
 * Do not use directly - ise function exported `dialogs` module
 */
export default {
  name: 'UDialog',

  data () {
    return {
      title: '',
      msg: '',
      buttons: {},
      type: 'info',
      isDevInfo: false,
      visible: false,
      mailForSendErr: window.UB?.appConfig?.uiSettings?.adminUI?.supportEmail
    }
  },

  methods: {
    getMailUrl(){
      const baseUrl = this.mailForSendErr
      const isQuery = typeof baseUrl === 'string' ? baseUrl.includes('?') : false
      const bodyQuery =`body=${this.msg}`
      const result = isQuery ? baseUrl + `&${bodyQuery}` : baseUrl + `?${bodyQuery}` 
      return result
    },

    decline () {
      this.$options.resolver('no')
      this.$destroy()
    },

    accept () {
      this.$options.resolver('yes')
      this.$destroy()
    },

    cancel () {
      this.$options.resolver('cancel')
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
      const btn = this.$refs.cancelButton
        ? this.$refs.cancelButton.$el // focus on 'Cancel' by default
        : this.$el.getElementsByClassName('u-button')[0] // no 'Cancel' button - search for first available
      if (btn) {
        btn.focus()
      }
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
  color: hsl(var(--hs-control), var(--l-state-default));
}

.ub-dialog__info-icon.el-icon-error{
  color: hsl(var(--hs-danger), var(--l-state-default));
}

.el-icon-error:before {
  /* change element error icon to ! because original very similar to close button
  content: "\e79d";*/
  content: "\e7a3" !important
}

.ub-dialog__info-icon.el-icon-question{
  color: hsl(var(--hs-warning), var(--l-state-default));
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
  color: hsl(var(--hs-primary), var(--l-state-default));
  cursor: pointer;
}

.ub-notification__error__btn-group i:hover{
  color: hsl(var(--hs-primary), var(--l-state-hover));
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

.ub-dialog__mail-link {
  text-decoration: unset;
}

.ub-dialog__footer__item {
  margin-right: 12px;
}

.ub-dialog__footer__item:last-child {
  margin-right: 0px;
}
</style>
