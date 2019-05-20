<template>
  <div class="ub-form-container">
    <u-toolbar :validation="$v" />
    <u-form v-loading.body="loading">
      <u-auto-field
        v-for="code in fields"
        :key="code"
        :value="$store.state.data[code]"
        :code="code"
        :disabled="parentContext.hasOwnProperty(code)"
        @input="$store.commit('SET_DATA', { key: code, value: $event })"
      />
    </u-form>
  </div>
</template>

<script>
const { validationInjectMixin } = require('../utils/formBoilerplate/validation')
const { mapGetters } = require('vuex')

export default {
  name: 'AutoForm',

  mixins: [validationInjectMixin],
  inject: ['$formServices'],

  props: {
    parentContext: {
      type: Object,
      default () {
        return {}
      }
    }
  },

  computed: {
    fields () {
      return this.entitySchema
        .filterAttribute(attr => attr.defaultView)
        .map(a => a.name)
    },

    ...mapGetters(['entitySchema', 'loading'])
  },

  created () {
    this.$store.watch(
      (state, getters) => ({
        isDirty: getters.isDirty,
        isNew: state.isNew
      }),
      ({ isDirty, isNew }) => {
        let title = this.$store.state.formTitle
        if (isDirty) {
          title = `* ${title}`
        }
        if (isNew) {
          title += ` (${this.$ut('dobavlenie')})`
        }
        this.$formServices.setTitle(title)
      }
    )
  }
}
</script>
