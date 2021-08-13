<template>
  <div
    class="u-acl-rls-input"
    :style="containerStyle"
  >
    <h4 class="u-acl-rls__title">
      {{ $ut('UAclRlsInput.access') }}
    </h4>

    <u-button
      icon="el-icon-plus"
      appearance="inverse"
      class="u-acl-rls__open-dialog"
      @click="openDialog"
    >
      {{ $ut('UAclRlsInput.add') }}
    </u-button>

    <u-table
      v-if="lookupsLoaded"
      :columns="tableColumns"
      :items="aclTableItems"
    >
      <template #removeAction="{row}">
        <u-button
          color="danger"
          @click="deleteAccessRecord(row.ID)"
        >
          {{ $ut('UAclRlsInput.table.remove') }}
        </u-button>
      </template>
    </u-table>

    <el-dialog
      v-hold-focus
      :title="$ut('UAclRlsInput.dialog.grantAccess')"
      :visible.sync="dialog.isVisible"
      :close-on-click-modal="false"
      append-to-body
      width="600px"
      top="0"
      class="u-acl-rls-input-dialog"
      @close="resetSelectedItems"
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
          >
            <el-option
              v-for="{ associatedEntity } in aclAttributes"
              :key="associatedEntity"
              :value="associatedEntity"
              :label="$ut(associatedEntity)"
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

      <template #footer>
        <u-button
          appearance="plain"
          @click="closeDialog"
        >
          {{ $ut('cancel') }}
        </u-button>

        <u-button
          color="primary"
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
const { Repository, connection } = require('@unitybase/ub-pub')
const { UBDomain } = require('@unitybase/cs-shared')

const NOT_FK_ACL_ATTRIBUTES = ['ID', 'valueID', 'instanceID']

async function loadOrdersByEnumGroup (enumGroup) {
  const entries = await Repository('ubm_enum')
    .attrs('sortOrder', 'code', 'eGroup')
    .where('eGroup', '=', enumGroup)
    .select()

  return Object.fromEntries(entries.map(({ code, sortOrder }) => [code, sortOrder]))
}

/**
 * Component is responsible for displaying and managing access rights defined with
 * aclRls entity mixin
 */
