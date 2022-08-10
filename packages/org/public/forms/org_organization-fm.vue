<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />
    <u-form-container label-position="top">
      <el-tabs>
        <el-tab-pane :label="$ut('General')">
          <u-grid class="u-form-max-width">
            <u-auto-field attribute-name="code" />
            <u-auto-field attribute-name="name" />
            <u-auto-field
              attribute-name="OKPOCode"
              :required="isOKPORequired"
            />
            <u-auto-field attribute-name="fullName" />
            <u-auto-field attribute-name="taxCode" />
            <u-auto-field attribute-name="vatCode" />
            <u-auto-field attribute-name="description" />
            <u-auto-field attribute-name="parentID" />
            <u-auto-field attribute-name="orgBusinessTypeID" />
            <u-auto-field attribute-name="orgOwnershipTypeID" />
          </u-grid>
        </el-tab-pane>
        <el-tab-pane :label="$ut('cases')">
          <u-grid class="u-form-max-width">
            <u-auto-field attribute-name="nameGen" />
            <u-auto-field attribute-name="nameDat" />
            <u-auto-field attribute-name="fullNameGen" />
            <u-auto-field attribute-name="fullNameDat" />
          </u-grid>
        </el-tab-pane>
      </el-tabs>
    </u-form-container>
  </div>
</template>

<script>
const { Repository } = require('@unitybase/ub-pub')
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')
const { requiredIf } = require('vuelidate/lib/validators/index')

module.exports.mount = cfg => {
  Form({
    ...cfg,
    title: '{code} {name}'
  })
    .processing({
      async inited ({ commit }) {
        const OKPOSettings = await Repository('ubs_settings')
          .attrs('settingValue', 'defaultValue')
          .where('settingKey', '=', 'org.organization.OKPORequired')
          .selectSingle()

        commit('SET', { key: 'OKPORequired', value: OKPOSettings ? OKPOSettings.settingValue === 'true' : false })
      }
    })
    .validation({
      validations () {
        return {
          OKPOCode: {
            required: requiredIf(() => {
              return this.$store.state.OKPORequired
            })
          }
        }
      }
    })
    .mount()
}

module.exports.default = {
  name: 'orgOrganization',
  computed: {
    ...mapInstanceFields(['name', 'fullName']),
    ...mapGetters(['loading']),

    isOKPORequired () {
      return this.$store.state.OKPORequired
    }
  },

  watch: {
    name (value, prevValue) {
      this.$store.commit('SET_DATA', { key: 'nameGen', value })
      this.$store.commit('SET_DATA', { key: 'nameDat', value })
      if (prevValue === this.fullName) {
        this.$store.commit('SET_DATA', { key: 'fullName', value })
        this.$store.commit('SET_DATA', { key: 'fullNameGen', value })
        this.$store.commit('SET_DATA', { key: 'fullNameDat', value })
      }
    },
    fullName (value) {
      this.$store.commit('SET_DATA', { key: 'fullNameGen', value })
      this.$store.commit('SET_DATA', { key: 'fullNameDat', value })
    }
  }
}
</script>
