[[toc]]

##  General tips
 UnityBase designed to support different types of databases (Oracle, MS SQL, Postgre, ......).
 Even if you develop your application for some specific database, there is a chance later
 you will need to migrate it to other database (for example from Oracle to Postgres).
 So, general tip:
 
 > Do not use database-specific features in your application
 
 DataStore - a server-side class for database access is highly optimized for speed.
 Usually it is faster to execute several simple queries from application server and
 do something inside JavaScript instead of write complex database query.
 
 In any case developer must remember - usually there is __only ONE database__  server for application,
 but we can run multiple application servers and do load balancing.
 So in most cases performance bottleneck is a Database. 
 
 > Use the database for those things for which it was designed. Be [KISS](http://en.wikipedia.org/wiki/KISS_principle) -
 use a database for storing data and application server for data manipulation.

## Database connection parameters
  Each RDBMS driver uses his own mechanism for connection parameters tuning. Below is a recommendations for production usage: 
  
### Postgres
  Most of the connection parameters can be configured using a [PostgreURL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING).
  UnityBase allows to set a full postgresURL in the `databaseName` connection parameter, in this case `serverName` should be empty:
```json
"connections": [{
    "name": "main",
    "driver": "PostgreSQL",
    "isDefault": true,
    "dialect": "PostgreSQL",
    "serverName": "",
    "databaseName": "postgresql://pg10.local:5432/ub5_autotest?tcp_user_timeout=3000",
    "userID": "%UB_DB_MAIN_USER%",
    "password": "%UB_DB_MAIN_PWD%"
    "supportLang": ["en", "uk"],
    "advSettings": "LibLocation=%UB_POSTGRE_LIB||libpq.so.5%" // for linux - can be empty or libpq.so.5; Windows = path to libpq.dll, for example D:/PostgreClient/10/x64/bin/libpq.dll
},...]
```  
  A connection parameters keywords are listed in [Section 33.1.2 of Postgres documentation](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-PARAMKEYWORDS)
  
  We recommend to sets a `tcp_user_timeout=3000` to disconnect ASAP in case TCP connection to database server is lost.
  A kernel default (~20 minutes) is too large.
  
#### Postgres messages locale
  UnityBase expect Postgres **error messages to be in English locale**. This uses to detect connection lost, constraint violation and so on.
  
  We **STRONGLY** recommend use `en_US.UTF-8` during Postgres setup (parameter is taken from OS locale settings,
  so better to switch your OS to English before Postgres server setup). 
  
  For existed Postgres installation locale can be forced by sets a `lc_locale=en_US.UTF-8` parameter in the `postgres.conf`.
  
  In case it is not possible to set an English locale in the `postgres.conf` it can be switched on the client side by 
  adding a `SET lc_messages TO 'en_US.UTF-8';` to the `executeWhenConnected` key of ubConfig connection parameters:
 ```json
 "connections": [{
    "driver": "PostgreSQL",
    ...
    "executeWhenConnected": ["SET lc_messages TO 'en_US.UTF-8'"]
 },...]
 ```
  
### MS SQL server (Linux)
  Under Linux ODBC is used for SQL Server connection. Connection parameters can be defined either in 
    - `/etc/odbcinst.ini` driver settings applied to all databases
    - `/etc/odbc.ini` per database for all users 
    - `~/.odbc.ini` per database for current user
  
  > home catalogue for `unitybase` unit is /opt/unitybase/apps
 
  For production, we recommend disabling of `Trace` and sets `KeepAlive` to 10 (second) in the `/etc/odbc.ini`. Example:
```
[my_production_database]
Driver=ODBC Driver 17 for SQL Server
Description=My production database for Awesome app
Server=tcp:ms16.unitybase.info,1405
Database=master
Trace=No
KeepAlive=10
```

ubConfig section example:

```json
"connections": [{
    "name": "main",
    "driver": "MSSQLODBC",
    "isDefault": true,
    "dialect": "MSSQL2012",
    "serverName": "my_production_database", // this is an entry in ~/.obdc.ini file
    "databaseName": "awesomeapp",
    "userID": "%UB_DB_MAIN_USER%",
    "password": "%UB_DB_MAIN_PWD%"
    "supportLang": ["en", "uk"]
},...]
```

### Oracle (UB server EE)
#### Setup Oracle client 
Download a zip version [Basic Light Package (ZIP)](https://www.oracle.com/database/technologies/instant-client/downloads.html)

**WARNING** - UB has __problems with BLOB/CLOB wile using Oracle client 21.x__.
At last with 21.3 while retrieve some BLOB content OCI returns `ORA-01013: user requested cancel of current operation`.
Please, **use Oracle client 19.x** on production!

Execute under `sudo`:

For instantClient 19
```bash
unzip instantclient-basiclite-linux.x64-19.6.0.0.0dbru.zip
mv instantclient_19_6 /usr/lib
cd /usr/lib/instantclient_19_6
rm -f ./libclntsh.so
ln -s libclntsh.so.19.1 libclntsh.so
pwd > /etc/ld.so.conf.d/oracle.conf
apt install libaio1
ldconfig
```

For instantClient 12
```bash
unzip instantclient-basiclite-linux.x64-19.6.0.0.0dbru.zip
unzip instantclient-basiclite-linux.x64-12.2.0.1.0.zip
mv instantclient_12_2 /usr/lib
cd /usr/lib/instantclient_12_2
ln -s libclntsh.so.12.1 libclntsh.so
pwd > /etc/ld.so.conf.d/oracle.conf
apt install libaio1
ldconfig
```

Full client with sqlplus can be found here: http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html

#### Setup Oracle connection
  Connection parameters can be specified in `tnsnames.ora` - in this case `serverName` in the ubConfig should be a TNS name,
  or directly in the TNS string passed to the `serverName`.
  
  Some connection parameters can be specified on the server-side in:
 - profiles (`select * from dba_profiles`)
 - [SQLNET](https://docs.oracle.com/cd/B19306_01/network.102/b14213/sqlnet.htm) 
  
  We recommend set `SQLNET.EXPIRE_TIME=10` to prevent a firewall/proxy/routers to terminate a idle connections.
  See [this article about keepalive](https://prashantatridba.wordpress.com/2015/12/05/sqlnet-and-tcp-keepalive-settings/) for details.

  For configuring SQLNET parameters for Oracle Instant Client see [How do I ensure that my Oracle Net files like "tnsnames.ora" and "sqlnet.ora" are being used in Instant Client?](https://www.oracle.com/ru/database/technologies/faq-instant-client.html)

ubConfig section example (connect without using tnsnames) :

```json
"connections": [{
    "name": "main",
    "driver": "Oracle",
    "isDefault": true,
    "dialect": "Oracle11",
    "serverName": "(DESCRIPTION = (ADDRESS = (PROTOCOL = TCP)(HOST = oraub.cloud.host)(PORT = 1521)) (CONNECT_DATA = (SERVER = DEDICATED) (SERVICE_NAME = oraub.cloud.local)))",
    "userID": "%UB_DB_MAIN_USER%",
    "password": "%UB_DB_MAIN_PWD%"
    "supportLang": ["en", "uk"],
    "advSettings": "CARDINALITY_IN",  // sets a CARDINALITY hint for array binding
    "executeWhenConnected": ["ALTER SESSION SET NLS_COMP=LINGUISTIC", "ALTER SESSION SET NLS_SORT=BINARY_CI"] // force case insensitive LIKE
},...]
```

### MySQL server (Linux)
> ORM currently do not support MySQL, only direct SQL execution is allowed

Under Linux ODBC is used for MySQL connection.

#### Setup
```shell
docker run --name tst-mysql -p3306:3306 -e MYSQL_ROOT_PASSWORD=root -d mysql:8
```

Client libs

In case [official MySQL ODBC package](https://dev.mysql.com/doc/connector-odbc/en/connector-odbc-installation-binary-deb.html)
not installed correctly, the only file required is `libmyodbc8w.so` (copy it from deb package into `/usr/lib/x86_64-linux-gnu/odbc`)

In `/etc/odbcinst.ini`
```shell
[MySQL]
Description= MySQL ODBC Driver
Driver=/usr/lib/x86_64-linux-gnu/odbc/libmyodbc8w.so    
Usagecount=1
```

in `~/.odbc.ini`
```shell
[my_server]
Description = Test DB
Driver = MySQL
SERVER = 127.0.0.1
USER = root
PASSWORD = root
PORT = 3306
DATABASE = MYSQLTEST
```

ubConfig section example:

```json
"connections": [{
    "name": "mysql",
    "driver": "MySQL",
    "isDefault": false,
    "dialect": "MySQL",
    "serverName": "my_server", // this is an entry in ~/.obdc.ini file
    "databaseName": "MYSQLTEST",
    "userID": "root",
    "password": "root",
    "supportLang": ["en"]
},...]
```

Verify connection
```shell
ubcli execSql -c mysql -sql "select * from mysql.user" -withResult -outputRes
```

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
UB.Repository('myEntyity')
  .attrs('ID', 'caption')
  .where('caption', 'like', 'substr')
  .selectAsObject()
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
If database created by `ubcli initDB -create`, the catalogue created automatically,
for other cases run the following statement:
```
CREATE FULLTEXT CATALOG ftsDefault AS DEFAULT;
```  

#### for Oracle
- Check Database Collation

Since `CTXCAT` indexes are not allowed for NVARCHAR2 columns DDL will convert such columns to VARCHAR2.
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

> Connection `advSettings` can contain `CARDINALITY_IN` directive.
>   If enabled then ORM adds `/*+ CARDINALITY(t1, P) */` hint for IN sub-queries.
>
> P value depends on array length L:  L<10 => P = 1; L < 50 => P=10 else P = 100 

Query with cardinality hint 
```sql
SELECT A01.ID FROM uba_user A01 WHERE A01.ID IN (SELECT /*+ CARDINALITY(t1, P) */ column_value FROM table(SYS.ODCINUMBERLIST(1, 2, 3)))
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

Just after connect to Oracle server UnityBase sets some specific connection properties.
This properties may not be like those, which set TOAD, PL/SQL Developer, DBeaver or other tools.
Therefore, some queries work in different way inside UnityBase server and TOAD (for example).
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

## Limit a resources usage
For a Web application (especially for multitenancy apps) it's always a good idea to limit a DB server resources for statements.
In other case several "bad" statements what retrieve a huge amount of data or run's too long etc. will slow down all users.

> Is limits is exceeded, US (stating from 5.20.1) throws a `<<<ERR_RESOURCE_LIMITS_EXCEED>>>` error 

### Fetch size limitation
Using `ubConfig.connections.connName.statementMaxMemoryMb` a maximum fetch size for DataStore can be limited.
If a result set exceeds this limit, an Exception is raised. This avoids unexpected OutOfMemory errors and prevents server crash
when incorrect statement what returns too many rows or too big content are executed.

Default value is 50 (50 megabytes) what enough for most cases. For multitenancy apps we recommend decreasing this limit
to 10, for instances what runs a schedulers limit can be increased.

### Statement execution time limitation

Statement execution time limitation depends on used RDBMS and implemented either using connection parameters,
or statement in the `executeWhenConnected` connection config section. 

> Since default HTTP timeout is 30 second, statement execution time should be smaller, recommended value is
> 10 sec or less and depends on business logic implementation.

We recommend do use a `UB_DB_STATEMENT_TIME_LIMIT` environment variable for timeouts

#### Postgres
Can be implemented by set a [statement_timeout](https://www.postgresql.org/docs/9.4/runtime-config-client.html#GUC-STATEMENT-TIMEOUT)
session variable *in milliseconds*
```json
"executeWhenConnected": [
      ...,
      "SET statement_timeout=%UB_DB_STATEMENT_TIME_LIMIT||10000%"
    ]
```

> Postgre error message contains: "canceling statement due to statement timeout"

#### MS SQL Server
MS SQL server have a global query timeout (default is 600 sec) what can be changed using
[remote query timeout](https://docs.microsoft.com/en-us/sql/database-engine/configure-windows/configure-the-remote-query-timeout-server-configuration-option?view=sql-server-ver15)
option.

A session level alternative is implemented for ODBC connections using `STATEMENT_TIME_LIMIT` parameter for connection `advSettings`.
Value is *in seconds*.

```json
"connections": [{
    "name": "main",
    "driver": "MSSQLODBC",
    "dialect": "MSSQL2012",
    ....
    "advSettings": "STATEMENT_TIME_LIMIT=%UB_DB_STATEMENT_TIME_LIMIT||0%",
}]
```

> SQL server error message contains "Query timeout expired"
 
#### Oracle
Implemented using [Oracle resources manager](https://oracle-base.com/articles/12c/resource-manager-enhancements-12cr1)

First, DBA should create a consumer group and resource plan for each Oracle instance and grant a `switch_consumer_group` permission to 
user used by UB to connect to database (`userID` parameter value in Oracle connection config).

This can be done using script below (replace a `userID` in the `GRANT_SWITCH_CONSUMER_GROUP` statement by a real username before execution):
```sql
ALTER SYSTEM SET RESOURCE_MANAGER_PLAN ='';

--drop plan and group 
BEGIN
  dbms_resource_manager.clear_pending_area();
  dbms_resource_manager.create_pending_area();
  dbms_resource_manager.DELETE_PLAN ('EXEC_TIME_LIMIT_PLAN');
  dbms_resource_manager.DELETE_CONSUMER_GROUP ('GROUP_WITH_LIMITED_EXEC_TIME');
  DBMS_RESOURCE_MANAGER.VALIDATE_PENDING_AREA;
  DBMS_RESOURCE_MANAGER.SUBMIT_PENDING_AREA();
END;
/
--create a consumer group for UB registers users 
BEGIN
  SYS.DBMS_RESOURCE_MANAGER.clear_pending_area();
  SYS.DBMS_RESOURCE_MANAGER.create_pending_area();
  SYS.DBMS_RESOURCE_MANAGER.create_consumer_group(
    CONSUMER_GROUP => 'GROUP_WITH_LIMITED_EXEC_TIME',
    COMMENT        => 'This is the consumer group that has limited execution time per statement',
    MGMT_MTH       => 'ROUND-ROBIN',
    CATEGORY        => 'OTHER');
  
  SYS.DBMS_RESOURCE_MANAGER.VALIDATE_PENDING_AREA;  
  SYS.DBMS_RESOURCE_MANAGER.submit_pending_area();
END;
/
--create a resource plan for what will cancel the current SQL if it runs for more than 10 sec
BEGIN
  SYS.DBMS_RESOURCE_MANAGER.clear_pending_area();
  SYS.DBMS_RESOURCE_MANAGER.create_pending_area();
  SYS.DBMS_RESOURCE_MANAGER.create_plan(
      plan                         => 'EXEC_TIME_LIMIT_PLAN',
     mgmt_mth                      => 'EMPHASIS',
     sub_plan => FALSE,
      comment                      => 'Resource plan what limits statement execution time to 10 sec');
  SYS.DBMS_RESOURCE_MANAGER.create_plan_directive(
   plan                       => 'EXEC_TIME_LIMIT_PLAN',
   group_or_subplan           => 'OTHER_GROUPS',
   COMMENT=>'leave others alone',
    CPU_P1=>100);
  SYS.DBMS_RESOURCE_MANAGER.VALIDATE_PENDING_AREA;  
  SYS.DBMS_RESOURCE_MANAGER.submit_pending_area();
END;
/
--create plan directive 
BEGIN
  SYS.DBMS_RESOURCE_MANAGER.clear_pending_area();
  SYS.DBMS_RESOURCE_MANAGER.create_pending_area();
  DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
    PLAN             => 'EXEC_TIME_LIMIT_PLAN',
    GROUP_OR_SUBPLAN => 'GROUP_WITH_LIMITED_EXEC_TIME',
    COMMENT          => 'Kill statement after exceeding total execution time',
    SWITCH_GROUP     => 'CANCEL_SQL',
    -- SWITCH_TIME      => 10, -- 10 CPU seconds limitation 
    SWITCH_ELAPSED_TIME => 10, -- 10 seconds limitation
    SWITCH_ESTIMATE=>false,
    SWITCH_FOR_CALL=> TRUE);
  SYS.DBMS_RESOURCE_MANAGER.submit_pending_area();
END;
/
-- grant SWITCH_CONSUMER_GROUP to user
BEGIN
  SYS.DBMS_RESOURCE_MANAGER.clear_pending_area();
  SYS.DBMS_RESOURCE_MANAGER.create_pending_area();
  SYS.DBMS_RESOURCE_MANAGER_PRIVS.GRANT_SWITCH_CONSUMER_GROUP('userID', 'GROUP_WITH_LIMITED_EXEC_TIME', false); -- userID should be replaced BY user name used to connect to DB 
  SYS.DBMS_RESOURCE_MANAGER.submit_pending_area();
END;
-- enable new plan
ALTER SYSTEM SET RESOURCE_MANAGER_PLAN ='EXEC_TIME_LIMIT_PLAN';
GRANT EXECUTE ON SYS.DBMS_SESSION TO userID; -- userID should be replaced BY user name used to connect to DB 
```

After resource plan is created connection should be configured as such:

```json
"executeWhenConnected": [
      ...,
      //#ifdef(%UB_DB_STATEMENT_TIME_LIMIT%)
      "DECLARE prev_group VARCHAR2(30); BEGIN DBMS_SESSION.switch_current_consumer_group ('%UB_DB_STATEMENT_TIME_LIMIT%', prev_group, TRUE); END;"
      //#endif
    ]
```

and environment variable `UB_DB_STATEMENT_TIME_LIMIT` sets to consumer group name we create above
```UB_DB_STATEMENT_TIME_LIMIT=GROUP_WITH_LIMITED_EXEC_TIME```

> Oracle error message is: 
>  - `ORA-00040: active time limit exceeded - call aborted`  in case `SWITCH_TIME` resource plan parameter exceed
>  - `ORA-56735: elapsed time limit exceeded - call aborted` in case `SWITCH_ELAPSED_TIME` resource plan parameter exceed
 