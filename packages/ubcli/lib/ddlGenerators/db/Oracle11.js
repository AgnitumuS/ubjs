const _ = require('lodash')
const {TableDefinition} = require('../AbstractSchema')
const DBAbstract = require('./DBAbstract')

/**
 * Created by pavel.mash on 10.12.2016.
 */
class DBOracle extends DBAbstract {
  /**
   * Load information from a database schema definition into this.dbTableDefs
   * @override
   */
  loadDatabaseMetadata () {
    let mTables = this.refTableDefs

    // old code  // UPPER(t.table_name)
    let tablesSQL = `select
      t.table_name as name,  tc.comments as caption
    from
      user_tables t
      left outer join user_tab_comments tc on tc.table_name = t.table_name`

    /** @type {Array<Object>} */
    let dbTables = this.conn.xhr({
      endpoint: 'runSQL',
      data: tablesSQL,
      URLParams: {CONNECTION: this.dbConnectionConfig.name}
    })

    // create a function to extract index column name from Long (LOB)
    // direct loading a LOB column values to the app server is slow
    this.conn.xhr({
      endpoint: 'runSQL',
      data: `create or replace function F_ColumnNameForIdx( iName in varchar2, tName in varchar2, cPos in number)
return varchar2
as
  l_data long;
res varchar2(64);
begin
 select column_expression into l_data from user_ind_expressions e where e.index_name = iName and e.table_name = tName and e.column_position=cPos;
 return substr( l_data, 1, 64 );
end;`,
      URLParams: {CONNECTION: this.dbConnectionConfig.name}
    })
// to be called as F_ColumnDefault(tc.table_name, tc.column_name)
//     this.conn.xhr({
//       endpoint: 'runSQL',
//       data: `create or replace function F_ColumnDefault( tName in varchar2, cName in varchar2)
// return varchar2
// as
//   l_data long;
//   res varchar2(64);
// begin
//  select tc.data_default into l_data from user_tab_columns tc where tc.table_name=tName and tc.column_name=cName;
//  return substr( l_data, 1, 64 );
// end;`,
//       URLParams: {CONNECTION: this.dbConnectionConfig.name}
//     })
    // filter tables from a metadata if any
    if (mTables.length) {
      dbTables = _.filter(dbTables, (dbTab) => _.findIndex(mTables, {_upperName: dbTab.NAME.toUpperCase()}) !== -1)
    }
    for (let tabDef of dbTables) {
      let asIsTable = new TableDefinition({
        name: tabDef.NAME,
        caption: tabDef['CAPTION']
      })

      let columnSQL = `
select 
  tc.column_name as name,
  tc.data_type as typename, 
  tc.char_length as len,
  COALESCE(tc.data_precision,0) as prec,
  COALESCE(tc.data_scale,0) as scale,
  tc.nullable as nullable,
  tc.data_default as defvalue,
  cc.comments as description
from 
  user_tab_columns tc
  left join user_col_comments cc on cc.table_name=tc.table_name and cc.column_name=tc.column_name
where 
  tc.table_name=:('${asIsTable._upperName}'):
order by tc.column_id`

      let columnsFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: columnSQL,
        URLParams: {CONNECTION: this.dbConnectionConfig.name}
      })
      // console.log('columnsFromDb', columnsFromDb)
      for (let colDef of columnsFromDb) {
        let physicalTypeLower = colDef['TYPENAME'].toLowerCase()
        let def = colDef['DEFVALUE'] ? colDef['DEFVALUE'].trim() : colDef['DEFVALUE']
        let nObj = {
          name: colDef.NAME,
          description: colDef['DESCRIPTION'],
          allowNull: (colDef['NULLABLE'] === 'Y'),
          dataType: this.dataBaseTypeToUni(colDef['TYPENAME'], colDef['LEN'], colDef['PREC'], colDef['SCALE']),
          size: (['varchar2', 'nvarchar2', 'character varying', 'nvarchar', 'varchar', 'char', 'nchar', 'clob', 'nclob']
            .indexOf(physicalTypeLower) !== -1)
            ? colDef['LEN']
            : colDef['PREC'],
          prec: colDef['SCALE'],
          defaultValue: def,
          defaultConstraintName: null // no name for default constraint in Oracle?
        }
        // if (['nvarchar', 'nvarchar2'].indexOf(physicalTypeLower) !== -1) {
        //   nObj.size = Math.floor(nObj.size / 2)
        // }
        asIsTable.addColumn(nObj)
      }

