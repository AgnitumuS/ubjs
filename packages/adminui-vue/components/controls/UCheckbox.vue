<template>
  <span class="u-checkbox">
    <input
      :id="checkboxName"
      v-model="currentValue"
      class="u-checkbox--input"
      type="checkbox"
      v-bind="$attrs"
      :name="checkboxName"
    >
    <label
      class="u-checkbox__label"
      :class="{ 'u-checkbox__label--left': labelPosition === 'left' }"
      :for="checkboxName"
    >{{ label }}</label>
  </span>
</template>

<script>
/**
 * Checkbox
 */
export default {
  name: 'UCheckbox',
  // for v-model
  model: {
    event: 'change'
  },
  props: {
    /**
     * Name for checkbox. Default  - this._uid
     */
    name: {
      type: String,
      default: ''
    },
    /**
     * Text for checkbox label
     */
    label: {
      type: String,
      default: ''
    },
    value: {
      type: Boolean,
      default: false
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
      currentValue: this.value,
      checkboxName: this.name ? this.name : this._uid
    }
  },
  watch: {
    value (newValue) {
      this.currentValue = newValue
    },
    currentValue (e) {
      /**
       * Triggers when the user change state of checkbox
       *
       * @param {boolean}
       */
      this.$emit('change', e)
    }
  }
}
</script>

<style>
.u-checkbox {
  display: block;
  width: min-content;
}
/* https://itchief.ru/html-and-css/styling-checkbox-and-radio */
/* for element input with type="checkbox" */
.u-checkbox--input {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

/* for element label, relative with .u-checkbox--input */
.u-checkbox--input + .u-checkbox__label {
  display: flex;
  cursor: pointer;
  align-items: center;
  user-select: none;
}
.u-checkbox--input + .u-checkbox__label.u-checkbox__label--left {
  flex-direction: row-reverse;
}
.u-checkbox--input + .u-checkbox__label.u-checkbox__label--left::before {
  margin-left: var(--padding);
  margin-right: 0;
}

.u-checkbox--input + .u-checkbox__label::before {
  content: '';
  display: inline-block;
  width: var(--u-checkbox-dim);
  height: var(--u-checkbox-dim);
  flex-shrink: 0;
  flex-grow: 0;
  border: 1px solid #adb5bd;
  border-radius: var(--border-radius);
  margin-right: var(--padding);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 90% 60%;
}

/* styles for hover */
.u-checkbox--input:not(:disabled):not(:checked)
  + .u-checkbox__label:hover::before {
  border-color: #b3d7ff;
}
.u-checkbox--input:disabled + .u-checkbox__label {
  cursor: not-allowed;
  color: hsl(var(--hs-text), var(--l-text-disabled));
}

/* styles for active checkbox (when push to him) */
.u-checkbox--input:not(:disabled):active + .u-checkbox__label::before {
  background-color: #b3d7ff;
  border-color: #b3d7ff;
}
.u-checkbox--input:disabled:not(:checked) + .u-checkbox__label::before {
  background-color: hsl(var(--hs-control), var(--l-state-disabled));
  border-color: hsl(var(--hs-control), var(--l-state-disabled));
}

/* styles for checkbox, in the focus */
.u-checkbox--input:focus + .u-checkbox__label::before {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* styles for checkbox, in focus and not checked */
.u-checkbox--input:focus:not(:checked) + .u-checkbox__label::before {
  border-color: #80bdff;
}

/* styles for checkbox, when checked */
.u-checkbox--input:checked + .u-checkbox__label::before {
  border-color: hsl(var(--hs-primary), var(--l-state-default));
  background-color: hsl(var(--hs-primary), var(--l-state-default));
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMy45NjYgNi40ODQgMS43NDIgNC4yNThhLjYyNS42MjUgMCAwIDAtLjg5IDAgLjYyNi42MjYgMCAwIDAgMCAuODlsMi42NjMgMi42NjZhLjYzMi42MzIgMCAwIDAgLjg5NiAwbDYuNzM2LTYuNzM3YS42MjYuNjI2IDAgMCAwIDAtLjg5MS42MjQuNjI0IDAgMCAwLS44OSAwbC02LjI5IDYuMjk4eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==');
  /* background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3e%3c/svg%3e"); */
}

/* styles for checkbox, when disabled */
.u-checkbox--input:disabled + .u-checkbox__label::before {
  background-color: hsl(var(--hs-primary), var(--l-state-disabled));
  border-color: hsl(var(--hs-primary), var(--l-state-disabled));
}
</style>
