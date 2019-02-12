<template>
  <div :loading="loading">
    <toolbar v-model="value"
             :entityName="entityName"
             :isNew="isNew"
             :isChanged="isChanged"
             :useOnlyOwnActions="useOnlyOwnActions"
             :inputActions="inputActions"
             @saveAndClose="saveAndClose"
             @saveAndReload="saveAndReload"
             @remove="remove"
    ></toolbar>
    <div class="ub-entity-edit__body">
      <el-scrollbar style="width:100%">
        <slot></slot>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
  let toolbar = require('./UbToolbarComponent.vue')

  module.exports = {
    name: 'UbEntityEditComponent',
    props: {
      value: Object,
      entityName: String,
      instanceID: Number,
      useOnlyOwnActions: Boolean,
      inputActions: Array
    },
    data () {
      return {
        loading: false,
        isNew: false
      }
    },
    computed: {
      fields () {
        let pageColumns = Object.values(this.entitySchema.attributes).filter((at) => {
          return at.defaultView
        }).map((at) => {
          return at.name
        })
        let fieldList = UB.ux.data.UBStore.normalizeFieldList(this.entityName, pageColumns || [])
        if (this.entitySchema.mixins.mStorage && this.entitySchema.mixins.mStorage.simpleAudit) fieldList.push('mi_createDate')
        return fieldList
      },
      entitySchema () {
        return $App.domainInfo.get(this.entityName)
      },
      isChanged () {
        return false
      }
    },
    methods: {
      saveAndReload () {
        this.save((data, changed) => {
          if (changed) {
            let object = {}
            data.resultData.data[0].forEach((item, index) => {
              object[data.resultData.fields[index]] = item
            })
            this.$emit('input', object)
            this.oldData = Object.assign({}, object)
            this.additionalData = {}
          }
        })
      },
      saveAndClose () {
        this.save(() => {this.$emit('close')})
      },
      save (callback) {
        this.$refs[this.$options.name].validate((valid) => {
          if (valid) {
            let changedColumns = Object.assign({}, this.changedColumns, this.additionalData)
            if (Object.keys(changedColumns).length > 0) {
              Object.keys(this.additionalData).forEach((locColumn) => {
                let matches = locColumn.match(/(\w+)_\w\w\^/)
                if (matches && changedColumns.hasOwnProperty(matches[1])) {
                  changedColumns[`${matches[1]}_${$App.connection.userLang()}^`] = changedColumns[matches[1]]
                  delete changedColumns[matches[1]]
                }
              })
              changedColumns.ID = this.value.ID
              changedColumns.mi_modifyDate = this.value.mi_modifyDate
              let params = {
                fieldList: this.fields,
                entity: this.entitySchema.name,
                method: this.isNew ? 'insert' : 'update',
                execParams: changedColumns
              }
              this.loading = true
              $App.connection.update(params)
                .finally(function () {
                  this.loading = false
                }.bind(this))
                .then((result) => {
                  callback.call(this, result, true)
                  return result
                })
                .then((result) => {
                  $App.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
                  $App.connection.emit(`${this.entitySchema.name}:${this.isNew ? 'insert' : 'update'}`, result.execParams.ID)
                })
            } else {
              callback.call(this, null, false)
            }
          }
        })
      },
      remove () {
        this.loading = true
        $App.dialogYesNo('deletionDialogConfirmCaption', UB.format(UB.i18n('deleteFormConfirmCaption'), this.value[this.entitySchema.descriptionAttribute]))
          .then(function (res) {
            if (!res) {
              this.loading = false
              return
            }
            let request = {
              entity: this.entitySchema.name,
              method: 'delete',
              execParams: {
                ID: this.value.ID
              }
            }
            return $App.connection.doDelete(request).then(function (result) {
              $App.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
              $App.connection.emit(`${this.entitySchema.name}:delete`, result.execParams.ID)
              this.$emit('close')
            }.bind(this)).finally(function () {
              this.loading = false
            }.bind(this))
          }.bind(this))
      }
    },
    mounted () {
      if (!this.value || Object.keys(this.value) < 1) {
        let dataP
        this.loading = true
        if (this.instanceID) {
          dataP = UB.Repository(this.entityName).attrs(this.fields).selectById(this.instanceID).then(function (resp) {
            this.$emit('input', resp)
          }.bind(this)).finally(function () {
            this.loading = false
          }.bind(this))
        } else {
          let parameters = {
            entity: this.entityName,
            fieldList: this.fields
          }
          dataP = $App.connection.addNew(parameters).then(function (result) {
            let data = {}
            result.resultData.fields.forEach((item, key) => {
              data[item] = result.resultData.data[0][key]
            })
            this.$emit('input', data)
          }.bind(this)).finally(function () {
            this.loading = false
          }.bind(this))
          this.isNew = true
        }
      }
    }
    ,
    components: {
      toolbar
    }
  }
</script>

<style>
  .ub-entity-edit__body {
    margin: 10px 20px 0;
  }

</style>