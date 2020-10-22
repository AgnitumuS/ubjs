<template>
  <uba-user-root>
    <template #attr_name="{value, originalComponent}">
      <div>
        add info before login field
        <component :is="originalComponent" />
        add info after login field
      </div>
    </template>

    <template #tabs="{defaultComponents}">
      <el-tabs>
        <component :is="defaultComponents.main" />

        <el-tab-pane label="New tab">
          <form @submit.prevent="addTask">
            <u-base-input v-model="taskModel" />
            <u-button type="submit">
              Add
            </u-button>
          </form>
          <ul>
            <li
              v-for="item in todoData"
              :key="item.ID"
            >
              <u-button
                icon="u-icon-delete"
                @click="deleteTask(item.ID)"
              />
              {{ item.task }}
            </li>
          </ul>
        </el-tab-pane>

        <component :is="defaultComponents.certificates" />

        <el-tab-pane label="Another tab">
          Is empty
        </el-tab-pane>
      </el-tabs>
    </template>
  </uba-user-root>
</template>

<script>
const originalForm = require('@unitybase/uba/public/forms/uba_user-fm.vue')
const { mapMutations, mapActions } = require('vuex')

module.exports.controller = (cfg) => {
  const originalController = originalForm.controller(cfg)

  originalController.fieldList.push('addedAttr')

  originalController.collections.todos = ({ state }) => UB.Repository('tst_user_todo')
    .attrs('ID', 'userID', 'task')
    .where('userID', '=', state.data.ID)

  return originalController
}

module.exports.default = {
  mixins: [
    originalForm.default // mixins is best way to extend original form
  ],

  data () {
    return {
      taskModel: ''
    }
  },

  computed: {
    todoData () {
      return this.$store.state.collections.todos.items.map(i => i.data)
    }
  },

  methods: {
    ...mapMutations(['DELETE_COLLECTION_ITEM']),
    ...mapActions(['addCollectionItem']),

    async addTask () {
      await this.addCollectionItem({
        collection: 'todos',
        execParams: {
          caption: this.taskModel,
          userID: this.$store.state.data.ID
        }
      })

      this.taskModel = ''
    },

    deleteTask (ID) {
      const index = this.todoData.findIndex(i => i.ID === ID)
      if (index !== -1) {
        this.DELETE_COLLECTION_ITEM({
          collection: 'todos',
          index
        })
      }
    }
  }
}
</script>
