<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <u-toolbar />

    <u-form-container label-position="top">
      <div class="u-form-max-width">
        <u-grid>
          <u-auto-field attribute-name="code" />
          <u-auto-field attribute-name="name" />
          <u-auto-field attribute-name="orderByAttr" :clearable="false"/>
        </u-grid>
        <u-auto-field attribute-name="description" />

        <u-table-entity
          v-if="ID"
          ref="detailsTable"
          :repository="classifierItemRepository"
          :columns="['code', 'hierarchyLevel', 'parentID', 'name']"
          :build-edit-config="getConfig"
          :build-copy-config="getConfig"
          :build-add-new-config="getConfig"
          :before-add-new="saveParentBeforeAddNew"
        />
      </div>
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapState, mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'CdnClassifier',

  computed: {
    ...mapInstanceFields(['ID', 'orderByAttr']),
    ...mapState(['isNew']),
    ...mapGetters(['loading', 'canSave'])
  },

  watch: {
    orderByAttr () {
      if (this.$refs.detailsTable) {
        this.$refs.detailsTable.$store.dispatch('refresh')
      }
    }
  },

  methods: {
    classifierItemRepository () {
      return this.$UB.connection.Repository('cdn_classifieritem')
        .attrs('ID', 'code', 'hierarchyLevel', 'parentID', 'name')
        .where('classifierID', '=', this.ID)
        .orderBy(this.orderByAttr)
    },

    getConfig (cfg) {
      return {
        ...cfg,
        isModal: true,
        parentContext: {
          classifierID: this.ID
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
