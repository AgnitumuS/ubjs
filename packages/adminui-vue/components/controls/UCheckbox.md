## Usage

Depends on `kind` property can look like `check` or `switch`

```vue
<template>
  <div>
    State of checkbox: {{ state }}
    <u-checkbox v-model="state1" label="UBAuthForgotPassword"/>
    <u-checkbox v-model="state1" disabled label="UBAuthForgotPassword"/>
    <u-checkbox v-model="state2" kind="switch" label="UBAuthForgotPassword"/>
    <u-checkbox v-model="state2" kind="switch" disabled label="UBAuthForgotPassword"/>
    <u-checkbox v-model="state2" kind="switch" label-position="left" label="UBAuthForgotPassword"/>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        state1: true,
        state2: false
      };
    }
  };
</script>
```
