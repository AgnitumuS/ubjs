<template>
  <el-form :size="formSize">
    <tst-hello :whom="formSize ? formSize : 'default'"></tst-hello>
    <el-form-item>
      <el-input placeholder="Pavel"></el-input>
    </el-form-item>
    <el-form-item>
      <el-date-picker type="date"></el-date-picker>
    </el-form-item>
    <el-form-item>
      <el-date-picker
        type="daterange"
        range-separator="-"
        start-placeholder="Start date"
        end-placeholder="End date">
      </el-date-picker>
    </el-form-item>
  </el-form>
</template>

<script>
  const TstHello = require('../components/TstHello.vue')
  module.exports = {
    name: 'TstForm',
    components: {'tst-hello': TstHello},
    props: {
      formSize: {
        type: String,
        default: ''
      }
    },
    data: function () { return { }}
  }
</script>

<style>

</style>