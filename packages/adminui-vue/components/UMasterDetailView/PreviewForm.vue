<template>
  <div
    ref="formContainer"
    v-loading="loading"
  >
    <div />
  </div>
</template>

<script>
export default {
  name: 'PreviewForm',

  props: {
    id: Number,
    entity: String
  },

  data () {
    return {
      loading: false,
      openedFormId: undefined
    }
  },

  watch: {
    id: 'loadForm'
  },

  mounted () {
    this.loadForm(this.id)
  },

  methods: {
    async loadForm (id, prevId) {
      if (this.openedFormId !== undefined) {
        this.openedFormId = undefined
        return
      }
      this.loading = true
      const success = await this.savePreviousForm()
      if (success) {
        this.$UB.core.UBApp.doCommand({
          cmdType: 'showForm',
          entity: this.entity,
          instanceID: id,
          target: this.$refs.formContainer.firstChild
        })
      } else {
        this.openedFormId = id
        this.$emit('cancel-close', prevId)
      }
      this.loading = false
    },

    async savePreviousForm () {
      const formInstance = this.$refs.formContainer.firstChild.__vue__
      if (!formInstance || !formInstance.$store) {
        return true
      }

      const store = formInstance.$store
      if (store.getters.isDirty) {
        const answer = await this.$dialog({
          title: this.$ut('unsavedData'),
          msg: this.$ut('confirmSave'),
          type: 'warning',
          buttons: {
            yes: this.$ut('save'),
            no: this.$ut('doNotSave'),
            cancel: this.$ut('cancel')
          }
        })

        if (answer === 'yes') {
          if ('save' in store._actions) {
            await store.dispatch('save')
            return true
          }
        }

        if (answer === 'cancel') {
          return false
        }
      }
      return true
    }
  }
}
</script>
