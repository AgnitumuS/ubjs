### Error

```vue
<template>
<div>
  <u-form-row
      required
      label-position="top"
      :error="showError"
      label="User name"
  >
    <el-input/>
  </u-form-row>

  <u-form-row
    required
    label-position="left"
    :error="showError"
    label="User name"
  >
    <el-input/>
  </u-form-row>

  <u-button-group appearance="plain">
    <u-button @click="showError = true">
      Show error
    </u-button>
    <u-button appearance="default" @click="showError = false">
      Hide error
    </u-button>
  </u-button-group>
</div>
</template>

<script>
export default {
  data () {
    return {
      showError: true
    }
  }
}
</script>
```