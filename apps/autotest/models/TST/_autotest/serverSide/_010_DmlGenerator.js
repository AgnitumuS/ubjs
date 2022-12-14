/*
- field list
  - simple attribute
    - String
      - isMultiLang
    - Int
    - BigInt
    - Float
    - Currency
    - Boolean
    - DateTime
    - Text
    - ID
    - Entity
      - associatedEntity
      - associationAttr
    - Document
      - storeName
    - Many
      - associationManyData
    - Enum
      - enumGroup
    - BLOB
    - Date
    - TimeLog
 - expression
  - simple
  - complex
- whiere List
   'custom': WhereItemCustom,
   'equal': WhereItemEqual,
   'notequal': WhereItemEqual,
   'more': WhereItemCompare,
   'moreequal': WhereItemCompare,
   'less': WhereItemCompare,
   'lesslqual': WhereItemCompare,
   'between': WhereItemBetween,
   'in': WhereItemIn,
   'notin': WhereItemIn,
   'subquery': WhereItemSubQuery,
   'isnull': WhereItemNull,
   'notisnull': WhereItemNull,
   'like': WhereItemLike,
   'notlike': WhereItemLike,
   'startwith': WhereItemLike,
   'notstartwith': WhereItemLike,
   'match': WhereItemMatch
- join as
- order by
- group by
- other
  - macros
  - 1:1 attr
  - link
- als
- els
 */
(function () {
  try {
    const generator = require('@unitybase/dml-generator')
    const sql = generator.mssql.biuldSelectSql('tst_maindata', {
      fieldList: ['parent1@tst_maindata.manyValue.mi_modifyUser.name'],
      whereList: {
        c1: {
          expression: 'parent1@tst_maindata.manyValue.mi_modifyUser.name', condition: 'equal', values: {c1: 'admin'}
        }
      }
    })
    console.log(sql)
    // server - side test MUST return a result in form {res: true|false}
    return {res: true}
  } catch (e) {
    return e.toString()
  }
})()
