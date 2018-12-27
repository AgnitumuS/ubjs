<template>
    <div>
        <el-input v-model="currentValue" @change="$emit('input', currentValue)">
            <i v-if="isMultiLang"
               class="fa fa-globe"
               slot="suffix"
               @click="initLocalizableFields"></i>
        </el-input>
        <el-dialog width="30%" :visible.sync="dialogFormVisible">
            <el-form v-loading="loading">
                <el-form-item style="font-weight:bold" :label="localCaption" label-width="100px">
                    <el-input v-model="currentValue" @change="$emit('input', currentValue)"></el-input>
                </el-form-item>
                <el-form-item v-for="item in Object.values(localizableFields)" :key="item.fieldName"
                              :label="item.caption" label-width="100px">
                    <input class="el-input__inner" v-model="item.value"></input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveLocalization">Save</el-button>
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
        currentValue: this.value
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
      primaryValue: [String, Number]
    },
    methods: {
      saveLocalization () {
        this.dialogFormVisible = false
        this.$emit('saveLocalization', this.localizableFields)
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
            UB.Repository(this.entityName).attrs(fieldList).selectById(this.primaryValue).then((item) => {
              if (item) {
                Object.keys(item).forEach((fieldName) => {
                  this.localizableFields[fieldName].value = item[fieldName]
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
    mounted () {
      if (this.isMultiLang) {
        this.localCaption = UB.i18n($App.connection.userLang())
      }
    }
  }
</script>
