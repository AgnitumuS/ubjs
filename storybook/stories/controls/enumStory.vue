<template>
  <div>
    <h1>UbSelect</h1>
    <ub-select-enum
      v-model="value"
      style="width:50%"
      :disabled="disabled"
      :e-group="eGroup"
      :primary-column="primaryColumn"
    ></ub-select-enum>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop required">value - String *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input style="width: 300px" v-model="value"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop">eGroup - String</span>
        <el-input style="width: 300px" v-model="eGroup"></el-input>
      </li>
      <li>
        <span class="input-story__prop">disabled - Boolean</span>
        <el-checkbox v-model="disabled"></el-checkbox>
      </li>
      <li>
        <span class="input-story__prop">primaryColumn - String (default - code)</span>
        <el-input style="width: 300px" v-model="primaryColumn"></el-input>
      </li>
    </ul>
    <h2>Entity Schema</h2>
    <tree-view :data="entitySchema" :options="{maxDepth: 7}"></tree-view>
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
      value: '1',
      disabled: false,
      eGroup: '',
      primaryColumn: null
    }
  }
}
</script>
