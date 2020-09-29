<template>
  <div>
    <h4 class="u-aclRls__title">
      {{ $ut('dfx_DocType_form.tabs.access') }}
    </h4>

    <el-button
      icon="el-icon-plus"
      class="dfx_DocType_form__open-dialog"
      @click="openDialog"
    >
      {{ $ut('dfx_DocType_form.roles.add') }}
    </el-button>

    <u-table
      :columns="tableColumns"
      :items="aclRlsEntries"
    >
      <template
        v-for="attr in rightAttributes"
        #[attr]="{row}"
      >
        {{ row[`${attr}Val`]}}
      </template>

      <template #removeAction="{row}">
        <el-button
          type="danger"
          @click="deleteAccessRecord(row.ID)"
        >
          {{ $ut('aclRlsPane.remove') }}
        </el-button>
      </template>
    </u-table>

    <el-dialog
      v-hold-focus
      :title="$ut('dfx_DocType_form.accessPane.addAccess')"
      :visible.sync="dialog.isVisible"
      :close-on-click-modal="false"
      width="600px"
      top="0"
      class="dfx-dialog"
    >
      <u-form-container
        label-position="top"
        :label-width="200"
        class="dfx-dialog__form"
      >
        <u-form-row label="Select Entity">
          <el-select
            v-model="dialog.currentEntityName"
            placeholder="Select entity"
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
          :label="`aclRlsPane.${currentDialogEntityMeta.attrName}`"
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
        class="dfx-dialog__footer"
      >
        <el-button @click="closeDialog">
          {{ $ut('cancel') }}
        </el-button>

        <el-button
          type="primary"
          @click="submitRights"
        >
          {{ $ut('dfx_DocType_form.roles.add') }}
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
 * Component for managing access rights defined with aclRls entity mixin
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
    }
  },

  data: () => ({
    dialog: {
      isVisible: false,
      currentEntityName: null,
      selected: {}
    },
    subjects: {},
    collectionSnapshot: {}
  }),

  computed: {
    currentCollection () {
      return this.$store.state.collections[this.collectionName]
    },

    aclRlsEntityName () {
      return this.currentCollection.entity
    },

    entityAttributes () {
      return this.$UB.connection.domain.get(this.aclRlsEntityName).attributes
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
      return this.rightAttributes
        .map(attribute => ({
          id: attribute,
          label: `aclRlsPane.${attribute}`
        }))
        .concat({
          id: 'removeAction',
          label: 'aclRlsPane.remove',
          width: 130
        })
    },

    aclRlsEntries () {
      return this.currentCollection.items.map(item => {
        // merge field values from dictionary to each colection item in order to display them in table
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
        }, item.data)
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
      Repository(entity)
        .attrs('ID', descriptionAttribute)
        .select()
        .then(entries => {
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
        .where('ID', 'notIn', selectedIds)

      return () => repo
    },

    async submitRights () {
      await Promise.all(Object.entries(this.dialog.selected).map(
        ([ entity, entries ]) => this.addRights({ entity, entries })
      ))
      this.dialog.isVisible = false
      this.resetSelectedItems()
    },

    async addRights ({ entity, entries }) {
      const newRightObjects = await Promise.all(
        entries.map(() => this.$UB.connection.addNewAsObject({
          entity,
          fieldList: ['ID'],
          __antiMonkeyRequest: Math.random()
        }))
      )

      entries.forEach((entry, index) => {
        this.ADD_COLLECTION_ITEM({
          collection: this.collectionName,
          items: Object.assign(newRightObjects[index], entry)
        })
      })
    }
  }
}

</script>

<style>

</style>

<docs>

</docs>
