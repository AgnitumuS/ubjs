<template>
  <div>
    <div class="auto-form__header">
      Хедер будет тут
    </div>
    <slot></slot>
  </div>
</template>

<script>
  module.exports = {
    name: 'UbEntityEditComponent',
    props: {
      value: Object,
      entityName: String,
      instanceID: Number
    },
    computed: {
      entitySchema () {
        return $App.domainInfo.get(this.entityName)
      }
    },
    mounted () {
      let dataP, isNew = false
      let pageColumns = Object.values(this.entitySchema.attributes).filter((at) => {
        return at.defaultView
      }).map((at) => {
        return at.name
      })
      let fieldList = UB.ux.data.UBStore.normalizeFieldList(this.entityName, pageColumns || [])
      if (this.entitySchema.mixins.mStorage && this.entitySchema.mixins.mStorage.simpleAudit) fieldList.push('mi_createDate')
      if (this.instanceID) {
        dataP = UB.Repository(this.entityName).attrs(fieldList).selectById(this.instanceID).then(function (resp) {
          this.$emit('input', resp)
        }.bind(this))
      } else {
        let parameters = {
          entity: this.entityName,
          fieldList: fieldList
        }
        dataP = $App.connection.addNew(parameters).then(function (result) {
          let data = {}
          result.resultData.fields.forEach((item, key) => {
            data[item] = result.resultData.data[0][key]
          })
          this.$emit('input', data)
        }.bind(this))
        isNew = true
      }
    }
  }
</script>