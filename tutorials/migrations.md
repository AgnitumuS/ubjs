[[toc]]

# Application lifecycle and data migrations
Migrations are a convenient way to alter your database schema and data over time in a consistent and easy way. 

UnityBase already contains a powerful tool what helps to:
  - migrate a database structure - `ubcli generateDDL`
  - migrate a data `ub-migrate` 

Both of them check a current state of tables/data and tries to bring them to the reference version.
For database tables reference version is a `*.meta` files, for data - `_data/*.yml` files.

But sometimes these tools can't do his job automatically. For example, we decide to rename an entity.
In this case DDL generator creates a new table for a new entity. The old one is remains untouched,
and this is not the thing we expect. So we need to provide a pre-generate DDL hook and rename our table manually 
using `alter table .. rename to ..` or similar.

Another example is changes in data not covered by `ub-migrate`. Consider we have a Firm entity with 2 attributes (code, name)
and need to update all Firm names and add a code part to the beginning of name (to simplify selection).
In this case good solution is to write a custom JS what solves this task and run it during version upgrade.  
 
## Creating a Migration

### Naming conventions
All migrations are stored in `_migrate` sub-folder in the model directories (for historical reasons _migrations name is busy) 

Individual migration can be a folder or a file. Each migration MUST starts from model version in format `XXXYYYZZZ` where:
  - XXX-major
  - YYY-minor
  - ZZZ-patch
All parts are padded by 0 to be a three letter. For example migration to a model version `2.15.1` MUST starts from `002015001`.

In case migration is a folder all files inside a folder SHOULD begin from 3 digits - and order in which it will be applied.
Example:

```
/myModel
  /_migrate
    001001001-initial.sql       # a single file migration to myModel@1.1.1 
    /001001002                  # a multifile migration to myModel@1.1.2
      010-impl-RST-1222_SPGetBallance.sql    # files inside folder execuded in lexical order
      020-fixCaptions.js
      030-massiveCaptionUpdate.sql  
```

> TIP: files and folders what starts from `_` are ignored

### Migrations under development
During development, it is unknown when our brunch will be merged into main brunch and in which version
our migrations will be released. To solve this problem (and prevent possible merge conflicts) it's recommended to
begin migrations names with `unreleased`:

```
/myModel
  /_migrate
    001001001-initial.sql       
    /001001002                  
      010-alter_my_table.sql
      ...  
    /unreleased                 # unreleased multifile migration (folder)
      010-fix-UBJS-1223.sql    
    unreleased-fixUBA-1255.js   # unreleased single file migration  
```

For packages what published in the registry a `@unitybase/update-changelog` (TODO) lifecycle hook will rename such migrations 
to a version what actually publishing. Developer SHOULD add such hook call to "scripts.version" section of package.json:
```
"scripts": {
  "version": "update-changelog && git add CHANGELOG.md"  !! TODO - git add or git mv
}
```

For models that are not published in the registry (usually sub-folders of `models` folder) a version build CI script
SHOULD rename an unreleased migration. 

> TIP: `ub-pack` lifecycle script will check version don't contain an unreleased migration (TODO)

### Specifying DB Connection for SQL script
In complex application one model can store its data in the several DB connections (not recommended).

By default, *.sql files are executed using default DB connection (`isDefault: true` in connections section of ubConfig).
To execute a script in specific connection file (or folder) name should contain connection name wrapped in #. Example:
```
 /myModel
   /_migrate
     /unreleased                 
       010#rrpUb#fix-UBJS-1223.sql          # if connection with name `rrpUb` exists this script will be executed there
       020-fix-VP-3_addVP_PP_table.sql      # and this - in default connection
     /unreleased#rst#                       # all SQL files from this folred will be executed in `rst` connection
       010-some.sql                                
 ``` 

### JS file requirements

Each *.js file MUST export a function. This function will be called by migrate with 4 parameters:
```javascript
/**
 * Migrate a CDN model to 2.13.15 (update cdn_person captions)
 * @param {SyncConnection} conn
 * @param {Object<string, DBConnection>} dbConnections
 * @param {Object} dbVersions
 * @param {{hooks: Array<{model: string, hook: Object<string, function>}>, files: Array<{model: string, name: string, fullPath: string, sha: string}>}} migrations
 */
module.exports = function giveItAGoodNameWhichExplainWhatFunctionDoes ({ conn, dbConnections, dbVersions, migrations }) {
  // do something here
}
```
 
 
## Applying a Migrations
  
```
npx ubcli migrate -u root
```

`migrate` execute only scripts what not exists in `ub_migration` table.
 
Before any operations `migrate` verify SHA sums (+modelName) is matched for intersection of all files in `ub_migration` table
and all `_migrate` folder files (excluding files what starts from `_`). If any file checksum differ then migration
**is fails** (neither generateDDL nor ub-migrate nor any `_mirgate` script are not executed).
  

## Migration hooks

### Using naming convention
Migration file or folder name can contain a `_beforeDDL_` or `_afterDDL_` substring. Such files are applied before/after DDL generation. 

> _beforeDDL_ js hook is called with `conn === null` because on this stage HTTP connection to the server is impossible  
 
### Using per-model `_hooks.js`
A `/_migrate/_hooks.js` file for each model can exports migrations hook. 
The possible hooks are:
  - `beforeGenerateDDL`     # a good place for alter database objects
    - here generateDDL is executed
  - `afterGenerateDDL`      # a good place for massive update columns
    -  here ub-migrate is executed
  - `filterFiles`           # remove some scripts from execution (called in reverse order of models, should mutate a `migtarions.files` array)
    - here sql and js form `_migrate` folder are executed
  - `finalize`              # executed after any migration

A hook signature is:
```javascript
/**
 * before generate DDL hook example
 * @param {SyncConnection} conn
 * @param {Object<string, DBConnection>} dbConnections
 * @param {Object} dbVersions
 * @param {{hooks: Array<{model: string, hook: Object<string, function>}>, files: Array<{model: string, name: string, fullPath: string, sha: string}>}} migrations
 */
function beforeGenerateDDL ({ conn, dbConnections, dbVersions, migrations }) {
  // do something here
}
```

> beforeGenerateDDL hook is called with conn: null because on this stage HTTP connection to the server is impossible 
  
   