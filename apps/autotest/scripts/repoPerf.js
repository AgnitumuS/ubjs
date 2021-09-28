const CustomRepository = require('@unitybase/cs-shared').CustomRepository
const UBDomain = require('@unitybase/cs-shared').UBDomain
// const dml = require('@unitybase/dml-generator')
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

function getFieldExpression (attr, alias, tail) {
  // todo - depends on DB
  if (attr.dataType === UBDomain.ubDataTypes.Json) {
    return `JSON_VALUE([${alias}.${attr.dbExpression}],'$${tail}')`
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
 * @param {Map} aliases
 * @param {string} aliasLetter
 * @param {boolean} forFieldList is expression from fieldList - if such expression is not brecked - consider this is an attribute
 */
function parseExpression (entityFrom, expr, aliases, aliasLetter, forFieldList = false) {
  // рекурсивно парсить ? - см complexMap
}
/**
 * Transform attributes chain into aliased SQL expression a.b.c -> A1.cMapping.
 * Add missed aliases into aliases map.
 * @param {UBEntity} entityFrom
 * @param {string} attrExpr
 * @param {Map} aliases
 * @param {string} aliasLetter
 */
function parseComplexAttr (entityFrom, attrExpr, aliases, aliasLetter) {
  if (attrExpr.indexOf('.') === -1) { // simple attribute
    const attr = entityFrom.attributes[attrExpr]
    if (!attr) throw new Error(`UBQL: Unknown attribute ${entityFrom.name}.${attrExpr}`)
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
      if (!aliases.has(currentPath)) { // attribute not last in chain - create alias
        aliases.set(currentPath, { alias: `${aliasLetter}${++tableAliasCounter}`, attrFrom: attr, aliasFrom: aliases.get(prevPath).alias, entityTo: e })
      }
    } else if (attr.dataType === UBDomain.ubDataTypes.Json) { // stop on JSON - tail is JSON expression
      break
    } else if (attr.dataType === UBDomain.ubDataTypes.Enum) { // stop on enum
      break
    }
    i++
  }
  return getFieldExpression(attr, aliases.get(currentPath).alias, attrExpr.substring(currentPath.length))
}
/*
Table join tree
'' -> A0
'entityattr' -> A1
'entityattr.otherEntityAttr' -> A2
'entityattr2' -> A3
'parentID@org_department' for parentID.code@org_department
 */
function dummyBuilder (ubql, aliasLetter = 'A', isExternal = false) {
  const e = App.domainInfo.get(ubql.entity)
  /**
   * table aliases
   * @type {Map<string, {alias: string, attrFrom: UBEntityAttribute|null, aliasFrom: string, entityTo: UBEntity}>}}
   */
  const aliases = new Map()
  aliases.set('', {
    alias: aliasLetter,
    attrFrom: null,
    aliasFrom: aliasLetter,
    entityTo: e
  })

  // asterisk
  const fL = ubql.fieldList.length
  if (ubql.fieldList[0] === '*') {
    if (isExternal && (fL !== 1)) {
      throw new Error('UBQL: for client side UBQL mixing of "*" and attribute names in fieldList is not allowed')
    }
    if (fL === 1) { // add all attributes without checking for duplicates
      ubql.fieldList = Object.keys(e.attributes)
    } else {
      ubql.fieldList.shift() // remove *
      // as in native - add attributes to the end of passed tail
      const existed = new Set(ubql.fieldList)
      for (const attr in e.attributes) {
        if (!existed.has(attr)) ubql.fieldList.push(attr)
      }
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
      const [complexParts, complexFlags] = UBDomain.splitExpression(fi)
      // expression   = "[collegiateBodyID.name] || ' - №' || to_char([startTime], 'dd.mm.yyyy')"
      // complexParts = [ "", "[collegiateBodyID.name]", " || ' - №' || to_char(", "[startTime]", ", 'dd.mm.yyyy')" ]
      for (let p = 0, pL = complexParts; p < pL; p++) {
        if (complexFlags[p]) { // expression
          attrStr = complexParts[p]
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
  const a = aliases.get('')
  q += ' FROM ' + a.entityTo.dbSelectName + ' ' + a.alias
  aliases.forEach((a, key) => {
    if (key === '') return // empty string key is for root entity, already added above
    q += a.attrFrom.allowNull ? ' JOIN ' : ' LEFT JOIN ' // prefer short syntax. INNER JOIN === JOIN; LEFT OUTER JOIN === LEFT JOIN
    q += a.entityTo.dbSelectName + ' ' + a.alias
    q += ' ON ' + a.aliasFrom + '.' + a.attrFrom.dbExpression + ' = ' + a.alias + '.' +
      (a.attrFrom.associationAttr
        ? a.entityTo.attributes[a.attrFrom.associationAttr].dbExpression
        : a.entityTo.attributes['ID'].dbExpression)
  })
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
  .misc({ a: 1 }).ubql()
console.log(JSON.stringify(query))

console.log(dummyBuilder(query))
console.time('dummy')
for (let i = 0; i < ITER; i++) {
  const sql = dummyBuilder(query)
  res += sql.length
}
console.timeEnd('dummy')

const comlpexExprQ = new CustomRepository('tst_ubqlMaster').attrs('*').ubql()
// SELECT A01.C_ID,A01.C_CODE,A01.user,(length(A01.C_CODE) + length(A02.name) + length(C_CODE)) AS C1,(A02.name) AS C2,(length(A01.C_CODE) + length(A02.name) + length(C_CODE) + length(A01.C_CODE) + length(A02.name) + length(C_CODE) + 1) AS C3  FROM TST_IDMAPPING A01  LEFT JOIN uba_user A02 ON A02.ID=A01.user
console.log('comlpexExprQ:', dummyBuilder(comlpexExprQ))

// link to expression what uses only attributes
const complexExprLink = new CustomRepository('tst_ubqlDetail').attrs('master', 'detailCode', 'master.codeCalc').ubql()
// SELECT (length(A02.C_CODE) + length(A03.name) + length(C_CODE)) AS C1  FROM tst_ubqlDetail A01  LEFT JOIN TST_IDMAPPING A02 ON A02.C_ID=A01.master  LEFT JOIN uba_user A03 ON A03.ID=A02.user
console.log('complexExprLink:', dummyBuilder(complexExprLink))

// link to expression what uses attr mapped on expression - NOT supported in native
const complexExprLinkComplex = new CustomRepository('tst_ubqlDetail').attrs('master.complexMap').ubql()
console.log('complexExprLinkComplex:', dummyBuilder(complexExprLinkComplex))

// console.time('CustomRepository')
// for (let i = 0; i < 500000; i++) {
//   query = new CustomRepository('World').attrs(['ID', 'randomNumber']).orderBy('a').orderBy('b').where('ID', '=', rnd10000()).misc({a: 1}).ubql()
//   res += query.fieldList.length
// }
// console.timeEnd('CustomRepository')
console.log(res)
