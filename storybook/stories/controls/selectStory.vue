<template>
  <div>
    <h1>UbSelect</h1>
    <ub-select-entity
      v-model="value"
      style="width:50%"
      :entity-name="entityName"
      :use-own-actions="useOwnActions"
      :actions="actions"
      :disabled="disabled"
    ></ub-select-entity>
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
      <li>
        <span class="input-story__prop">useOwnActions - Boolean</span>
        <el-checkbox v-model="useOwnActions"></el-checkbox>
      </li>
      <li>
        <span class="input-story__prop">actions - Array</span>
        <el-input type="textarea" :rows="6" style="width: 300px" v-model="JSON.stringify(actions, null, 2)"></el-input>
      </li>
    </ul>
    <h2>Entity Schema</h2>
    <tree-view :data="entitySchema" :options="{maxDepth: 7}"></tree-view>
  </div>
</template>

<script>
import UbSelectEntity from '@unitybase/adminui-vue/components/controls/UbSelectEntity.vue'

export default {
  components: {
    UbSelectEntity
  },
  computed: {
    entitySchema () {
      return JSON.parse(JSON.stringify(this.$UB.connection.domain.get(this.entityName)))
    }
  },
  data () {
    return {
      entityName: 'tst_dictionary',
      value: 1,
      disabled: false,
      useOwnActions: false,
      actions: [{
        name: 'Edit',
        caption: this.$ut('editSelItem'),
        icon: 'fa fa-pencil-square-o',
        enabled: !!this.resultData,
        handler: {
          fn () {
            this.$UB.core.UBApp.doCommand({
              cmdType: this.$UB.core.UBCommand.commandType.showForm,
              entity: this.entityName,
              isModal: true,
              instanceID: this.resultData
            })
          }
        }
      }]
    }
  }
}
</script>
