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
      >
        <div class="ub-select-multiple__input-wrap">
          <el-tag
            v-for="option in displayedOptions"
            :key="option.ID"
            :type="option.isDeleted ? 'danger' : 'info'"
            closable
            size="mini"
            class="ub-select-multiple__tag"
            @close="removeOption(option.ID)"
          >
            <el-tooltip
              v-if="option.isDeleted"
              :content="$ut('recordWasDeleted')"
              :enterable="false"
            >
              <i class="el-icon-delete" />
            </el-tooltip>
            {{ option.label }}
          </el-tag>

          <input
            v-model="queryDisplayValue"
            class="ub-select-multiple__input"
            @keydown.native.exact.down.alt="onKeydownAltDown"
            @keydown.native.exact.up.prevent
            @keydown.native.exact.down.prevent
          >
        </div>
        <i
          class="ub-select-multiple__icon"
          style="cursor: pointer;"
          :class="inputIconCls"
          @click="toggleDropdown"
        />
      </div>

      <div
        v-if="options.length > 0"
        ref="options"
        class="ub-select__list-options"
      >
        <div
          v-for="option in options"
          :key="option[modelAttr]"
          :ref="`option_${option[modelAttr]}`"
          class="ub-select__option"
          :class="{
            'active': option[modelAttr] === value,
            'selected': option[modelAttr] === selectedOption
          }"
          @click="chooseOption"
          @mouseenter="selectedOption = option[modelAttr]"
        >
          <el-checkbox :value="value.includes(option[modelAttr])" />
          {{ option[displayColumn] }}
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

