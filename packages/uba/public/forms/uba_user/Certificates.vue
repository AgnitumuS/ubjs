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
const { mapMutations, mapActions } = require('vuex')
const { createDialog } = require('@unitybase/adminui-vue')
const CertificateForm = require('./CertificateForm.vue').default

export default {
  name: 'Certificates',

  data () {
    return {
      columns: [{
        id: 'actions'
      }, {
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
  },

  methods: {
    ...mapMutations(['ASSIGN_DATA', 'DELETE_COLLECTION_ITEM']),
    ...mapActions(['addCollectionItem']),

    async openCertForm (row) {
      const modifiedRow = await createDialog(CertificateForm, { row })
      if (!modifiedRow) return

      const index = this.tableData.findIndex(predicate => predicate.ID === modifiedRow.ID)
      if (index === -1) {
        this.addCollectionItem({
          collection: 'certificates',
          execParams: modifiedRow
        })
      } else {
        this.ASSIGN_DATA({
          collection: 'certificates',
          index,
          loadedState: modifiedRow
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
        this.$UB.connection.domain.get('uba_usercertificate')
          .haveAccessToMethod(method)
      ))
    }
  }
}
</script>
