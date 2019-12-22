<template>
  <u-form-row :label="label">
    <el-row
      :gutter="10"
      type="flex"
      align="middle"
    >
      <el-col :span="14">
        <el-input v-model="value">
          <el-button
            slot="append"
            icon="el-icon-menu"
            @click="dialogVisible = true"
          />
        </el-input>
      </el-col>
      <el-col
        :span="2"
        style="text-align: center"
      >
        <i
          :class="value"
          style="font-size: 32px;"
        />
      </el-col>
    </el-row>

    <el-dialog
      :visible.sync="dialogVisible"
      append-to-body
      width="700px"
      :close-on-click-modal="false"
      @open="onOpenDialog"
    >
      <el-input
        v-model="searchQuery"
        suffix-icon="el-icon-search"
        :placeholder="$ut('Search')"
      />

      <div class="ub-shortcut__icon-select__list">
        <h3>Element ui icons</h3>

        <el-row v-if="getElIcons.length > 0">
          <el-col
            v-for="icon in getElIcons"
            :key="icon"
            :span="4"
            class="ub-shortcut__icon-select__item"
            :class="{
              selected: icon === selectedIcon
            }"
            @click.native="selectedIcon = icon"
          >
            <i :class="icon" />
            <div>{{ icon }}</div>
          </el-col>
        </el-row>
        <div v-else>Not found</div>

        <h3>Font awesome 5 free icons</h3>

        <el-row v-if="getFaIcons.length > 0">
          <el-col
            v-for="icon in getFaIcons"
            :key="icon"
            :span="4"
            class="ub-shortcut__icon-select__item"
            :class="{
              selected: icon === selectedIcon
            }"
            @click.native="selectedIcon = icon"
          >
            <i :class="icon" />
            <div>{{ icon }}</div>
          </el-col>
        </el-row>
        <div v-else>Not found</div>
      </div>

      <template slot="footer">
        <u-form-row :label="label">
          <el-input
            readonly
            :value="selectedIcon"
          />
        </u-form-row>

        <el-button
          type="primary"
          :disabled="!selectedIcon"
          @click="chooseIcon"
        >
          Choose
        </el-button>
      </template>
    </el-dialog>
  </u-form-row>
</template>

<script>
const FA_HELPERS = {
  '.el-icon--right': true,
  '.el-icon--left': true,
  '.fa-xs': true,
  '.fa-sm': true,
  '.fa-lg': true,
  '.fa-1x': true,
  '.fa-2x': true,
  '.fa-3x': true,
  '.fa-4x': true,
  '.fa-5x': true,
  '.fa-6x': true,
  '.fa-7x': true,
  '.fa-8x': true,
  '.fa-9x': true,
  '.fa-10x': true,
  '.fa-fw': true,
  '.fa-ul': true,
  '.fa-ul > li': true,
  '.fa-li': true,
  '.fa-li.fa-lg': true,
  '.fa-border': true,
  '.fa-pull-left': true,
  '.fa-pull-right': true,
  '.fa-spin': true,
  '.fa-pulse': true,
  '.fa-rotate-90': true,
  '.fa-rotate-180': true,
  '.fa-rotate-270': true,
  '.fa-flip-horizontal': true,
  '.fa-flip-vertical': true,
  '.fa-stack': true,
  '.fa-stack-1x': true,
  '.fa-stack-2x': true,
  '.fa-stack-1x, .fa-stack-2x': true,
  '.fa-inverse': true,
  '.fa-space': true
}
export default {
  name: 'UIconPicker',

  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      elIcons: [],
      faIcons: [],
      dialogVisible: false,
      searchQuery: '',
      selectedIcon: null,
      isInited: false
    }
  },

  computed: {
    getElIcons () {
      return this.elIcons.filter(this.iconFilter)
    },

    getFaIcons () {
      return this.faIcons.filter(this.iconFilter)
    }
  },

  methods: {
    iconFilter (icon) {
      return icon.toLowerCase().indexOf(this.searchQuery.toLowerCase()) !== -1
    },

    initIcons () {
      for (const ss of document.styleSheets) {
        for (const r of ss.cssRules) {
          if (r.selectorText) {
            if (r.selectorText.startsWith('.el-icon')) {
              const icon = r.selectorText.split(':')[0].substr(1)
              const className = '.' + icon
              const isDuplicate = this.elIcons.includes(icon)
              const isHelper = this.isHelperCls(className)
              if (!isDuplicate && !isHelper) {
                this.elIcons.push(icon)
              }
            }
            let st = r.selectorText
            if (st.startsWith('.fa-') && st.endsWith(':before')) {
              let cls = st.split(':')[0].substr(1)
              const icon = 'fas ' + cls
              this.faIcons.push(icon)
            }
          }
        }
      }
    },

    onOpenDialog () {
      this.selectedIcon = this.value ? this.value : null
      this.searchQuery = ''
      if (!this.isInited) {
        this.initIcons()
        this.isInited = true
      }
    },

    isHelperCls (cls) {
      return FA_HELPERS[cls] === true
    },

    chooseIcon () {
      this.$emit('select', this.selectedIcon)
      this.dialogVisible = false
    }
  }

}
</script>

<style>
.ub-shortcut__icon-select__list {
  height: 45vh;
  overflow-y: auto;
  overflow-x: visible;
  margin: 10px 0;
  padding-bottom: 20px;
}

.ub-shortcut__icon-select__item {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  height: 90px;
  margin-right: -1px;
  margin-bottom: -1px;
  padding: 5px;
  cursor: pointer;
}

.ub-shortcut__icon-select__item.selected {
  color: rgb(var(--primary))
}

.ub-shortcut__icon-select__item i {
  margin-bottom: 10px;
  font-size: 36px;
}
</style>
