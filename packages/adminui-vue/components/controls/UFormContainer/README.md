This component is intended for:
 - set focus to the first available component on mount
 - set's a labels width
 - set's a labels position
 
### Basic usage

All labels will have 150 width instead last, the option `u-form-row` will override `u-form` label-width

```vue
<template>
  <u-form-container :label-width="150">
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
  </u-form-container>
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
