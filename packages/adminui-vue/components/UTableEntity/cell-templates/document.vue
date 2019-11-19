<template>
  <el-link
    v-if="value"
    type="primary"
    icon="el-icon-download"
    @click="download"
  >
    {{ fileName }}
  </el-link>
</template>

<script>
export default {
  props: ['value', 'row', 'column'],

  computed: {
    document () {
      return JSON.parse(this.value)
    },

    fileName () {
      return this.document.fName
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
