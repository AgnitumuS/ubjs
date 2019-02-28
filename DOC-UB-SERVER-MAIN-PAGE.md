# <a href="https://unitybase.info/"> <img src="/favicon.ico" height="50"/></a> UnityBase

# Available server-side modules
Many of [nodejs modules](https://www.npmjs.com) are compatible with UnityBase.
We are constantly working on enhancing the compatibility with nodejs.

Below is a short list of the modules available in the UnityBase standard distribution:

 - {@link module:@unitybase/ub @unitybase/ub}: main entry point for the most of the applications
 - {@link module:@unitybase/ubcli @unitybase/ubcli}: command line utils for database initialization, synchronizing domain metadata with
 physical database structure, auto tests, generation of documentation and IDE code insight stubs, etc.
 - {@link module:@unitybase/base @unitybase/base}: working with command line args, connecting to UnityBase server, bulk data loading
 - {@link module:@unitybase/uba @unitybase/uba}: UnityBase Administrative model. Defines entities for the users, roles and permissions. See tutorial {@tutorial security}
 - {@link module:@unitybase/ubq @unitybase/ubq}: Asynchronous task queue persisted into the database.
  See tutorials {@tutorial delayed_operations} and {@tutorial schedulers}.
  This module contains the methods for sending e-mails and updating FTS indexes.
 - {@link module:@unitybase/ubs @unitybase/ubs}: Reports, User messages (notifications), Settings (aka about:config), Counters
 - {@link module:@unitybase/cdn @unitybase/cdn}: Set of the dictionaries appropriate for the majority of enterprise systems:
   - Organizations (departments, persons, contacts, bank accounts etc.)
   - Regions (countries, cities, streets, buildings etc)
 - {@link module:@unitybase/ubm @unitybase/ubm}: Set of the entities for constructing a dynamically generated UnityBase UI
    - enumerations
    - navigation desktops & shortcuts ( can be used for the dynamic routing generation for portalUI)
    - forms definitions (used by adminUI for dynamic forms' generation)
    - ER diagrams
 - {@link module:@unitybase/org @unitybase/org}: an internal organization structure
    - includes organizations, departments, staffs, positions, employees, professions
    - can store hierarchical organization charts
    - all entities are historical and support safe delete
 - [@unitybase/xlsx](https://registry.unitybase.info/#/detail/@unitybase/xlsx) package for creating MS Excel files
 - [@unitybase/pdf](https://registry.unitybase.info/#/detail/@unitybase/pdf) package for creating PDFs

The **complete list of available modules** is in [UnityBase packages registry](https://registry.unitybase.info)
