### Usage

```vue
<template>
<div>
  <u-form-row
      required
      label-position="top"
      :error="showError"
      label="User name (required)"
  >
    <el-input v-model="userName"/>
  </u-form-row>

  <u-form-row
      readonly
      label-position="top"
      :error="showError"
      label="User name (read only)"
  >
    <el-input v-model="userName"/>
  </u-form-row>

  <u-form-row
    required
    label-position="left"
    :error="showError"
    label="User name"
  >
    <el-input v-model="userName"/>
  </u-form-row>

  <el-switch
    v-model="showError"
    active-text="Show error"
    inactive-text="Hide error">
  </el-switch>

</div>
</template>

<script>
export default {
  data () {
    return {
      showError: true,
      userName: 'Pablo'
    }
  }
}
</script>
```