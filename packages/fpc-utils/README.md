# Lazarus cross compiler helper

Cross compile (Lin/Win) unitybase native package using modes, defined in `lpi`
By Default consider lpi contains ReleaseLinux & ReleaseWin64 build modes

```
const fpcUtils = require('@unitybase/fpc-utils')
fpcUtils.lazCrossCompile('./src/ubcompressors.lpi')
``