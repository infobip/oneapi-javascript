FM.TstAjax = function() {   
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.TstAjax,FM.TstGeneric); 

// properties
FM.TstAjax.prototype.objectSubClass = "";


// methods
FM.TstAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "TstAjax";
    // popis testova
    this.addTest("tGet");
    this.addTest("tGetErr");
    this.addTest("tGetJSON");    
    this.addTest("tPostJSONparams");   
    this.addTest("tPutJSONparams");   
    this.addTest("tDeleteJSONparams");
}

FM.TstAjax.prototype.tGet = function() {
    this.log("tGet, Ajax GET/TEXT test started.",FM.logLevels.info,this.getFullClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://10.76.150.104:9151/status', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'TEXT',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tGet, onAjaxStateStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getFullClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tGet, onAjaxStateError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGet',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tGet, onAjaxStateEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGet',true);
        }        
    });    
    
    oAjax.send({});
}     

FM.TstAjax.prototype.tGetErr = function() {
    this.log("tGetErr, Ajax GET (invalid request) test started.",FM.logLevels.info,this.getFullClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.index.hr', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'TEXT',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tGetErr, onAjaxStateStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getFullClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tGetErr, onAjaxStateError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGetErr',true);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tGetErr, onAjaxStateEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGetErr',false);
        }        
    });    
    
    oAjax.send({});
}     

FM.TstAjax.prototype.tGetJSON = function() {
    this.log("tGetJSON, Ajax Get/JSON test started.",FM.logLevels.info,this.getFullClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users/563771418', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tGetJSON, onAjaxStateStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getFullClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tGetJSON, onAjaxStateError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGetJSON',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tGetJSON, onAjaxStateEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGetJSON',true);
        }        
    });    
    
    oAjax.send({});
}     

FM.TstAjax.prototype.tPostJSONparams = function() {
    this.log("tPostJSONparams, Ajax Post/JSON/params test started.",FM.logLevels.info,this.getFullClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {ids: true},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tPostJSONparams, onAjaxStateStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getFullClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tPostJSONparams, onAjaxStateError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tPostJSONparams',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tPostJSONparams, onAjaxStateEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getFullClassName());
            me.addResult('tPostJSONparams',true);
        }        
    });    
    
    oAjax.send({ids: '563771418'});
}     


FM.TstAjax.prototype.tPutJSONparams = function() {
    this.log("tPutJSONparams, Ajax Put/JSON/params test started.",FM.logLevels.info,this.getFullClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'PUT',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {ids: true},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tPutJSONparams, onAjaxStateStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getFullClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tPutJSONparams, onAjaxStateError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tPutJSONparams',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tPutJSONparams, onAjaxStateEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getFullClassName());
            me.addResult('tPutJSONparams',true);
        }        
    });    
    
    oAjax.send({ids: '563771418'});
}     

FM.TstAjax.prototype.tDeleteJSONparams = function() {
    this.log("tDeleteJSONparams, Ajax Delete/JSON/params test started.",FM.logLevels.info,this.getFullClassName());
    
    var oAjax = new FM.UtAjax({
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'DELETE',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {ids: true},
        headers: {},
        auth: null
    });
    
    var me = this;
    oAjax.addListener({
        onAjaxStateStart: function(oAjax,oArgs) {
            me.log("tDeleteJSONparams, onAjaxStateStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs.getAttr("value"),FM.logLevels.info,me.getFullClassName());
        },
        onAjaxStateError: function(oAjax,oErr) {
            me.log("tDeleteJSONparams, onAjaxStateError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tDeleteJSONparams',false);
            
        },
        onAjaxStateEnd: function(oAjax,oData) {
            me.log("tDeleteJSONparams, onAjaxStateEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData.getAttr("value"),FM.logLevels.info,me.getFullClassName());
            me.addResult('tDeleteJSONparams',true);
        }        
    });    
    
    oAjax.send({ids: '563771418'});
}     

// static
FM.TstAjax.className = "TstAjax";
FM.TstAjax.fullClassName = 'tst.TstAjax';

