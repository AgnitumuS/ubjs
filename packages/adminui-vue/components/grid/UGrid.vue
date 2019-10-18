<template>
  <el-table
    :data="items"
    height="100%"
    class="u-grid-panel__table"
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
/**
 * example hard shortcut cfg
 *
 * const test = {
    'cmdType': 'showList',
    'cmdData': {
      'params': [{
        'entity': 'doc_incdoc',
        'method': 'select',
        'fieldList': ['favorites.code', 'caption', {
          'name': 'docKindID.name',
          'description': 'Document kind'
        }, 'docThemeID', 'regNumber', 'regDate', {
          'name': 'mi_tr_shortText',
          'description': 'Short content'
        }, 'outNumber', 'outDate', {
          'name': 'correspID.name',
          'description': 'Correspondent'
        }, {
          'name': 'correspSignerID.shortFIO',
          'description': 'Signer'
        }, 'executionTerm', 'executionDate', {
          'name': 'respExecutorID.caption',
          'description': 'Resp. executor'
        }, 'mi_wfState', {'name': 'createdID.caption', 'description': 'Created'}, {
          'name': 'mi_createDate',
          'visibility': true,
          'description': 'Created date'
        }, {'name': 'regCounterValue'}, {
          'name': 'docJournalVolumeID.journalID.name',
          'description': 'Journal'
        }, {'name': 'ID', 'visibility': false}],
        'whereList': {
          'byRegDateMoreEqual': {
            'expression': '[regDate]',
            'condition': 'moreEqual',
            'values': {'regDate': '2019-10-16T21:00:00.000Z'}
          }
        }
      }]
    },
    'cmpInitConfig': {},
    'description': 'Inc: Today',
    'hideActions': ['addNewByCurrent', 'showDetail']
    }

 const test2 = {
  "cmdType": "showList",
  "cmdData": {
    "params": [
      {
        "entity": "docreport_report",
        "method": "select",
        "whereList": {
          "isNotReady": {
            "expression": "executionDate",
            "condition": "isNull"
          }
        },
        "fieldList": [
          "reportName",
          "mi_createDate",
          "description",
          "mi_owner.name",
          "executionTerm",
          "executionDate",
          "executionResult"
        ],
        "orderList": {
          "byCreateDateDesc": {
            "expression": "mi_createDate",
            "order": "desc"
          }
        }
      }
    ]
  },
  "cmpInitConfig": {
    "toolbarActionList": [
      "refresh"
    ]
  },
  "customActions": [
    {
      "actionText": "Add",
      "glyph": 61525,
      "text": "Add",
      "disabled": false,
      "showText": false,
      "menu": [
        {
          "text": "Typical",
          "iconCls": "fa fa-list",
          "align": "right",
          "ubID": "typical"
        },
        {
          "text": "Statistical",
          "iconCls": "fa fa-bar-chart",
          "align": "right",
          "ubID": "static"
        }
      ]
    },
    {
      "actionText": "Show",
      "iconCls": "fa fa-search",
      "text": "Show",
      "disabled": false,
      "showText": true
    }
  ],
  "hideActions": [
    "addNewByCurrent",
    "showPreview",
    "addNew"
  ],
  "description": "On building"
}
 */

export default {
  name: 'UGrid',
  props: {
    repository: {
      type: Function,
      required: true
    },
    customColumns: {
      type: Array,
      default: () => []
    }
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
        const field = schema.getEntityAttributeInfo(fieldName, 0)
        const customColumn = this.customColumns.find(c => c.name === fieldName)

        if (customColumn) {
          return customColumn
        } else if (field) {
          const { dataType, entity, code } = field.attribute || field.parentAttribute

          return {
            code: fieldName,
            dataType,
            label: fieldName === 'ID' ? 'ID' : entity.code + '.' + code
          }
        } else {
          return {
            code: fieldName,
            label: fieldName
          }
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

<style>
.u-grid-panel__table{
  padding: 10px;

}

.u-grid-panel__table th > .cell {
  word-break: normal;
}
</style>
