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
      :instance-id="instance.ID"
      :entity-name="entityName"
      :is-new="isNew"
      :is-changed="isChanged"
      :simple-audit="{mi_createDate: instance.mi_createDate, mi_modifyDate: instance.mi_modifyDate}"
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
// TODO rename UbToolbarComponent to UFormToolbar
const toolbar = require('./UbToolbarComponent.vue').default

module.exports = {
  name: 'UbEntityEditComponent',
  props: {
    instance: {
      type: Object,
      required: true
    },
    entityName: {
      type: String,
      required: true
    },
    externalData: Object,
    instanceId: Number,
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
      originalData: Object.assign({}, this.instance) // TODO deep clone
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
      Object.keys(this.instance).forEach(field => {
        if (this.instance[field] !== this.originalData[field]) result[field] = this.instance[field]
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
        this.$emit('data-loaded', object)
        this.originalData = Object.assign({}, object)
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
      if (Object.keys(changedColumns).length) {
        let saveFn = () => {
          Object.keys(changedColumns).forEach(col => {
            if (this.entitySchema.attributes[col] && this.entitySchema.attributes[col].isMultiLang && Object.keys(changedColumns).some(key => key.indexOf(`${col}_`) !== -1)) {
              changedColumns[`${col}_${this.$UB.connection.userLang()}^`] = changedColumns[col]
              delete changedColumns[col]
            }
          })
          changedColumns.ID = this.instance.ID
          if (this.instance.mi_modifyDate) {
            changedColumns.mi_modifyDate = this.instance.mi_modifyDate
          }
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
      this.$dialogYesNo('deletionDialogConfirmCaption',
        this.$ut('deleteFormConfirmCaption', this.instance[this.entitySchema.descriptionAttribute])
      ).then(res => {
        if (!res) {
          this.loading = false
          return
        }
        let request = {
          entity: this.entitySchema.name,
          method: 'delete',
          execParams: {
            ID: this.instance.ID
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
  /** start loading form data from remote in case it's not passed */
  beforeMount () {
    if (this.instance && Object.keys(this.instance).length) return // instance provided by parent
    let dataP
    this.loading = true
    if (this.instanceId) { // existed record
      dataP = this.$UB.Repository(this.entityName).attrs(this.entityFields).selectById(this.instanceId)
    } else { // create new
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
        return data
      })
      this.isNew = true
    }
    dataP.then(resp => {
      this.originalData = Object.assign({}, resp)
      // this.instance = resp
      // this.$emit('input', resp)
      this.$emit('data-loaded', resp)
    }).finally(() => {
      this.loading = false
    })
  },

  mounted () {
    this.currentTab.on('beforeClose', function () {
      if (!this.currentTab.forceClose && Object.keys(this.changedColumns).length > 0) {
        $App.viewport.centralPanel.setActiveTab(this.currentTab)
        this.$dialog({
          title: this.$ut('unsavedData'),
          msg: this.$ut('confirmSave'),
          type: 'warning',
          buttons: {
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
