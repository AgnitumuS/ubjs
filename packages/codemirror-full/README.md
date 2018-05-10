CodeMirror with plugins for UnityBase

The main purpose of this package is to create a bundle for CodeMirror +
CodeMirror plugins + jshint for using it inside UnityBase platform.

We can't  bundle an original version of CodeMirror for several reasons:

 - it uses an old version of lodash
 - we can't use jshint from SystemJS because it requires node's build-in
 module "events"
