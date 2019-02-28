# <a href="https://unitybase.info/"> <img src="/favicon.ico" height="50"/></a> UnityBase


In this section, you can find the necessary documentation to work with UnityBase. 


- [**Getting started**](gettingstarted/index.html) describes a step-by-step example of creating a simple project for citizens request on city departments

- [**Server API documentation**](server-v5/index.html) describes Application server objects, which are supplied in the open UB distribution

- [**Client API documentation**](ubpub-v5/index.html) describes Data layer for accessing UnityBase server from Browser or NodeJS

- [**AdminUI API documentation**](adminUI/index.html)  describes ExtJS-based admin UI client, useful for quick prototyping your app and creating an interface for administrators

- [**WiKi**](https://git-pub.intecracy.com/unitybase/ubjs/wikis/home) contains solutions for typical tasks

---
## Briefly
Unitybase is a full stack JavaScript framework for Enterprise. It's main
purpose is to provide a set of modules for rapid development of RMS / EDRMS class software.

From the low level point of view UnityBase is a asynchronous non-blocking HTTP(S) server with a:

 - build-in synchronous multi-thread JavaScript engine [SpiderMonkey](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey)
 - build-in Database access for a most known RDBMS
 - build-in file systems access

<img src="server-v5/img/UB-Server-Architecture-v4.png" alt="UB4 Server Architecture">

Form a business logic developer point of view UnityBase is:
 - an DBMS agnostic ORM what work over application Domain metadata
 - a set of tools for
   - synchronizing a physical database structure with Domain metadata
   - generating REST API based on Domain metadata
   - generating developer documentation from Domain metadata
 - authorization, authentication, role based access control, row level security, audit trail, etc
 - a set of ready to use entities appropriate for the majority of enterprise systems
 - automatically generated admin UI based on Domain
