// -- osnovna LM klasa ---------------------------------------------------------
/**
* Basic LM class. 
* @class FM.LmObject
* @extends FM.Object
* @param {FM.AppObject} app application object
* @param {object} [options] Options
*/    
FM.LmObject = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.LmObject,FM.Object); // extends FM.Object

// properties
FM.LmObject.prototype.objectSubClass = "";
FM.LmObject.prototype.app = null;
FM.LmObject.prototype.bindObject = null;
FM.LmObject.prototype.executed = false;

FM.LmObject.prototype._init = function(app,opt) {            
    this.app = app;            
    this.bindObject = null;
    this.executed = false;

    this._super("_init",opt);
    this.objectSubClass = "LmObject";

}

FM.LmObject.prototype.run = function() {
    this.executed = true;  

    // dodaj listener na dm
    var f = this.getDmList();
    if(f & this.getAttr('dmListEvents','true') != 'false') f.addListener(this);    

    // npravi bind ako treba
    this.bind();                      
}

FM.LmObject.prototype.dispose = function() { 
    // makni listener sa dm-a. ako ga nismo ni dodavali nema veze
    var f = this.getDmList();
    if(f) f.removeListener(this);    

    // unbind
    this.unbind();

    // reset
    this.app = null;            
    this.executed = false;
}

FM.LmObject.prototype.isExecuted = function() {
    return this.executed;
}

FM.LmObject.prototype.getApp = function() {
    return this.app;
}

FM.LmObject.prototype.getDmObject = function() {
    var dmobj = null, f = this.getAttr('dmObject',null);

    if(f) {                
        // ako je string
        if(FM.isString(f)) f = FM.stringPtrToObject(f,this,this.app);
        if(f) dmobj = !FM.isset(f.getClassName) ? f(this.app,this) : f;
        if(!dmobj) {
            dmobj = new FM.DmObject({}); // svaki lmobjekt ima dmobjekt, makar prazan
        }
        this.setAttr('dmObject',dmobj);
    }

    return dmobj;
}

FM.LmObject.prototype.getDmList = function() {
    var dmobj = null, f = this.getAttr('dmList',null);            
    if(f) {                
        // ako je string
        if(FM.isString(f)) {                    
            f = FM.stringPtrToObject(f,this,this.app);
        }
        if(f) dmobj = !FM.isset(f.getClassName) ? f(this.app,this) : f;
        this.setAttr('dmList',dmobj);
    }

    return dmobj;
}


FM.LmObject.prototype.getDmFilter = function() {
    var f = this.getAttr('dmFilter',null);
    // ako je string
    if(FM.isString(f)) {
        f = FM.stringPtrToObject(f,this,this.app);
        this.setAttr('dmFilter',f);
    }                
    return  f;
}

FM.LmObject.prototype.bind = function() {
    if(this.getAttr('bindID','') != '') {
        this.fireEvent("onRegisterBindEvents",{
            bindID: this.getAttr('bindID',''),
            object: this
        });            
    }

    // npravi bind ako treba
    if(this.getAttr('bindTo','') != '') {
        var me = this;
        this.fireEvent("onBindToObject",{
            bindID: this.getAttr('bindTo',''),
            callbackID: this.getID(),
            bindEvents: this.getAttr('bindEvents',''),
            callback: function(enable,lmobj) {                        
                var bindHandler = me.getAttr('bindHandler',null);
                if(FM.isString(bindHandler)) {
                    bindHandler = FM.stringPtrToObject(bindHandler,me,me.app);
                }
                if(FM.isFunction(bindHandler)) {
                    bindHandler(me,enable,lmobj);
                } else if(FM.isset(me.bindHandler)) {
                    me.bindHandler(enable,lmobj);
                }

                me.setBindObject(enable ? lmobj : null);
            }
        });
    }            
}

FM.LmObject.prototype.unbind = function() {
    // npravi unbind ako treba
    if(this.getAttr('bindID','') != '' && this.bindObject) {
        this.fireEvent("onUnregisterBindEvents",{
            bindID: this.getAttr('bindID','')
        });
    }   

    if(this.getAttr('bindTo','') != '' && this.bindObject) {
        this.fireEvent("onUnbindFromObject",{
            bindID: this.getAttr('bindTo',''),
            callbackID: this.getID()
        });    
    }            
}

