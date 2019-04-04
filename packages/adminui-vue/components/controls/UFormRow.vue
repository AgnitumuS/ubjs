<template>
  <div class="ub-form-row">
    <div
      class="ub-form-row__label"
      :class="{
        'ub-form-row__label__right': labelPositionComputed === 'right',
        required
      }"
      :style="labelWidthCss"
      :title="$ut(label)"
    >
      <span>{{ $ut(label) }}</span>
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
      from: 'labelWidth'
    },
    formLabelPosition: {
      from: 'labelPosition'
    }
  },

  computed: {
    labelWidthCss () {
      const width = this.labelWidth || this.formLabelWidth
      return `
        width: ${width}px;
        min-width: ${width}px;
      `
    },

    labelPositionComputed () {
      return this.labelPosition || this.formLabelPosition
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
  white-space: nowrap;
  padding-right: 8px;
  padding-top: 7px;
  display: flex;
}

.ub-form-row__label__right{
  justify-content: flex-end;
}

.ub-form-row__label span{
  text-overflow: ellipsis;
  overflow: hidden;
}

.ub-form-row__label:after{
  content: ':';
}

.ub-form-row__label.required:before {
  content: '*';
  color: rgb(var(--danger));
  margin: 0 2px;
  order: 1;
}

.ub-form-row__label__right.required:before{
  order: 2;
}

.ub-form-row__content{
  flex-grow: 1;
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
