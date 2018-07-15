const ElementUI = require('element-ui')
const UB = require('@unitybase/ub-pub')
window.UB = UB
//import App from './App.vue';

Vue.use(ElementUI)

// var vm = new Vue({
//   components: {SidebarItem},
//   template: '<sidebar></sidebar>'
// })
// window.vm = vm

var vm = new Vue({
  el: '#app',
  template: `
<el-row class="tac">
  <el-col style="width: 225px; height: 100%">

    <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
      <el-radio-button :label="false">expand</el-radio-button>
      <el-radio-button :label="true">collapse</el-radio-button>
    </el-radio-group>

    <h5>Menu</h5>

    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      menu-trigger="click"
      @select="desktopSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-submenu index="1" style="float: none">
        <template slot="title">{{ activeDesktopCaption() }}</template>
        <el-menu-item v-for=" desktop in desktops" :index="desktop.code" :key="desktop.ID">{{ desktop.caption }}</el-menu-item>
      </el-submenu>
    </el-menu>

    <el-menu
      unique-opened="true"
      :collapse="isCollapse"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
      @select="menuItemSelect"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b">
      <!-- 1 level folders -->
      <el-submenu v-for="folderL1 in activeDesktopFolders(null)" :index="folderL1.code" :key="folderL1.ID">
        <template slot="title">
          <i :class="folderL1.iconCls"></i>
          <span>{{ folderL1.caption }}</span>
        </template>
        <!-- 2 level folders -->
        <el-submenu v-for="folderL2 in activeDesktopFolders(folderL1.ID)" :index="folderL2.code" :key="folderL2.ID">
          <template slot="title">
            <i :class="folderL2.iconCls"></i>
            <span>{{ folderL2.caption }}</span>
          </template>
          <!-- 2 level folder shortcuts -->
          <el-menu-item v-for="shortcutL2 in activeDesktopFolderMembers(folderL2.ID)" :index="shortcutL2.code" :key="shortcutL2.ID">
            <i :class="shortcutL2.iconCls"></i>
            <span>{{ shortcutL2.caption }}</span>
          </el-menu-item>
        </el-submenu>
        <!-- 1 level folder shortcuts -->
        <el-menu-item v-for="shortcutL1 in activeDesktopFolderMembers(folderL1.ID)" :index="shortcutL1.code" :key="shortcutL1.ID">
          <i :class="shortcutL1.iconCls"></i>
          <span>{{ shortcutL1.caption }}</span>
        </el-menu-item>
      </el-submenu>
      <!-- desktop level shortcuts -->
      <el-menu-item v-for="shortcutL0 in activeDesktopFolderMembers(null)" :index="shortcutL0.code" :key="shortcutL0.ID">
        <i :class="shortcutL0.iconCls"></i>
        <span>{{ shortcutL0.caption }}</span>
      </el-menu-item>
    </el-menu>
  </el-col>
</el-row>
`,
  data: function () {
    return {
      activeDesktop: null,
      isCollapse: false,
      desktops: [],
      shortcuts: []
    }
  },
  methods: {
    getNavigationData: function () {
      let shortcutsPromise = UB.Repository('ubm_navshortcut')
        .attrs(['ID', 'desktopID', 'parentID', 'code', 'isFolder', 'caption', 'inWindow', 'isCollapsed', 'displayOrder', 'iconCls'])
        .orderBy('desktopID').orderBy('parentID')
        .orderBy('displayOrder').orderBy('caption')
        .selectAsObject()
      let desktopsPromise = UB.Repository('ubm_desktop')
        .attrs(['ID', 'code', 'caption', 'url', 'isDefault'])
        .selectAsObject()
      Promise.all([shortcutsPromise, desktopsPromise]).then(([shortcuts, desktops]) => {
        // fix icon classes for FontAwesome
        shortcuts.forEach((sh) => {
          let cls = sh.iconCls
          if (/fa /.test(cls)) {
            if (!/fa-fw/.test(cls)) sh.iconCls += ' fa-fw'
            if (!/fa-lg/.test(cls)) sh.iconCls += ' fa-lg'
          }
        })
        this.desktops = desktops
        this.shortcuts = shortcuts
        this.activeDesktop = desktops.length ? desktops[0].ID : null
      })
    },
    desktopShortcuts (desktopID) {
      return this.shortcuts.filter((sh) => sh.desktopID === desktopID)
    },
    activeDesktopCaption () {
      let activeDS = this.desktops.find(d => d.ID === this.activeDesktop)
      return activeDS ? activeDS.caption : 'Select desktop'
    },
    activeDesktopFolders (parentID) {
      return this.shortcuts
        .filter((sh) => ((sh.desktopID === this.activeDesktop) && sh.isFolder && (sh.parentID === parentID)))
        .sort((s1, s2) => s1.displayOrder - s2.displayOrder)
    },
    activeDesktopFolderMembers (parentID) {
      return this.shortcuts
        .filter((sh) => ((sh.desktopID === this.activeDesktop) && !sh.isFolder && (sh.parentID === parentID)))
        .sort((s1, s2) => s1.displayOrder - s2.displayOrder)
    },
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    },
    desktopSelect: function (key) {
      let ds = this.desktops.find((d) => d.code === key)
      this.activeDesktop = ds.ID
      console.log('desktop', key, 'selected')
    },
    menuItemSelect (key, keyPath) {
      console.log('Clicked on item with key', key, 'and path', keyPath)
    }
  }
})
window.vm = vm

let isExternalLogin = typeof window.redirectToLogin === 'function'
UB.connect({
  host: window.location.origin,
  path: window.UB_API_PATH || window.location.pathname,
  allowSessionPersistent: isExternalLogin,
  onAuthorized: function (conn) {
    if (isExternalLogin) { // external login page
      window.localStorage.removeItem(conn.__sessionPersistKey)
    }
    window.localStorage.setItem(UB.LDS_KEYS.USER_DID_LOGOUT, 'false')
  },
  onAuthorizationFail: function (reason, conn) {
    if (isExternalLogin) {
      var storedSession = window.localStorage.getItem(conn.__sessionPersistKey)
      if (storedSession) { // invalid session is created by external login page
        window.redirectToLogin(reason)
      } else {
        UB.showErrorWindow(reason)
      }
    } else {
      UB.showErrorWindow(reason)
    }
  }
  // onNeedChangePassword: $App.onPasswordChange.bind($App),
}).then(function (connection) {
  window.connection = connection
  UB.logDebug('connected!')
  vm.getNavigationData()
})