FM.LmObject.prototype.getBindObject = function() {
    return this.bindObject;
}

FM.LmObject.prototype.setBindObject = function(obj) {
    this.bindObject = obj;
}

// owr events procs
FM.LmObject.prototype.fireEvent = function(ev,evdata,calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};

    // provjeri prvo bindObject
    if(
        ev != "onUnregisterBindEvents" &&
        ev != "onUnbindFromObject" &&
        ev != "onBindToObject" &&
        ev != "onRegisterBindEvents" &&        
        this.bindObject
    ) {
        var bev = this.getAttr('bindEvents','');
        if(bev == '' || bev.indexOf('|' + ev + '|') > -1) {
            try {
                this.log("Executing bind event " + ev + "() ...",FM.logLevels.debug,'fireEvent');
                return this.bindObject.isExecuted() ?
                    this.bindObject.onEvent(this,ev,evdata,cl) :
                    cl;
                this.log("Executing " + ev + "() done.",FM.logLevels.debug,'fireEvent');
            } catch(e) {
                this.log("ERROR executing bind event " + ev + "()! [" + e.type + "]",FM.logLevels.error,'fireEvent');
            }
        }
    }

    // obicni listeneri
    return this._super("fireEvent",ev,evdata,cl);
}

FM.LmObject.prototype.onEvent = function(sender,ev,data,calledlist) {
    var oev = ev;
    var ex = false;

    this.log("*EV:" + ev,FM.logLevels.info,'onEvent');
    this.log(data,FM.logLevels.debug,'onEvent');

    // prvo provjeri da li imas normalniu event funkciju        
    // ako je imas prvo pozovi nju 
    if(FM.isset(this[ev])) {
        //eval(this[ev])(sender,data);
        this.log("Executing local " + ev + "()...",FM.logLevels.debug,'onEvent');            
        try {
            this[ev](sender,data);
        } catch(e) {
            this.log("ERROR executing local " + ev + "()! [" + e.type + "]",FM.logLevels.error,'onEvent');
            this.log(this.getAttr(),FM.logLevels.debug,'onEvent');
        }
        ex = true;
        this.log("Executing local " + ev + "() done.",FM.logLevels.debug,'onEvent');
    }

    // dataevent se uvijek proslijedjuju dalje
    //  provjeri da li imas event tog tipa u conf dataevents         
    if(this.getAttr('dataEvents.' + ev,null)) {
        this.log("Executing dataEvent " + ev + "() ...",FM.logLevels.debug,'onEvent');
        var dev,fld,obj,val=null;

        dev = this.getAttr('dataEvents.' + ev + '.event',ev); // koji event
        fld = this.getAttr('dataEvents.' + ev + '.value',''); // koje polje iz DmObjekta
        var val;
        // ako u config imamo na pcetku # uzmi iz objekta
        if(FM.startsWith(fld,'#')) {
            var dmObj = this.getDmObject();
            val = dmObj.getAttr(fld.substr(1),'');
        } else {
            // uzmi dmlist
            var f = this.getDmList();
            obj = f != null ? f.get(data) : null;
            if(obj) {
                val = obj.getAttr(fld,'');
                if(FM.startsWith(val,'#')) {
                    dev = val.substr(1);
                    val = this;
                }
            }
        }

        // dataevent 
        this.log("Fire dataEvent " + dev + "()",FM.logLevels.debug,'onEvent');
        this.fireEvent(dev,val,calledlist);
        ex = true;
        this.log("Fire dataEvent " + dev + "() done.",FM.logLevels.debug,'onEvent');
    }

    // ako nije izvrsen ni ev ni dev
    if(!ex) {
        this.log("Fire event " + ev + "()",FM.logLevels.debug,'onEvent');
        this.fireEvent(ev,data,calledlist);
        this.log("Fire event " + ev + "() done.",FM.logLevels.debug,'onEvent');
    }        

    // vrati cl ako je pozvan loc ev
    this.log("*EV:" + ev + "() done.",FM.logLevels.info,'onEvent');
    return calledlist;
}        

FM.LmObject.className = "LmObject";
FM.LmObject.fullClassName = 'lm.LmObject';
