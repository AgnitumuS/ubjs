<template>
  <div class="u-form-layout">
    <div class="u-toolbar">
      <section>Хеш:</section>
      <u-button icon="u-icon-signature" @click="doHashBlobStore">BLOB стор</u-button>
      <section>Подписать:</section>
      <u-button icon="u-icon-signature" @click="doSign">Файл</u-button>
      <u-button icon="u-icon-signature" @click="doSignBase64">Base64</u-button>
      <u-button icon="u-icon-signature" @click="doSignBlobStore">BLOB стор</u-button>
      <section>Проверить:</section>
      <u-button icon="u-icon-signature" @click="doVerify">файл+base64</u-button>
      <u-button icon="u-icon-signature" @click="doVerifyBlobStore">BLOB стор+подпись base64</u-button>
      <u-button icon="u-icon-signature" @click="doVerifyBlobSingInBlobStore">BLOB стор + подпись в сторе</u-button>
      <u-button icon="u-icon-signature" @click="doVerifyRemote">файл+base64(прямой вызов АПИ как для мобилки)</u-button>
    </div>

    <u-grid label-position="top">
      <u-grid>
        <u-form-row label="Файл, который подписываем">
          <u-file-input
            v-model="fileForSigning"
            placeholder="Select a file for sign or verify"
          />
        </u-form-row>
        <u-form-row label="Base64, который подписываем">
          <u-base-input
            type="textarea"
            rows="4"
            v-model="base64ForSigning"
          />
        </u-form-row>
      </u-grid>
      <section>
        <u-form-row label="Документ из стора для подписания">
          <u-select-entity
            v-model="tstDocID"
            entity-name="tst_document"
          ></u-select-entity>
        </u-form-row>
        <u-form-row label="Подпись из стора для проверки">
          <u-select-entity
            v-model="tstDocSignatureID"
            entity-name="tst_document"
          ></u-select-entity>
        </u-form-row>
      </section>

      <u-form-row label="Подпись в base64">
        <u-base-input
          type="textarea"
          rows="20"
          v-model="signature"
        />
      </u-form-row>
      <u-form-row label="Результат операции">
        <u-base-input
          type="textarea"
          rows="20"
          v-model="operationResult"
        />
      </u-form-row>
      <u-form-row
        label="Операции"
      >
      </u-form-row>
    </u-grid>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const UB = require('@unitybase/ub-pub')

module.exports.mount = function (cfg) {
  Form(cfg).mount()
}

