<template>
  <Pane
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
  </Pane>
</template>

<script>
const { Pane } = require('splitpanes')

export default {
  name: 'UPane',
  components: { Pane }
}
</script>
