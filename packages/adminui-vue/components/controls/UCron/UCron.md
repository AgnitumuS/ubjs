## Usage

```vue
<template>
    <u-cron :value="cronExpression" />
</template>

<script>
  export default {
    data() {
      return {
        cronExpression: '* * * * * 1-4',
      };
    }
  };
</script>
```
