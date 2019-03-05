<template>
  <div>
    <h1>UbSelectEntity</h1>
    <ub-select-entity
      v-model="value"
      style="width:500px"
      :entity-name="entityName"
      :use-own-actions="useOwnActions"
      :actions="actions"
      :disabled="disabled"
      @input="inputFn"
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
        <div style="display: flex;">
          <div style="width: 500px; display: inline-block">
            <span class="input-story__prop">actions - Array of Objects</span>
            <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px"
                      v-model="JSON.stringify(actions, null, 2)"></el-input>
            <br><br>
            <el-button type="primary" icon="el-icon-close" @click="actions=[]">Clear user actions</el-button>
          </div>
          <div style="width: 500px; display: inline-block">
            <h4>New Action</h4>
            <span class="select-story__action-param">caption</span>
            <el-input style="width: 300px" v-model="newAction.caption"></el-input>
            <span class="select-story__action-param">icon</span>
            <el-input style="width: 300px" v-model="newAction.icon"></el-input>
            <span class="select-story__action-param">enabled</span>
            <el-checkbox v-model="newAction.enabled"></el-checkbox>
            <br><br>
            <el-button type="success" icon="el-icon-plus" @click="addAction">Add</el-button>
          </div>
        </div>
      </li>
    </ul>
    <h2>Entity Schema</h2>
    <tree-view :data="entitySchema" :options="{maxDepth: 7}"></tree-view>
  </div>
</template>

<script>
import UbSelectEntity from '@unitybase/adminui-vue/components/controls/UbSelectEntity.vue'
import { action } from '@storybook/addon-actions'

export default {
  components: {
    UbSelectEntity
  },
  data () {
    return {
      entityName: 'tst_dictionary',
      value: 1,
      disabled: false,
      useOwnActions: false,
      actions: [],
      newAction: {
        caption: 'Test',
        icon: 'fa fa-ban',
        enabled: true,
        handler: {
          fn: action(`action clicked`)
        }
      }
    }
  },
  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName).asPlainJSON(false)
    }
  },
  methods: {
    inputFn: action('Entered value'),
    addAction () {
      let action = { ...this.newAction }
      this.actions.push(action)
      this.newAction.caption = ''
      this.newAction.icon = ''
      this.newAction.enabled = true
    }
  }
}
</script>

<style>
  .select-story__action-param {
    width: 100px;
    display: inline-block;
    margin-top: 10px;
  }
</style>
