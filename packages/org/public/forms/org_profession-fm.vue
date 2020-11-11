<template>
  <div class="u-form-layout">
    <u-toolbar />
    <u-form-container label-position="top">
      <el-tabs v-model="activeTabName">
        <el-tab-pane
          :label="$ut('General')"
          name="general"
        >
          <u-auto-field attribute-name="name" />
          <u-auto-field attribute-name="fullName" />
          <u-auto-field attribute-name="code" />
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
module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'org_profession',
  data () {
    return {
      activeTabName: 'general'
    }
  },

  computed: {
    ...mapInstanceFields(['ID', 'code', 'name', 'fullName', 'nameGen', 'nameDat', 'fullNameGen',
      'fullNameDat'])
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
  }
}

</script>
