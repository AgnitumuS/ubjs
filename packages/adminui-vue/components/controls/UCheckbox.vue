<template>
  <span class="u-checkbox">
    <input
      :id="checkboxName"
      :checked="value"
      :class="['u-checkbox__input', 'u-checkbox__input--'+kind]"
      type="checkbox"
      v-bind="$attrs"
      :name="checkboxName"
      @input="$emit('input', $event.target.checked)"
    >
    <label
      class="u-checkbox__label"
      :class="{ 'u-checkbox__label--left': labelPosition === 'left' }"
      :for="checkboxName"
    >{{ $ut(label) }}</label>
  </span>
</template>

<script>
/**
 * Checkbox
 */
export default {
  name: 'UCheckbox',
  props: {
    /**
     * Name for checkbox. Default  - this._uid
     */
    name: {
      type: String,
      default: ''
    },
    /**
     * Text for checkbox label. Localized using i18n
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
    },
    /**
     * View style: either `check` or `switch`
     */
    kind: {
      type: String,
      default: 'check',
      validator (value) {
        return ['check', 'switch'].includes(value)
      }
    }
  },
  data () {
    return {
      checkboxName: this.name ? this.name : this._uid
    }
  }
}
</script>

<style>
/* https://itchief.ru/html-and-css/styling-checkbox-and-radio */
/* for element input with type="checkbox" */
.u-checkbox__input {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

/* for element label, relative with .u-checkbox__input */
.u-checkbox__label {
  display: flex;
  cursor: pointer;
  align-items: center;
  user-select: none;
}
.u-checkbox__label.u-checkbox__label--left {
  flex-direction: row-reverse;
}
.u-checkbox__label.u-checkbox__label--left::before {
  margin-left: var(--padding);
  margin-right: 0;
}

.u-checkbox__label::before {
  content: '';
  display: inline-block;
  width: var(--u-checkbox-dim);
  height: var(--u-checkbox-dim);
  flex-shrink: 0;
  flex-grow: 0;
  border: 1px solid hsl(var(--hs-border), var(--l-input-border-default));
  border-radius: var(--border-radius);
  margin-right: var(--padding);
}

.u-checkbox__input:disabled + .u-checkbox__label {
  cursor: not-allowed;
  color: hsl(var(--hs-text), var(--l-text-disabled));
}

/* focused */
.u-checkbox__input:focus + .u-checkbox__label::before {
  outline: 2px solid hsl(var(--hs-primary), var(--l-layout-border-default));
}

/* checked */
.u-checkbox__input:checked + .u-checkbox__label::before {
  border-color: hsl(var(--hs-primary), var(--l-state-default));
  background-color: hsl(var(--hs-primary), var(--l-state-default));
  color: white;
  font-family: ub-icons;
  font-size: 17px;
  text-align: center;
  content: "\f033"; /* u-icon-checked */
}

/* kind="switch" */
.u-checkbox__input--switch + .u-checkbox__label::before {
  color: white;
  width: 40px;
  background-color: hsl(var(--hs-control ), var(--l-state-hover));
  border-radius: 10px;
  background-repeat: no-repeat;
  background-position: left;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3ccircle cx='10' cy='10' r='9' fill='%23fff'/%3e%3c/svg%3e");
  transition: border-color .3s,background-color .3s,background-position .3s;
  content: "";
}

.u-checkbox__input--switch:checked + .u-checkbox__label::before {
  background-position: right;
  content: "";
}

/* styles for checkbox, when disabled */
.u-checkbox__input:disabled + .u-checkbox__label::before {
  background-color: hsl(var(--hs-primary), var(--l-state-disabled));
  border-color: hsl(var(--hs-primary), var(--l-state-disabled));
  cursor: not-allowed;
}
</style>
