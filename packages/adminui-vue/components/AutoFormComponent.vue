<template>
  <div
    v-if="fieldsToShow"
    id="auto-form-app"
    style="height: 100%"
  >
    <ub-entity-edit
      :instance="value"
      :entity-name="entityName"
      :instance-id="instanceID"
      :save="save"
      :current-tab-id="currentTabId"
      :external-data="externalData"
      @data-loaded="assignInstanceData"
    >
      <el-form
        :ref="$options.name"
        :model="value"
        label-position="left"
        label-width="150px"
      >
        <!--TODO replace style max-width with el-row md=12 sm 24-->
        <el-form-item
          v-for="fieldName in fieldsToShow"
          :key="fieldName"
          :prop="fieldName"
          :rules="getRules(fieldName)"
          :label="entitySchema.attributes[fieldName].caption"
          style="max-width: 600px"
        >
          <el-checkbox
            v-if="entitySchema.attributes[fieldName].dataType === 'Boolean'"
            v-model="value[fieldName]"
          />
          <el-date-picker
            v-else-if="entitySchema.attributes[fieldName].dataType === 'DateTime' || entitySchema.attributes[fieldName].dataType === 'Date'"
            v-model="value[fieldName]"
            :type="entitySchema.attributes[fieldName].dataType.toLowerCase()"
            placeholder="Select date and time"
          />
          <ub-select-enum
            v-else-if="entitySchema.attributes[fieldName].dataType === 'Enum'"
            v-model="value[fieldName]"
            :e-group="entitySchema.attributes[fieldName].enumGroup"
            :disabled="externalData.hasOwnProperty(fieldName)"
          />
          <ub-select-entity
            v-else-if="entitySchema.attributes[fieldName].dataType === 'Entity'"
            v-model="value[fieldName]"
            :entity-name="entitySchema.attributes[fieldName].associatedEntity"
            :disabled="externalData.hasOwnProperty(fieldName)"
          />
          <ub-select-many
            v-else-if="entitySchema.attributes[fieldName].dataType === 'Many'"
            v-model="value[fieldName]"
            :entity-name="entitySchema.attributes[fieldName].associatedEntity"
            :disabled="externalData.hasOwnProperty(fieldName)"
          />
          <el-input
            v-else-if="entitySchema.attributes[fieldName].dataType === 'Text'"
            v-model="value[fieldName]"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 4}"
          />
          <u-input-number
            v-else-if="['Int','BigInt','Float','Currency','ID'].includes(entitySchema.attributes[fieldName].dataType)"
            v-model="value[fieldName]"
            :entity-name="entitySchema.name"
            :attribute-name="fieldName"
            :disabled="externalData.hasOwnProperty(fieldName)"
          />
          <ub-upload-document
            v-else-if="entitySchema.attributes[fieldName].dataType === 'Document'"
            v-model="value[fieldName]"
            :doc-params="{ entity: entitySchema.name, attribute: fieldName, ID: value.ID }"
          />
          <ub-code-mirror
            v-else-if="entitySchema.attributes[fieldName].dataType === 'Json'"
            v-model="value[fieldName]"
          />
          <ub-input
            v-else
            v-model="value[fieldName]"
            :entity-name="entitySchema.name"
            :attribute-name="fieldName"
            :object-value="value"
            :disabled="externalData.hasOwnProperty(fieldName)"
          />
        </el-form-item>
      </el-form>
    </ub-entity-edit>
  </div>
</template>

<script>
const ubSelectEnum = require('./controls/UbSelectEnum.vue').default
const ubSelectEntity = require('./controls/UbSelectEntity.vue').default
const ubSelectMany = require('./controls/UbSelectMany.vue').default
const ubInput = require('./controls/UbInput.vue').default
const ubUploadDocument = require('./controls/UbUploadDocument.vue').default
const ubCodeMirror = require('./controls/UbCodeMirror.vue').default
const UInputNumber = require('./controls/UInputNumber.vue').default

module.exports = {
  name: 'AutoForm',
  props: {
    entityName: {
      type: String,
      required: true
    },
    /* externalData - parameters from parent context. When we create related object - disable related fields and fill with parent data */
    externalData: {
      type: Object,
      default () {
        return {}
      }
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
          message: this.$ut('isRequiredFieldFmt', this.entitySchema.attributes[fieldName].caption),
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
    },
    assignInstanceData (data) {
      this.value = data
    }
  },
  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },
    fieldsToShow () {
      return this.entitySchema.filterAttribute({ defaultView: true }).map((at) => {
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
    'ub-code-mirror': ubCodeMirror,
    UInputNumber
  }
}
</script>
