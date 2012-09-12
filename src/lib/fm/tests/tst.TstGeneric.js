FM.TstGeneric = function() {   
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.TstGeneric,FM.Object); 

// properties
FM.TstGeneric.prototype.objectSubClass = "";
FM.TstGeneric.prototype.testsList = null;
FM.TstGeneric.prototype.testsResults = null;

// methods
FM.TstGeneric.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "TstGeneric";
    this.testsList = {};
    this.testsResults = {};
    this.runningTests = {};
}

FM.TstGeneric.prototype.run = function(test) {
    this.runningTests = {};
    this.testsResults = {};
    var tlist = {};    
    test = FM.isset(test) ? test : null;
    if(test) {
        this.log("Running tests [" + test + "] ...",FM.logLevels.info,this.getFullClassName());
        if(!FM.isset(this.testsList[test])) {
            this.log("Test [" + test + "] is not found!",FM.logLevels.error,this.getFullClassName());
            return false;
        }
        tlist[test] = true;        
    } else {
        this.log("Running all tests ...",FM.logLevels.info,this.getFullClassName());
        tlist = this.testsList;
    }

    for(var tname in tlist) {
        this.runningTests[tname] = false;
    }

    for(var tname in tlist) {
        this.log("Running test [" + tname + "] ...",FM.logLevels.info,this.getFullClassName());
        this[tname]();
    }
    
    return true;
}     

FM.TstGeneric.prototype.addResult = function(test,result) {
    this.testsResults[test] = result;
    this.runningTests[test] = true;
    
    for(var tname in this.runningTests) {
        if(!this.runningTests[tname]) return true;
    }
    return this.showResults();
}

FM.TstGeneric.prototype.showResults = function() {
    var cntok =0, cnterr = 0;
    this.print(" == Test results =================================================");
    for(var tname in this.testsResults) {
        if(this.testsResults[tname] == true) {
            this.print("Test [" + tname + "] is successfully finished.");
            cntok++;
        } else if(this.testsResults[tname] == false) {
            this.print("Test [" + tname + "] is in error!.");
            cnterr++;
        } else { // bilo sto osim true i false
            this.print("Test [" + tname + "] is invalid!.");
            cnterr++;
        }
    }
    this.print(" =================================================================");
    return true;
}


FM.TstGeneric.prototype.addTest = function(test) {
    if(FM.isset(this[test]) && FM.isFunction(this[test])) {
        this.testsList[test] = true;
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.removeTest = function(test) {
    if(FM.isset(this.testsList[test])) {
        delete this.testsList[test];
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.enableTest = function(test) {
    if(FM.isset(this.testsList[test])) {
        this.testsList[test] = true;
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.disableTest = function(test) {
    if(FM.isset(this.testsList[test])) {
        this.testsList[test] = false;
        return true;
    }
    
    return false;
}

FM.TstGeneric.prototype.print = function(msg) {
    if(FM.isObject(msg) || FM.isArray(msg)) {
        console.dir(msg);
    } else {
        console.log(msg);
    }
}


// static
FM.TstGeneric.className = "TstGeneric";
FM.TstGeneric.fullClassName = 'tst.TstGeneric';

