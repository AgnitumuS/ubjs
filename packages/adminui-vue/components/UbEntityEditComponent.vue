<template>
  <div
    ref="entityEdit"
    :loading="loading"
    style="height: 100%;"
    @keyup.alt.s="saveAndReload"
    @keyup.alt.enter="saveAndClose"
    @keyup.alt.r="remove"
  >
    <toolbar
      v-if="value.ID"
      v-model="value.ID"
      :entity-name="entityName"
      :is-new="isNew"
      :is-changed="isChanged"
      :simple-audit="{mi_createDate: value.mi_createDate, mi_modifyDate: value.mi_modifyDate}"
      :use-only-own-actions="useOnlyOwnActions"
      :input-actions="inputActions"
      :input-buttons="inputButtons"
      :form-code="formCode"
      @saveAndClose="saveAndClose"
      @saveAndReload="saveAndReload"
      @remove="remove"
    />
    <div class="ub-entity-edit__slot">
      <slot />
    </div>
  </div>
</template>

<script>
const toolbar = require('./UbToolbarComponent.vue').default
const dialog = require('./UbDialog/index.js')

module.exports = {
  name: 'UbEntityEditComponent',
  props: {
    value: Object,
    entityName: {
      type: String,
      required: true
    },
    externalData: Object,
    instanceID: Number,
    useOnlyOwnActions: Boolean,
    inputActions: Array,
    inputButtons: Array,
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
    currentTab () {
      return $App.viewport.centralPanel.queryById(this.currentTabId)
    },
    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },
    entityFields () {
      let pageColumns = this.entitySchema.filterAttribute({ defaultView: true }).map((at) => {
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
      this.saveEntity(() => {
        this.currentTab.forceClose = true
        this.currentTab.close()
      })
    },
    saveEntity (callback) {
      let changedColumns = Object.assign({}, this.changedColumns)
      if (Object.keys(changedColumns).length > 0) {
        let saveFn = () => {
          Object.keys(changedColumns).forEach(col => {
            if (this.entitySchema.attributes[col] && this.entitySchema.attributes[col].isMultiLang && Object.keys(changedColumns).some(key => key.indexOf(`${col}_`) !== -1)) {
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
            .finally(() => {
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
      $App.dialogYesNo('deletionDialogConfirmCaption', this.$ut('deleteFormConfirmCaption', this.value[this.entitySchema.descriptionAttribute]))
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
            this.currentTab.close()
          }).finally(() => {
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
      dataP.finally(() => {
        this.loading = false
      })
    }
    this.currentTab.on('beforeClose', function () {
      if (!this.currentTab.forceClose && Object.keys(this.changedColumns).length > 0) {
        $App.viewport.centralPanel.setActiveTab(this.currentTab)
        dialog({
          title: this.$ut('unsavedData'),
          msg: this.$ut('confirmSave'),
          type: 'warning',
          buttonText: {
            yes: this.$ut('save'),
            no: this.$ut('doNotSave'),
            cancel: this.$ut('cancel')
          }
        }).then(btn => {
          if (btn === 'yes') {
            this.currentTab.forceClose = true
            this.saveAndClose()
          } else if (btn === 'no') {
            this.currentTab.forceClose = true
            this.currentTab.close()
          }
        })
        return false
      }
      return true
    }, this)
  },
  components: {
    toolbar
  }
}
</script>
