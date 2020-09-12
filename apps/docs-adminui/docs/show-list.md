# Basic usage

```json
{
  "renderer": "vue",
  "cmdType": "showList",
  "cmdData": {
    "repository": {
      "entity": "ubm_enum",
      "fieldList": ["eGroup", "sortOrder", "code", "shortName", "name"],
      "orderList": {
        "eGroup": { "expression": "eGroup", "order": "asc" },
        "sortOrder": { "expression": "sortOrder", "order": "asc" }
      }
    },
    "columns": ["eGroup", {
      "id": "code",
      "width": 120,
      "format": "return value * 2"
    }]
  }
}
```
### renderer
 Optional param to change renderer type - ext || vue

### cmdData.repository
Common `ubql`

### cmdData.columns
array<object|string> of display columns.
If `columns` is unset, will automatically computed from fieldList.

### cmdData.columns[].format
`format` can be as function or string.
In case format function passed as string it will call by `new Function` class.
`format` has next params: `value`, `column`, `row`

### cmdData.entityName
In case passed `entityName` then colmuns and fieldList will compute automatically

```json
{
  "cmdType": "showList",
  "cmdData": {
    "entityName": "ubm_enum"
  }
}
```

### cmdData.entityName + cmdData.columns
FieldList will compute automatically, but columns manually

```json
{
  "cmdType": "showList",
  "cmdData": {
    "entityName": "ubm_enum",
    "columns": ["eGroup", "code"]
  }
}
```

# Provide custom slots to showList
```javascript
{
  "cmdType": "showList",
  "cmdData": {
    "entityName": "ubm_enum",
    "columns": ["eGroup", "code"]
  },
  scopedSlots: createElement => ({
    toolbarAppend: (slotScope) => createElement('button', 'click me'),
    eGroup: ({ row }) => createElement(
      'u-button', 
      {
        props: {
          icon: 'u-icon-send'
        }
      },
      row.ID + row.eGroup 
    )    
  })
}
```
