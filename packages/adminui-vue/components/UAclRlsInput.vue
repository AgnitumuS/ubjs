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
      @close="resetSelectedItems"
      @open="setSocus"
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
            ref="selectEntity"
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

        <template v-if="dialog.currentEntityName">
          <u-form-row
            v-if="!withMappedEntities"
            :label="dialog.currentEntityName"
            class="u-acl-rls-input-overflow"
          >
            <u-select-multiple
              v-model="dialog.selected[dialog.currentEntityName]"
              :repository="getRepoForSelectionByEntity(dialog.currentEntityName)"
              clearable
            />
          </u-form-row>
          <template v-else>
            <u-form-row
              v-for="childEntity in currentAttrMetaInfo.mappedEntities"
              :key="childEntity"
              :label="childEntity"
              class="u-acl-rls-input-overflow"
            >
              <u-select-multiple
                v-model="dialog.selected[dialog.currentEntityName][childEntity]"
                :repository="getRepoForSelectionByEntity(dialog.currentEntityName, childEntity)"
                clearable
              />
            </u-form-row>
          </template>
        </template>

      </u-form-container>

      <template slot="footer">
        <u-button
          appearance="plain"
          @click="closeDialog"
        >
          {{ $ut('cancel') }}
        </u-button>

        <u-button
          type="primary"
          :disabled="!canSubmit"
          @click="submitRights"
        >
          {{ $ut('UAclRlsInput.dialog.grant') }}
        </u-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
