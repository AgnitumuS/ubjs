<template>
  <div class="u-toolbar">
    <u-toolbar-button
      v-for="button in mainPanelButtons"
      :key="button.label + button.icon"
      :tooltip="button.label"
      :disabled="button.disabled"
      :icon="button.icon"
      :color="button.color"
      @click="button.handler"
    />
    <!-- @slot left side toolbar (after default buttons) -->
    <slot name="left" />
    <div class="u-toolbar__flex-divider" />
    <!-- @slot right side toolbar (before setting button) -->
    <slot name="right" />

    <u-toolbar-button
      v-if="entitySchema.hasMixin('softLock')"
      :icon="isLocked ? 'fa fa-lock' : 'fa fa-unlock'"
      :color="isLocked ? (isLockedByMe ? 'primary' : 'danger') : 'info'"
      :tooltip="lockInfoMessage"
    />

    <u-dropdown
      class="u-toolbar__settings-button"
      placement="bottom-end"
    >
      <u-toolbar-button
        icon="fa fa-cog"
        color="secondary"
      />

      <template #dropdown>
        <template
          v-for="button in dropdownButtons"
        >
          <u-dropdown-item
            :key="button.label + button.icon"
            :label="button.label"
            :disabled="button.disabled"
            :icon="button.icon"
            @click="button.handler"
          />
          <u-dropdown-item
            v-if="button.divider"
            :key="button.label + button.icon + 1"
            divider
          />
        </template>

        <!-- @slot if need append items to dropdown -->
        <slot name="dropdown" />
      </template>
    </u-dropdown>

    <table
      v-if="mi_createDate && mi_modifyDate"
      class="u-toolbar__date"
    >
      <tr>
        <td>{{ $ut('createdEntityCaption') }}:</td>
        <td>{{ $moment(mi_createDate).format('lll') }}</td>
      </tr>
      <tr>
        <td>{{ $ut('updatedEntityCaption') }}:</td>
        <td>{{ $moment(mi_modifyDate).format('lll') }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
/* global $App */
const { mapState, mapGetters, mapActions } = require('vuex')
const { mapInstanceFields } = require('../../utils/Form/helpers')

/**
 * Form toolbar with default actions.
 * You can add custom actions by slots
 */
export default {
  name: 'UToolbar',

  props: {
    hideDefaultButtons: Boolean
  },

  inject: ['$formServices', 'formCode', 'entitySchema', 'fieldList', 'entity'],

  computed: {
    ...mapGetters([
      'canSave',
      'canRefresh',
      'canDelete',
      'isLocked',
      'isLockedByMe',
      'lockInfoMessage'
    ]),
    ...mapState(['isNew', 'lockInfo']),
    ...mapInstanceFields(['mi_createDate', 'mi_modifyDate']),

    mainPanelButtons () {
      if (this.hideDefaultButtons) {
        return []
      }
      return [{
        label: this.$ut('save') + ' (Ctrl + S)',
        icon: 'fas fa-save',
        handler: () => this.save(),
        disabled: !this.canSave,
        color: 'primary'
      }, {
        label: this.$ut('saveAndClose') + ' (Ctrl + Enter)',
        icon: 'far fa-share-square',
        handler: this.saveAndClose,
        disabled: !this.canSave,
        color: 'primary'
      }, {
        label: this.$ut('Delete') + ' (Ctrl + Delete)',
        icon: 'far fa-trash-alt',
        handler: () => this.deleteInstance(this.$formServices.forceClose),
        disabled: !this.canDelete,
        color: 'secondary',
        divider: true
      }]
    },

    dropdownButtons () {
      if (this.hideDefaultButtons) {
        return []
      }
      const buttons = [{
        label: this.$ut('refresh') + ' (Ctrl + R)',
        icon: 'fa fa-refresh',
        handler: () => this.refresh(),
        disabled: !this.canRefresh
      }]
      buttons.push(...this.mainPanelButtons)

      if (this.$UB.connection.domain.isEntityMethodsAccessible('ubm_form', 'update')) {
        buttons.push({
          icon: 'fa fa-wrench',
          label: 'formConstructor',
          handler: this.formConstructorHandler,
          divider: true
        })
      }

      buttons.push({
        icon: 'fa fa-link',
        label: 'link',
        handler: this.copyLink
      })

      if (this.entitySchema.hasMixin('dataHistory')) {
        buttons.push({
          icon: 'fa fa-history',
          label: 'ChangesHistory',
          disabled: this.isNew,
          handler: this.showDataHistory
        })
      }

      if (this.entitySchema.hasMixin('audit')) {
        buttons.push({
          icon: 'fas fa-history',
          label: 'showAudit',
          handler: this.showAudit,
          disabled: !this.$UB.connection.domain.isEntityMethodsAccessible('uba_auditTrail', 'select')
        })
      }

      if (this.entitySchema.hasMixin('aclRls')) {
        const mixins = this.entitySchema.mixins
        const aclEntityName = mixins && mixins.aclRls && mixins.aclRls.useUnityName
          ? mixins.unity.entity + '_acl' : this.entitySchema.name + '_acl'
        buttons.push({
          icon: 'fa fa-shield',
          label: 'accessRight',
          handler: () => {},
          disabled: !this.$UB.connection.domain.isEntityMethodsAccessible(aclEntityName, 'select')
        })
      }

      if (this.entitySchema.hasMixin('softLock')) {
        buttons.push({
          icon: 'fa fa-lock',
          label: 'lockBtn',
          handler: () => { this.lockEntity(true) },
          disabled: this.isNew,
          divider: true
        })
        buttons.push({
          icon: 'fa fa-unlock',
          label: 'unLockBtn',
          handler: () => { this.unlockEntity() },
          disabled: !this.isLockedByMe
        })
      }

      return buttons
    },

    linkToEntity () {
      const query = [
        'cmdType=showForm',
        `entity=${this.entity}`,
        `instanceID=${this.$store.state.data.ID}`
      ].join('&')
      return `${window.location.protocol}//${window.location.host}${window.location.pathname}#${query}`
    }
  },

  mounted () {
    if (!this.hideDefaultButtons) {
      this.$root.$el.addEventListener('keydown', this.onKeydownActions)
    }
  },

  beforeDestroy () {
    if (!this.hideDefaultButtons) {
      this.$root.$el.removeEventListener('keydown', this.onKeydownActions)
    }
  },

  methods: {
    ...mapActions([
      'save',
      'refresh',
      'deleteInstance',
      'lockEntity',
      'unlockEntity'
    ]),

    async saveAndClose () {
      await this.save()
      this.$formServices.forceClose()
    },

    dropdownHandler (command) {
      if (command === 'hide') {
        this.$refs.dropdown.hide()
      }
    },

    async formConstructorHandler () {
      const formEntity = this.$UB.connection.domain.get('ubm_form')

      if (!formEntity.haveAccessToMethod('update')) {
        return
      }
      if (!this.formCode) {
        this.$notify({
          title: this.$ut('isAutoGeneratedForm'),
          duration: 3000
        })
        return
      }

      const result = await this.$UB.Repository('ubm_form')
        .attrs(['ID', 'code'])
        .where('code', '=', this.formCode)
        .selectSingle()

      if (!result) {
        this.$notify({
          title: this.$ut('formNotFound'),
          duration: 3000
        })
        return
      }

      $App.doCommand({
        cmdType: 'showForm',
        description: '',
        entity: 'ubm_form',
        instanceID: result.ID,
        sender: this,
        target: $App.getViewport().centralPanel,
        tabId: 'ubm_form' + result.ID
      })
    },

    copyLink () {
      const input = document.createElement('input')
      input.value = this.linkToEntity
      input.style.position = 'absolute'
      input.style.top = '100%'
      input.style.left = '100%'
      document.body.appendChild(input)
      input.select()
      if (document.execCommand('copy')) {
        document.body.removeChild(input)
        this.$notify({
          title: this.$ut('link'),
          message: this.$ut('linkCopiedText'),
          duration: 5000
        })
      }
      window.getSelection().removeAllRanges()
    },

    showDataHistory () {
      const fieldList = new Set(this.fieldList)

      fieldList.add('mi_dateFrom')
      fieldList.add('mi_dateTo')

      const extendedFieldList = this.$UB.core.UBUtil.convertFieldListToExtended([...fieldList])
      for (const item of extendedFieldList) {
        const field = item.name
        if (field === 'mi_dateTo' || field === 'mi_dateFrom') {
          item.visibility = true
          item.description = this.$ut(field)
        }
      }
      $App.doCommand({
        cmdType: 'showList',
        isModal: true,
        cmdData: {
          params: [{
            entity: this.entitySchema.name,
            method: 'select',
            fieldList: [...fieldList]
          }]
        },
        cmpInitConfig: {
          extendedFieldList
        },
        instanceID: this.$store.state.data.ID,
        __mip_recordhistory: true
      })
    },

    showAudit () {
      $App.doCommand({
        renderer: 'vue',
        isModal: true,
        title: `${this.$UB.i18n('Audit')} (${this.$UB.i18n(this.entity)})`,
        cmdType: 'showList',
        cmdData: {
          repository: () => {
            return this.$UB.Repository('uba_auditTrail')
              .attrs(['ID', 'actionTime', 'actionType', 'actionUserName', 'remoteIP'])
              .where('entity', '=', this.entity)
              .where('entityinfo_id', '=', this.$store.state.data.ID)
              .orderByDesc('actionTime')
          },
          columns: ['actionTime', 'actionType', 'actionUserName', 'remoteIP']
        }
      })
    },

    onKeydownActions (e) {
      if (!e.ctrlKey) return // return ASAP in case Ctrl not pressed
      if (e.key === 'r') {
        e.preventDefault()
        if (this.canRefresh) {
          this.refresh()
        }
      }

      if (e.key === 's') {
        e.preventDefault()
        if (this.canSave) {
          this.save()
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault()
        if (this.canSave) {
          this.saveAndClose()
        }
      }

      if (e.key === 'Delete') {
        e.preventDefault()
        if (this.canDelete) {
          this.deleteInstance(this.$formServices.forceClose)
        }
      }
    }
  }
}
</script>

<style>
.u-toolbar{
  border-bottom: 1px solid rgba(var(--bg), 0.12);
  padding: 0.5em 1em;
  display: flex;
}

.u-toolbar__flex-divider{
  margin-left: auto;
}

.u-toolbar__date td{
  font-size: 10px;
  color: rgb(var(--info));
  text-align: right;
  padding-right: 5px;
  white-space: nowrap;
}

.u-toolbar__date{
  border-left: 1px solid rgba(var(--info), 0.1);
  padding-left: 10px;
  margin-left: 10px;
}

.u-toolbar__settings-button > .u-dropdown__reference{
  height: 100%;
}
</style>

<docs>
### Usage
```vue
<template>
  <div class="u-form-layout">
    <u-toolbar/>
    <u-form-container>
      <!-- Your form -->
    </u-form-container>
  </div>
</template>

<script>
export default {
}
</script>
```

### Slots
```vue
<template>
  <div class="u-form-layout">
    <u-toolbar>
      <u-toolbar-button slot="left">left side btn</u-toolbar-button>
      <u-toolbar-button slot="right">right side btn</u-toolbar-button>
      <!-- Or any component you need, button for example -->
      <button slot="dropdown">dropdown btn</button>
    </u-toolbar>
    <u-form-container>
      <!-- Your form -->
    </u-form-container>
  </div>
</template>

<script>
  export default {
    name: 'Toolbar'
  }
</script>
```
</docs>
