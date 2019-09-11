<template>
  <div>
    <el-popover
      v-if="!disabled"
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
      @keydown.native.enter="chooseOption"
      @keydown.native.esc.capture="cancelInput"
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
            'ub-select__deleted-value': isSafeDeletedValue && !isFocused
          }"
          :readonly="!editable"
          @click.native="editable || toggleDropdown()"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown.native.exact.e.ctrl.prevent="handleEditItem"
          @keydown.native.exact.f9="handleShowDictionary"
          @keydown.native.exact.delete.ctrl="handleClearClick"
          @keydown.native.exact.down.alt="onKeydownAltDown"
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
          <i
            v-if="clearable && value !== null && value !== '' && value !== undefined"
            slot="suffix"
            style="cursor: pointer;"
            class="el-input__icon el-icon-close"
            @click="$emit('input', null)"
          />
          <i
            slot="suffix"
            class="el-input__icon"
            style="cursor: pointer;"
            :class="inputIconCls"
            @click.stop.prevent="toggleDropdown"
          />
          <el-dropdown
            v-if="actions.length > 0"
            slot="suffix"
            trigger="click"
            :tabindex="-1"
          >
            <i
              class="el-icon-menu ub-select__menu-icon"
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
            'selected': option[valueAttribute] === selectedOption
          }"
          @click="chooseOption"
          @mouseenter="selectedOption = option[valueAttribute]"
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
      v-else
      disabled
      :value="queryDisplayValue"
      suffix-icon="el-icon-arrow-down"
    />
  </div>
</template>

