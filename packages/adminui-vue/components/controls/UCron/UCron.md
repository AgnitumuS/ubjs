## Usage

> cron expression `Interpretation` and `Estimated executions` fields works only in adminui

```vue
<template>
  <section>
    <u-cron :v-model="cronExpression" />
    <label> Cron expression is: <u-base-input v-model="cronExpression"/></label>
  </section>
</template>

<script>
  export default {
    data() {
      return {
        cronExpression: '1 1 1 * * *'
      }
    }
  }
</script>
```


 - UB specific section `occurrence` (disabled by default) turn on a non-standard 7-part cron expression syntax,
  where last field `@occurrence` mean - fires on every x occurrence.
 
  Below it turned on (not listen in hide-sections), and  `0 0 1 * * 1 @2` mean: 
   - At 01:00 AM, only on Monday, once per 2 occurrence (every second Monday)

```vue
<template>
  <u-cron
    :v-model="cronExpression"
    allow-periodical-week
    :hide-sections="['minutes', 'seconds', 'hours']"
  />
</template>

<script>
  export default {
    data() {
      return {
        cronExpression: '0 0 1 * * 1 @2'
      };
    }
  };
</script>
```
