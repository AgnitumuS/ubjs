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
<style>
.splitpanes__pane {
  background-color: grey;
}
.splitpanes__splitter {
  background: white;
}
.splitpanes--horizontal > .splitpanes__splitter {
  height: 7px;
  border-top: 1px solid #eee;
  margin-top: -1px;
}
.splitpanes--vertical > .splitpanes__splitter {
  width: 7px;
  border-top: 1px solid #eee;
  margin-top: -1px;
}
</style>
