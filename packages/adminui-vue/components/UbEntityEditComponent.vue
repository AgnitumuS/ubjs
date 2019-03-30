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
      :is-dirty="isDirty"
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
    parentContext: Object,
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
    isDirty () {
      return Object.keys(this.changedColumns).length > 0
    }
  },
  methods: {
    saveAndReload () {
      this.loading = true
      this.saveChanges().then(newData => {
        this.$emit('data-loaded', newData)
        this.originalData = Object.assign({}, newData)
      }).finally(() => {
        this.loading = false
      })
    },
    saveAndClose () {
      this.loading = true
      this.saveChanges().then(() => {
        let tab = this.currentTab
        if (tab) {
          tab.forceClose = true
          tab.close()
        } else {
          // we are inside dialog - search for it
          let d = this.$parent
          while (typeof d !== 'undefined' && typeof d.dialogVisible === 'undefined') d = d.$parent
          if (d) d.dialogVisible = false
        }
      }).finally(() => {
        this.loading = false
      })
    },
    /** Save changes to server
     * @return {Promise<Boolean|Object>} False in case data is not modified, otherwise - new data
     */
    saveChanges () {
      let changedColumns = Object.assign({}, this.changedColumns)
      if (!this.isDirty) return Promise.resolve(false) // no changes

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
      return this.$UB.connection.update(params)
        .then((result) => {
          this.$UB.connection.emit(`${this.entitySchema.name}:changed`, result.execParams.ID)
          this.$UB.connection.emit(`${this.entitySchema.name}:${this.isNew ? 'insert' : 'update'}`, result.execParams.ID)
          let newData = {}
          let resultData = result.resultData
          resultData.data[0].forEach((item, index) => {
            newData[resultData.fields[index]] = item
          })
          return newData
        }).finally(() => {
          this.loading = false
        })
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
      if (this.parentContext) {
        parameters.execParams = this.parentContext
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
      if (!this.isNew) {
        this.originalData = Object.assign({}, resp)
      }
      // this.instance = resp
      // this.$emit('input', resp)
      this.$emit('data-loaded', resp)
    }).finally(() => {
      this.loading = false
    })
  },
  components: {
    toolbar
  }
}
</script>
