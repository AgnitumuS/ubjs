<template>
  <div>
    <h1>UbSelect</h1>
    <ub-select-enum
      v-model="value"
      style="width:500px"
      :disabled="disabled"
      :e-group="eGroup"
      :primary-column="primaryColumn"
    ></ub-select-enum>
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
import UbSelectEnum from '@unitybase/adminui-vue/components/controls/UbSelectEnum.vue'

export default {
  components: {
    UbSelectEnum
  },
  data () {
    return {
      value: 'TST2',
      disabled: false,
      eGroup: 'TEST_GROUP_1',
      primaryColumn: 'code'
    }
  }
}
</script>
