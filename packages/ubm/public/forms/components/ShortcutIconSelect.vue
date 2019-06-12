<template>
  <u-form-row :label="entitySchema.attributes.iconCls.caption">
    <el-row
      :gutter="10"
      type="flex"
      align="middle"
    >
      <el-col :span="14">
        <el-input v-model="iconCls">
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
          :class="iconCls"
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

        <h3>Font-awesome icons</h3>

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
        <u-form-row :label="entitySchema.attributes.iconCls.caption">
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
const { mapGetters } = require('vuex')
const { mapInstanceFields } = require('@unitybase/adminui-vue')

export default {
  name: 'ShortcutIconSelect',
  inject: ['entitySchema'],

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
    ...mapInstanceFields(['iconCls']),
    ...mapGetters(['loading']),

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
        for (const r of ss.rules) {
          if (r.selectorText) {
            if (r.selectorText.startsWith('.el-icon')) {
              const icon = r.selectorText.split(':')[0].substr(1)
              const className = r.selectorText.split(':')[0]
              const isDuplicate = this.elIcons.includes(icon)
              const isHelper = this.isHelperCls(className)
              if (!isDuplicate && !isHelper) {
                this.elIcons.push(icon)
              }
            }
            if (r.selectorText.startsWith('.fa-')) {
              const icon = 'fa ' + r.selectorText.split(':')[0].substr(1)
              const className = r.selectorText.split(':')[0]
              const isDuplicate = this.faIcons.includes(icon)
              const isHelper = this.isHelperCls(className)
              if (!isDuplicate && !isHelper) {
                this.faIcons.push(icon)
              }
            }
          }
        }
      }
    },

    onOpenDialog () {
      this.selectedIcon = null
      this.searchQuery = ''
      if (!this.isInited) {
        this.initIcons()
        this.isInited = true
      }
    },

    isHelperCls (cls) {
      const helpers = ['.el-icon--right',
        '.el-icon--left',
        '.fa-lg',
        '.fa-2x',
        '.fa-3x',
        '.fa-4x',
        '.fa-5x',
        '.fa-fw',
        '.fa-ul',
        '.fa-ul > li',
        '.fa-li',
        '.fa-li.fa-lg',
        '.fa-border',
        '.fa-pull-left',
        '.fa-pull-right',
        '.fa-spin',
        '.fa-pulse',
        '.fa-rotate-90',
        '.fa-rotate-180',
        '.fa-rotate-270',
        '.fa-flip-horizontal',
        '.fa-flip-vertical',
        '.fa-stack',
        '.fa-stack-1x',
        '.fa-stack-2x',
        '.fa-stack-1x, .fa-stack-2x',
        '.fa-inverse',
        '.fa-space'
      ]
      return helpers.includes(cls)
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
