const CustomRepository = require('@unitybase/cs-shared').CustomRepository
const UBDomain = require('@unitybase/cs-shared').UBDomain
const dml = require('@unitybase/dml-generator')
const cmdLineOpt = require('@unitybase/base').options
const argv = require('@unitybase/base').argv

function rnd10000 () {
  return Math.round(Math.random() * 10000) + 1
}

const opts = cmdLineOpt.describe('', 'FTS test')
  .add(argv.establishConnectionFromCmdLineAttributes._cmdLineParams)
const options = opts.parseVerbose({}, true)

const session = argv.establishConnectionFromCmdLineAttributes(options)
const conn = session.connection

global.App = {
  domainInfo: conn.getDomainInfo(true)
}

// /(\[[^\]]*])/g
// "[collegiateBodyID.name] || ' - №' || (select count(sbm.ID) + 1 from bee_meeting sbm where sbm.collegiateBodyID = [collegiateBodyID] and sbm.startTime < [startTime] and mi_deleteDate >= to_date('31.12.9999', 'dd.mm.yyyy')) || ' - ' || to_char([startTime], 'dd.mm.yyyy') || ':'"
const EXPR_SPLIT = /(\[[^\]]*])/g
function parseExpression(e) {
  const parts = e.split(EXPR_SPLIT)
}

function getFieldExpression (attr, alias, tail) {
  // todo - depends on DB
  if (attr.dataType === UBDomain.ubDataTypes.Json) {
    return `JSON_VALUE([${alias}.${attr.name}],'$${tail}')`
  } else if (attr.dataType === UBDomain.ubDataTypes.Enum) {
    return `${alias}.${tail}`
  } else if (attr.dataType === UBDomain.ubDataTypes.Many) {
    // based on AssociationManyDataEntity
    return `stuff((${tail} for xml path(''')), 1, 1, ''')`
  } else {
    // TODO - parse expression in case attr.mapping.expressionType === 'Expression'
    return `${alias}.${attr.mapping ? attr.mapping.expression : tail}`
  }
}

/**
 * Transform UBQL expression into SQL expression [a.b] + 1 -> A1.b + 1
 * Add missed aliases into aliases map.
 * @param {UBEntity} entityFrom
 * @param {string} expr
 * @param {Object} aliases
 * @param {string} aliasLetter
 * @param {boolean} forFieldList is expression from fieldList - if such expression is not brecked - consider this is an attribute
 */
function parseExpression(entityFrom, expr, aliases, aliasLetter, forFieldList=false) {
  рекурсивно парсить ? - см complexMap
}
/**
 * Transform attributes chain into aliased SQL expression a.b.c -> A1.cMapping.
 * Add missed aliases into aliases map.
 * @param {UBEntity} entityFrom
 * @param {string} attrExpr
 * @param {Object} aliases
 * @param {string} aliasLetter
 */
function parseComplexAttr (entityFrom, attrExpr, aliases, aliasLetter) {
  if (attrExpr.indexOf('.') === -1) { // simple attribute
    return getFieldExpression(entityFrom.attributes[attrExpr], aliasLetter, attrExpr)
  }
  const aPath = attrExpr.split('.')
  let tableAliasCounter = 0
  let e = entityFrom
  let currentPath = ''
  let i = 0
  const L = aPath.length
  let attr
  while (i < L - 1) { // last part is a tail
    attr = e.attributes[aPath[i]]
    if (attr.dataType === UBDomain.ubDataTypes.Entity) {
      e = attr.getAssociatedEntity()
      const prevPath = currentPath
      currentPath = (currentPath ? `${currentPath}${aPath[i]}` : aPath[i]) + '.'
      if (!aliases[currentPath] && (i < L - 1)) { // attribute not last in chain - create alias
        aliases[currentPath] = { alias: `${aliasLetter}${++tableAliasCounter}`, attrFrom: attr, aliasFrom: aliases[prevPath].alias, entityTo: e }
      }
    } else if (attr.dataType === UBDomain.ubDataTypes.Json) { // stop on JSON - tail is JSON expression
      break
    } else if (attr.dataType === UBDomain.ubDataTypes.Enum) { // stop on enum
      break
    }
    i++
  }
  return getFieldExpression(attr, aliases[currentPath].alias, attrExpr.substring(currentPath.length))
}
/*
Table join tree
'' -> A0
'entityattr' -> A1
'entityattr.otherEntityAttr' -> A2
'entityattr2' -> A3
'parentID@org_department' for parentID.code@org_department
 */
