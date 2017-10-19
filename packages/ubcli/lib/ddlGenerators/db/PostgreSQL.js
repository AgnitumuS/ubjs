
const _ = require('lodash')
const {TableDefinition} = require('../AbstractSchema')
const DBAbstract = require('./DBAbstract')

/**
 * Created by pavel.mash on 10.12.2016.
 */
class DBPostgreSQL extends DBAbstract {
  /**
   * Load information from a database schema definition into this.dbTableDefs
   * @override
   */
  loadDatabaseMetadata () {
    let mTables = this.refTableDefs

    // old code  // UPPER(t.table_name)
    let tablesSQL = `select t.table_name as name, 
      (select description from pg_description
        where objoid = (select typrelid from pg_type where typname = t.table_name
        and typowner = (select oid from pg_roles where rolname = current_user)) and objsubid = 0
      ) as caption
    from information_schema.tables t
    where t.table_schema = current_user`

    /** @type {Array<Object>} */
    let dbTables = this.conn.xhr({
      endpoint: 'runSQL',
      data: tablesSQL,
      URLParams: { CONNECTION: this.dbConnectionConfig.name }
    })

    // filter tables from a metadata if any
    if (mTables.length) {
      dbTables = _.filter(dbTables, (dbTab) => _.findIndex(mTables, { name: dbTab.name }) !== -1)
    }
    for (let tabDef of dbTables) {
      let asIsTable = new TableDefinition({
        name: tabDef.name,
        caption: tabDef.caption
      })

      // Table Columns
      // TODO - rewrite using parameters in query (after rewriting runSQL using JS)
      let columnSQL = `select c.column_name as name, c.data_type as typename,
        c.character_maximum_length as length, c.character_maximum_length as char_length,
        COALESCE(c.numeric_precision, 0) as prec, COALESCE(c.numeric_scale, 0) as scale, substr(c.is_nullable, 1, 1) as is_nullable,
        'NO' as is_computed, c.column_default as defvalue,
          (select description from pg_description
          where objoid =
            (select typrelid from pg_type where typname = LOWER(c.table_name) and typowner = (select oid from pg_roles where rolname = current_user))
            and objsubid = c.ordinal_position) as comments
        from information_schema.columns c
        where c.table_schema = current_user
        and c.table_name = LOWER(:('${asIsTable._upperName}'):)
        order by c.ordinal_position`

      let columnsFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: columnSQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      // console.log('columnsFromDb', columnsFromDb)
      for (let colDef of columnsFromDb) {
        let physicalTypeLower = colDef['typename'].toLowerCase()
        let def = colDef['defvalue']
        // SQL server return default value wrapped in 'A' -> ('A')
        // numeric & int types wrapped twice 0 -> ((0))
        if (def) {
          def = def.replace(/^\((.*)\)$/, '$1')
          if (['numeric', 'int'].indexOf(physicalTypeLower) !== -1) def = def.replace(/^\((.*)\)$/, '$1')
        }
        let nObj = {
          name: colDef.name,
          description: colDef.description,
          allowNull: (colDef['is_nullable'] !== 0),
          dataType: this.dataBaseTypeToUni(colDef['typename'], colDef['len'], colDef['prec'], colDef['scale']),
          size: (['nvarchar', 'varchar', 'char', 'nchar', 'text', 'ntext'].indexOf(physicalTypeLower) !== -1)
            ? colDef['len']
            : colDef.prec,
          prec: colDef['scale'],
          // defaultValue: this.parseDefValue( colDef.defvalue ),
          defaultValue: def
          // defaultConstraintName: colDef['defname']
        }
        if (physicalTypeLower === 'nvarchar' || physicalTypeLower === 'nchar' || physicalTypeLower === 'ntext') {
          nObj.size = Math.floor(nObj.size / 2)
        }
        asIsTable.addColumn(nObj)
      }

      // foreign key
      let foreignKeysSQL = `select tc.constraint_name as foreign_key_name, UPPER(tc.table_name) as table_name, UPPER(a.table_name) as referensed,
        'NO_ACTION' as delete_rule, 'ENABLED' as status 
        from information_schema.table_constraints tc, information_schema.constraint_table_usage a 
        where tc.constraint_schema = current_user 
        and tc.table_schema = current_user 
        and tc.table_name = LOWER(:('${asIsTable._upperName}'):) 
        and tc.constraint_type in ('FOREIGN KEY') 
        and a.constraint_name = tc.constraint_name`

      let fkFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: foreignKeysSQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      for (let fkDef of fkFromDb) {
        asIsTable.addFK({
          name: fkDef['foreign_key_name'],
          keys: [fkDef['constraint_column_name'].toUpperCase()],
          references: fkDef['referenced_object'],
          isDisabled: fkDef['is_disabled'] !== 0,
          deleteAction: fkDef['delete_referential_action_desc'], // NO_ACTION, CASCADE, SET_NULL,  SET_DEFAULT
          updateAction: fkDef['update_referential_action_desc']
        })
      }

      // primary keys
      let primaryKeySQL =
        `SELECT UPPER(c.relname) constraint_name, UPPER(a.attname) AS column_name
        FROM   pg_index i
        JOIN pg_class c on i.indexrelid = c.oid
        JOIN pg_attribute a ON a.attrelid = i.indrelid
                           AND a.attnum = ANY(i.indkey)
        WHERE  i.indrelid = '${asIsTable.name}'::regclass
        AND    i.indisprimary`

      // `select UPPER(tc.constraint_name) as constraint_name,
      //   substr(constraint_type, 1, 1) as constraint_type,
      //   '' as search_condition, 'ENABLED' as status, 'USER NAME' as generated
      //   from information_schema.table_constraints tc
      //   where tc.constraint_schema = current_user
      //   and tc.table_schema = current_user
      //   and tc.table_name = LOWER(:('${asIsTable._upperName}'):)
      //   and tc.constraint_type in ('PRIMARY KEY')`

      let pkFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: primaryKeySQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      if (pkFromDb.length) {
        asIsTable.primaryKey = {
          name: pkFromDb[0]['constraint_name'],
          keys: _.map(pkFromDb, 'column_name'),
          autoIncrement: pkFromDb[0]['auto_increment'] === 1
        }
      }

      // indexes
      let indexesSQL =
`SELECT 
  i.indexrelid as index_id,
  UPPER(c.relname) as index_name,
  i.indisunique as is_unique, 
  UPPER(a.attname) AS column_name,
  array_position(i.indkey, a.attnum) as column_position,
  CASE WHEN position(a.attname || ' DESC' in pg_get_indexdef(i.indexrelid)) > 0 THEN 1 ELSE 0 END as is_descending_key,
  CASE WHEN i.indisunique THEN 1 ELSE 0 END as is_unique
FROM pg_index i
  JOIN pg_class c ON c.oid = i.indexrelid 
  JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
WHERE 
  i.indrelid = '${asIsTable.name}'::regclass AND 
  NOT i.indisprimary
ORDER BY index_id, column_position`

      let indexesFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: indexesSQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      let i = 0
      let idxCnt = indexesFromDb.length
      while (i < idxCnt) {
        let indexObj = {
          name: indexesFromDb[i][ 'index_name' ],
          isUnique: indexesFromDb[i][ 'is_unique' ] !== 0,
          isDisabled: false, // indexesFromDb[i][ 'is_disabled' ] !== 0,
          isConstraint: false, // indexesFromDb[i][ 'is_unique_constraint' ] !== 0,
          keys: []
        }
        // index may consist of several keys (one row for each key)
        let buildKeysFor = indexesFromDb[i]['index_id']
        while ((i < idxCnt) && (indexesFromDb[i]['index_id'] === buildKeysFor)) {
          indexObj.keys.push(indexesFromDb[i]['column_name'] + (indexesFromDb[i]['is_descending_key'] !== 0 ? ' DESC' : ''))
          i++
        }
        asIsTable.addIndex(indexObj)
      }

      // check constraints
      let checkConstraintsSQL = `SELECT c.conname AS name, 
         c.consrc as definition 
         FROM pg_constraint c 
         LEFT JOIN pg_class t ON c.conrelid  = t.oid 
         WHERE t.relname = LOWER(:('${asIsTable._upperName}'):) 
         and t.relowner = (select oid from pg_roles where rolname = current_user) 
         AND c.contype = 'c'`

      let constraintsFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: checkConstraintsSQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      // console.log('constraintsFromDb', constraintsFromDb)
      for (let constraintDef of constraintsFromDb) {
        asIsTable.addCheckConstr({
          name: constraintDef['name'],
          definition: constraintDef['definition']
        })
      }

      // triggers - UB do not add a triggers, so skip it

      this.dbTableDefs.push(asIsTable)
    }

    let sequencesSQL = `select sequence_name from information_schema.sequences where sequence_schema = current_user`
    let dbSequences = this.conn.xhr({
      endpoint: 'runSQL',
      data: sequencesSQL,
      URLParams: { CONNECTION: this.dbConnectionConfig.name }
    })
    for (let seqDef of dbSequences) {
      this.sequencesDefs.push(seqDef['sequence_name'].toUpperCase())
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
          `update ${table.name} set ${column.name} = ${quoteIfNeed(value)} where ${column.name} is null`
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
      `alter table ${table.name} alter column ${column.name} set default ${column.defaultValue}`
    )
  }

