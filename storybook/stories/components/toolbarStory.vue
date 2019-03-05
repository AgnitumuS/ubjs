<template>
  <div>
    <h1>UbToolbar</h1>
    <el-card class="box-card">
      <toolbar v-model="value.ID"
               :entity-name="entityName"
               :is-new="isNew"
               :is-changed="isChanged"
               :simple-audit="{mi_createDate: value.mi_createDate, mi_modifyDate: value.mi_modifyDate}"
               :use-only-own-actions="useOnlyOwnActions"
               :input-actions="inputActions"
               :input-buttons="inputButtons"
               :form-code="formCode"
               @saveAndClose="saveAndClose"
               @saveAndReload="saveAndReload"
               @remove="remove"
      ></toolbar>
      <div v-for="i in 5" :key="i" style="width: 250px;display: inline-block;padding: 20px">
        <div v-for="j in 8" :key="j">Some Data</div>
      </div>
    </el-card>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop required">value - String, Number *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input style="width: 300px" v-model="value.ID"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop required">entityName - String *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input :disabled="true" style="width: 300px" v-model="entityName"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop">simpleAudit - Object (object with dates for entities with mStorage.simpleAudit == true)</span>
        <span style="width: 120px;display: inline-block;font-size: 0.9em">mi_createDate:</span><el-date-picker type="datetime" v-model="value.mi_createDate"></el-date-picker><br>
        <span style="width: 120px;display: inline-block;font-size: 0.9em">mi_modifyDate:</span><el-date-picker type="datetime" v-model="value.mi_modifyDate"></el-date-picker>
      </li>
      <li>
        <span class="input-story__prop">formCode - String</span>
        <el-input style="width: 300px" v-model="formCode"></el-input>
      </li>
      <li>
        <span class="input-story__prop">isNew - Boolean</span>
        <el-checkbox v-model="isNew"></el-checkbox>
      </li>
      <li>
        <span class="input-story__prop">isChanged - Boolean</span>
        <el-checkbox v-model="isChanged"></el-checkbox>
      </li>
      <li>
        <span class="input-story__prop">useOnlyOwnActions - Boolean</span>
        <el-checkbox v-model="useOnlyOwnActions"></el-checkbox>
      </li>
      <li>
        <span class="input-story__prop">inputActions - Array of objects</span>
        <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px" v-model="JSON.stringify(inputActions, null, 2)"></el-input>
        <el-button @click="addAction">Add Action</el-button>
        <el-button @click="clearActions">Clear</el-button>
      </li>
      <li>
        <span class="input-story__prop">inputButtons - Array of objects</span>
        <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px" v-model="JSON.stringify(inputButtons, null, 2)"></el-input>
        <el-button @click="addButton">Add Button</el-button>
        <el-button @click="clearButtons">Clear</el-button>
      </li>
    </ul>
  </div>
</template>

<script>
import toolbar from '@unitybase/adminui-vue/components/UbToolbarComponent.vue'
import { action } from '@storybook/addon-actions'

export default {
  components: {
    toolbar
  },
  data () {
    return {
      value: {
        ID: 1,
        mi_createDate: new Date(),
        mi_modifyDate: new Date()
      },
      isNew: false,
      entityName: 'tst_maindata',
      isChanged: false,
      useOnlyOwnActions: false,
      inputActions: [],
      inputButtons: [],
      formCode: null
    }
  },
  methods: {
    addAction () {
      let id = this.inputActions.length
      this.inputActions.push({
        icon: 'fa fa-thermometer-half',
        caption: id + ' action',
        handler: {
          fn: action(`${id} action click`)
        },
        enabled: id % 2 === 0
      })
    },
    addButton () {
      let id = this.inputButtons.length
      this.inputButtons.push({
        id: id,
        disabled: id % 2 === 1,
        icon: 'fa fa-microchip',
        action: action(`${id} button click`),
        tooltip: id + ' button'
      })
    },
    clearActions () {
      this.inputActions = []
    },
    clearButtons () {
      this.inputButtons = []
    },
    saveAndClose: action('It\'s save and close emitted'),
    saveAndReload: action('It\'s save and reload emitted'),
    remove: action('It\'s remove emitted')
  }
}
</script>