function dummyBuilder (ubql, aliasLetter = 'A') {
  const e = App.domainInfo.get(ubql.entity)
  /**
   * table aliases
   * @type {Object<string, {alias: string, attrFrom: UBEntityAttribute|null, aliasFrom: string, entityTo: UBEntity}>}}
   */
  const aliases = {
    '': {
      alias: aliasLetter,
      attrFrom: null,
      aliasFrom: aliasLetter,
      entityTo: e
    }
  }
  let q = 'SELECT '
  const fieldsParts = []
  // SELECT cause
  for (let i = 0, L = ubql.fieldList.length; i < L; i++) {
    const fi = ubql.fieldList[i]

    const openBrIdx = fi.indexOf('[')
    let attrStr
    if (openBrIdx === -1) { // "attr1" - only attribute name, most common case for field list
      attrStr = fi
      fieldsParts.push(parseComplexAttr(e, attrStr, aliases, aliasLetter))
    } else if ((openBrIdx === 0) && (fi.charAt(fi.length - 1) === ']')) { // "[attr1]" - attribute wrapped in brackets
      attrStr = fi.slice(1, -1)
      fieldsParts.push(parseComplexAttr(e, attrStr, aliases, aliasLetter))
    } else { // complex expression like 1) SUM([rnd] + 1); 2) [attr1] + [attr2] etc.
      const complexParts = fi.split(EXPR_SPLIT)
      // expression   = "[collegiateBodyID.name] || ' - №' || to_char([startTime], 'dd.mm.yyyy')"
      // complexParts = [ "", "[collegiateBodyID.name]", " || ' - №' || to_char(", "[startTime]", ", 'dd.mm.yyyy')" ]
      for (let p = 0, pL = complexParts; p < pL; p++) {
        if (complexParts[p].charCodeAt(0) === '[') { // expression
          attrStr = fi.slice(1, -1)
          complexParts[p] = parseComplexAttr(e, attrStr, aliases, aliasLetter)
        }
      }
      fieldsParts.push(complexParts.join(''))
    }
  }
  if (fieldsParts.length) {
    q += fieldsParts.join(', ')
  }

  // FROM cause
  // TODO - joinCondition (move `from` after `where`)
  let a = aliases['']
  q += ' FROM ' + a.entityTo.dbSelectName + ' ' + a.alias
  for (const key in aliases) { // Object.entries is slow
    if (key === '') continue // empty string key is for root entity, already added above
    a = aliases[key]
    q += a.attrFrom.allowNull ? ' JOIN ' : ' LEFT JOIN ' // prefer short syntax. INNER JOIN === JOIN; LEFT OUTER JOIN === LEFT JOIN
    q += a.entityTo.dbSelectName + ' ' + a.alias
    q += ' ON ' + a.aliasFrom + '.' + a.attrFrom.name + ' = ' + a.alias + '.ID' // TODO attrFrom.associationAttr ? a.entityTo.attributes.associationAttr.
  }

  const whereParts = []
  const params = []
  for (const key in ubql.whereList) {
    const wi = ubql.whereList[key]
    whereParts.push(`((${wi.expression}) ${wi.condition} ?)`)
    params.push(wi.value)
  }
  if (whereParts.length) {
    q += ' where ' + whereParts.join(' AND ')
  }
  const orderParts = []
  for (const key in ubql.orderList) {
    const oi = ubql.orderList[key]
    orderParts.push(`${oi.expression}${oi.order === 'desc' ? ' desc' : ''}`)
  }
  if (orderParts.length) {
    q += ' order by ' + orderParts.join(', ')
  }
  return q
}

// console.time('dml')
// for (let i = 0; i < 10000; i++) {
//   const { sql, params } = dml.mssql.biuldSelectSql('World', query)
//   res += sql.length
// }
// console.timeEnd('dml')

const e = App.domainInfo.get('tst_IDMapping')
console.log(e)
console.log(e.attributes.rnd.mapping)

const ITER = 10000
let res = 0
const query = new CustomRepository('tst_IDMapping')
  .attrs(['ID', 'rnd', 'user.name', 'userName', 'complexMap'])
  .where('ID', '=', rnd10000())
  .where('userName', 'startsWith', 'a')
  .orderBy('rnd').orderBy('ID')
  .misc({a: 1}).ubql()
console.log(JSON.stringify(query))

console.log(dummyBuilder(query))
console.time('dummy')
for (let i = 0; i < ITER; i++) {
  debugger
  const sql = dummyBuilder(query)
  res += sql.length
}
console.timeEnd('dummy')

// console.time('CustomRepository')
// for (let i = 0; i < 500000; i++) {
//   query = new CustomRepository('World').attrs(['ID', 'randomNumber']).orderBy('a').orderBy('b').where('ID', '=', rnd10000()).misc({a: 1}).ubql()
//   res += query.fieldList.length
// }
// console.timeEnd('CustomRepository')
console.log(res)
