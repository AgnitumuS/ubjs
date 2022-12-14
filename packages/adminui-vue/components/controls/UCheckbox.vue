<template>
  <span class="u-checkbox">
    <input
      :id="_uid"
      :checked="value"
      :class="['u-checkbox__input', 'u-checkbox__input--'+kind]"
      type="checkbox"
      v-bind="$attrs"
      @input="$emit('change', $event.target.checked)"
    >
    <label
      class="u-checkbox__label"
      :class="{ 'u-checkbox__label--left': labelPosition === 'left' }"
      :for="_uid"
      v-on="$listeners"
    >{{ $ut(label) }}
      <!-- @slot Default slot is inside label, just after input -->
      <slot />
    </label>
  </span>
</template>

<script>
/**
 * Checkbox
 */
export default {
  name: 'UCheckbox',
  // for v-model. see https://v2.vuejs.org/v2/guide/components-custom-events.html#Customizing-Component-v-model
  model: {
    event: 'change'
  },
  props: {
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
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath d='M 16.727 4.18 L 16.728 4.179 C 16.797 4.106 17.307 3.89 17.745 4.183 C 17.745 4.183 18.132 4.56 17.946 5.094 C 17.76 5.628 7.911 15.725 7.911 15.725 L 7.91 15.727 C 7.652 15.958 7.46 15.966 7.382 15.966 C 7.288 15.966 7.106 15.945 6.884 15.727 L 2.103 10.642 C 2.031 10.569 1.877 10.067 2.211 9.734 C 2.545 9.401 3.152 9.529 3.282 9.667 L 7.397 14.01 L 16.727 4.18 Z' fill='%23fff'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: center;
  content: "";
}

/* kind="switch" */
.u-checkbox__input--switch + .u-checkbox__label::before {
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
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3ccircle cx='10' cy='10' r='9' fill='%23fff'/%3e%3c/svg%3e");
  content: "";
}

/* styles for checkbox, when disabled */
.u-checkbox__input:disabled + .u-checkbox__label::before {
  background-color: hsl(var(--hs-primary), var(--l-state-disabled));
  border-color: hsl(var(--hs-primary), var(--l-state-disabled));
  cursor: not-allowed;
}
</style>
