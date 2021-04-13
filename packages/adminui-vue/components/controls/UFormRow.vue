<template>
  <label
    class="u-form-row"
    :class="[`u-form-row__${labelPosition}`, {
      'is-error': error
    }]"
    :style="maxWidthCss"
  >
    <button
      v-if="preventLabelEvents"
      class="u-form-row__ghost-button"
    />
    <div
      v-if="label"
      class="u-form-row__label"
      :class="{ required, readonly }"
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
 * This mixin fixes the problem, when user click on the arrow in el-select, a dropdown opens and closes immediately
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
 * A Form building block what combines a:
 *
 *  - label (optionally appended by readonly\required mark)
 *  - some control (input, select etc.)
 *  - error placeholder
 *
 * The name `UFormRow` may be confusing, but exists for historical reasons.
 * This is *not a row*, but a container for `label+control+error` (analogue of `form-control` in Bootstrap).
 *
 * Used by `UAutoField`
 */
export default {
  name: 'UFormRow',
  mixins: [ElSelectHack],
  inject: {
    formLabelWidth: { from: 'labelWidth', default: null },
    formLabelPosition: { from: 'labelPosition', default: null },
    formMaxWidth: { from: 'maxWidth', default: null }
  },
  props: {
    /**
     * either string with error message or boolean.
     * If === `false` then error is always hidden, if `true` - `$ut('requiredField')` will be shown in case of error
     */
    error: {
      type: [String, Boolean],
      default: false
    },
    /**
     * row label (automatically followed by ":")
     */
    label: String,
    /**
     * if `true` - show red asterix symbol after label
     */
    required: Boolean,
    /**
     * if `true` - show a small lock symbol after label
     */
    readonly: Boolean,
    /**
     * label width. Ignored if labelPosition === 'top'
     */
    labelWidth: {
      type: Number,
      default () {
        return this.formLabelWidth || 150
      }
    },
    /**
     * label position.
     * @values left, right, top
     */
    labelPosition: {
      type: String,
      validator: (value) => ['left', 'right', 'top'].includes(value),
      default () {
        return this.formLabelPosition || 'left'
      }
    },
    /**
     * max width in px
     */
    maxWidth: {
      type: Number,
      default () {
        return this.formMaxWidth
      }
    },
    /**
     * disable label click, hover etc. Creates fake hidden button which intercepts events
     */
    preventLabelEvents: Boolean
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
        return `width: ${this.labelWidth}px; min-width: ${this.labelWidth}px;`
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
    grid-template-rows: auto 1fr;
    margin-bottom: 10px;
  }

  .u-form-row__content {
    grid-area: content
  }

  .u-form-row__label {
    grid-area: label;
    color: hsl(var(--hs-text), var(--l-text-label));
    padding-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    align-self: center;
    display: flex;
    font-size: 14px;
  }

  .u-form-row__label > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .u-form-row__label.required:before {
    content: '*';
    color: hsl(var(--hs-danger), var(--l-state-default));
    margin: 0 2px;
    order: 1;
  }

  .u-form-row__label.readonly:before {
    content: "\f054";
    font-family: 'ub-icons';
    color: hsl(var(--hs-warning), var(--l-state-active));
    margin: 0 2px;
    font-size: 0.7em;
    order: 1;
  }

  .u-form-row__label[title]:after {
    content: ':';
  }

  .u-form-row__left {
    grid-template-columns: auto 1fr;
    grid-template-areas: 'label content' '... error';
  }

  .u-form-row__right {
    grid-template-columns: auto 1fr;
    grid-template-areas: 'content label' 'error ...';
  }

  .u-form-row__left .u-form-row__error,
  .u-form-row__right .u-form-row__error {
    text-align: left;
  }

  .u-form-row__right .u-form-row__label:after {
    content: '';
  }

  .u-form-row__error {
    grid-area: error;
    text-align: right;
    color: hsl(var(--hs-danger), var(--l-state-default));
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
  .u-form-row.is-error .ub-select-multiple__container,
  .u-form-row.is-error .u-file-container {
    border-color: hsl(var(--hs-danger), var(--l-input-border-default));
  }

  .u-form-row__top .u-form-row__label {
    padding-bottom: 4px;
  }

  .u-form-row__right .u-form-row__label {
    justify-content: flex-start;
    padding-left: 8px;
  }

  .u-form-row__description {
    font-size: 12px;
    margin-top: 5px;
    color: hsl(var(--hs-text), var(--l-text-description));
  }

  .u-form-row__ghost-button {
    position: absolute;
    visibility: hidden;
    height: 0;
    width: 0;
  }
</style>
