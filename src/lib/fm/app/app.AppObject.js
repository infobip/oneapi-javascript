/**
* Basic application class. 
* @class FM.AppObject
* @extends FM.LmObject
* @param {object} [options] Options
*/    
FM.AppObject = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.AppObject,FM.LmObject); 

// properties
FM.AppObject.prototype.objectSubClass = "";

// methods
FM.AppObject.prototype._init = function(opt) {            
    this._super("_init",this,opt);
    this.objectSubClass = "AppObjects";
}

FM.AppObject.prototype.dmListFactory = function(dmData,dmConfig,addlstnr) {
    var lst = new FM.DmList(dmData,dmConfig);
    if(lst) {
        if(!isset(addlstnr) || addlstnr != false) lst.addListener(this);
    }
    return(lst);
}

FM.AppObject.prototype.dmListDispose = function(lst) {
    lst.dispose();
    return true;
}

// static
FM.AppObject.className = "AppObject";
FM.AppObject.fullClassName = 'app.AppObject';

FM.AppObject.startApp = function(args,evHandler) {   
    var appCls = FM.getAttr(window,args.appClass,null);
    if(!appCls) return null;    
    var app = new appCls(args);
    if(!app) return null;
    
    if(FM.isset(evHandler)) {
        app.addListener(evHandler);
    }
    app.run();
    return(app);
}

FM.AppObject.stopApp = function(app) {
    if(app) {
        return app.dispose();

    }
    
    return true;
}        

