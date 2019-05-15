<template>
  <div class="ub-sidebar">
    <div
      class="ub-sidebar__desktop-select"
      :class="[isCollapsed && 'collapsed']"
    >
      <el-tooltip
        v-show="isCollapsed"
        :content="$ut('rabochiyStol')"
        placement="right"
        :enterable="false"
      >
        <el-button
          icon="fa fa-desktop"
          class="ub-sidebar__desktop-select__button"
          @click="$refs.select.$el.click()"
        />
      </el-tooltip>

      <el-select
        ref="select"
        v-model="selectedDesktop"
        style="width: 100%"
        placeholder="Desktop"
        @change="saveInLocalStorage"
      >
        <el-option
          v-for="item in desktops"
          :key="item.ID"
          :label="item.caption"
          :value="item.ID"
        />
      </el-select>
    </div>

    <slot />

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

export default {
  name: 'USidebar',
  components: { USidebarItem, UContextMenu },

  data () {
    return {
      menu: [],
      desktops: [],
      selectedDesktop: null,
      isCollapsed: null
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
      let canAdd = this.$UB.connection.domain.entities['ubm_navshortcut'].haveAccessToMethod('insert')
      let canDelete = this.$UB.connection.domain.entities['ubm_navshortcut'].haveAccessToMethod('delete')
      return [{
        label: 'Edit',
        action: 'edit',
        iconCls: 'el-icon-edit'
      }, {
        label: 'addShortcut',
        action: 'addShortcut',
        disabled: !canAdd,
        iconCls: 'el-icon-circle-plus'
      }, {
        label: 'addFolder',
        action: 'addFolder',
        disabled: !canAdd,
        iconCls: 'fa fa-folder'
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
    }
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
    Object.defineProperty(this.$refs.menu, 'hoverBackground', {
      get () {
        return 'rgb(var(--bg-hover))'
      }
    })
  },

  methods: {
    async loadDesktops () {
      const desktops = await this.$UB.connection.Repository('ubm_desktop')
        .attrs('ID', 'caption', 'isDefault')
        .orderBy('caption')
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
      }

      if (action === 'addShortcut') {
        command.desktopID = desktopID
        if (parentID) {
          command.parentID = parentID
        }
        if (isFolder) {
          command.isFolder = isFolder
        }
      }

      if (action === 'addFolder') {
        command.desktopID = desktopID
        if (parentID) {
          command.parentID = parentID
        }
        command.isFolder = true
      }

      if (action === 'deleteShortcut') {
        const confirm = await this.$dialogYesNo('areYouSure', 'deletionDialogConfirmCaption')

        if (confirm) {
          await $App.connection.doDelete({
            entity: 'ubm_navshortcut',
            execParams: {
              ID
            }
          })
          const index = this.shortcuts.findIndex(s => s.ID === ID)
          if (index !== -1) {
            this.shortcuts.splice(index, 1)
          }
        }
        return
      }

      $App.doCommand(command)
    },

    setActiveFolder (ID, arr) {
      localStorage.setItem('portal:sidebar:activeShortcutFolder', JSON.stringify(arr))
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
  z-index: 300000;
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

.ub-sidebar .el-menu-item [class*=fa-],
.ub-sidebar .el-submenu [class*=fa-] {
  vertical-align: middle;
  margin-right: 5px;
  width: 24px;
  min-width: 24px;
  text-align: center;
  font-size: 18px;
}

.ub-sidebar .el-submenu__title,
.ub-sidebar .el-menu-item{
  display: flex;
  align-items: center;
}

.ub-sidebar .el-menu--collapse .el-submenu__title,
.ub-sidebar .el-menu--collapse .el-menu-item{
  justify-content: center;
}

.ub-sidebar .el-menu-item>span,
.ub-sidebar .el-submenu__title>span{
  line-height: 1.2;
  white-space: pre-wrap;
}

.ub-sidebar.collapsed {
  width: 70px;
}

.ub-sidebar .el-submenu__title .el-submenu__icon-arrow {
 transform: rotateZ(-90deg);
}

.ub-sidebar .el-submenu.is-opened>.el-submenu__title .el-submenu__icon-arrow {
  transform: rotateZ(0deg);
}

.ub-sidebar__desktop-select{
  padding: 12px;
}

.ub-sidebar__main-menu{
  border-right: 0;
  margin: 12px auto;
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
}

.ub-sidebar__desktop-select.collapsed .el-input__suffix,
.ub-sidebar__desktop-select.collapsed .el-input__inner{
  display: none;
}

.ub-sidebar__desktop-select.collapsed .el-select{
  display: block;
}

.ub-sidebar__desktop-select__button{
  margin: 0 auto;
  display: block;
}
</style>
