<template>
  <div class="ub-form-container">
    <u-toolbar :validation="$v" />

    <u-form
      v-loading.body="loading"
      :label-width="160"
    >
      <el-row :gutter="20">
        <el-col :lg="12">
          <u-auto-field
            v-model="code"
            code="code"
          />

          <u-form-row :label="getLabel('caption')">
            <u-input
              v-model="caption"
              :entity="entityName"
              attribute-name="caption"
            />
          </u-form-row>

          <u-form-row
            required
            :label="getLabel('filterValue')"
            :error="$v.filterValue.$error"
          >
            <u-input
              v-model="filterValue"
              attribute-name="filterValue"
              type="number"
            />
          </u-form-row>

          <u-form-row :label="getLabel('currencyValue')">
            <u-input
              v-model="currencyValue"
              attribute-name="currencyValue"
              type="number"
            />
          </u-form-row>
        </el-col>

        <el-col :lg="12">
          <u-form-row :label="getLabel('floatValue')">
            <u-input
              v-model="floatValue"
              attribute-name="floatValue"
              type="number"
            />
          </u-form-row>

          <u-form-row :label="getLabel('intValue')">
            <u-input
              v-model="intValue"
              attribute-name="intValue"
              type="number"
            />
          </u-form-row>

          <u-form-row :label="getLabel('calculated')">
            <el-input
              :value="calculated"
              disabled
            />
          </u-form-row>

          <u-form-row :label="getLabel('booleanColumn')">
            <el-checkbox v-model="booleanColumn" />
          </u-form-row>
        </el-col>
      </el-row>

      <u-form-row :label="getLabel('jsonColumn')">
        <u-code-mirror v-model="jsonColumn" />
      </u-form-row>

      <!-- Example edit collections items -->
      <hr>
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
            </el-checkbox>
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
          @click="REMOVE_ALL_COLLECTION_ITEMS({ collection: 'todo' })"
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
        <el-table-column
          width="180"
        >
          <template slot-scope="{$index}">
            <el-button
              type="danger"
              icon="el-icon-delete"
              @click="REMOVE_COLLECTION_ITEM({
                collection: 'todo',
                index: $index
              })"
            />
          </template>
        </el-table-column>
      </el-table>
    </u-form>
  </div>
</template>

<script>
const { formBoilerplate, mapInstanceFields } = require('@unitybase/adminui-vue')
const { mapGetters, mapMutations, mapActions } = require('vuex')
const UB = require('@unitybase/ub-pub')
const fieldList = [
  'ID',
  'code',
  'caption',
  'filterValue',
  'currencyValue',
  'floatValue',
  'intValue',
  'calculated',
  'booleanColumn',
  'jsonColumn'
]

module.exports.mount = function (params) {
  const masterRequest = UB.connection
    .Repository(params.entity)
    .attrs(fieldList)

  const collectionRequests = {
    todo: UB.connection
      .Repository('tst_dictionary_todo')
      .attrs('ID', 'objectID', 'name', 'status', 'link')
      .where('objectID', '=', params.instanceID)
  }

  formBoilerplate({
    params,
    FormComponent: TstDictionary,
    masterRequest,
    collectionRequests
  })
}

const TstDictionary = module.exports.default = {
  name: 'TstDictionary',

  data () {
    return {
      name: '',
      status: false,
      link: null
    }
  },

  computed: {
    ...mapInstanceFields(fieldList),

    ...mapGetters(['entitySchema', 'loading', 'entityName']),

    todoList () {
      return this.$store.state.collections.todo.items
    }
  },

  created () {
    this.$store.dispatch('loadCollections', ['todo'])
  },

  methods: {
    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    },

    ...mapMutations([
      'SET_DATA',
      'REMOVE_COLLECTION_ITEM',
      'REMOVE_ALL_COLLECTION_ITEMS'
    ]),

    ...mapActions(['addCollectionItem']),

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
