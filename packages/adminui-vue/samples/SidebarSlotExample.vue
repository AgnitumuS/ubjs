<template>
  <div
    v-if="!isCollapsed"
    class="ub-sidebar__quick-access-group"
  >
    <el-tooltip
      v-for="item in quickAccessMenu"
      :key="item.label"
      :enterable="false"
      :content="item.label"
      placement="top"
    >
      <i
        :class="item.iconCls"
        @click="item.onClick ? item.onClick($event) : null"
      />
    </el-tooltip>
  </div>

  <el-dropdown
    v-else
    trigger="click"
    placement="right"
    class="ub-sidebar__quick-access-button"
    size="big"
  >
    <el-tooltip
      :content="$ut('quickAccessButtons')"
      placement="right"
      :enterable="false"
    >
      <i class="fa fa-bolt" />
    </el-tooltip>

    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="item in quickAccessMenu"
        :key="item.label + 'uniqFlag'"
        @click.native="item.onClick ? item.onClick($event) : null"
      >
        <i :class="item.iconCls" />
        {{ item.label }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'SidebarSlotExample',

  data () {
    return {
      quickAccessMenu: [{
        iconCls: 'fa fa-address-book',
        label: 'Contacts',
        onClick: (e) => {
          console.log(e)
        }
      }, {
        iconCls: 'fa fa-adjust',
        label: 'Colors'
      }, {
        iconCls: 'el-icon-location',
        label: 'Locations'
      }, {
        iconCls: 'el-icon-star-on',
        label: 'Favorite'
      }]
    }
  },

  computed: {
    isCollapsed () {
      return this.$parent.isCollapsed
    }
  }
}
</script>

<style>
.ub-sidebar__quick-access-group{
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-bottom: 1px solid rgba(var(--info), 0.15);
  padding-bottom: 10px;
  flex-shrink: 0;
}

.ub-sidebar__quick-access-group i{
  display: block;
  color: rgb(var(--info));
  font-size: 30px;
  margin: 0 4px;
  width: 30px;
  text-align: center;
  cursor: pointer;
}

.ub-sidebar__quick-access-group i:hover{
  color: rgb(var(--primary));
}

.ub-sidebar__quick-access-button{
  font-size: 18px;
  height: 56px;
  width: 100%;
  cursor: pointer;
  color: rgb(var(--info));
  transition: .3s;
}

.ub-sidebar__quick-access-button i {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.ub-sidebar__quick-access-button:hover{
  color: rgb(var(--primary));
  background: rgb(38, 51, 64);
}
</style>
