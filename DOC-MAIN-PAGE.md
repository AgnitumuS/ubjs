# <a href="https://unitybase.info/"> <img src="/favicon.ico" height="50"/></a> UnityBase

The main purpose of UnityBase is to provide a set of modules for rapid development of RMS and EDRMS class software.

From the low level point of view UnityBase is an asynchronous non-blocking HTTP(S) server with:

 - built-in synchronous multi-thread [SpiderMonkey JavaScript engine](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey)
 - built-in Database access for a most known RDBMS
 - built-in file systems access


![UB5 Server Architecture](server-v5/img/UB-Server-Architecture-v5.png) 

From a developer point of view UnityBase is:
 - a DBMS agnostic ORM what work over application Domain metadata
 - an authorization, authentication, role based access control, row level security, audit trail, etc
 - a set of ready to use entities appropriate for the majority of enterprise systems
 - an automatically generated admin UI based on Domain
 - a set of tools for
   - synchronizing a physical database structure with Domain metadata
   - generating REST API based on Domain metadata
   - generating developer documentation from Domain metadata

Resources: 

- [Tutorials](gettingstarted/index.html) a step-by-step example of creating a simple project for citizens request on city departments

- [Articles](tutorialIndex.html) deep explanation of platform conceptions
  
- [Server API](server-v5/index.html)  server objects, which are supplied in the open UB distribution

- [Client API](ubpub-v5/index.html) data layer for accessing UnityBase server from Browser or NodeJS

- [UI widgets](adminui-vue/index.html) a set of UI components to build a modern user interface

- [AdminUI](adminUI/index.html) legacy ExtJS-based UI components *deprecated*
