<template>
  <div
    v-loading="loading"
    class="u-form-layout"
  >
    <div />
    <u-form-container label-position="top">
      <u-form-row :label="`${masterEntity}.entity`">
        <span class="uba-audit__field-text">{{ entity }} ({{ $ut(entity) }})</span>
      </u-form-row>

      <u-grid>
        <u-form-row :label="`${masterEntity}.actionType`">
          <span class="uba-audit__field-text">{{ actionType }}</span>
        </u-form-row>

        <u-form-row :label="`${masterEntity}.actionUser`">
          <span class="uba-audit__field-text">{{ actionUserName }} ({{ actionUser }})</span>
        </u-form-row>
      </u-grid>

      <u-grid>
        <u-form-row :label="`${masterEntity}.remoteIP`">
          <span class="uba-audit__field-text">{{ remoteIP }}</span>
        </u-form-row>

        <u-form-row :label="`${masterEntity}.actionTime`">
          <span class="uba-audit__field-text">{{ $UB.formatter.formatDate(actionTime, 'dateTimeFull') }}</span>
        </u-form-row>
      </u-grid>

      <div class="audit-diff-title">
        {{ $ut('changedAttributes') }}:
      </div>
      <diff-table />
    </u-form-container>
  </div>
</template>

<script>
const { mapGetters } = require('vuex')
const { mapInstanceFields } = require('@unitybase/adminui-vue')

export default {
  name: 'AuditFormRoot',

  components: {
    DiffTable: require('./DiffTable.vue').default
  },

  inject: {
    masterEntity: 'entity'
  },

  computed: {
    ...mapGetters(['loading']),

    ...mapInstanceFields([
      'entity',
      'actionUserName',
      'actionUser',
      'remoteIP',
      'actionTime'
    ]),

    actionType () {
      return this.$lookups.get('ubm_enum', {
        eGroup: this.$UB.connection.domain.get(this.masterEntity).attributes.actionType.enumGroup,
        code: this.$store.state.data.actionType
      })
    }
  }
}
</script>

<style>
.audit-diff-title {
  font-size: 18px;
  margin-bottom: 4px;
  color: hsl(var(--hs-text), var(--l-text-default));
  margin-top: 20px;
}

.uba-audit__field-text {
  color: hsl(var(--hs-text), var(--l-text-default));
}
</style>
