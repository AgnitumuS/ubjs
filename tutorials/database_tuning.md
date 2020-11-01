[[toc]]

##  General tips
 UnityBase designed to support different types of databases (Oracle, MS SQL, Postgre, ......).
 Even if you develop your application for some specific database, there is a chance that later
 you will need to migrate it to other database (for example from Oracle to Postgres).
 So, general tip:
 
 > Do not use database-specific features in your application
 
 DataStore - a server-side class for database access is highly optimized for speed.
 Usually it is faster to execute several simple queries from application server and
 do something inside JavaScript instead of write complex database query.
 
 In any cases developer must remember - usually there is __only ONE database__  server for application,
 but we can run multiple application servers and do load balancing.
 So in most cases performance bottleneck is a Database. 
 
 > Use the database for those things for which it was designed. Be [KISS](http://en.wikipedia.org/wiki/KISS_principle) -
 database for storing data, application server for data manipulation.
 
## Indexes
By default, UnityBase DDL generator create indexes for all attributes of type `Entity`
and unique indexes for attributes marked as `"isUnique": true`. 

In case developer need to add additional indexes it can be specified inside entity metadata `dbKeys` for **UNIQUE** indexes 
or inside `dbExtensions` for any other index type (including functional indexes for Oracle/Postgres)

### Optimizing like queries
Special index type **CATALOGUE** is available for optimizing queries with substring search:  
```sql
where field like "%substr%"
```

See also 'SUFFIXES index' below.

Such queries usually produced by UI Select/ComboBox controls while user typing a text to search or from Filters in Grid 
when `Contains` condition is selected. Database always do a table full scan for such queries, what may lead to performance
problems when the table is large (100 000 records or more).  

To avoid a full scan developer can define a "CATALOGUE" dbExtension as such (`myEntity.meta`):  
```json
  "dbExtensions": {
    "CIDX_TMD_CAPTION": {
      "type": "CATALOGUE",
      "definition": {
        "keys": {
          "caption": {}
        }
      }
    }
  }
```
where `CIDX_TMD_CAPTION` is a index name and `caption` is attribute on which substring queries are executed.

Depending on database type UBQL query:  
```javascript
UB.Repository('myEntyity').attrs('ID', 'caption').where('caption', 'like', 'substr').selectAsObject()
```
will be translated to SQL:  
 - Oracle
 DDL generator creates CTXSYS.ctxcat index and DML generator creates CATSEARCH where expression:  
```sql
// ? = 'substr*'
select ID, caption from myEntity where CATSEARCH(caption, ?, null) > 0 
```

 - PostgresSQL
 DDL generator creates [trigram](https://www.postgresql.org/docs/current/pgtrgm.html) index what work with ILIKE, so 
 statement will be:  
```sql
// ? = '%substr%'
select ID, caption from myEntity where caption ILIKE ? 
``` 

 - SQL Server (UB >= 5.18.15)
 DDL generator creates Full Text Search index for tables with CATALOGUE extension (one index for all keys). Statement will be:
```sql
// ? = '"substr*"'
select ID, caption from myEntity where CONTAINS(caption, ?) 
```  

### CATALOGUE index pre-requirements
#### for SQL Server
Default Full Text Catalogue must exist in the database. 
In case database is created using `ubcli initDB -create` it will be created automatically,
for other cases run a following statement:
```
CREATE FULLTEXT CATALOG ftsDefault AS DEFAULT;
```  

#### for Oracle
- Check Database Collation

Since `CTXCAT` indexes is not allowed for NVARCHAR2 columns DDL will convert such columns to VARCHAR2.
To store international characters correctly in varchar3 columns ensure Oracle database is created using UTF8 collation:  
```sql
SELECT PARAMETER, VALUE FROM nls_database_parameters WHERE PARAMETER = 'NLS_CHARACTERSET' 
```        
`NLS_CHARACTERSET` value should be *UTF[8|16]:  
```sql
NLS_CHARACTERSET            AL32UTF8
NLS_NCHAR_CHARACTERSET      AL16UTF16
```
 
- Enable Oracle Text

Oracle text should be enabled for Oracle instance
Can be checked by statement (under sys):  
```sql
SELECT comp_id, comp_name, status FROM dba_registry where COMP_NAME='Oracle Text'
```

See [Oracle Text Setup instruction](https://docs.oracle.com/cd/E11882_01/install.112/e27508/initmedia.htm#DFSIG269)    

- Grant Permissions

To create a `CTXCAT` index CTXAPP and CTX_DDL should be granted to role:   
```sql
GRANT RESOURCE, CONNECT, CTXAPP TO UBDF_FSS_TST;
GRANT EXECUTE ON CTXSYS.CTX_DDL TO UBDF_FSS_TST; 
```

### SUFFIXES index for non-words attributes
Catalogue indexes works perfectly for attributes what not contains abbreviations and acronyms, but otherwise it depends on 
RDBMS implementation. 

For Postgres, where such indexes are based on trigrams, or for Oracle with CXTCAT it **may work as expected**, for SQL server 
where CATALOGUE index is based on FTS - not.

For example in case attribute contains a document number, like `01-114-56-15(9370)` and we need to search by part of it,
FTS word breaker do not recognize "words" correctly, and search by phrase `14-56` do not return a number above.

For such attributes dbExtension of type `SUFFIXES` can be defined in meta file and UnityBase (>=5.18.15) tries to optimize `like %..%` 
to decrease SQL Server CPU consumption. 

With such extension:
 
 - DDL generator creates index organized table with 2 columns (tail, sourceID).
 - mStorage mixin fills this table by all possible suffixes of attribute value using splitChars as separator.
 - select queries with `like` condition on such attributes will use 'exists' in suffixes table where `tail line %?` 
   instead of 'like %?%' on the main table what prevents a full scan.
                  
A usage sample in meta file: 
```json
"dbExtensions": {
    "TST_DOCUMENT_CODE_SU": {
      "type": "SUFFIXES",
      "description": "Creates index organized table TST_DOCUMENT_CODE_SU(TAIL, sourceID)",
      "splitChars": "/-",
      "includeLast": false,
      "attribute": "code"
    }
}
```

In case `SUFFIXES` index is added to an entity which already contains data it must be filled using script generated using command:
```
ub ./node_modules/@unitybase/ubcli/lib/flow/genSuffixesIndexInitScript.js -u root [-env ubConfig.env] 
```

See `ub ./node_modules/@unitybase/ubcli/lib/flow/genSuffixesIndexInitScript.js -?` for other parameters

> !!WARNING: script should be executed while UB server is down!!
> Execution can take a long time (~10 second for each 500 000 rows)

**Please, verify such optimization on your data, since logic is not strict in this case**         

## Array binding
UnityBase can bind arrays (array of int64 or array of strings are supported) as parameters value:    
```javascript
UB.Repository('uba_user').attrs('ID').where('[ID]', 'in', [1, 2, 3]).select()
```

Depends on a RDBMS a resulting query became:

### Oracle array binding
UB server generates a query:  
```sql
SELECT A01.ID  FROM uba_user A01  WHERE A01.ID IN (SELECT column_value FROM table(CAST( :1 AS SYS.ODCINUMBERLIST)))
```

crates in-memory SYS.ODCINUMBERLIST / SYS.ODCIVARCHAR2LIST structure and pass it as a parameter value to bind.

We don't know how to run such query with parameters binding in plsql, without parameters:    
```sql
SELECT A01.ID  FROM uba_user A01  WHERE A01.ID IN (SELECT column_value FROM table(SYS.ODCINUMBERLIST(1, 2, 3)))
```   

### SQL Server array binding
UB server generates a query:  
```sql
SELECT A01.ID  FROM uba_user A01  WHERE A01.ID IN (SELECT * FROM ?)
```
creates in-memory IDList / StrList structure, fills it with passed array elements and binds to parameter value

To run such a query in management studio:  
```sql
-- if type not exists - create it
CREATE TYPE dbo.IDList AS TABLE (
  id bigint NULL
)
CREATE TYPE dbo.StrList AS TABLE (
  id nvarchar(255) NULL
)

declare @a dbo.IDList;
insert into @a (id) values (1), (2), (3);
SELECT A01.ID  FROM uba_user A01  WHERE A01.ID IN (SELECT * FROM @a)
```

### Postgres SQL array binding   
UB server generates a query:  
```sql
SELECT A01.ID  FROM uba_user A01  WHERE A01.ID=ANY($1)
```
transform passed array into Postgres array syntax string `{1,2,3}` and bind such string as parameter value

To execute a query in DBeaver tool press Ctrl+Enter, in binding dialog type "'{1,2,3}'" (in single quote)

## Oracle connection in depth

UnityBase works with Oracle using direct call to OCI (Oracle Call Interface library).
This allows to use all Oracle-specific features, minimize function calls and memory allocation and therefore work on maximum speed.

While creating a connection to the Oracle server UnityBase sets some specific connection properties.
This properties may not be like those, which set TOAD, PL/SQL Developer, DBeaver or other tools.
Therefore some queries work in different way inside UnityBase server and TOAD (for example).
But don't be confused - below we explain how to make them work in the same way:

### Session variables 
Set the same session parameters as UnityBase sets.

Look at server log - before the first database statement execution you can see instruction like `ALTER SESSION SET NLS........`;
This instruction set Locale Settings. You can change it in advanced connection configuration for your application.

Find all such instruction and execute it inside tool you use for work with database. Usually this is:  
```sql
ALTER SESSION SET NLS_DATE_FORMAT='YYYY-MM-DD-HH24:MI:SS';
ALTER SESSION SET NLS_NUMERIC_CHARACTERS = ". ";
ALTER SESSION SET NLS_COMP=LINGUISTIC;
ALTER SESSION SET NLS_SORT=BINARY_CI;
```

### Parameters in queries
UnityBase always try to parametrise queries. For example in case you execute query:  
```sql
store.runSQL('select * from somethere where code like :myCode:', {myCode: 'value%'});
```
end expect to see the same execution plane in your tool, parametrise it!
For example in DBeaver:   
```sql
// WRONG - the query plan may be different from what will be for the application server 
select * from somethere where code like 'value%'
// GOOD
select * from somethere where code like :myCode
```

When DBeaver asks for parameters value - type value% and set parameter type to nvarchar2

 > Always set parameter type for string parameters to NVARCHAR2. This is the way UnityBase pass string parameters to Oracle
 
#### Parameter types
When binding parameters for query UB applies this convention to call [OCIBundByPos](http://docs.oracle.com/cd/B10501_01/appdev.920/a96584/oci15r30.htm)

| JS Type | Oracle Type |
|---------|-------------|
| Int32   | SQLT_INT    |
| int64, float, double | SQLT_FLT |
| Date    | SQLT_DAT |
| String  | SQLT_STR (NVARCHAR2) |
| Blob    | SQLT_LVB |

For parameters of type `string` in case database table column is not of the type NVARCHAR2 to use a database index
you can cast parameter directly to type you need:  
```sql
...  where my_function(column) = cast(my_function(?) as varchar2(xxx))
```  

The same POSSIBLE but not mandatory  for Int64/Float type of parameter.
