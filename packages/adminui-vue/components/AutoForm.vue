<template>
  <div class="ub-form-container">
    <u-toolbar :validation="$v" />
    <u-form v-loading.body="loading">
      <u-form-row
        v-for="key in fields"
        :key="key"
        :label="key"
        :required="$v[key].$params.hasOwnProperty('required')"
        :error="$v[key].$error"
      >
        <el-checkbox
          v-if="entitySchema.attributes[key].dataType === 'Boolean'"
          :value="$store.state.data[key]"
          @input="storeSetter(key, $event)"
        />
        <el-date-picker
          v-else-if="entitySchema.attributes[key].dataType === 'DateTime' || entitySchema.attributes[key].dataType === 'Date'"
          :value="$store.state.data[key]"
          :type="entitySchema.attributes[key].dataType.toLowerCase()"
          placeholder="Select date and time"
          @input="storeSetter(key, $event)"
        />
        <u-select-enum
          v-else-if="entitySchema.attributes[key].dataType === 'Enum'"
          :value="$store.state.data[key]"
          :e-group="entitySchema.attributes[key].enumGroup"
          :disabled="parentContext.hasOwnProperty(key)"
          @input="storeSetter(key, $event)"
        />
        <u-select-entity
          v-else-if="entitySchema.attributes[key].dataType === 'Entity'"
          :value="$store.state.data[key]"
          :entity-name="entitySchema.attributes[key].associatedEntity"
          :disabled="parentContext.hasOwnProperty(key)"
          @input="storeSetter(key, $event)"
        />
        <u-select-many
          v-else-if="entitySchema.attributes[key].dataType === 'Many'"
          :value="$store.state.data[key]"
          :entity="entitySchema.attributes[key].associatedEntity"
          :disabled="parentContext.hasOwnProperty(key)"
          @input="storeSetter(key, $event)"
        />
        <el-input
          v-else-if="entitySchema.attributes[key].dataType === 'Text'"
          :value="$store.state.data[key]"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 4}"
          @input="storeSetter(key, $event)"
        />
        <u-upload-document
          v-else-if="entitySchema.attributes[key].dataType === 'Document'"
          :value="$store.state.data[key]"
          :entity-name="entitySchema.name"
          :file-store="key"
          :doc-id="$store.state.data.ID"
          @input="storeSetter(key, $event)"
        />
        <u-code-mirror
          v-else-if="entitySchema.attributes[key].dataType === 'Json'"
          :value="$store.state.data[key]"
          @input="storeSetter(key, $event)"
        />
        <u-input
          v-else
          :value="$store.state.data[key]"
          :attribute-name="key"
          :disabled="parentContext.hasOwnProperty(key)"
          @input="storeSetter(key, $event)"
        />
      </u-form-row>
    </u-form>
  </div>
</template>

<script>
const { validationInjectMixin } = require('../utils/formBoilerplate/validation')
const { mapGetters } = require('vuex')

export default {
  name: 'AutoForm',

  mixins: [validationInjectMixin],
  inject: ['$formServices'],

  props: {
    parentContext: {
      type: Object,
      default () {
        return {}
      }
    }
  },

  computed: {
    fields () {
      return this.entitySchema
        .filterAttribute(attr => attr.defaultView)
        .map(a => a.name)
    },

    ...mapGetters(['entitySchema', 'loading'])
  },

  created () {
    this.$store.watch(
      (state, getters) => ({
        isDirty: getters.isDirty,
        isNew: state.isNew
      }),
      ({ isDirty, isNew }) => {
        let title = this.$store.state.formTitle
        if (isDirty) {
          title = `* ${title}`
        }
        if (isNew) {
          title += ` (${this.$ut('dobavlenie')})`
        }
        this.$formServices.setTitle(title)
      }
    )
  },

  methods: {
    storeSetter (key, value) {
      this.$v[key].$touch()
      this.$store.commit('SET_DATA', { key, value })
    }
  }
}
</script>
