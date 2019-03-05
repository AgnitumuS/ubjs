<template>
  <div>
    <h1>UbEntityEdit</h1>
    <el-card class="box-card">
      <ub-entity-edit v-model="value"
                      :entity-name="entityName"
                      :instanceID="instanceID"
                      :input-buttons="inputButtons"
                      :input-actions="inputActions"
                      :use-only-own-actions="useOnlyOwnActions"
                      :save="save"
                      :current-tab-id="currentTabId"
                      :external-data="externalData"
                      :form-code="formCode"
                      @input="inputFn">
        <div style="display: flex; justify-content: space-evenly">
          <ub-input v-model="value.caption" :entityName="entityName" attributeName="caption" :objectValue="value"
                    style="min-width: 300px"></ub-input>
          <ub-input v-model="value.code" :entityName="entityName" attributeName="code" :objectValue="value"
                    style="min-width: 300px"></ub-input>
          <ub-select-entity
            v-model="value.nullDict_ID"
            style="min-width: 300px"
            entity-name="tst_dictionary"
          ></ub-select-entity>
        </div>
      </ub-entity-edit>
    </el-card>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop">value - Object</span>
        <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px"
                  v-model="JSON.stringify(value, null, 2)"></el-input>
      </li>
      <li>
        <span class="input-story__prop">instanceID - Number</span>
        <el-input style="width: 300px" v-model="instanceID"></el-input>
      </li>
      <li>
        <span class="input-story__prop required">entityName - String *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input :disabled="true" style="width: 300px" v-model="entityName"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop">currentTabId - String</span>
        <span style="font-size: 0.9em;margin-bottom: 5px;display: block">used to act with tab (close on save, add handler on tab closing)</span>
        <el-input disabled style="width: 300px" v-model="currentTabId"></el-input>
      </li>
      <li>
        <span class="input-story__prop">externalData - Object</span>
        <span style="font-size: 0.9em;margin-bottom: 5px;display: block">used to fill props by parent for new entities</span>
      </li>
      <li>
        <span class="input-story__prop">save - Function</span>
        <span style="font-size: 0.9em;margin-bottom: 5px;display: block">function that calls before save and have a param with callback function (to add validation on fields)</span>
        <span style="font-size: 0.9em;margin-bottom: 5px;display: block">Example: </span>
        <pre><code>save (callback) {
    this.$refs[this.$options.name].validate((valid) => {
      if (valid) {
        callback()
      }
    })
  }
        </code></pre>
      </li>
    </ul>
    <h2>Props for toolbar</h2>
    <h3>Check on ToolBar component</h3>
    <ul>
      <li>
        <span class="input-story__prop">formCode - String</span>
      </li>
      <li>
        <span class="input-story__prop">useOnlyOwnActions - Boolean</span>
      </li>
      <li>
        <span class="input-story__prop">inputActions - Array of objects</span>
      </li>
      <li>
        <span class="input-story__prop">inputButtons - Array of objects</span>
      </li>
    </ul>
  </div>
</template>

<script>
import ubEntityEdit from '@unitybase/adminui-vue/components/UbEntityEditComponent.vue'
import UbInput from '@unitybase/adminui-vue/components/controls/UbInput.vue'
import UbSelectEntity from '@unitybase/adminui-vue/components/controls/UbSelectEntity.vue'
import { action } from '@storybook/addon-actions'

export default {
  components: {
    ubEntityEdit,
    UbInput,
    UbSelectEntity
  },
  data () {
    return {
      value: {},
      instanceID: 1,
      currentTabId: '1',
      externalData: null,
      entityName: 'tst_maindata',
      useOnlyOwnActions: false,
      inputActions: [],
      inputButtons: [],
      formCode: null
    }
  },
  methods: {
    inputFn: action('Entered entity'),
    save: action('It\'s save emitted')
  }
}
</script>
