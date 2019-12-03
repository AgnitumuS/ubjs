<template>
  <u-context-menu
    ref="context"
    :items="contextItems"
    @select="select"
  />
</template>

<script>
/* global $App */
const { mapGetters, mapActions } = require('vuex')

export default {
  computed: {
    ...mapGetters(['entityName', 'canAddNew', 'canDelete']),
    contextItems () {
      return [{
        label: 'Edit',
        action: 'editRecord',
        iconCls: 'el-icon-edit'
      }, {
        label: 'Copy',
        action: 'copyRecord',
        iconCls: 'el-icon-copy-document',
        disabled: !this.canAddNew
      }, {
        label: 'Delete',
        action: 'deleteRecord',
        iconCls: 'el-icon-delete',
        disabled: !this.canDelete
      }, {
        label: 'link',
        action: 'createLink',
        iconCls: 'el-icon-link'
      }]
    }
  },

  methods: {
    ...mapActions([
      'deleteRecord',
      'editRecord',
      'copyRecord',
      'createLink'
    ]),

    show (event, row) {
      this.$refs.context.show(event, row)
    },

    select (action, row) {
      this[action](row.ID)
    }
  }
}
</script>
