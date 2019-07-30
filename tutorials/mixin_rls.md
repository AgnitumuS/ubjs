[[toc]]

# Mixin RLS - Row Level Security

Row-level security (RLS) is functionality built into UnityBase server core, which allows to filter rows available for the current user.

Scenarios where RLS might be useful:
* Show only tasks assigned to a current user, disallow to see any other tasks
* Show only menu items, available to the roles of the current ser
* Show only documents, where the current user is a participant

## When to use RLS

Row-level security filters row, but that is not just filtering functionality.  Use RLS, when application needs not just filter rows for user in specific scenarios, but consistently apply data visibility rules across application.

To just filter rows on a specific form, use `whereList` parameter of query.

## Configuring RLS for an entity

Configuration of RLS consists of the following steps:
* Create a javascript file for the entity
* Define a function, which builds a RLS expression
* Configure entity

## Create a javascript file for the entity

UnityBase entities are defined as `.meta` files, in json format.  Existance of `.meta` file is enough to make the entity function.  But, in case, when any custom functionality is needed for an entity, a complimentary `.js` file is needed.
So, if `.js` file not exists yet created one.  For example, for `msg_Message.meta` file, create a `msg_Message.js` file.

## Define a function, which builds a RLS expression

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

 return `([recipientID] = :(${Session.userID}): OR EXISTS ` +
  '(' +
  'SELECT 1 FROM msg_Message_adm msgAdm ' +
  'WHERE msgAdm.objectID = [ID] ' +
  `AND msgAdm.subjectID IN (${getAdmSubjIDs().join(',')})` +
  '))';
}
msg_Message.rlsSql = rlsSql
```

Here are some points worth mentioning about the code sample above:
* The SQL expression will be used inside `WHERE` clause of request.   It will be applied to any `SELECT` and `UPDATE` statement done for the entity.
* The SQL shall be compatible with database vendors supported by UnityBase: SQL Server, Oracle, PostgreSQL and SqLite3, so avoid using vendor-specific features.
  * An exception to this rule is when the the database vendor to be used in known in advance and the code won't be used by projects using other database vendors.
* Each entity has a module object, available in global context.  This means, that for entity defined in `msg_Message.meta` file, there will be `msg_Message` global variable, available in any server-side script, without `require`.  Our goal is to add to that object a function, which would return the RLS SQL expression.
* Notice the syntax `:(aValueHere):` - it is how the result query will be parameterized.  Just insert a value embraced with colons and braces and it will be added to result database request as a parameter, instead of inline value.
  * It is considered to be a good practice to parameterize queries.
  * Notice that array is not parameterized - that is because arrays parameterization is not supported yet.

## Administrative Subjects

Notice that the sample defines `getAdmSubjIDs` function, which returns list of subjects of the current user.
Subject is a terminology used in [Access Control List](https://en.wikipedia.org/wiki/Access_control_list) paradigm.  In general subject is answer on question "who?".

In UnityBase, subjects are users, roles, groups.  If UnityBase `ORG` model is used to manage organizational structure - it adds more subject types, like employees and organizational units.  It is also possible to add your own custom subject types.


Using administrative subjects to define RLS is extremely flexible and powerful. 


A user may represent a series of subjects:
* the user itself
* any role assigned to the user
* any group the user is member of


All we need to check to decide if the row should be visible to a user - is whether row is visible to any of the subjects the user represents.


Union of all subjects are stored in `uba_subject` entity - all the users, groups and roles are stored and maintained here.
So, when create a mapping entity, which defines relation between objects and subjects - the ACL entity, its `subjectID` attribute usually points to the `uba_subject` entity.

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

## Using `Session` object

There is an object `Session`.  The following properties are useful for developing functions, which build RLS expression:
* `userID`
* `userRoleNames` - a string - comma-separated role names.  Not very usable "as is", but role membership may be checked without any query to DB by role name using the following code snippet:

```javascript
const Session = require('@unitybase/ub').Session
Session.uData.roles.split(',').find(r => r === 'roleName') != null
```
* `uData` - a structure with other usefule properties like:
  * `uData.roleIDs` - array of numbers - IDs of roles assigned to the current user
  * `uData.groupIDs` - array of numbers - IDs of groups the current user is member of


## Configure entity

Add `rls` configuration to the `mixins` section of the `.meta` file:
```
"mixins": {
  "rls": {
   "expression": "msg_Message.rlsSql()"
  }
 }
```

The value of `expression` property is just a javascript expression returning SQL.  Because we defined the `rlsSql` function and added it to globally available entity module object, it is available to be used here.