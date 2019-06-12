<template>
  <div>
    <h1>Add new item:</h1>
    <el-row :gutter="10">
      <el-col :span="5">
        <el-input
          v-model="name"
          placeholder="Task"
        />
      </el-col>
      <el-col :span="3">
        <el-checkbox v-model="status">
          Is done
        </el-checkbox>
      </el-col>
      <el-col :span="3">
        <u-select-entity
          v-model="link"
          :entity-name="$UB.connection.domain.get('tst_dictionary_todo').attributes.link.associatedEntity"
        >
          Link to Entity
        </u-select-entity>
      </el-col>
      <el-col :span="3">
        <el-button
          type="primary"
          :disabled="!name"
          @click="addTask"
        >
          Add
        </el-button>
      </el-col>
    </el-row>

    <h1>
      Remove all items:
      <el-button
        type="danger"
        icon="el-icon-delete"
        :disabled="todoList.length <= 0"
        @click="DELETE_ALL_COLLECTION_ITEMS('todo')"
      >
        Clear
      </el-button>
    </h1>

    <h1>Todo list:</h1>
    <el-table
      :data="todoList"
      style="width: 100%"
    >
      <el-table-column
        label="Name"
        width="180"
      >
        <template slot-scope="{row, $index}">
          <el-input
            :value="row.data.name"
            placeholder="Task"
            @input="SET_DATA({
              collection: 'todo',
              index: $index,
              key: 'name',
              value: $event
            })"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="Is done"
        width="180"
      >
        <template slot-scope="{row, $index}">
          <el-checkbox
            :value="row.data.status"
            @input="SET_DATA({
              collection: 'todo',
              index: $index,
              key: 'status',
              value: $event
            })"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="Link to Entity"
        width="180"
      >
        <template slot-scope="{row, $index}">
          <u-select-entity
            :entity-name="$UB.connection.domain.get('tst_dictionary_todo').attributes.link.associatedEntity"
            :value="row.data.link"
            @input="SET_DATA({
              collection: 'todo',
              index: $index,
              key: 'link',
              value: $event
            })"
          />
        </template>
      </el-table-column>
      <el-table-column width="180">
        <template slot-scope="{$index}">
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="DELETE_COLLECTION_ITEM({
              collection: 'todo',
              index: $index
            })"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
const { mapMutations, mapActions } = require('vuex')
const { mapInstanceFields } = require('@unitybase/adminui-vue')

export default {
  name: 'LazyCollection',
  data () {
    return {
      name: '',
      status: false,
      link: null
    }
  },

  computed: {
    todoList () {
      return this.$store.state.collections.todo.items
    },

    ...mapInstanceFields(['ID'])
  },

  // created will called after tab is opened first time because current tab-pane is lazy
  created  () {
    // data will not load until it opens this tab
    this.loadCollections(['todo'])
  },

  methods: {
    ...mapMutations([
      'SET_DATA',
      'DELETE_COLLECTION_ITEM',
      'DELETE_ALL_COLLECTION_ITEMS'
    ]),

    ...mapActions(['addCollectionItem', 'loadCollections']),

    addTask () {
      this.addCollectionItem({
        collection: 'todo',
        execParams: {
          name: this.name,
          status: this.status,
          link: this.link,
          objectID: this.ID
        }
      })
      this.name = ''
      this.status = false
      this.link = null
    }
  }
}
</script>
