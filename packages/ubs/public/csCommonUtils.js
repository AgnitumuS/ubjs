var obj = UB.ns('UBS.csCommonUtils');

UBS.csCommonUtils.cyrToLat =  function (cyrStr) {
    var
        cyrillic =  'КУЕНХВАРОМСТІ'.split(''),
        latin =     'KYEHXBAPOMCTI'.split('');

    cyrStr = cyrStr.toString().toUpperCase().trim();
    for(var i= 0, len =cyrillic.length; i<len; ++i){
        cyrStr = cyrStr.replace(new RegExp(cyrillic[i], 'gi'), latin[i]);
    }
    return cyrStr;
};



