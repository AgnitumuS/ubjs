<template>
  <p class="hello">Hello, {{ whom }}!</p>
</template>

<script>
module.exports = {
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

<style>
.hello {
  font-size: 3em;
  text-align: center;
}
</style>