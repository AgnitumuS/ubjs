import { configure } from '@storybook/vue';

import Vue from 'vue';
import UB from '@unitybase/ub-pub';

import Element from 'element-ui';
Vue.use(Element, {
  size: 'small',
  i18n: UB.i18n.bind(UB)
});

import TreeView from "vue-json-tree-view"
Vue.use(TreeView)

let connect = UB.connect({
  host: window.location.origin,
  path: window.UB_API_PATH || window.location.pathname,
  onCredentialRequired: false,
  allowSessionPersistent: false,
  onAuthorized: function (conn) {},
  onAuthorizationFail: function (reason, conn) {},
  onNeedChangePassword: null,
  onGotApplicationConfig: function ( /** @type {UBConnection} */ connection) {
    _.defaultsDeep(connection.appConfig, {
      comboPageSize: 30,
      maxMainWindowTabOpened: 40,
      storeDefaultPageSize: 100,
      gridHeightDefault: 400,
      gridWidthDefault: 600,
      gridParentChangeEventTimeout: 200,
      gridDefaultDetailViewHeight: 150,
      formMinHeight: 100,
      formMinWidth: 300,
      formDefaultAutoFormWidth: 300,
      formSaveMaskDelay: 100,
      scanRecognizeProgressInterval: 1000,
      maxSearchLength: 62,
      uiSettings: {
        adminUI: {
          defaultPasswordForDebugOnly: ''
        }
      }
    })
    UB.appConfig = connection.appConfig
    return null
  }
})
connect.then(function () {
  this.Vue.use(UB)
  configure(function loadStories() {
    require('../stories');
  }, module);
}.bind({
  Vue: Vue
}))

import '../src/font-awesome/css/font-awesome.min.css';
import '@unitybase/adminui-vue/dist/adminui-vue.css';

if ('serviceWorker' in navigator) {
  console.log('CLIENT: service worker registration in progress.');
  navigator.serviceWorker.register('/service-worker.js').then(function () {
    console.log('CLIENT: service worker registration complete.');
  }, function () {
    console.log('CLIENT: service worker registration failure.');
  });
} else {
  console.log('CLIENT: service worker is not supported.');
}