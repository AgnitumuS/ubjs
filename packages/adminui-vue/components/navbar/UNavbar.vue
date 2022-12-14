<template>
  <div
    class="u-navbar"
    :class="{'u-navbar__hidden': !visibleNavbar}"
  >
    <i
      class="u-icon-more u-navbar__collapse-button"
      @click="visibleNavbar = !visibleNavbar"
    />

    <u-dropdown
      v-show="tabs.length"
      class="u-navbar-all-tabs__dropdown-reference"
    >
      <button
        :title="$ut('UNavbar.allTabsButton')"
        class="u-navbar-all-tabs__button"
      >
        {{ tabs.length }}
      </button>
      <template slot="dropdown">
        <div class="u-navbar-all-tabs__dropdown__body">
          <u-dropdown-item
            v-for="tab of tabs"
            :key="tab.id"
            class="u-navbar-all-tabs__dropdown-item"
            :class="{active: tab.id === activeTabId}"
            @click="setActiveTab(tab.id)"
          >
            <template slot="label">
              <div v-html="tab.title" />
              <u-button
                class="u-navbar-all-tabs__dropdown-item-close-button"
                icon="u-icon-close"
                color="control"
                appearance="inverse"
                @click.stop="handleClose([tab])"
              />
            </template>
          </u-dropdown-item>
        </div>

        <u-dropdown-item divider />

        <u-dropdown-item
          label="closeAll"
          @click="closeAll"
        />
        <u-dropdown-item
          v-if="tabs.length>1"
          label="closeInactive"
          @click="closeOther(activeTabId)"
        />
      </template>
    </u-dropdown>

    <div class="u-navbar__tab-container">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :ref="`tab${tab.id}`"
        :class="{
          active: tab.id === activeTabId
        }"
        class="u-navbar__tab"
        :title="getTooltipText(tab)"
        @click="setActiveTab(tab.id)"
        @contextmenu="showContextMenu($event, tab.id)"
        @click.middle="handleClose([tab])"
      >
        <span
          class="u-navbar__tab-text"
          v-html="tab.title"
        />
        <i
          class="u-icon-close u-navbar__tab-close-button"
          @click="handleClose([tab])"
        />
      </div>
    </div>

    <slot />

    <u-dropdown ref="contextMenu">
      <template slot="dropdown">
        <u-dropdown-item
          label="closeOther"
          @click="closeOther(contextMenuTabId)"
        />
        <u-dropdown-item
          label="closeAll"
          @click="closeAll"
        />
        <u-dropdown-item
          label="close"
          @click="close"
        />
      </template>
    </u-dropdown>
  </div>
</template>

<script>
export default {
  name: 'UNavbar',

  data () {
    return {
      tabs: [],
      activeTabId: null,
      contextMenuTabId: null,
      isCollapsed: this.$uiSettings.get('sidebar', 'isCollapsed') === true,
      visibleNavbar: true,
      originalExtNavbarHeight: null
    }
  },

  watch: {
    visibleNavbar (value) {
      const centralPanel = this.$UB.core.UBApp.viewport.centralPanel
      if (value) {
        centralPanel.tabBar.setHeight(this.originalExtNavbarHeight)
        centralPanel.setMargin(`-${this.originalExtNavbarHeight} 0 0 0`)
      } else {
        centralPanel.tabBar.setHeight(0)
        centralPanel.setMargin(`-${this.originalExtNavbarHeight} 0 0 0`)
      }
    }
  },

  created () {
    this.subscribeCentralPanelEvents()
    this.subscribeSlotDefine()
  },

  mounted () {
    const centralPanel = this.$UB.core.UBApp.viewport.centralPanel
    this.tabs = centralPanel.items.items
      .map(({ id, title, titleTooltip }) => ({ id, title, titleTooltip }))

    this.originalExtNavbarHeight = this.$el.offsetHeight
    centralPanel.tabBar.setHeight(this.originalExtNavbarHeight)
    centralPanel.setMargin(`-${this.originalExtNavbarHeight} 0 0 0`)
  },

  methods: {
    subscribeSlotDefine () {
      this.$UB.core.UBApp.on({
        'portal:navbar:appendSlot': (Component, bindings) => {
          if (Array.isArray(this.$slots.default)) {
            this.$slots.default.push(this.$createElement(Component, bindings))
          } else {
            this.$slots.default = [this.$slots.default, this.$createElement(Component, bindings)]
          }
          this.$forceUpdate()
        },

        'portal:navbar:prependSlot': (Component, bindings) => {
          if (Array.isArray(this.$slots.default)) {
            // this.$slots.default.push(this.$createElement(Component, bindings))
            this.$slots.default = this.$slots.default.slice().unshift(this.$createElement(Component, bindings)) // prepend data to array
          } else {
            this.$slots.default = [this.$createElement(Component, bindings), this.$slots.default]
          }
          this.$forceUpdate()
        },

        'portal:navbar:defineSlot': (Component, bindings) => {
          this.$slots.default = this.$createElement(Component, bindings)
          this.$forceUpdate()
        }
      })
    },

    setActiveTab (tabId) {
      const index = this.tabs.findIndex(tab => tab.id === tabId)
      if (index !== -1) {
        this.$UB.core.UBApp.viewport.centralPanel.setActiveTab(index)
      }
    },

    handleClose (tabs) {
      for (const { id } of tabs) {
        const tab = this.$UB.core.UBApp.viewport.centralPanel.queryById(id)
        if (tab) {
          tab.close()
        }
      }
    },

    closeOther (exceptId) {
      const other = this.tabs.filter(tab => tab.id !== exceptId)
      this.handleClose(other)
    },
    closeAll () {
      this.handleClose([...this.tabs])
    },
    close () {
      this.handleClose([{ id: this.contextMenuTabId }])
    },

    showContextMenu (event, tabId) {
      this.contextMenuTabId = tabId
      this.$refs.contextMenu.show(event)
    },

    subscribeCentralPanelEvents () {
      window.$App.viewport.centralPanel.on({
        /**
         * React on adding a new tab to ExtJS "centralPanel".
         * @param sender
         * @param tab
         */
        add (sender, tab) {
          tab.addListener('titlechange', (UBTab, newText) => {
            const tab = this.tabs.find(t => t.id === UBTab.id)
            if (tab) {
              tab.title = UBTab._formTitle || newText // _formFullTitle and _formTitle is for ext forms legacy support
              tab.titleTooltip = UBTab._formFullTitle || newText
            }
          })
          this.tabs.push({
            id: tab.id,
            title: tab.title,
            titleTooltip: tab.titleTooltip
          })
        },

        remove (sender, tab) {
          const index = this.tabs.findIndex(({ id }) => id === tab.id)
          if (index !== -1) {
            this.tabs.splice(index, 1)
          }
        },

        async tabchange (sender, tab) {
          this.activeTabId = tab.id
          await this.$nextTick()
          const ref = this.$refs[`tab${tab.id}`]
          if (ref && ref.length) { // ref can be []  https://dev.intecracy.com/jira/browse/DRORM-2465
            ref[0].scrollIntoView({
              behavior: 'smooth',
              inline: 'center',
              block: 'center'
            })
          }
        },

        scope: this
      })
    },

    /**
     * Return non-empty string in case tooltip is defined in titleTooltip
     * or title length > 18
     */
    getTooltipText (tab) {
      // tooltip defined manually
      if (tab.titleTooltip && tab.titleTooltip !== tab.title) return tab.titleTooltip
      return tab.title.length > 18 ? tab.title : ''
    }
  }
}
</script>

