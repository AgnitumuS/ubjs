<template>
  <span class="u-radio--wrap">
    <label class="u-radio" v-for="(item, index) in items" :key="index">
      <input
        class="u-radio__input"
        type="radio"
        :name="name"
        :value="item.id"
        v-model="currentValue"
      />
      <span
        class="u-radio__label"
        :class="{ 'u-radio__label--left': labelPosition === 'left' }"
        >{{ item.label }}</span
      >
    </label>
  </span>
</template>


<script>
export default {
  name: "URadio",
  // for v-model
  model: {
    event: "change",
  },
  props: {
    items: {
      type: Array,
      default: () => [],
      validator(items){
        const check = items.length > 1
        if (!check) console.error('The count of elements must be greater than 1')
        return check
      }
    },
    name: {
      type: String,
      default: "defaultName",
    },
    value: {
      type: [String, Boolean, Number],
    },
    labelPosition: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentValue: this.value ? this.value : "",
      radioName: this.name ? this.name : this._uid,
    };
  },
  watch: {
    currentValue(e) {
      this.$emit("change", e);
    },
  },
};
</script>

<style>
.u-radio--wrap {
  display: flex;
  flex-direction: column;
  width: min-content;
}
/* для элемента input c type="radio" */
.u-radio__input {
  position: absolute;
  z-index: -1;
  opacity: 0;
}

/* для элемента label связанного с .u-radio */
.u-radio__label {
  display: flex;
  align-items: center;
  user-select: none;
  white-space: nowrap;
  margin-bottom: 8px;
  cursor: pointer;
}
.u-radio__label.u-radio__label--left {
  flex-direction: row-reverse;
}
.u-radio__label.u-radio__label--left::before {
  margin-right: 0;
  margin-left: 0.7em;
}

/* создание в label псевдоэлемента  before со следующими стилями */
.u-radio__label::before {
  content: "";
  display: inline-block;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  flex-grow: 0;
  border: 1px solid #adb5bd;
  border-radius: 50%;
  margin-right: 0.7em;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 50% 50%;
}

/* стили при наведении курсора на радио */
.u-radio__input:not(:disabled):not(:checked) + .u-radio__label:hover::before {
  border-color: #b3d7ff;
}

/* стили для активной радиокнопки (при нажатии на неё) */
.u-radio__input:not(:disabled):active + .u-radio__label::before {
  background-color: #b3d7ff;
  border-color: #b3d7ff;
}

/* стили для радиокнопки, находящейся в фокусе */
.u-radio__input:focus + .u-radio__label::before {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* стили для радиокнопки, находящейся в фокусе и не находящейся в состоянии checked */
.u-radio__input:focus:not(:checked) + .u-radio__label::before {
  border-color: #80bdff;
}

/* стили для радиокнопки, находящейся в состоянии checked */
.u-radio__input:checked + .u-radio__label::before {
  border-color: #0b76ef;
  background-color: #0b76ef;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
}

/* стили для радиокнопки, находящейся в состоянии disabled */
.u-radio__input:disabled + .u-radio__label::before {
  background-color: #e9ecef;
}
</style>