<template>
  <div class="ub-form-container">
    <u-toolbar>
      <button
        slot="left"
        @click="showDialog"
      >
        Show dialog
      </button>
    </u-toolbar>

    <u-form-container>
      <el-row>
        <el-col :lg="8">
          <u-form-row
            required
            :label="getLabel('code')"
            :error="$v.code.$error"
          >
            <el-input
              v-model="code"
            />
          </u-form-row>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :lg="8">
          <u-form-row :label="getLabel('docDate')">
            <el-date-picker
              v-model="docDate"
              type="date"
            />
          </u-form-row>
        </el-col>

        <el-col :lg="8">
          <u-form-row :label="getLabel('incomeDate')">
            <el-date-picker
              v-model="incomeDate"
              type="date"
            />
          </u-form-row>
        </el-col>

        <el-col :lg="8">
          <u-form-row :label="getLabel('regDate')">
            <el-date-picker
              v-model="regDate"
              type="date"
            />
          </u-form-row>
        </el-col>
      </el-row>

      <u-form-row
        required
        :label="getLabel('category')"
        :error="$v.category.$error"
      >
        <u-select-entity
          v-model="category"
          :entity-name="getEntity('category')"
        />
      </u-form-row>

      <u-form-row
        required
        :label="getLabel('favorites')"
        :error="$v.favorites.$error"
      >
        <u-select-entity
          v-model="favorites"
          :entity-name="getEntity('favorites')"
        />
      </u-form-row>

      <u-form-row
        required
        :label="getLabel('favorites2')"
        :error="$v.favorites2.$error"
      >
        <u-select-entity
          v-model="favorites2"
          :entity-name="getEntity('favorites2')"
        />
      </u-form-row>

      <u-form-row :label="getLabel('description')">
        <el-input
          v-model="description"
          type="textarea"
          resize="none"
          rows="5"
        />
      </u-form-row>

      <u-form-row
        :label="getLabel('docDateTime')"
        :label-width="150"
      >
        <el-date-picker
          v-model="docDateTime"
          type="date"
        />
      </u-form-row>

      <u-form-row :label="getLabel('fileStoreSimple')">
        <u-upload-document
          v-model="fileStoreSimple"
          :entity-name="entity"
          file-store="fileStoreSimple"
          :doc-id="ID"
        />
      </u-form-row>

      <el-row :gutter="20">
        <el-col :lg="12">
          <u-form-row :label="getLabel('person')">
            <u-select-entity
              v-model="person"
              :entity-name="getEntity('person')"
            />
          </u-form-row>
        </el-col>
        <el-col :lg="12">
          <u-form-row :label="getLabel('employee')">
            <u-select-entity
              v-model="employee"
              :entity-name="getEntity('employee')"
            />
          </u-form-row>
        </el-col>
      </el-row>
    </u-form-container>
  </div>
</template>

<script>
const adminUiVue = require('@unitybase/adminui-vue')

module.exports.mount = function ({ title, entity, instanceID, formCode, rootComponent }) {
  adminUiVue.Form({
    component: rootComponent,
    entity,
    instanceID,
    title,
    formCode
  })
    .instance()
    .processing()
    .validation()
    .mount()
}

module.exports.default = {
  name: 'TstDocument',
  inject: ['$v', 'entitySchema', 'entity'],

  computed: {
    ...adminUiVue.mapInstanceFields([
      'ID',
      'code',
      'docDate',
      'incomeDate',
      'regDate',
      'category',
      'favorites',
      'favorites2',
      'docDateTime',
      'description',
      'fileStoreSimple',
      'person',
      'employee'
    ])
  },

  methods: {
    getLabel (attr) {
      return this.entitySchema.attributes[attr].caption
    },

    getEntity (attr) {
      return this.entitySchema.attributes[attr].associatedEntity
    },

    showDialog () {
      // line below is for testing purpose
      // better to use this.dialogInfo('uba_user') inside Vue instance
      return adminUiVue.dialogInfo('uba_user')
    }
  }
}
</script>
