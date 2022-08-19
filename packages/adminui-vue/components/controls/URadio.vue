<template>
  <span class="u-radio--wrap">
    <label
      v-for="(item, index) in items"
      :key="index"
      class="u-radio"
      :style="{ display: item[labelProp] ? '' : 'flex' }"
      @click="currentValue = item[idProp]"
    >
      <input
        v-model="currentValue"
        class="u-radio__input"
        type="radio"
        :name="name"
        :value="item[idProp]"
      >
      <span
        class="u-radio__label"
        :class="{ 'u-radio__label--left': labelPosition === 'left' }"
        :style="{ width: item[labelProp] ? '' : '26px' }"
      >{{ item[labelProp] }}</span>
      <!-- @slot name of slot - it is value `id` field from item -->
      <slot :name="item[idProp]" />
    </label>
  </span>
</template>

<script>
// TODO: need implement logic when some radio is disabled: cheched and not-checked

/**
 * Group of radio buttons with label
 */
export default {
  name: 'URadio',
  // for v-model
  model: {
    event: 'change'
  },
  props: {
    /**
     * Property name of element in items to be used as id.
     *
     * Component can`t validate property exists in all `items` objects (since prop validator do no have access to this),
     * so this is developer responsibility
     */
    idProp: {
      type: String,
      default: 'id'
    },
    /**
     * Property name of element in items to be used as label
     */
    labelProp: {
      type: String,
      default: 'label'
    },
    /**
     * Array of available options. Each item should be an object with at last 2 properties `id` and `label`
     */
    items: {
      type: Array,
      default: () => []
    },
    /**
     * Group name. MUST be defined to use more when one group of radio in page
     */
    name: {
      type: String,
      default: 'uradio'
    },
    /**
     * Selected item ID
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
    value (newValue) {
      this.currentValue = newValue
    },
    currentValue (e) {
      /**
       * Triggers when user change selected item
       *
       * @param value `id` value of selected item
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
  content: '';
  display: inline-block;
  width: var(--u-checkbox-dim);
  height: var(--u-checkbox-dim);
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
