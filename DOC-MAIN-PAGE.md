# <a href="https://unitybase.info/"> <img src="/img/ub-logo-c.png" height="50" /></a> UnityBase

Unitybase is a full stack JavaScript framework for Enterprise. Its main purpose is to provide a set of modules for rapid development of RMS / EDRMS class software.

# About this documentation

- for entity meta file format see [entity json schema](http://lbovet.github.io/docson/index.html#https://unitybase.info/models/UB/schemas/entity.schema.json)
- for application config (ubConfig) file format see [server config json schema](http://lbovet.github.io/docson/index.html#https://unitybase.info/models/UB/schemas/ubConfig.schema.json)
- for a list of supported nodejs core modules see {@link module:buildin buildin}
- method marked as <span class="member-attr api">api</span> are accessible from client

# Available server-side modules
This is a short list of modules, available in unityBase standard distribution.

Full list of available modules are in [UnityBase packages registry](http://registry.unitybase.info)

Also many of [nodejs modules](https://www.npmjs.com) are compatible with UnityBase. We are constantly working on improving the compatibility with nodejs.

 - {@link module:@unitybase/ub @unitybase/ub}: main entry point for most of the applications
 - {@link module:@unitybase/ubcli @unitybase/ubcli}: command line utils for database initialization, synchronizing domain metadata with
 physical database structure, auto tests, generation of documentation and IDE code insight stubs, etc.
 - {@link module:@unitybase/base @unitybase/base}: working with command line args, connecting to UnityBase server, bulk data loading
 - {@link module:@unitybase/uba @unitybase/uba}: UnityBase Administrative model. Define entities for users, roles and permissions {@tutorial security}
 - TODO

# Get Started

Check out UnityBase [**Getting Started**](https://git-pub.intecracy.com/unitybase/samples/tree/master/courses/tutorial-v4) guide
and [other guides](https://git-pub.intecracy.com/unitybase/samples).

Explore [the project WiKi](https://git-pub.intecracy.com/unitybase/ubjs/wikis/home).

