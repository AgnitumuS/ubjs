<template>
  <el-dialog
    v-hold-focus
    :title="$ut(title)"
    :visible.sync="isOpen"
    width="800px"
    append-to-body
  >
    <div
      v-loading="loading"
      class="u-form-layout"
    >
      <u-form-row
        :label="$ut('users')"
        label-position="top"
      >
        <u-select-multiple
          v-model="usersInGroup"
          value-attribute="ID"
          :repository="getUserGroupRepo"
          display-attribute="name"
        />
      </u-form-row>
      <span
        slot="footer"
        class="user-select-dialog__footer"
      >
        <el-button
          type="primary"
          @click="apply"
        >
          {{ $ut('save') }}
        </el-button>
      </span>
    </div>
  </el-dialog>
</template>

<script>
const { mapActions, mapGetters } = require('vuex')
const { Repository, connection } = require('@unitybase/ub-pub')

module.exports.default = {
  name: 'UsersSelectDialog',

  props: {
    title: {
      type: String,
      required: true
    },
    instanceID: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      isOpen: false,
      usersInGroup: []
    }
  },

  computed: {
    ...mapGetters([
      'isDirty',
      'loading'
    ])
  },

  methods: {

    ...mapActions(['save']),

    open () {
      this.isOpen = true
    },

    async apply () {
      if (this.usersInGroup.length) {
        for (const userID of this.usersInGroup) {
          const newUser = await connection.addNewAsObject({
            entity: 'uba_usergroup',
            fieldList: ['ID', 'groupID', 'userID'],
            execParams: {
              groupID: this.instanceID,
              userID
            }
          })

          this.$store.commit('ADD_COLLECTION_ITEM', { collection: 'groupUsers', item: newUser })
        }
      }
      if (this.isDirty) {
        await this.save()
      }
      this.usersInGroup = []
      this.isOpen = false
    },

    getUserGroupRepo () {
      return Repository('uba_user').attrs(['ID', 'name'])
        .notExists(
          Repository('uba_usergroup')
            .correlation('userID', 'ID')
            .where('groupID', '=', this.instanceID)
        )
        .orderBy('name', 'asc')
    }
  }
}
</script>

<style>
.user-select-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
