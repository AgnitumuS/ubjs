<template>
  <div class="u-table">
    <table>
<!--      <tr>-->
<!--        <th :colspan="sigCaptions.length ? 4: 3"> {{ VRi18n.signingTime }} </th>-->
<!--        <th> {{ VRi18n.signatureAuthor }} </th>-->
<!--      </tr>-->
      <template
        v-for="(vr, vIdx) in verificationResults"
      >
        <tr
          :key="'c' + vIdx"
          @click="toggleRow(vIdx)"
        >
          <td style="cursor: pointer">
            <i :class="detailsOpened[vIdx] ? 'fa fa-chevron-up': 'fa fa-chevron-down'" />
          </td>
          <td
            v-if="sigCaptions.length"
            v-html="sigCaptions[vIdx]"
          >
          </td>
          <td>
            <el-tooltip
              :content="statusTip(vIdx, false)"
              placement="right"
            >
              <i
                class="fas fa-file-signature"
                :style="statusStyle(vIdx)"
              />
            </el-tooltip>
          </td>
          <td> {{ $moment(vr.signingTime).format('L HH:MM') }} </td>
          <td> {{ vr.subject.fullName }} </td>
        </tr>
        <template v-if="detailsOpened[vIdx] === true">
          <tr :key="'d' + vIdx">
            <td :colspan="sigCaptions.length ? 5 : 4">
              <h4>{{ VRi18n.signatureStatus }}</h4>
              <p :style="statusStyle(vIdx)" v-html="statusTip(vIdx, true)" />
              <h4>{{ VRi18n.signatureAuthor }}</h4>
              <p>
                {{ VRi18n.certificate.subject._ }}
                <ul>
                  <li
                    v-for="(prop, idx) in Object.keys(vr.subject)"
                    :key="idx"
                  >
                    <span class="signature-verify-result_info">{{ VRi18n.certificate.subject[prop] }}:</span> {{ vr.subject[prop] }}
                  </li>
                </ul>
              </p>
              <p v-if="vr.organization.orgName">
                {{ VRi18n.certificate.organization._ }}
                <ul>
                  <li
                    v-for="(prop, idx) in Object.keys(vr.organization)"
                    :key="idx"
                  >
                    <span class="signature-verify-result_info">{{ VRi18n.certificate.organization[prop] }}:</span> {{ vr.organization[prop] }}
                  </li>
                </ul>
              </p>
              <p>
                {{ VRi18n.certificate._ }}
                <ul>
                  <li
                    v-for="(prop, idx) in Object.keys(vr.certificate)"
                    :key="idx"
                  >
                    <template v-if="prop === 'issuedBy'">
                      <span class="signature-verify-result_info">{{ VRi18n.certificate.issuedBy._ }}:</span>
                      <ul>
                        <li
                          v-for="(prop, idx) in Object.keys(vr.certificate.issuedBy)"
                          :key="idx"
                        >
                          <span class="signature-verify-result_info">{{ VRi18n.certificate.issuedBy[prop] }}:</span> {{ vr.certificate.issuedBy[prop] }}
                        </li>
                      </ul>
                    </template>
                    <template v-else>
                      <span class="signature-verify-result_info">{{ VRi18n.certificate[prop] }}:</span>
                      {{ (vr.certificate[prop] instanceof Date) ? $moment(vr.certificate[prop]).format('L') : vr.certificate[prop] }}
                    </template>
                  </li>
                </ul>
              </p>
            </td>
          </tr>
        </template>
      </template>
    </table>
  </div>
</template>

<style>
  .signature-verify-result_info {
    color: rgb(var(--info-light))
  }
</style>
<script>
export default {
  name: 'SignatureVerificationResult',
  props: {
    /**
     * @type {Array<SignatureValidationResult>}
     */
    verificationResults: {
      type: Array,
      default: () => []
    },
    /**
     * @type {Array<string>}
     */
    sigCaptions: {
      type: Array,
      default: () => []
    }
  },
  data: () => {
    return {
      detailsOpened: []
    }
  },
  beforeMount () {
    this.VRi18n = this.$ut('SignatureVerificationResultObj')
  },
  methods: {
    toggleRow (vIdx) {
      this.$set(this.detailsOpened, vIdx, !this.detailsOpened[vIdx])
    },
    statusStyle (vIdx) {
      let r = this.verificationResults[vIdx]
      if (!r.valid) return 'color: rgba(var(--danger), 1);'
      if (r.valid && r.tspValid && r.ocspVerified) return 'color: rgba(var(--success), 1);'
      return 'color: rgba(var(--warning), 1);'
    },
    statusTip (vIdx, isHTML) {
      let r = this.verificationResults[vIdx]
      if (!r.valid) return `${r.errorMessage || this.VRi18n.valid.no} (${r.errorCode})`
      let s = this.VRi18n.valid.yes; s += isHTML ? '<br>' : '; '
      s += this.VRi18n.tspValid[r.tspValid ? 'yes' : 'no']; s += isHTML ? '<br>' : '; '
      s += this.VRi18n.ocspVerified[r.ocspVerified ? 'yes' : 'no']
      return s
    }
  }
}
</script>
