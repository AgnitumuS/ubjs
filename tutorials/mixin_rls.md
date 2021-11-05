[[toc]]

# Mixin RLS - Row Level Security

 Allows to add a server-side filtering conditions in addition to client side `where`. Scenarios where RLS might be useful:
* Show only tasks assigned to a current user, disallow to see any other tasks
* Show only menu items, available to the roles of the current ser
* Show only documents, where the current user is a participant

  Row-level security filters row, but that is not just filtering functionality. Use RLS, when application needs not just
filter rows for user in specific scenarios, but consistently apply data visibility rules across application.

To just filter rows on a specific form, use `Repository.where` parameter of query.

# Configuring RLS for an entity

Configuration of RLS consists of the following steps:
 * Define a function, which builds an RLS expression
 * Configure entity

## Functional RLS (recommended)

Starting from UB 5.18.4 RLS cal be defined as a function what accept a `ctxt: ubMethodParams` and should modify
 an `ctxt.mParams`. RLS mixin search for function starting from a global scope, so better to place such functions into
 entity module (what exposed into global by UB server), or use `UB.ns('NS.for.your.function')` to create a namespace.
 
Let's create an RLS function inside RLS namespace (function already exist, here we copy it code for tutorial):   
```javascript
/**
 * For members of Admin group and for users `root` and `admin` do nothing.
 *
 * For other users adds condition what
 *  - either current user is a record owner
 *  - OR user or one of user role in `{$entity}_adm` sub-table
 *
 * @param {ubMethodParams} ctxt
 */
RLS.allowForAdminOwnerAndAdmTable = function (ctxt) {
  // skip RLS for admin and root and Admin group member
  if (uba_common.isSuperUser() || Session.uData.roleIDs.includes(uba_common.ROLES.ADMIN.ID)) return

  const mParams = ctxt.mParams
  let whereList = mParams.whereList
  if (!whereList) {
    mParams.whereList = {}
    // whereList = mParams.whereList = {} assign a {} to whereList instead of TubList instance
    whereList = mParams.whereList
  }
  // either current user is record owner
  const byOwner = whereList.getUniqKey()
  whereList[byOwner] = {
    expression: '[mi_owner]',
    condition: 'equal',
    value: Session.userID
  }
  // or User or one of user role in _adm sub-table
  const byAdm = whereList.getUniqKey()
  const eName = ctxt.dataStore.entity.name
  const subQ = Repository(`${eName}_adm`)
    .where('[admSubjID]', 'in', [Session.userID,...Session.uData.roleIDs])
    .correlation('instanceID', 'ID')
    .ubql()
  whereList[byAdm] = {
    expression: '',
    condition: 'subquery',
    subQueryType: 'exists',
    value: subQ
  }
  const logic = `([${byOwner}]) OR ([${byAdm}])`
  if (!mParams.logicalPredicates) {
    mParams.logicalPredicates = [logic]
  } else {
    // ubList.push NOT WORK!
    mParams.logicalPredicates = [...mParams.logicalPredicates, logic]
  }
}
```

and use it as a `rls.func` in `ubm_navshortcut` entity:  
```json
{
  "caption": "Shortcut",
  "description": "Metadata for build navbars",
  "connectionName": "",
  "descriptionAttribute": "caption",
  "attributes": [
    {
      "name": "caption",
      "dataType": "String",
      "size": 255,
      "caption": "Shortcut name",
      "allowNull": false,
      "isMultiLang": true
    }
  ],
  "mixins": {
    "mStorage": {
      "simpleAudit": true,
      "safeDelete": true
    },
    "rls": {
      "func": "RLS.allowForAdminOwnerAndAdmTable"
    }
  }
}
```

Now every time client sends a UBQL for `ubm_navshortcut` entity server add's a where conditions depending on user roles
what verify row permission in `ubm_navshortcut_adm` entity.

The benefits of functional (func) RLS over expression based RLS are:
 - `func` is evaluated once and called many time, expression `eval`for every call
 - `func` adds a where part in DB-independent way
 - `in` condition with parameters binding can be used inside `func` rls (speed up query execution because of prepared statement cache)  

  
## Expression RLS (before UB 5.18.4. deprecated)
### Define a function, which builds an RLS expression
 
