/**
 * Created by v.orel on 11.01.2017.
 */
const parserUtils = require('./parserUtils')
const ubSFNAllFields = '*'
const ubMixinUnity = 'unity'
const ubSelfDSValue = '{self}'
const reUbSelfDSValue = new RegExp(ubSelfDSValue, 'g')

class DSBldData {
  constructor (entity) {
    this.visible = true
    this.ownerEntityName = entity.name
    this.proposedSelectShortName = entity.sqlAlias

    const mapping = entity.mapping
    if (mapping && mapping.selectName) {
      this.selectName = mapping.selectName
      this.execName = mapping.execName
    } else {
      this.selectName = entity.name
      this.execName = entity.name
    }
  }
}
class FieldBldData {
  constructor ({attribute, entity, fullExpr, existLangPointer, langPrefix, langPointerExpr, manyAttrExprCollapsed}) {
    this.attrExpression = attribute.dataType !== 'Many' ? `${entity.name}.${attribute.name}` : `${entity.name}.${fullExpr}`
    this.attrAllowNull = attribute.allowNull
    this.attrDataType = attribute.dataType
    this.mapped = false
    this.customOwnerLevelSuffix = ''

    if (attribute.dataType !== 'Many') {
      this.attrSQLExprType = 'field'
      if (!attribute.isMultiLang || (attribute.isMultiLang && existLangPointer)) {
        if (existLangPointer) {
          if (langPrefix === App.defaultLang) {
            this.attrSQLExpression = attribute.name
          } else {
            this.attrSQLExpression = langPointerExpr
          }
        } else {
          this.attrSQLExpression = attribute.name
        }
      } else {
        if (langPrefix === App.defaultLang) {
          this.attrSQLExpression = attribute.name
        } else {
          this.attrSQLExpression = `${attribute.name}_${langPrefix}`
        }
      }
      const mapping = attribute.mapping
      if (mapping && mapping.expression) {
        this.mapped = true
        this.attrSQLExprType = mapping.expressionType
        if (!attribute.isMultiLang || (attribute.isMultiLang && existLangPointer)) {
          this.attrSQLExpression = mapping.expression
        } else {
          if (langPrefix === App.defaultLang) {
            this.attrSQLExpression = mapping.expression
          } else {
            this.attrSQLExpression = `${mapping.expression}_${langPrefix}`
          }
        }
      }
    } else {
      this.attrSQLExprType = this.builder.getManyExpressionType
      this.attrSQLExpression = this.builder.getManyExpression()// todo
      if (!manyAttrExprCollapsed) {
        this.customOwnerLevelSuffix = 'nc'
      }
    }
  }
}
class ExprBldData {
  /**
   * todo
   * @param {FieldBldData} fieldData
   * @param bldParams
   */
  constructor (fieldData, bldParams) {
    this.attrExpression = fieldData.attrExpression
    this.expressionType = fieldData.expressionType
    this.allowNull = fieldData.allowNull
    this.level = bldParams.level
    this.lang = bldParams.lang
  }
}

