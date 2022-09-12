<script>
const TstForm = require('../components/TstForm.vue').default
const adminUiVue = require('@unitybase/adminui-vue')

module.exports.default = {
  components: { TstForm },
  data: function () {
    return {
      txtCode: undefined,
      changePwd: {
        active: true, user: '', oldPwd: '', newPwd: '', newPwd2: '', changedSuccessfully: false, conn: null
      },
      changePwdRules: {
        oldPwd: [
          { required: true, message: 'Please input Activity name', trigger: 'blur' }
        ]
      },
      boolData: false,
      boolData2: true,
      radioChoice: 'two',
      radioChoice2: 1,
      cronExpression: '0 0 22 1,2 * *',
      cronExpression2: '0 0 22 1,2 * *',
      radioItems: [
        { id: 1, label: 'first label' },
        { id: 'two', label: 'second label' }
      ]
    }
  },
  methods: {
    doChangePassword: function () {},
    doLogout: function () {}
  }
}

module.exports.mount = function ({ title, tabId, entity, instanceID, formCode, rootComponent }) {
  adminUiVue.mountUtils.mountTab({
    component: rootComponent,
    tabId: tabId || formCode,
    title
  })
}
</script>

<template>
  <el-scrollbar style="height: 100%;">
    <u-code-mirror v-model="txtCode" value-is-json></u-code-mirror>
    <u-cron v-model="cronExpression" :hide-sections="['second', 'minute']" />
    <u-cron v-model="cronExpression2" />
    <u-base-input v-model="cronExpression" />
    <fieldset style="line-height: 2em;">
      <legend>UCheckbox</legend>
      <u-checkbox v-model="boolData" label="bool data" />
      <u-checkbox v-model="boolData" label="Bool data as switch" kind="switch"/>
      <u-checkbox v-model="boolData2" label="Bool data2 left label" label-position="left" kind="switch"/>
      <u-checkbox v-model="boolData2" label="Bool data2" kind="switch"/>
      <u-checkbox v-model="boolData" disabled label="bool data disabled"/>
      <u-checkbox v-model="boolData" disabled label="bool data switch disabled" kind="switch"/>
      <u-checkbox v-model="boolData" disabled label=""/>
      <u-form-row label="bool" label-position="top">
        <u-checkbox v-model="boolData" />
      </u-form-row>
      <span> Value is {{ boolData }} value type: {{ typeof boolData }}</span>
    </fieldset>
    <fieldset>
      <legend>URadio</legend>
      <u-radio v-model="radioChoice" :items="radioItems" />
      <u-radio v-model="radioChoice2" :items="radioItems" />
      <u-radio v-model="radioChoice" disabled :items="radioItems" />
      <span> Choices is {{ radioChoice }} and {{ radioChoice2 }}, choice type: {{ typeof radioChoice }}</span>
    </fieldset>

    <tst-form form-size=""></tst-form>
    <hr/>
    <tst-form form-size="mini"></tst-form>
    <hr/>
    <tst-form form-size="small"></tst-form>
    <hr/>
    <tst-form form-size="medium"></tst-form>
    <el-form v-if="changePwd.active" :model="changePwd" size="mini" ref="changePwdForm"
             :rules="changePwdRules" @submit.native.prevent label-width="45%">
      <div v-if="changePwd.changedSuccessfully">
        <p v-html="$ut('passwordChangedSuccessfully')"></p>
        <el-button type="primary" plain style="min-width: 8rem" @click="doLogout">
          {{ $ut('logout') }}
        </el-button>
      </div>
      <div v-else>
        <p v-html="$ut('Your password is expired. Please change password')"></p>
        <el-tooltip placement="bottom" effect="light">
          <i class="auth-page__tooltip u-icon-circle-question"></i>
          <div slot="content" v-html="$ut('passwordRecommendation')"></div>
        </el-tooltip>
        <el-form-item class="auth-page--left" :label="$ut('User')">
          <span>{{changePwd.user}}</span>
        </el-form-item>

        <el-form-item :label="$ut('OldPassword')" prop="oldPwd">
          <el-input :placeholder="$ut('EnterOldPassword')" v-model="changePwd.oldPwd" @keyup.enter.native="doChangePassword" type="password" autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item :label="$ut('NewPassword')">
          <el-input :placeholder="$ut('EnterNewPassword')" v-model="changePwd.newPwd" @keyup.enter.native="doChangePassword" type="password" autocomplete="off">
          </el-input>
        </el-form-item>
        <el-form-item :label="$ut('RetypePassword')">
          <el-input :placeholder="$ut('RetypePassword')" v-model="changePwd.newPwd2" @keyup.enter.native="doChangePassword" type="password" autocomplete="off">
          </el-input>
        </el-form-item>
        <el-button type="primary" plain style="min-width: 8rem" @click="doChangePassword">{{ $ut('Change') }}</el-button>
        <el-button plain style="min-width: 8rem" @click="doLogout">{{ $ut('logout') }}</el-button>
      </div>
    </el-form>
  </el-scrollbar>
</template>