Add a function inside the `.js` file created, which would return SQL expression to filter the rows as required by RLS rules for this entity.
Code example of what the function should look like:  
```javascript
const uba_common = require('@unitybase/uba/modules/uba_common')
const Session = require('@unitybase/ub').Session

function getAdmSubjIDs() {
 return [
  Session.userID,
  ...Session.uData.groupIDs,
  ...Session.uData.roleIDs
 ];
}

function rlsSql() {
 if (uba_common.isSuperUser()) return '1=1';

 return `([recipientID] = :(${Session.userID}): OR EXISTS (
SELECT 1 FROM msg_Message_adm msgAdm 
  WHERE msgAdm.objectID = [ID]
  AND msgAdm.subjectID IN (${getAdmSubjIDs().join(',')})
)`
}
msg_Message.rlsSql = rlsSql
```

Here are some points worth mentioning the code sample above:
* The SQL expression will be used inside `WHERE` clause of request.
  It will be applied to any `SELECT` and `UPDATE` statement done for the entity.
* The SQL shall be compatible with database vendors supported by UnityBase: SQL Server, Oracle, PostgreSQL and SqLite3,
  so avoid using vendor-specific features.
* Each entity has a module object, available in global context. This means, that for entity defined in `msg_Message.meta` file
  there will be `msg_Message` global variable, available in any server-side script, without `require`.
  Our goal is to add to that object a function, which would return the RLS SQL expression.
* Notice the syntax `:(${Session.userID}):` above - it is how the result query will be parameterized.
  Just insert a value embraced with colons and braces, and it will be added to result database request as a parameter, instead of inline value.
  * It is considered to be a good practice to parameterize queries.
  * Notice that array is not parameterized - that is because arrays parametrization is not supported yet.

### Configure entity

Add `rls` configuration to the `mixins` section of the `.meta` file:  
```json
"mixins": {
  "rls": {
   "expression": "msg_Message.rlsSql()"
  }
 }
```

The value of `expression` property is just a javascript expression returning SQL.

### Administrative Subjects

Notice that the sample defines `getAdmSubjIDs` function, which returns list of subjects of the current user.
Subject is a terminology used in [Access Control List](https://en.wikipedia.org/wiki/Access_control_list) paradigm.
In general subject is answer on question "who?".

In UnityBase, subjects are users, roles, groups. If UnityBase `ORG` model is used to manage organizational structure - it adds
more subject types, like employees and organizational units.  It is also possible to add your own custom subject types.

Using administrative subjects to define RLS is extremely flexible and powerful. 

A user may represent a series of subjects:
* the user itself
* any role assigned to the user
* any group the user is member of


All we need to check to decide if the row should be visible to a user - is whether row is visible to any of the subjects the user represents.


Union of all subjects are stored in `uba_subject` entity - all the users, groups and roles are stored and maintained here.
So, when create a mapping entity, which defines relation between objects and subjects - the ACL entity,
its `subjectID` attribute usually points to the `uba_subject` entity.

Example of ACL entity:  
```json
{
	"connectionName": "",
	"sqlAlias": "msgAdm",

	"caption": "Message ACL",
	"descriptionAttribute": "subjectID",

	"mixins": {
		"mStorage": {
			"simpleAudit": true,
			"safeDelete": false
		}
	},

	"attributes": {
		"objectID": {
			"dataType": "Entity", "associatedEntity": "msg_Message", "cascadeDelete": true,
			"caption": "Object"
		},
		"subjectID": {
			"dataType": "Entity", "associatedEntity": "uba_subject",
			"caption": "Subject"
		}
	}
}
```

# Using `Session` object

There is an object `Session`.  The following properties are useful for developing functions, which build RLS expression:
* `userID`
* `userRoleNames` - a string - comma-separated role names. Not very usable "as is", but role membership may be
  checked without any query to DB by role name using the following code snippet:  
```javascript
const Session = require('@unitybase/ub').Session
Session.hasRole('roleName')
```
* `uData` - a structure with other useful properties like:
  * `uData.roleIDs` - array of numbers - IDs of roles assigned to the current user
  * `uData.groupIDs` - array of numbers - IDs of groups the current user is member of
