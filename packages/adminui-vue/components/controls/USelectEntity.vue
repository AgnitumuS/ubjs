<template>
  <div class="u-select">
    <el-popover
      v-show="!disabled"
      v-model="dropdownVisible"
      placement="bottom-start"
      :width="popperWidth"
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
      >
        <el-input
          ref="input"
          v-model="queryDisplayValue"
          :class="{
            'ub-select__deleted-value': isSafeDeletedValue && !isFocused,
            'ub-select__undefined-record': undefinedRecord
          }"
          :readonly="!editable || readonly"
          :placeholder="$ut(placeholder)"
          @click.native="editable || toggleDropdown()"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.native.exact.e.ctrl.prevent="readonly || handleEditItem()"
          @keydown.native.exact.f9="readonly || handleShowDictionary()"
          @keydown.native.exact.delete.ctrl="readonly || handleClearClick()"
          @keydown.native.exact.down.alt="readonly || onKeydownAltDown()"
          @keydown.native.exact.up.prevent
          @keydown.native.exact.down.prevent
        >
          <el-tooltip
            v-if="isSafeDeletedValue"
            slot="prefix"
            :content="$ut('selectedValueWasDeleted')"
            :enterable="false"
          >
            <i class="el-input__icon el-icon-delete" />
          </el-tooltip>

          <el-tooltip
            v-if="undefinedRecord"
            slot="prefix"
            :content="$ut('select.valueIsUndefined', value, entityName)"
            :enterable="false"
          >
            <i
              class="el-input__icon el-icon-warning"
              style="color:rgb(var(--warning))"
            />
          </el-tooltip>

          <i
            v-if="clearable && value !== null && value !== '' && value !== undefined && !readonly"
            slot="suffix"
            style="cursor: pointer;"
            class="el-input__icon el-icon-close"
            @click="$emit('input', null, null)"
          />
          <i
            v-if="!readonly"
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
          {{ option[displayAttribute] }}
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
            {{ $ut('more') }}
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
      suffix-icon="el-icon-arrow-down"
    />

    <el-dropdown
      v-if="actions.length > 0 && !readonly"
      trigger="click"
      :tabindex="-1"
    >
      <button
        :disabled="disabled"
        class="el-icon-more ub-select__more-icon"
      />
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="action in actions"
          :key="action.name"
          :icon="action.icon"
          :disabled="action.disabled"
          @click.native="action.handler"
        >
          {{ $ut(action.caption) }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
const { debounce } = require('throttle-debounce')
const clickOutsideDropdown = require('./mixins/clickOutsideDropdown')
/**
 * Dropdown control for select data from entity.
 */
export default {
  name: 'USelectEntity',

  mixins: [clickOutsideDropdown],

  props: {
    /**
       * Selected entity ID
       * @model
       */
    value: {
      type: [Number, String],
      default () {
        return null
      }
    },
    /**
     * attribute which is the value for v-model
     */
    valueAttribute: {
      type: String,
      default: 'ID'
    },
    /**
     * Function which return UBRepository.
     * You need care yourself about pass displayAttribute to attrs to prevent blank rows!
     * @returns {ClientRepository}
     */
    repository: {
      type: Function,
      default () {
        const attrs = (this.valueAttribute === this.displayAttribute) ? [this.displayAttribute] : [this.valueAttribute, this.displayAttribute]
        console.log(attrs)
        return this.$UB.Repository(this.entityName)
          .attrs(attrs)
          .orderBy(this.displayAttribute)
      }
    },
    /**
     * Name of entity. If repository is set entityName will be ignored
     */
    entityName: {
      type: String,
      default () {
        return this.repository().entityName
      }
    },
    /**
     * attribute which is display value of options
     */
    displayAttribute: {
      type: String,
      default () {
        return this.$UB.connection.domain.get(this.entityName).descriptionAttribute
      }
    },
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
    isExistDeleteDate () {
      const schema = this.$UB.connection.domain.get(this.entityName)
      return 'mi_deleteDate' in schema.attributes
    },

    inputIconCls () {
      let icon
      const arrowPrefix = 'el-icon-arrow-'

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
        icon: 'fa fa-table',
        handler: this.handleShowDictionary
      },
      {
        name: 'Edit',
        caption: this.$ut('editSelItem') + ' (Ctrl+E)',
        icon: 'fa fa-pencil-square-o',
        disabled: !this.value,
        handler: this.handleEditItem
      },
      {
        name: 'Add',
        caption: this.$ut('addNewItem'),
        icon: 'fa fa-plus-circle',
        handler: this.handleAddNewItem
      },
      {
        name: 'Clear',
        caption: this.$ut('clearSelection') + ' (Ctrl+BackSpace)',
        icon: 'fa fa-eraser',
        disabled: !this.value,
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

  methods: {
    async fetchPage (query, pageNum = 0) {
      this.loading = true
      this.prevQuery = query
      this.pageNum = pageNum

      const data = await this.repository()
        .whereIf(query, this.displayAttribute, 'like', query)
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

    debouncedFetch: debounce(120, function (query) {
      this.fetchPage(query)
    }),

    async fetchDisplayValue (value) {
      this.loading = true
      const repositoryClone = this.repository().clone().clearWhereList()
      const data = await repositoryClone
        .where(this.valueAttribute, '=', value)
        .attrsIf(this.isExistDeleteDate, 'mi_deleteDate')
        .misc({
          __allowSelectSafeDeleted: true
        })
        .selectSingle()
      this.loading = false

      return data
    },

    /**
     * get value label
     * if function cant find label in loaded options
     * it will be fetch it from server
     *
     * @param {number} value ID
     */
    setQueryByValue (value) {
      this.undefinedRecord = false
      if (value !== undefined && value !== null) {
        const index = this.options.findIndex(o => o[this.valueAttribute] === value)
        if (index !== -1) {
          const option = this.options[index]
          this.query = option[this.displayAttribute]
          this.setSafeDeleteValue(option)
        } else {
          this.fetchDisplayValue(value)
            .then(option => {
              if (option) {
                this.query = option[this.displayAttribute]
                this.setSafeDeleteValue(option)
              } else {
                this.query = value
                this.undefinedRecord = true
              }
            })
        }
      } else {
        this.query = ''
      }
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
      if (this.readonly) return
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
        /**
         * Emits when value changed
         *
         * @property {number|string} newValue contain primitive value
         * @property {Object} Row contain all attributes passed to Repository (when Repository not set contain only display and value attributes)
         */
        this.$emit('input', this.selectedID, JSON.parse(JSON.stringify(option)))
      }
      this.setQueryByValue(this.selectedID)
      this.dropdownVisible = false
    },

    handleShowDictionary () {
      if (!this.removeDefaultActions) {
        const columns = this.$UB.connection.domain.get(this.entityName)
          .filterAttribute(a => a.defaultView)
          .map(({ code }) => code)

        const config = this.buildShowDictionaryConfig({
          renderer: 'vue',
          cmdType: 'showList',
          isModal: true,
          cmdData: {
            repository: () => {
              const repo = this.repository().clone()
              for (const col of columns) {
                const hasColumn = repo.fieldList.includes(col)
                if (!hasColumn) {
                  repo.fieldList.push(col)
                }
              }
              return repo
            },
            columns,
            onSelectRecord: ({ ID, row, close }) => {
              this.$emit('input', ID, JSON.parse(JSON.stringify(row)))
              close()
            },
            buildEditConfig (cfg) {
              cfg.isModal = true
              return cfg
            },
            buildCopyConfig (cfg) {
              cfg.isModal = true
              return cfg
            },
            buildAddNewConfig (cfg) {
              cfg.isModal = true
              return cfg
            },
            scopedSlots: createElement => ({
              toolbarPrepend: ({ store, close }) => {
                return createElement('u-toolbar-button', {
                  props: {
                    icon: 'el-icon-check',
                    disabled: !store.state.selectedRowId
                  },
                  on: {
                    click: () => {
                      const selectedRowId = store.state.selectedRowId
                      const selectedRow = store.state.items.find(({ ID }) => ID === selectedRowId)
                      this.$emit('input', selectedRowId, JSON.parse(JSON.stringify(selectedRow)))
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

    handleEditItem () {
      if (!this.removeDefaultActions) {
        const config = this.buildEditConfig({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.entityName,
          isModal: true,
          instanceID: this.value
        })
        this.$UB.core.UBApp.doCommand(config)
      }
    },

    handleAddNewItem () {
      if (!this.removeDefaultActions) {
        const config = this.buildAddNewConfig({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.entityName,
          isModal: true
        })
        this.$UB.core.UBApp.doCommand(config)
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
      /**
       * Emits on focus
       */
      this.$emit('focus')
    },

    onBlur () {
      this.isFocused = false
      /**
       * Emits on blur
       */
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
}

.ub-select__option.selected{
  background: rgba(var(--primary), 0.1);
}

.ub-select__option.active{
  color: rgb(var(--primary));
}

.ub-select__option.selected.fixed {
  background-color: rgba(var(--bg), 0.1);
}

.ub-select__option.fixed .el-checkbox__inner {
  background-color: rgba(var(--bg), 0.08);
  border-color: rgba(var(--bg), 0.08);
}

.ub-select__container{
  position: relative;
}

.ub-select__options__reset-padding{
  padding: 0;
}

.ub-select__deleted-value input{
  color: rgb(var(--info));
  text-decoration: line-through;
}

.ub-select__container input[readonly=readonly] {
  cursor: pointer;
}

.ub-select__container .el-input__inner {
  padding-right: 64px;
}

.ub-select__undefined-record .el-input__inner{
  border-color: rgb(var(--warning));
}

.u-select{
  display: grid;
  grid-template-columns: 1fr auto;
}

.ub-select__more-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transform: rotate(90deg);
  color: rgba(var(--info), 0.76);
  cursor: pointer;
  border: none;
  background: none;
}

.ub-select__more-icon:disabled {
  opacity: 0.5;
}
</style>

<docs>
One of these options is required:
  - `entity-name`
  - `repository`

### Usage with `entity-name`

Use `entity-name` props when you need select all data from entity. Useful for dictionaries.
```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="cdn_country"
    @input="lol"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },
    methods: {
      lol(a, b) {
        console.log(typeof a)
        console.log(a,b)
      }
    }
  }
</script>
```

### Usage with `repository`
Use `repository` props when you need filtering data on form.

Set function which returns [UB Repository](https://unitybase.info/api/ubpub-v5/CustomRepository.html).
You need care yourself about pass displayAttribute to attrs to prevent blank rows!

(When you need filter not only on specific form, better be define data visibility rules across all application by
use [RLS](https://unitybase.info/api/server-v5/tutorial-mixin_rls.html))

```vue
<template>
  <u-select-entity
    v-model="value"
    :repository="specificsCountry"
    @input="lol"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    methods: {
      specificsCountry () {
        return this.$UB.Repository('cdn_country')
          // name is descriptionAttribute in meta file, and therefore displayAttribute by default, so we need it
          .attrs('ID', 'code', 'name')
          .where('code', 'startWith', 'U')
      },
      lol(a, b) {
        console.log(typeof a)
        console.log(a,b)
      }
    }
  }
</script>
```

### Custom `valueAttribute` and `displayAttribute`
Use when you need to change default model and display property.

Its like attribute `value` in native `<option>` tag.

In example `code` uses for value (instead of `ID`), and for display (instead of `name`)

```vue
<template>
  <div>
    <u-grid>
      <u-form-row label="Default">
        <u-select-entity
            v-model="value1"
            entity-name="cdn_country"
        />
      </u-form-row>
      <u-base-input
          v-model="value1"
          disabled="true"
      ></u-base-input>
    </u-grid>

    <u-grid>
      <u-form-row label="Custom">
        <u-select-entity
            v-model="value2"
            entity-name="cdn_country"
            value-attribute="code"
            display-attribute="code"
        />
      </u-form-row>
      <u-base-input
          v-model="value2"
          disabled="true"
      ></u-base-input>
    </u-grid>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        value1: null,
        value2: null
      }
    }
  }
</script>
```

### Editable
Set editable="false" to prevent user from typing text directly into the field.
In this state picker can be opened by clicking directly on the input field, not only on arrow.
```vue
<template>
  <u-select-entity
      v-model="value"
      value-attribute="code"
      entity-name="cdn_country"
      :editable="false"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: 'UKR'
      }
    }
  }
</script>
```
### Disabled
```vue
<template>
  <u-select-entity
      v-model="value"
      value-attribute="code"
      entity-name="cdn_country"
      disabled
  />
</template>
<script>
  export default {
    data () {
      return {
        value: 'UKR'
      }
    }
  }
</script>
```

### Clearable
```vue
<template>
  <u-select-entity
      v-model="value"
      value-attribute="code"
      entity-name="cdn_country"
      clearable
  />
</template>
<script>
  export default {
    data () {
      return {
        value: 'UKR'
      }
    }
  }
</script>
```
### Actions
#### Change default actions

#### Remove default actions
Remove right menu when you don't need it!
```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="cdn_country"
    remove-default-actions
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    }
  }
</script>
```

#### Add actions to menu
```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="cdn_country"
    :additional-actions="actions"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    computed: {
      actions () {
        return [{
          name: 'test action',
          caption: 'Test action caption',
          icon: 'el-icon-grape',
          handler: () => {
            console.log('click test action')
          }
        }, {
          name: 'test action 2',
          caption: 'Test action 2 caption',
          icon: 'el-icon-milk-tea',
          handler: () => {
            console.log('click test action 2')
          }
        }]
      }
    }
  }
</script>
```

#### Just custom actions
```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="cdn_country"
    :additional-actions="actions"
    remove-default-actions
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    computed: {
      actions () {
        return [{
          name: 'test action',
          caption: 'Test action caption',
          icon: 'el-icon-grape',
          handler: () => {
            console.log('click test action')
          }
        }, {
          name: 'test action 2',
          caption: 'Test action 2 caption',
          icon: 'el-icon-milk-tea',
          handler: () => {
            console.log('click test action 2')
          }
        }]
      }
    }
  }
</script>
```


### Actions overrides
```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="cdn_country"
    :build-edit-config="actionEditOverride"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: null
      }
    },

    methods: {
      actionEditOverride (cfg) {
        return {
          ...cfg,
          isModal: false,
          docID: 12345
        }
      }
    }
  }
</script>
```
</docs>
