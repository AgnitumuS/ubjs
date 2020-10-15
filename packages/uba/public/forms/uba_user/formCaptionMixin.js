module.exports = {
  inject: [
    '$formServices',
    'entity'
  ],

  watch: {
    formTitle: {
      handler (value) {
        this.$formServices.setTitle(value)
      },
      immediate: true
    }
  },

  computed: {
    formTitle () {
      const entityCaption = this.$ut(this.entity)
      if (this.$store.state.isNew) {
        return entityCaption
      }

      return `${entityCaption}: ${this.$store.state.data.name}`
    }
  }
}
