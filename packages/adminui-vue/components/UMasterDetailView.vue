<template>
  <div class="u-table-register">
    <u-table-entity
      ref="masterTable"
      v-bind="$attrs"
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
            icon="el-icon-tickets"
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
          <i class="far fa-eye-slash" />
          {{ $ut('tableRegister.hideDetails') }}
        </button>

        <div class="u-table-register__divider-line" />
      </div>

      <u-table-entity
        ref="detailsTable"
        class="u-table-register__details"
        :repository="repository"
        :columns="columns"
      />
    </template>
  </div>
</template>

<script>
/**
 * Same as UTableEntity but with details grid.
 */
export default {
  name: 'UMasterDetailView',

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
      const { entities } = this.$UB.connection.domain
      return Object.entries(entities)
        .reduce((accum, [entityCode, entityData]) => {
          const isCurrentEntity = entityCode === this.entityName
          const hasAccess = entityData.haveAccessToMethod('select')
          const attributes = Object.entries(entityData.attributes)
          const relativeAttributes = attributes.filter(([attrCode, attrData]) => {
            const equalCurrentEntity = attrData.associatedEntity === this.entityName
            const isSystemAttr = attrCode.startsWith('ID') || attrCode.startsWith('mi_')
            /**
             * TODO: replace isMany check to association from meta file.
             * Temporary solution is exclude attrs with type Many.
             * That because dont have some flag in meta file which shows relations type.
             * @Pavel.mash said he would add such an opportunity later.
             */
            const isMany = attrData.dataType === 'Many'

            return equalCurrentEntity && !isSystemAttr && !isMany
          })
          const hasRelatives = relativeAttributes.length > 0

          if (!isCurrentEntity && hasAccess && hasRelatives) {
            for (const [attrCode, attrData] of relativeAttributes) {
              accum.push({
                attribute: attrCode,
                entity: attrData.entity.code
              })
            }
          }
          return accum
        }, [])
    },

    schema () {
      return this.$UB.connection.domain.get(this.selectedDetail.entity)
    },

    columns () {
      return this.schema
        .filterAttribute(a => a.defaultView)
        .map(a => a.code)
    }
  },

  watch: {
    selectedRowId () {
      if (this.$refs.detailsTable) {
        this.$refs.detailsTable.$store.dispatch('refresh')
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
      this.$refs.detailsTable.$store.dispatch('refresh')
      this.$refs.masterTable.$el.focus()
    },

    formatDetailLabel ({ entity, attribute }) {
      const attributeLabel = this.$ut(`${entity}.${attribute}`)
      return `${this.$ut(entity)} (${attributeLabel})`
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
  }

  .u-table-register__divider {
    padding: 4px 0;
    display: flex;
    align-items: center;
  }

  .u-table-register__divider-line {
    flex-grow: 1;
    height: 1px;
    background: rgba(var(--info), 0.3);
  }

  .u-table-register__divider-title {
    padding: 0 10px;
    font-size: 18px;
    line-height: 1;
  }

  .u-table-register__divider-button {
    color: rgb(var(--primary));
    font-size: 15px;
    background: none;
    border: none;
    padding-right: 10px;
    padding-left: 0;
    cursor: pointer;
  }

  .u-table-register__divider-button:hover{
    color: rgba(var(--primary), 0.7);
  }
</style>
