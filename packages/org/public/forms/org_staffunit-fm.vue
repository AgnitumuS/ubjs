<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />
    <u-form-container label-position="top">
      <el-tabs v-model="activeTabName">
        <el-tab-pane
          :label="$ut('General')"
          name="general"
        >
          <u-grid>
            <u-auto-field attribute-name="parentID" />
            <u-form-row
              attribute-name="professionID"
            >
              <u-select-entity
                v-model="professionID"
                entity-name="org_profession"
                @input="setNameByProfession"
              />
            </u-form-row>
            <u-auto-field attribute-name="staffUnitTypeID" />
            <u-auto-field attribute-name="professionExtID" />
            <u-auto-field attribute-name="code" />
            <u-auto-field attribute-name="name" />
            <u-auto-field attribute-name="fullName" />
            <u-auto-field attribute-name="description" />
            <u-auto-field attribute-name="subordinationLevel" />
            <u-auto-field
              attribute-name="isBoss"
            />
          </u-grid>
          <slot name="slotForExtending">
            <u-table-entity
                v-if="ID"
                :repository="employeeOnStaffRepo"
                :columns="['staffUnitID.name', 'employeeID.fullFIO', 'employeeOnStaffType', 'mi_dateFrom', 'mi_dateTo']"
                :build-edit-config="getConfig"
                :build-add-new-config="getConfig"
                :before-add-new="saveParentBeforeAddNew"
            />
          </slot>
        </el-tab-pane>

        <el-tab-pane
          :label="$ut('cases')"
          name="cases"
        >
          <u-grid class="u-form-max-width">
            <u-auto-field attribute-name="nameGen" />
            <u-auto-field attribute-name="fullNameGen" />
            <u-auto-field attribute-name="nameDat" />
            <u-auto-field attribute-name="fullNameDat" />
          </u-grid>
        </el-tab-pane>
      </el-tabs>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapState, mapGetters } = require('vuex')
const fieldList = [
  'ID', 'parentID', 'professionID', 'staffUnitTypeID', 'professionExtID', 'code', 'name', 'fullName',
  'description', 'subordinationLevel', 'isBoss', 'nameGen', 'nameDat', 'fullNameGen', 'fullNameDat'
]

const buildFormMountFunction = function (cfg) {
  Form({
    ...cfg,
    title: '{code} {name}'
  })
      .processing({
        masterFieldList: fieldList
      })
      .validation()
      .mount()
}

module.exports.mount = cfg => buildFormMountFunction(cfg)

module.exports.default = {
  name: 'org_staffunit',
  inject: ['entity', '$v'],
  data () {
    return {
      activeTabName: 'general'
    }
  },

  computed: {
    ...mapInstanceFields(fieldList),
    ...mapState(['isNew']),
    ...mapGetters(['loading', 'canSave'])
  },

  watch: {
    name (value) {
      this.$store.commit('SET_DATA', { key: 'fullName', value })
      this.$store.commit('SET_DATA', { key: 'nameGen', value })
      this.$store.commit('SET_DATA', { key: 'nameDat', value })
    },

    fullName (value) {
      this.$store.commit('SET_DATA', { key: 'fullNameGen', value })
      this.$store.commit('SET_DATA', { key: 'fullNameDat', value })
    }
  },

  methods: {
    setNameByProfession (value, option) {
      if (option && option.name) {
        this.$store.commit('SET_DATA', { key: 'name', value: option.name })
      }
    },

    employeeOnStaffRepo () {
      return this.$UB.Repository('org_employeeonstaff')
        .attrs('ID', 'employeeID.fullFIO', 'mi_dateFrom', 'mi_dateTo', 'employeeOnStaffType',
          'staffUnitID.name')
        .where('staffUnitID', '=', this.ID)
        .misc({
          __mip_recordhistory_all: true,
          __mip_disablecache: true
        })
    },

    getConfig (cfg) {
      return {
        ...cfg,
        parentContext: {
          staffUnitID: this.ID
        }
      }
    },

    async saveParentBeforeAddNew () {
      if (this.isNew || this.canSave) await this.$store.dispatch('save')
    },

    buildFormMountFunction: cfg => buildFormMountFunction(cfg),
    getFieldList: () => fieldList
  }
}
</script>
