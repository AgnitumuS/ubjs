<template>
  <div
    class="u-table-register"
    :class="{ 'u-table-register--preview-mode': viewMode === 'previewForm' }"
  >
    <div class="u-table-register__view">
      <u-table-entity
        ref="masterTable"
        :bordered="false"
        v-bind="$attrs"
        :before-initial-load="onInitialLoad"
        :class="{
          'u-table-register__view__preview-form-mode':
            viewMode === 'previewForm'
        }"
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
            v-bind="scope"
            name="contextMenuDetails"
          >
            <template v-if="details.length">
              <u-dropdown-item divider />
              <u-dropdown-item
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
            </template>
          </slot>
        </template>
        <template #toolbarDropdownAppend="scope">
          <slot
            v-bind="scope"
            name="dropdownMenuDetails"
          >
            <template v-if="details.length">
              <u-dropdown-item divider />
              <u-dropdown-item
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
            </template>
          </slot>
          <slot
            v-bind="scope"
            name="toolbarDropdownAppend"
          />
        </template>
        <template #toolbarDropdownViewMode="scope">
          <slot
            name="toolbarDropdownViewMode"
            v-bind="scope"
          >
            <u-dropdown-item
              label="table.viewMode.label"
              icon="u-icon-eye"
            >
              <u-dropdown-item
                v-for="button in viewModeButtons"
                :key="button.code"
                :disabled="viewMode === button.code"
                :label="button.label"
                :icon="button.icon"
                @click="viewMode = button.code"
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
    <preview-form
      v-if="viewMode === 'previewForm'"
      :id="selectedRowId"
      ref="previewForm"
      :entity="entityName"
      class="u-table-register__form-preview"
      @cancel-close="setSelectedRow"
    />
  </div>
</template>

<script>
/* global $App */
const { throttle } = require('throttle-debounce')

/**
 * Same as UTableEntity but with details grid.
 */
