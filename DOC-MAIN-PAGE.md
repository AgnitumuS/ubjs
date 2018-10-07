# <a href="https://unitybase.info/"> <img src="/favicon.ico" height="50"/></a> UnityBase

Unitybase is a full stack JavaScript framework for Enterprise. It's main
purpose is to provide a set of modules for rapid development of RMS / EDRMS class software.

From the low level point of view UnityBase is a asynchronous non-blocking HTTP(S) server with a:

 - build-in synchronous multi-thread JavaScript engine [SpiderMonkey](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey)
 - build-in Database access for a most known RDBMS
 - build-in file systems access

<img src="img/UB-Server-Architecture-v4.png" alt="UB4 Server Architecture">

Form a business logic developer point of view UnityBase is:
 - an DBMS agnostic ORM what work over application Domain metadata
 - a set of tools for
   - synchronizing a physical database structure with Domain metadata
   - generating REST API based on Domain metadata
   - generating developer documentation from Domain metadata
 - authorization, authentication, role based access control, row level security, audit trail, etc
 - a set of ready to use entities appropriate for the majority of enterprise systems
 - automatically generated admin UI based on Domain

# About this documentation

- for entity meta file format see [entity json schema](http://lbovet.github.io/docson/index.html#https://unitybase.info/models/UB/schemas/entity.schema.json)
- for application config (ubConfig) file format see [server config json schema](http://lbovet.github.io/docson/index.html#https://unitybase.info/models/UB/schemas/ubConfig.schema.json)
- for a list of supported nodejs core modules see {@link module:buildin buildin}
- method marked as <span class="member-attr api">api</span> is available from the client

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
 - [@unitybase/xlsx](http://registry.unitybase.info/#/detail/@unitybase/xlsx) package for creating MS Excel files
 - [@unitybase/pdf](http://registry.unitybase.info/#/detail/@unitybase/pdf) package for creating PDFs

The **complete list of available modules** is in [UnityBase packages registry](http://registry.unitybase.info)

# Get Started

Read about UnityBase application initialization process in {@link module:@unitybase/ub @unitybase/ub} module documentation.

Check out UnityBase [**Getting Started**](https://git-pub.intecracy.com/unitybase/samples/tree/master/courses/tutorial-v5) guide
and [other guides](https://git-pub.intecracy.com/unitybase/samples).

Explore [the project WiKi](https://git-pub.intecracy.com/unitybase/ubjs/wikis/home).

