<template>
  <el-dialog
    :visible.sync="dialogVisible"
    append-to-body
  >
    <u-form-row
      v-for="attribute in attributesToShow"
      :key="attribute.code"
      :label="attribute[descriptionAttribute]"
      :required="$v.model[attribute.code].$params.hasOwnProperty('required')"
      :error="$v.model[attribute.code].$error"
    >
      <el-checkbox
        v-if="attribute.dataType === 'Boolean'"
        @input="$v.model[attribute.code].$touch()"
        v-model="model[attribute.code]"
      />
      <el-date-picker
        v-else-if="(attribute.dataType === 'Date') || (attribute.dataType === 'DateTime')"
        v-model="model[attribute.code]"
        :type="attribute.dataType.toLowerCase()"
        :placeholder="$ut(attribute.dataType === 'Date' ? 'selectDate' : 'selectDateAndTime')"
        @input="$v.model[attribute.code].$touch()"
      />
      <u-select-enum
        v-else-if="attribute.dataType === 'Enum'"
        v-model="model[attribute.code]"
        :e-group="entitySchema.attributes[attribute.code].enumGroup"
        @input="$v.model[attribute.code].$touch()"
      />
      <u-select-entity
        v-else-if="attribute.dataType === 'Entity'"
        v-model="model[attribute.code]"
        :entity-name="attribute.associatedEntity"
        @input="$v.model[attribute.code].$touch()"
      />
      <u-select-many
        v-else-if="attribute.dataType === 'Many'"
        v-model="model[attribute.code]"
        :entity-name="attribute.associatedEntity"
        @input="$v.model[attribute.code].$touch()"
      />
      <el-input
        v-else-if="attribute.dataType === 'Text'"
        v-model="model[attribute.code]"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 4 }"
        @input="$v.model[attribute.code].$touch()"
      />
      <u-upload-document
        v-else-if="attribute.dataType === 'Document'"
        v-model="model[attribute.code]"
        :entity-name="entityName"
        :file-store="attribute.code"
        :doc-id="model.ID"
        @input="$v.model[attribute.code].$touch()"
      />
      <u-code-mirror
        v-else-if="attribute.dataType === 'Json'"
        v-model="model[attribute.code]"
        @input="$v.model[attribute.code].$touch()"
      />
      <u-base-input
        v-else
        v-model="model[attribute.code]"
        @input="$v.model[attribute.code].$touch()"
      />
    </u-form-row>

    <template
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="dialogVisible = false">
        Cancel
      </el-button>
      <el-button
        type="primary"
        @click="submit"
      >
        Confirm
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
const required = require('vuelidate/lib/validators/required').default
export default {
  name: 'AddRecordDialog',

  props: {
    collectionName: {
      type: String,
      required: true
    }
  },

  inject: {
    masterEntityName: 'entity'
  },

  data () {
    return {
      dialogVisible: false,
      model: {}
    }
  },

  computed: {
    collectionData () {
      return this.$store.state.collections[this.collectionName]
    },

    entityName () {
      return this.collectionData.entity
    },

    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    descriptionAttribute () {
      return this.entitySchema.descriptionAttribute
    },

    attributesToShow () {
      return this.entitySchema.filterAttribute(attr =>
        attr.defaultView &&
        attr.code !== this.objectIDAttribute.code
      )
    },

    objectIDAttribute () {
      const attrs = this.entitySchema.filterAttribute(attr => attr.associatedEntity === this.masterEntityName)
      return attrs[0]
    }
  },

  validations () {
    const values = this.attributesToShow.reduce((obj, attr) => {
      obj[attr.code] = attr.allowNull ? {} : { required }
      return obj
    }, {})

    return {
      model: values
    }
  },

  methods: {
    show () {
      this.initValues()
      this.dialogVisible = true
    },

    async initValues () {
      const fieldList = this.attributesToShow
        .map(a => a.code)
        .concat('ID', this.objectIDAttribute.code)

      const data = await this.$UB.connection.addNewAsObject({
        entity: this.entityName,
        fieldList,
        execParams: {
          [this.objectIDAttribute.code]: this.$store.state.data.ID
        }
      })

      this.$set(this, 'model', data)
    },

    submit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('ADD_COLLECTION_ITEM', {
          collection: this.collectionName,
          item: Object.assign({}, this.model)
        })

        this.dialogVisible = false
      }
    }
  }
}
</script>
