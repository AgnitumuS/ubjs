<template>
  <div class="u-form-layout">
    <u-toolbar>
      <u-button
        slot="append"
        appearance="inverse"
      >
        ActionChangePasswordID
      </u-button>
    </u-toolbar>
    <u-form-container>
      <u-auto-field attribute-name="firstName" />
      <u-auto-field attribute-name="name" />
      <u-auto-field attribute-name="lastName" />
      <u-auto-field attribute-name="fullName" />
      <u-auto-field attribute-name="gender" />
      <u-auto-field attribute-name="email" />
      <u-auto-field attribute-name="phone" />
      <hr>
      <u-auto-field attribute-name="description" />
      <u-auto-field attribute-name="disabled" />
      <u-auto-field attribute-name="isPending" />
      <u-auto-field attribute-name="trustedIP" />
      <u-auto-field attribute-name="uData" />
      <u-auto-field attribute-name="avatar" />
    </u-form-container>
  </div>
</template>

<script>
export default {
  name: 'UserFormRoot'
}
</script>
