This component provides a following properties to the child U-controls:
- a labels width
- a labels position
- isDisabled

Also sets focus to the first available component on mount.

In example below with of all labels sets to 150, label width for "Age" is redefined to `90px`,
label position of "Short" sets to `top`.

```vue
<template>
  <u-form-container :label-width="150" label-position="left">
    <u-form-row label="Name">
      <el-input v-model="name" />
    </u-form-row>

    <u-form-row label="Surname">
      <el-input v-model="surname" />
    </u-form-row>

    <u-form-row label="Age" :label-width="90">
      <el-input-number v-model="age" />
    </u-form-row>

    <u-form-row label="Short" label-position="top">
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