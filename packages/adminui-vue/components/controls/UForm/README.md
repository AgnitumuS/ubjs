### Basic usage
```vue
<template>
  <u-form :label-width="150">
    <u-form-row label="Name">
      <el-input v-model="name" />
    </u-form-row>

    <u-form-row label="Surname">
      <el-input v-model="surname" />
    </u-form-row>

    <u-form-row label="Age">
      <el-input-number v-model="age" />
    </u-form-row>

    <u-form-row
      label="Short"
      :label-width="90"
    >
      <el-checkbox v-model="checkbox" />
    </u-form-row>
  </u-form>
</template>

<script>
export default {
  data () {
    return {
      name: '',
      surname: '',
      age: null,
      checkbox: false
    }
  }
}
</script>
```