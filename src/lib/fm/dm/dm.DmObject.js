// -- Basic DM class -----------------------------------------------------------
/**
* Basic DM class. Provide groups
* @class DmObject
* @extends FM.Object
* @param {object} attrs list of attribute name and values
* @param {object} [flds] allowed attributes
*/    
FM.DmObject = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmObject,FM.Object); 

// properties
FM.DmObject.prototype.objectSubClass = "";
FM.DmObject.prototype.objectGroups = {};
FM.DmObject.prototype.defaultGroup = '';

// methods

FM.DmObject.prototype._init = function(attrs,flds) {            
    this.objectGroups = {};
    this.defaultGroup = '';               

    this._super("_init",attrs,flds);
    this.objectSubClass = "Objects";
}

FM.DmObject.prototype.getDataID = function() {
    return this.getID();
}

// groups
FM.DmObject.prototype.addGroup = function(s,callevent) {
    if(!FM.isset(s) || !s || s == '') return false;

    this.objectGroups[s] = {
        name: s
    }

    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

FM.DmObject.prototype.removeGroup = function(s,callevent) {
    if(!FM.isset(s) || !s || !FM.isset(this.objectGroups[s])) return false;
    var newglist = {};            
    FM.forEachAttr(this.objectGroups,function(name,value) {
        if(name != s) {
            newglist[name] = value;
        }
        return true;
    });

    this.objectGroups = newglist;
    if(this.defaultGroup == s) this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}

FM.DmObject.prototype.isInGroup = function(s) {
    return (
        FM.isset(s) && s && FM.isset(this.objectGroups[s]) ?
        true : false
        );
}

FM.DmObject.prototype.removeAllGroups = function(callevent) {
    this.objectGroups = {};
    this.defaultGroup = '';
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    return true;
}


FM.DmObject.prototype.getGroups = function() {
    return FM.cloneObject(this.objectGroups);
}

FM.DmObject.prototype.getGroupsCount = function() {
    return FM.sizeOf(this.objectGroups);
}

FM.DmObject.prototype.forEachGroup = function(doFn) {
    return FM.forEach(this.objectGroups,doFn);
}

FM.DmObject.prototype.setDefaultGroup = function(s,callevent) {
    s = FM.isset(s) && s ? s : '';
    if(s == '' || FM.isset(this.objectGroups[s])) {
        this.defaultGroup = s;
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
        return true;
    }            
    return false;
}

FM.DmObject.prototype.getDefaultGroup = function() {
    if(this.defaultGroup != '') {
        return FM.getAttr(this.objectGroups,this.defaultGroup,null);
    }

    // ako nema def ili nije vidljiv
    var defgrp = null;
    FM.forEach(this.objectGroups,function(name,value) {
        // prvi u listi
        defgrp = value;
        return false;
    }); 
    return defgrp;
}        
// == static ===================================================================
FM.DmObject.className = "DmObject";
FM.DmObject.fullClassName = 'dm.DmObject';

FM.DmObject.subClassTypes = {}; 

FM.DmObject.newObject = function(clsname, oAttrs) {
    var fclass = FM.isset(FM.DmObject.subClassTypes[clsname]) ? 
    FM.DmObject.subClassTypes[clsname] : null
    ;

    return fclass ? new fclass(oAttrs) : null;
}

FM.DmObject.getSubClassType = function(clsname) {
    return clsname == "" ? 
    FM.DmObject : (
        FM.isset(FM.DmObject.subClassTypes[clsname]) ? 
        FM.DmObject.subClassTypes[clsname] : 
        null
        )
;
}

FM.DmObject.addSubClassType = function(subclsname, clsfn) {
    FM.DmObject.subClassTypes[subclsname] = clsfn;
}

// class decorations
FM.DmObject.classDecorations = {};

FM.DmObject.defineClassDecorations = function(clsName,flds) {
        FM.DmObject.classDecorations[clsName] = flds;
}

FM.DmObject.getClassDecoration = function(clsName) {
    return FM.getAttr(FM.DmObject.classDecorations,clsName,null);
}

FM.DmObject.getAttributeDecoration = function(clsName,attr) {
    return FM.getAttr(FM.DmObject.classDecorations, clsName + '.' + attr, attr);
}


// == generic classes ==========================================================

// generic value
FM.DmGenericValue = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmGenericValue, FM.DmObject); 

// properties
FM.DmGenericValue.prototype.objectSubClass = "";

// methods
FM.DmGenericValue.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        value: ""
    });
    this.objectSubClass = "GenericValue";
}
        
FM.DmGenericValue.prototype.getDataID = function() {
    return this.getID();
}
FM.DmGenericValue.className = "DmGenericValue";
FM.DmGenericValue.fullClassName = 'dm.DmGenericValue';

FM.DmObject.addSubClassType('GenericValue',FM.DmGenericValue);


// generic error
FM.DmGenericError = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmGenericError, FM.DmObject); 

// properties
FM.DmGenericError.prototype.objectSubClass = "";

// methods
FM.DmGenericError.prototype._init = function(attrs,options) {
    this._super("_init",attrs, FM.extend({messageId: "0",text: "No error"},options));
    this.objectSubClass = "GenericError";
}
        
FM.DmGenericError.prototype.getDataID = function() {
    return this.getID();
}

FM.DmGenericError.prototype.getErrorCode = function() {
    return this.getAttr('messageId','0');
}

FM.DmGenericError.prototype.setErrorCode = function(ec) {
    return this.getAttr('messageId',ec);
}

FM.DmGenericError.prototype.getErrorText = function() {
    return this.getAttr('text','');
}

FM.DmGenericError.prototype.setErrorText = function(text) {
    return this.setAttr('text',text);
}

FM.DmGenericError.prototype.isError = function() {
    var errCode = this.getErrorCode();
    
    return errCode !== '' && errCode !== '0';
}

FM.DmGenericError.prototype.getDataID = function() {
    return this.getErrorCode();
}

FM.DmGenericError.className = "DmGenericError";
FM.DmGenericError.fullClassName = 'dm.DmGenericError';

FM.DmObject.addSubClassType('GenericError',FM.DmGenericError);
