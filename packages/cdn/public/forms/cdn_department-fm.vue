<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />

    <u-form-container label-position="top">
      <el-tabs>
        <el-tab-pane :label="$ut('General')">
          <div class="u-form-max-width">
            <u-grid>
              <u-auto-field attribute-name="organizationID" />
              <u-auto-field attribute-name="name" />
              <u-auto-field attribute-name="depTypeID" />
              <u-auto-field attribute-name="fullName" />
              <u-auto-field attribute-name="code" />
              <u-auto-field attribute-name="description" />
            </u-grid>

            <u-table-entity
              v-if="ID"
              :repository="contactsRepository"
              :columns="['contactTypeID', 'value']"
              :build-edit-config="getConfig"
              :build-add-new-config="getConfig"
              :before-add-new="saveParentBeforeAddNew"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$ut('cases')">
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

module.exports.mount = cfg => {
  Form({
    ...cfg,
    title: '{code} {name}'
  })
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'CdnDepartment',

  computed: {
    ...mapInstanceFields(['ID', 'name', 'fullName']),
    ...mapState(['isNew']),
    ...mapGetters(['loading', 'canSave'])
  },

  watch: {
    name (value, prevValue) {
      if (prevValue === this.fullName) {
        this.$store.commit('SET_DATA', { key: 'fullName', value })
      }
    }
  },

  methods: {
    contactsRepository () {
      return this.$UB.connection.Repository('cdn_contact')
        .attrs('ID', 'contactTypeID', 'value')
        .where('subjectID', '=', this.ID)
    },

    getConfig (cfg) {
      return {
        ...cfg,
        isModal: true,
        parentContext: {
          subjectID: this.ID
        }
      }
    },

    async saveParentBeforeAddNew () {
      if (this.isNew || this.canSave) {
        await this.$store.dispatch('save')
      }
    }
  }
}
</script>
