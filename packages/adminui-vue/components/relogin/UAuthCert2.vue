<template>
  <el-form @submit.native.prevent>
    <p
      class="auth-page__cert-info"
      v-html="$ut('useCertificateInfoSimple')"
    />

    <el-form-item>
      <el-button
        type="secondary"
        plain
        style="width: 100%"
        @click.prevent="$refs.keyFileInput.click()"
      >
        {{ keyFile ? $ut('Selected key file') + ' ' + keyFile.name : $ut('Select private key file') }}
      </el-button>
      <input
        ref="keyFileInput"
        type="file"
        accept=".dat,.pfx,.cnt,.pk8,Key-6.dat,.jks"
        @change="keyFileChange"
      >
    </el-form-item>

    <el-form-item>
      <el-input
        v-model="password"
        :placeholder="$ut('Password')"
        type="password"
        autocomplete="off"
        @keyup.enter.native="doLogin"
      >
        <template slot="prepend">
          <i class="fa fa-fw fa-key" />
        </template>
      </el-input>
    </el-form-item>

    <el-form-item>
      <el-button
        type="primary"
        plain
        style="min-width: 8rem"
        @click="doLogin"
      >
        {{ $ut('Enter') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'UbAuthCert2',

  data () {
    return {
      keyFile: null,
      password: ''
    }
  },

  methods: {
    keyFileChange (e) {
      this.keyFile = e.target.files[0]
    },

    doLogin () {
      if (!this.keyFile) {
        this.$message.error({
          message: this.$ut('Select private key file'),
          customClass: 'auth-error-notify',
          duration: 7000
        })
      } else if (!this.password.length) {
        this.$message.error({
          message: this.$ut('EnterOldPassword'),
          customClass: 'auth-error-notify',
          duration: 7000
        })
      } else {
        this.resolveAuth({
          authSchema: 'CERT2',
          keyFile: this.keyFile,
          password: this.password
        })
        this.$emit('close')
      }
    }
  }
}
</script>
