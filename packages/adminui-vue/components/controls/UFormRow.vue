<template>
  <div class="ub-form-row">
    <div
      class="ub-form-row__label"
      :style="labelWidthCss"
    >
      {{ $ut(label) }}: <span v-show="required" class="ub-form-row__label__required-mark">*</span>
    </div>
    <div class="ub-form-row__content">
      <div
        class="ub-error-wrap"
        :class="{
          'is-error': error
        }"
      >
        <slot />
        <transition name="el-zoom-in-top">
          <div
            v-show="error"
            class="ub-error-wrap__text"
          >
            {{ error ? $ut(error) : '' }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UFormRow',
  props: {
    error: [String, Boolean],
    label: String,
    required: Boolean,
    labelWidth: Number
  },

  inject: {
    formLabelWidth: {
      from: 'labelWidth',
      default: 120
    }
  },

  computed: {
    labelWidthCss () {
      const width = this.labelWidth || this.formLabelWidth
      return `
        width: ${width}px;
        min-width: ${width}px;
      `
    }
  }
}
</script>

<style>
.ub-form-row{
  display: flex;
}

.ub-form-row + .ub-form-row{
  margin-top: 10px;
}

.ub-form-row__label{
  color: rgb(var(--info));
  /*width: 120px;*/
  /*min-width: 120px;*/
  padding-right: 8px;
  padding-top: 7px;
}

.ub-form-row__content{
  flex-grow: 1;
}

.ub-form-row__label__required-mark{
  color: rgb(var(--danger));
}

.ub-error-wrap{
  padding-bottom: 16px;
  position: relative;
}

.ub-error-wrap__text{
  color: rgb(var(--danger));
  position: absolute;
  bottom: 0;
  left: 0;
}

.ub-error-wrap.is-error .el-input__inner,
.ub-error-wrap.is-error .el-textarea__inner{
  border-color: rgb(var(--danger));
}
</style>
