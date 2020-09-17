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
            :entity-name="entityName"
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
          @click="addOrgUnits"
        >
          {{ $ut('dfx_DocType_form.roles.add') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

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
    subjects: {}
  }),

  computed: {
    currenctCollection () {
      return this.$store.state.collections[this.collectionName]
    },

    entityName () {
      return this.currenctCollection.entity
    },

    entityAttributes () {
      return this.$UB.connection.domain.get(this.entityName).attributes
    },

    rightAttributes () {
      return Object.keys(this.attributes).filter(attr => !NOT_FK_ACL_ATTRIBUTES.includes(attr))
    },

    rightAttributesEntities () {
      return rightAttributes.map(attr => this.attributes[attr].associatedEntity)
    },

    rightAttrbiutesEntitesWithDescrAttr () {
      return thi.rightAttributesEntities.map(etity => {
        const { descriptionAttribute } = UB.connection.domain.get(entity)

        return { entity, descriptionAttribute}
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
        return {

        }
      })
    }
  },

  async created () {
    for (const { entity, descriptionAttribute } of this.rightAttrbiutesEntitesWithDescrAttr) {
      this.$UB.connection
        .Repository(entity)
        .attrs('ID', descriptionAttribute)
        .select()
        .then(entries => this.subjects[entity] = entries)
    }
  },

  methods: {
    openDialog() {
      this.dialogVisible = true
    },

    closeDialog() {
      this.dialogVisible = false
    }
  }
}

</script>

<style>

</style>

<docs>

</docs>
