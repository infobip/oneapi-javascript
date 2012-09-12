/**
* Registry class. 
* @class FM.UtRegistry
* @extends FM.Object
* @param {object} opt Options
*/    
FM.UtRegistry = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtRegistry,FM.Object); 

// properties
FM.UtRegistry.prototype.objectSubClass = "";
FM.UtRegistry.prototype.cookieName = '';
FM.UtRegistry.prototype.registry = null;

FM.UtRegistry.prototype._init = function(opt) {            
    this.cookieName = '';
    this.registry = null;

    this._super("_init",opt);
    this.objectSubClass = "UtRegistry";

    this.cookieName = this.getAttr('cookieName','fmRegistry');
    this.registry = null;
}

FM.UtRegistry.prototype.set = function(pkey,val,force) {
    force = FM.isset(force) && force == true ? true: false;
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey,force);
    if(!ndef.node) return false;
    ndef.node[ndef.keyName] = val;

    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});

    return true;
}

FM.UtRegistry.prototype.get = function(pkey,defv) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey);
    if(!ndef.node) return FM.isset(defv) ? defv : '';

    return (
        !FM.isset(ndef.keyValue) ||  
        ndef.keyValue == null || 
        (FM.isString(ndef.keyValue) && ndef.keyValue == '')  ? 
        (FM.isset(defv) ? defv : '') : 
        ndef.keyValue
    );
}

FM.UtRegistry.prototype.remove = function(pkey) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey);
    if(!ndef.node) return false;

    var nnode = {};
    for(var en in ndef.node) {
        if(en != ndef.keyName) {
            nnode[en] = ndef.node[en];
        }
    }

    if(ndef.parent) ndef.parent[ndef.nodeKey] = nnode;
    else this.registry = nnode;

    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});
    return true;
}

FM.UtRegistry.prototype.findKey = function(key,force) {
    return FM.UtRegistry(this.registry,key,force);
}

// static
FM.UtRegistry.className = "UtRegistry";
FM.UtRegistry.fullClassName = 'ut.UtRegistry';


FM.UtRegistry.findKey = function(reg,key,force) {
    var retc = {found: false, node: null, nodeKey: '', parent: null, keyName: '', keyValue: null};
    force = FM.isset(force) && force == true ? true: false;

    if(!FM.isset(reg) || !reg || !FM.isObject(reg)) return retc;
    if(!FM.isset(key) || !key || key == '') return retc;

    var apath_f = key.split("/");
    var apath = [];
    for(var k=0; k < apath_f.length; k++) {
        if(apath_f[k] != null && apath_f[k] != '') {
            apath.push(apath_f[k]);
        }
    }
    if(apath.length < 1) return retc;

    var ndirs = apath.length -1;

    retc.keyName = apath[apath.length -1];
    retc.node = reg;
    for(var i = 0; i < ndirs; i++) {
        var nname = apath[i];
        if(!FM.isset(retc.node[nname]) || !FM.isObject(retc.node[nname])) {
            if(force) retc.node[nname] = {};
            else return retc;
        }
        retc.parent = retc.node;
        retc.nodeKey = nname;
        retc.node = retc.node[nname];
    }

    if(FM.isset(retc.node[retc.keyName])) {
        retc.found = true;
        retc.keyValue = retc.node[retc.keyName];
    }

    return retc;
}

