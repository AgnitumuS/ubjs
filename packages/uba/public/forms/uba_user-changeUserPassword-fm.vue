<template>
  <div class="uba-user__change-password-form">
    <u-form-container
      label-position="top"
      :label-width="200"
    >
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
        :error="$v.newPass.$error"
      >
        <el-input
          v-model="newPass"
          :placeholder="$ut('EnterNewPassword')"
          show-password
        />
        <div class="u-form-row__description">
          {{ $ut('passwordRecommendation') }}
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
        <el-button
          @click="$emit('close')"
        >
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

module.exports.mount = function ({ title, entity, instanceID, formCode, rootComponent, isModal, props }) {
  Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode,
    isModal,
    modalWidth: '450px',
    props
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
      isPasswordNeedChange: false
    }
  },

  computed: {
    currentUserID () {
      return this.$UB.connection.userData('userID')
    },

    isOwnRecord () {
      if (this.parentContext && this.parentContext.userID) {
        return this.currentUserID === this.parentContext.userID
      }
      return true
    }
  },

  validations () {
    return {
      newPass: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(20)
      },
      retypePass: {
        sameAsPassword: sameAs('newPass')
      },
      ...(this.isOwnRecord ? {
        oldPass: { required }
      } : {})
    }
  },

  methods: {
    async submit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        const execParams = {
          newPwd: this.newPass
        }

        if (this.isOwnRecord) {
          execParams.pwd = this.$UB.connection.SHA256('salt' + this.oldPass).toString()
        } else {
          execParams.forUser = this.parentContext.userLogin
          execParams.needChangePassword = this.isPasswordNeedChange
        }

        await this.$UB.connection.xhr({
          method: 'POST',
          url: 'changePassword',
          data: execParams
        })
        await this.$dialogInfo('passwordChangedSuccessfully')
        this.$emit('close')
      }
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
</style>