export default {
  name: 'USelectMultiple',
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
    modelAttr: {
      type: String,
      default: 'ID'
    },
    /**
       * Name of entity. If repository is set entityName will be ignored
       */
    entityName: String,
    /**
       * Function which return UBRepository
       */
    repository: Function,
    // repeat it here and pass down to ElEdit because we need to disable toggle & actions
    /**
       * Set disable status
       */
    disabled: Boolean
  },

  data () {
    return {
      loading: false,
      query: '',
      options: [],
      pageNum: 0,
      pageSize: 20,
      moreVisible: false,
      dropdownVisible: false,
      popperWidth: 300, // by default 300, will change after popper show
      selectedOption: null,
      onEdit: false,
      prevQuery: '',
      displayedOptions: []
    }
  },

  computed: {
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

    displayColumn () {
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
    value: {
      immediate: true,
      async handler (newVal, oldVal = []) {
        const isAdded = newVal.length > oldVal.length
        if (isAdded) {
          const addedItems = newVal.filter(a => !oldVal.includes(a))
          const formatedItems = await this.getFormatedOptions(addedItems) // temp
          this.displayedOptions.push(...formatedItems)
        } else {
          const removedItems = oldVal.filter(a => !newVal.includes(a))
          for (const item of removedItems) {
            const index = this.displayedOptions.findIndex(o => o.ID === item)
            this.displayedOptions.splice(index, 1)
          }
        }
      }
    }
  },

  methods: {
    getRepository () {
      if (this.repository) {
        return this.repository()
      } else {
        return this.$UB.Repository(this.entityName)
          .attrs(this.modelAttr, this.displayColumn)
      }
    },

    async fetchPage (query, pageNum = 0) {
      this.loading = true
      this.prevQuery = query
      this.pageNum = pageNum

      const data = await this.getRepository()
        .whereIf(query, this.displayColumn, 'like', query)
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
        const currentValueIndex = this.options.findIndex(i => i[this.modelAttr] === this.value)
        const index = currentValueIndex === -1 ? 0 : currentValueIndex
        this.selectedOption = this.options[index][this.modelAttr]
      } else {
        this.selectedOption = null
      }

      this.loading = false
    },

    debouncedFetch: debounce(120, async function (query) {
      await this.fetchPage(query)
    }),

    async fetchDisplayValues (IDs) {
      this.loading = true
      const data = await this.getRepository()
        .where(this.modelAttr, 'in', IDs)
        .attrsIf(this.isExistDeleteDate, 'mi_deleteDate')
        .misc({
          __allowSelectSafeDeleted: true
        })
        .select()
      this.loading = false

      return data
    },

    async getFormatedOptions (IDs) {
      const result = []
      for (const ID of IDs) {
        const option = this.options.find(o => o[this.modelAttr] === ID)
        if (option) {
          result.push({
            ID,
            label: option[this.displayColumn]
          })
        } else {
          result.push({
            ID
          })
        }
      }
      const willFetched = result
        .filter(o => !o.hasOwnProperty('label'))
        .map(o => o.ID)

      if (willFetched.length > 0) {
        const responseData = await this.fetchDisplayValues(willFetched)
        for (const responseItem of responseData) {
          const option = result.find(i => i.ID === responseItem[this.modelAttr])
          option.label = responseItem[this.displayColumn]
          if (responseItem.mi_deleteDate) {
            const isDeleted = responseItem.mi_deleteDate.getTime() < Date.now()
            if (isDeleted) {
              option.isDeleted = true
            }
          }
        }

        if (responseData.length !== willFetched.length) {
          const missingValues = willFetched.filter(ID => {
            const includesInResponse = responseData.findIndex(i => i[this.modelAttr] === ID) !== -1
            return !includesInResponse
          })
          throw new Error(`Missing values '${missingValues}' in entity '${this.entity}'`)
        }
      }
      return result
    },

    onShowDropdown () {
      this.popperWidth = this.$refs.input.offsetWidth
      this.addClickOutsideListener()
    },

    afterHide () {
      this.removeClickOutsideListener()
      this.query = ''
    },

    addClickOutsideListener () {
      document.body.addEventListener('click', this.clickOutside)
    },

    removeClickOutsideListener () {
      document.body.removeEventListener('click', this.clickOutside)
    },

    clickOutside ({ target }) {
      const isInput = this.$refs.input.contains(target)

      if (!isInput) {
        this.selectedOption = this.value
        this.dropdownVisible = false
      }
    },

    chooseOption () {
      if (this.selectedOption === null) return
      const isChecked = this.value.includes(this.selectedOption)
      if (isChecked) {
        this.removeOption(this.selectedOption)
      } else {
        this.$emit('input', this.value.concat(this.selectedOption), this.selectedOption, true)
      }
    },

    removeOption (ID) {
      this.$emit('input', this.value.filter(i => i !== ID), ID, false)
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

    onKeydownAltDown ({ key, altKey }) {
      if (key === 'ArrowDown' && altKey && !this.dropdownVisible) {
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

    changeSelected (direction) {
      const index = this.options.findIndex(o => o[this.modelAttr] === this.selectedOption)
      const nextIndex = index + direction
      const lessMin = nextIndex < 0
      const moreMax = nextIndex > this.options.length - 1
      const inRange = !lessMin && !moreMax
      if (inRange) {
        this.selectedOption = this.options[nextIndex][this.modelAttr]
      }
      if (this.dropdownVisible && this.options.length > 0) {
        const el = this.$refs[`option_${this.selectedOption}`][0]
        el.scrollIntoView({ block: 'nearest' })
      }
    }
  }
}
</script>

<style>
.ub-select-multiple__container{
  display: flex;
  border: 1px solid #DCDFE6; // temp
  border-radius: 4px;
  padding-left: 5px;
}

.ub-select-multiple__container.is-focused{

}

.ub-select-multiple__tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.ub-select-multiple__input-wrap{
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  margin-top: 4px;
}

.ub-select-multiple__input{
  border: none;
  flex-grow: 1;
  min-width: 150px;
  background: none;
  margin-bottom: 4px;
}

.ub-select-multiple__icon{
  min-height: 100%;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
