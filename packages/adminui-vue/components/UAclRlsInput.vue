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


    <el-dialog>
      <u-form-container
        label-position="top"
        :label-width="200"
        class="dfx-dialog__form"
      >
        <u-form-row
          v-for="attribute in rightAttributes"
          :key="attribute"
          :label="`aclRlsPane.${attribute}`"
        >
          <u-select-collection
            :associated-attr="attribute"
            :entity-name="aclRlsEntityName"
            :collection-name="collectionName"
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
          @click="addRights"
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

export default {
  name: 'UAclRlsInput',

  props: {
    collectionName: {
      type: String,
      required: true
    }
  },

  data: () => ({
    dialogVisible: false,
    subjects: {},
    collectionSnapshot: {}
  }),

  computed: {
    currenctCollection () {
      return this.$store.state.collections[this.collectionName]
    },

    aclRlsEntityName () {
      return this.currenctCollection.entity
    },

    entityAttributes () {
      return this.$UB.connection.domain.get(this.aclRlsEntityName).attributes
    },

    rightAttributes () {
      return Object.keys(this.attributes).filter(attr => !NOT_FK_ACL_ATTRIBUTES.includes(attr))
    },

    rightAttributesWithMetaInfo () {
      return this.rightAttributes.map(attrName => {
        const entity = this.entityAttributes[attrName].associatedEntity
        const { descriptionAttribute } = UB.connection.domain.get(entity)

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
      return this.currenctCollection.items.map(item => {
        // merge field values from dictionary to each colection item in order to display them in table
        return this.rightAttributesWithMetaInfo.reduce((itemValues, { entity, attrName }) => {
          const fieldID = itemValues[attrName]
          const fieldValue = this.subjects[entity][fieldID]

          itemValues[`${attrName}Val`] = fieldValue

          return itemValues
        }, item)
      })
    }
  },

  created () {
    for (const { entity, descriptionAttribute } of this.rightAttributesWithMetaInfo) {
      this.$UB.connection
        .Repository(entity)
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
      'LOAD_COLLECTION'
    ]),

    deleteAccessRecord (aclID) {
      this.DELETE_COLLECTION_ITEM({
        collection: this.collectionName,
        index: this.currenctCollection.items.findIndex(item => item.ID === aclID)
      })
    },

    openDialog() {
      this.collectionSnapshot = this.currenctCollection
      this.dialogVisible = true
    },

    closeDialog() {
      this.resetCollectionByPrevoiusSnapshot()
      this.collectionSnapshot = {}
      this.dialogVisible = false
    },

    resetCollectionByPrevoiusSnapshot () {
      this.LOAD_COLLECTION({
        collection: this.collectionName,
        items: this.collectionSnapshot.items,
        entity: this.aclRlsEntityName
      })
      this.collectionSnapshot.deleted.forEach((_, index) => {
        this.DELETE_COLLECTION_ITEM({
          collection: this.collectionName,
          index
        })
      })
    },

    addRights () {
      this.collectionSnapshot = {}
      this.dialogVisible = false
    }
  }
}

</script>

<style>

</style>

<docs>

</docs>