<script>
const { debounce } = require('throttle-debounce')
const clickOutsideDropdown = require('./mixins/clickOutsideDropdown')

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
     * attribute which is display value of options
     */
    displayAttribute: {
      type: String,
      default: undefined
    },
    /**
     * Name of entity. If repository is set entityName will be ignored
     */
    entityName: {
      type: String,
      default: ''
    },
    /**
     * Function which return UBRepository
     */
    repository: {
      type: Function,
      default: undefined
    },
    // repeat it here and pass down to ElEdit because we need to disable toggle & actions
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
      selectedOption: null, // ID of option which user hover or focused by arrows
      prevQuery: '', // when user click show more need to track prev query value for send same request to next page
      isSafeDeletedValue: false,
      isFocused: false
    }
  },

  computed: {
    /**
     * @returns {String} Entity name
     */
    entity () {
      if (this.repository) {
        return this.repository().entityName
      } else {
        return this.entityName
      }
    },

    entitySchema () {
      return this.$UB.connection.domain.get(this.entity)
    },

    getDisplayAttribute () {
      if (this.displayAttribute !== undefined) {
        return this.displayAttribute
      }
      return this.entitySchema.descriptionAttribute
    },

    isExistDeleteDate () {
      return 'mi_deleteDate' in this.entitySchema.attributes
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
    }
  },

  methods: {
    getRepository () {
      if (this.repository) {
        return this.repository()
      } else {
        let displayAttribute = this.getDisplayAttribute
        let repo = this.$UB.Repository(this.entityName)
          .attrs(this.valueAttribute, displayAttribute)
        if (displayAttribute) {
          repo = repo.orderBy(displayAttribute)
        }
        return repo
      }
    },

    async fetchPage (query, pageNum = 0) {
      this.loading = true
      this.prevQuery = query
      this.pageNum = pageNum

      const data = await this.getRepository()
        .whereIf(query, this.getDisplayAttribute, 'like', query)
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
        this.selectedOption = this.options[index][this.valueAttribute]
      } else {
        this.selectedOption = this.value
      }

      this.loading = false
    },

    debouncedFetch: debounce(120, async function (query) {
      await this.fetchPage(query)
    }),

    async fetchDisplayValue (value) {
      this.loading = true
      const data = await this.getRepository()
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
      if (value !== undefined && value !== null) {
        const index = this.options.findIndex(o => o[this.valueAttribute] === value)
        if (index !== -1) {
          const option = this.options[index]
          this.query = option[this.getDisplayAttribute]
          this.setSafeDeleteValue(option)
        } else {
          this.fetchDisplayValue(value)
            .then(option => {
              if (option) {
                this.query = option[this.getDisplayAttribute]
                this.setSafeDeleteValue(option)
              } else {
                throw new Error(`Missing value '${value}' in entity '${this.entity}'`)
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

    cancelInput (e) {
      if (this.dropdownVisible) {
        /*
         * need to stopPropagation only if this is necessary,
         * otherwise the handler will intercept other actions on the ESC,
         * for example, closing dialog
         */
        e.stopPropagation()
        this.selectedOption = this.value
        this.dropdownVisible = false
        this.setQueryByValue(this.value)
      }
    },

    leaveInput () {
      if (this.dropdownVisible) {
        this.chooseOption()
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
    },

    // shows all search result when click on dropdown arrow
    toggleDropdown () {
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
      const index = this.options.findIndex(o => o[this.valueAttribute] === this.selectedOption)
      const nextIndex = index + direction
      const lessMin = nextIndex < 0
      const moreMax = nextIndex > this.options.length - 1
      const inRange = !lessMin && !moreMax
      if (inRange) {
        this.selectedOption = this.options[nextIndex][this.valueAttribute]
      }
      if (this.dropdownVisible && this.options.length > 0) {
        const el = this.$refs[`option_${this.selectedOption}`][0]
        el.scrollIntoView({ block: 'nearest' })
      }
    },

    // emits when user click on option or click enter when option is focused
    chooseOption () {
      this.$emit('input', this.selectedOption)
      this.setQueryByValue(this.selectedOption)
      this.dropdownVisible = false
    },

    handleShowDictionary () {
      if (!this.removeDefaultActions) {
        this.$UB.core.UBApp.doCommand({
          entity: this.entity,
          cmdType: 'showList',
          isModal: true,
          sender: this,
          selectedInstanceID: this.value,
          onItemSelected: ({ data }) => {
            this.$emit('input', data[this.valueAttribute])
          },
          cmdData: {
            params: [{
              entity: this.entity,
              method: 'select',
              fieldList: '*'
            }]
          }
        })
      }
    },

    handleEditItem () {
      if (!this.removeDefaultActions) {
        this.$UB.core.UBApp.doCommand({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.entity,
          isModal: true,
          instanceID: this.value
        })
      }
    },

    handleAddNewItem () {
      if (!this.removeDefaultActions) {
        this.$UB.core.UBApp.doCommand({
          cmdType: this.$UB.core.UBCommand.commandType.showForm,
          entity: this.entity,
          isModal: true
        })
      }
    },

    handleClearClick () {
      if (!this.removeDefaultActions) {
        this.$emit('input', null)
        if (this.dropdownVisible) {
          this.fetchPage()
        }
      }
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

.ub-select__container{
  position: relative;
}

.ub-select__options__reset-padding{
  padding: 0;
}

.ub-select__menu-icon {
  padding: 0 10px;
  color: rgb(var(--info));
  cursor: pointer;
}

.ub-select__deleted-value input{
  color: rgb(var(--info));
  text-decoration: line-through;
}

.ub-select__container input[readonly=readonly] {
  cursor: pointer;
}
</style>

<docs>
One of these options is required:
  - `entity-name`
  - `repository`

### Use as `entity-name`

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="tst_maindata"
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

### Use as `repository`
Need to set function which returns UB Repository

```vue
<template>
  <u-select-entity
    v-model="value"
    :repository="getRepo"
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
      getRepo () {
        return $UB.Repository('tst_maindata')
          .attrs('ID', 'code', 'caption')
          .where('parent', '=', 31231221312312) // TODO: set valid ID
      }
    }
  }
</script>
```

### Custom `valueAttribute`
Need when you need to change default model propery.
Its like attribute `value` in native `<option>` tag.
For example when you need instead `ID` like `code`.

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="tst_maindata"
    value-attribute="code"
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

### Change default actions

#### Remove default actions

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="tst_maindata"
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

#### Add actions

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="tst_maindata"
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
    entity-name="tst_maindata"
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

### Disabled

```vue
<template>
  <u-select-entity
    v-model="value"
    entity-name="tst_dictionary"
    disabled
  />
</template>
<script>
  export default {
    data () {
      return {
        value: 1
      }
    }
  }
</script>
```

</docs>