const { mapMutations, mapActions } = require('vuex')
const { Repository } = require('@unitybase/ub-pub')
const { UBDomain } = require('@unitybase/cs-shared')

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
    subjects: {},
    enumOrders: {}
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
        const mappedEntities = this.getMappedEntities(entity)

        return {
          attrName,
          entity,
          mappedEntities,
          hasMappedEntities: mappedEntities.length > 0
        }
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

    currentAttrMetaInfo () {
      return this.rightAttributesWithMetaInfo.find(
        meta => meta.entity === this.dialog.currentEntityName
      )
    },

    withMappedEntities () {
      return this.currentAttrMetaInfo && this.currentAttrMetaInfo.hasMappedEntities
    },

    canSubmit () {
      const selectedIds = Object.keys(this.dialog.selected).flatMap(entityName => {
        return this.getSelectedIdsByEntityName(entityName)
      })

      return selectedIds.length > 0
    }
  },

  watch: {
    rightAttributes: {
      immediate: true,
      async handler () {
        await this.$nextTick()
        this.resetSelectedItems()
      }
    },

    'dialog.currentEntityName' () {
      this.resetSelectedItems()
    }
  },

  created () {
    this.loadSubjects()
    this.loadEnumOrdersAndSortMappedEntities()
  },

  methods: {
    ...mapMutations([
      'DELETE_COLLECTION_ITEM',
      'ADD_COLLECTION_ITEM'
    ]),

    ...mapActions([
      'addCollectionItemWithoutDefaultValues'
    ]),

    loadSubjects () {
      for (const { entity } of this.rightAttributesWithMetaInfo) {
        const { descriptionAttribute } = this.$UB.connection.domain.get(entity)
        Repository(entity).attrs('ID', descriptionAttribute).select().then(entries => {
          const keyValueMap = entries.reduce((obj, entry) => {
            obj[entry.ID] = entry[descriptionAttribute]

            return obj
          }, {})

          this.$set(this.subjects, entity, keyValueMap)
        })
      }
    },

    async loadEnumOrdersAndSortMappedEntities() {
      for (const { entity, hasMappedEntities, mappedEntities } of this.rightAttributesWithMetaInfo) {
        if (!hasMappedEntities) {
          continue
        }

        const enumAttrs = Object.entries(this.$UB.connection.domain.get(entity).attributes)
          .filter(([, attrInfo]) => attrInfo.dataType === UBDomain.ubDataTypes.Enum)

        const enums = await Promise.all(enumAttrs.flatMap(([, { enumGroup }]) => {
          return Repository('ubm_enum')
            .attrs('sortOrder', 'code', 'eGroup')
            .where('eGroup', '=', enumGroup)
            .select()
        }))
        enums.flat().forEach(({ sortOrder, code, eGroup }) => {
          const enumKey = eGroup + code
          this.$set(this.enumOrders, enumKey, sortOrder)
        })
        this.sortMappedEntitites(mappedEntities, entity)
      }
    },

    deleteAccessRecord (aclID) {
      this.DELETE_COLLECTION_ITEM({
        collection: this.collectionName,
        index: this.currentCollection.items.findIndex(item => item.data.ID === aclID)
      })
    },

    async setSocus () {
      await this.$nextTick()
      this.$refs.selectEntity.focus()
    },

    openDialog () {
      this.dialog.isVisible = true
    },

    closeDialog () {
      this.dialog.isVisible = false
      this.resetSelectedItems()
      this.dialog.currentEntityName = null
    },

    resetSelectedItems () {
      this.rightAttributes.forEach(attribute => {
        const { entity, hasMappedEntities, mappedEntities } = this.rightAttributesWithMetaInfo.find(
          ({ attrName }) => attrName === attribute
        )
        if (hasMappedEntities) {
          this.$set(this.dialog.selected, entity, {})
          mappedEntities.forEach(mappedEntity => {
            this.$set(this.dialog.selected[entity], mappedEntity, [])
          })
        } else {
          this.$set(this.dialog.selected, entity, [])
        }
      })
    },

    getMappedEntities (masterEntityName) {
      return Object.entries(this.$UB.connection.domain.entities)
        .filter(([entityName, entityInfo]) => {
          if (!entityInfo.hasMixin('unity')) {
            return false
          }

          const unityEntity = entityInfo.mixin('unity').entity

          return unityEntity === masterEntityName
        })
        .map(([entityName]) => entityName)
    },

    /**
     * Function for sorting mapped enetites of `masteEntityName` entity. It sorts array
     * of entites' names by defaults property of `unity` mixin. If you define
     * several default values in `unity` mixin error will be throwed since there
     * should be only one attribute that will be used for sorting in UI.
     */
    sortMappedEntitites (entities, masterEntityName) {
      const masterEntityMetaInfo = this.$UB.connection.domain.get(masterEntityName)

      entities.sort((entity1, entity2) => {
        const entityInfo1 = this.$UB.connection.domain.get(entity1)
        const entityInfo2 = this.$UB.connection.domain.get(entity2)
        const defaults1 = entityInfo1.mixin('unity').defaults
        const defaults2 = entityInfo2.mixin('unity').defaults

        if (!defaults1 || !defaults2) {
          return 0
        }

        const commonAttributes = Object.keys(defaults1).filter(key => {
          return Object.keys(defaults2).includes(key)
        })

        if (commonAttributes.length !== 1) {
          throw new Error(
            `You should define only one default value that will be mapped to the unity entity as it defines an order for displaying in UI.`
          )
        }

        const [unityClassifierAttribute] = commonAttributes
        const value1 = defaults1[unityClassifierAttribute]
        const value2 = defaults2[unityClassifierAttribute]
        const classifierInfo = masterEntityMetaInfo.attributes[unityClassifierAttribute]
        const isEnumDataType = classifierInfo.dataType === UBDomain.ubDataTypes.Enum

        if (isEnumDataType) {
          const { enumGroup } = classifierInfo
          const order1 = this.enumOrders[enumGroup + value1]
          const order2 = this.enumOrders[enumGroup + value2]

          if (!order1 || !order2) {
            return 0
          }

          // compare sortOrder of ubm_enum entity
          return order1 > order2 ? 1 : -1
        }

        // compare chars
        return value1 > value2 ? 1 : -1
      })
    },

    getDialogSelectedIds (unityEntity, entity) {
      const selectedSource = this.dialog.selected[unityEntity]

      if (entity) {
        return selectedSource[entity]
      }

      const flattenSelectedIds = Array.isArray(selectedSource)
        ? selectedSource
        : Object.values(selectedSource).flat()

      return flattenSelectedIds
    },

    getSelectedIdsByEntityName (unityEntity, entity) {
      const { attrName } = this.rightAttributesWithMetaInfo.find(m => m.entity === unityEntity)
      const collectionIds = this.currentCollection.items.map(item => item.data[attrName])
      const dialogIds = this.getDialogSelectedIds(unityEntity, entity)

      return [...collectionIds, ...dialogIds].filter(Boolean)
    },

    getRepoForSelectionByEntity (unityEntity, entity) {
      const repoEntityName = entity || unityEntity
      const { descriptionAttribute } = this.$UB.connection.domain.get(repoEntityName)
      const selectedIds = this.getSelectedIdsByEntityName(unityEntity, entity)
      const repo = Repository(repoEntityName)
        .attrs('ID', descriptionAttribute)
        .whereIf(selectedIds.length, 'ID', 'notIn', selectedIds)

      return () => repo
    },

    async submitRights () {
      const requests = Object.keys(this.dialog.selected).flatMap(entity => {
        const { attrName } = this.rightAttributesWithMetaInfo.find(meta => meta.entity === entity)
        const selectedIds = this.getDialogSelectedIds(entity)

        return selectedIds.map(value => ({
          [attrName]: value,
          instanceID: this.instanceId
        }))
      })

      await Promise.all(
        requests.map(request => {
          return this.addCollectionItemWithoutDefaultValues({
            collection: this.collectionName,
            execParams: request
          })
        })
      )

      this.closeDialog()
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

If you want to add some item to collection of aclRls entries use `addCollectionItemWithoutDefaultValues` Vuex action

</docs>
