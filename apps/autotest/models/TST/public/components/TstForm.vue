<script>
const TstHello = require('../components/TstHello.vue').default
module.exports.default = {
  name: 'TstForm',
  components: { TstHello },
  props: {
    formSize: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
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
    }
  }
}
module.exports.mount = function doMount() {
  console.log('test mount')
}
</script>

<template>
  <div>
    <el-form
      :size="formSize"
      :model="testModel"
      :rules="testRules"
      @submit.native.prevent
    >
      <el-form-item prop="uName">
        <el-input
          v-model="testModel.uName"
          placeholder="enter name"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="testModel.udate"
          type="date"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="testModel.dateRange"
          type="daterange"
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
