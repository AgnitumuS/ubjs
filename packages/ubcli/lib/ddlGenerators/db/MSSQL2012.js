
const _ = require('lodash')
const {TableDefinition, strIComp} = require('../AbstractSchema')
const DBAbstract = require('./DBAbstract')

/**
 * Created by pavel.mash on 10.12.2016.
 */

class DBSQL2012 extends DBAbstract {
  /**
   * Load information from a database schema definition into this.dbTableDefs
   * @abstract
   */
  loadDatabaseMetadata () {
    console.info(`Loading database metadata for ${this.dbConnectionConfig.name}...`)

    let mTables = this.refTableDefs

    let tablesSQL = `select o.name, cast( eprop.value as nvarchar(2000) )  as caption 
      from  sys.tables o
       left outer join sys.extended_properties eprop 
         on eprop.major_id = o.object_id and eprop.minor_id = 0 and eprop.class = 1 and eprop.name = 'Caption'
      where o.type = 'U'
      order by o.name`
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
      let refTable = new TableDefinition({
        name: tabDef.name,
        caption: tabDef.caption
      })

      // Table Columns
      // TODO - rewrite using parameters in query (after rewriting runSQL using JS)
      let columnSQL = `SELECT c.name, c.column_id AS colid, c.is_ansi_padded, c.is_nullable,
        c.is_identity, c.is_xml_document, c.is_computed, t.name AS typename, st.name AS systpname,
        c.max_length AS len, c.precision AS prec, c.scale, d.name AS defname, du.name AS defowner, 
        cast( ep.value as nvarchar(2000) ) as caption, cm.definition  AS defvalue
      FROM sys.all_columns c INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
        INNER JOIN sys.schemas tu ON tu.schema_id = t.schema_id
        LEFT OUTER JOIN sys.types st ON c.system_type_id = st.user_type_id
        INNER JOIN sys.all_objects tb ON tb.object_id = c.object_id
        INNER JOIN sys.schemas u ON u.schema_id = tb.schema_id
        LEFT OUTER JOIN sys.objects d ON d.object_id = c.default_object_id
        LEFT OUTER JOIN sys.schemas du ON du.schema_id = d.schema_id
        LEFT OUTER JOIN sys.default_constraints cm ON cm.object_id = d.object_id
        left outer join sys.extended_properties ep on ep.major_id = tb.object_id and ep.minor_id = c.column_id and ep.class = 1 and ep.name = 'Caption'
      where tb.object_id = object_id( :("${refTable._upperName}"):, N'U')`
      let columnsFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: columnSQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })

      for (let colDef of columnsFromDb) {
        let physicalTypeLower = colDef['typename'].toLowerCase()
        let nObj = {
          name: colDef.name,
          caption: colDef.caption,
          allowNull: (colDef['is_nullable'] !== 0),
          dataType: this.dataBaseTypeToUni(colDef['typename'], colDef['len'], colDef['prec'], colDef['scale']),
          size: (['nvarchar', 'varchar', 'char', 'nchar', 'text', 'ntext'].indexOf(physicalTypeLower) !== -1)
            ? colDef.length
            : colDef.prec,
          prec: colDef['scale'],
          // defaultValue: this.parseDefValue( colDef.defvalue ),
          defaultValue: colDef['defvalue'],
          defaultConstraintName: colDef['defname']
        }
        if (physicalTypeLower === 'nvarchar' || physicalTypeLower === 'nchar' || physicalTypeLower === 'ntext') {
          nObj.size = Math.floor(nObj.size / 2)
        }
        refTable.addColumn(nObj)
      }

      // foreign key
      let foreignKeysSQL = `SELECT
        f.name AS foreign_key_name
        ,OBJECT_NAME(f.parent_object_id) AS table_name
        ,COL_NAME(fc.parent_object_id, fc.parent_column_id) AS constraint_column_name
        ,OBJECT_NAME (f.referenced_object_id) AS referenced_object
        ,COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS referenced_column_name
        ,is_disabled
        ,delete_referential_action_desc
        ,update_referential_action_desc
        FROM sys.foreign_keys AS f
        INNER JOIN sys.foreign_key_columns AS fc
        ON f.object_id = fc.constraint_object_id
        WHERE f.parent_object_id = OBJECT_ID(:("${refTable._upperName}"):, N'U')`
      let fkFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: foreignKeysSQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      for (let fkDef of fkFromDb) {
        refTable.addFK({
          name: fkDef['foreign_key_name'],
          keys: [fkDef['constraint_column_name']],
          references: fkDef['referenced_object'],
          isDisabled: fkDef['is_disabled'] !== 0,
          deleteAction: fkDef['delete_referential_action_desc'], // NO_ACTION, CASCADE, SET_NULL,  SET_DEFAULT
          updateAction: fkDef['update_referential_action_desc']
        })
      }

      // primary keys
      let primaryKeySQL = `SELECT i.name AS constraint_name, c.name AS column_name, c.is_identity as auto_increment
        FROM sys.indexes AS i
          INNER JOIN sys.index_columns AS ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
          INNER JOIN sys.columns AS c ON ic.object_id = c.object_id AND c.column_id = ic.column_id
        WHERE i.is_primary_key = 1
          AND i.object_id = OBJECT_ID(:("${refTable._upperName}"):, N'U')
        ORDER BY ic.key_ordinal`
      let pkFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: primaryKeySQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      if (pkFromDb.length) {
        refTable.primaryKey = {
          name: pkFromDb[0]['constraint_name'],
          keys: _.map(pkFromDb, 'column_name'),
          autoIncrement: pkFromDb[0]['auto_increment'] === 1
        }
      }

      // indexes
      let indexesSQL = `SELECT ic.index_id, i.name AS index_name, c.name AS column_name, i.type_desc,
            i.is_unique, i.is_primary_key, i.is_unique_constraint, i.is_disabled, ic.is_descending_key
        FROM sys.indexes AS i
            INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
            INNER JOIN sys.columns c  ON ic.object_id = c.object_id AND c.column_id = ic.column_id
        WHERE is_hypothetical = 0 AND i.index_id <> 0
            and i.is_primary_key <> 1
            AND i.object_id = OBJECT_ID(:("${refTable._upperName}"):, N'U')
        order by ic.index_id, ic.key_ordinal, c.name`
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
          isDisabled: indexesFromDb[i][ 'is_disabled' ] !== 0,
          isConstraint: indexesFromDb[i][ 'is_unique_constraint' ] !== 0,
          keys: []
        }
        // index may consist of several keys (one roe for each key)
        let buildKeysFor = indexesFromDb[i]['index_id']
        while ((i < idxCnt) && (indexesFromDb[i]['index_id'] === buildKeysFor)) {
          indexObj.keys.push(indexesFromDb[i]['column_name'] + (indexesFromDb[i]['is_descending_key'] !== 0 ? ' DESC' : ''))
          i++
        }
        refTable.addIndex(indexObj)
      }

      // check constraints
      let checkConstraintsSQL = `SELECT ck.name, ck.definition FROM sys.check_constraints ck
        where ck.parent_object_id = OBJECT_ID(:("${refTable._upperName}"):, N'U')`
      let constraintsFromDb = this.conn.xhr({
        endpoint: 'runSQL',
        data: checkConstraintsSQL,
        URLParams: { CONNECTION: this.dbConnectionConfig.name }
      })
      for (let constraintDef of constraintsFromDb) {
        refTable.addCheckConstr({
          name: constraintDef['name'],
          definition: constraintDef['definition']
        })
      }

      // triggers - UB do not add a triggers, so skip it
    }

    let sequencesSQL = `SELECT name AS sequence_name FROM sys.sequences WHERE SCHEMA_NAME(schema_id) = 'dbo'`
    let dbSequences = this.conn.xhr({
      endpoint: 'runSQL',
      data: sequencesSQL,
      URLParams: { CONNECTION: this.dbConnectionConfig.name }
    })
    for (let seqDef of dbSequences) {
      this.sequencesDefs.push(seqDef['sequence_name'].toUpperCase())
    }
  }

  addWarning (text) {
    this.DDL.warnings.statements.push(text)
  }

  genCodeRename (table, oldName, newName, typeObj) {}

  /**
   * @abstract
   * @param {Object} table
   * @param {Object} column
   * @param {String} updateType
   * @param {Object} [value] optional for updateType updConst
   */
  genCodeUpdate (table, column, updateType, value) {}

  /**
   *
   */
  genCodeSetCaption (tableName, column, value, oldValue) {
    if (value) value = value.replace("'", "''", 'g')
    let proc = (oldValue === null) ? 'sp_addextendedproperty' : 'sp_updateextendedproperty'
    let result = `EXEC ${proc} @name = N'Caption', @value = N'${value === null ? (column || tableName) : value}',@level0type = N'SCHEMA',  @level0name= N'dbo', @level1type = N'TABLE',  @level1name = N'${tableName}'`
    if (column) result += `, @level2type = N'Column', @level2name = '${column}'`
    this.DDL.caption.statements.push(result)
  }

  /**
   *
   */
  genCodeCreateCheckC (table, checkConstr) {
    switch (checkConstr.type) {
      case 'bool':
        this.DDL.createCheckC.statements.push(
          `alter table dbo.${table.name} add constraint ${checkConstr.name} check (${checkConstr.column} in (0,1))`
        )
        break
      case 'custom':
        this.DDL.createCheckC.statements.push(
          `alter table dbo.${table.name} add constraint ${checkConstr.name} check (${checkConstr.expression})`
        )
        break
    }
  }

  /**
   * @abstract
   */
  genCodeDropColumn (tableDB, columnDB) {
    throw new Error('Abstract genCodeDropColumn')
  }

  /**
   * @abstract
   */
  genCodeSetDefault (table, column) {
    throw new Error('Abstract genCodeSetDefault')
  }

  /**
   * @abstract
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   */
  genCodeDropDefault (table, column) {
    throw new Error('Abstract genCodeDropDefault')
  }

  /**
   * @abstract
   */
  genCodeAlterColumn (table, tableDB, column, columnDB, typeChanged, sizeChanged, allowNullChanged) {
    throw new Error('Abstract genCodeAlterColumn')
  }

  /**
   * @abstract
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   * @param {boolean} [delayedNotNull] optional true to set not null in alter
   */
  genCodeAddColumn (table, column, delayedNotNull) {
    throw new Error('Abstract genCodeAddColumn')
  }
  /**
   * Generate code for add language column
   * @abstract
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   * @param baseColumn
   */
  genCodeAddColumnBase (table, column, baseColumn) {
    throw new Error('Abstract genCodeAddColumnBase')
  }
  /**
   * @param {TableDefinition} table
   */
  genCodeCreateTable (table) {
    let res = [`create table dbo.${table.name}(\r\n`]
    let colLen = table.columns.length

    table.columns.forEach((column, index) => {
      res.push('\t', column.name, this.createTypeDefine(column), column.allowNull ? ' null' : ' not null',
        column.defaultValue
          ? (column.defaultConstraintName ? ` CONSTRAINT ${column.defaultConstraintName} ` : '') +
            ' default ' + column.defaultValue
          : '',
        index < colLen - 1 ? ',\r\n' : '\r\n')
    })
    res.push(')')
    this.DDL.createTable.statements.push(res.join(''))
  }
  /**
   * @param {TableDefinition} table
   */
  genCodeCreatePK (table) {
    this.DDL.createPK.statements.push(
      `alter table dbo.${table.name} add constraint ${table.primaryKey.name} PRIMARY KEY CLUSTERED(${table.primaryKey.keys.join(',')})`
    )
  }
  /**
   * @param {TableDefinition} table
   * @param {Object} constraintFK
   */
  genCodeCreateFK (table, constraintFK) {
    if (!constraintFK.generateFK) return

    let refTo = _.find(this.refTableDefs, {_nameUpper: constraintFK.references.toUpperCase()})
    let refKeys = refTo ? refTo.primaryKey.keys.join(',') : 'ID'

    this.DDL.createFK.statements.push(
      `alter table dbo.${table.name} add constraint ${constraintFK.name} foreign key (${constraintFK.keys.join(',')} references dbo.${constraintFK.references}(${refKeys})`
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
    throw new Error('Abstract genCodeDropIndex')
  }
  /**
   * @abstract
   */
  genCodeDropPK (tableName, constraintName) {
    throw new Error('Abstract genCodeDropPK')
  }
  /**
   * @abstract
   * @param {string} tableName
   * @param {string} constraintName
   */
  genCodeDropConstraint (tableName, constraintName) {
    throw new Error('Abstract genCodeDropConstraint')
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
  genCodeCreateIndex (table, indexSH, comment) {
    let idx = comment ? `-- ${comment}\r\n` : ''
    this.DDL.createIndex.statements.push(
      `${idx} create ${indexSH.isUnique ? 'unique' : ''} index ${indexSH.name} on dbo.${table.name}(${indexSH.keys.join(',')})`
    )
  }
  /**
   * Return a database-specific value for default expression.
   * Can parse UB macros (maxDate, currentDate etc)
   * @param {string} macro
   * @param {FieldDefinition} [column]
   */
  getExpression (macro, column) {
    function dateTimeExpression (val) {
      if (!val) return val
      switch (val) {
        // getutcdate() MUST be in lowercase but CONVERT in UPPER as in MSSQL metadata
        case 'currentDate': return 'getutcdate()'
        case 'maxDate': return "CONVERT(datetime,'31.12.9999',(104))"
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
   * @param {string} dataType
   * @return {string}
   */
  uniTypeToDataBase (dataType) {
    switch (dataType) {
      case 'NVARCHAR': return 'NVARCHAR'
      case 'VARCHAR': return 'VARCHAR'
      case 'INTEGER': return 'INT'
      case 'BIGINT': return 'BIGINT'
      case 'FLOAT': return 'NUMERIC'
      case 'CURRENCY': return 'NUMERIC'
      case 'BOOLEAN': return 'NUMERIC'
      case 'DATETIME': return 'DATETIME'
      case 'TEXT': return 'NVARCHAR(MAX)'
      // Reasons to not use NTEXT:
      // 1. http://stackoverflow.com/questions/2133946/nvarcharmax-vs-ntext
      // 2. OLEDB provider raise 'Operand type clash: int is incompatible with ntext' for empty strings
      case 'BLOB': return 'VARBINARY(MAX)'
      default: return dataType
    }
  }
  /**
   * Convert database types to universal
   * @param dataType
   * @param {number} len
   * @param {number}  prec
   * @param {number}  scale
   * @return {String}
   */
  dataBaseTypeToUni (dataType, len, prec, scale) {
    dataType = dataType.toUpperCase()
    switch (dataType) {
      case 'BIGINT': return 'BIGINT'
      case 'DECIMAL':
      case 'NUMERIC':
        if (prec === 19 && scale === 4) {
          return 'FLOAT'
        }
        if (prec === 19 && scale === 2) {
          return 'CURRENCY'
        }
        if (prec === 1) {
          return 'BOOLEAN'
        }
        return 'NUMERIC'
      case 'INT': return 'INTEGER'
      case 'VARBINARY': return 'BLOB'
      case 'NVARCHAR': return (len === -1) ? 'TEXT' : 'NVARCHAR'
      case 'VARCHAR': return 'VARCHAR'
      case 'DATETIME': return 'DATETIME'
      case 'NTEXT': return 'TEXT'
      default: return dataType
    }
  }
  /**
   * Decode a default values for a attributes to a database-specific values
   * "maxDate", "currentDate", quoter strings
   * @param {TableDefinition} table
   */
  normalizeDefaults (table) {
    for (let column of table.columns) {
      if (column.defaultValue) {
        column.defaultValue = this.getExpression(column.defaultValue, column)
      }
    }
  }

  /** compare referenced tables with database metadata */
  compare () {
    for (let mustBe of this.refTableDefs) {
      if (!mustBe.doComparision) continue
      this.normalizeDefaults(mustBe)
      let asIs = _.find(this.dbTableDefs, {_upperName: mustBe._upperName})
      this.compareTableDefinitions(mustBe, asIs)
    }
  }

  /**
   * Compare the "Must Be" (as defined by entity metadata) table definition with database table definition
   * @param {TableDefinition} mustBe
   * @param {TableDefinition} asIs
   */
  compareTableDefinitions (mustBe, asIs) {
    let notEqualPK = false
    if (!asIs) { // table in database does not exists
      this.genCodeCreateTable(mustBe)

      // todo rename genCodeSetCaption -> addDBObjectDescription
      this.genCodeSetCaption(mustBe.name, null, mustBe.caption, null)
      for (let col of mustBe.columns) {
        this.genCodeSetCaption(mustBe.name, col.name, col.caption, null)
      }
    } else {
      if (asIs.caption !== mustBe.caption && mustBe.caption) {
        this.genCodeSetCaption(mustBe.name, null, mustBe.caption, asIs.caption)
      }

      this.compareColumns(mustBe, asIs)

      // drop PK if not equals or not exist in schema
      if (asIs.primaryKey && !mustBe.existOther(asIs.primaryKey.name) &&
         (!mustBe.primaryKey || !_.isEqual(asIs.primaryKey.keys, mustBe.primaryKey.keys))
      ) {
        this.genCodeDropPK(asIs.name, asIs.primaryKey.name)
      } else {
        if (asIs.primaryKey && mustBe.primaryKey && !strIComp(asIs.primaryKey.name, mustBe.primaryKey.name)) {
          this.genCodeRename(mustBe, asIs.primaryKey.name, mustBe.primaryKey.name, 'PK')
        }
      }

      // drop FK if not found in schema by name or not equal
      for (let asIsFK of asIs.foreignKeys) {
        if (mustBe.existOther(asIsFK.name)) continue
        let mustBeFK = mustBe.getFKByName(asIsFK.name)
        if (mustBeFK && mustBeFK.isDeleted) continue
        if (!mustBeFK || !_.isEqual(asIsFK.keys, mustBeFK.keys) || !strIComp(mustBeFK.references, asIsFK.references) ||
            asIsFK.updateAction !== 'NO_ACTION' || asIsFK.deleteAction !== 'NO_ACTION') {
          this.genCodeDropConstraint(asIs.name, asIsFK.name)
          if (mustBeFK) mustBeFK.isDeleted = true
        }
      }

      // drop indexes
      for (let asIsIndex of asIs.indexes) {
        if (mustBe.existOther(asIsIndex.name)) continue
        let mustBeIndex = mustBe.indexByName(asIsIndex.name)
        if (!mustBeIndex || asIsIndex.isForDelete ||
          !_.isEqual(mustBeIndex.keys, asIsIndex.keys) ||
          (mustBeIndex.isUnique !== mustBeIndex.isUnique) ||
          asIsIndex.isDisabled
        ) {
          if (!asIsIndex.isDeleted) {
            this.genCodeDropIndex(asIs, mustBe, asIsIndex,
              asIsIndex.isForDelete && !asIsIndex.isForDeleteMsg ? asIsIndex.isForDeleteMsg : null)
          }
          if (mustBeIndex) mustBeIndex.isDeleted = true
        }
      }

      // drop check constraint
      for (let asIsChk of asIs.checkConstraints) {
        if (mustBe.existOther(asIsChk.name)) continue
        let mustBeChk = mustBe.getCheckConstrIndexByName(asIsChk.name)
        if (!mustBeChk) {
          this.genCodeDropConstraint(asIs.name, asIsChk.name)
        }
      }

      // sequence
      // TODO - increase sequence value to indicate physical structure is changed
      // if (me.schema.sequences['S_' + asIs.name.toUpperCase()]){
      //    me.genCodeDropSequence('S_' + asIs.name.toUpperCase());
      // }
    }

    // create PK
    if (mustBe.primaryKey && ((asIs && !asIs.primaryKey) || notEqualPK || !asIs)) {
      this.genCodeCreatePK(mustBe)
    }

    // create fk
    for (let mustBeFK of mustBe.foreignKeys) {
      let asIsFK = asIs && asIs.getFKByName(mustBeFK.name)
      // && !constrFK.isRenamed
      if ((mustBeFK.isDeleted || !asIsFK) && !mustBeFK.isRenamed) {
        this.genCodeCreateFK(mustBe, mustBeFK)
      }
    }

    // create index
    for (let mustBeIndex of mustBe.indexes) {
      let asIsIndex = asIs && asIs.indexByName(mustBeIndex.name)
      if ((mustBeIndex.isDeleted || !asIsIndex) && !mustBeIndex.isRenamed) {
        this.genCodeCreateIndex(mustBe, mustBeIndex)
      }
    }

    // create check constraint
    for (let mustBeChk of mustBe.checkConstraints) {
      let asIsChk = asIs && asIs.getCheckConstrByName(mustBeChk.name)
      if (!asIsChk) {
        this.genCodeCreateCheckC(mustBe, mustBeChk)
      }
    }

    // TODO sequences must be on the schema level
    // mustBe.sequences.forEach(function (sequenceObj) {
    //   obj = me.schema.sequences[sequenceObj.name.toUpperCase()]
    //   if (!obj) {
    //     me.genCodeAddSequence(mustBe, sequenceObj)
    //   }
    // })

    // others
    _.forEach(mustBe.othersNames, (otherObj) => {
      if (!otherObj.expression && _.isString(otherObj.expression)) {
        if (!otherObj.existInDB) {
          this.DDL.others.statements.push(otherObj.expression)
        }
      }
    })
  }

  /**
   * Compare columns of Must Be - as in metadata and asIs - as in database TableDefinition definition adn generate a DDL statements
   * @param {TableDefinition} mustBe
   * @param {TableDefinition} asIs
   */
  compareColumns (mustBe, asIs) {
    let delayedNotNull
    // compare columns
    for (let asIsC of asIs.columns) {
      let sizeChanged = false
      let sizeIsSmaller = false
      let defChanged = false
      let allowNullChanged = false

      let mustBeC = mustBe.columnByName(asIsC.name)
      if (mustBeC) { // alter
        // caption
        if (mustBeC.caption !== asIsC.caption) {
          this.genCodeSetCaption(mustBe.name, mustBeC.name, mustBeC.caption, asIsC.caption)
        }
        // mustBeC exists in schema
        let typeChanged = !strIComp(mustBeC.dataType, asIsC.dataType)
        if (typeChanged && (asIsC.dataType === 'UVARCHAR' &&
          (mustBeC.dataType === 'NVARCHAR' || mustBeC.dataType === 'VARCHAR'))) {
          typeChanged = false
        }
        // noinspection FallthroughInSwitchStatementJS
        switch (asIsC.dataType) {
          case 'NVARCHAR':
          case 'UVARCHAR':
          case 'VARCHAR':
            sizeChanged = mustBeC.size !== asIsC.size
            sizeIsSmaller = (mustBeC.size < asIsC.size)
            break
          case 'NUMERIC':
            sizeChanged = mustBeC.size !== asIsC.size || mustBeC.prec !== asIsC.prec
            sizeIsSmaller = (mustBeC.size < asIsC.size) || (mustBeC.prec < asIsC.prec)
            break
        }
        defChanged = this.compareDefault(mustBeC.dataType, mustBeC.defaultValue, asIsC.defaultValue, mustBeC.defaultConstraintName, asIsC.defaultConstraintName)
        // TEMP
        if (defChanged) {
          console.debug('!CONSTRAINT %s !== %s ', mustBeC.defaultValue, asIsC.defaultValue)
        }
        allowNullChanged = mustBeC.allowNull !== asIsC.allowNull

        let asIsType = this.createTypeDefine(asIsC)
        let mustBeType = this.createTypeDefine(mustBeC)
        let mustBeColumn = `${mustBe.name}.${mustBeC.name}`
        if (typeChanged &&
          (mustBeC.dataType === 'INTEGER' || mustBeC.dataType === 'BIGINT' || mustBeC.dataType === 'NUMBER') &&
          (asIsC.dataType === 'NVARCHAR' || asIsC.dataType === 'VARCHAR' || asIsC.dataType === 'UVARCHAR' ||
          asIsC.dataType === 'NTEXT' || asIsC.dataType === 'NCHAR' || mustBeC.dataType === 'CHAR')) {
          this.addWarning(`Altering type for ${mustBeColumn} from ${asIsType} to ${mustBeType} may be wrong`)
        }
        if (typeChanged && (
            (asIsC.dataType === 'NTEXT') || (mustBeC.dataType === 'NTEXT') ||
            (asIsC.dataType === 'DATETIME') || (mustBeC.dataType === 'DATETIME') ||
            ((asIsC.dataType === 'BIGINT') && (mustBeC.dataType === 'INTEGER')) ||
            ((asIsC.dataType === 'NUMERIC') && (mustBeC.size > 10) && (mustBeC.dataType === 'INTEGER')) ||
            ((asIsC.dataType === 'NUMERIC') && (mustBeC.size > 19) && (mustBeC.dataType === 'BIGINT')) ||
            ((asIsC.dataType === 'NUMERIC') && (mustBeC.prec !== 0) && (mustBeC.dataType === 'BIGINT' || mustBeC.dataType === 'INTEGER'))
          )
        ) {
          this.addWarning(`Altering type for ${mustBeColumn} from ${asIsType} to ${mustBeType} may be wrong`)
        }

        if (sizeChanged && sizeIsSmaller) {
          this.addWarning(`The size or precision for field ${mustBeColumn} was reduced potential loss of data: ${asIsType} -> ${mustBeType}`)
        }
        if (defChanged && (asIsC.defaultValue != null)) {
          this.genCodeDropDefault(mustBe, asIsC)
        }
        if (defChanged && mustBeC.defaultValue) {
          this.genCodeSetDefault(mustBe, mustBeC)
        }
        if (!defChanged && (allowNullChanged || typeChanged)) {
          if (asIsC.defaultValue && this.dbConnectionConfig.dialect.startsWith('MSSQL')) {
            this.genCodeDropDefault(mustBe, asIsC)
          }
          if (mustBeC.defaultValue) {
            this.genCodeSetDefault(mustBe, mustBeC)
          }
        }
        if (typeChanged || sizeChanged || allowNullChanged) {
          this.genCodeAlterColumn(mustBe, asIs, mustBeC, asIsC, typeChanged, sizeChanged, allowNullChanged)
        }

        if (allowNullChanged && !mustBeC.allowNull) {
          delayedNotNull = false
          if (!mustBeC.allowNull) {
            delayedNotNull = true
            this.genCodeUpdate(mustBe, mustBeC, this.isUnsafe || mustBeC.defaultValue ? 'updConst' : 'updConstComment',
              mustBeC.defaultValue ? mustBeC.defaultValue : this.getColumnValueForUpdate(mustBe, mustBeC))
          }
          if (!delayedNotNull) {
            this.genCodeUpdate(mustBe, mustBeC, 'updNull')
          }
        }
        mustBeC.existInDB = true
      } else { // drop column
        if (asIsC.defaultValue) {
          this.genCodeDropDefault(asIs, asIsC)
        }
        this.addWarning(`Will drop field ${asIs.name}.${asIsC.name} ${this.createTypeDefine(asIsC.dataType)}. Check may be there is useful data!!!`)
        this.genCodeDropColumn(asIs, asIsC)
        asIsC.isDeleted = true
      }
    }

    // new columns
    for (let mustBeCol of mustBe.columns) {
      if (mustBeCol.existInDB || mustBeCol.name === 'rowid') continue // special case for sqlite3
      delayedNotNull = false
      // update by base mustBeCol
      if (mustBeCol.baseName) { // multi language column
        let lang = this.dbConnectionConfig.supportLang[0]
        var columnBase = ''
        if (lang === this.defaultLang) {
          columnBase = mustBeCol.baseName
        } else {
          columnBase = mustBeCol.baseName + '_' + lang
        }
        if (asIs.columnByName(columnBase)) {
          this.genCodeAddColumnBase(mustBe, mustBeCol, columnBase)
        } else {
          this.addWarning(`--  mustBeCol ${mustBe.name}.${columnBase} for base language not exists. Data for column ${mustBeCol.name} may not be initialized`)
          this.genCodeAddColumn(mustBe, mustBeCol)
        }
      } else {
        delayedNotNull = false
        if (!mustBeCol.defaultValue && !mustBeCol.allowNull) {
          delayedNotNull = true
          this.genCodeUpdate(mustBe, mustBeCol, this.isUnsafe ? 'updConst' : 'updConstComment', this.getColumnValueForUpdate(mustBe, mustBeCol))
        }

        this.genCodeAddColumn(mustBe, mustBeCol, delayedNotNull)
      }
      // caption
      this.genCodeSetCaption(mustBe.name, mustBeCol.name, mustBeCol.caption, null)
    }
  }

  /**
   * Generate a column type DDL part
   * @param {FieldDefinition} column
   * @return {string}
   */
  createTypeDefine (column) {
    let res = ' ' + this.uniTypeToDataBase(column.dataType)
    switch (column.dataType) {
      case 'NVARCHAR':
      case 'UVARCHAR':
      case 'VARCHAR':
        res += `(${column.size.toString()})`
        break
      case 'NUMERIC':
        res += `(${column.size.toString()}, ${column.prec.toString()})`
        break
    }
    return res
  }

  compareDefault (dataType, newValue, oldValue, constraintName, oldConstraintName) {
    if (!newValue && !oldValue) return false
    return (newValue !== oldValue) && (newValue !== "'" + oldValue + "'")
  }

  /**
   * @param {TableDefinition} table
   * @param {FieldDefinition} column
   * @return {*}
   */
  getColumnValueForUpdate (table, column) {
    let res
    let constraint = table.getFKByColumnName(column.name)
    if (constraint.length > 0) {
      constraint = constraint[0]
      return `(select min(id) from ${constraint.references})`
    }
    if (column.enumGroup) {
      return `(select min(code) from ubm_enum where egroup = '${column.enumGroup}')`
    }
    switch (column.dataType) {
      case 'NVARCHAR':
      case 'VARCHAR':
      case 'UVARCHAR':
      case 'INTEGER':
      case 'BIGINT':
      case 'FLOAT':
      case 'CURRENCY':
      case 'TEXT': res = 'ID'; break
      case 'BOOLEAN': res = '0'; break
      case 'DATETIME': res = this.getExpression('currentDate'); break
    }
    return res
  }
  generateStatements () {
    return this.DDL
  }
}

module.exports = DBSQL2012
