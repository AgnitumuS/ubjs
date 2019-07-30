[[toc]]

# Mixin softLock - Pessimistic locks

In opposite to [Optimistic Locking](tutorial-mixin_mstorage.html#optimistic-locking) implemented by 
[mStorage](tutorial-mixin_mstorage.html) mixin what check a record version (value of mi_modifyDate attribute)
just before record update **Pessimistic Locking** allow user lock the record for exclusive use until
his have finished with it.

It has much better integrity than optimistic locking but requires additional method calls to lock/unlock record and
a storage for locks information.

## When to use

Optimistic locking is used when you don't expect many collisions. For example for entities with e few attributes.
Even in case the collision DOES occur user can refresh record (loose his work) and repeat input.
 
In case entity is complex (more when 10 attributes) and collision is anticipated due to concurrent access then 
pessimistic locking is better choice. It costs more to do a normal operation but user can see somebody already edit
record BEFORE starts editing. 
   
Another case is when user need exclusive write access to the record for a long period (for example record in draft state).
In this case Persistent pessimistic locks can be used as explained below.

## UI implementation

User with `Supervisor` role can view current locks state for all users from `Administrator->Misc->Locking` shortcut.
Supervisor can remove any locks by delete row from `Locking` grid view.
  
For both ExtJS and Vue based forms and grids:
 - Lock/Unlock actions are added to the grid and form `All actions` menu for adding/removing Persisted lock for selected row
 - on opening form adds a `lockType: 'None'` parameter to the select request to get a current locking state    
 - when user starts editing instance Form sends 'Temp' lock request. When user commit or rollback changes - unlock request     

### BasePanel (ancestor for ExtJS based forms)

  TODO screenshots
    
### UForm (ancestor for VueJS based forms)

  TODO screenshots

## Configuring softLock for an entity

Application domain should contains `@unitybase/ubs` model (in ubConfig.json):
``` 
"application": {
    "domain": {
        "models": [
            //...
            {
                "path": "./node_modules/@unitybase/ubs"
            },
```

`softLock` mixin should be added to the `mixins` section of entity *.meta file:

```json5
{
  //...
  "mixins": {
    //...
    "softLock": { },
  },
  // ....  
}
```  


