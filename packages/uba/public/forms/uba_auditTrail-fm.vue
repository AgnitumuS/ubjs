<template>
  <form-root />
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const store = require('./uba_auditTrail/store')

module.exports.mount = cfg => {
  Form(cfg)
    .store(store)
    .processing({
      async inited ({ commit, dispatch }) {
        commit('LOADING', {
          isLoading: true,
          target: 'enrichTableData'
        })
        await dispatch('enrichTableData')
        commit('LOADING', {
          isLoading: false,
          target: 'enrichTableData'
        })
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'AuditForm',
  components: {
    FormRoot: require('./uba_auditTrail/FormRoot.vue').default
  }
}
</script>
