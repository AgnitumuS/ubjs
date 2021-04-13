<template>
  <div class="u-select">
    <el-popover
      v-show="!disabled"
      v-model="dropdownVisible"
      placement="bottom-start"
      :width="popperWidth"
      transition=""
      :popper-options="{
        appendToBody: true
      }"
      trigger="manual"
      popper-class="ub-select__options__reset-padding"
      :tabindex="-1"
      :disabled="disabled"
      @show="onShowDropdown"
      @keydown.native.exact.down="changeSelected(1)"
      @keydown.native.exact.up="changeSelected(-1)"
      @keydown.native.enter="chooseOption(selectedOption)"
      @keydown.native.esc.capture="leaveInput"
      @keydown.native.tab="leaveInput"
    >
      <div
        slot="reference"
        class="ub-select__container"
        :class="{'ub-select__container--with-actions': actions.length && !disabled}"
      >
        <el-input
          ref="input"
          v-model="queryDisplayValue"
          :class="{
            'ub-select__deleted-value': isSafeDeletedValue && !isFocused,
            'ub-select__undefined-record': undefinedRecord
          }"
          :readonly="!editable || isReadOnly"
          :placeholder="$ut(placeholder)"
          @click.native="editable || toggleDropdown()"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.native.exact.e.ctrl.prevent="isReadOnly || handleEditItem()"
          @keydown.native.exact.f9="isReadOnly || handleShowDictionary()"
          @keydown.native.exact.delete.ctrl="isReadOnly || handleClearClick()"
          @keydown.native.exact.down.alt="isReadOnly || onKeydownAltDown()"
          @keydown.native.exact.up.prevent
          @keydown.native.exact.down.prevent
        >
          <el-tooltip
            v-if="isSafeDeletedValue"
            slot="prefix"
            :content="$ut('selectedValueWasDeleted')"
            :enterable="false"
          >
            <i class="el-input__icon u-icon-delete" />
          </el-tooltip>

          <el-tooltip
            v-if="undefinedRecord"
            slot="prefix"
            :content="$ut('select.valueIsUndefined', value, getEntityName)"
            :enterable="false"
          >
            <i class="u-select-icon-warning el-input__icon el-icon-warning" />
          </el-tooltip>

          <i
            v-if="clearable && value !== null && value !== '' && value !== undefined && !isReadOnly"
            slot="suffix"
            style="cursor: pointer;"
            class="el-input__icon u-icon-close"
            @click="$emit('input', null, null)"
          />
          <i
            v-if="!isReadOnly"
            slot="suffix"
            class="el-input__icon"
            style="cursor: pointer;"
            :class="inputIconCls"
            @click.prevent="editable && toggleDropdown()"
          />
        </el-input>
      </div>

      <div
        v-if="options.length > 0"
        ref="options"
        class="ub-select__list-options"
      >
        <div
          v-for="option in options"
          :key="option[valueAttribute]"
          :ref="`option_${option[valueAttribute]}`"
          class="ub-select__option"
          :class="{
            'active': option[valueAttribute] === value,
            'selected': option[valueAttribute] === selectedID
          }"
          @click="chooseOption(option)"
          @mouseenter="selectedID = option[valueAttribute]"
        >
          {{ option[getDisplayAttribute] }}
        </div>
        <el-row
          type="flex"
        >
          <el-button
            v-if="moreVisible"
            size="mini"
            style="margin: 5px"
            @click="showMore"
          >
            {{ $ut('USelectEntity.dropdown.moreButton') }}
          </el-button>
        </el-row>
      </div>
      <div
        v-else
        style="text-align: center; padding: 10px"
      >
        {{ $ut('el.select.noData') }}
      </div>
    </el-popover>

    <el-input
      v-show="disabled"
      disabled
      :value="queryDisplayValue"
      :placeholder="placeholder"
      suffix-icon="u-icon-arrow-down"
    />

    <u-dropdown
      v-if="actions.length > 0 && !disabled"
      :tabindex="-1"
      class="u-select__dropdown"
    >
      <button
        type="button"
        class="u-icon-more ub-select__more-icon"
      />
      <template #dropdown>
        <u-dropdown-item
          v-for="action in actions"
          :key="action.name"
          :icon="action.icon"
          :label="$ut(action.caption)"
          :disabled="action.disabled"
          @click.native="action.handler"
        >
        </u-dropdown-item>
      </template>
    </u-dropdown>
  </div>
