<template>
  <div v-clickoutside="hideDrawer">
    <div
      class="desktop-select-button"
      :class="{
        collapsed: isCollapsed
      }"
      @click="drawer = !drawer"
    >
      <i
        class="desktop-select-button__icon-before"
        :class="selectedDesktop.iconCls"
      />
      <template v-if="!isCollapsed">
        {{ selectedDesktop.caption }}
      </template>
      <i class="desktop-select-button__icon-after el-icon-more" />
    </div>

    <transition name="sidebar-animation">
      <div
        v-show="drawer"
        class="u-desktop-drawer"
      >
        <div class="u-desktop-drawer__title">
          {{ $ut('sidebar.desktopSelector.title') }}
        </div>

        <!--        TODO: full text search-->
        <!--        <div-->
        <!--          v-clickoutside="hideSearch"-->
        <!--          class="u-desktop-drawer__search"-->
        <!--        >-->
        <!--          <div class="u-desktop-drawer__search-box__wrap">-->
        <!--            <el-input-->
        <!--              v-model="searchQuery"-->
        <!--              class="u-desktop-drawer__search-input"-->
        <!--              :class="searchDropdownVisible && 'u-desktop-drawer__search-input__open'"-->
        <!--              prefix-icon="el-icon-search"-->
        <!--              clearable-->
        <!--            />-->

        <!--            <div-->
        <!--              v-show="searchDropdownVisible"-->
        <!--              class="u-desktop-drawer__search-box"-->
        <!--            >-->
        <!--              <div class="u-desktop-drawer__search__title">-->
        <!--                Search:-->
        <!--              </div>-->

        <!--              <div class="u-desktop-drawer__search-list">-->
        <!--                <div-->
        <!--                  v-for="desktop in desktops"-->
        <!--                  :key="desktop.ID"-->
        <!--                  class="u-desktop-drawer__search-item"-->
        <!--                >-->
        <!--                  <div class="u-desktop-drawer__search-item__icon">-->
        <!--                    <i :class="desktop.iconCls" />-->
        <!--                  </div>-->
        <!--                  <div class="u-desktop-drawer__search-item__text">-->
        <!--                    <div class="u-desktop-drawer__search-item__title">-->
        <!--                      {{ desktop.caption }}-->
        <!--                    </div>-->
        <!--                    <div class="u-desktop-drawer__search-item__shortcuts">-->
        <!--                      Document test, CLOB test, test IIT Sign, tst_mainunity, tst_IDMapping, tst_histDict, tst_maindata-->
        <!--                    </div>-->
        <!--                  </div>-->
        <!--                </div>-->
        <!--              </div>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </div>-->

        <div class="u-desktop-drawer__list">
          <div
            v-for="desktop in desktops"
            :key="desktop.ID"
            class="u-desktop-drawer__item"
            :class="selectedDesktopId === desktop.ID && 'active'"
            @click="changeDesktop(desktop.ID)"
          >
            <div class="u-desktop-drawer__item__icon">
              <i :class="desktop.iconCls" />
            </div>
            <div class="u-desktop-drawer__item__text">
              <div class="u-desktop-drawer__item__title">
                {{ desktop.caption }}
              </div>
              <div
                v-show="desktop.description"
                class="u-desktop-drawer__item__description"
                :title="desktop.description"
              >
                {{ desktop.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    isCollapsed: Boolean,
    desktops: {
      type: Array,
      default: () => []
    },
    selectedDesktopId: {
      type: [Number, undefined],
      default: null
    }
  },

  data () {
    return {
      searchQuery: '',
      drawer: false
    }
  },

  computed: {
    selectedDesktop () {
      if (this.selectedDesktopId) {
        const desktop = this.desktops.find(d => d.ID === this.selectedDesktopId)
        if (desktop) {
          return desktop
        } else {
          return {}
        }
      } else {
        return {}
      }
    },

    searchDropdownVisible () {
      return this.searchQuery !== ''
    }
  },

  methods: {
    changeDesktop (ID) {
      this.$emit('change-desktop', ID)
      this.drawer = false
    },

    hideDrawer () {
      this.drawer = false
    },

    hideSearch () {
      this.searchQuery = ''
    }
  }
}
</script>

<style>
.ub-sidebar__desktop-select{
  padding: 12px;
}

.ub-sidebar__desktop-select.collapsed{
  padding: 12px 0;
}

.ub-sidebar__main-menu{
  border-right: 0;
  margin: 12px auto;
  margin-top: 0;
  width: 100%;
  flex-grow: 1;
  overflow-y: auto;
}

