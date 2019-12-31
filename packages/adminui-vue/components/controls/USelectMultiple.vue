<template>
  <div>
    <el-popover
      v-if="!disabled"
      v-model="dropdownVisible"
      :width="popperWidth"
      :popper-options="{
        appendToBody: true
      }"
      trigger="manual"
      popper-class="ub-select__options__reset-padding"
      :tabindex="-1"
      :disabled="disabled"
      @show="onShowDropdown"
      @hide="afterHide"
      @keydown.native.exact.down="changeSelected(1)"
      @keydown.native.exact.up="changeSelected(-1)"
      @keydown.native.enter="chooseOption"
      @keydown.native.esc.capture="cancelInput"
      @keydown.native.tab="leaveInput"
    >
      <div
        slot="reference"
        ref="input"
        class="ub-select-multiple__container"
        :class="{
          'is-focused': isFocused || dropdownVisible
        }"
      >
        <div class="ub-select-multiple__input-wrap">
          <el-tag
            v-for="option in displayedOptions"
            :key="option[valueAttribute]"
            :type="getTagType(option)"
            :closable="isOptionClosable(option[valueAttribute])"
            size="mini"
            class="ub-select-multiple__tag"
            :class="{
              'fixed': isOptionFixed(option[valueAttribute])
            }"
            @close="removeOption(option[valueAttribute])"
          >
            <el-tooltip
              v-if="option.isDeleted"
              :content="$ut('recordWasDeleted')"
              :enterable="false"
            >
              <i class="el-icon-delete" />
            </el-tooltip>

            <el-tooltip
              v-if="option.isUndefined"
              :content="$ut('select.valueIsUndefined', option[valueAttribute], entityName)"
              :enterable="false"
            >
              <i class="el-icon-warning" />
            </el-tooltip>

            {{ option.label }}
          </el-tag>

          <input
            v-model="queryDisplayValue"
            :readonly="readonly"
            class="ub-select-multiple__input"
            :placeholder="$ut(placeholder)"
            @focus="onFocus"
            @blur="onBlur"
            @keydown.exact.down.alt="readonly || onKeydownAltDown()"
            @keydown.exact.up.prevent
            @keydown.exact.down.prevent
          >
        </div>
        <div
          ref="icon-wrap"
          class="ub-select-multiple__icon-wrap"
        >
          <i
            v-if="clearable && value.length > 0 && !readonly"
            class="ub-select-multiple__icon el-icon-close"
            @click="clearSelected"
          />
          <i
            v-if="!readonly"
            class="ub-select-multiple__icon"
            :class="inputIconCls"
            @click="toggleDropdown"
          />
        </div>
      </div>

      <div
        v-if="options.length > 0 && !readonly"
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
            'selected': option[valueAttribute] === selectedOption,
            'fixed': isOptionFixed(option[valueAttribute])
          }"
          @click.prevent="chooseOption"
          @mouseenter="selectedOption = option[valueAttribute]"
        >
          <el-checkbox
            :value="value.includes(option[valueAttribute])"
          />
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

    <div
      v-else
      class="ub-select-multiple__container disabled"
    >
      <div class="ub-select-multiple__input-wrap">
        <el-tag
          v-for="option in displayedOptions"
          :key="option[valueAttribute]"
          :type="getTagType(option)"
          size="mini"
          class="ub-select-multiple__tag"
          :class="{
            'fixed': isOptionFixed(option[valueAttribute])
          }"
        >
          <el-tooltip
            v-if="option.isUndefined"
            :content="$ut('select.valueIsUndefined', option[valueAttribute], entityName)"
            :enterable="false"
          >
            <i class="el-icon-warning" />
          </el-tooltip>

          <el-tooltip
            v-if="option.isDeleted"
            :content="$ut('recordWasDeleted')"
            :enterable="false"
          >
            <i class="el-icon-delete" />
          </el-tooltip>
          {{ option.label }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script>
const { debounce } = require('throttle-debounce')
const clickOutsideDropdown = require('./mixins/clickOutsideDropdown')

/**
 * When you need to select few values from entity use multiple select.
 */
export default {
  name: 'USelectMultiple',

  mixins: [clickOutsideDropdown],

  props: {
    /**
     * Selected entity ID
     * @model
     */
    value: {
      type: Array,
      required: true
    },
    /**
     * attribute which is the value for v-model
     */
    valueAttribute: {
      type: String,
      default: 'ID'
    },
    /**
     * Function which return UBRepository
     */
    repository: {
      type: Function,
      default () {
        return this.$UB.Repository(this.entityName)
          .attrs(this.valueAttribute, this.displayAttribute)
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
     * Add clear icon
     */
    clearable: Boolean,
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
     * An array with IDs of elements that unable to remove
     */
    fixedItems: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      loading: false,
      query: '', // search query
      options: [],
      pageNum: 0, // page which load. will change if you click more btn
      pageSize: 20, // count of options which loads by 1 request
      moreVisible: false, // shows when the request has an answer what is the next page
      dropdownVisible: false,
      popperWidth: 300, // by default 300, will change after popper show
      selectedOption: null, // ID of option which user hover or focused by arrows
      prevQuery: '', // when user click show more need to track prev query value for send same request to next page
      displayedOptions: [],
      isFocused: false
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
    /**
     * when value changed need to check is item added or removed
     * if added need to push formatted values (ID, label) to displayOptions
     * if removed -> splice from displayOptions
     */
    value: {
      immediate: true,
      async handler (newVal, oldVal = []) {
        const isAdded = newVal.length > oldVal.length
        if (isAdded) {
          if (!this.fixedItems.every(i => this.value.includes(i))) {
            console.error('You should provide an initial value if you want items to be fixed')
          }

          const addedItems = newVal.filter(a => !oldVal.includes(a))
          const formattedItems = await this.getFormattedOptions(addedItems) // temp
          this.displayedOptions.push(...formattedItems)
        } else {
          const removedItems = oldVal.filter(a => !newVal.includes(a))
          for (const item of removedItems) {
            const index = this.displayedOptions.findIndex(o => o[this.valueAttribute] === item)
            this.displayedOptions.splice(index, 1)
          }
        }
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
        this.selectedOption = this.options[index][this.valueAttribute]
      } else {
        this.selectedOption = null
      }

      this.loading = false
    },

    debouncedFetch: debounce(120, function (query) {
      this.fetchPage(query)
    }),

    async fetchDisplayValues (IDs) {
      this.loading = true
      const repositoryClone = this.repository().clone().clearWhereList()
      const data = await repositoryClone
        .where(this.valueAttribute, 'in', IDs)
        .attrsIf(this.isExistDeleteDate, 'mi_deleteDate')
        .misc({
          __allowSelectSafeDeleted: true
        })
        .select()
      this.loading = false

      return data
    },

    /**
     * Get label and isDeleted status for displayedOptions
     * fetch labels from server just if is not already fetched in options
     *
     * @param {array<number>} IDs list of IDs
     * @returns {Promise<Array>}
     */
    async getFormattedOptions (IDs) {
      const result = []
      for (const ID of IDs) {
        const option = this.options.find(o => o[this.valueAttribute] === ID)
        if (option) {
          result.push({
            ID,
            label: option[this.displayAttribute]
          })
        } else {
          result.push({
            ID
          })
        }
      }
      const willFetched = result
        .filter(o => !o.hasOwnProperty('label'))
        .map(o => o[this.valueAttribute])

      if (willFetched.length > 0) {
        const responseData = await this.fetchDisplayValues(willFetched)
        for (const fetchedID of willFetched) {
          const responseItem = responseData.find(i => i[this.valueAttribute] === fetchedID)
          const option = result.find(i => i[this.valueAttribute] === fetchedID)
          if (responseItem) {
            option.label = responseItem[this.displayAttribute]
            if (this.isExistDeleteDate) {
              const isDeleted = responseItem.mi_deleteDate.getTime() < Date.now()
              if (isDeleted) {
                option.isDeleted = true
              }
            }
          } else {
            option.label = fetchedID
            option.isUndefined = true
          }
        }
      }
      return result
    },

    onShowDropdown () {
      this.popperWidth = this.$refs.input.offsetWidth
    },

    afterHide () {
      this.query = ''
    },

    // emits when user click on option or click enter when option is focused
    chooseOption () {
      if (this.selectedOption === null || this.isOptionFixed(this.selectedOption)) return
      const isChecked = this.value.includes(this.selectedOption)
      if (isChecked) {
        this.removeOption(this.selectedOption)
      } else {
        this.$emit('input', this.value.concat(this.selectedOption))
      }
    },

    removeOption (ID) {
      this.$emit('input', this.value.filter(i => i !== ID))
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
      }
    },

    leaveInput () {
      if (this.dropdownVisible) {
        this.query = ''
        this.dropdownVisible = false
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

    toggleDropdown () {
      this.dropdownVisible = !this.dropdownVisible
      if (this.dropdownVisible) {
        this.fetchPage()
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

    clearSelected () {
      const filterFixed = this.value.filter(i => i === this.isOptionFixed(i))
      this.$emit('input', filterFixed)
    },

    isOptionClosable (option) {
      return !(this.readonly || !!this.isOptionFixed(option))
    },

    isOptionFixed (option) {
      return this.fixedItems.find(fi => fi === option) && this.value.find(v => v === option)
    },

    onFocus () {
      this.isFocused = true
      this.$emit('focus')
    },

    onBlur () {
      this.isFocused = false
      this.$emit('blur')
    },

    getTagType ({ isUndefined, isDeleted }) {
      if (isUndefined) {
        return 'warning'
      } else if (isDeleted) {
        return 'danger'
      } else {
        return 'info'
      }
    }
  }
}
</script>

<style>
.ub-select-multiple__container{
  border: 1px solid rgb(var(--input-border));
  border-radius: 4px;
  padding-left: 5px;
  background-color: #FFF;
  display: flex;
}

.ub-select-multiple__container.disabled{
  background-color: #F5F7FA;
  border-color: #E4E7ED;
  color: #C0C4CC;
  cursor: not-allowed;
  min-height: 32px;
}

.ub-select-multiple__container.is-focused{
  position: relative;
  border-color: rgb(var(--primary));
}

.ub-select-multiple__tag {
  margin-right: 4px;
  margin-bottom: 5px;
}

.ub-select-multiple__input-wrap{
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  flex-grow: 1;
  overflow: hidden;
}

.ub-select-multiple__input{
  border: none;
  flex-grow: 1;
  min-width: 100px;
  background: none;
  margin-bottom: 5px;
  margin-left: 10px;
  height: 20px;
}

.ub-select-multiple__input::placeholder{
  color: rgba(var(--input-placeholder), 0.54);
}

.ub-select-multiple__icon-wrap {
  display: flex;
  align-items: center;
}

.ub-select-multiple__icon{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-width: 34px;
  color: rgb(var(--input-border));
  cursor: pointer;
}

.ub-select-multiple__tag {
  position: relative;
  padding-right: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ub-select-multiple__tag.fixed {
  padding-right: 10px;
  background-color: rgba(var(--bg), 0.15);
  border-color: rgba(var(--bg), 0.15);
}

.ub-select-multiple__tag .el-icon-close {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(0, -50%) scale(0.7);
}

.ub-select-multiple__container.disabled .ub-select-multiple__tag{
  padding-right: 5px;
}
</style>

<docs>
One of these options is required:
  - `entity-name`
  - `repository`

### Use as `entity-name`

```vue
<template>
  <u-select-multiple
    v-model="model"
    entity-name="tst_dictionary"
  />>
</template>
<script>
  export default {
    data () {
      return {
        value: []
      }
    }
  }
</script>
```

### Use as `repository`
Need to set function which returns UB Repository

```vue
<template>
  <u-select-multiple
    v-model="model"
    :repository="getRepo"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: []
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
  <u-select-multiple
    v-model="model"
    entity-name="tst_dictionary"
    value-attribute="code"
  />>
</template>
<script>
  export default {
    data () {
      return {
        value: []
      }
    }
  }
</script>
```

### Clearable

```vue
<template>
  <u-select-multiple
    v-model="model"
    entity-name="tst_dictionary"
    clearable
  />
</template>
<script>
  export default {
    data () {
      return {
        value: [1,2,3]
      }
    }
  }
</script>
```

### Disabled

```vue
<template>
  <u-select-multiple
    v-model="model"
    entity-name="tst_dictionary"
    disabled
  />
</template>
<script>
  export default {
    data () {
      return {
        value: [1,2,3]
      }
    }
  }
</script>
```

### filteredItems

```vue
<template>
  <u-select-multiple
    v-model="model"
    entity-name="tst_dictionary"
    :fixed-items="fixedItems"
  />
</template>
<script>
  export default {
    data () {
      return {
        value: [1,2,3],
        fixedItems: [2]
      }
    }
  }
</script>
```
</docs>
