<template>
  <div>
    {{ externalTitle }}
    <u-date-picker v-model="someDate" />

    <u-button
      slot="footer"
      @click="done({someDate,externalTitle: externalTitle + 123123312132})"
    >
      ok
    </u-button>
  </div>
</template>

<script>
export default {
  props: {
    externalTitle: String,
    done: Function
  },

  data () {
    return {
      someDate: null
    }
  }
}
</script>
