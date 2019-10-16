<template>
  <el-table
    :data="items"
    height="100%"
    style="padding: 10px;"
  >
    <el-table-column
      v-for="col in columns"
      :key="col.code"
      :label="$ut(col.label)"
      :prop="col.code"
    >
      <template slot-scope="{row}">
        {{ formatData(row[col.code]) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'UGrid',
  props: {
    repository: Function
  },

  data () {
    return {
      items: []
    }
  },

  computed: {
    ubql () {
      return this.repository()
    },

    fieldList () {
      return this.ubql.fieldList
    },

    entityName () {
      return this.ubql.entityName
    },

    entityRequirements () {
      return this.fieldList.reduce((accum, field) => {
        let attr = this.getSchema(this.entityName).getEntityAttribute(field)
        if (attr && (attr.dataType === this.$UB.connection.domain.ubDataTypes.Entity) &&
          (!accum.includes(attr.associatedEntity))) {
          accum.push(attr)
        }
        return accum
      }, [])
    },

    columns () {
      return this.fieldList.map(fieldName => {
        const schema = this.getSchema(this.entityName)
        const { attribute } = schema.getEntityAttributeInfo(fieldName, 0)
        const { dataType, entity, code } = attribute

        return {
          code: fieldName,
          dataType,
          label: entity.code + '.' + code
        }
      })
    },

    pageSize () {
      return this.$UB.connection.appConfig.storeDefaultPageSize
    }
  },

  created () {
    this.fetchItems()
  },

  methods: {
    async fetchItems () {
      const items = await this.ubql
        .limit(20)
        .select()

      for (const attribute of this.entityRequirements) {
        const { associatedEntity } = attribute
        const { descriptionAttribute } = this.getSchema(associatedEntity)
        const store = Ext.create('UB.ux.data.UBStore', {
          ubRequest: {
            entity: associatedEntity,
            method: 'select',
            fieldList: [...new Set(['ID', descriptionAttribute])]
          },
          autoLoad: true,
          pageSize: this.pageSize,
          autoDestroy: true
        })
        store.on('load', (store, records, success) => {
          if (success && records && records.length > 1000) {
            this.$UB.logError('Too large look up field for entity "', store.lookUpField,
              '". Look up entity', store.ubRequest.entity, 'Record count =', records.length)
          }
          items.forEach(i => {
            if (i[attribute.code]) {
              const record = store.getById(i[attribute.code])
              if (record) {
                i[attribute.code] = record.data[descriptionAttribute]
              }
            }
          })
        }, store, { single: true })
      }

      this.items.splice(0, this.items.length, ...items)
    },

    getAttr (code, entity) {
      if (!entity) {
        entity = this.entityName
      }
      return this.getSchema(entity).attributes[code]
    },

    getSchema (entityName) {
      return this.$UB.connection.domain.get(entityName)
    },

    formatData (data) {
      if (data instanceof Date) {
        return this.$moment(data).format('l')
      } else {
        return data
      }
    }
  }
}
</script>
