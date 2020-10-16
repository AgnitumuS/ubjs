<template>
  <uba-user-form>
    <template #autofield_name="{value}">
      <u-form-row label="Name change">
        <el-input :value="value" />
      </u-form-row>
    </template>

    <template #customSlot="{name}">
      <h1>Hi, {{ name }}. How are you?</h1>
    </template>
  </uba-user-form>
</template>

<script>
const UbaUserForm = require('@unitybase/uba/public/forms/uba_user-fm.vue').default

export default {
  name: 'ChangedUserForm',

  components: {
    UbaUserForm
  }
}
</script>
