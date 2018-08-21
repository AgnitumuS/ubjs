/**
 * Created by v.orel on 29.04.2015.
 *
 * WebDav example provider
 * Implementation of real server filesystem folder. Work correctly only in single thread mode.
 */

var provider = exports;
var fs = require('fs'),
    items = {},
    item,
    path,
    arPath;


// config variables
var startPath = 'd:/0/',//Set your own path here
    lockTimeout = 3600;

// service functions
function itemByPath(curPath) {
    var curItem = items;
    curPath.forEach(function(elem){
        if (elem)
        curItem = curItem[elem]?curItem[elem]:curItem[elem]={props: {}, lock: {}};
    });
    return curItem;
}

function delItemByPath(curPath) {
    var elem = curPath.slice(-1),
        item = itemByPath(curPath.slice(0,-1));
    delete item[elem];
}

function setItemByPath(curPath, curItem) {
    var elem = curPath.slice(-1),
        item = itemByPath(curPath.slice(0,-1));
    item[elem] = curItem;
}

function rmdirFull(path) {
    var ar = fs.readdirSync(path);
    var curpath;
    ar.forEach(function(elem)
        {
            curpath = path+'/'+elem;
            if (fs.isDir(curpath)) {
                rmdirFull(curpath)
            } else {
                fs.unlinkSync(curpath);
            }
        }
    );
    fs.rmdirSync(path);
    return !fs.statSync(path);
}

function copyDir(path, newPath, overwrite) {
    var res = true;
    fs.mkdirSync(newPath);

    var ar = fs.readdirSync(path);
    var curpath, newCurPath;

    ar.forEach(function(elem)
        {
            curpath = path+'/'+elem;
            newCurPath = newPath+'/'+elem;
            if (fs.isDir(curpath)) {
                res = res && copyDir(curpath,newCurPath,overwrite);
            } else {
                res = res && copyFile(curpath,newCurPath,overwrite);
            }
        }
    );
    return res;
}

// provider functions
provider.setPath = function(newPath) {
    arPath = newPath;
    path = startPath.concat(arPath.join('/'));
    item = itemByPath(newPath);
};

provider.exists = function() {
    return  fs.statSync(path) ? true : false;
};

provider.getItems = function() {
        return fs.readdirSync(path).map(function(item){
            return item[item.length-1]==='\\'? item.substr(0,item.length-1):item
        });
};

provider.properties = {
    "DAV:": {
        resourcetype: function(item){
            return fs.isDir(item?path+'/'+item:path)? '<D:collection />': null;
        },
        getlastmodified: function(item) {
            var stat = fs.statSync(item?path+'/'+item:path);
            return stat ? stat.mtime.toUTCString() : null;
        },
        creationdate: function(item) {
            var stat = fs.statSync(item?path+'/'+item:path);
            return stat ? stat.ctime.toUTCString() : null;
        },
        getcontentlength: function(item) {
            var stat = fs.statSync(item?path+'/'+item:path);
            return stat ? stat.size : null;
        },
        getetag: function(item) {
            return null;
        }
    },
    getPropValue: function(item, ns, name){
        var curPath = item?(arPath.concat(item)):arPath,
            obj = itemByPath(curPath);
        if (obj && obj.props && obj.props[ns])
            return obj.props[ns][name];
        else
            return undefined;
    },
    getAllPropsList: function(item, props) {
        var ns, prop,
            curPath = item?(arPath.concat(item)):arPath,
            obj = itemByPath(curPath);
        for (ns in obj.props) {
            if (!props[ns])
                props[ns] = {};
            for (prop in obj.props[ns]) {
                if (!props[ns][prop])
                    props[ns][prop] = {};
            }
        }
        return props;
    },
    setPropValue: function(ns, name, value){
        if (!item.props[ns])
            item.props[ns] = {};
        item.props[ns][name] = value;
    },
    delProp: function(ns, name) {
        if (item.props[ns]&&item.props[ns][name])
        delete item.props[ns][name];
    }
};

provider.doGet = function(resp){
    resp.writeHead('Content-Type: !STATICFILE');
    resp.writeEnd(path);
};

provider.getContentLength = function() {
    var stat = fs.statSync(path);
    return  stat ? stat.size : 0;
};

provider.doPut = function(req) {
    var
        stat = fs.statSync(path),
        isNew = !stat;

    fs.writeFileSync(path, req.read('bin'), {encoding: 'bin'});
    return isNew;
};

provider.doMove = function(destination, overwrite) {
    if (!destination[destination.length-1])
        destination= destination.slice(0,-1);
    if (!fs.statSync(startPath.concat('/').concat(destination.slice(0,-1).join('/'))))
        return undefined;

    var newPath = startPath.concat('/').concat(destination.join('/')),
        res = fs.statSync(newPath)? null: true;
    if (!overwrite && fs.statSync(newPath)) {
        return false;
    }
    if (overwrite && fs.isDir(newPath)) {
        rmdirFull(newPath)
    }
    res = fs.renameSync(path, newPath) && res;

    item.lock = {};
    setItemByPath(destination, item);
    delItemByPath(arPath);

    return res;
};

provider.doCopy = function(destination, overwrite) {
    if (!destination[destination.length-1])
        destination= destination.slice(0,-1);
    if (!fs.statSync(startPath.concat('/').concat(destination.slice(0,-1).join('/'))))
        return undefined;
    var newPath = startPath.concat('/').concat(destination.join('/')),
        res = fs.statSync(newPath)? null: true;
    if (overwrite && fs.isDir(newPath)) {
        rmdirFull(newPath)
    }
    if (fs.isDir(path))
        res = copyDir(path, newPath, !overwrite) && res;
    else
        res = copyFile(path, newPath, !overwrite) && res;

    var newItem = _.clone(item);
    newItem.lock = {};
    setItemByPath(destination, newItem);
    return res;
};

provider.doDelete = function() {
    var
        res;
    if (!fs.statSync(path))
        return false;

    if (fs.isDir(path))
        res = rmdirFull(path);
    else
        res = fs.unlinkSync(path);

    delItemByPath(arPath);
    return res;
};

provider.doCreateDir = function() {
     if (!fs.statSync(path)) {
        fs.mkdirSync(path);
        return true
    } else return false;
};

provider.doLock = function(lockObj) {
    lockObj.depth = Infinity;
    lockObj.timeout = lockTimeout;
    lockObj.token = createGuid().toLowerCase().substr(1,36);
    item.lock = lockObj;

    return lockObj;
};

provider.getLock = function(destination) {
    return provider.exists() ? ( destination ? itemByPath(destination) : item).lock : {};
};

provider.doUnLock = function(token) {
    if (item.lock.token === token) {
        item.lock = {};
        return true;
    }
    return false;
};