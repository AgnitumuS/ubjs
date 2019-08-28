<template>
  <el-table :data="tableData">
    <el-table-column
      v-for="column in columns"
      :key="column.code"
      :prop="column.code"
      :label="column[descriptionAttribute]"
    >
      <template slot-scope="{row, $index}">
        <u-select-entity
          v-if="column.dataType === 'Entity'"
          :entity-name="entitySchema.attributes[column.code].associatedEntity"
          :value="row[column.code]"
          @input="SET_DATA({
            collection: collectionName,
            index: $index,
            key: column.code,
            value: $event
          })"
        />
        <el-checkbox
          v-else-if="column.dataType === 'Boolean'"
          :value="row[column.code]"
          @input="SET_DATA({
            collection: collectionName,
            index: $index,
            key: column.code,
            value: $event
          })"
        />
        <el-date-picker
          v-else-if="(column.dataType === 'Date') || (column.dataType === 'DateTime')"
          :value="row[column.code]"
          :type="column.dataType.toLowerCase()"
          :placeholder="$ut(column.dataType === 'Date' ? 'selectDate' : 'selectDateAndTime')"
          @input="SET_DATA({
            collection: collectionName,
            index: $index,
            key: column.code,
            value: $event
          })"
        />
        <u-select-enum
          v-else-if="column.dataType === 'Enum'"
          :value="row[column.code]"
          :e-group="entitySchema.attributes[column.code].enumGroup"
          @input="SET_DATA({
            collection: collectionName,
            index: $index,
            key: column.code,
            value: $event
          })"
        />
        <u-select-many
          v-else-if="column.dataType === 'Many'"
          :entity-name="column.associatedEntity"
          :value="row[column.code]"
          @input="SET_DATA({
            collection: collectionName,
            index: $index,
            key: column.code,
            value: $event
          })"
        />
        <el-input
          v-else-if="column.dataType === 'Text'"
          type="textarea"
          :value="row[column.code]"
          :autosize="{ minRows: 3, maxRows: 4 }"
          @input="SET_DATA({
            collection: collectionName,
            index: $index,
            key: column.code,
            value: $event
          })"
        />
        <u-base-input
          v-else
          :value="row[column.code]"
          @input="SET_DATA({
            collection: collectionName,
            index: $index,
            key: column.code,
            value: $event
          })"
        />
      </template>
    </el-table-column>
    <el-table-column
      fixed="right"
      width="140"
    >
      <el-button
        slot="header"
        size="mini"
        icon="el-icon-plus"
        type="primary"
        @click="$refs.dialog.show()"
      >
        Add record
      </el-button>

      <add-record-dialog
        ref="dialog"
        :collection-name="collectionName"
      />

      <template slot-scope="{$index}">
        <el-button
          size="mini"
          type="danger"
          icon="el-icon-delete"
          class="detail-grid__delete-btn"
          plain
          @click="DELETE_COLLECTION_ITEM({
            collection: collectionName,
            index: $index
          })"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
const AddRecordDialog = require('./AddRecordDialog.vue').default
const { mapMutations } = require('vuex')

/**
 * Shows collection data as table view
 */
export default {
  name: 'UDetailGrid',

  components: { AddRecordDialog },

  inject: {
    masterEntityName: 'entity'
  },

  props: {
    /**
     * Name of key what you set in collectionRequests object
     */
    collectionName: {
      type: String,
      required: true
    },
    /**
     * Array of attributes codes for override automatically generated fieldList
     */
    fieldList: Array
  },

  computed: {
    collectionData () {
      return this.$store.state.collections[this.collectionName]
    },

    entityName () {
      return this.collectionData.entity
    },

    entitySchema () {
      return this.$UB.connection.domain.get(this.entityName)
    },

    descriptionAttribute () {
      return this.entitySchema.descriptionAttribute
    },

    tableData () {
      return this.collectionData.items.map(i => i.data)
    },

    columns () {
      if (this.fieldList) {
        return this.fieldList
          .map(attrName => this.entitySchema.attributes[attrName])
      }
      return this.entitySchema
        .filterAttribute(attr =>
          attr.defaultView &&
          attr.associatedEntity !== this.masterEntityName
        )
    }
  },

  methods: mapMutations(['SET_DATA', 'DELETE_COLLECTION_ITEM'])
}
</script>

<style>
.detail-grid__delete-btn{
  opacity: 0;
  transition: .15s;
}

.el-table__row.hover-row .detail-grid__delete-btn{
  opacity: 1;
}
</style>
