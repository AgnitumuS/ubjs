<template>
  <div>
    <h1>UInput</h1>
    <u-input v-model="objectValue[attributeName]"
              style="width:500px"
              :entity-name="entityName"
              :disabled="disabled"
              :attribute-name="attributeName"
              :object-value="objectValue"
              @input="inputFn"
    ></u-input>
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
import UInput from '@unitybase/adminui-vue/components/controls/UInput.vue'
import { action } from '@storybook/addon-actions'

export default {
  components: {
    UInput
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
      return this.$UB.connection.domain.get(this.entityName).asPlainJSON(false)
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
    inputFn: action('Entered value'),
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
