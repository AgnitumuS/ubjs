<template>
  <base-locale-button
    slot="append"
    :load-localized-values="loadValues"
    :is-required="isAttrRequired"
    @change="onDialogClose"
  />
</template>

<script>
const { mapState } = require('vuex')

export default {
  name: 'ULocaleButton',

  components: {
    BaseLocaleButton: require('./UBaseLocaleButton.vue').default
  },

  inject: {
    masterEntityName: {
      from: 'entity'
    },
    masterEntitySchema: {
      from: 'entitySchema'
    }
  },

  props: {
    /**
     * attribute name in entitySchema
     *
     * @returns {string}
     */
    attributeName: {
      type: String,
      required: true
    },

    /**
     * when button is used for a collection item, this is name of the collection in the Vuex store
     *
     * @returns {string}
     */
    collectionName: String,

    /**
     * ID of the detail item, used to load translations for the entity.  Use with "collectionName" property only.
     *
     * @returns {number}
     */
    detailItemId: Number,

    /**
     * if specified, that object will be updated instead of Vuex store.  The property is useful, when
     * attributes edited in a popup form, when  state is not in the Vuex store until user clicks "OK" button,
     * in such a case, entityModel should be bound to the dialog component, which has in its "data" edited state.
     *
     * @returns {object}
     */
    entityModel: Object
  },

  computed: {
    ...mapState({
      masterIsNew: 'isNew'
    }),

    isMasterEntityMode () {
      return this.collectionName === undefined
    },

    isNew () {
      return this.isMasterEntityMode ? this.masterIsNew : this.detailIsNew
    },

    detailIsNew () {
      return !this.detailItemId || !!this.collectionState?.items.find(i => i.data.ID === this.detailItemId)?.isNew
    },

    isLoaded () {
      return this.isMasterEntityMode ? this.isMasterLoaded : this.isDetailLoaded
    },

    isMasterLoaded () {
      return this.getIsLoaded(this.$store.state.data)
    },

    isDetailLoaded () {
      return this.getIsLoaded(this.detailItem)
    },

    instanceID () {
      return this.isMasterEntityMode ? this.$store.state.data.ID : this.detailItemId
    },

    entityName () {
      return this.isMasterEntityMode ? this.masterEntityName : this.collectionState.entity
    },

    /**
     * Collection structure from the "processing" Vuex store module
     *
     * @returns {object}
     */
    collectionState () {
      return this.$store.state?.collections[this.collectionName]
    },

    detailItem () {
      return this.collectionState?.items.find(i => i.data.ID === this.detailItemId)?.data
    },

    userLang () {
      return this.$UB.connection.userLang()
    },

    /**
     * Array of attribute infos for all translations, i.e. all languages except the user language.
     * Attributes have language suffixes.
     *
     * @returns {{attr: string, lang: string}[]}
     */
    localeAttrs () {
      return this.$UB.connection.appConfig.supportedLanguages
        .filter(l => l !== this.userLang)
        .map(lang => ({
          attr: `${this.attributeName}_${lang}^`,
          lang
        }))
    },

    /**
     * Array of attribute infos for all languages, including the current user language.
     * The current user language is specified without suffix, other languages have language suffix.
     *
     * @returns {{attr: string, lang: string}[]}
     */
    attrs () {
      return [
        {
          attr: this.attributeName,
          lang: this.userLang
        },
        ...this.localeAttrs
      ]
    },

    isAttrRequired () {
      if (this.isMasterEntityMode) {
        return this.masterEntitySchema.attributes[this.attributeName].allowNull === false
      }

      const entityTypeName = this.collectionState.entity
      return this.$UB.connection.domain.get(entityTypeName).attributes[this.attributeName].allowNull === false
    }
  },

  methods: {
    async loadValues () {
      if (!this.isLoaded && !this.isNew) {
        await this.fetchTranslations()
      }

      const currentLangValue = this.getAttrValue(this.attributeName)

      return this.attrs.map(item => {
        const currentValue = this.getAttrValue(item.attr)
        return ({
          ...item,
          value: this.isNew && currentValue == null && item.lang !== this.userLang ? currentLangValue : currentValue
        })
      })
    },

    async fetchTranslations () {
      const data = await this.$UB.Repository(this.entityName)
        .attrs(['ID', ...this.localeAttrs.map(a => a.attr)])
        .selectById(this.instanceID)

      if (!data) {
        return
      }

      delete data.ID

      if (this.isMasterEntityMode) {
        this.$store.commit('LOAD_DATA_PARTIAL', data)
        return
      }

      const detailItemIndex = this.collectionState?.items.findIndex(i => i.data.ID === this.detailItemId)
      this.$store.commit('LOAD_COLLECTION_PARTIAL', {
        collection: this.collectionName,
        index: detailItemIndex,
        loadedState: data
      })
    },

    getAttrValue (attr) {
      // Priority is getting value from explicitly specified entityModel object.
      // If value is not present in the entity model, get it from the store, because of lazy-load nature of
      // the translations.
      if (this.entityModel && this.entityModel[attr] != null) {
        return this.entityModel[attr]
      }

      if (this.isMasterEntityMode) {
        return this.$store.state.data[attr]
      }

      return this.detailItem ? this.detailItem[attr] : null
    },

    onDialogClose (nameLocaleValues) {
      this.$emit('change', nameLocaleValues)
      if (this.entityModel !== undefined) {
        this.updateEntityModel(nameLocaleValues)
      } else if (this.collectionName === undefined) {
        this.updateStore(nameLocaleValues)
      }
    },

    updateStore (nameLocaleValues) {
      for (const attr of Object.keys(nameLocaleValues)) {
        const value = nameLocaleValues[attr]
        if (value) {
          this.$store.commit('SET_DATA', {
            key: attr,
            value
          })
        }
      }
    },

    updateEntityModel (nameLocaleValues) {
      if (this.entityModel !== undefined) {
        for (const key of Object.keys(nameLocaleValues)) {
          // eslint suppression reason: this is the easiest way of providing value to the modal dialogs,
          // where entity is edited.

          // eslint-disable-next-line
          this.entityModel[key] = nameLocaleValues[key]
        }
      }
    },

    getIsLoaded (model) {
      return model && this.localeAttrs.some(item => model[item.attr] !== undefined)
    }
  }
}
</script>
