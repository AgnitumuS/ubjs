<template>
  <div
    v-if="fieldsToShow"
    style="height: 100%"
  >
    <u-entity-edit
      :instance="$store.state.data"
      :entity-name="entityName"
      :instance-id="instanceID"
      :before-save="beforeSave"
      :current-tab-id="currentTabId"
      :parent-context="parentContext"
      @data-loaded="assignInstanceData"
    >
      <u-form
        :label-width="150"
      >
        <!--TODO replace style max-width with el-row md=12 sm 24-->
        <u-form-row
          v-for="field in fieldsToShow"
          :key="field"
          :required="true"
          :label="entitySchema.attributes[field].caption"
          style="max-width: 600px"
        >
          <!-- <el-date-picker
            v-else-if="entitySchema.attributes[field].dataType === 'DateTime' || entitySchema.attributes[field].dataType === 'Date'"
            v-model="value[field]"
            :type="entitySchema.attributes[field].dataType.toLowerCase()"
            placeholder="Select date and time"
            @change="$v.value[field].$touch()"
          />
          <ub-select-enum
            v-else-if="entitySchema.attributes[field].dataType === 'Enum'"
            v-model="value[field]"
            :e-group="entitySchema.attributes[field].enumGroup"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          /> -->
          <ub-select-entity
            :entity-name="entitySchema.attributes[field].associatedEntity"
            :disabled="parentContext.hasOwnProperty(field)"
            :value="storeGetter(field)"
            @input="storeSetter(field, $event)"
          />
          <!-- <ub-select-many
            v-else-if="entitySchema.attributes[field].dataType === 'Many'"
            v-model="value[field]"
            :entity-name="entitySchema.attributes[field].associatedEntity"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          />
          <el-input
            v-else-if="entitySchema.attributes[field].dataType === 'Text'"
            v-model="value[field]"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 4}"
            @change="$v.value[field].$touch()"
          />
          <u-input-number
            v-else-if="['Int','BigInt','Float','Currency','ID'].includes(entitySchema.attributes[field].dataType)"
            v-model="value[field]"
            :entity-name="entitySchema.name"
            :attribute-name="field"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          />
          <ub-upload-document
            v-else-if="entitySchema.attributes[field].dataType === 'Document'"
            v-model="value[field]"
            :doc-params="{ entity: entitySchema.name, attribute: field, ID: value.ID }"
            @input="$v.value[field].$touch()"
          />
          <u-code-mirror
            v-else-if="entitySchema.attributes[field].dataType === 'Json'"
            v-model="value[field]"
            @input="$v.value[field].$touch()"
          />
          <u-input
            v-else
            v-model="value[field]"
            :entity-name="entitySchema.name"
            :attribute-name="field"
            :object-value="value"
            :disabled="parentContext.hasOwnProperty(field)"
            @input="$v.value[field].$touch()"
          /> -->
        </u-form-row>
      </u-form>
    </u-entity-edit>
  </div>
</template>

<script>
const required = require('vuelidate/lib/validators/required').default

module.exports = {
  name: 'AutoForm',
  props: {
    entityName: {
      type: String,
      required: true
    },
    /**
     * Parameters from parent context.
     * When we create related object - disable related fields and fill with parent data
     */
    parentContext: {
      type: Object,
      default () {
        return {}
      }
    },
    instanceID: Number,
    currentTabId: String
  },

  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    fieldsToShow () {
      return this.entitySchema
        .filterAttribute({ defaultView: true })
        .map((at) => at.name)
    }
  },

  methods: {
    storeGetter (key) {
      return this.$store.state.data[key]
    },

    storeSetter (key, value) {
      this.$store.commit('SET_DATA', { key, value })
    },

    beforeSave (callback) {
      this.$v.$touch()
      if (!this.$v.$error) {
        callback()
      }
    },

    assignInstanceData (data) {
      this.$store.commit('LOAD_DATA', data)
    }
  }
}
</script>
