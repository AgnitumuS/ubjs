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
            {{ errorText }}
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Form row with a label
 */
export default {
  name: 'UFormRow',
  props: {
    /**
     * If is set String param will be show error text
     * If set false will hide error
     * If set true will show default error text $ut('requiredField')
     */
    error: {
      type: [String, Boolean],
      default: false
    },
    label: String,
    /**
     * Show * red symbol after label
     */
    required: Boolean,
    /**
     * Set label width. If set in wrap `<u-form-container>` component
     * will override be this prop
     */
    labelWidth: {
      type: Number,
      default () {
        return this.formLabelWidth || 120
      }
    },
    /**
     * Set label position. If set in wrap `<u-form-container>` component
     * will override be this prop
     * `left/right`
     */
    labelPosition: {
      type: String,
      default () {
        return this.formLabelPosition || 'left'
      }
    }
  },

  inject: {
    formLabelWidth: {
      from: 'labelWidth',
      default: false
    },
    formLabelPosition: {
      from: 'labelPosition',
      default: false
    }
  },

  computed: {
    labelWidthCss () {
      return `
        width: ${this.labelWidth}px;
        min-width: ${this.labelWidth}px;
      `
    },

    labelPositionComputed () {
      return this.labelPosition
    },

    errorText () {
      if (this.error) {
        if (typeof this.error === 'boolean') {
          return this.$ut('requiredField')
        } else {
          return this.$ut(this.error)
        }
      }
      return ''
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

.ub-form-row__label[title]:after {
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

<docs>
### Error

```vue
<template>
  <div>
    <u-form-row
      required
      :error="showError"
      label="temp label"
    >
      <el-input />
    </u-form-row>

    <el-button-group>
      <el-button @click="showError = true">
        Show error
      </el-button>
      <el-button @click="showError = false">
        Hide error
      </el-button>
    </el-button-group>
  </div>
</template>

<script>
export default {
  data () {
    return {
      showError: true
    }
  }
}
</script>
```
</docs>
