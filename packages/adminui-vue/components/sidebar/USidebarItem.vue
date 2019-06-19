<!--suppress CssUnusedSymbol -->
<template>
  <el-submenu
    v-if="item.children"
    :index="String(item.ID)"
    popper-class="ub-sidebar__popup-menu"
    @contextmenu.native="contextDisabled ? null : contextOnTitle($event)"
  >
    <template slot="title">
      <div
        :style="{marginLeft}"
        class="ub-sidebar__item-title__negative-margin"
      />
      <i :class="getIcon(item)" />
      <span>{{ item.caption }}</span>
    </template>

    <div class="ub-submenu__on-colapsed__title">
      {{ item.caption }}
    </div>
    <u-sidebar-item
      v-for="child in item.children"
      :key="child.ID"
      :item="child"
      :context-show="contextShow"
      :context-disabled="contextDisabled"
      :level="level+1"
    />
  </el-submenu>

  <el-menu-item
    v-else
    :index="String(item.ID)"
    @click="openLink(item)"
    @contextmenu.native="contextDisabled ? null : contextShow($event, item)"
  >
    <div
      :style="{marginLeft}"
      class="ub-sidebar__item-title__negative-margin"
    />
    <i :class="getIcon(item)" />
    <span slot="title">{{ item.caption }}</span>
  </el-menu-item>
</template>

<script>
export default {
  name: 'USidebarItem',
  props: {
    level: {
      type: Number,
      default: 1
    },
    item: Object,
    contextShow: Function,
    contextDisabled: Boolean
  },

  computed: {
    marginLeft () {
      return -this.level * 10 + 'px'
    }
  },

  methods: {
    openLink ({ ID, inWindow }) {
      $App.runShortcutCommand(ID, inWindow)
    },

    getIcon (item) {
      return item.iconCls || (item.parentID ? '' : (item.isFolder ? 'fa fa-folder' : 'fa fa-file-text-o'))
    },

    /* Need to do this hack because we cant bind event in slot */
    contextOnTitle (e) {
      e.stopPropagation()
      e.preventDefault()
      if (e.target.closest('.el-submenu__title')) {
        this.contextShow(e, this.item)
      }
    }
  }
}
</script>

<style>
.ub-submenu__on-colapsed__title{
  display: none;
  font-size: 14px;
  font-weight: 700;
  padding: 8px;
  height: auto;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.ub-sidebar__popup-menu .ub-submenu__on-colapsed__title{
  display: block;
}

.ub-sidebar__popup-menu .el-menu-item ,
.ub-sidebar__popup-menu .el-submenu__title{
  height: 32px;
  line-height: 32px;
}

.ub-sidebar__popup-menu .el-menu-item [class*=fa-],
.ub-sidebar__popup-menu .el-submenu__title [class*=fa-],
.ub-sidebar__popup-menu .el-menu-item [class^=el-icon-],
.ub-sidebar__popup-menu .el-submenu__title [class^=el-icon-]{
  margin-right: 4px;
  min-width: 18px;
  width: 18px;
}

.ub-sidebar__popup-menu .el-submenu__title .el-submenu__icon-arrow {
  transform: rotateZ(180deg);
  position: relative;
  top: 0;
  right: 0;
  margin-left: auto;
  margin-top: 0;
}

.ub-sidebar__popup-menu .el-submenu.is-opened>.el-submenu__title .el-submenu__icon-arrow {
  transform: rotateZ(0deg);
}

.ub-sidebar__popup-menu .el-submenu__title,
.ub-sidebar__popup-menu .el-menu-item{
  display: flex;
  align-items: center;
}

.ub-sidebar .el-menu--collapse .ub-sidebar__item-title__negative-margin,
.ub-sidebar__popup-menu .ub-sidebar__item-title__negative-margin{
  display: none;
}

</style>
