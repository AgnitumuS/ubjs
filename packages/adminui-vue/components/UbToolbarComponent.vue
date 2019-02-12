<template>
  <div class="auto-form__header">
    <div style="display: flex">
      <el-button :disabled="!saveEnabled" type="text" size="large" class="auto-form__header__button"
                 @click="saveAndClose">
        <i class="fa fa-share-square-o"></i>
      </el-button>
      <el-button :disabled="!saveEnabled" type="text" size="large" class="auto-form__header__button"
                 @click="saveAndReload">
        <i class="fa fa-save"></i>
      </el-button>
      <el-button :disabled="!canDelete" type="text" size="large" class="auto-form__header__button" @click="remove">
        <i class="fa fa-trash-o"></i>
      </el-button>
    </div>
    <div style="display: flex">
      <el-popover
          placement="bottom-end"
          trigger="click">
        <el-table :data="actions" @row-click="onActionClick" :show-header="false">
          <el-table-column property="caption" width="200">
            <template slot-scope="scope">
              <div :style="scope.row.enabled === undefined || scope.row.enabled ? '' : 'opacity: 0.5'">
                <i :class="scope.row.icon"></i>
                <span style="margin-left: 10px">{{ scope.row.caption }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="text" slot="reference" size="large" class="auto-form__header__button">
          <i class="fa fa-cog" aria-hidden="true"></i>
        </el-button>
      </el-popover>
      <div class="auto-form__header__button__divider" v-if="isSimpleAudit"></div>
      <div class="auto-form__header__date__container" v-if="isSimpleAudit">
        <div class="auto-form__header__date">
          <b>{{createdEntityCaption}}:</b> {{ value.mi_createDate ? value.mi_createDate.toLocaleString() : '' }}
        </div>
        <div class="auto-form__header__date">
          <b>{{updatedEntityCaption}}:</b> {{ value.mi_modifyDate ? value.mi_modifyDate.toLocaleString() : '' }}
        </div>
      </div>
    </div>
    <input type="hidden" id="linkToEntity"
           :value="linkToEntity">
  </div>
</template>

<script>
  module.exports = {
    name: 'UbToolbarComponent',
    props: {
      entityName: String,
      value: Object
    },
    data () {
      return {
        canSave: this.entitySchema.haveAccessToAnyMethods([UB.core.UBCommand.methodName.INSERT, UB.core.UBCommand.methodName.UPDATE]),
      }
    },
    computed: {
      entitySchema () {
        return $App.domainInfo.get(this.entityName)
      },
      saveEnabled () {
        return this.canSave && (Object.keys(this.changedColumns).length > 0 || Object.keys(this.additionalData).length > 0)
      }
    }
  }
</script>