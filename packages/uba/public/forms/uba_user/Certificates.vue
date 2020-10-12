<template>
  <div>
    <u-button
      icon="u-icon-add"
      color="primary"
      appearance="inverse"
    >
      {{ $ut('actionAdd') }}
    </u-button>

    <u-table
      :items="tableData"
      :columns="columns"
    >
      <template #disabled="{value}">
        <i
          v-if="value === true"
          class="u-icon-add"
        />
        <i
          v-if="value === false"
          class="u-icon-minus"
        />
      </template>

      <template #revoked="{value}">
        <i
          v-if="value === true"
          class="u-icon-add"
        />
        <i
          v-if="value === false"
          class="u-icon-minus"
        />
      </template>
    </u-table>
  </div>
</template>

<script>
export default {
  name: 'Certificates',

  data () {
    return {
      columns: [{
        id: 'issuer_serial',
        label: 'uba_usercertificate.issuer_serial'
      }, {
        id: 'serial',
        label: 'uba_usercertificate.serial'
      }, {
        id: 'description',
        label: 'uba_usercertificate.description'
      }, {
        id: 'disabled',
        label: 'uba_usercertificate.disabled'
      }, {
        id: 'revoked',
        label: 'uba_usercertificate.revoked'
      }]
    }
  },

  computed: {
    tableData () {
      return this.$store.state.collections.certificates.items.map(i => i.data)
    }
  }
}
</script>
