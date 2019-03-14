<template>
  <el-dropdown
    ref="dropdown"
    size="big"
    class="ub-navbar__dropdown"
    trigger="click"
    :hide-on-click="false"
    @command="dropdownHandler"
  > 
    <el-badge type="info" :value="0">
      <el-button
        icon="el-icon-bell"
        circle
        class="ub-navbar__button"
      />
    </el-badge>

    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="hide" @click.native="showList">
        {{$ut('messageHistory')}}
      </el-dropdown-item>

      <el-dropdown-item 
        command="hide"
        @click.native="add"
        v-if="$UB.connection.domain.isEntityMethodsAccessible('ubs_message_edit', ['insert', 'update'])"
      >
        {{$ut('actionAdd')}}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'UNavbarNotificationsButton',

  methods: {
    dropdownHandler (command) {
      if (command === 'hide') {
        this.$refs.dropdown.hide()
      }
    },

    add () {
      $App.doCommand({
        cmdType: 'showForm',
        entity: 'ubs_message_edit'
      })
    },

    showList () {
      // TEMPORARY
      Ext.ComponentQuery.query('[$className=UBS.MessageBar]')[0].showHistory()
    }
  }
}
</script>
