<script>
module.exports.default = {
  name: 'TstHello',
  props: {
    whom: {
      type: String,
      default: 'Unknown'
    }
  },
  data: function () {
    return { }
  }
}
</script>

<template>
  <p class="hello">
    Hello, {{ whom }}!
  </p>
</template>

<style>
.hello {
  font-size: 3em;
  text-align: center;
}
</style>
