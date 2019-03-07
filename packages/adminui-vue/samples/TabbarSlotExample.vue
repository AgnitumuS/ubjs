<template>
  <div class="ub-tabbar__right-side__buttons">
    <el-button
      icon="el-icon-bell"
      circle
      class="ub-tabbar__button"
    />

    <el-button
      icon="fa fa-search"
      circle
      class="ub-tabbar__button"
    />

    <el-dropdown
      size="big"
      class="ub-tabbar__user-dropdown"
    >
      <el-button
        icon="fa fa-user"
        circle
        class="ub-tabbar__button"
      />
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>Action 1</el-dropdown-item>
        <el-dropdown-item>Action 2</el-dropdown-item>
        <el-dropdown-item>Action 3</el-dropdown-item>
        <el-dropdown-item disabled>
          Action 4
        </el-dropdown-item>
        <el-dropdown-item divided>
          <i class="fa fa-sign-out" /> Logout
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'TabbarSlotExample'
}
</script>

<style>
.ub-tabbar__right-side__buttons{
  display: flex;
  padding-left: 10px;
}

.ub-tabbar__button{
  width: 32px;
  height: 32px;
}

.ub-tabbar__user-dropdown{
  margin-left: 10px;
}
</style>