module.exports.default = {
  name: 'tst_service-crypto',
  inject: ['$v'],
  data () {
    return {
      fileForSigning: [],
      base64ForSigning: '',
      signature: '',
      operationResult: '',
      tstDocID: null,
      tstDocSignatureID: null
    }
  },
  methods: {
    async doHashBlobStore () {
      console.time('hashBLOB')
      const verificationResult = await UB.connection.post('/crypto/hash', [
        { entity: 'tst_document', attribute: 'fileStoreSimple', ID: this.tstDocID }
      ])
      console.timeEnd('hashBLOB')
      this.operationResult = verificationResult.data[0]
    },

    async doSign () {
      let pki
      try {
        if (!this.fileForSigning[0]) throw new UB.UBError('Выберите файл')
        pki = await this.$UB.connection.pki()
        const fArray = await this.$UB.file2Uint8Array(this.fileForSigning[0])
        console.time('sign')
        const signature = await pki.sign(fArray)
        console.timeEnd('sign')
        this.signature = signature
        await this.$dialogInfo('Документ успішно підписаний', 'Підпис')
      } finally {
        //me.unmask()
        // commented to not ask a password next time
        // if (pki) pki.closePrivateKey()
      }
    },

    async doSignBase64 () {
      if (!this.base64ForSigning) throw new UB.UBError('Задайте стоку в Base64')
      const pki = await this.$UB.connection.pki()
      const arrBuf = await this.$UB.base64toArrayBuffer(this.base64ForSigning)
      console.time('sign')
      const signature = await pki.sign(arrBuf)
      console.timeEnd('sign')
      this.signature = signature
      await this.$dialogInfo('Документ успішно підписаний', 'Підпис')
    },

    async doSignBlobStore () {
      if (!this.tstDocID) throw new UB.UBError('Выберите документ')
      let pki
      try {
        pki = await this.$UB.connection.pki()
        console.time('signBlob')
        const signature = await pki.sign({ entity: 'tst_document', attribute: 'fileStoreSimple', ID: this.tstDocID })
        console.timeEnd('signBlob')
        this.signature = signature
      } finally {
        // uncomment line below to ask for password next time
        // if (pki) pki.closePrivateKey()
      }
      // Pure HSM implementation
      // const signaturesResp = await UB.connection.post('/crypto/hsmSign', {
      //   hsmPwd: 'F98hv2muKz52',
      //   items: [{ entity: 'tst_document', attribute: 'fileStoreSimple', ID: this.tstDocID }]
      // })
      // this.signature = signaturesResp.data[0]
      await this.$dialogInfo('Документ успішно підписаний', 'Підпис')
    },

    async doVerify () {
      if (!this.fileForSigning.length) {
        throw new this.$UB.UBError('Please, select file to validate')
      }
      // me.mask('Verifying')
      try {
        const fArray = await UB.file2Uint8Array(this.fileForSigning[0])
        const pki = await this.$UB.connection.pki()
        console.time('verify')
        const [verificationResult] = await Promise.all([
          pki.verify(this.signature, fArray)
        ])
        console.timeEnd('verify')
        this.operationResult = JSON.stringify(verificationResult, null, ' ')
        // show UI dialog with signature validation result
        await pki.verificationUI(
          [verificationResult, verificationResult],
          ['<strong>First signature</strong>', 'Second signature'],
          [{ icon: 'fa fa-user', tooltip: 'Ha-ha', callback: () => {} }]
        )
      } finally {
        // me.unmask()
      }
    },

    async doVerifyBlobStore () {
      if (!this.tstDocID) throw new UB.UBError('Выберите документ')
      // me.mask('Verifying')
      try {
        const pki = await this.$UB.connection.pki()
        console.time('verifyBLOB')
        const verificationResult = await UB.connection.post('/crypto/verify', {
          item: { entity: 'tst_document', attribute: 'fileStoreSimple', ID: this.tstDocID },
          signatures: [this.signature]
        })
        console.timeEnd('verifyBLOB')
        this.operationResult = JSON.stringify(verificationResult.data, null, ' ')
        // show UI dialog with signature validation result
        await pki.verificationUI(
          verificationResult.data,
          ['<strong>Документ из БЛОБ стора, подпись - base64</strong>', 'Signature w/o doc']
        )
      } finally {
        // me.unmask()
      }
    },

    async doVerifyBlobSingInBlobStore () {
      if (!this.tstDocID) throw new UB.UBError('Выберите документ')
      if (!this.tstDocSignatureID) throw new UB.UBError('Выберите документ c подписью')
      // me.mask('Verifying')
      try {
        const pki = await this.$UB.connection.pki()
        console.time('verifyRemoteSignInBlob')
        const verificationResult = await UB.connection.post('/crypto/verify', {
          item: { entity: 'tst_document', attribute: 'fileStoreSimple', ID: this.tstDocID },
          signatures: [{ entity: 'tst_document', attribute: 'fileStoreSimple', ID: this.tstDocSignatureID }]
        })
        console.timeEnd('verifyRemoteSignInBlob')
        this.operationResult = JSON.stringify(verificationResult.data, null, ' ')
        // show UI dialog with signature validation result
        await pki.verificationUI(
          verificationResult.data,
          ['<strong>Документ и подпись из БЛОБ стора</strong>']
        )
      } finally {
        // me.unmask()
      }
    },

    async doVerifyRemote () {
      if (!this.fileForSigning.length) {
        throw new this.$UB.UBError('Please, select file to validate')
      }
      // me.mask('Verifying')
      try {
        const pki = await this.$UB.connection.pki()
        console.time('verifyRemoteBase64')
        const content = await UB.base64FromAny(this.fileForSigning[0])
        const verificationResult = await UB.connection.post('/crypto/verify', {
          item: { content: content, asBinary: true },
          signatures: [this.signature]
        })
        console.timeEnd('verifyRemoteBase64')
        this.operationResult = JSON.stringify(verificationResult.data, null, ' ')
        // show UI dialog with signature validation result
        await pki.verificationUI(
          verificationResult.data,
          ['<strong>Документ из БЛОБ стора, подпись - base64</strong>', 'Signature w/o doc']
        )
      } finally {
        // me.unmask()
      }
    },
  }
}
</script>
