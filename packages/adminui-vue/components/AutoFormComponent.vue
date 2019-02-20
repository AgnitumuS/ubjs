<template>
  <div id="auto-form-app" v-if="fieldsToShow" style="height: 100%;">
    <ub-entity-edit v-model="value" :entityName="entityName" :instanceID="instanceID" :save="save"
                    :currentTabId="currentTabId">
      <el-form :ref="$options.name" :model="value" label-position="left" label-width="150px">
        <el-form-item
            v-for="fieldName in fieldsToShow"
            :prop="fieldName"
            :key="fieldName"
            :rules="getRules(fieldName)"
            :label="entitySchema.attributes[fieldName].caption"
            style="max-width: 600px">
          <el-checkbox
              v-if="entitySchema.attributes[fieldName].dataType === 'Boolean'"
              v-model="value[fieldName]"
          ></el-checkbox>
          <el-date-picker
              v-else-if="entitySchema.attributes[fieldName].dataType === 'DateTime' || entitySchema.attributes[fieldName].dataType === 'Date'"
              v-model="value[fieldName]"
              :type="entitySchema.attributes[fieldName].dataType.toLowerCase()"
              placeholder="Select date and time"
          ></el-date-picker>
          <ub-select-enum
              v-else-if="entitySchema.attributes[fieldName].dataType === 'Enum'"
              v-model="value[fieldName]"
              :eGroup="entitySchema.attributes[fieldName].enumGroup"
          ></ub-select-enum>
          <ub-select-entity
              v-else-if="entitySchema.attributes[fieldName].dataType === 'Entity'"
              v-model="value[fieldName]"
              :entityName="entitySchema.attributes[fieldName].associatedEntity"
          ></ub-select-entity>
          <ub-select-many
              v-else-if="entitySchema.attributes[fieldName].dataType === 'Many'"
              v-model="value[fieldName]"
              :entityName="entitySchema.attributes[fieldName].associatedEntity"
          ></ub-select-many>
          <el-input
              v-else-if="entitySchema.attributes[fieldName].dataType === 'Text'"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 4}"
              v-model="value[fieldName]"
          ></el-input>
          <ub-upload-document
              v-else-if="entitySchema.attributes[fieldName].dataType === 'Document'"
              v-model="value[fieldName]"
              :docParams="{ entity: entitySchema.name, attribute: fieldName, ID: value.ID }"
          ></ub-upload-document>
          <ub-code-mirror
              v-else-if="entitySchema.attributes[fieldName].dataType === 'Json'"
              v-model="value[fieldName]"
          ></ub-code-mirror>
          <ub-input
              v-else
              v-model="value[fieldName]"
              :entityName="entitySchema.name"
              :attributeName="fieldName"
              :objectValue="value"
          ></ub-input>
        </el-form-item>
      </el-form>
    </ub-entity-edit>
  </div>
</template>

<script>
  let ubSelectEnum = require('./controls/UbSelectEnum.vue')
  let ubSelectEntity = require('./controls/UbSelectEntity.vue')
  let ubSelectMany = require('./controls/UbSelectMany.vue')
  let ubInput = require('./controls/UbInput.vue')
  let ubUploadDocument = require('./controls/UbUploadDocument.vue')
  let ubCodeMirror = require('./controls/UbCodeMirror.vue')

  window.BOUNDLED_BY_WEBPACK = false
  if (BOUNDLED_BY_WEBPACK) {
    ubSelectEnum = ubSelectEnum.default
    ubSelectEntity = ubSelectEntity.default
    ubSelectMany = ubSelectMany.default
    ubInput = ubInput.default
    ubUploadDocument = ubUploadDocument.default
    ubCodeMirror = ubCodeMirror.default
  }

  module.exports = {
    name: 'AutoForm',
    props: {
      entityName: {
        type: String,
        required: true
      },
      instanceID: Number,
      currentTabId: String
    },
    methods: {
      getRules (fieldName) {
        let rules = []
        if (!this.entitySchema.attributes[fieldName].allowNull && this.entitySchema.attributes[fieldName].dataType !== 'Boolean') {
          rules.push({
            required: true,
            message: this.$UB.format(this.$ut('isRequiredFieldFmt'), this.entitySchema.attributes[fieldName].caption),
            trigger: 'blur'
          })
        }
        return rules
      },
      save (callback) {
        this.$refs[this.$options.name].validate((valid) => {
          if (valid) {
            callback()
          }
        })
      }
    },
    computed: {
      entitySchema () {
        return this.$UB.connection.domain.get(this.entityName)
      },
      fieldsToShow () {
        return Object.values(this.entitySchema.attributes).filter((at) => {
          return at.defaultView
        }).map((at) => {
          return at.name
        })
      }
    },
    data () {
      return {
        value: {}
      }
    },
    components: {
      'ub-select-enum': ubSelectEnum,
      'ub-select-entity': ubSelectEntity,
      'ub-select-many': ubSelectMany,
      'ub-input': ubInput,
      'ub-upload-document': ubUploadDocument,
      'ub-code-mirror': ubCodeMirror
    }
  }
</script>
