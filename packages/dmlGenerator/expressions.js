/**
 * Created by v.orel on 11.01.2017.
 */
const parserUtils = require('./parserUtils')
const ubSFNAllFields = '*'
const ubMixinUnity = 'unity'
const ubEntityEnum = 'ubm_enum'
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
//  constructor (builder) {
//     this.builder = builder
//  }
}
class AllFieldsExpression extends Expression {
  constructor () {
    super()
    this.fieldName = ''
    this.expr = ubSFNAllFields
  }
}
class NonBracketExpression extends Expression {
  /**
   * Expression without brackets
   * @param {String} expression
   * @param {String} lang
   */
  constructor (expression, lang) {
    super()
    this.fieldName = ''
    this.attrEntityName = ''
    this.attributeName = ''
    this.isMultiLang = false
    this.lang = lang
    this.existLangPointer = false
    this.expression = expression
    this.nonPrefixExpression = expression
    this.dataType = 'unknown'
    // todo fPreparedExpression.SetExpressionType(sqletExpression, aExpressionList);
    this.expr = expression
  }
}
class ManyOrSimpleExpression extends Expression {
  constructor ({entity, attrItem, lang, exprProps, fieldData, exprItem, level, expression, complexAttrExpression}) {
    super()
    this.attrEntityName = entity.name
    this.attributeName = attrItem.name
    this.isMultiLang = attrItem.isMultiLang
/* todo
 if fAttrItem.isMultiLang then
  aExpressionList.HaveMultiLang := True;
 if fExprProps.ExistLangPointer then
  aExpressionList.HaveLangPointer := True;
 if (fBldFieldData.AttrDataType = adtMany) then
  aExpressionList.HaveManyDataType := True;
 */
    this.lang = lang
    this.existLangPointer = exprProps.existLangPointer
    this.dataType = fieldData.attrDataType
    this.expression = exprItem.sqlExpression
    this.nonPrefixSQLExpression = exprItem.nonPrefixSQLExpression
    this.level = level
    // todo fPreparedExpression.SetExpressionType(fBldFieldData.AttrSQLExprType, aExpressionList);
    this.mapped = fieldData.mapped
    // todo ALS is need
    if (level === parserUtils.rootLevel) {
      this.complexExpression = parserUtils.bracketExpr(expression).expression
    } else {
      const complexExprProps = parserUtils.extractExpressionProps(complexAttrExpression)
      if (!complexExprProps.simpleExpression) {
        this.complexExpression = parserUtils.bracketExpr(expression).expression
      } else {
        this.complexExpression = parserUtils.bracketExpr(complexAttrExpression).expression
      }
    }
  }
}
class ManyExpression extends ManyOrSimpleExpression {
  constructor ({builder, originalExpression, entity, attrItem, lang, exprProps, fieldData, exprItem, level, expression, complexAttrExpression, registerInColumnList}) {
    super({entity, attrItem, lang, exprProps, fieldData, exprItem, level, expression, complexAttrExpression})
    this.expr = parserUtils.bracketExpr(originalExpression).expression.replace(new RegExp(this.complexExpression, 'g'), `(${exprItem.sqlExpression})`)
    if (registerInColumnList) {
      const lastWord = parserUtils.expressionLastWord(expression)
      this.fieldName = builder.columns.registerName(lastWord, lastWord, false, true)
    }
  }
}
class SimpleExpression extends ManyOrSimpleExpression {
  constructor ({builder, originalExpression, entity, attrItem, lang, exprProps, fieldData, exprItem, level, expression, complexAttrExpression, registerInColumnList, expressionList}) {
    super({entity, attrItem, lang, exprProps, fieldData, exprItem, level, expression, complexAttrExpression})
    this.expr = parserUtils.bracketExpr(originalExpression).expression.replace(new RegExp(this.complexExpression, 'g'), exprItem.sqlExpression)
    if (registerInColumnList) {
      if ((expressionList.length > 1) || expressionList.haveNotFieldSQLExpr) {
        this.fieldName = builder.columns.registerName(exprItem.nonPrefixSQLExpression, attrItem.name, false, true)
      } else if (expressionList.length === 1) { // and (fPreparedExpression.ExpressionType = sqletField
        this.fieldName = builder.columns.registerName(exprItem.nonPrefixSQLExpression, attrItem.name, true, false)
      }
    }
  }
}
class SQLExpression extends Expression {
  constructor (expression, lang, id) {
    super()
    this.expr = expression.replace(/#/g, ' ')
    this.fieldName = ''
    this.attrEntityName = ''
    this.attributeName = ''
    this.isMultiLang = false
    this.lang = lang
    this.existLangPointer = false
    this.expression = this.expr
    this.nonPrefixExpression = `F${id}`
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
    this.localID = 1
  }
  add ({originalExpression, expressionList, attrExpression, lang, entity, level, manyAttrExprCollapsed, complexAttrExpression, whereItem, parentJoin, registerInColumnList}) {
    let expression
    if (originalExpression === ubSFNAllFields) {
      expression = new AllFieldsExpression()
    } else {
      if (entity.connectionName !== this.builder.entity.connectionName) {
        // todo EMetabaseException
        throw new Error(`Connection for entity "${entity.name}" must be identical to context entity "${this.builder.entity.name}"`)
      }
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
          expression = new NonBracketExpression(inExpression, lang)
        } else {
          for (let expr of exprList) {
            exprProps = parserUtils.extractExpressionProps(expr, {})
            let partExpr = parserUtils.expressionFirstWord(expr)
            let exprLinkProps = parserUtils.extractOneExprLink(partExpr)
            partExpr = exprLinkProps.expression
            let data
            if (exprLinkProps.existLink && (level === parserUtils.rootLevel)) {
              data = this._registerRootLink({entity, manyAttrExprCollapsed, partExpr, expr, exprProps, exprLinkProps, whereItem, parentJoin})
            } else {
              data = this._registerSimpleExpression({
                simpleExpr: partExpr,
                fullExpr: expr,
                exprProps,
                exprLinkProps,
                entity,
                manyAttrExprCollapsed,
                level
              })
            }
            const {attribute: attrItem, bldFieldData: fieldData, bldExprItem: exprItem, bldDSItem: dsItem} = data
//            return {attribute, langPrefix, bldFieldData, bldDSData, bldExprItem, bldDSItem}

            if (!exprProps.existDot || (attrItem.dataType = 'Many')) {
              // if this is simple expression or many-attribute(all dots handled by creator SQL for this attribute)
              // then it goes to result
              if (attrItem.dataType === 'Many') {
                expression = new ManyExpression({builder: this.builder, entity, attrItem, lang, exprProps, fieldData, exprItem, level, expr, complexAttrExpression, registerInColumnList})
              } else {
                expression = new SimpleExpression({builder: this.builder, entity, attrItem, lang, exprProps, fieldData, exprItem, level, expr, complexAttrExpression, registerInColumnList, expressionList})
              }
            } else {
              // complex expression, need check associations
              let associatedEntityName
              if (attrItem.dataType !== 'Enum') {
                associatedEntityName = attrItem.associatedEntity
              } else {
                associatedEntityName = ubEntityEnum
              }
              const associatedEntity = App.domain_.get(associatedEntityName)
              if (!associatedEntity) {
                // todo EMetabaseException
                throw new Error(`Association entity in attribute "${partExpr}" of object "${associatedEntityName}" is empty`)
              }
              if (!App.els(associatedEntity.name, this.builder.method)) {
                // todo EMetabaseException
                throw new Error(`ELS - access deny for user "${Session.uData.login}" method "${associatedEntity.name}.${this.builder.method}"`)
              }
              // todo EntityList.AddEntity(fAssociatedEntityRef) ??? for caching
              const nextLevel = `${level}.[${entity.name}.${partExpr}]`
              const nextExpr = (!exprLinkProps.existLink)
                ? parserUtils.delStartStr(expr, `${partExpr}.`)
                : parserUtils.delStartStr(expr, `${partExpr}@${exprLinkProps.essLink}.`)
              exprProps = parserUtils.extractExpressionProps(nextExpr)
              let partNextExpr = parserUtils.expressionFirstWord(nextExpr)
              let addedJoin
              if (partNextExpr) {
                // todo in const
                const nextAttrName = ((attrItem.dataType === 'Enum') ? 'code' : attrItem.associationAttr || parserUtils.ubID)
                const nextAttrItem = associatedEntity.attr(nextAttrName)
                if (!nextAttrItem) {
                  // todo EMetabaseException
                  throw new Error(`Attribute association "${entity.name}.${partExpr}" linked to "${associatedEntity.name}.${nextAttrName}", but attribute "${nextAttrName}" in entity "${associatedEntity.name}" not found`)
                }
                exprLinkProps = parserUtils.extractOneExprLink(partNextExpr)
                partNextExpr = exprLinkProps.expression
                const {bldExprItem: joinToExprItem, bldDSItem: joinToDSItem} = this._registerSimpleExpression({
                  simpleExpr: nextAttrName,
                  fullExpr: nextAttrName,
                  exprProps,
                  exprLinkProps,
                  entity: associatedEntity,
                  manyAttrExprCollapsed,
                  level: nextLevel
                })
                let enumJoinToExprItem
                if (attrItem.dataType === 'Enum') {
                  // todo in const
                  enumJoinToExprItem = this._registerSimpleExpression({
                    simpleExpr: 'eGroup',
                    fullExpr: 'eGroup',
                    exprProps,
                    exprLinkProps,
                    entity: associatedEntity,
                    manyAttrExprCollapsed,
                    level: nextLevel
                  }).bldExprItem
                }
                addedJoin = dsItem.joinList.add({
                  exprItem: exprItem,
                  joinToExprItem,
                  joinToDSItem,
                  associatedEntity,
                  enumJoinToExprItem,
                  enumGroup: attrItem.enumGroup,
                  whereItem,
                  isLastJoin: !exprProps.existDot
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
                  // AssociationType = aatAttr
                  if (exprLinkProps.existLink || ((attrItem.associationAttr || parserUtils.ubID) !== parserUtils.ubID)) {
                    addedJoin.joinType = 'LEFT'
                  } else {
                    addedJoin.establishJoinType()
                  }
                }
              }
              let complexExpression
              if (level === parserUtils.rootLevel) {
                complexExpression = expr
              } else {
                if (expressionList.length === 1) {
                  complexExpression = complexAttrExpression
                } else {
                  complexExpression = expr
                }
              }
              expression = this.add({
                originalExpression,
                expressionList,
                attrExpression: nextExpr,
                lang,
                entity: associatedEntity,
                level: nextLevel,
                manyAttrExprCollapsed,
                complexAttrExpression: complexExpression,
                whereItem,
                parentJoin: addedJoin,
                registerInColumnList
              })
            }
          }
        }
      } else {
        // it is ready sql expression
        expression = new SQLExpression(inExpression, lang, this.localID++)
      }
    }

    expressionList.push(expression)
    return expression
  }
  _registerRootLink ({entity, manyAttrExprCollapsed, partExpr, expr, exprProps, exprLinkProps, whereItem, parentJoin}) {
    // todo may be move to unity mixin
    // before registration of link-attribute we must register ID of parent entity, but only for root level
    this._registerSimpleExpression({
      simpleExpr: parserUtils.ubID,
      fullExpr: parserUtils.ubID,
      exprProps: {},
      exprLinkProps: {existLink: false},
      entity,
      manyAttrExprCollapsed,
      level: parserUtils.rootLevel
    })

    const res = this._registerSimpleExpression({
      simpleExpr: partExpr,
      fullExpr: expr,
      exprProps,
      exprLinkProps,
      entity,
      manyAttrExprCollapsed,
      level: parserUtils.rootLevel
    })
    const {bldDSItem: outBldDSItem, bldExprItem: outBldExprItem} = res
    // if exists lint to other table by UNITY then create JOIN here
    // but only for root level because for not-root level link already exists
    const associatedEntity = App.domain_.get(exprLinkProps.essLink)
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
    const {bldDSItem: joinToDSItem, bldExprItem: joinToExprItem} =
      this._registerSimpleExpression({
        simpleExpr: parserUtils.ubID,
        fullExpr: parserUtils.ubID,
        exprProps: {},
        exprLinkProps,
        entity,
        manyAttrExprCollapsed,
        level: parserUtils.rootLevel
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
    return res
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
      bldExprItem = this.items[bldExprItemName] = new ExprBldData(fieldData, bldParams)
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