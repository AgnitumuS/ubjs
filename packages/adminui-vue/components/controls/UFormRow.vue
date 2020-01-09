<template>
  <label
    class="u-form-row"
    :class="[`u-form-row__${labelPosition}`, {
      'is-error': error
    }]"
    :style="maxWidthCss"
  >
    <div
      class="u-form-row__label"
      :class="{ required }"
      :style="labelWidthCss"
      :title="$ut(label)"
    >
      <span>{{ $ut(label) }}</span>
    </div>
    <div class="u-form-row__error">
      <transition name="el-zoom-in-top">
        <div
          v-if="error"
          class="u-form-row__error__text"
          :title="errorText"
        >
          {{ errorText }}
        </div>
      </transition>
    </div>
    <div class="u-form-row__content">
      <slot />
    </div>
  </label>
</template>

<script>
/**
   * The mixin fixes the problem when, when you click on the arrow in el-select, a dropdown opens and closes immediately
   */
const ElSelectHack = {
  data () {
    return {
      elSelectRef: null
    }
  },

  mounted () {
    if (
      this.$slots.default &&
        this.$slots.default[0].componentOptions &&
        this.$slots.default[0].componentOptions.tag === 'el-select'
    ) {
      this.elSelectRef = this.$slots.default[0].elm
      this.elSelectRef.addEventListener('click', this.onClickSelect)
    }
  },

  beforeDestroy () {
    if (this.elSelectRef) {
      this.elSelectRef.removeEventListener('click', this.onClickSelect)
    }
  },

  methods: {
    onClickSelect (e) {
      e.preventDefault()
    }
  }
}

/**
   * Form row with a label
   */
export default {
  name: 'UFormRow',

  mixins: [ElSelectHack],

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
     * Show * red symbol after label.
     */
    required: Boolean,

    /**
     * Set label width. If set in wrap `<u-form-container>` component
     * will override be this prop.
     * Will ignored with labelPosition === 'top'
     */
    labelWidth: {
      type: Number,
      default () {
        return this.formLabelWidth || 150
      }
    },

    /**
     * Set label position. If set in wrap `<u-form-container>` component
     * will override by this prop.
     * Available options: left | right | top
     */
    labelPosition: {
      type: String,
      default () {
        return this.formLabelPosition || 'left'
      }
    },

    /**
     * Max width in px
     */
    maxWidth: {
      type: Number,
      default () {
        return this.formMaxWidth
      }
    }
  },

  inject: {
    formLabelWidth: { from: 'labelWidth', default: null },
    formLabelPosition: { from: 'labelPosition', default: null },
    formMaxWidth: { from: 'maxWidth', default: null }
  },

  computed: {
    errorText () {
      if (this.error) {
        if (typeof this.error === 'boolean') {
          return this.$ut('requiredField')
        } else {
          return this.$ut(this.error)
        }
      }
      return ''
    },

    labelWidthCss () {
      if (this.labelPosition === 'top') {
        return ''
      } else {
        return `
        width: ${this.labelWidth}px;
        min-width: ${this.labelWidth}px;
      `
      }
    },

    maxWidthCss () {
      if (this.maxWidth) {
        return {
          maxWidth: this.maxWidth + 'px'
        }
      } else {
        return ''
      }
    }
  }
}
</script>

<style>
  .u-form-row {
    display: grid;
    grid-template-areas: 'label error' 'content content';
    margin-bottom: 10px;
  }

  .u-form-row__content {
    grid-area: content
  }

  .u-form-row__label {
    grid-area: label;
    color: rgb(var(--info));
    padding-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    align-self: center;
    display: flex;
  }

  .u-form-row__label > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .u-form-row__label.required:before {
    content: '*';
    color: rgb(var(--danger));
    margin: 0 2px;
    order: 1;
  }

  .u-form-row__label[title]:after {
    content: ':';
  }

  .u-form-row__left,
  .u-form-row__right {
    grid-template-columns: auto 1fr;
    grid-template-areas: 'label content' '... error';
  }

  .u-form-row__left .u-form-row__error,
  .u-form-row__right .u-form-row__error {
    text-align: left;
  }

  .u-form-row__error {
    grid-area: error;
    text-align: right;
    color: rgb(var(--danger));
    white-space: nowrap;
    overflow: hidden;
    height: 16px;
  }

  .u-form-row__error__text {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .u-form-row.is-error .el-input__inner,
  .u-form-row.is-error .el-textarea__inner,
  .u-form-row.is-error .ub-select-multiple__container {
    border-color: rgb(var(--danger));
  }

  .u-form-row__top .u-form-row__label {
    padding-bottom: 6px;
  }

  .u-form-row__right .u-form-row__label {
    justify-content: flex-end;
  }

  .u-form-row__description {
    font-size: 12px;
    margin-top: 5px;
    color: rgb(var(--info), 0.6);
  }
</style>

<docs>
  ### Error

  ```vue
  <template>
    <div>
      <u-form-row
          required
          label-position="top"
          :error="showError"
          label="temp label"
      >
        <el-input/>
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
