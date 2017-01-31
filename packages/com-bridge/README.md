 Module for working with COM objects

 Usage sample:

      var com = require('@unitybase/com-bridge');
      var word = com.createCOMObject('Word.Application');
      word.open({filename: 'myFyle.doc', readonly: true});
      word.open('myFyle1.doc');
      word.quit();