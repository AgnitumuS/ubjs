## Usage
See also `UInput` documentation for more examples.

For selecting files we recommend using a `UFileInput`, for dates - `UDatePicker` 

```vue
<template>
  <section>
    <u-grid row-gap="20px">
      <label> String <u-base-input v-model="strVal" /> </label>
      <label> Password
        <u-base-input type="password" v-model="strVal">
          <el-button icon="u-icon-eye" slot="append" />
        </u-base-input>
      </label>
      <label> Integer <u-base-input type="number" :precision="0" v-model="intVal" /> </label>
      <label> Currency <u-base-input type="number" :precision="2" :step="0.01" v-model="decVal" /> </label>
    </u-grid>
    <p>Browser-specific input types (can look different on different browsers): </p>
    <u-grid row-gap="20px">
      <label> Color <u-base-input type="color" v-model="other" /> </label>
      <label> Date <u-base-input type="date" v-model="other" /> </label>
      <label> Datetime <u-base-input type="datetime-local" v-model="other" /> </label>
      <label> Range <u-base-input type="range" min="100" max="1000" v-model="other" /> </label>
    </u-grid>
  </section>
</template>
<script>
  export default {
    data () {
      return {
        other: null,
        strVal: 'Hello',
        intVal: 10,
        decVal: 12.34
      }
    }
  }
</script>
```