<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />
    <u-form-container label-position="top">
      <u-form-row
        :label="`${entity}.employeeID`"
        required
        :error="$v.employeeID.$error"
      >
        <u-select-entity
          v-model="employeeID"
          :repository="orgEmployeeRepo"
          @input="onEmployeeIDChange"
        />
      </u-form-row>
      <u-auto-field attribute-name="staffUnitID" />
      <u-auto-field attribute-name="tabNo" />
      <u-auto-field attribute-name="employeeOnStaffType" />
      <u-auto-field attribute-name="description" />
      <u-auto-field
        :label="'mi_dateFrom'"
        attribute-name="mi_dateFrom"
      />
      <u-form-row
        attribute-name="mi_dateTo"
        :label="'mi_dateTo'"
      >
        <u-date-picker
          v-model="mi_dateTo"
          type="datetime"
        />
      </u-form-row>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const fieldList = [
  'ID',
  'employeeID',
  'staffUnitID',
  'staffUnitID.name',
  'employeeID.fullFIO',
  'tabNo',
  'employeeOnStaffType',
  'description',
  'mi_dateFrom',
  'mi_dateTo'
]
const { required } = require('vuelidate/lib/validators/index')
const { mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form({
    ...cfg,
    title: '{tabNo} {employeeID.fullFIO}'
  })
    .processing({
      masterFieldList: fieldList,
      inited (store) {
        if (!cfg.instanceID && cfg.parentContext) {
          store.commit('ASSIGN_DATA', { loadedState: cfg.parentContext })
        }
      }
    })
    .validation({
      computed: {
        ...mapInstanceFields(['employeeID', 'staffUnitID', 'employeeOnStaffType', 'mi_dateFrom'])
      },

      validations () {
        return {
          employeeID: { required },
          employeeOnStaffType: { required },
          staffUnitID: { required },
          mi_dateFrom: { required }
        }
      }
    })
    .mount()
}

module.exports.default = {
  name: 'org_employeeonstaff',
  inject: ['entity', '$v'],

  computed: {
    ...mapInstanceFields(fieldList),
    ...mapGetters(['loading']),

    mi_dateTo: {
      get () {
        if (this.$store.state.data.mi_dateTo?.getFullYear() === 9999) {
          return null
        }
        return this.$store.state.data.mi_dateTo
      },
      set (value) {
        this.$store.commit('SET_DATA', { key: 'mi_dateTo', value })
      }
    }
  },

  methods: {
    orgEmployeeRepo () {
      return this.$UB.Repository('org_employee').attrs('ID', 'code', 'fullFIO')
    },

    onEmployeeIDChange (value, option) {
      if (option && option.code) {
        this.$store.commit('SET_DATA', { key: 'tabNo', value: option.code })
      }
    }
  }
}
</script>