.desktop-drawer {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 10px;
  padding-top: 0;
}

.desktop-drawer__item {
  width: 140px;
  height: 140px;
  border: 1px solid rgba(var(--info), 0.2);
  margin: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(var(--text), 0.9);
}

.desktop-drawer__item:hover{
  color: rgb(var(--primary));
  background: rgba(var(--primary), 0.1);
  border:1px solid rgba(var(--primary), 0.1);
}

.desktop-select-button {
  color: rgb(var(--text-contrast));
  font-size: 14px;
  padding: 10px 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-top: 12px;
}

.desktop-select-button i{
  font-size: 18px;
}

.desktop-select-button.collapsed{
  display: flex;
  justify-content: center;
}

.desktop-select-button.collapsed .desktop-select-button__icon-before{
  margin-right: 0;
}

.desktop-select-button:hover {
  background: rgba(var(--bg-hover), 0.9);
}

.desktop-select-button .desktop-select-button__icon-before {
  margin-right: 10px;
}

.u-desktop-drawer {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 100%;
  width: 300px;
  height: 100%;
  background: #FCFDFF;
  box-shadow: 1px 0 12px rgba(0, 0, 0, 0.12);
  display: grid;
  grid-template-rows: auto auto 1fr;
}

.u-desktop-drawer__title {
  color: rgba(var(--text), 0.87);
  padding: 16px;
}

.u-desktop-drawer__search {
  position: relative;
  padding: 16px;
  padding-top: 10px;
}

.u-desktop-drawer__search-box__wrap{
  position: relative;
}

.u-desktop-drawer__search-box {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  width: 100%;
  height: 220px;
  background: white;
  border: 1px solid rgba(var(--text), 0.12);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border-radius: 4px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.u-desktop-drawer__list {
  overflow: auto;
  margin: 10px 0;
}

.u-desktop-drawer__item {
  border-bottom: 1px solid #ECF1F8;
  padding: 16px;
  display: flex;
  cursor: pointer;
  position: relative;
}

.u-desktop-drawer__item.active:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: rgba(var(--secondary), 0.87);
}

.u-desktop-drawer__search-item:hover,
.u-desktop-drawer__item:hover {
  background: rgba(var(--secondary), 0.06);
}

.u-desktop-drawer__item__icon {
  width: 32px;
  min-width: 32px;
  height: 32px;
  margin-right: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: rgb(var(--secondary));
}

.u-desktop-drawer__item__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.u-desktop-drawer__item__title {
  font-size: 16px;
  color: rgba(var(--text), 0.87);
}

.u-desktop-drawer__item__description {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.3;
  color: rgba(var(--text), 0.54);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.u-desktop-drawer__search-box {
  display: grid;
  grid-template-rows: auto 1fr;
  padding-bottom: 32px;
}

.u-desktop-drawer__search-input .el-input__inner{
  border: 1px solid rgba(var(--text), 0.12) !important;
  border-radius: 4px;
}

.u-desktop-drawer__search-input__open .el-input__inner{
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.u-desktop-drawer__search__title {
  color: rgba(var(--text), 0.67);
  font-size: 12px;
  padding: 16px;
}

.u-desktop-drawer__search-list {
  overflow-y: auto;
  border-bottom: 1px solid #ECF1F8;
  border-top: 1px solid #ECF1F8;
}

.u-desktop-drawer__search-item {
  display: flex;
  padding: 8px 16px;
  border-bottom: 1px solid #ECF1F8;
  cursor: pointer;
}

.u-desktop-drawer__search-item:last-child {
  border-bottom: none;
}

.u-desktop-drawer__search-item__icon {
  width: 24px;
  min-width: 24px;
  height: 24px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: rgb(var(--secondary));
}

.u-desktop-drawer__search-item__text {
  overflow: hidden;
}

.u-desktop-drawer__search-item__title {
  color: rgb(var(--text));
  font-size: 12px;
}

.u-desktop-drawer__search-item__shortcuts {
  margin-top: 6px;
  font-size: 10px;
  color: rgba(var(--text), 0.76);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.sidebar-animation-enter-active,
.sidebar-animation-leave-active {
  transition: .15s;
}

.sidebar-animation-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.sidebar-animation-enter {
  opacity: 0;
  transform: translateX(10px);
}

.desktop-select-button__icon-after {
  margin-left: auto;
  transform: rotate(90deg);
}
</style>
