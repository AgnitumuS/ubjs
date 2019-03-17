<template>
  <div>
    <el-input
      v-model="currentValue"
      v-bind="$attrs"
      v-on="$listeners"
    >
      <el-button
        v-if="isMultiLang && objectValue"
        slot="append"
        class="fa fa-globe"
        :disabled="disabled"
        tabindex="-1"
        @click="initLocalizableFields"
      />
    </el-input>
    <el-dialog
      width="30%"
      custom-class="ub-input__dialog"
      :visible.sync="dialogFormVisible"
      :title="dialogTitle"
    >
      <el-form v-loading="loading">
        <el-form-item
          style="font-weight:bold"
          :label="localCaption"
          label-width="100px"
        >
          <el-input
            v-model="currentValue"
            @change="$emit('input', currentValue)"
          />
        </el-form-item>
        <el-form-item
          v-for="item in localizableFields"
          :key="item.fieldName"
          :label="item.caption"
          label-width="100px"
        >
          <div class="el-input el-input--small">
            <input
              v-model="item.value"
              class="el-input__inner"
            >
          </div>
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="primary"
          @click="saveLocalization"
        >Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
module.exports = {
  name: 'UbInput',
  data () {
    return {
      dialogFormVisible: false,
      localizableFields: {},
      loading: false,
      localCaption: '',
      currentValue: this.value,
      oldLocalization: {}
    }
  },
  computed: {
    dialogTitle () {
      return this.entitySchema.getAttribute(this.attributeName).caption
    },
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },
    isMultiLang () {
      return this.entitySchema.attributes[this.attributeName].isMultiLang
    }
  },
  props: {
    value: [String],
    entityName: {
      type: String,
      required: true
    },
    attributeName: {
      type: String,
      required: true
    },
    // TODO this property is for multilang attributes. Rewrite because nobody know how to bind this
    objectValue: Object
  },
  methods: {
    saveLocalization () {
      let changedColumns = []
      Object.keys(this.localizableFields).forEach(key => {
        if (!this.oldLocalization[key] || this.localizableFields[key].value !== this.oldLocalization[key].value) changedColumns.push(key)
      })
      if (changedColumns.length > 0) {
        changedColumns.forEach(key => {
          this.$set(this.objectValue, key, this.localizableFields[key].value)
        })
        Object.keys(this.localizableFields).forEach(key => { this.oldLocalization[key] = { value: this.localizableFields[key].value } })
      }
      this.dialogFormVisible = false
    },
    initLocalizableFields () {
      this.dialogFormVisible = true
      if (Object.keys(this.localizableFields).length === 0) {
        this.loading = true
        let fieldList = []
        let userLang = this.$UB.connection.userLang()
        this.$UB.appConfig.supportedLanguages.forEach((item) => {
          if (userLang === item) {
            return
          }
          let fieldName = this.attributeName + '_' + item + '^'
          if (!Object.keys(this.localizableFields).includes(fieldName)) {
            this.localizableFields[fieldName] = {
              location: item,
              fieldName: fieldName,
              caption: this.$ut(item)
            }
            fieldList.push(fieldName)
          }
        })
        if (fieldList.length > 0) {
          this.$UB.Repository(this.entityName).attrs([...fieldList, 'ID']).selectById(this.objectValue.ID).then((item) => {
            if (item) {
              Object.keys(item).forEach((fieldName) => {
                if (fieldName !== 'ID') {
                  this.localizableFields[fieldName].value = item[fieldName]
                  this.oldLocalization[fieldName] = { value: item[fieldName] }
                }
              })
            }
          }).finally(() => {
            this.$forceUpdate()
            this.loading = false
          })
        }
      }
    }
  },
  watch: {
    value (val, oldVal) {
      this.currentValue = val
    }
  },
  mounted () {
    if (this.isMultiLang) {
      this.localCaption = this.$ut(this.$UB.connection.userLang())
    }
  }
}
</script>
