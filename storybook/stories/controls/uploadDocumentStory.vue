<template>
  <div>
    <h1>UbSelect</h1>
    <ub-upload-document
      v-model="value"
    ></ub-upload-document>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop required">value - String, Number *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input style="width: 300px" v-model="value"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop">eGroup - String</span>
        <el-input disabled style="width: 300px" v-model="eGroup"></el-input>
      </li>
      <li>
        <span class="input-story__prop">disabled - Boolean</span>
        <el-checkbox v-model="disabled"></el-checkbox>
      </li>
      <li>
        <span class="input-story__prop">primaryColumn - String (default - code)</span>
        <el-select style="width: 300px" v-model="primaryColumn">
          <el-option value="code"></el-option>
          <el-option value="name"></el-option>
        </el-select>
      </li>
    </ul>
  </div>
</template>

<script>
import UbUploadDocument from '@unitybase/adminui-vue/components/controls/UbUploadDocument.vue'

export default {
  components: {
    UbUploadDocument
  },
  data () {
    return {
      value: ''
    }
  }
}
</script>