export default {
  name: 'UAclRlsInput',

  inject: {
    formMaxWidth: { from: 'maxWidth', default: null }
  },

  props: {
    /**
     * Name of key what you set in collectionRequests object
     */
    collectionName: {
      type: String,
      required: false,
      default () {
        return 'aclRlsEntries'
      }
    },

    /**
     * ID of entry for which we configure access
     */
    instanceId: {
      type: Number,
      required: false,
      default () {
        return this.$store.state.data.ID
      }
    },

    /**
     * max width in px
     */
    maxWidth: {
      type: Number,
      default () {
        return this.formMaxWidth
      }
    }
  },

  data () {
    return {
      dialog: {
        isVisible: false,
        currentEntityName: null,
        selected: {}
      },
      lookups: {},
      lookupsLoaded: false
    }
  },

  computed: {
    containerStyle () {
      if (this.maxWidth) {
        return { maxWidth: this.maxWidth + 'px' }
      }
      return ''
    },

    collectionData () {
      return this.$store.state.collections[this.collectionName]
    },

    aclAttributes () {
      return connection.domain.get(this.collectionData.entity)
        .filterAttribute(attr => !NOT_FK_ACL_ATTRIBUTES.includes(attr.code))
        .map(({ code, associatedEntity }) => {
          const mappedEntities = connection.domain
            .filterEntities(entityDef => entityDef.mixin('unity')?.entity === associatedEntity)
            .map(entityDef => entityDef.code)

          return {
            code,
            associatedEntity,
            mappedEntities,
            hasMappedEntities: mappedEntities.length > 0
          }
        })
    },

    tableColumns () {
      return this.aclAttributes
        .map(({ code, associatedEntity }) => ({
          id: code,
          label: associatedEntity
        }))
        .concat({
          id: 'removeAction',
          label: 'UAclRlsInput.table.remove',
          width: 130
        })
    },

    aclTableItems () {
      return this.collectionData.items.map(item => {
        const entry = { ...item.data }
        for (const { code, associatedEntity } of this.aclAttributes) {
          const fieldID = entry[code]
          entry[code] = this.lookups[associatedEntity][fieldID]
        }
        return entry
      })
    },

    currentAttrMetaInfo () {
      return this.aclAttributes.find(attr => attr.associatedEntity === this.dialog.currentEntityName)
    },

    withMappedEntities () {
      return this.currentAttrMetaInfo?.hasMappedEntities
    },

    canSubmit () {
      return Object.keys(this.dialog.selected).flatMap(entity => this.getSelectedIdsByEntityName(entity)).length > 0
    }
  },

  watch: {
    'dialog.currentEntityName' () {
      this.resetSelectedItems()
    }
  },

  created () {
    this.loadLookups()
  },

  mounted () {
    this.sortMappedEntities()
    this.resetSelectedItems()
  },

  methods: {
    ...mapMutations([
      'DELETE_COLLECTION_ITEM',
      'ADD_COLLECTION_ITEM'
    ]),

    ...mapActions([
      'addCollectionItemWithoutDefaultValues'
    ]),

    async loadLookups () {
      await Promise.all(
        this.aclAttributes.map(attrInfo => this.loadLookupsByEntity(attrInfo.associatedEntity))
      )
      this.lookupsLoaded = true
    },

    async loadLookupsByEntity (entity) {
      const descriptionAttribute = connection.domain.get(entity).getDescriptionAttribute()
      const entries = await Repository(entity).attrs('ID', descriptionAttribute).select()
      const mapById = Object.fromEntries(entries.map(e => [e.ID, e[descriptionAttribute]]))
      this.$set(this.lookups, entity, mapById)
    },

    async sortMappedEntities () {
      for (const { associatedEntity, hasMappedEntities, mappedEntities } of this.aclAttributes) {
        if (!hasMappedEntities) {
          continue
        }

        const getUnityDefaults = entity => connection.domain.get(entity).mixin('unity').defaults
        const getUnityDefaultsKey = entity => Object.keys(getUnityDefaults(entity))
        const arraysIntersaction = (a1, a2) => a1.filter(key => a2.includes(key))

        let commonAttributes = getUnityDefaultsKey(mappedEntities[0])
        for (let i = 1; i < mappedEntities.length; i++) {
          commonAttributes = arraysIntersaction(commonAttributes, getUnityDefaultsKey(mappedEntities[i]))
        }

        if (commonAttributes.length !== 1) {
          throw new Error(
            'You should define only one default value that will be mapped to the unity entity as it defines an order for displaying in UI'
          )
        }

        // set order of controls for unity entities based on values of ONE common attribute
        const [orderAttrName] = commonAttributes

        const getComparator = (reflect = v => v) => (e1, e2) => {
          const order1 = reflect(getUnityDefaults(e1)[orderAttrName])
          const order2 = reflect(getUnityDefaults(e2)[orderAttrName])
          if (!order1 || !order2) {
            return 0
          }
          return order1 > order2 ? 1 : -1
        }

        const orderAttrDef = connection.domain.get(associatedEntity).attributes[orderAttrName]
        const isEnumDataType = orderAttrDef.dataType === UBDomain.ubDataTypes.Enum

        if (isEnumDataType) { // compare by sortOrder of enums
          loadOrdersByEnumGroup(orderAttrDef.enumGroup).then(entries => {
            const comparator = getComparator(code => entries[code])
            mappedEntities.sort(comparator)
          })
        } else { // compare by chars
          mappedEntities.sort(getComparator())
        }
      }
    },

    deleteAccessRecord (aclID) {
      this.DELETE_COLLECTION_ITEM({
        collection: this.collectionName,
        index: this.aclTableItems.findIndex(item => item.ID === aclID)
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

    resetSelectedItems () {
      for (const { associatedEntity, hasMappedEntities, mappedEntities } of this.aclAttributes) {
        const storeByItem = hasMappedEntities
          ? Object.fromEntries(mappedEntities.map(entity => [entity, []]))
          : []
        this.$set(this.dialog.selected, associatedEntity, storeByItem)
      }
    },

    getDialogSelectedIds (unityEntity, entity) {
      const selectedSource = this.dialog.selected[unityEntity]

      if (entity) {
        return selectedSource[entity]
      }

      return Array.isArray(selectedSource)
        ? selectedSource
        : Object.values(selectedSource).flat()
    },

    getSelectedIdsByEntityName (unityEntity, entity) {
      const { code } = this.aclAttributes.find(m => m.associatedEntity === unityEntity)
      const collectionIds = this.collectionData.items.map(item => item.data[code])
      const dialogIds = this.getDialogSelectedIds(unityEntity, entity)

      return [...collectionIds, ...dialogIds].filter(Boolean)
    },

    getRepoForSelectionByEntity (unityEntity, entity) {
      const repoEntityName = entity || unityEntity
      const descriptionAttribute = connection.domain.get(repoEntityName).getDescriptionAttribute()
      const selectedIds = this.getSelectedIdsByEntityName(unityEntity, entity)
      const repo = Repository(repoEntityName)
        .attrs('ID', descriptionAttribute)
        .whereIf(selectedIds.length > 0, 'ID', 'notIn', selectedIds)

      return () => repo
    },

    async submitRights () {
      const requests = Object.keys(this.dialog.selected).flatMap(entity => {
        const { code } = this.aclAttributes.find(meta => meta.associatedEntity === entity)
        const selectedIds = this.getDialogSelectedIds(entity)

        return selectedIds.map(value => ({
          [code]: value,
          instanceID: this.instanceId
        }))
      })

      await Promise.all(
        requests.map(execParams => this.addCollectionItemWithoutDefaultValues({ collection: this.collectionName, execParams }))
      )

      this.closeDialog()
    }
  }
}
</script>

<style>
.u-acl-rls__title {
  margin: 0;
  padding-bottom: 12px;
}

.u-acl-rls-input .u-table {
  max-height: 500px;
  overflow-y: auto;
}

.u-acl-rls__open-dialog {
  padding-left: 10px;
  border: 0;
  font-size: 14px;
  color: hsl(var(--hs-primary), var(--l-state-default));
}

.u-acl-rls-input-dialog {
  display: flex;
  align-items: center;
}
</style>

<docs>
```vue
<template>
  <u-acl-rls-input collection-name="rightsSubjects" />
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const { Repository, connection } = require('@unitybase/ub-pub')

module.exports.mount = cfg => {
  Form(cfg)
    .processing({
      collections: {
        rightsSubjects ({ state }) {
          // should slect all attributes from domain info as we can use '*' on client side
          const attributes = Object.keys(
            connection.domain.entities.ubm_navshortcut_acl.attributes
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

export default {
  ...
}
</script>
```
It is recommended to use the `addCollectionItemWithoutDefaultValues` Vuex action for adding a item to a collection of aclRls entries
</docs>