class Expression {
  constructor (builder) {
    this.builder = builder
  }
}
class AllFieldsExpression extends Expression {
  constructor (builder) {
    super(builder)
    this.fieldName = ''
  }
  get expression () {
    return ubSFNAllFields
  }
}
class SimpleExpression extends Expression {
  constructor (builder, expression, lang) {
    super(builder)
    this.attrEntityName = ''
    this.attributeName = ''
    this.isMultiLang = false
    this.lang = lang
    this.existLangPointer = false
    this.expression = expression
    this.nonPrefixExpression = expression
    this.dataType = 'unknown'
    // todo fPreparedExpression.SetExpressionType(sqletExpression, aExpressionList);
  }
}
class ExpressionList {
  /**
   * List of expressions for builder
   * @param {CustomSQLBuilder} builder
   */
  constructor (builder) {
    this.items = {}
    this.builder = builder
  }
  add (originalExpression, expressionList, attrExpression, lang, entity, level, manyAttrExprCollapsed, whereItem, parentJoin) {
    let expression
    if (originalExpression === ubSFNAllFields) {
      expression = new AllFieldsExpression(this.builder)
    } else {
      if (entity.connectionName !== this.builder.entity.connectionName) {
        // todo EMetabaseException
        throw new Error(`Connection for entity "${entity.name}" must be identical to context entity "${this.builder.entity.name}"`)
      }
      let storedOriginalExpression = originalExpression
      let {expression: inExpression, props: exprProps} = parserUtils.bracketExpr(attrExpression)

      if (exprProps.existOpenBracket && !exprProps.existCloseBracket) {
        throw new Error(`Error in expression "${attrExpression}": "]" expected but "[" found`)
      } else if (!exprProps.existOpenBracket && exprProps.existCloseBracket) {
        throw new Error(`Error in expression "${attrExpression}": "[" expected but "]" found`)
      }

      // todo EntityList.AddEntity(entity); ??? for caching

      // if this is Attribute expression
      if (!exprProps.existNativeSQL) {
        const exprList = parserUtils.splitBracketExpressions(inExpression, false)
        if (exprList.length === 0) {
          // there is no open and close brackets so left all as is
          expression = new SimpleExpression(this.builder, inExpression, lang)
        } else {
          for (let expr of exprList) {
            exprProps = parserUtils.extractExpressionProps(expr, {})
            let partExpr = parserUtils.expressionFirstWord(expr)
            let exprLinkProps = parserUtils.extractOneExprLink(partExpr)
            partExpr = exprLinkProps.expression
            // before registration of link-attribute we must register ID of parent entity, but only for root level
            if (exprLinkProps.existLink && (level === parserUtils.rootLevel)) {
              // expression = new SimpleExpression(this.builder, inExpression, lang)
              this._registerSimpleExpression({
                simpleExpr: parserUtils.ubID,
                fullExpr: parserUtils.ubID,
                exprProps: {},
                exprLinkProps: {existLink: false},
                entity,
                manyAttrExprCollapsed,
                level
              })
            }
            const {
              bldDSItem: outBldDSItem,
              bldExprItem: outBldExprItem,
              attribute: attrItem
              } = this._registerSimpleExpression({
                simpleExpr: partExpr,
                fullExpr: expr,
                exprProps,
                exprLinkProps,
                entity,
                manyAttrExprCollapsed,
                level
              })
            // todo may be move to unity mixin
            // if exists lint to other table by UNITY then create JOIN here
            // but only for root level because for not-root level link already exists
            if (exprLinkProps.existLink && (level === parserUtils.rootLevel)) {
              const associatedEntity = App.domain.get(exprLinkProps.essLink)
              if (!associatedEntity) {
                // todo EMetabaseException
                throw new Error(`Association entity in attribute "${expr}" of object "${exprLinkProps.essLink}" is empty`)
              }
              if (this.builder.isExternalCall) {
                if (!App.els(associatedEntity.name, this.builder.method)) {
                  // todo EMetabaseException
                  throw new Error(`ELS - access deny for user "${Session.uData.login}" method "${associatedEntity.name}.${this.builder.method}"`)
                }
              }
              // todo EntityList.AddEntity(fAssociatedEntityRef) ??? for caching
              const {
                bldDSItem: joinToDSItem,
                bldExprItem: joinToExprItem
                } = this._registerSimpleExpression({
                  simpleExpr: parserUtils.ubID,
                  fullExpr: parserUtils.ubID,
                  exprProps: {},
                  exprLinkProps,
                  entity,
                  manyAttrExprCollapsed,
                  level
                })
              const addedJoin = outBldDSItem.joinList.add({
                exprItem: outBldExprItem,
                joinToExprItem,
                joinToDSItem,
                associatedEntity,
                whereItem,
                isLastJoin: true
              })
              if (parentJoin) {
                if (parentJoin.joinType === 'LEFT') {
                  addedJoin.joinType = 'LEFT'
                } else {
                  if (exprLinkProps.existLink) {
                    addedJoin.joinType = 'LEFT'
                  } else {
                    addedJoin.establishJoinType()
                  }
                }
              } else {
                if (exprLinkProps.existLink) {
                  addedJoin.joinType = 'LEFT'
                } else {
                  addedJoin.establishJoinType()
                }
              }
            }
            if (!exprProps.existDot || (attrItem.dataType = 'Many')) {
              // if this is simple expression or many-attribute(all dots handled by creator SQL for this attribute)
              // then it goes to result
              // todo
            } else {
              // complex expression, need check associations
              // todo
            }
          }
        }
      } else {
        // todo
        // it is ready sql expression
      }
    }

    expressionList.push(expression)
    return expression
  }
  _registerSimpleExpression ({simpleExpr, fullExpr, exprProps, exprLinkProps, entity, manyAttrExprCollapsed, level}) {
    let simpleExpression
    let attrEntity
    let originalExpr
    let attribute
    let langPrefix

    if (exprProps.existLangPointer) {
      simpleExpression = simpleExpr
      langPrefix = ''
    } else {
      // todo extractAttrAndLang
      const res = parserUtils.extractAttrAndLang(simpleExpr)
      simpleExpression = res.expr
      langPrefix = res.langPrefix
      originalExpr = res.noLangExpr
    }
    if (!exprLinkProps || !exprLinkProps.existLink) {
      attrEntity = entity
      attribute = attrEntity.attributes[simpleExpression]
    } else {
      // todo may be move to mixin
      attrEntity = App.domain_.get(exprLinkProps.essLink, false)
      if (!attrEntity) {
        // todo EMetabaseException
        throw new Error(`Attribute expression "${simpleExpression}" linked on Entity "${exprLinkProps.essLink} but this entity not found in Domain`)
      }
      const unityMixin = attrEntity.mixin(ubMixinUnity)
      if (!unityMixin) {
        // todo EMetabaseException
        throw new Error(`Entity "${exprLinkProps.essLink}" not contain mixin "${ubMixinUnity}" and cannot be used in linking expression`)
      }
      if (unityMixin.entity !== entity.name) {
        // todo EMetabaseException
        throw new Error(`Entity "${exprLinkProps.essLink}" not inherited from unity entity "${entity.name}" and cannot be used in linking expression`)
      }
      attribute = attrEntity.attributes[simpleExpression]
    }
    if (!attribute) {
      throw new Error(`Attribute ${attrEntity.name}.${simpleExpr} not exist`)
    }

    const bldDSData = new DSBldData(attrEntity)
    const bldParams = {
      attribute,
      entity: attrEntity,
      fullExpr,
      existLangPointer: exprProps.existLangPointer,
      langPrefix,
      langPointerExpr: originalExpr,
      manyAttrExprCollapsed,
      level
    }
    const bldFieldData = new FieldBldData(bldParams)
    const {bldExprItem, bldDSItem} = this._registerFieldData(bldFieldData, bldDSData, bldParams)

    return {attribute, langPrefix, bldFieldData, bldDSData, bldExprItem, bldDSItem}
  }
  _registerFieldData (fieldData, dsData, bldParams) {
    const {item: bldDSItem, added: dsItemAdded} = this.builder.datasources.getItem(dsData, bldParams.level)

    // todo may be optimize
    // todo items sepearate class and set sqlExpression and nonPrefixSQLExpression in it's getItem method
    const bldExprItemName = (fieldData.customOwnerLevelSuffix
      ? `(${bldParams.level}).(${fieldData.attrExpression}).(${bldParams.langPrefix}).(${fieldData.customOwnerLevelSuffix})`
      : `(${bldParams.level}).(${fieldData.attrExpression}).(${bldParams.langPrefix})`)
    let bldExprItem = this.items[bldExprItemName]
    const exprItemAdded = !bldExprItem
    if (exprItemAdded) {
      bldExprItem = this.items[bldExprItemName] = new ExprBldData(this.builder, fieldData, bldParams)
    }

    if (exprItemAdded || dsItemAdded) {
      if (bldExprItem.ExpressionType === 'Expression') {
        bldExprItem.sqlExpression = fieldData.AttrSQLExpression.replace(reUbSelfDSValue, bldDSItem.uniqCalcShortName)
      } else {
        bldExprItem.sqlExpression = `${bldDSItem.uniqCalcShortName}.${fieldData.AttrSQLExpression}`.replace(reUbSelfDSValue, bldDSItem.uniqCalcShortName)
      }
      bldExprItem.nonPrefixSQLExpression = fieldData.AttrSQLExpression.replace(reUbSelfDSValue, bldDSItem.uniqCalcShortName)
    }
    return {bldExprItem, bldDSItem}
  }
}

module.exports = ExpressionList