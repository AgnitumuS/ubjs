<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading.body="loading"
      label-position="top"
      :max-width="800"
    >
      <u-auto-field
        attribute-name="caption"
        disabled
      />
      <u-form-row
        required
        :label="`${entity}.parentAdminUnitID`"
        :error="$v.parentAdminUnitID.$error"
      >
        <u-select-entity
          v-model="parentAdminUnitID"
          :repository="getParentAdminUnitRepo"
        />
      </u-form-row>
      <u-auto-field attribute-name="code" />
      <u-auto-field attribute-name="name" />
      <u-auto-field attribute-name="description" />
      <u-auto-field attribute-name="postalCode" />
      <u-auto-field attribute-name="phoneCode" />
      <u-auto-field attribute-name="cityTypeID" />
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'CdnCity',
  inject: ['$v', 'entity'],

  computed: {
    ...mapInstanceFields(['parentAdminUnitID']),
    ...mapGetters(['loading'])
  },

  methods: {
    getParentAdminUnitRepo () {
      return this.$UB.Repository('cdn_adminunit')
        .attrs('ID', 'name', 'adminUnitType')
        .where('adminUnitType', 'in', ['DISTRICT', 'COUNTRY'])
    }
  }
}
</script>
