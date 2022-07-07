[[toc]]

# Multitenancy mixin (UB EE)

## Introduction

## Configuring
 - configure a DNS to resolve *.externalURL to the reverse proxy address

> For testing purpose rows `127.0.0.1 tenant1.localhost` ... can be added to `/etc/hosts` and externalURL sets to `http://localhost` 
>
> This allows access multitenancy server locally using http://tenant1.localhost etc. 

 - setup two application: one for multitenancy access and one for tenants administration
 - disable FTS (not supported by multitenancy)

 - add a "security.multitenancy" section into ubConfig

> security.multitenancy.tenants can be reloaded without restarting a server by sending a **HUP** signal to the `ub` process (`kill -HUP pid` / `killall -HUP ub`)  

 - for each tenant login to the tenant's administration instance using tenant URL and add a tenant admin user

## Tenant ID (TID)

Every tenant has a numeric ID.  There are special IDs:
- 1 - system tenant
- 80-99 - reserved for virtual tenants, to allow server-to-server communication between UB hosts of the same environment

## Implementation details
### Postgres
Implemented using [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

Connection variable `ub.tenantID` is sets on each `enterConnectionContext` event and used as a value for
limiting rows by mi_tenantID field for each multitenancy table.

#### Tenants administration for Postgres
By default, DB role created with `ubcli initDB` is an owner for all schema tables, so RLS is disabled for it.
This allows UnityBase to have a "tenants administration" instance for free - just run ub as usual, login as `admin`
and see all data for all tenants.

The "tenant admin" connection config
```json
{
    "name": "main",
    "driver": "PostgreSQL",
    "isDefault": true,
    "dialect": "PostgreSQL",
    "databaseName": "postgresql://pg10.unitybase.info:5402/%UB_DB_MAIN%?tcp_user_timeout=3000",
    "userID": "%UB_DB_MAIN_USER%",
    "password": "%UB_DB_MAIN_PWD%",
    "supportLang": ["en", "uk"],
    "advSettings": "LibLocation=%UB_POSTGRE_LIB||libpq.so.5%",
    "executeWhenConnected": ["SET search_path TO %UB_DB_MAIN_USER%", "SET ub.tenantID=0"]
}
```

The second UB instance for multitenancy access should be configured to use a non-owner role.

DB role "$UB_DB_MAIN_USER"_mt (we reconnect to use a naming convention ORIG_ROLE_mt) is created as:
```
CREATE ROLE "$UB_DB_MAIN_USER"_mt LOGIN PASSWORD '$UB_DB_MAIN_PWD' VALID UNTIL 'infinity';
GRANT USAGE ON SCHEMA $UB_DB_MAIN_USER TO "$UB_DB_MAIN_USER"_mt;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA $UB_DB_MAIN_USER TO "$UB_DB_MAIN_USER"_mt;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA $UB_DB_MAIN_USER TO "$UB_DB_MAIN_USER"_mt;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA $UB_DB_MAIN_USER TO "$UB_DB_MAIN_USER"_mt;
```

NOTE!!! This will give permissions on currently existing objects in DB.  To ensure permissions
will be automatically given on all objects created in the future, automatically, use the following query:
```
ALTER DEFAULT PRIVILEGES FOR ROLE $UB_DB_MAIN_USER IN SCHEMA $UB_DB_MAIN_USER
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "$UB_DB_MAIN_USER"_mt;
ALTER DEFAULT PRIVILEGES FOR ROLE $UB_DB_MAIN_USER IN SCHEMA $UB_DB_MAIN_USER
  GRANT USAGE, SELECT ON SEQUENCES TO "$UB_DB_MAIN_USER"_mt;
ALTER DEFAULT PRIVILEGES FOR ROLE $UB_DB_MAIN_USER IN SCHEMA $UB_DB_MAIN_USER
  GRANT EXECUTE ON FUNCTIONS TO "$UB_DB_MAIN_USER"_mt;
```

Role can be dropped using
```
revoke all on schema $UB_DB_MAIN_USER from "$UB_DB_MAIN_USER"_mt;
drop role "$UB_DB_MAIN_USER"_mt
```

The multitenancy connection config
```json
{
    "name": "main",
    "driver": "PostgreSQL",
    "isDefault": true,
    "dialect": "PostgreSQL",
    "databaseName": "postgresql://pg10.unitybase.info:5402/%UB_DB_MAIN%?tcp_user_timeout=3000",
    "userID": "%UB_DB_MAIN_USER%_mt",
    "password": "%UB_DB_MAIN_PWD%",
    "supportLang": ["en", "uk"],
    "advSettings": "LibLocation=%UB_POSTGRE_LIB||libpq.so.5%",
    "executeWhenConnected": [
      "SET search_path TO %UB_DB_MAIN_USER%",
      "SET ub.tenantID=0",
      "SET statement_timeout=1000"
    ]
}
```

> it is recommended to set `statement_timeout` to 1 second to minimize influence of one tenant on others
