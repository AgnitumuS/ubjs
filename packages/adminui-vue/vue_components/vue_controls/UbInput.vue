<template>
    <div>
        <el-input v-model="currentValue" @change="$emit('input', currentValue)">
            <i v-if="isMultiLang"
               class="fa fa-globe"
               slot="suffix"
               @click="dialogFormVisible = true"></i>
        </el-input>
        <el-dialog width="30%" :visible.sync="dialogFormVisible">
            <el-form>
                <el-form-item :label="localCaption" label-width="150px">
                    <el-input v-model="currentValue" @change="$emit('input', currentValue)"></el-input>
                </el-form-item>
                <el-form-item v-for="(item, index) in localizableFields" :label="item.caption" label-width="150px">
                    <el-input v-model="item.value"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogFormVisible = false">Save</el-button>
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
    methods: {},
    mounted () {
      if (this.isMultiLang) {
        this.localCaption = UB.i18n($App.connection.userLang())
        this.loading = true
        let fieldList = []
        UB.appConfig.supportedLanguages.forEach((item) => {
          if ($App.connection.userLang() === item) {
            return
          }
          let fieldName = this.attributeName + '_' + item + '^'
          this.localizableFields[fieldName] = {
            location: item,
            fieldName: fieldName,
            caption: UB.i18n(item)
          }
          fieldList.push(fieldName)
        })
        UB.Repository(this.entityName).attrs(fieldList).selectById(this.primaryValue).then((item) => {
          if (item) {
            Object.keys(item).forEach((fieldName) => {
              this.localizableFields[fieldName].value = item[fieldName]
            })
          }
        }).finally(() => {
          this.loading = false
        })
      }
    }
  }
</script>