  /** @override */
  genCodeDropDefault (table, column) {
    this.DDL.dropDefault.statements.push(
      `alter table ${table.name} alter column ${column.name} drop default`
    )
  }

  /** @override */
  genCodeAlterColumn (table, tableDB, column, columnDB, typeChanged, sizeChanged, allowNullChanged) {
    if (typeChanged && column.dataType === 'NTEXT') {
      // todo сделать автоматом
      this.addWarning(`Converting to NTEXT type is not supported. Create a new field manually and copy the data into it
      \tField ${table.name}.${column.name}`)
    }

    // in case of not null added - recreate index
    // if (allowNullChanged && !column.allowNull ){

    let objects = tableDB.getIndexesByColumnName(column.name)
    for (let colIndex of objects) {
      colIndex.isForDelete = true
      colIndex.isForDeleteMsg = `Delete for altering column ${table.name}.${column.name}`
    }

    if (typeChanged || sizeChanged) {
      this.DDL.alterColumn.statements.push(
        `alter table ${table.name} alter column ${column.name} type ${this.createTypeDefine(column)}`
      )
    }
    if (allowNullChanged) {
      if (column.allowNull) {
        this.DDL.alterColumn.statements.push(
          `alter table ${table.name} alter column ${column.name} ${column.allowNull ? ' drop not null' : ' set not null'}`
        )
      } else {
        this.DDL.alterColumnNotNull.statements.push(
          `alter table ${table.name} alter column ${column.name} ${column.allowNull ? ' drop not null' : ' set not null'}`
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
        `alter table dbo.${table.name} alter column ${column.name} set not null`
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
        `alter table ${table.name} alter column ${column.name} ${this.createTypeDefine(column)}${nullable}`
      )
    }
  }
  /** @override */
  genCodeCreateTable (table) {
    let res = [`create table ${table.name}(\r\n`]
    let colLen = table.columns.length

    table.columns.forEach((column, index) => {
      res.push('\t', column.name, ' ', this.createTypeDefine(column),
        column.defaultValue
          ? (column.defaultConstraintName ? ` CONSTRAINT ${column.defaultConstraintName} ` : '') +
            ' default ' + column.defaultValue
          : '',
        column.allowNull ? ' null' : ' not null',
        index < colLen - 1 ? ',\r\n' : '\r\n')
    })
    res.push(')')
    this.DDL.createTable.statements.push(res.join(''))
  }

  /** @override */
  genCodeCreatePK (table) {
    // TODO - then Postgres will support index organized table - uncomment it
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
    // todo - by felix: for Postgres no need rename primary key index
    let cObj = objCollect || this.DDL.dropIndex.statements
    if (comment) cObj.push(`-- ${comment}\r\n`)
    if (indexDB.isConstraint) {
      cObj.push(`ALTER TABLE ${tableDB.name} DROP CONSTRAINT ${indexDB.name}`)
    } else {
      cObj.push(`drop index ${indexDB.name} on ${tableDB.name}`)
    }
  }
  /**
   * @abstract
   */
  genCodeDropPK (tableName, constraintName) {
    debugger
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
   */
  getExpression (macro, column) {
    function dateTimeExpression (val) {
      if (!val) return val
      switch (val) {
        case 'currentDate': return `timezone('utc'::text, now())`
        case 'maxDate': return "'9999-12-31Z'"
        default: throw new Error('Unknown expression with code ' + val)
      }
    }
    if (!column) return dateTimeExpression(macro)

    if (column.isBoolean) return ((macro === 'TRUE') || (macro === '1')) ? '1' : '0'
    if (column.isString) return "'" + macro + "'"
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
      case 'NVARCHAR': return 'VARCHAR'
      case 'VARCHAR': return 'VARCHAR'
      case 'INTEGER': return 'INTEGER'
      case 'BIGINT': return 'BIGINT'
      case 'FLOAT': return 'NUMERIC'
      case 'CURRENCY': return 'NUMERIC'
      case 'BOOLEAN': return 'SMALLINT'
      case 'DATETIME': return 'TIMESTAMP' // 'TIMESTAMP WITH TIME ZONE'
      case 'TEXT': return 'NVARCHAR(MAX)'
      case 'DOCUMENT': return 'TEXT'
      case 'BLOB': return 'BYTEA'
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
      case 'NUMERIC':
        if (prec === 19 && scale === 2) {
          return 'CURRENCY'
        } else if (prec === 19 && scale === 4) {
          return 'FLOAT'
        } else {
          return 'BIGINT'
        }
      case 'INT8': return 'BIGINT'
      case 'INT4': return 'INTEGER'
      case 'SMALLINT': return 'BOOLEAN'
      case 'TIMESTAMP': return 'DATETIME' // OLD - TIMESTAMP and this unknown comment Не будет совпадать с типом DATETIME и сгенерится ALTER
      case 'TIMESTAMP WITH TIME ZONE': return 'TIMESTAMP WITH TIME ZONE'
      case 'TIMESTAMP WITHOUT TIME ZONE': return 'DATETIME' // OLD - TIMESTAMP WITHOUT TIME ZONE and this unknown comment: Не будет совпадать с типом DATETIME и сгенерится ALTER
      case 'DATE': return 'DATE' // Не будет совпадать с типом DATETIME и сгенерится ALTER
      case 'CHARACTER VARYING': return 'UVARCHAR'
      case 'VARCHAR': return 'UVARCHAR'
      case 'TEXT': return 'TEXT'
      case 'BYTEA': return 'BLOB'
      default: return dataType
    }
  }

  // /** @override */
  // compareDefault (dataType, newValue, oldValue, constraintName, oldConstraintName) {
  //   if (typeof oldValue === 'string') {
  //     // special case for MS SQL datetime function: CONVERT(datetime,''31.12.9999'',(104)) but DB return CONVERT([datetime],''31.12.9999'',(104))
  //     oldValue = oldValue.toString().trim().replace('[datetime]', 'datetime')
  //   }
  //   return super.compareDefault(dataType, newValue, oldValue, constraintName, oldConstraintName)
  // }

  /**
   * Generate a column type DDL part
   * @override
   * @param {FieldDefinition} column
   * @return {string}
   */
  createTypeDefine (column) {
    if (column.dataType === 'BOOLEAN') { // prevent SMALLINT(1)
      return this.uniTypeToDataBase(column.dataType)
    } else {
      return super.createTypeDefine(column)
    }
  }
}

module.exports = DBPostgreSQL
