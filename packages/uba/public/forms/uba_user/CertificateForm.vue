<template>
  <u-form-container v-loading="loading">
    <u-form-row
      v-if="isNew"
      :label="buildLabel('certificate')"
    >
      <u-file-input
        accept=".cer"
        @input="uploadCertificate"
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

      <u-form-row :label="buildLabel('issuer_serial')">
        {{ modifiedRow.issuer_serial }}
      </u-form-row>
      <u-form-row :label="buildLabel('serial')">
        {{ modifiedRow.serial }}
      </u-form-row>
      <u-form-row
        v-if="modifiedRow.revocationDate"
        :label="buildLabel('revocationDate')"
      >
        {{ $formatByPattern.formatDate(modifiedRow.revocationDate, 'dateTime') }}
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
    </template>

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
/* global SystemJS */
const {
  entityName: certificateEntity,
  fieldList: certificateCollectionFieldList
} = require('./certificateCollectionDefinition')

export default {
  name: 'CertificateForm',
  props: {
    row: {
      type: Object,
      required: true
    },
    done: {
      type: Function,
      required: true
    }
  },

  data () {
    return {
      modifiedRow: {},
      loading: false
    }
  },

  computed: {
    isNew () {
      return this.modifiedRow.ID === undefined
    }
  },

  created () {
    this.$set(this, 'modifiedRow', { ...this.row })
  },

  methods: {
    async downloadCert () {
      const data = await this.$UB.connection.query({
        entity: certificateEntity,
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

    /**
     * @param {string} type
     * @return {string}
     */
    getCertType (type) {
      switch (type) {
        case '2.5.4.10': return 'O'
        case '2.5.4.11': return 'OU'
        case '2.5.4.12': return 'T'
        case '2.5.4.3': return 'CN'
        case '2.5.4.4': return 'SN'
        case '2.5.4.41': return 'NAME'
        case '2.5.4.31': return 'MEMBER'
        case '2.5.4.42': return 'G'
        case '2.5.4.43': return 'I'
        case '2.5.4.5': return 'SERIALNUMBER'
        case '2.5.4.20': return 'TELEPHONENUMBER'
        case '2.5.4.6': return 'C'
        case '2.5.4.7': return 'L'
        case '2.5.4.8': return 'S'
        case '2.5.4.9': return 'STREET'
        case '1.2.840.113549.1.9.1': return 'E-MAIL'
        case '2.5.4.16': return 'POSTALADDRESS'
        case '2.5.4.17': return 'POSTALCODE'
        case '2.5.4.26': return 'REGISTEREDADDRESS'

        default: return type
      }
    },

    /**
     * @param {File} file
     * @return {Promise<{
     *   issuer_serial: string,
     *   serial: string,
     *   description: string
     * }>}
     */
    getCertificateData  (file) {
      function walk (schema, searchCode, callback) {
        if (schema.valueBlock) {
          if (schema.valueBlock.toString() === searchCode) {
            callback(schema)
            return false
          } else {
            if (Array.isArray(schema.valueBlock.value)) {
              return schema.valueBlock.value
                .every(schema => walk(schema, searchCode, callback))
            }
          }
        }
        return true
      }

      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const certBuff = reader.result
          const [asn1js, { default: Certificate }] = await Promise.all([
            SystemJS.import('asn1js'),
            SystemJS.import('pkijs/build/Certificate.js')
          ])
          const { result: certificateSchema } = asn1js.fromBER(certBuff)
          // skip PrivateKeyUsagePeriod 2.5.29.16
          walk(
            certificateSchema,
            '2.5.29.16',
            el => { el.valueBlock.value[2].valueDec = 64 }
          )
          const certificate = new Certificate({ schema: certificateSchema })
          const subject = certificate.subject.typesAndValues
            .map(e => this.getCertType(e.type) + '=' + e.value.valueBlock.value)
            .join(', ')

          const issuer = certificate.issuer.typesAndValues
            .map(e => this.getCertType(e.type) + '=' + e.value.valueBlock.value)
            .join(', ')

          const bytesArr = new Uint8Array(certificate.serialNumber.valueBlock.valueHex)
          const serial = Array.from(bytesArr).map(value => {
            const number16 = Number(value).toString(16).toUpperCase()
            if (number16.length === 1) {
              return '0' + number16
            }
            return number16
          }).join('')

          resolve({
            issuer_serial: issuer,
            serial,
            description: subject
          })
        }
        reader.readAsArrayBuffer(file)
      })
    },

    /**
     * @param {File} file
     * @return {Promise<{certificate: string}>}
     */
    async getCertificate (file) {
      const certBase64 = await UB.base64FromAny(file)
      return { certificate: certBase64 }
    },

    /**
     * @param {File} file
     * @return {Promise<{
     *   certificate: string,
     *   issuer_serial: string,
     *   serial: string,
     *   description: string
     * }>}
     */
    async parseCertificateFile (file) {
      const certData = {}
      const certDataParts = await Promise.all([
        this.getCertificateData(file),
        this.getCertificate(file)
      ])

      Object.assign(certData, ...certDataParts)

      return certData
    },

    /**
     * @param {File[]} files
     * @return {Promise<void>}
     */
    async uploadCertificate (files) {
      this.loading = true
      const certData = await this.parseCertificateFile(files[0])

      const item = await UB.connection.addNewAsObject({
        entity: certificateEntity,
        fieldList: certificateCollectionFieldList,
        execParams: {
          ...this.modifiedRow,
          ...certData
        }
      })
      this.$set(this, 'modifiedRow', item)
      this.loading = false
    },

    /**
     * @param {string} attribute
     * @return {string}
     */
    buildLabel (attribute) {
      return this.$ut(`${certificateEntity}.${attribute}`)
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
