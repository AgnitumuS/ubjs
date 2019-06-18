<template>
  <div class="ub-toolbar">
    <u-toolbar-button
      v-for="button in mainPanelButtons"
      :key="button.caption + '0'"
      :icon-cls="button.iconCls"
      :disabled="button.disabled"
      :tooltip="button.caption"
      :icon-color="button.iconColor"
      @click="button.handler"
    />
    <!-- @slot left side toolbar (after default buttons) -->
    <slot name="left" />
    <div class="ub-toolbar__flex-divider" />
    <!-- @slot right side toolbar (before setting button) -->
    <slot name="right" />

    <el-dropdown
      ref="dropdown"
      size="big"
      trigger="click"
      :hide-on-click="false"
      @command="dropdownHandler"
    >
      <u-toolbar-button icon-cls="fa fa-cog" />

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="button in dropdownButtons"
          :key="button.caption + '1'"
          command="hide"
          :disabled="button.disabled"
          :divided="button.divided"
          @click.native="button.handler"
        >
          <i :class="button.iconCls" />
          {{ button.caption }}
        </el-dropdown-item>
        <!-- @slot if need append items to dropdown -->
        <slot name="dropdown" />
      </el-dropdown-menu>
    </el-dropdown>

    <table
      v-if="mi_createDate && mi_modifyDate"
      class="ub-toolbar__date"
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
const UToolbarButton = require('./UToolbarButton.vue').default

/**
 * Form toolbar with default actions.
 * You can add custom actions by slots
 */
export default {
  name: 'UToolbar',

  components: { UToolbarButton },
  inject: ['$formServices', 'formCode', 'entitySchema', 'fieldList', 'entity'],

  computed: {
    ...mapGetters(['canSave', 'canRefresh', 'canDelete']),

    ...mapState(['isNew']),

    ...mapInstanceFields(['mi_createDate', 'mi_modifyDate']),

    mainPanelButtons () {
      return [{
        caption: this.$ut('save') + ' (Ctrl + S)',
        iconCls: 'fa fa-save',
        handler: () => this.save(),
        disabled: !this.canSave,
        iconColor: 'green'
      }, {
        caption: this.$ut('saveAndClose') + ' (Ctrl + Enter)',
        iconCls: 'fa fa-share-square-o',
        handler: this.saveAndClose,
        disabled: !this.canSave,
        iconColor: 'green'
      }, {
        caption: this.$ut('Delete') + ' (Ctrl + Delete)',
        iconCls: 'fa fa-trash-o',
        handler: () => this.deleteInstance(this.$formServices.forceClose),
        disabled: !this.canDelete,
        divided: true
      }]
    },

    dropdownButtons () {
      const buttons = [{
        caption: this.$ut('obnovit') + ' (Ctrl + R)',
        iconCls: 'fa fa-refresh',
        handler: () => this.refresh(),
        disabled: !this.canRefresh
      }]
      buttons.push(...this.mainPanelButtons)

      if (this.$UB.connection.domain.isEntityMethodsAccessible('ubm_form', 'update')) {
        buttons.push({
          iconCls: 'fa fa-wrench',
          caption: this.$ut('formConstructor'),
          handler: this.formConstructorHandler,
          divided: true
        })
      }

      buttons.push({
        iconCls: 'fa fa-link',
        caption: this.$ut('ssylka'),
        handler: this.copyLink
      })

      if (this.entitySchema.hasMixin('dataHistory')) {
        buttons.push({
          iconCls: 'fa fa-history',
          caption: this.$ut('ChangesHistory'),
          disabled: this.isNew,
          handler: this.showDataHistory
        })
      }

      if (this.entitySchema.hasMixin('audit')) {
        buttons.push({
          iconCls: 'fa fa-history',
          caption: this.$ut('showAudit'),
          handler: this.showAudit,
          disabled: !this.$UB.connection.domain.isEntityMethodsAccessible('uba_auditTrail', 'select')
        })
      }

      if (this.entitySchema.hasMixin('aclRls')) {
        const mixins = this.entitySchema.mixins
        const aclEntityName = mixins && mixins.aclRls && mixins.aclRls.useUnityName
          ? mixins.unity.entity + '_acl' : this.entitySchema.name + '_acl'
        buttons.push({
          iconCls: 'fa fa-shield',
          caption: this.$ut('accessRight'),
          handler: () => { debugger },
          disabled: !this.$UB.connection.domain.isEntityMethodsAccessible(aclEntityName, 'select')
        })
      }

      if (this.entitySchema.hasMixin('softLock')) {
        buttons.push({
          iconCls: 'fa fa-lock',
          caption: this.$ut('lockBtn'),
          handler: () => { debugger },
          disabled: this.isNew,
          divided: true
        })
        buttons.push({
          iconCls: 'fa fa-unlock',
          caption: this.$ut('unLockBtn'),
          handler: () => { debugger },
          disabled: this.isNew
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
    this.$root.$el.addEventListener('keydown', this.onKeydownActions)
  },

  beforeDestroy () {
    this.$root.$el.removeEventListener('keydown', this.onKeydownActions)
  },

  methods: {
    ...mapActions(['save', 'refresh', 'deleteInstance']),

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
        .select()

      if (!result || result.length < 1) {
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
        instanceID: result[0].ID,
        sender: this,
        target: $App.getViewport().centralPanel,
        tabId: 'ubm_form' + result[0].ID
      })
    },

    copyLink () {
      const input = document.createElement('input')
      input.value = this.linkToEntity
      input.style.position = 'absolute'
      input.style.top = '100%'
      input.style.left = '100%'
      document.body.append(input)
      input.select()
      if (document.execCommand('copy')) {
        document.body.removeChild(input)
        this.$notify({
          title: this.$ut('ssylka'),
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
            entity: this.$store.state.entity,
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
        cmdType: 'showList',
        isModalDialog: true,
        hideActions: ['addNew', 'addNewByCurrent', 'edit', 'del', 'newVersion'],
        cmdData: {
          params: [
            this.$UB.Repository('uba_auditTrail')
              .attrs(['actionTime', 'actionType', 'actionUser', 'remoteIP'])
              .where('[entity]', '=', this.entity)
              .where('[entityinfo_id]', '=', this.$store.state.data.ID)
              .orderByDesc('actionTime')
              .ubql()
          ]
        }
      })
    },

    onKeydownActions (e) {
      if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault()
        if (this.canRefresh) {
          this.refresh()
        }
      }

      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault()
        if (this.canSave) {
          this.save()
        }
      }

      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        if (this.canSave) {
          this.saveAndClose()
        }
      }

      if (e.key === 'Delete' && e.ctrlKey) {
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
.ub-toolbar{
  border-bottom: 1px solid rgba(var(--bg), 0.12);
  padding: 0.5em 1em;
  display: flex;
}

.ub-toolbar__flex-divider{
  margin-left: auto;
}

.ub-toolbar__date td{
  font-size: 10px;
  color: rgb(var(--info));
  text-align: right;
  padding-right: 5px;
}

.ub-toolbar__date{
  border-left: 1px solid rgba(var(--info), 0.1);
  padding-left: 10px;
  margin-left: 10px;
}
</style>

<docs>
### Usage
```vue
<template>
  <div class="ub-form-container">
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
  <div class="ub-form-container">
    <u-toolbar>
      <button slot="left">left side btn</button>
      <button slot="right">right side btn</button>
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
