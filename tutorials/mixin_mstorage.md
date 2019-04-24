[[toc]]

# Mixin **mStorage** - Implements CRUID operations with entities (ORM)

## CRUID
  Mixin adds `select`, `insert`, `update`, `delete` and `addnew` methods to entity.
  
  TODO - samples

## Optimistic locking

### Introduction
Let's say we have entity `m_balance` with 2 attributes - `person` and `amount` and one row in DB (`Alice`, 100$).

Manager Alex wants to decrease Alice's amount by 10$ and manager Bob - by 5$. As a result Alice's amount should be 85$.

 1. at 12:00 manager Alex opens Alice's balance in browser for editing.
  He sees that the initial amount is 100$, decreases it by 10$ to 90$ and goes to drink coffee without saving the form.
 2. on 12:01 user Bob opens the same form in his browser for editing.
 He also sees that the initial amount is 100$ (because Alex did not save the record), decreases it by 5$ to 95$ and saves the record. 
 3. at 12:10 Alex returns from coffee break, sees that he has not saved the form (with amount 90$) and saves it.

As a result Alice's amount is equal to 90$ in the database and **this is not a result we expect** :(

But if we enable **Optimistic locking** feature for `m_balance` entity, then on the step 3 Bob receives a message
_"Record was modified by another user"_. In this case he will refresh the form, see the new amount 90$ modified by Alex,
decrease it by 5$ to 85$ and save new amount.
    
### Implementation details
#### Configuration
To enable Optimistic locking for entity set `mixins.mStorage.simpleAudit` to `true` in entity *.meta file:

 	"mixins": {
 		"mStorage": {
 			"simpleAudit": true
 		}
 	}

In this case 5 attributes will be added to entity (and 5 field to database by DDL generator):

 - `mi_owner` record owner. Initial value is user who create the record
 - `mi_createDate` record creation date
 - `mi_createUser` user who create the record
 - `mi_modifyDate` last modification date 
 - `mi_modifyUser` user who modify record 

#### Client (browser) side workflow
   
While creation of form for editing record `adminUI` will check domain metadata and if `simpleAudit`
is enabled will add attribute `mi_modifyDate` to the list of fields retrieved from server:

```javascript
 let entity = $App.domainInfo.get(entityName)
 if (entity.mixins.mStorage && entity.mixins.mStorage.simpleAudit) {
  attributes.push('mi_modifyDate') 
 }
```

While constructing of `update` query `adminUI` from will add value of `mi_modifyDate` to the execParams passed
to server for update:

```javascript
 $App.connection.update({
   entity: 'entityName',
   execParams: {
     ID: recordID,
     attr1: 'new value',
     mi_modifyDate: VALUE RETRIEVED ON SELECT 
   }
 })
```

#### Server side workflow 

On the server side `mStorage.update` method will check simpleAudit is enabled, and if so - compare
value of `mi_modifyDate` passed from client with `mi_modifyDate` from `selectBeforeUpdate`.

If values is equal then `mi_modifyDate` value is set equal to the date when the request came to the server
and record is updated in the DB. 

If `mi_modifyDate` value in DB not equal to value passed in client request server throw error.

Developer can bypass optimistic locking by passing `__skipOptimisticLock` parameter to [misc](/api/server-v5/ServerRepository.html#misc) for update.
         
## Soft deletion 
If soft deletion is enabled for mStorage mixin records not actually deleted by `delete` method, but marked as **deleted**.
`Select` method will skip such "makred as deleted" records. 
  
To enable soft deletion for entity set `mixins.mStorage.safeDelete` to `true` in entity *.meta file:

 	"mixins": {
 		"mStorage": {
 			"safeDelete": true
 		}
 	}

In this case 2 attributes will be added to entity (and 2 field to database by DDL generator):

   - `mi_deleteDate` date tim eof deletion. If record is not deleted value of this attribute ie equal to []`#maxdate` macros value](/api/server-v5/ServerRepository.html#where)
   what means record IS NOT DELETED 
   - `mi_deleteUser` user who delete record. null for active records
   
By default Repository will return only active records. To select all records, including marked as deleted use
 [misc](/api/server-v5/ServerRepository.html#misc) with `__allowSelectSafeDeleted` flag.
     