      // foreign key
      let foreignKeysSQL = `
select
  uc.constraint_name as foreign_key_name,
  decode(uc.status,'ENABLED',0,1) as is_disabled,
  ucc.column_name as constraint_column_name,
  r.table_name as referenced_object,
  uc.delete_rule as delete_referential_action_desc
from user_constraints uc
  join user_cons_columns ucc on ucc.owner=uc.owner and ucc.constraint_name=uc.constraint_name
  join user_constraints r on r.owner=uc.r_owner and r.constraint_name=uc.r_constraint_name
where uc.constraint_type ='R'
  and uc.table_name=:('${asIsTable._upperName}'):`

      let fkFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: foreignKeysSQL,
        URLParams: {CONNECTION: this.dbConnectionConfig.name}
      })
      const C_ACTIONS = {
        'NO ACTION': 'NO_ACTION',
        // r: 'RESTRICT',
        'CASCADE': 'CASCADE',
        'SET NULL': 'SET_NULL'
        // d: 'SET_DEFAULT'
      }

      for (let fkDef of fkFromDb) {
        asIsTable.addFK({
          name: fkDef['FOREIGN_KEY_NAME'],
          keys: [fkDef['CONSTRAINT_COLUMN_NAME']],
          references: fkDef['REFERENCED_OBJECT'],
          isDisabled: fkDef['IS_DISABLED'] !== 0,
          deleteAction: C_ACTIONS[fkDef['DELETE_REFERENTIAL_ACTION_DESC']], // NO_ACTION, CASCADE, SET_NULL,  SET_DEFAULT
          updateAction: 'NO_ACTION' // C_ACTIONS[fkDef['update_referential_action_desc']]
        })
      }

      // primary keys
      let primaryKeySQL =
        `select uc.constraint_name,ucc.column_name 
from user_constraints uc
join user_cons_columns ucc on ucc.owner=uc.owner and ucc.constraint_name=uc.constraint_name
where uc.table_name=:('${asIsTable._upperName}'): 
and uc.constraint_type='P'`

      let pkFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: primaryKeySQL,
        URLParams: {CONNECTION: this.dbConnectionConfig.name}
      })
      if (pkFromDb.length) {
        asIsTable.primaryKey = {
          name: pkFromDb[0]['CONSTRAINT_NAME'],
          keys: _.map(pkFromDb, 'COLUMN_NAME'),
          autoIncrement: pkFromDb[0]['AUTO_INCREMENT'] === 1
        }
      }

      // indexes
      let indexesSQL = `
select 
  ui.index_name as index_id,
  ui.index_name,
  decode(ui.uniqueness,'UNIQUE',1,0) as is_unique,
  case when uic.column_name like 'SYS_N%' then 
    F_ColumnNameForIdx(ui.index_name, ui.table_name, uic.column_position)
  else 
    uic.column_name 
  end AS column_name,
  uic.column_position,
  decode(uic.descend,'ASC',0,1) is_descending_key,
  uc.constraint_type
from 
  user_indexes ui 
  join user_ind_columns uic on uic.index_name=ui.index_name
  left join user_constraints uc on uc.table_name=ui.table_name and uc.index_name=ui.index_name and uc.constraint_type='P'  
where 
  ui.table_name=:('${asIsTable._upperName}'):
  and uc.constraint_type is null
order 
  by ui.index_name, uic.column_position`

      let indexesFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: indexesSQL,
        URLParams: {CONNECTION: this.dbConnectionConfig.name}
      })
      let i = 0
      let idxCnt = indexesFromDb.length
      while (i < idxCnt) {
        let indexObj = {
          name: indexesFromDb[i]['INDEX_NAME'],
          isUnique: indexesFromDb[i]['IS_UNIQUE'] !== 0,
          isDisabled: false, // indexesFromDb[i][ 'is_disabled' ] !== 0,
          isConstraint: false, // indexesFromDb[i][ 'is_unique_constraint' ] !== 0,
          keys: []
        }
        // index may consist of several keys (one row for each key)
        let buildKeysFor = indexesFromDb[i]['INDEX_ID']
        while ((i < idxCnt) && (indexesFromDb[i]['INDEX_ID'] === buildKeysFor)) {
          // Examples. Desc index: "REGDATE"; Func index: "NLSSORT(\"MI_WFSTATE\",'nls_sort=''BINARY_CI''')"
          let colExpression = indexesFromDb[i]['COLUMN_NAME']
          // remove double quotes
          colExpression = colExpression.replace(/"/g, '')
          indexObj.keys.push(colExpression + (indexesFromDb[i]['IS_DESCENDING_KEY'] !== 0 ? ' DESC' : ''))
          i++
        }
        asIsTable.addIndex(indexObj)
      }

      // check constraints
      // for not null Oracle generate a constraint SYS_C01203123
      // we can filter such constraints by adding condition
      // and generated <> 'GENERATED NAME'`
      // also getting a user_constraints.search_condition is slow because this is a CLOB column
      let checkConstraintsSQL = `
select 
  constraint_name as name --,search_condition as definition
from 
  user_constraints
where 
  table_name=:('${asIsTable._upperName}'):
  and constraint_type='C'
  and generated <> 'GENERATED NAME'`

      let constraintsFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: checkConstraintsSQL,
        URLParams: {CONNECTION: this.dbConnectionConfig.name}
      })
      // console.log('constraintsFromDb', constraintsFromDb)
      for (let constraintDef of constraintsFromDb) {
        asIsTable.addCheckConstr({
          name: constraintDef['NAME'],
          definition: '' // constraintDef['DEFINITION'].trim()
        })
      }

      // triggers - UB do not add a triggers, so skip it

      this.dbTableDefs.push(asIsTable)
    }

    let sequencesSQL = `select sequence_name from user_sequences`
    let dbSequences = this.conn.xhr({
      endpoint: 'runSQL',
      data: sequencesSQL,
      URLParams: {CONNECTION: this.dbConnectionConfig.name}
    })
    for (let seqDef of dbSequences) {
      this.sequencesDefs.push(seqDef['SEQUENCE_NAME'])
    }
  }

  /** @override */
  genCodeRename (table, oldName, newName, typeObj) {
    if (typeObj === 'INDEX') {
      this.DDL.rename.statements.push(`ALTER INDEX ${oldName} RENAME TO ${newName}`)
    } else {
      this.DDL.rename.statements.push(`ALTER TABLE ${table.name} RENAME CONSTRAINT ${oldName} TO ${newName}`)
    }
  }

  /**
   * @override
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   * @param {String} updateType
   * @param {Object} [value] optional for updateType updConst
   */
  genCodeUpdate (table, column, updateType, value) {
    function quoteIfNeed (v) {
      return column.isString
        ? (!column.defaultValue && (column.refTable || column.enumGroup)
          ? v.replace(/'/g, "''")
          : v === 'ID'
            ? 'ID' // do not quoter ID
            : "''" + v.replace(/'/g, '') + "''")
        : v
      //  return ((!column.isString || (!column.defaultValue && (column.refTable || column.enumGroup))) ? v : "''" + v.replace(/'/g,'') + "''" );
    }

    switch (updateType) {
      case 'updConstComment':
        this.DDL.updateColumn.statements.push(
          `-- update ${table.name} set ${column.name} = ${quoteIfNeed(value)} where ${column.name} is null`
        )
        break
      case 'updConst':
        this.DDL.updateColumn.statements.push(
          `update /*2*/ ${table.name} set ${column.name} = ${quoteIfNeed(value)} where ${column.name} is null`
        )
        break
      case 'updNull':
        let possibleDefault = column.defaultValue ? quoteIfNeed(column.defaultValue) : '[Please_set_value_for_notnull_field]'
        this.DDL.updateColumn.statements.push(
          `-- update ${table.name} set ${column.name} = ${possibleDefault} where ${column.name} is null`
        )
        break
      case 'updBase':
        this.DDL.updateColumn.statements.push(
          `EXEC('update ${table.name} set ${column.name} = ${quoteIfNeed(column.baseName)} where ${column.name} is null`
        )
        break
    }
  }

  /** @override */
  genCodeSetCaption (tableName, column, value, oldValue) {
    if (value) value = value.replace(/'/g, "''")
    if (!value && !oldValue) return // prevent create empty comments
    let result = `comment on ${column ? 'column' : 'table'} ${tableName}${column ? '.' : ''}${column || ''} is '${value}'`
    this.DDL.caption.statements.push(result)
  }

  /** @override */
  genCodeCreateCheckC (table, checkConstr) {
    switch (checkConstr.type) {
      case 'bool':
        this.DDL.createCheckC.statements.push(
          `alter table ${table.name} add constraint ${checkConstr.name} check (${checkConstr.column} in (0,1))`
        )
        break
      case 'custom':
        this.DDL.createCheckC.statements.push(
          `alter table ${table.name} add constraint ${checkConstr.name} check (${checkConstr.expression})`
        )
        break
    }
  }

  /** @override */
  genCodeDropColumn (tableDB, columnDB) {
    this.DDL.dropColumn.statements.push(
      `alter table ${tableDB.name} drop column ${columnDB.name}`
    )
  }

  /** @override */
  genCodeSetDefault (table, column) {
    this.DDL.setDefault.statements.push(
      `alter table ${table.name} modify ${column.name} default ${column.defaultValue}`
    )
  }

  /** @override */
  genCodeDropDefault (table, column) {
    this.DDL.dropDefault.statements.push(
      `alter table ${table.name} modify ${column.name} default null`
    )
  }

  /** @override */
  genCodeAlterColumn (table, tableDB, column, columnDB, typeChanged, sizeChanged, allowNullChanged) {
    // recreate index only if type changed
    if (typeChanged || sizeChanged) {
      let objects = tableDB.getIndexesByColumnName(column.name)
      for (let colIndex of objects) {
        colIndex.isForDelete = true
        colIndex.isForDeleteMsg = `Delete for altering column ${table.name}.${column.name}`
      }
      this.DDL.alterColumn.statements.push(
        `alter table ${table.name} modify ${column.name} ${this.createTypeDefine(column)}`
      )
    }
    if (allowNullChanged) {
      if (column.allowNull) {
        this.DDL.alterColumn.statements.push(
          `alter table ${table.name} modify ${column.name} null`
        )
      } else {
        this.DDL.alterColumnNotNull.statements.push(
          `alter table ${table.name} modify ${column.name} not null`
        )
      }
    }
  }

  /**
   * @override
   */
  genCodeAddColumn (table, column, delayedNotNull) {
    let typeDef = this.createTypeDefine(column)
    let nullable = column.allowNull || delayedNotNull ? ' null' : ' not null'
    let def = column.defaultValue ? ' default ' + column.defaultValue : ''
    this.DDL.addColumn.statements.push(
      `alter table ${table.name} add ${column.name} ${typeDef}${def}${nullable}`
    )
    if (delayedNotNull && !column.allowNull) {
      this.DDL.alterColumnNotNull.statements.push(
        `alter table ${table.name} modify ${column.name} not null`
      )
    }
  }

  /**
   * @override
   */
  genCodeAddColumnBase (table, column, baseColumn) {
    let def = column.defaultValue ? ' default ' + column.defaultValue : ''
    this.DDL.addColumn.statements.push(
      `alter table ${table.name} add ${column.name} ${this.createTypeDefine(column)}${def}`
    )

    this.DDL.updateColumn.statements.push(
      `update ${table.name} set ${column.name} = ${baseColumn} where 1 = 1`
    )

    if (!column.allowNull) {
      let nullable = column.allowNull ? ' null' : ' not null'
      this.DDL.alterColumnNotNull.statements.push(
        `alter table ${table.name} modify ${column.name} ${nullable}`
      )
    }
  }

  /** @override */
  genCodeCreateTable (table) {
    let res = [`create table ${table.name}(\r\n`]
    let colLen = table.columns.length

    table.columns.forEach((column, index) => {
      res.push(' ', column.name, ' ', this.createTypeDefine(column),
        column.defaultValue
          ? ' default ' + column.defaultValue
          : '',
        column.allowNull ? ' null' : ' not null',
        index < colLen - 1 ? ',\r\n' : '\r\n')
    })
    res.push(')')
    this.DDL.createTable.statements.push(res.join(''))
  }

  /** @override */
  genCodeCreatePK (table) {
    // if (!table.isIndexOrganized){
    this.DDL.createPK.statements.push(
      `alter table ${table.name} add constraint ${table.primaryKey.name} PRIMARY KEY (${table.primaryKey.keys.join(',')})`
    )
    // }
  }

  /** @override */
  genCodeCreateFK (table, constraintFK) {
    if (!constraintFK.generateFK) return

    let refTo = _.find(this.refTableDefs, {_nameUpper: constraintFK.references.toUpperCase()})
    let refKeys = refTo ? refTo.primaryKey.keys.join(',') : 'ID'

    this.DDL.createFK.statements.push(
      `alter table ${table.name} add constraint ${constraintFK.name} foreign key (${constraintFK.keys.join(',')}) references ${constraintFK.references}(${refKeys})`
    )
  }

  /**
   * @abstract
   * @param {TableDefinition} tableDB
   * @param {TableDefinition} table
   * @param {IndexAttributes} indexDB
   * @param {String} [comment]
   * @param {Array} [objCollect]
   */
  genCodeDropIndex (tableDB, table, indexDB, comment, objCollect) {
    let cObj = objCollect || this.DDL.dropIndex.statements
    if (comment) cObj.push(`-- ${comment}\r\n`)
    if (indexDB.isConstraint) {
      cObj.push(`ALTER TABLE ${tableDB.name} DROP CONSTRAINT ${indexDB.name}`)
    } else {
      cObj.push(`drop index ${indexDB.name}`)
    }
  }

  /**
   * @abstract
   */
  genCodeDropPK (tableName, constraintName) {
    this.DDL.dropPK.statements.push(
      `alter table ${tableName} drop constraint ${constraintName}`
    )
    // throw new Error(`Abstract genCodeDropPK for ${tableName}.${constraintName}`)
  }

  /**
   * @override
   */
  genCodeDropConstraint (tableName, constraintName) {
    this.DDL.dropFK.statements.push(
      `alter table ${tableName} drop constraint ${constraintName}`
    )
  }

  /**
   * @abstract
   */
  genCodeAddSequence (table, sequenceObj) {
    throw new Error('Abstract genCodeAddSequence')
  }

  /**
   * @abstract
   */
  genCodeDropSequence (sequenceName) {
    throw new Error('Abstract genCodeDropSequence')
  }

  /** @override */
  genCodeCreateIndex (table, indexSH, comment) {
    let commentText = comment ? `-- ${comment} \n` : ''
    this.DDL.createIndex.statements.push(
      `${commentText}create ${indexSH.isUnique ? 'unique' : ''} index ${indexSH.name} on ${table.name}(${indexSH.keys.join(',')})`
    )
  }

  /**
   * Return a database-specific value for default expression.
   * Can parse UB macros (maxDate, currentDate etc)
   * @override
   * @param {string} macro
   * @param {FieldDefinition} [column]
   * @return {string}
   */
  getExpression (macro, column) {
    /**
     * @param {string} val
     * @return {string}
     */
    function dateTimeExpression (val) {
      if (!val) return val
      switch (val) {
        case 'currentDate':
          return `CAST(sys_extract_utc(SYSTIMESTAMP) AS DATE)`
        case 'maxDate':
          return `TO_DATE('31.12.9999', 'dd.mm.yyyy')`
        default:
          throw new Error(`Unknown expression with code ${val}`)
      }
    }
    if (!column) return dateTimeExpression(macro)
    if (column.isBoolean) return ((macro === 'TRUE') || (macro === '1')) ? '1' : '0'
    if (column.isString) return `'${macro}'`
    if (column.dataType === 'DATETIME') return dateTimeExpression(macro)
    return macro
  }

  /**
   * Convert universal types to database type
   * @override
   * @param {string} dataType
   * @return {string}
   */
  uniTypeToDataBase (dataType) {
    switch (dataType) {
      case 'NVARCHAR': return 'NVARCHAR2'
      case 'VARCHAR': return 'VARCHAR2'
      case 'INTEGER': return 'INTEGER'
      case 'BIGINT': return 'NUMBER(19)'
      case 'FLOAT': return 'NUMBER'
      case 'CURRENCY': return 'NUMBER'
      case 'BOOLEAN': return 'NUMBER'
      case 'DATETIME': return 'DATE'
      case 'TEXT': return 'CLOB'
      case 'DOCUMENT': return 'VARCHAR2'
      case 'BLOB': return 'BLOB'
      default: return dataType
    }
  }

  /**
   * Convert database types to universal
   * @override
   * @param dataType
   * @param {number} len
   * @param {number}  prec
   * @param {number}  scale
   * @return {String}
   */
  dataBaseTypeToUni (dataType, len, prec, scale) {
    dataType = dataType.toUpperCase()
    switch (dataType) {
      case 'NUMBER':
        if (prec === 19 && scale === 0) {
          return 'BIGINT'
        } else if (prec === 19 && scale === 4) {
          return 'FLOAT'
        } else if (prec === 19 && scale === 2) {
          return 'CURRENCY'
        } else if (prec === 1) {
          return 'BOOLEAN'
        } else if ((prec === 0) && (scale === 0)) {
          return 'INTEGER'
        } else {
          return 'NUMERIC'
        }
      case 'DATE': return 'DATETIME'
      // case 'TIMESTAMP': return 'DATETIME'
      case 'NVARCHAR2': return 'NVARCHAR'
      case 'VARCHAR2': return 'VARCHAR'
      case 'CLOB': return 'TEXT'
      case 'BLOB': return 'BLOB'
      default: return dataType
    }
  }

  /**
   * Generate a column type DDL part
   * @override
   * @param {FieldDefinition} column
   * @return {string}
   */
  // createTypeDefine (column) {
  //   // if (column.dataType === 'BOOLEAN') { // prevent SMALLINT(1)
  //   //   return this.uniTypeToDataBase(column.dataType)
  //   // } else
  //   if ((column.dataType === 'NVARCHAR') && (column.size >= 2000)) {
  //     return this.uniTypeToDataBase(column.dataType) + '(2000)' // Oracle NVARCHAR2 is maximum 2000 char length
  //   } else {
  //     return super.createTypeDefine(column)
  //   }
  // }
}

module.exports = DBOracle
