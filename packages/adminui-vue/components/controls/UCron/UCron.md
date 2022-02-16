## Usage

```vue
<template>
  <div>  
    <u-cron :value="cronExpression" />
    <div> *Note: cron expression interpretation available only in adminui</div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        cronExpression: '1 1 1 * * *',
      };
    }
  };
</script>
```
