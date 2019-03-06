<template>
  <div>
    <h1>UbEntityEdit</h1>
    <el-card class="box-card" style="width: 1000px;">
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
        <div style="display: flex; justify-content: space-between;flex-wrap: wrap">
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
        <span class="input-story__prop required">value - Object *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px"
                    v-model="JSON.stringify(value, null, 2)"></el-input>
        </el-tooltip>
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
        <p style="margin: 0;color: rgba(98,20,17,0.78);font-size: 0.9em">used to act with tab (close on save, add handler on tab closing)</p>
        <el-input disabled style="width: 300px" v-model="currentTabId"></el-input>
      </li>
      <li>
        <span class="input-story__prop">externalData - Object</span>
        <p style="margin: 0;color: rgba(98,20,17,0.78);font-size: 0.9em">used to fill props by parent for new entities</p>
      </li>
      <li>
        <span class="input-story__prop">save - Function</span>
        <p style="margin: 0;color: rgba(98,20,17,0.78);font-size: 0.9em">function that calls before save and have a param with callback function</p>
        <span style="font-size: 0.9em;display: block">Example: </span>
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
    <h3 @click="goToToolbar" class="entity-edit-story__link">Check ToolBar component</h3>
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
    <h2>Description</h2>
    <div style="padding: 0 30px;">
      <p>This component helps in creating cards on VueJS.</p>
      <p style="margin-bottom: 0">While it mounted and value doesn't have properties then component loads data by instanceID (or create new entity if instanceID is empty) and set it to value.</p>
      <p style="font-size: 0.9em; color: rgba(98,20,17,0.78);margin-top: 0">value is required! you can set it by your own or send empty object like output parameter</p>
      <p>All logic with saving/removing implemented inside the component. If you want to add additional logic before saving (validation for example) then you can use save prop of component.
        Function that you send in this property will be executed while one of savings is emitted.
        It has callback property with parent save implementation, you should call it in case to save entity or write your own saving.</p>
    </div>
  </div>
</template>

<script>
import ubEntityEdit from '@unitybase/adminui-vue/components/UbEntityEditComponent.vue'
import UbInput from '@unitybase/adminui-vue/components/controls/UbInput.vue'
import UbSelectEntity from '@unitybase/adminui-vue/components/controls/UbSelectEntity.vue'
import { action } from '@storybook/addon-actions'
import { linkTo } from '@storybook/addon-links'

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
    goToToolbar: linkTo('Vue Components', 'ToolBar'),
    inputFn: action('Loaded entity'),
    save: action('It\'s save emitted')
  }
}
</script>

<style>
  .entity-edit-story__link {
    cursor: pointer;
    color: rgb(47, 103, 159);
    display: block;
    width: 250px;
  }
  .entity-edit-story__link:hover {
    color: rgb(43, 65, 117);
  }
</style>
