# Базовый пример

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
 Опциональный параметр, позволяет изменить отображение грида ext || vue

### cmdData.repository
обычный ubql

### cmdData.columns
Массив<объектов или строк> отображаемых колонок.
Если columns не передан, будет автоматически вычеслен из fieldList.

### cmdData.columns[].format
Форматирование может быть функцией или строкой,
если передан строкой то такая строка будет вызвана оператором `new Function`.
Туда будут переданы такие параметры `value`, `column`, `row`

# Параметр entityName
В этом случае colmuns и fieldList будут вычеслены автоматически

```json
{
  "cmdType": "showList",
  "cmdData": {
    "entityName": "ubm_enum"
  }
}
```

# entityName + columns
В этом случае fieldList вычеслен автоматически, а колонки вручную

```json
{
  "cmdType": "showList",
  "cmdData": {
    "entityName": "ubm_enum",
    "columns": ["eGroup", "code"]
  }
}
```
