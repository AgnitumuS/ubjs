<template>
  <div class="ub-form-container">
    <u-toolbar />

    <u-form-container v-loading.body="loading">
      <u-auto-field
        v-for="code in fields"
        :key="code"
        :value="$store.state.data[code]"
        :code="code"
        :disabled="parentContext.hasOwnProperty(code)"
        @input="$store.commit('SET_DATA', { key: code, value: $event })"
      />
    </u-form-container>
  </div>
</template>

<script>
const { mapGetters } = require('vuex')

export default {
  name: 'AutoForm',
  inject: ['entitySchema'],

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

    ...mapGetters(['loading'])
  }
}
</script>
