# Lazarus cross compiler helper

Cross compile (Lin/Win) unitybase native package using modes, defined in `lpi`
By Default consider lpi contains ReleaseLinux & ReleaseWin64 build modes

Environment variables
 - LAZARUS_PATH - path to lazbuild executable and
 - UB_SRC - path to cloned ub-server git repository (see instruction)[https://git-pub.intecracy.com/unitybase/ub-server#clone-prepare-ub-server-repository]
should be defined

```
const fpcUtils = require('@unitybase/fpc-utils')
fpcUtils.lazCrossCompile('./src/ubcompressors.lpi')
``