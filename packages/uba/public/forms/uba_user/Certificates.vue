<template>
  <div>
    <u-button
      icon="u-icon-add"
      color="primary"
      appearance="inverse"
      :disabled="!haveAccess('addnew', 'insert')"
      @click="openCertForm({
        userID: $store.state.data.ID
      })"
    >
      {{ $ut('actionAdd') }}
    </u-button>

    <u-table
      :items="tableData"
      :columns="columns"
    >
      <template #actions="{row}">
        <u-button-group>
          <u-button
            icon="u-icon-delete"
            color="primary"
            appearance="inverse"
            :disabled="!haveAccess('delete')"
            @click="removeCert(row.ID)"
          />
          <u-button
            icon="u-icon-edit"
            color="primary"
            appearance="inverse"
            :disabled="!haveAccess('insert', 'update')"
            @click="openCertForm(row)"
          />
        </u-button-group>
      </template>
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
const { mapMutations } = require('vuex')
const { createDialog } = require('@unitybase/adminui-vue')
const CertificateForm = require('./CertificateForm.vue').default
const { entityName: certificateEntity } = require('./certificateCollectionDefinition')

export default {
  name: 'Certificates',

  data () {
    return {
      columns: [{
        id: 'actions'
      }, {
        id: 'issuer_serial',
        label: `${certificateEntity}.issuer_serial`
      }, {
        id: 'serial',
        label: `${certificateEntity}.serial`
      }, {
        id: 'description',
        label: `${certificateEntity}.description`
      }, {
        id: 'disabled',
        label: `${certificateEntity}.disabled`
      }, {
        id: 'revoked',
        label: `${certificateEntity}.revoked`
      }]
    }
  },

  computed: {
    tableData () {
      return this.$store.state.collections.certificates.items.map(i => i.data)
    }
  },

  inject: ['inerhitedSlots'],

  methods: {
    ...mapMutations([
      'ASSIGN_DATA',
      'DELETE_COLLECTION_ITEM',
      'ADD_COLLECTION_ITEM'
    ]),

    async openCertForm (row) {
      const resultRow = await createDialog(CertificateForm, { row })
      if (!resultRow) return

      const index = this.tableData.findIndex(predicate => predicate.ID === resultRow.ID)
      if (index === -1) {
        this.ADD_COLLECTION_ITEM({
          collection: 'certificates',
          item: resultRow
        })
      } else {
        this.ASSIGN_DATA({
          collection: 'certificates',
          index,
          loadedState: resultRow
        })
      }
    },

    removeCert (ID) {
      const index = this.tableData.findIndex(predicate => predicate.ID === ID)
      if (index !== -1) {
        this.DELETE_COLLECTION_ITEM({
          collection: 'certificates',
          index
        })
      }
    },

    haveAccess (...methods) {
      return methods.every(method => (
        this.$UB.connection.domain.get(certificateEntity)
          .haveAccessToMethod(method)
      ))
    }
  }
}
</script>
