<template>
  <div ref="entityEdit" :loading="loading" style="height: 100%;" @keyup.ctrl.enter="saveAndClose" @keyup.ctrl.46="remove">
    <toolbar v-model="value"
             :entity-name="entityName"
             :is-new="isNew"
             :is-changed="isChanged"
             :use-only-own-actions="useOnlyOwnActions"
             :input-actions="inputActions"
             :form-code="formCode"
             @saveAndClose="saveAndClose"
             @saveAndReload="saveAndReload"
             @remove="remove"
    ></toolbar>
    <div class="ub-entity-edit__slot">
      <slot></slot>
    </div>
  </div>
</template>

<script>
let toolbar = require('./UbToolbarComponent.vue')

if (BOUNDLED_BY_WEBPACK) {
  toolbar = toolbar.default
}

module.exports = {
  name: 'UbEntityEditComponent',
  props: {
    value: Object,
    entityName: String,
    externalData: Object,
    instanceID: Number,
    useOnlyOwnActions: Boolean,
    inputActions: Array,
    save: Function,
    currentTabId: String,
    formCode: String
  },
  data () {
    return {
      loading: false,
      isNew: false,
      oldData: Object.assign({}, this.value)
    }
  },
  computed: {
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },
    entityFields () {
      let pageColumns = this.entitySchema.filterAttribute({defaultView: true}).map((at) => {
        return at.name
      })
      let fieldList = this.$UB.ux.data.UBStore.normalizeFieldList(this.entityName, pageColumns || [])
      if (this.entitySchema.mixins.mStorage && this.entitySchema.mixins.mStorage.simpleAudit) fieldList.push('mi_createDate')
      return fieldList
    },
    changedColumns () {
      let result = {}
      Object.keys(this.value).forEach(field => {
        if (this.value[field] !== this.oldData[field]) result[field] = this.value[field]
      })
      return result
    },
    isChanged () {
      return Object.keys(this.changedColumns).length > 0
    }
  },
  methods: {
    saveAndReload () {
      this.saveEntity(data => {
        let object = {}
        data.resultData.data[0].forEach((item, index) => {
          object[data.resultData.fields[index]] = item
        })
        this.$emit('input', object)
        this.oldData = Object.assign({}, object)
      })
    },
    saveAndClose () {
      this.saveEntity(() => Ext.getCmp(this.currentTabId).close())
    },
    saveEntity (callback) {
      let changedColumns = Object.assign({}, this.changedColumns)
      if (Object.keys(changedColumns).length > 0) {
        let saveFn = () => {
          Object.keys(changedColumns).forEach(col => {
            if (this.entitySchema.attributes[col] && this.entitySchema.attributes[col].isMultiLang) {
              changedColumns[`${col}_${this.$UB.connection.userLang()}^`] = changedColumns[col]
              delete changedColumns[col]
            }
          })
          changedColumns.ID = this.value.ID
          changedColumns.mi_modifyDate = this.value.mi_modifyDate
          let params = {
            fieldList: this.entityFields,
            entity: this.entitySchema.name,
            method: this.isNew ? 'insert' : 'update',
            execParams: changedColumns
          }
          this.loading = true
          this.$UB.connection.update(params)
            .finally(_ => {
              this.loading = false
            })
            .then((result) => {
              callback.call(this, result)
              return result
            })
            .then((result) => {
              this.$UB.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
              this.$UB.connection.emit(`${this.entitySchema.name}:${this.isNew ? 'insert' : 'update'}`, result.execParams.ID)
            })
        }
        if (this.save) {
          this.save(saveFn)
        } else {
          saveFn()
        }
      }
    },
    remove () {
      this.loading = true
      $App.dialogYesNo('deletionDialogConfirmCaption', this.$UB.format(this.$ut('deleteFormConfirmCaption'), this.value[this.entitySchema.descriptionAttribute]))
        .then(res => {
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
          return this.$UB.connection.doDelete(request).then(result => {
            this.$UB.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
            this.$UB.connection.emit(`${this.entitySchema.name}:delete`, result.execParams.ID)
            Ext.getCmp(this.currentTabId).close()
          }).finally(_ => {
            this.loading = false
          })
        })
    }
  },
  mounted () {
    if (!this.value || Object.keys(this.value) < 1) {
      let dataP
      this.loading = true
      if (this.instanceID) {
        dataP = this.$UB.Repository(this.entityName).attrs(this.entityFields).selectById(this.instanceID).then(resp => {
          this.$emit('input', resp)
          this.oldData = Object.assign({}, resp)
        })
      } else {
        let parameters = {
          entity: this.entityName,
          fieldList: this.entityFields
        }
        if (this.externalData) {
          parameters.execParams = this.externalData
        }
        dataP = this.$UB.connection.addNew(parameters).then(result => {
          let data = {}
          result.resultData.fields.forEach((item, key) => {
            data[item] = result.resultData.data[0][key]
          })
          this.$emit('input', data)
          this.oldData = {}
        })
        this.isNew = true
      }
      dataP.finally(_ => {
        this.loading = false
      })
    }
    this.$refs.entityEdit.onkeydown = event => {
      if (event.ctrlKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
          case 's':
            event.preventDefault()
            this.saveAndReload()
            break
        }
      }
    }
  },
  components: {
    toolbar
  }
}
</script>