</template>

<script>
const { debounce } = require('throttle-debounce')
const clickOutsideDropdown = require('./mixins/clickOutsideDropdown')
/**
 * Select component mapped to Entity
 */
export default {
  name: 'USelectEntity',

  inject: {
    isDisabled: { from: 'isDisabled', default: false },
    parentIsModal: { from: 'parentIsModal', default: false }
  },

  mixins: [clickOutsideDropdown],

  props: {
    /**
     * Selected entity ID
     * @model
     */
    value: {
      type: [Number, String],
      default: null
    },
    /**
     * Attribute which is the value for v-model
     */
    valueAttribute: {
      type: String,
      default: 'ID'
    },
    /**
     * Function which return UBRepository
     * @returns {ClientRepository}
     */
    repository: Function,
    /**
     * Name of entity. If repository is set entityName will be ignored
     */
    entityName: String,
    /**
     * Attribute which is display value of options
     */
    displayAttribute: String,
    /**
     * Set disable status
     */
    disabled: Boolean,

    /**
     * Remove default actions in "more" button
     */
    removeDefaultActions: Boolean,

    /**
     * Add actions to "more" button
     */
    additionalActions: {
      type: Array,
      default () {
        return []
      }
    },

    /**
     * Add clear icon
     */
    clearable: Boolean,

    /**
     * False to prevent the user from typing text directly into the field;
     * the field can only have its value set via selecting a value from the picker.
     * In this state, the picker can also be opened by clicking directly on the input field itself.
     */
    editable: {
      type: Boolean,
      default: true
    },
    /**
     * Input placeholder.
     */
    placeholder: {
      type: String,
      default: ''
    },
    /**
     * Set readonly status
     */
    readonly: Boolean,

    /**
     * Overrides showDictionary action config.
     * Function accepts current config and must return new config
     */
    buildShowDictionaryConfig: {
      type: Function,
      default: config => config
    },
    /**
     * Overrides edit action config.
     * Function accepts current config and must return new config
     */
    buildEditConfig: {
      type: Function,
      default: config => config
    },
    /**
     * Overrides addNew action config.
     * Function accepts current config and must return new config
     */
    buildAddNewConfig: {
      type: Function,
      default: config => config
    },

    /**
     * Search request condition
     */
    searchStrategy: {
      type: String,
      default: 'like',
      validator: value => ['like', 'startsWith'].includes(value)
    },

    /**
     * Skip autocomplete the value after adding a new record through the 'addNew' action button
     */
    skipAutoComplete: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      loading: false,
      query: '',
      options: [],
      pageNum: 0, // page which load. will change if you click more btn
      pageSize: 20, // count of options which loads by 1 request
      moreVisible: false, // shows when the request has an answer what is the next page
      dropdownVisible: false,
      popperWidth: 300, // by default 300, will change after popper show
      selectedID: null, // ID of option which user hover or focused by arrows
      selectedOption: null, // option which user hover or focused by arrows
      prevQuery: '', // when user click show more need to track prev query value for send same request to next page
      isSafeDeletedValue: false,
      isFocused: false,
      undefinedRecord: false // show's warning icon when ID is undefined in entity
    }
  },

  computed: {
    getEntityName () {
      return (this.repository && this.repository().entityName) || this.entityName
    },

    getDisplayAttribute () {
      return this.displayAttribute || this.$UB.connection.domain.get(this.getEntityName).descriptionAttribute
    },

    isExistDeleteDate () {
      const schema = this.$UB.connection.domain.get(this.getEntityName)
      return 'mi_deleteDate' in schema.attributes
    },

    inputIconCls () {
      let icon
      const arrowPrefix = 'u-icon-arrow-'

      if (this.dropdownVisible) {
        icon = arrowPrefix + 'up'
      } else {
        icon = arrowPrefix + 'down'
      }

      if (this.loading) {
        icon = 'el-icon-loading'
      }

      return icon
    },

    defaultActions () {
      if (this.removeDefaultActions) {
        return []
      }
      return [{
        name: 'ShowLookup',
        caption: this.$ut('selectFromDictionary') + ' (F9)',
        icon: 'u-icon-dictionary',
        disabled: this.isReadOnly,
        handler: this.handleShowDictionary
      },
      {
        name: 'Edit',
        caption: this.$ut('editSelItem') + ' (Ctrl+E)',
        icon: 'u-icon-edit',
        disabled: !this.value,
        handler: this.handleEditItem
      },
      {
        name: 'Add',
        caption: this.$ut('addNewItem'),
        icon: 'u-icon-add',
        disabled: !this.getEntityName || !this.$UB.connection.domain.get(this.getEntityName).haveAccessToMethod('addnew') || this.isReadOnly,
        handler: this.handleAddNewItem
      },
      {
        name: 'Clear',
        caption: this.$ut('clearSelection') + ' (Ctrl+BackSpace)',
        icon: 'u-icon-eraser',
        disabled: !this.value || this.isReadOnly,
        handler: this.handleClearClick
      }]
    },

    actions () {
      return this.defaultActions.concat(this.additionalActions)
    },

    /**
     * need for update displayed query if original option query changed
     * but show dropdown and fetch date just if changed queryDisplayValue
     */
    queryDisplayValue: {
      get () {
        return this.query
      },

      set (value) {
        this.query = value
        if (!this.dropdownVisible) {
          this.dropdownVisible = true
        }
        this.debouncedFetch(value)
      }
    },

    isReadOnly () {
      return this.isDisabled || this.readonly
    }
  },

  watch: {
    // when value (ID) changed need to get formatted label
    value: {
      immediate: true,
      handler: 'setQueryByValue'
    },
    queryDisplayValue (value) {
      if (value.length < 1) {
        this.handleClearClick()
      }
    }
  },

  created () {
    this.AUTOCOMPLETE_LISTENER_UID = null
  },

  beforeDestroy () {
    if (this.AUTOCOMPLETE_LISTENER_UID && this.AUTOCOMPLETE_LISTENER_UID === this._uid && !this.skipAutoComplete) {
      this.$UB.connection.removeListener(`${this.getEntityName}:changed`, this.autoCompleteValue)
    }
  },

  methods: {
    getRepository () {
      if (this.repository) {
        return this.repository()
      }

      return this.$UB.Repository(this.entityName)
        .attrs(this.valueAttribute, this.getDisplayAttribute)
        .orderBy(this.getDisplayAttribute)
    },

    async fetchPage (query, pageNum = 0) {
      this.loading = true
      this.prevQuery = query
      this.pageNum = pageNum

      const data = await this.getRepository()
        .whereIf(query, this.getDisplayAttribute, this.searchStrategy, query)
        .start(pageNum * this.pageSize)
        .limit(this.pageSize + 1)
        .select()

      if (data.length <= this.pageSize) {
        this.moreVisible = false
      } else {
        this.moreVisible = true
        data.length -= 1
      }
      if (pageNum === 0) {
        this.options.splice(0, this.options.length)
      }
      this.options.push(...data)
      if (this.options.length) {
        const currentValueIndex = this.options.findIndex(i => i[this.valueAttribute] === this.value)
        const index = currentValueIndex === -1 ? 0 : currentValueIndex
        this.selectedID = this.options[index][this.valueAttribute]
        this.selectedOption = this.options[index]
      } else {
        this.selectedID = this.value
      }

      this.loading = false
    },

    debouncedFetch: debounce(600, function (query) {
      this.fetchPage(query)
    }),

    async fetchDisplayValue (value) {
      this.loading = true
      try {
        const repositoryClone = this.getRepository().clone().clearWhereList()
        const option = await repositoryClone
          .where(this.valueAttribute, '=', value)
          .attrsIf(this.isExistDeleteDate, 'mi_deleteDate')
          .misc({
            __allowSelectSafeDeleted: true
          })
          .selectSingle()

        if (option) {
          this.query = option[this.getDisplayAttribute]
          this.setSafeDeleteValue(option)
        } else {
          this.query = value
          this.undefinedRecord = true
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * get value label. If label not already loaded it will be fetched from server
     *
     * @param {number} value ID
     */
    setQueryByValue (value) {
      if (this._fetchDisplayValuePromise) {
        // Fetching value for another setQueryByValue call is not completed yet,
        // wait for it and re-query value only after its completion
        this._fetchDisplayValuePromise.then(() => {
          this._fetchDisplayValuePromise = null
          this.setQueryByValue(value)
        })
        return
      }

      this.undefinedRecord = false
      if (value === undefined || value === null) {
        // Clear display value, when ID is empty
        this.query = ''
        return
      }

      const index = this.options.findIndex(o => o[this.valueAttribute] === value)
      if (index !== -1) {
        // Set display value from options
        const option = this.options[index]
        this.query = option[this.getDisplayAttribute]
        this.setSafeDeleteValue(option)
        return
      }

      this._fetchDisplayValuePromise = this.fetchDisplayValue(value)
    },

    // set delete status if record is deleted safely
    setSafeDeleteValue (option) {
      if (option.mi_deleteDate) {
        const isDeleted = option.mi_deleteDate.getTime() < Date.now()
        this.isSafeDeletedValue = isDeleted
      } else {
        this.isSafeDeletedValue = false
      }
    },

    onShowDropdown () {
      this.popperWidth = this.$refs.input.$el.offsetWidth
    },

    leaveInput (e) {
      if (this.dropdownVisible) {
        /*
         * need to stopPropagation only if this is necessary,
         * otherwise the handler will intercept other actions on the ESC,
         * for example, closing dialog
         */
        e.stopPropagation()
        this.selectedID = this.value
        this.dropdownVisible = false
        this.setQueryByValue(this.value)
      }
    },

    onKeydownAltDown () {
      if (!this.dropdownVisible) {
        this.dropdownVisible = true
        this.fetchPage()
      }
    },

    async showMore () {
      await this.fetchPage(this.prevQuery, this.pageNum + 1)
      const { scrollHeight } = this.$refs.options
      this.$refs.options.scrollTop = scrollHeight
      this.$refs.input.$el.click() // keep focus on input
    },

    // shows all search result when click on dropdown arrow
    toggleDropdown () {
      if (this.isReadOnly) return
      this.dropdownVisible = !this.dropdownVisible
      if (this.dropdownVisible) {
        this.fetchPage()
      } else {
        this.setQueryByValue(this.value)
      }
    },

    /**
     * emits when user press arrows
     * @param {number} direction available params -1/1 for up/down
     */
    changeSelected (direction) {
      const index = this.options.findIndex(o => o[this.valueAttribute] === this.selectedID)
      const nextIndex = index + direction
      const lessMin = nextIndex < 0
      const moreMax = nextIndex > this.options.length - 1
      const inRange = !lessMin && !moreMax
      if (inRange) {
        this.selectedID = this.options[nextIndex][this.valueAttribute]
        this.selectedOption = this.options[nextIndex]
      }
      if (this.dropdownVisible && this.options.length > 0) {
        const el = this.$refs[`option_${this.selectedID}`][0]
        el.scrollIntoView({ block: 'nearest' })
      }
    },

    // emits when user click on option or click enter when option is focused
    chooseOption (option) {
      if (this.selectedID !== this.value) {
        this.$emit('input', this.selectedID, JSON.parse(JSON.stringify(option)))
      }
      this.setQueryByValue(this.selectedID)
      this.dropdownVisible = false
    },

    handleShowDictionary () {
      if (!this.removeDefaultActions) {
        const selectRepo = this.getRepository().clone()
        selectRepo.orderList = [] // clear order list
        // override fieldList but  keep all possible filters
        selectRepo.fieldList = this.$UB.connection.domain.get(this.getEntityName)
          .getAttributeNames({ defaultView: true })
        const config = this.buildShowDictionaryConfig({
          renderer: 'vue',
          cmdType: 'showList',
          isModal: true,
          cmdData: {
            repository: () => selectRepo,
            onSelectRecord: ({ ID, row, close }) => {
              this.$emit('input', row[this.valueAttribute], JSON.parse(JSON.stringify(row)))
              close()
            },
            buildEditConfig (cfg) {
              if (this.$UB.connection.appConfig.uiSettings.adminUI.forceModalsForEditForms) cfg.isModal = true
              return cfg
            },
            buildCopyConfig (cfg) {
              cfg.isModal = this.$UB.connection.appConfig.uiSettings.adminUI.forceModalsForEditForms || this.parentIsModal
              return cfg
            },
            buildAddNewConfig (cfg) {
              if (this.$UB.connection.appConfig.uiSettings.adminUI.forceModalsForEditForms) cfg.isModal = true
              return cfg
            },
            scopedSlots: createElement => ({
              toolbarPrepend: ({ store, close }) => {
                return createElement('u-button', {
                  attrs: {
                    disabled: !store.state.selectedRowId
                  },
                  props: {
                    appearance: 'inverse',
                    icon: 'u-icon-check'
                  },
                  on: {
                    click: () => {
                      const selectedRowId = store.state.selectedRowId
                      const selectedRow = store.state.items.find(({ ID }) => ID === selectedRowId)

                      if (selectedRow == null) {
                        return
                      }

                      this.$emit('input', selectedRow[this.valueAttribute], JSON.parse(JSON.stringify(selectedRow)))
                      close()
                    }
                  }
                }, [this.$ut('actionSelect')])
              }
            })
          }
        })
        this.$UB.core.UBApp.doCommand(config)
      }
    },

    async handleEditItem () {
      if (!this.removeDefaultActions) {
        let ID = this.value

        if (this.valueAttribute !== 'ID') { // row ID is required to open edit form
          const repositoryClone = this.getRepository().clone().clearWhereList()
          repositoryClone.fieldList = ['ID']

          const ids = await repositoryClone
            .where(this.valueAttribute, '=', this.value)
            .limit(2)
            .selectAsArrayOfValues()

          if (ids.length !== 1) {
            UB.showErrorWindow(`${this.valueAttribute} is not unique`)
            return
          }

          ID = ids[0]
        }

        const config = this.buildEditConfig({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.getEntityName,
          isModal: this.$UB.connection.appConfig.uiSettings.adminUI.forceModalsForEditForms || this.parentIsModal,
          instanceID: ID
        })
        this.$UB.core.UBApp.doCommand(config)
      }
    },

    handleAddNewItem () {
      if (!this.removeDefaultActions) {
        const config = this.buildAddNewConfig({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.getEntityName,
          isModal: this.$UB.connection.appConfig.uiSettings.adminUI.forceModalsForEditForms || this.parentIsModal
        })
        if (!this.skipAutoComplete) {
          this.$UB.connection.once(`${this.entityName}:changed`, this.autoCompleteValue)
          this.AUTOCOMPLETE_LISTENER_UID = this._uid
        }
        this.$UB.core.UBApp.doCommand(config)
      }
    },

    autoCompleteValue (config) {
      if (this.AUTOCOMPLETE_LISTENER_UID && this.AUTOCOMPLETE_LISTENER_UID === this._uid && config && config.resultData) {
        this.$emit('input', config.resultData[this.valueAttribute], JSON.parse(JSON.stringify(config.resultData)))
      }
    },

    handleClearClick () {
      if (!this.removeDefaultActions) {
        this.$emit('input', null, null)
        if (this.dropdownVisible) {
          this.fetchPage()
        }
      }
    },

    onFocus () {
      this.isFocused = true
      this.$emit('focus')
    },

    onBlur () {
      this.isFocused = false
      this.$emit('blur')
    }
  }
}
</script>

<style>
.ub-select__list-options{
  max-height: 200px;
  overflow-y: auto;
  position: relative;
}

.ub-select__option{
  padding: 7px 10px;
  font-size: 14px;
  cursor: pointer;
  color: hsl(var(--hs-text), var(--l-text-default))
}

.ub-select__option.selected{
  background: hsl(var(--hs-primary), var(--l-background-default));
}

.ub-select__option.active{
  color: hsl(var(--hs-primary), var(--l-state-default));
}

.ub-select__container{
  position: relative;
}

.ub-select__options__reset-padding {
  padding: 0 !important;
}

.ub-select__deleted-value input{
  color: hsl(var(--hs-text), var(--l-text-disabled));
  text-decoration: line-through;
}

.ub-select__container input[readonly=readonly] {
  cursor: pointer;
}

.ub-select__undefined-record .el-input__inner{
  border-color: hsl(var(--hs-warning), var(--l-input-border-default));
}

.u-select {
  display: grid;
  grid-template-columns: 1fr auto;
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  border-radius: var(--border-radius);
}
.u-select:focus {
  border-color: hsl(var(--hs-primary), var(--l-layout-border-default));
}

.ub-select__more-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  transform: rotate(90deg);
  color: hsl(var(--hs-control), var(--l-state-default));
  cursor: pointer;
  border: none;
  background: none;
}

.ub-select__more-icon:disabled {
  color: hsl(var(--hs-control), var(--l-state-disabled));
}

.u-select-icon-warning {
  color: hsl(var(--hs-warning), var(--l-state-default));
}

.u-select > .u-select__dropdown {
  border-left: 1px solid hsl(var(--hs-border), var(--l-layout-border-light));
}
.u-select .el-input__inner {
  border: none;
}

.u-select .el-input__inner:focus {
  border: 1px solid #1773cf;
}

</style>
