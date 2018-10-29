<template>
  <div>
    <el-form :size="formSize"  @submit.native.prevent :model="testModel" :rules="testRules">
      <el-form-item prop="uName">
        <el-input placeholder="enter name" v-model="testModel.uName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-date-picker type="date" v-model="testModel.udate"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          type="daterange"
          v-model="testModel.dateRange"
          range-separator="-"
          start-placeholder="Start date"
          end-placeholder="End date">
        </el-date-picker>
      </el-form-item>
      <p> Model data: {{JSON.stringify(testModel)}}</p>
    </el-form>
    <el-form :size="formSize" :model="otherTest">
      <tst-hello :whom="helloTo"></tst-hello>
      <p>Form size: {{formSize}}</p>
      <span>Other data binding == {{otherTest.a}}</span>
      <el-form-item>
        <el-input v-model="otherTest.a"></el-input>
      </el-form-item>
    </el-form>
  </div>
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
    data: function () { return {
      helloTo: 'UnityBase vue',
      testModel: {
        uName: '',
        udate: null,
        dateRange: [null, null]
      },
      otherTest: {
        a: 1, b: 2
      },
      testRules: {
        uName: [
          { required: true, message: 'Please input user name', trigger: 'blur' },
          { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
        ]
      }
    }}
  }
</script>

<style>

</style>