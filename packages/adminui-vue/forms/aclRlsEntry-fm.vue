<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading="loading"
      label-position="top"
    >
      <u-form-row
        label="aclRlsEntry_form.entity"
        class="u-acl-rls-input-overflow"
      >
        <el-select
          v-model="selectedEntity"
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

      <template v-if="selectedEntity">
        <u-form-row
          v-if="mappedEntitiesBySelectedEntity.length === 0"
          :label="selectedEntity"
          class="u-acl-rls-input-overflow"
        >
          <u-select-multiple
            v-model="aclRlsEntries[selectedEntity]"
            :repository="getRepoForSelectionByEntity(selectedEntity)"
            clearable
          />
        </u-form-row>

        <template v-else>
          <u-form-row
            v-for="childEntity in mappedEntitiesBySelectedEntity"
            :key="childEntity"
            :label="childEntity"
            class="u-acl-rls-input-overflow"
          >
            <u-select-multiple
              v-model="aclRlsEntries[selectedEntity][childEntity]"
              :repository="getRepoForSelectionByEntity(selectedEntity, childEntity)"
              clearable
            />
          </u-form-row>
        </template>
      </template>
    </u-form-container>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const { Repository, connection } = require('@unitybase/ub-pub')
const { mapMutations, mapActions, mapGetters } = require('vuex')

const ACL_RLS_COLLECTION = 'aclRlsEntries'

module.exports.mount = cfg => {
  const { instanceID } = cfg.props

  Form({
    ...cfg,
    props: {
      ...cfg.props,
      parentContext: { instanceID }
    }
  })
    .store()
    .processing({
      collections: {
        [ACL_RLS_COLLECTION] () {
          return Repository(cfg.entity)
            .attrs('ID', 'instanceID', ...cfg.props.aclAttributes.map(attr => attr.code))
            .where('instanceID', '=', instanceID)
        }
      },

      inited ({ commit }) {
        commit('IS_NEW', false)
      }
    })
    .mount()
}

export default {
  name: 'AclRlsEntry',

  props: {
    aclAttributes: {
      type: Array,
      required: true
    },

    instanceID: {
      type: Number,
      required: true
    }
  },

  data () {
    return {
      selectedEntity: null,
      aclRlsEntries: null
    }
  },

  computed: {
    ...mapGetters(['loading']),

    collectionItems () {
      return this.$store.state.collections[ACL_RLS_COLLECTION].items.map(item => item.data)
    },

    mappedEntitiesForAclAttrs () {
      return Object.fromEntries(
        this.aclAttributes.map(attrDef => {
          const mappedEntities = connection.domain
            .filterEntities(entityDef => entityDef.mixin('unity')?.entity === attrDef.associatedEntity)
            .map(entityDef => entityDef.code)
          return [attrDef.associatedEntity, mappedEntities]
        })
      )
    },

    mappedEntitiesBySelectedEntity () {
      return this.mappedEntitiesForAclAttrs[this.selectedEntity]
    },

    aclRlsEntriesKey () {
      return JSON.stringify(this.aclRlsEntries)
    }
  },

  watch: {
    selectedEntity: 'resetSelectedItems',

    aclRlsEntriesKey (value, prevValue) {
      if (prevValue !== 'null') {
        this.syncAclRlsEntriesWithCollection(value, prevValue)
      }
    }
  },

  mounted () {
    this.sortMappedEntites()
  },

  methods: {
    ...mapMutations([
      'DELETE_COLLECTION_ITEM'
    ]),

    ...mapActions([
      'addCollectionItemWithoutDefaultValues'
    ]),

    sortMappedEntites () {

    },

    resetSelectedItems () {
      this.aclRlsEntries = Object.fromEntries(
        this.aclAttributes.map(attr => {
          const mappedEntities = this.mappedEntitiesForAclAttrs[attr.associatedEntity]
          const defaultValue = mappedEntities.length > 0
            ? Object.fromEntries(mappedEntities.map(entity => [entity, []]))
            : []
          return [attr.associatedEntity, defaultValue]
        })
      )
    },

    pickAclAttributeValues ({
      source = this.aclRlsEntries,
      unityEntity,
      entity
    }) {
      const selectedSource = source[unityEntity]

      if (entity) {
        return selectedSource[entity]
      }

      return Array.isArray(selectedSource)
        ? selectedSource
        : Object.values(selectedSource).flat()
    },

    getRepoForSelectionByEntity (unityEntity, entity) {
      const repoEntityName = entity || unityEntity
      const descriptionAttribute = connection.domain.get(repoEntityName).getDescriptionAttribute()

      const selectedIds = this.pickAclAttributeValues({ unityEntity, entity })
      const attrDef = this.aclAttributes.find(attr => attr.associatedEntity === unityEntity)
      const collectionIds = this.collectionItems.map(item => item[attrDef.code]).filter(Boolean)
      const allSelectedIds = [...selectedIds, ...collectionIds]

      const repo = Repository(repoEntityName)
        .attrs('ID', descriptionAttribute)
        // not show in the select control already selected items
        .whereIf(allSelectedIds.length > 0, 'ID', 'notIn', allSelectedIds)

      return () => repo
    },

    async syncAclRlsEntriesWithCollection (value, prevValue) {
      const promises = []

      for (const aclAttr of this.aclAttributes) {
        const currentIds = this.pickAclAttributeValues({ source: JSON.parse(value), unityEntity: aclAttr.associatedEntity })
        const prevIds = this.pickAclAttributeValues({ source: JSON.parse(prevValue), unityEntity: aclAttr.associatedEntity })

        const newIds = currentIds.filter(id => !prevIds.includes(id))
        for (const valueID of newIds) {
          promises.push(
            this.addCollectionItemWithoutDefaultValues({
              collection: ACL_RLS_COLLECTION,
              execParams: {
                [aclAttr.code]: valueID,
                instanceID: this.instanceID
              }
            })
          )
        }

        const removedIds = prevIds.filter(id => currentIds.includes(id))
        for (const [index, item] of [...this.collectionItems.entries()].reverse()) {
          if (removedIds.includes(item[aclAttr.code])) {
            this.DELETE_COLLECTION_ITEM({
              collection: ACL_RLS_COLLECTION,
              index
            })
          }
        }
      }

      await Promise.all(promises)
    }
  }
}
</script>
