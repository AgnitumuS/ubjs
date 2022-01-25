// TODO: need implement logic when some radio is disabled: cheched and
not-checked
<template>
  <span class="u-radio--wrap">
    <label
      v-for="(item, index) in items"
      :key="index"
      class="u-radio"
      :style="{ display: item.label ? '' : 'flex' }"
      @click="currentValue = item.id"
    >
      <input
        v-model="currentValue"
        class="u-radio__input"
        type="radio"
        :name="name"
        :value="item.id"
      >
      <span
        class="u-radio__label"
        :class="{ 'u-radio__label--left': labelPosition === 'left' }"
        :style="{ width: item.label ? '' : '26px' }"
      >{{ item.label }}</span>
      <!-- @slot name of slot - it is value `id` field from item -->
      <slot :name="item.id" />
    </label>
  </span>
</template>

<script>
export default {
  name: 'URadio',
  // for v-model
  model: {
    event: 'change'
  },
  props: {
    /**
     * Item of array should be have `id` field
     */
    items: {
      type: Array,
      default: () => [],
      validator (value) {
        if (!value.length) return true
        return !value.some((item) => item.id === undefined)
      }
    },
    /**
     * Name for grops of radio. It is very important props when you will use two or more groups of radio in page
     */
    name: {
      type: String,
      default: 'defaultName'
    },
    /**
     * Value should be equal one of field `id` from `items`
     */
    value: {
      type: [String, Boolean, Number],
      default: ''
    },
    /**
     * Label position. Default  - right
     */
    labelPosition: {
      type: String,
      default: '',
      validator (value) {
        return ['left', ''].includes(value)
      }
    }
  },
  data () {
    return {
      currentValue: this.value ? this.value : '',
      radioName: this.name ? this.name : this._uid
    }
  },
  watch: {
    currentValue (e) {
      /**
       * Triggers when the user change state of radio
       *
       * @param value `id` field from choiced item
       */
      this.$emit('change', e)
    }
  }
}
</script>

<style>
.u-radio--wrap {
  display: flex;
  flex-direction: column;
  width: min-content;
}
/* for element input with type="radio" */
.u-radio__input {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

/* for element label relative with .u-radio */
.u-radio__label {
  display: flex;
  align-items: center;
  user-select: none;
  white-space: nowrap;
  margin-bottom: var(--padding);
}
.u-radio__label.u-radio__label--left {
  flex-direction: row-reverse;
}
.u-radio__label.u-radio__label--left::before {
  margin-right: 0;
  margin-left: var(--padding);
}

.u-radio__label::before {
  --sizeRadio: 16px;
  content: '';
  display: inline-block;
  width: var(--sizeRadio);
  height: var(--sizeRadio);
  flex-shrink: 0;
  flex-grow: 0;
  border: 1px solid #adb5bd;
  border-radius: 50%;
  margin-right: var(--padding);
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50% 50%;
  cursor: pointer;
}

/* styles for hover*/
.u-radio__input:not(:disabled):not(:checked) + .u-radio__label:hover::before {
  border-color: #b3d7ff;
}

/* styles for active radio-btn (when push) */
.u-radio__input:not(:disabled):active + .u-radio__label::before {
  background-color: #b3d7ff;
  border-color: #b3d7ff;
}

/* styles for radio-btn, in focus */
.u-radio__input:focus + .u-radio__label::before {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* styles for radio-btn,  in focus and not checked */
.u-radio__input:focus:not(:checked) + .u-radio__label::before {
  border-color: #80bdff;
}

/* styles for radio-btn, in the checked */
.u-radio__input:checked + .u-radio__label::before {
  border-color: hsl(var(--hs-primary), var(--l-state-default));
  background-color: hsl(var(--hs-primary), var(--l-state-default));
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}

/* styles for radio-btn, in the disabled */
.u-radio__input:disabled + .u-radio__label::before {
  background-color: hsl(var(--hs-primary), var(--l-state-disabled));
  border-color: hsl(var(--hs-primary), var(--l-state-disabled));
  cursor: not-allowed;
}
</style>
