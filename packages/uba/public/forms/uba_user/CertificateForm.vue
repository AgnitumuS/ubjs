<template>
  <u-form-container label-position="top">
    <u-form-row
      v-if="isNew"
      label="uba_usercertificate.certificate"
    >
      <u-file-input
        accept=".cer"
        @input="uploadCert"
      />
    </u-form-row>

    <template v-else>
      <u-form-row :label="buildLabel('certificate')">
        <u-button
          color="primary"
          icon="el-icon-download"
          @click="downloadCert"
        >
          {{ $ut('downloadAttach') }}
        </u-button>
      </u-form-row>

      <u-form-row :label="buildLabel('issuer_serial', true)">
        <u-base-input
          :value="modifiedRow.issuer_serial"
          readonly
        />
      </u-form-row>
      <u-form-row :label="buildLabel('issuer', true)">
        <u-base-input
          :value="modifiedRow.serial"
          readonly
        />
      </u-form-row>
      <u-form-row :label="buildLabel('description')">
        <u-base-input
          v-model="modifiedRow.description"
          type="textarea"
          rows="3"
          resize="none"
        />
      </u-form-row>
      <u-form-row :label="buildLabel('disabled')">
        <el-switch v-model="modifiedRow.disabled" />
      </u-form-row>
      <u-form-row :label="buildLabel('revoked', true)">
        <el-switch :value="modifiedRow.revoked" />
        <template v-if="modifiedRow.revoked">
          {{ $formatByPattern.formatDate(modifiedRow.revocationDate, 'dateTime') }}
        </template>
      </u-form-row>
    </template>

    <pre> <!--TODO: remove-->
      {{ modifiedRow }}
    </pre>

    <div class="certificate-form__footer">
      <u-button
        appearance="plain"
        @click="done()"
      >
        {{ $ut('Cancel') }}
      </u-button>
      <u-button
        color="primary"
        @click="done(modifiedRow)"
      >
        {{ $ut('Save') }}
      </u-button>
    </div>
  </u-form-container>
</template>

<script>
export default {
  name: 'CertificateForm',
  props: {
    row: Object,
    done: Function
  },

  data () {
    return {
      modifiedRow: {}
    }
  },

  computed: {
    isNew () {
      return this.modifiedRow.ID === undefined
    }
  },

  created () {
    for (const [key, value] of Object.entries(this.row)) {
      this.$set(this.modifiedRow, key, value)
    }
  },

  methods: {
    async downloadCert () {
      const data = await this.$UB.connection.query({
        entity: 'uba_usercertificate',
        method: 'getCertificate',
        ID: this.modifiedRow.userID
      })
        .then(UB.LocalDataStore.selectResultToArrayOfObjects)

      const blobData = new Blob(
        [UB.base64toArrayBuffer(data[0].certificate)],
        { type: 'application/x-x509-ca-cert' }
      )
      window.saveAs(blobData, this.modifiedRow.serial + '.cer')
    },

    uploadCert (files) {
      // TODO: upload then assign with modifiedRow
      debugger
    },

    buildLabel (attribute, readonly) {
      let label = this.$ut(`uba_usercertificate.${attribute}`)
      if (readonly) {
        label += ` (${this.$ut('readonly')})` // TODO: add locale for readonly
      }
      return label
    }
  }
}
</script>

<style>
.certificate-form__footer{
  display: grid;
  justify-content: flex-end;
  grid-template-columns: auto auto;
  grid-gap: 12px;
}
</style>
