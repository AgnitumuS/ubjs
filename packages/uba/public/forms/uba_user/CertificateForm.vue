<template>
  <u-form-container>
    <u-form-row
      v-if="isNew"
      label="uba_usercertificate.certificate"
    >
      <u-file-input /> <!--TODO: upload with "accept", then assign with modifiedRow -->
    </u-form-row>

    <template v-else>
      <u-form-row label="uba_usercertificate.certificate">
        <u-button
          color="primary"
          icon="el-icon-download"
        >
          {{ $ut('downloadAttach') }} <!--TODO: download file -->
        </u-button>
      </u-form-row>

      <u-form-row label="uba_usercertificate.issuer_serial">
        <u-base-input
          :value="modifiedRow.issuer_serial"
          readonly
        />
      </u-form-row>
      <u-form-row label="uba_usercertificate.serial">
        <u-base-input
          :value="modifiedRow.serial"
          readonly
        />
      </u-form-row>
      <u-form-row label="uba_usercertificate.description">
        <u-base-input
          v-model="modifiedRow.description"
          type="textarea"
          rows="3"
          resize="none"
        />
      </u-form-row>
      <u-form-row label="uba_usercertificate.disabled">
        <el-switch v-model="modifiedRow.disabled" />
      </u-form-row>
      <u-form-row label="uba_usercertificate.revoked">
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
