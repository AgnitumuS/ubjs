<template>
  <div class="u-form-layout">
    <u-toolbar />

    <u-form-container
      v-loading="loading"
      label-position="top"
    >
      <u-form-row
        label="UAclRlsInput.dialog.entity"
        class="u-acl-rls-input-overflow"
      >
        <el-select
          v-model="selectedEntity"
          class="u-select"
        >
          <el-option
            v-for="{ associatedEntity } in aclAttributes"
            :key="associatedEntity"
            :value="associatedEntity"
            :label="$ut(associatedEntity)"
          />
        </el-select>
      </u-form-row>

      <template v-if="selectedEntity">
        <u-form-row
          v-if="mappedEntititesBySelectedEntity.length === 0"
          :label="selectedEntity"
          class="u-acl-rls-input-overflow"
        >
          <u-select-multiple
            v-model="dialog.entriesToAdd[dialog.selectedEntity]"
            :repository="getRepoForSelectionByEntity(dialog.selectedEntity)"
            clearable
          />
        </u-form-row>
      </template>
    </u-form-container>
  </div>
</template>

<script>
const { Form } = require('@unitybase/adminui-vue')
const { mapGetters } = require('vuex')

module.exports.mount = cfg => {
  Form(cfg)
    .processing()
    .validation()
    .mount()
}

export default {
  name: 'AclRlsEntry',

  props: {
    aclAttributes: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      selectedEntity: null
    }
  },

  computed: {
    ...mapGetters(['loading']),

    mappedEntities () {
      return Object.fromEntries(
        this.aclAttributes.flatMap(attrDef => {
          return [
            attrDef.associatedEnity,
            this.$UB.connection.domain.filterEntities(entityDef => {
              return entityDef.mixin('unity')?.entity === attrDef.associatedEnity
            })
          ]
        })
      )
    },

    mappedEntititesBySelectedEntity () {
      return this.mappedEntities[this.selectedEntity]
    }
  }
}
</script>
