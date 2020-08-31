<template>
  <div class="u-table-register">
    <u-table-entity
      ref="masterTable"
      v-bind="$attrs"
      :before-initial-load="onInitialLoad"
      v-on="$listeners"
      @change-row="selectedRowId = $event"
    >
      <template
        v-for="slot in Object.keys($scopedSlots)"
        :slot="slot"
        slot-scope="scope"
      >
        <slot
          :name="slot"
          v-bind="scope"
        />
      </template>

      <template #contextMenuDetails="scope">
        <slot
          :scope="scope"
          name="contextMenuDetails"
        >
          <u-dropdown-item
            v-if="details.length"
            label="Details"
            icon="u-icon-file-text"
          >
            <u-dropdown-item
              v-for="detail in details"
              :key="detail.entity + detail.attribute"
              :disabled="detail === selectedDetail && detailsVisible"
              :label="formatDetailLabel(detail)"
              @click="showDetail(detail)"
            />
          </u-dropdown-item>
        </slot>
      </template>

      <template #toolbarDropdownAppend="scope">
        <slot
          :scope="scope"
          name="dropdownMenuDetails"
        >
          <u-dropdown-item
            v-if="details.length"
            label="Details"
            icon="u-icon-file-text"
          >
            <u-dropdown-item
              v-for="detail in details"
              :key="detail.entity + detail.attribute"
              :disabled="detail === selectedDetail && detailsVisible"
              :label="formatDetailLabel(detail)"
              @click="showDetail(detail)"
            />
          </u-dropdown-item>
        </slot>

        <slot
          :scope="scope"
          name="toolbarDropdownAppend"
        />
      </template>
    </u-table-entity>

    <template v-if="detailsVisible">
      <div class="u-table-register__divider">
        <div class="u-table-register__divider-title">
          {{ formatDetailLabel(selectedDetail) }}
        </div>
        <button
          class="u-table-register__divider-button"
          @click="detailsVisible = false"
        >
          <i class="u-icon-eye-slash" />
          {{ $ut('tableRegister.hideDetails') }}
        </button>

        <div class="u-table-register__divider-line" />
      </div>

      <u-table-entity
        ref="detailsTable"
        class="u-table-register__details"
        :repository="repository"
        :columns="columns"
        :build-add-new-config="buildDetailAddNewConfig"
      />
    </template>
  </div>
</template>

<script>
const { throttle } = require('throttle-debounce')

/**
 * Same as UTableEntity but with details grid.
 */
export default {
  name: 'UMasterDetailView',

  mixins: [
    require('./localStorageMixin')
  ],

  data () {
    return {
      rowId: null,
      selectedDetail: null,
      detailsVisible: false,
      selectedRowId: null
    }
  },

  computed: {
    entityName () {
      const { entityName, repository } = this.$attrs
      if (entityName) {
        return entityName
      }

      if (typeof repository === 'object') {
        return this.$UB.Repository(repository)
      }

      if (typeof repository === 'function') {
        return repository().entityName
      }

      return ''
    },

    details () {
      const result = []
      const thisE = this.entityName
      this.$UB.connection.domain.eachEntity(function (curEntity, curEntityName) {
        // [unitybase/ubjs#2] - do not display refs to attributes of "many" type
        if ((curEntityName !== thisE) && curEntity.haveAccessToMethod('select')) {
          curEntity.eachAttribute(function (curAttr, curAttrCode) {
            // TODO - use assotiationKind here when it added to Domain
            if ((curAttr.associatedEntity === thisE /* reject many attribute */) && !curAttrCode.startsWith('ID') &&
              !curAttrCode.startsWith('mi_')) {
              result.push({
                attribute: curAttrCode,
                entity: curEntityName
              })
            }
          })
        }
      })
      return result
    },

    schema () {
      return this.$UB.connection.domain.get(this.selectedDetail.entity)
    },

    columns () {
      return this.schema
        .filterAttribute(a => a.defaultView && a.code !== this.selectedDetail.attribute)
        .map(a => a.code)
    }
  },

  watch: {
    selectedRowId () {
      if (this.$refs.detailsTable) {
        this.refreshMasterTable()
      }
    }
  },

  methods: {
    repository () {
      const columns = [...new Set(
        this.columns.concat(this.selectedDetail.attribute)
      )]

      return this.$UB.Repository(this.selectedDetail.entity)
        .attrs(columns)
        .where(this.selectedDetail.attribute, '=', this.selectedRowId)
    },

    async showDetail (detail) {
      this.selectedDetail = detail
      this.detailsVisible = true
      await this.$nextTick()
      this.refreshMasterTable()
      this.$refs.masterTable.$el.focus()
    },

    refreshMasterTable: throttle(
      50,
      true,
      function () {
        this.$refs.detailsTable.$store.dispatch('refresh')
      }),

    formatDetailLabel ({ entity, attribute }) {
      const hasSameEntity = this.details.filter(d => d.entity === entity).length > 1
      if (hasSameEntity) {
        const attributeLabelText = this.$ut(`${entity}.${attribute}`)
        const attributeLabel = ` (${attributeLabelText})`
        return this.$ut(entity) + attributeLabel
      } else {
        return this.$ut(entity)
      }
    },

    buildDetailAddNewConfig (cfg) {
      cfg.parentContext = {
        [this.selectedDetail.attribute]: this.selectedRowId
      }
      return cfg
    }
  }
}
</script>

<style>
  .u-table-register {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .u-table-register > .u-table-entity {
    overflow: auto;
    flex-grow: 1;
  }

  .u-table-register__details {
    min-height: 50%;
    max-height: 75%;
  }

  .u-table-register__divider {
    padding: 4px 0;
    display: flex;
    align-items: center;
  }

  .u-table-register__divider-line {
    flex-grow: 1;
    height: 1px;
    background: hsl(var(--hs-border), var(--l-layout-border-default));
  }

  .u-table-register__divider-title {
    padding: 0 10px;
    font-size: 18px;
    line-height: 1;
  }

  .u-table-register__divider-button {
    color: hsl(var(--hs-primary), var(--l-text-default));
    font-size: 15px;
    background: none;
    border: none;
    padding-right: 10px;
    padding-left: 0;
    cursor: pointer;
  }

  .u-table-register__divider-button:hover{
    color: hsl(var(--hs-primary), var(--l-state-hover));
  }
</style>