<style>
.u-navbar-all-tabs__dropdown__body {
  max-height: calc(100vh - 105px - var(--navbar-height)); /* decrease by footer height */
  overflow: auto;
}
.u-navbar {
  padding: 8px;
  padding-left: 30px;
  display: flex;
  background: hsl(var(--hs-background), var(--l-background-inverse));
  border-bottom: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  position: relative;
  z-index: 10;
  height: var(--navbar-height);
}

.u-navbar__hidden {
  transform: translateY(-100%);
}

.u-navbar__tab-container {
  scroll-snap-type: x mandatory;
  overflow-x: auto;
  flex-grow: 1;
  display: flex;
  padding-bottom: 3px;
}

.u-navbar__tab-container::-webkit-scrollbar {
  height: 4px;
}

.u-navbar__tab-container::-webkit-scrollbar-thumb {
  border-width: 0;
}

.u-navbar__tab {
  scroll-snap-align: start;
  max-width: 200px;
  flex-shrink: 0;
  border: 1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  border-radius: 8px;
  font-size: 14px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  color: hsl(var(--hs-text), var(--l-text-default));
}

.u-navbar__tab + .u-navbar__tab {
  margin-left: 12px;
}

.u-navbar__tab.active {
  background: hsl(var(--hs-sidebar), var(--l-sidebar-depth-1));
  border-color: hsl(var(--hs-sidebar), var(--l-sidebar-depth-1));
  color: hsl(var(--hs-text), var(--l-text-inverse))
}

.u-navbar__tab-close-button {
  font-size: 12px;
  padding: 0 12px;
  align-self: stretch;
  display: flex;
  align-items: center;
}

.u-navbar__tab-text {
  padding-left: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.u-navbar__collapse-button {
  z-index: 10;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  color: hsl(var(--hs-background), var(--l-background-inverse));
  background: hsl(var(--hs-sidebar), var(--l-sidebar-default));
  width: 50px;
  height: 16px;
  font-size: 20px;
  border-bottom-right-radius: 20px;
  border-bottom-left-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.u-navbar__collapse-button:hover {
  background: hsl(var(--hs-sidebar), var(--l-sidebar-depth-1));
}

@media (min-height: 500px) {
  .u-navbar__collapse-button {
    display: none;
  }
}

.u-navbar-all-tabs__dropdown-reference {
  margin-right: 8px;
}

.u-navbar-all-tabs__button {
  color: hsl(var(--hs-text), var(--l-text-default));
  border:  1px solid hsl(var(--hs-border), var(--l-layout-border-default));
  border-radius: var(--border-radius);
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: none;
}

.u-navbar-all-tabs__button:hover {
  background: hsl(var(--hs-background), var(--l-background-default));
}

.u-navbar-all-tabs__dropdown-item .u-dropdown-item__label {
  padding: 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.u-navbar-all-tabs__dropdown-item.active {
  background: hsl(var(--hs-primary), var(--l-background-default));
}

.u-navbar-all-tabs__dropdown-item .u-dropdown-item__label > div{
  overflow: hidden;
  text-overflow: ellipsis;
}

.u-navbar-all-tabs__dropdown-item-close-button {
  margin-left: 8px;
}
</style>
