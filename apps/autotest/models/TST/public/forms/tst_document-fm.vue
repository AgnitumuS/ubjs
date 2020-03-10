<template>
  <div class="u-form-layout">
    <u-toolbar>
      <button
        slot="left"
        @click="showDialog"
      >
        Show dialog
      </button>
      <u-toolbar-button
        slot="left"
        @click="verifySignatures"
      >
        Verify PDF signatures
      </u-toolbar-button>
    </u-toolbar>

    <u-form-container>
      <u-auto-field attribute-name="code" :max-width="300"/>

      <u-grid :columns="3">
        <u-auto-field attribute-name="docDate" placeholder="overrides placeholder" label="My custom label"/>
        <u-auto-field attribute-name="incomeDate" />
        <u-auto-field attribute-name="regDate" />
      </u-grid>

      <!--      <u-form-row-->
      <!--        required-->
      <!--        :label="getLabel('category')"-->
      <!--        :error="$v.category.$error"-->
      <!--      >-->
      <!--        <u-select-entity-->
      <!--          v-model="category"-->
      <!--          :entity-name="getEntity('category')"-->
      <!--        />-->
      <!--      </u-form-row>-->

      <!--      <u-form-row-->
      <!--        required-->
      <!--        :label="getLabel('favorites')"-->
      <!--        :error="$v.favorites.$error"-->
      <!--      >-->
      <!--        <u-select-entity-->
      <!--          v-model="favorites"-->
      <!--          :entity-name="getEntity('favorites')"-->
      <!--        />-->
      <!--      </u-form-row>-->

      <!--      <u-form-row-->
      <!--        required-->
      <!--        :label="getLabel('favorites2')"-->
      <!--        :error="$v.favorites2.$error"-->
      <!--      >-->
      <!--        <u-select-entity-->
      <!--          v-model="favorites2"-->
      <!--          :entity-name="getEntity('favorites2')"-->
      <!--        />-->
      <!--      </u-form-row>-->

      <u-auto-field
          attribute-name="description"
          type="textarea"
          resize="none"
          rows="5"
       />
      <u-auto-field attribute-name="docDateTime"/>

      <u-auto-field attribute-name="fileStoreSimple"/>

      <u-grid>
        <u-auto-field attribute-name="person"/>
        <u-auto-field attribute-name="employee"/>
      </u-grid>
    </u-form-container>
  </div>
</template>

<script>
const adminUiVue = require('@unitybase/adminui-vue')

module.exports.mount = function ({ title, entity, instanceID, formCode, rootComponent }) {
  adminUiVue.Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode
  })
    .processing({
      beforeDelete: (store) => {
        console.log(this, store, arguments)
        return $App.dialogYesNo('Confirm', 'Really?')
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  name: 'TstDocument',
  inject: ['$v', 'entitySchema', 'entity'],

  computed: {
    ...adminUiVue.mapInstanceFields([
      'ID',
      'code',
      'docDate',
      'incomeDate',
      'regDate',
      'category',
      'favorites',
      'favorites2',
      'docDateTime',
      'description',
      'fileStoreSimple',
      'person',
      'employee'
    ])
  },

  methods: {
    async verifySignatures () {
      const docBin = await this.$UB.connection.getDocument({
        entity: this.entitySchema.name,
        attribute: 'fileStoreSimple',
        id: this.ID
      }, { resultIsBinary: true })
      const docb64 = await this.$UB.base64FromAny(docBin)
      try {
        const pdfSigner = await $App.pdfSigner()
        await pdfSigner.signOperationStart(docb64)
        try {
          let r = await pdfSigner.validateAllSignatures()
          let pki = await this.$UB.connection.pki()
          await pki.verificationUI(r.validationResults, r.reasons)
        } finally {
          await pdfSigner.signOperationEnd()
        }
      } catch (e) {
        this.$dialogError(e.message)
        throw e
      }
    },
    showDialog () {
      // line below is for testing purpose
      // better to use this.dialogInfo('uba_user') inside Vue instance
      return adminUiVue.dialogInfo('uba_user')
    }
  }
}
</script>
