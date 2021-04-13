### Usage

An CSS class `u-form-row__description` can be used to add a "description"

```vue
<template>
<div>
  <p>Required (asterisk symbol)</p>
  <u-form-row
      required
      label-position="top"
      :error="showError"
      label="User name (required)"
  >
    <u-base-input v-model="userName"/>
  </u-form-row>

  <p>Readonly (non-editable + lock symbol)</p>
  <u-form-row
      readonly
      label-position="top"
      :error="showError"
      label="User name (read only)"
  >
    <u-base-input v-model="userName"/>
  </u-form-row>

  <p>Required + left label positioning</p>
  <u-form-row
    required
    label-position="left"
    :error="showError"
    label="User name"
  >
    <u-base-input v-model="userName"/>
  </u-form-row>

  <p>With a description</p>
  <u-form-row
    label-position="top"
    label="User name (description added)"
  >
    <u-input v-model="userName"/>
    <div class="u-form-row__description">
      name of user who responsible to handle a request
    </div>
  </u-form-row>

  <p>Left / right label position</p>
  <u-grid>
    <u-form-row
      label-position="left"
      label="Label on left"
    >
      <u-base-input v-model="userName"/>
    </u-form-row>

    <u-form-row
      label-position="right"
      label="label on right"
    >
      <u-base-input v-model="userName"/>
    </u-form-row>
  </u-grid>
  
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