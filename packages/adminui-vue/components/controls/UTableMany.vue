<template>
  <div
    :class="{
      'u-table-entity': true,
      'u-table-entity__bordered': true,
      'u-table-many': true,
      'u-table-many--error': isError
    }"
  >
    <div
      v-if="!hideActions.includes('add')"
      class="u-table-entity__head"
    >
      <el-tooltip
        :content="$ut('actionAdd')"
        placement="bottom"
        :open-delay="300"
        :enterable="false"
      >
        <u-button
          appearance="inverse"
          :disabled="disabled"
          icon="u-icon-add"
          color="control"
          @click="showAddDialog"
        />
      </el-tooltip>
    </div>
    <u-table
      ref="table"
      tabindex="1"
      :columns="columns"
      :items="items"
      @contextmenu-cell="showContextMenu"
    >
    </u-table>

    <u-dropdown
      ref="contextMenu"
      class="u-table-entity__contextmenu-wrap"
    >
      <template #dropdown>
        <u-dropdown-item
          icon="u-icon-delete"
          label="Delete"
          :disabled="disabled"
          @click="deleteSelectedItem"
        />
      </template>
    </u-dropdown>

    <el-dialog
      :visible.sync="dialogVisible"
      width="70%"
    >
      <template #title>
        <div class="u-table-many__dialog-title">
          {{ modalTitle }}
        </div>
        <slot name="modalTitle"></slot>
      </template>

      <slot name="modalContentBefore"></slot>

      <u-form-row
        :label="columns[0].label"
        label-position="top"
      >
        <u-select-multiple
          v-model="addValue"
          :repository="getAddNewRepository"
          display-attribute="name"
          remove-default-actions
        />
      </u-form-row>

      <slot name="modalContentAfter"></slot>

      <span slot="footer" class="dialog-footer">
        <el-button @click="closeAddDialog">
          {{ $ut('cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!addValue"
          @click="addItem(addValue)"
        >
          {{ $ut('actionAdd') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

  export default {
    name: 'UTableMany',

    props: {
      /**
       * Array of IDs
       */
      value: {
        type: Array,
        default: () => []
      },
      /**
       * Entity attribute name
       */
      attributeName: {
        type: String,
        required: true
      },
      /**
       * Attribute which is the value for store
       */
      valueAttribute: {
        type: String,
        default: 'ID'
      },
      /**
       * Attribute which is the label for store
       */
      displayAttribute: String,
      /**
       * Set disable status
       */
      disabled: Boolean,
      /**
       * Function which return UBRepository
       */
      repository: Function,
      /**
       * Modal dialog title
       */
      title: String,
      /**
       * List of hidden actions
       */
      hideActions: {
        type: Array,
        default: () => ([])
      }
    },

    inject: ['entitySchema', '$v'],

    data () {
      return {
        items: [],
        options: [],
        contextMenuRowId: null,
        dialogVisible: false,
        addValue: []
      }
    },

    computed: {
      model: {
        get () {
          const value = this.$store.state.data[this.attributeName]
          return !value ? [] : value.split(',').map(i => +i)
        },
        set (value) {
          this.$store.commit('SET_DATA', { key: this.attributeName, value: value.join(',') })
        }
      },

      dataType () {
        return this.entitySchema.attributes[this.attributeName].dataType
      },

      associatedEntity () {
        return this.entitySchema.attributes[this.attributeName].associatedEntity
      },

      getDisplayAttribute () {
        return this.displayAttribute || this.$UB.connection.domain.get(this.associatedEntity).descriptionAttribute
      },

      columns () {
        const column = this.$UB.connection.domain.get(this.associatedEntity).attributes[this.getDisplayAttribute]

        if (!column) {
          throw new Error(`Couldn't find column '${this.getDisplayAttribute}' in entity ${this.associatedEntity}`)
        }

        return [{
          id: this.getDisplayAttribute,
          label: column.caption
        }]
      },

      isError () {
        return this.$v &&
          this.$v[this.attributeName] &&
          this.$v[this.attributeName].$error
      },

      modalTitle () {
        const title = this.title || this.entitySchema.attributes[this.attributeName].caption
        return `${title} (${this.$ut('dobavlenie')})`
      }
    },

    watch: {
      /**
       * Fetch available options when value changes
       */
      model: {
        immediate: true,
        async handler (value) {
          await this.fetchOptions()
          this.items = value.map(i => {
            const displayOption = this.options.find(o => o[this.valueAttribute] === i)
            return {
              [this.getDisplayAttribute]: displayOption && displayOption[this.getDisplayAttribute],
              [this.valueAttribute]: i
            }
          })
        }
      },
      /**
       * Emit input for parent component
       * @param value
       */
      addValue (value) {
        this.$emit('input', value)
      },
      /**
       * Update current list of selected values when parent component initiate that
       */
      value: {
        handler (value) {
          this.addValue = value
        }
      }
    },

    methods: {
      getRepository () {
        if (this.repository) {
          return this.repository()
        }

        return this.$UB.Repository(this.associatedEntity)
          .attrs(this.valueAttribute, this.getDisplayAttribute)
          .orderBy(this.getDisplayAttribute)
      },

      getAddNewRepository () {
        const repositoryClone = this.getRepository().clone()
        return repositoryClone
          .whereIf(this.model.length, this.valueAttribute, 'notIn', this.model)
      },

      async fetchOptions () {
        const repositoryClone = this.getRepository().clone().clearWhereList()
        this.options = await repositoryClone
          .where(this.valueAttribute, 'in', this.model)
          .select()
      },

      showContextMenu ({ event, row }) {
        this.contextMenuRowId = row.ID
        this.$refs.contextMenu.show(event)
      },

      deleteSelectedItem () {
        if (!this.contextMenuRowId) return

        this.model = this.model.filter(i => i !== this.contextMenuRowId)
      },

      showAddDialog () {
        this.addValue = []
        this.dialogVisible = true
      },

      closeAddDialog () {
        this.dialogVisible = false
      },

      addItem (item) {
        if (!item) return

        this.model = Array.from(new Set([...this.model, ...item]))
        this.closeAddDialog()
      }
    },

    created () {
      if (this.dataType !== 'Many') {
        throw new Error('UTableMany \'attributeName\' should have dataType \'Many\'')
      }
    }
  }
</script>

<style>
  .u-table-many--error {
    border-color: hsl(var(--hs-danger),var(--l-input-border-default));
  }

  .u-table-many__dialog-title {
    font-size: 18px;
  }
</style>
