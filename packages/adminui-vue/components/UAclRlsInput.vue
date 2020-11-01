<template>
  <div class="u-acl-rls-input">
    <h4 class="u-acl-rls__title">
      {{ $ut('UAclRlsInput.access') }}
    </h4>

    <el-button
      icon="el-icon-plus"
      class="u-acl-rls__open-dialog"
      @click="openDialog"
    >
      {{ $ut('UAclRlsInput.add') }}
    </el-button>

    <u-table
      :columns="tableColumns"
      :items="aclRlsEntries"
    >
      <template
        v-for="attr in rightAttributes"
        #[attr]="{row}"
      >
        {{ row[`${attr}Val`] }}
      </template>

      <template #removeAction="{row}">
        <el-button
          type="danger"
          @click="deleteAccessRecord(row.ID)"
        >
          {{ $ut('UAclRlsInput.table.remove') }}
        </el-button>
      </template>
    </u-table>

    <el-dialog
      v-hold-focus
      :title="$ut('UAclRlsInput.dialog.grantAccess')"
      :visible.sync="dialog.isVisible"
      :close-on-click-modal="false"
      width="600px"
      top="0"
      class="u-acl-rls-input-dialog"
      @closed="resetSelectedItems"
    >
      <u-form-container
        label-position="top"
        :label-width="200"
        class="u-acl-rls-input-dialog__form"
      >
        <u-form-row
          label="UAclRlsInput.dialog.entity"
          class="u-acl-rls-input-overflow"
        >
          <el-select
            v-model="dialog.currentEntityName"
            class="u-select"
            :placeholder="$ut('UAclRlsInput.dialog.entityPlaceholder')"
          >
            <el-option
              v-for="{ entity } in rightAttributesWithMetaInfo"
              :key="entity"
              :value="entity"
              :label="$ut(entity)"
            />
          </el-select>
        </u-form-row>

        <u-form-row
          v-if="currentDialogEntityMeta !== undefined"
          :label="currentDialogEntityMeta.entity"
          class="u-acl-rls-input-overflow"
        >
          <u-select-multiple
            v-model="dialog.selected[currentDialogEntityMeta.entity]"
            :repository="getCurrentSelectedRepository(currentDialogEntityMeta.entity)"
            clearable
          />
        </u-form-row>
      </u-form-container>

      <span
        slot="footer"
        class="u-acl-rls-dialog__footer"
      >
        <el-button @click="closeDialog">
          {{ $ut('cancel') }}
        </el-button>

        <el-button
          type="primary"
          @click="submitRights"
        >
          {{ $ut('UAclRlsInput.dialog.grant') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
const { mapMutations } = require('vuex')
const { Repository } = require('@unitybase/ub-pub')

const NOT_FK_ACL_ATTRIBUTES = ['ID', 'valueID', 'instanceID']

/**
 * Component is responsible for displaying and managing access rights defined with
 * aclRls entity mixin
 */
export default {
  name: 'UAclRlsInput',

  props: {
    /**
     * Name of key what you set in collectionRequests object
     */
    collectionName: {
      type: String,
      required: true
    },

    /**
     * ID of entry for which we configure access
     */
    instanceId: {
      type: Number,
      required: true
    }
  },

  data: () => ({
    dialog: {
      isVisible: false,
      currentEntityName: null,
      selected: {}
    },
    subjects: {}
  }),

  computed: {
    currentCollection () {
      return this.$store.state.collections[this.collectionName]
    },

    entityAttributes () {
      return this.$UB.connection.domain.get(this.currentCollection.entity).attributes
    },

    rightAttributes () {
      return Object.keys(this.entityAttributes).filter(
        attr => !NOT_FK_ACL_ATTRIBUTES.includes(attr)
      )
    },

    rightAttributesWithMetaInfo () {
      return this.rightAttributes.map(attrName => {
        const entity = this.entityAttributes[attrName].associatedEntity
        const { descriptionAttribute } = this.$UB.connection.domain.get(entity)

        return { attrName, entity, descriptionAttribute }
      })
    },

    tableColumns () {
      return this.rightAttributesWithMetaInfo
        .map(({ attrName, entity }) => ({
          id: attrName,
          label: entity
        }))
        .concat({
          id: 'removeAction',
          label: 'UAclRlsInput.table.remove',
          width: 130
        })
    },

    aclRlsEntries () {
      return this.currentCollection.items.map(item => {
        // merge each collection item with values from appropriate dictionary in order to display them in table
        return this.rightAttributesWithMetaInfo.reduce((itemValues, { entity, attrName }) => {
          // while dictionary in created hook is not loaded yet
          if (this.subjects[entity] === undefined) {
            return itemValues
          }

          const fieldID = itemValues[attrName]
          const dictionary = this.subjects[entity]
          const fieldValue = dictionary[fieldID]
          const key = `${attrName}Val`

          itemValues[key] = fieldValue

          return itemValues
        }, { ...item.data })
      })
    },

    currentDialogEntityMeta () {
      return this.rightAttributesWithMetaInfo.find(
        ({ entity }) => entity === this.dialog.currentEntityName
      )
    }
  },

  watch: {
    rightAttributes: {
      immediate: true,
      handler (value) {
        this.resetSelectedItems(value)
      }
    },

    'dialog.currentEntityName' () {
      this.resetSelectedItems()
    }
  },

  created () {
    for (const { entity, descriptionAttribute } of this.rightAttributesWithMetaInfo) {
      Repository(entity).attrs('ID', descriptionAttribute).select().then(entries => {
        const keyValueMap = entries.reduce((obj, entry) => {
          obj[entry.ID] = entry[descriptionAttribute]

          return obj
        }, {})

        this.$set(this.subjects, entity, keyValueMap)
      })
    }
  },

  methods: {
    ...mapMutations([
      'DELETE_COLLECTION_ITEM',
      'ADD_COLLECTION_ITEM'
    ]),

    deleteAccessRecord (aclID) {
      this.DELETE_COLLECTION_ITEM({
        collection: this.collectionName,
        index: this.currentCollection.items.findIndex(item => item.ID === aclID)
      })
    },

    openDialog () {
      this.dialog.isVisible = true
    },

    closeDialog () {
      this.dialog.isVisible = false
      this.resetSelectedItems()
      this.dialog.currentEntityName = null
    },

    resetSelectedItems (attributes = this.rightAttributes) {
      attributes.forEach(attribute => {
        const { entity } = this.rightAttributesWithMetaInfo.find(
          ({ attrName }) => attrName === attribute
        )
        this.$set(this.dialog.selected, entity, [])
      })
    },

    getCurrentSelectedRepository (entityName) {
      const { attrName, descriptionAttribute } = this.rightAttributesWithMetaInfo.find(
        ({ entity }) => entity === entityName
      )
      const selectedIds = this.aclRlsEntries.map(entry => entry[attrName]).filter(Boolean)
      const repo = Repository(entityName)
        .attrs('ID', descriptionAttribute)
        .whereIf(selectedIds.length, 'ID', 'notIn', selectedIds)

      return () => repo
    },

    async submitRights () {
      await Promise.all(Object.entries(this.dialog.selected).map(([ entity, ids ]) => {
        const { attrName } = this.rightAttributesWithMetaInfo.find(meta => meta.entity === entity)

        return this.addRights({
          entity,
          entries: ids.map(value => ({ [attrName]: value, instanceID: this.instanceId }))
        })
      }))
      this.dialog.isVisible = false
      this.resetSelectedItems()
      this.dialog.currentEntityName = null
    },

    async addRights ({ entity, entries }) {
      const newRightObjects = await Promise.all(
        entries.map(() => this.$UB.connection.addNewAsObject({
          entity: this.currentCollection.entity,
          fieldList: ['ID'],
          __antiMonkeyRequest: Math.random()
        }))
      )

      entries.forEach((entry, index) => {
        this.ADD_COLLECTION_ITEM({
          collection: this.collectionName,
          item: Object.assign(newRightObjects[index], entry)
        })
      })
    }
  }
}

</script>

<style>

.u-acl-rls-input {
  margin-top: 1rem;
}

.u-acl-rls__title {
  margin: 0;
  padding-bottom: 12px;
}

.u-acl-rls__open-dialog {
  padding-left: 10px;
  border: 0;
  font-size: 14px;
  color: hsl(var(--hs-primary), var(--l-state-default));
  background-color: rgba(0, 0, 0, 0);
}

.u-acl-rls__open-dialog:hover,
.u-acl-rls__open-dialog:focus {
  color: hsl(var(--hs-primary), var(--l-state-hover));
  background-color: rgba(0, 0, 0, 0);
}

.u-acl-rls__open-dialog:active {
  color: hsl(var(--hs-primary), var(--l-state-active));
}

.u-acl-rls-input-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.u-acl-rls-input-dialog__form {
  padding: 0;
  word-break: normal;
  overflow: visible;
}

.u-acl-rls-input-overflow > .u-form-row__content {
  overflow: hidden;
}

.u-acl-rls-dialog__footer {
  display: flex;
  justify-content: space-between;
}

</style>

<docs>

```vue
<u-acl-rls-input
  collection-name="rightsSubjects"
  :instance-id="ID"
/>
```
```javascript
<script>
const { Form } = require('@unitybase/adminui-vue')
const { Repository } = require('@unitybase/ub-pub')

module.exports.mount = cfg => {
  Form(cfg)
    .processing({
      collections: {
        rightsSubjects ({state}) {
          // should slect all attributes from domain info as we can use '*' on client side
          const attributes = Object.keys(
            UB.connection.domain.entities['ubm_navshortcut_acl'].attributes
          )

          return Repository('ubm_navshortcut_acl')
            .attrs(attributes)
            .where('instanceID', '=', state.data.ID)
        }
      }
    })
    .validation()
    .mount()
}

module.exports.default = {
  // root component
}
</script>
```

</docs>
