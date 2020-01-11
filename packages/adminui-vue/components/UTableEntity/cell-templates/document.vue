<template>
  <div
    v-if="value"
    class="u-table-entity__document-col"
  >
    <span>{{ fileName }}</span>
    <el-button
      type="primary"
      icon="el-icon-download"
      circle
      plain
      class="u-table-entity__document-button"
      @click="download"
    />
  </div>
</template>

<script>
export default {
  props: ['value', 'row', 'column'],

  computed: {
    document () {
      return JSON.parse(this.value)
    },

    fileName () {
      return this.document.origName || this.document.fName
    }
  },

  methods: {
    async download () {
      const params = await this.getRecordParams()
      const file = await this.$UB.connection.getDocument(params, { resultIsBinary: true })
      window.saveAs(new Blob([file]), this.fileName)
    },

    async getRecordParams () {
      const attribute = this.column.attribute.code
      const attributePath = this.column.id.split('.')
      const isMasterAttr = attributePath.length === 1
      let id

      if (isMasterAttr) {
        id = this.row.ID
      } else {
        const identifierAttribute = attributePath.slice(0, attributePath - 1).join('.')
        const response = await this.$UB.Repository(this.entity)
          .attrs(identifierAttribute)
          .selectById(this.row.ID)
        id = response[identifierAttribute]
      }

      return {
        entity: this.column.attribute.entity.code,
        attribute,
        id
      }
    }
  }
}
</script>

<style>
  .u-table-entity__document-col {
    display: flex;
    align-items: center;
  }

  .u-table-entity__document-col span {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .u-table-entity__document-button {
    margin-left: 10px;
  }
</style>