export default {
  name: 'UMasterDetailView',

  components: {
    PreviewForm: require('./PreviewForm.vue').default
  },

  props: {
    /**
     * Used as `instance` part to store soring, filters and viewMode into $uiSettings
     */
    shortcutCode: {
      type: String,
      default: undefined
    }
  },

  data () {
    return {
      rowId: null,
      selectedDetail: null,
      detailsVisible: false,
      selectedRowId: null,
      viewModeButtons: [
        {
          code: 'table',
          label: 'table.viewMode.table',
          icon: 'u-icon-grid'
        },
        {
          code: 'card',
          label: 'table.viewMode.card',
          icon: 'u-icon-attributes'
        },
        {
          code: 'previewForm',
          label: 'showPreview',
          icon: 'u-icon-window-left'
        }
      ],
      viewMode: null
    }
  },

  computed: {
    entityName () {
      const eName = this.$attrs.entity || this.$attrs.entityName
      if (eName) {
        return eName
      }
      const repository = this.$attrs.repository
      if (typeof repository === 'object') {
        return repository.entity
      }
      if (typeof repository === 'function') {
        return repository().entityName
      }
      return ''
    },

    details () {
      const thisEntity = $App.domainInfo.get(this.entityName)
      return thisEntity.getDetailsForUI().map((attr) => {
        return { entity: attr.entity.name, attribute: attr.name }
      })
    },

    schema () {
      return this.$UB.connection.domain.get(this.selectedDetail.entity)
    },

    columns () {
      return this.schema
        .filterAttribute(
          (a) => a.defaultView && a.code !== this.selectedDetail.attribute
        )
        .map((a) => a.code)
    }
  },

  watch: {
    selectedRowId () {
      if (this.$refs.detailsTable) {
        this.refreshMasterTable()
      }
    },

    viewMode (mode) {
      switch (mode) {
        case 'table':
        case 'card':
          this.$refs.masterTable.$store.commit('SET_VIEW_MODE', mode)
          break
        case 'previewForm':
          this.$refs.masterTable.$store.commit('SET_VIEW_MODE', 'card')
          break
      }
    }
  },

  beforeDestroy () {
    if (!this._unwatchList) return
    for (const unwatchFn of this._unwatchList) {
      unwatchFn()
    }
  },

  methods: {
    setSelectedRow (id) {
      this.$refs.masterTable.$store.commit('SELECT_ROW', id)
    },

    repository () {
      const columns = Array.from(
        new Set(this.columns.concat(this.selectedDetail.attribute))
      )

      return this.$UB
        .Repository(this.selectedDetail.entity)
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
      function () {
        this.$refs.detailsTable.$store.dispatch('refresh')
      },
      { noTrailing: true }
    ),

    formatDetailLabel ({ entity, attribute }) {
      const hasSameEntity =
        this.details.filter((d) => d.entity === entity).length > 1
      if (hasSameEntity) {
        const attributeLabelText = this.$ut(`${entity}.${attribute}`)
        const attributeLabel = ` (${attributeLabelText})`
        return this.$ut(entity) + attributeLabel
      } else {
        return this.$ut(entity)
      }
    },

    buildDetailAddNewConfig (cfg) {
      cfg.props = {
        parentContext: {
          [this.selectedDetail.attribute]: this.selectedRowId
        }
      }
      return cfg
    },

    /**
     * UMasterDetailView call this method to restore saved "view mode", "sort" and "filters",
     * watching on it and persist while changed
     *
     * @param {Vue} masterTableInstance Master table instance
     * @param {Store} masterTableInstance.$store Master instance store
     */
    initLocalStorageWatcher (masterTableInstance) {
      if (this.shortcutCode === undefined) return

      const store = masterTableInstance.$store

      const savedFilters = this.$uiSettings.get(
        'UTableEntity',
        'filters',
        this.shortcutCode
      )
      if (savedFilters) {
        for (const filter of savedFilters) {
          store.commit('APPLY_FILTER', filter)
        }
      }
      const savedViewMode = this.$uiSettings.get(
        'UTableEntity',
        'viewMode',
        this.shortcutCode
      )
      if (savedViewMode) {
        this.viewMode = savedViewMode
      }

      const savedSort = this.$uiSettings.get(
        'UTableEntity',
        'sort',
        this.shortcutCode
      )
      if (savedSort) {
        store.commit('SORT', savedSort)
      }

      this._unwatchList = [
        store.watch(
          (state) => state.filters,
          (value) => {
            this.$uiSettings.put(
              value,
              'UTableEntity',
              'filters',
              this.shortcutCode
            )
          }
        ),
        this.$watch(
          () => this.viewMode,
          (value) => {
            this.$uiSettings.put(
              value,
              'UTableEntity',
              'viewMode',
              this.shortcutCode
            )
          }
        ),
        store.watch(
          (state) => state.sort,
          (value) => {
            this.$uiSettings.put(
              value,
              'UTableEntity',
              'sort',
              this.shortcutCode
            )
          }
        )
      ]
    },

    onInitialLoad (masterTableInstance) {
      this.viewMode = masterTableInstance.viewMode
      this.initLocalStorageWatcher(masterTableInstance)
    }
  }
}
</script>

<style>
.u-table-register {
  display: flex;
}

.u-table-register__view {
  overflow: auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 450px;
  flex-shrink: 0;
}

.u-table-register__view__preview-form-mode
  > .u-table-entity__head
  .u-button
  .u-button__label {
  display: none;
}

.u-table-register__form-preview {
  flex-grow: 1;
  flex-basis: 100%;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  overflow: auto;
}

.u-table-register__view > .u-table-entity {
  overflow: auto;
  flex-grow: 1;
}

.u-table-register__details {
  min-height: 50%;
  max-height: 75%;
  flex-grow: 1;
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
  color: hsl(var(--hs-primary), var(--l-state-default));
  font-size: 15px;
  background: none;
  border: none;
  padding-right: 10px;
  padding-left: 0;
  cursor: pointer;
}

.u-table-register__divider-button:hover {
  color: hsl(var(--hs-primary), var(--l-state-hover));
}

@media (max-width: 1024px) {
  .u-table-register__view {
    flex-basis: 400px;
  }
}
@media (max-width: 768px) {
  .u-table-register--preview-mode {
    flex-direction: column;
  }
  .u-table-register--preview-mode .u-table-register__view {
    max-height: 40vh;
    border-bottom: 2px dashed
      hsl(var(--hs-border), var(--l-layout-border-default));
    box-shadow: 0 2px 8px hsla(var(--hs-text), var(--l-text-default), 0.2);
  }
  .u-table-register--preview-mode .u-table-register__form-preview {
    margin-left: unset;
    padding-left: unset;
    border-left: unset;
  }

  .u-table-register--preview-mode .u-table-entity__body {
    padding-bottom: 10px;
    background: hsl(var(--hs-background), var(--l-background-default));
  }
}
</style>
