<template>
  <u-select-multiple
    :value="selectedRecords"
    :entity-name="subjectEntityName"
    @input="changeCollection"
    :disabled="disabled"
  />
</template>

<script>
const { mapMutations, mapActions } = require('vuex')

export default {
  name: 'USelectCollection',

  props: {
    modelAttr: {
      type: String,
      required: true
    },

    collectionName: {
      type: String,
      required: true
    },

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
        .map(i => i.data[this.modelAttr])
    },

    objectIDName () {
      return this.entitySchema.filterAttribute(a => a.associatedEntity === this.masterEntityName)[0].name
    },

    subjectEntityName () {
      return this.entitySchema.attributes[this.modelAttr].associatedEntity
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
        if (!this.isPending) {
          this.isPending = true
          await this.addCollectionItem({
            collection: this.collectionName,
            execParams: {
              [this.modelAttr]: option,
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
