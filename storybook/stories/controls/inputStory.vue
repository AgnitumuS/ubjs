<template>
  <div>
    <h1>UbInput</h1>
    <ub-input style="width:50%" v-model="objectValue[attributeName]"
              :entityName="entityName"
              :disabled="disabled"
              :attributeName="attributeName"
              :objectValue="objectValue"></ub-input>
    <h2>Props</h2>
    <ul>
      <li>
        <span class="input-story__prop required">value - String, Number *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input style="width: 300px" v-model="objectValue[attributeName]"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop required">entityName - String *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-input :disabled="true" style="width: 300px" v-model="entityName"></el-input>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop required">attributeName - String *</span>
        <el-tooltip effect="light" content="Required" placement="right" :open-delay="100">
          <el-select style="width: 300px" v-model="attributeName">
            <el-option value="caption"></el-option>
            <el-option value="code"></el-option>
          </el-select>
        </el-tooltip>
      </li>
      <li>
        <span class="input-story__prop">disabled - Boolean</span>
        <el-checkbox v-model="disabled"></el-checkbox>
      </li>
      <li>
        <span class="input-story__prop">objectValue - Object (required for MultiLang fields, used to add localization property in object)</span>
        <el-input :disabled="true" type="textarea" :rows="6" style="width: 300px" v-model="objectValueJSON"></el-input>
      </li>
    </ul>
    <h2>Entity Schema</h2>
    <tree-view :data="entitySchema" :options="{maxDepth: 7}"></tree-view>
  </div>
</template>

<script>
  import UbInput from '@unitybase/adminui-vue/components/controls/UbInput.vue'

  export default {
    components: {
      UbInput
    },
    data () {
      return {
        attributeName: 'caption',
        entityName: 'tst_maindata',
        disabled: false,
        objectValue: {
          'caption': 'Caption text',
          'code': 'Code text',
          ID: 1
        }
      }
    },
    computed: {
      entitySchema () {
        return JSON.parse(JSON.stringify(this.$UB.connection.domain.get(this.entityName)))
      },
      objectValueJSON: {
        get () {
          return JSON.stringify(this.objectValue, null, 2)
        },
        set (value) {
          try {
            this.objectValue = JSON.parse(value)
          } catch (e) {
            console.log('INVALID JSON')
          }
        }
      }
    },
    methods: {
      refresh () {
        this.control = {...this.form}
      }
    }
  }
</script>

<style>
  .input-story__prop {
    display: block;
    margin: 8px 0;
  }

  span.required {
    font-weight: 500;
  }
</style>