<template>
  <div class="uba-user__change-password-form">
    <u-form-container label-position="top">
      <u-form-row
        v-if="isOwnRecord"
        label="OldPassword"
        required
        :error="$v.oldPass.$error"
      >
        <el-input
          v-model="oldPass"
          :placeholder="$ut('EnterOldPassword')"
          show-password
        />
      </u-form-row>
      <u-form-row
        label="NewPassword"
        required
        :error="showNewPassError"
      >
        <el-input
          v-model="newPass"
          :placeholder="$ut('EnterNewPassword')"
          show-password
        />
        <div class="u-form-row__description">
          {{ $ut('passwordRecommendation', passMinLength) }}
        </div>
      </u-form-row>
      <u-form-row
        label="RetypePassword"
        required
        :error="$v.retypePass.$error && 'uba.changePassword.retypePassword.errorText'"
      >
        <el-input
          v-model="retypePass"
          :placeholder="$ut('RetypePassword')"
          show-password
        />
      </u-form-row>
      <u-form-row v-if="!isOwnRecord">
        <el-checkbox v-model="isPasswordNeedChange">
          {{ $ut('needChangePassword') }}
        </el-checkbox>
      </u-form-row>
      <div class="uba-user__change-password-form_buttons">
        <el-button @click="$emit('close')">
          {{ $ut('cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="submit"
        >
          {{ $ut('Change') }}
        </el-button>
      </div>
    </u-form-container>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const { validationMixin } = require('vuelidate/lib/index')
const { required, minLength, maxLength, sameAs } = require('vuelidate/lib/validators/index')

module.exports.mount = cfg => {
  Form({
    ...cfg,
    modalWidth: '450px'
  }).mount()
}

module.exports.default = {
  name: 'ChangeUserPasswordForm',
  mixins: [validationMixin],

  props: {
    parentContext: Object
  },

  data () {
    return {
      oldPass: '',
      newPass: '',
      retypePass: '',
      isPasswordNeedChange: false,
      passMinLength: 1,
      isAllowedMatchWithLogin: 'true'
    }
  },

  computed: {
    isOwnRecord () {
      if (this.parentContext && this.parentContext.userID) {
        return this.$UB.connection.userData('userID') === this.parentContext.userID
      }
      return true
    },

    showNewPassError () {
      if (this.$v.$dirty && this.$v.newPass.notEqualToLogin === false) {
        return this.$ut('uba.changePassword.newPassword.matchWithLoginError')
      }
      if (this.$v.newPass.$error) {
        return this.$ut('uba.changePassword.newPassword.fieldRequirementsError')
      }
      return false
    }
  },

  validations () {
    return {
      newPass: {
        required,
        minLength: minLength(this.passMinLength),
        maxLength: maxLength(20),
        ...(this.isAllowedMatchWithLogin === 'false'
          ? { notEqualToLogin: (value) => value !== this.$UB.connection.userData('login') }
          : {})
      },
      retypePass: {
        sameAsPassword: sameAs('newPass')
      },
      ...(this.isOwnRecord
        ? { oldPass: { required } }
        : {})
    }
  },

  mounted () {
    this.loadPasswordPolicy()
  },

  methods: {
    async loadPasswordPolicy () {
      try {
        const { settingValue: settingLength, defaultValue: defaultLength } = await this.$UB.connection
          .Repository('ubs_settings')
          .attrs('settingKey', 'settingValue', 'defaultValue')
          .where('settingKey', '=', 'UBA.passwordPolicy.maxInvalidAttempts')
          .limit(1)
          .selectSingle()
        this.passMinLength = +settingLength || +defaultLength

        const { settingValue: settingAllowance, defaultValue: defaultAllowance } = await this.$UB.connection
          .Repository('ubs_settings')
          .attrs('settingKey', 'settingValue', 'defaultValue')
          .where('settingKey', '=', 'UBA.passwordPolicy.allowMatchWithLogin')
          .limit(1)
          .selectSingle()
        this.isAllowedMatchWithLogin = settingAllowance || defaultAllowance
      } catch (e) {
        this.$errorReporter({ errMsg: e.message })
      }
    },

    async submit () {
      this.$v.$touch()
      if (this.$v.$error) return

      const execParams = {
        newPwd: this.newPass
      }

      if (this.isOwnRecord) {
        execParams.pwd = this.oldPass
      } else {
        execParams.forUser = this.parentContext.userLogin
        execParams.needChangePassword = this.isPasswordNeedChange
      }

      try {
        if (this.isOwnRecord) {
          await this.$UB.connection.xhr({
            method: 'POST',
            url: 'changePassword',
            data: execParams
          })
        } else {
          await this.$UB.connection.query({
            fieldList: [],
            entity: 'uba_user',
            method: 'changeOtherUserPassword',
            execParams
          })
        }
      } catch (e) {
        this.$errorReporter({ errMsg: e.message })
        throw e
      }

      await this.$dialogInfo('passwordChangedSuccessfully')
      this.$emit('close')
    }
  }
}
</script>

<style>
  .uba-user__change-password-form {
    padding: 16px 24px 24px 24px;
  }

  .uba-user__change-password-form_buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .uba-user__change-password-form .u-form-row{
    margin-bottom: 30px;
  }

  .uba-user__change-password-form .u-form-row__description{
    white-space: pre-line;
    margin-top: calc(-1em + 5px);
  }
</style>
