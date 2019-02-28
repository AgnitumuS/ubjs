<template>
  <div>
    <h1>UbSelect</h1>
    <ub-select-many
      v-model="value"
      style="width:500px"
      :disabled="disabled"
      :entityName="entityName"
    ></ub-select-many>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop required">value - String, Number *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input style="width: 300px" v-model="value"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop required">entityName - String *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input :disabled="true" style="width: 300px" v-model="entityName"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop">disabled - Boolean</span>
        <el-checkbox v-model="disabled"></el-checkbox>
      </li>
    </ul>
    <h2>Entity Schema</h2>
    <tree-view :data="entitySchema" :options="{maxDepth: 7}"></tree-view>
  </div>
</template>

<script>
import UbSelectMany from '@unitybase/adminui-vue/components/controls/UbSelectMany.vue'

export default {
  components: { UbSelectMany },
  data () {
    return {
      entityName: 'tst_dictionary',
      value: '1,2',
      disabled: false
    }
  },
  computed: {
    entitySchema () {
      return JSON.parse(JSON.stringify(this.$UB.connection.domain.get(this.entityName)))
    }
  }
}
</script>
