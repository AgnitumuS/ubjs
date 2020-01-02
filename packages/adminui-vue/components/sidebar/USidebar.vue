<template>
  <div class="ub-sidebar">
    <div
      v-if="logo !== null"
      class="ub-sidebar__logo"
    >
      <img :src="isCollapsed ? logo : logoBig">
    </div>

    <slot />

    <desktop-selector
      :desktops="desktops"
      :is-collapsed="isCollapsed"
      :selected-desktop-id="selectedDesktop"
      @change-desktop="changeDesktop"
    />

    <div
      class="ub-sidebar__nav-label"
      :class="isCollapsed && 'collapsed'"
    >
      {{ $ut('menu') }}
    </div>
    <el-menu
      ref="menu"
      background-color="rgb(var(--bg))"
      text-color="rgb(var(--text-contrast))"
      active-text-color="rgb(var(--primary))"
      unique-opened
      :collapse="isCollapsed"
      :collapse-transition="false"
      class="ub-sidebar__main-menu"
      :default-openeds="defaultOpeneds"
      @open="setActiveFolder"
    >
      <u-sidebar-item
        v-for="item in activeShortcuts"
        :key="item.ID"
        :item="item"
        :context-show="$refs.context.show"
        :context-disabled="isCollapsed"
      />
    </el-menu>

    <u-context-menu
      ref="context"
      :items="contextItems"
      @select="selectContext"
    />
  </div>
</template>

<script>
/* global $App */

const UB = require('@unitybase/ub-pub')
const USidebarItem = require('./USidebarItem.vue').default
const UContextMenu = require('../controls/UContextMenu.vue').default
const DesktopSelector = require('./DesktopSelector.vue').default

export default {
  name: 'USidebar',
  components: {
    USidebarItem,
    UContextMenu,
    DesktopSelector
  },

  data () {
    return {
      menu: [],
      desktops: [],
      selectedDesktop: null,
      isCollapsed: null,
      logo: null,
      logoBig: null
    }
  },

  computed: {
    defaultOpeneds () {
      const arr = localStorage.getItem('portal:sidebar:activeShortcutFolder')
      return arr ? JSON.parse(arr) : []
    },

    activeShortcuts () {
      if (!this.menu.length && this.selectedDesktop) {
        return this.menu[this.selectedDesktop]
      } else {
        return []
      }
    },

    contextItems () {
      let shortcutEntity = this.$UB.connection.domain.entities['ubm_navshortcut']
      let canAdd = shortcutEntity && shortcutEntity.haveAccessToMethod('insert')
      let canDelete = shortcutEntity && shortcutEntity.haveAccessToMethod('delete')
      let canEdit = shortcutEntity && shortcutEntity.haveAccessToMethod('update')
      return [{
        label: 'Edit',
        action: 'edit',
        disabled: !canEdit,
        iconCls: 'el-icon-edit'
      }, {
        label: 'addShortcut',
        action: 'addShortcut',
        disabled: !canAdd,
        iconCls: 'el-icon-plus'
      }, {
        label: 'addFolder',
        action: 'addFolder',
        disabled: !canAdd,
        iconCls: 'el-icon-folder-add'
      }, {
        label: '-'
      }, {
        label: 'Delete',
        action: 'deleteShortcut',
        disabled: !canDelete,
        iconCls: 'el-icon-delete'
      }]
    }
  },

  watch: {
    isCollapsed (value) {
      window.localStorage.setItem('portal:sidebar:isCollapsed', value)
      const { full, collapsed } = $App.viewport.leftPanel.defaultSizes
      $App.viewport.leftPanel.setWidth(value ? collapsed : full)
    },
    selectedDesktop (value) {
      if (!value) return
      $App.fireEvent('portal:sidebar:desktopChanged', value)
      this.saveInLocalStorage(value)
    }
  },

  created () {
    this.setLogo()
  },

  mounted () {
    this.initMenu()
    this.initCollapseState()
    $App.on({
      'portal:sidebar:defineSlot': (Component, bindings) => {
        this.$slots.default = this.$createElement(Component, bindings)
        this.$forceUpdate()
      },

      'portal:sidebar:appendSlot': (Component, bindings) => {
        if (Array.isArray(this.$slots.default)) {
          this.$slots.default.push(this.$createElement(Component, bindings))
        } else {
          this.$slots.default = [this.$slots.default, this.$createElement(Component, bindings)]
        }
        this.$forceUpdate()
      },

      'portal:sidebar:collapse': () => {
        this.isCollapsed = !this.isCollapsed
      }
    })
    UB.connection.on(`ubm_navshortcut:changed`, this.initMenu)
    UB.connection.on(`ubm_desktop:changed`, this.initMenu)
    Object.defineProperty(this.$refs.menu, 'hoverBackground', {
      get () {
        return 'rgb(var(--bg-hover))'
      }
    })
  },

  methods: {
    async loadDesktops () {
      const desktops = await this.$UB.connection.Repository('ubm_desktop')
        .attrs('ID', 'caption', 'isDefault', 'description', 'iconCls', 'displayOrder')
        .orderBy('displayOrder').orderBy('caption')
        .select()

      const userLogin = UB.connection.userData().login
      let preferredDesktop = +window.localStorage.getItem(`${userLogin}:desktop`)
      // desktop can be deleted
      if (!preferredDesktop || !desktops.find(i => i.ID === preferredDesktop)) {
        let defaultDesktop = desktops.find(d => d.isDefault)
        preferredDesktop = defaultDesktop ? defaultDesktop.ID : null
      }
      if (!preferredDesktop) preferredDesktop = desktops.length && desktops[0].ID
      if (preferredDesktop) this.selectedDesktop = preferredDesktop

      return desktops
    },

    loadShortcuts () {
      return this.$UB.connection.Repository('ubm_navshortcut')
        .attrs('ID', 'parentID', 'caption', 'desktopID', 'iconCls', 'inWindow', 'isCollapsed', 'displayOrder', 'isFolder')
        .orderBy('desktopID').orderBy('parentID')
        .orderBy('displayOrder').orderBy('caption')
        .select()
    },

    initMenu () {
      Promise.all([
        this.loadDesktops(),
        this.loadShortcuts()
      ]).then(([desktops, shortcuts]) => {
        const menu = {}
        for (const desktop of desktops) {
          menu[desktop.ID] = []
        }
        for (const shortcut of shortcuts) {
          if (shortcut.parentID) {
            const parent = shortcuts.find(s => s.ID === shortcut.parentID)
            if (!parent) continue // parent folder is not accessible due to RLS - skip shortcut
            if (parent.children) {
              parent.children.push(shortcut)
            } else {
              parent.children = [shortcut]
            }
          } else {
            if (shortcut.desktopID in menu) {
              menu[shortcut.desktopID].push(shortcut)
            }
          }
        }
        this.desktops = desktops
        this.menu = menu
      })
    },

    saveInLocalStorage (ID) {
      const userLogin = UB.connection.userData().login
      window.localStorage.setItem(`${userLogin}:desktop`, ID)
    },

    initCollapseState () {
      let isCollapsed = window.innerWidth < 1024
      const savedCollapse = window.localStorage.getItem('portal:sidebar:isCollapsed')
      if (savedCollapse) isCollapsed = (savedCollapse === 'true')

      this.isCollapsed = isCollapsed
    },

    async selectContext (action, { ID, desktopID, parentID, isFolder }) {
      const command = {
        cmdType: 'showForm',
        entity: 'ubm_navshortcut'
      }
      if (action === 'edit') {
        command.instanceID = ID
      } else if ((action === 'addShortcut') || (action === 'addFolder')) {
        command.parentContext = {
          desktopID: desktopID,
          parentID: isFolder ? ID : parentID,
          isFolder: action === 'addFolder'
        }
      } else if (action === 'deleteShortcut') {
        const confirm = await this.$dialogYesNo('areYouSure', 'deletionDialogConfirmCaption')

        if (confirm) {
          await $App.connection.doDelete({
            entity: 'ubm_navshortcut',
            execParams: {
              ID
            }
          })
          this.initMenu() // reload after delete
        }
        return
      }

      $App.doCommand(command)
    },

    setActiveFolder (ID, arr) {
      localStorage.setItem('portal:sidebar:activeShortcutFolder', JSON.stringify(arr))
    },

    changeDesktop (ID) {
      this.selectedDesktop = ID
    },

    setLogo () {
      const logo = this.$UB.connection.appConfig.uiSettings.adminUI.sidebarLogoURL
      const logoBig = this.$UB.connection.appConfig.uiSettings.adminUI.sidebarLogoBigURL

      if (logo) {
        this.logo = logo
        this.logoBig = logoBig || logo
      }
    }
  }
}
</script>

