<template>
  <div>
    <el-input v-model="currentValue"
              :controls="false"
              :type="fieldType"
              :step="step"
              :disabled="disabled"
              @change="onChange">
      <el-button v-if="isMultiLang && objectValue"
                 slot="append"
                 class="fa fa-globe"
                 :disabled="disabled"
                 tabindex="-1"
                 @click="initLocalizableFields"
      ></el-button>
    </el-input>
    <el-dialog width="30%"
               custom-class="ub-input__dialog"
               :visible.sync="dialogFormVisible"
               :title="dialogTitle">
      <el-form v-loading="loading">
        <el-form-item style="font-weight:bold"
                      :label="localCaption"
                      label-width="100px">
          <el-input v-model="currentValue"
                    @change="$emit('input', currentValue)"
          ></el-input>
        </el-form-item>
        <el-form-item v-for="item in localizableFields"
                      :key="item.fieldName"
                      :label="item.caption"
                      label-width="100px">
          <div class="el-input el-input--small">
            <input v-model="item.value"
                   class="el-input__inner"/>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary"
                   @click="saveLocalization"
        >Save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const ubDomain = require('@unitybase/cs-shared').UBDomain

module.exports = {
  name: 'UbInput',
  data () {
    return {
      UBDomain: ubDomain,
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
    dataType () {
      return this.entitySchema.attributes[this.attributeName].dataType
    },
    fieldType () {
      return ['Int', 'BigInt', 'Float', 'Currency'].includes(this.dataType) ? 'number' : 'text'
    },
    step () {
      let step = '0'
      if (this.dataType === 'Float') step = '0.01'
      if (this.dataType === 'Currency') step = `0.${'0'.repeat(UBDomain.FLOATING_SCALE_PRECISION - 1)}1`
      return step
    },
    isMultiLang () {
      return this.entitySchema.attributes[this.attributeName].isMultiLang
    }
  },
  props: {
    value: [String, Number],
    entityName: {
      type: String,
      required: true
    },
    attributeName: {
      type: String,
      required: true
    },
    disabled: Boolean,
    objectValue: Object
  },
  methods: {
    onChange () {
      if (['Int', 'BigInt'].includes(this.dataType)) this.currentValue = Math.round(this.currentValue)
      if (this.dataType === 'Float') this.currentValue = Math.round(this.currentValue * 100) / 100
      if (this.dataType === 'Currency') this.currentValue = Math.round(this.currentValue * Math.pow(10, this.UBDomain.FLOATING_SCALE_PRECISION)) / Math.pow(10, this.UBDomain.FLOATING_SCALE_PRECISION)
      this.$emit('input', this.currentValue)
    },
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
                  this.oldLocalization[fieldName] = {value: item[fieldName]}
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
    value () {
      this.currentValue = this.value
    }
  },
  mounted () {
    if (this.isMultiLang) {
      this.localCaption = this.$ut(this.$UB.connection.userLang())
    }
  }
}
</script>
