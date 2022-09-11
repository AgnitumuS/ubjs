## Usage

Depends on `kind` property can look like `check` or `switch`. Default slot allows insert some content inside a checkbox label.

```vue
<template>
  <div style="line-height: 2em;">
    State of checkboxes are: {{ state1 }}, {{ state2 }} 
    <u-checkbox v-model="state1" label="UBAuthForgotPassword">
      Slot data <u-base-input />
    </u-checkbox>
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