<style>
.ub-sidebar{
  height: 100%;
  background: rgb(var(--bg));
  display: flex;
  flex-direction: column;
  position: relative;
}

.ub-sidebar .el-menu::-webkit-scrollbar {
  width: 12px;
  height: 12px;
  background-color: rgba(var(--bg-hover), 0.2);
}

.ub-sidebar .el-menu::-webkit-scrollbar-thumb {
  border: 2px solid rgba(0, 0, 0, 0);
  background-clip: padding-box;
  background-color: #b0b3b5;
  transition:background-color .1s;
}

.ub-sidebar .el-menu-item .el-tooltip{
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.ub-sidebar .el-menu-item [class*=fa-],
.ub-sidebar .el-submenu [class*=fa-] {
  vertical-align: middle;
  width: 24px;
  min-width: 24px;
  text-align: center;
  font-size: 18px;
}

.ub-sidebar .el-menu-item [class*=fa-],
.ub-sidebar .el-submenu [class*=fa-],
.ub-sidebar .el-menu-item [class^="el-icon-"],
.ub-sidebar .el-submenu [class^="el-icon-"] {
  margin-right: 5px!important;
}

.ub-sidebar .el-submenu__title,
.ub-sidebar .el-menu-item{
  display: flex;
  height: auto;
  line-height: 1.5;
  padding: 8px 0;
  align-items: center;
  white-space: pre-wrap;
  min-height: 32px;
}

.ub-sidebar .el-menu--collapse .el-submenu__title,
.ub-sidebar .el-menu--collapse .el-menu-item{
  justify-content: center;
}

.ub-sidebar .el-menu-item,
.ub-sidebar .el-submenu__title{
  padding-right: 15px;
}

.ub-sidebar .el-submenu__icon-arrow{
  right: 6px;
}

.ub-sidebar .el-submenu__title .el-submenu__icon-arrow {
 transform: rotateZ(-90deg);
}

.ub-sidebar .el-submenu.is-opened>.el-submenu__title .el-submenu__icon-arrow {
  transform: rotateZ(0deg);
}

.ub-sidebar__logo {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid rgba(var(--text-contrast), 0.1);
  padding: 5px 15px;
}

.ub-sidebar__logo img {
  width: 100%;
  max-height: 40px;
}

.ub-sidebar__nav-label {
  color: rgba(255, 255, 255, 0.54);
  font-size: 12px;
  margin: 12px;
}

.ub-sidebar__nav-label.collapsed {
  text-align: center;
}
</style>
