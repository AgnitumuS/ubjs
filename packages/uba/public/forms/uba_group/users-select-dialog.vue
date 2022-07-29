<template>
  <el-dialog
    v-hold-focus
    :title="$ut(title)"
    :visible.sync="isOpen"
    width="800px"
    append-to-body
  >
    <div
      class="u-form-layout"
      v-loading="loading"
    >
      <u-form-row
        :label="$ut('users')"
        label-position="top"
      >
        <u-select-collection
          associated-attr="userID"
          entity-name="uba_usergroup"
          collection-name="groupUsers"
          clearable
        />
      </u-form-row>
      <span
        slot="footer"
        class="user-select-dialog__footer"
      >
      <el-button
        type="primary"
        @click="apply"
        :disabled="!isDirty"
      >
        {{ $ut('save') }}
      </el-button>
    </span>
    </div>
  </el-dialog>
</template>

<script>
const { mapActions, mapGetters } = require('vuex')

module.exports.default = {
  name: 'UsersSelectDialog',

  props: {
    title: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      isOpen: false
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
      if (this.isDirty) {
        await this.save()
      }
      this.isOpen = false
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
