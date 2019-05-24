<template>
  <u-select-multiple
    :value="selectedRecords"
    :entity-name="subjectEntityName"
    :disabled="disabled"
    @input="changeCollection"
  />
</template>

<script>
const { mapMutations, mapActions } = require('vuex')

/**
 * The component allows you to bind and decouple collection entries to the master record.
 */
export default {
  name: 'USelectCollection',

  props: {
    /**
     * Subject attribute.
     * Attribute in the target entity for which the collection record is associated with the master record
     */
    subjectAttr: {
      type: String,
      required: true
    },

    /**
     * Name of key what you set in collectionRequests object
     */
    collectionName: {
      type: String,
      required: true
    },

    /**
     * Set disable status
     */
    disabled: Boolean
  },

  data () {
    return {
      isPending: false
    }
  },

  computed: {
    entityName () {
      return this.$store.state.collections[this.collectionName].entity
    },

    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    masterEntityName () {
      return this.$store.getters.entityName
    },

    selectedRecords () {
      return this.$store.state.collections[this.collectionName].items
        .map(i => i.data[this.subjectAttr])
    },

    objectIDName () {
      return this.entitySchema.filterAttribute(a => a.associatedEntity === this.masterEntityName)[0].name
    },

    subjectEntityName () {
      return this.entitySchema.attributes[this.subjectAttr].associatedEntity
    }
  },

  created () {
    this.$store.dispatch('loadCollections', [this.collectionName])
  },

  methods: {
    ...mapMutations([ 'REMOVE_COLLECTION_ITEM' ]),
    ...mapActions(['addCollectionItem']),

    async changeCollection (arr, option, isChecked) {
      if (isChecked) {
        // block addNew request before previous request is pending
        if (!this.isPending) {
          this.isPending = true
          await this.addCollectionItem({
            collection: this.collectionName,
            execParams: {
              [this.subjectAttr]: option,
              [this.objectIDName]: this.$store.state.data.ID
            }
          })
          this.isPending = false
        }
      } else {
        const index = this.selectedRecords.indexOf(option)
        if (index !== -1) {
          this.REMOVE_COLLECTION_ITEM({
            collection: this.collectionName,
            index: index
          })
        }
      }
    }
  }
}
</script>

<docs>
```vue
<template>
  <u-select-collection
    subject-attr="admSubjID"
    collection-name="rightsSubjects"
  />
</template>

<script>
  module.exports.mount = function (params) {
    const masterRequest = UB.connection
      .Repository(params.entity)
      .attrs(fieldList)

    const collectionRequests = {
      rightsSubjects: UB.connection
        .Repository('ubm_navshortcut_adm')
        .attrs('ID', 'instanceID', 'admSubjID')
        .where('instanceID', '=', params.instanceID)
    }

    formBoilerplate({
      params,
      FormComponent: SelectCollectionExample,
      masterRequest,
      collectionRequests
    })

  const SelectCollectionExample = module.exports.default = {
    // component
  }
</script>
```
</docs>
