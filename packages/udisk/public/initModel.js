var mustLoad = [
    'models/UDISK/AdminView.js',
    'models/UDISK/AdminEditForm.js',
    'models/UDISK/AdminEditShare.js',
    'models/UDISK/udisk.css',
    'models/UDISK/UdiskFolderColumn.js'
];
Q.all(mustLoad.map(UB.inject)).done();