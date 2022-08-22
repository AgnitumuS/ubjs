## Usage

Depends on `kind` property can look like `check` or `switch`

```vue
<template>
  <div>
    State of checkbox: {{ state }}
    <u-checkbox v-model="state" label="UBAuthForgotPassword"/>
    <u-checkbox v-model="state" disabled label="UBAuthForgotPassword"/>
    <u-checkbox v-model="state" kind="switch" label="UBAuthForgotPassword"/>
    <u-checkbox v-model="state" kind="switch" disabled label="UBAuthForgotPassword"/>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        state: true
      };
    }
  };
</script>
```
