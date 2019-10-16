<template>
  <div class="ub-form-container">
    <u-toolbar />

    <el-alert
      v-show="formCrashed"
      :title="$ut('formCrashTitle')"
      type="error"
      :description="$ut('formCrashBody')"
      show-icon
      :closable="false"
    />
    <u-form-container
      v-loading="loading || formCrashed"
      :label-width="160"
    >
      <u-grid
        :repository="rep"
      />
    </u-form-container>
  </div>
</template>

<script>
const { Form, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapState, mapGetters } = require('vuex')
const UB = require('@unitybase/ub-pub')
const LazyCollection = require('../components/LazyCollection.vue').default

module.exports.mount = function ({ title, entity, instanceID, formCode, rootComponent, isModal }) {
  Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode,
    isModal
  })
    .instance()
    .processing({
      collections: {
        todo: {
          repository: ({ state }) => UB.connection
            .Repository('tst_dictionary_todo')
            .attrs('ID', 'objectID', 'name', 'status', 'link')
            .where('objectID', '=', state.data.ID),
          lazy: true
        },

        participants: ({ state }) => UB.connection
          .Repository('tst_dictionary_ppt')
          .attrs('ID', 'objectID', 'subjectID')
          .where('objectID', '=', state.data.ID)
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'TstDictionary',
  components: { LazyCollection },

  inject: ['$v', 'entity'],

  methods: {
    rep () {
      return this.$UB.Repository('tst_maindata')
        .attrs(
          this.$UB.connection.domain.get('tst_maindata')
            .filterAttribute(a => a.defaultView)
            .map(a => a.code)
        )
    }
  },

  computed: {
    ...mapInstanceFields([
      'ID',
      'caption',
      'filterValue',
      'currencyValue',
      'floatValue',
      'intValue',
      'calculated',
      'booleanColumn',
      'jsonColumn'
    ]),

    ...mapGetters(['loading']),

    ...mapState(['formCrashed'])
  }
}
</script>
