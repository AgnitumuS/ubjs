## Usage

```vue
<template>
  <div>
    State of checkbox: {{ state }}
    <u-checkbox v-model="state" label="Example checkbox"/>
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
