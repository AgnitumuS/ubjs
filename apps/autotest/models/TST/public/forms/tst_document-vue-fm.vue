<script>
const $App = require('@unitybase/adminui-pub')
const Vue = require('vue')
const TstForm = require('../components/TstForm.vue').default

const TstDocumentVue = module.exports.default = {
  components: { TstForm },
  data: function () {
    return {
      changePwd: {
        active: true, user: '', oldPwd: '', newPwd: '', newPwd2: '', changedSuccessfully: false, conn: null
      },
      changePwdRules: {
        oldPwd: [
          { required: true, message: 'Please input Activity name', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    doChangePassword: function () {},
    doLogout: function () {}
  }
}

exports.mount = function () {
  let tab = $App.viewport.centralPanel.add({
    title: 'VueJS form',
    style: {
      padding: '1em' // we replace panel inner content below so set paddings here
    },
    closable: true
  })
  let vm = new Vue(TstDocumentVue)
  vm.$mount(`#${tab.getId()}-outerCt`) // simplify layouts by replacing Ext Panel inned content
  // !! important
  tab.on('close', function () {
    vm.$destroy()
  })
  $App.viewport.centralPanel.setActiveTab(tab)
}
</script>

<template>
  <el-scrollbar style="height: 100%;">
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
          <i class="auth-page__tooltip fa fa-question-circle-o"></i>
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
