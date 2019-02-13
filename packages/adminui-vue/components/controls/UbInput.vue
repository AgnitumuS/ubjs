<template>
  <div>
    <el-input v-model="currentValue"
              @change="$emit('input', currentValue)">
      <el-button slot="append"
                 v-if="isMultiLang"
                 @click="initLocalizableFields"
                 class="fa fa-globe"
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
        return (Object.values($App.domainInfo.get(this.entityName).attributes).find(attr => attr.code === this.attributeName) || {}).caption
      }
    },
    props: {
      value: String,
      isMultiLang: {
        type: Boolean,
        default: false
      },
      entityName: String,
      attributeName: String,
      primaryValue: [String, Number],
      objectValue: Object
    },
    methods: {
      saveLocalization () {
        let changedColumns = []
        Object.keys(this.localizableFields).forEach(key => {
          if (this.localizableFields[key].value !== this.oldLocalization[key].value) changedColumns.push(key)
        })
        if (changedColumns.length > 0) {
          changedColumns.forEach(key => {
            this.objectValue[key] = this.localizableFields[key].value
          })
          Object.keys(this.localizableFields).forEach(key => this.oldLocalization[key] = {value: this.localizableFields[key].value})
        }
        this.dialogFormVisible = false
      },
      initLocalizableFields () {
        this.dialogFormVisible = true
        if (Object.keys(this.localizableFields).length === 0) {
          this.loading = true
          let fieldList = []
          UB.appConfig.supportedLanguages.forEach((item) => {
            if ($App.connection.userLang() === item) {
              return
            }
            let fieldName = this.attributeName + '_' + item + '^'
            if (!Object.keys(this.localizableFields).includes(fieldName)) {
              this.localizableFields[fieldName] = {
                location: item,
                fieldName: fieldName,
                caption: UB.i18n(item)
              }
              fieldList.push(fieldName)
            }
          })
          if (fieldList.length > 0) {
            UB.Repository(this.entityName).attrs([...fieldList, 'ID']).selectById(this.primaryValue).then((item) => {
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
        this.localCaption = UB.i18n($App.connection.userLang())
      }
    }
  }
</script>
