FM.TstDmList = function() {   
    this._init.apply(this, arguments); // new poziva _init()
}

FM.extendClass(FM.TstDmList,FM.TstGeneric); 

// properties
FM.TstDmList.prototype.objectSubClass = "";


// methods
FM.TstDmList.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "TstAjax";
    
    // popis testova
    this.addTest("tGet");
    this.addTest("tGetList");
    this.addTest("tPostJSONList");
}

FM.TstDmList.prototype.tGet = function() {
    this.log("tGet, DmList test started.",FM.logLevels.info,this.getFullClassName());
    
    var oList = new FM.DmList({},{
        url: 'http://10.76.150.104:9151/status', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'TEXT',
        validResponseCodes: '200',
        params: {},
        headers: {},
        auth: null,
        
        isErrorResponse: function(me,oAjax,response) {
            me.log("tGet, isErrorResponse?",FM.logLevels.info,me.getFullClassName());
            if(!response || !FM.isset(response.getAttr)  || response.getAttr("value","") != 'OK') return true;
            return false;            
        },
        listType: 'single',
        order:{
            orderAttribute: 'value',
            orderAttributeType: 'STRING',
            orderType: 'ASC'
        }                
    });
    
    var me = this;
    oList.addListener({
        onListStart: function(l,oArgs) {
            me.log("tGet, onListStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs,FM.logLevels.info,me.getFullClassName());
        },
        onListError: function(l,oErr) {
            me.log("tGet, onListError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGet',false);
            
        },
        onListEnd: function(l,oData) {
            me.log("tGet, onListEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData,FM.logLevels.info,me.getFullClassName());
            me.log("tGet, onListEnd list size:" + l.getListSize(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGet',true);
        }        
    });    
    
    oList.getData();
}     

FM.TstDmList.prototype.tGetList = function() {
    this.log("tGetList, DmList test started.",FM.logLevels.info,this.getFullClassName());
    
    var oList = new FM.DmList({
        uids: '563771418'
    },{
        url: 'http://www.hicegosum.com/findme-dev/api/users', 
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {
            uids: true
        },
        headers: {},
        auth: null,        
        isErrorResponse: function(me,oAjax,response) {            
            me.log("tGet, isErrorResponse?",FM.logLevels.info,me.getFullClassName());
            if(!response || !FM.isset(response.getAttr)) return true;
            
            var fetchResponse = response.getAttr("value",null);
            if(!fetchResponse || !FM.isObject(fetchResponse)) return true;
            if(FM.getAttr(fetchResponse,"error",false)) return true;
            
            return false;            
        },
        listType: 'collection',
        collectionProperty: 'Results.Users',
        order:{
            orderAttribute: 'uid',
            orderAttributeType: 'STRING',
            orderType: 'ASC'
        }                
    });
    
    var me = this;
    oList.addListener({
        onListStart: function(l,oArgs) {
            me.log("tGetList, onListStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs,FM.logLevels.info,me.getFullClassName());
        },
        onListError: function(l,oErr) {
            me.log("tGetList, onListError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGetList',false);
            
        },
        onListEnd: function(l,oData) {
            me.log("tGetList, onListEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData,FM.logLevels.info,me.getFullClassName());
            me.log("tGetList, onListEnd list size:" + l.getListSize(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tGetList',true);
        }        
    });    
    
    oList.getData();
}

FM.TstDmList.prototype.tPostJSONList = function() {
    this.log("tPostJSONList, DmList test started.",FM.logLevels.info,this.getFullClassName());
    
    var oList = new FM.DmList({
        username: 'ivana',
        password: 'ivanaTest'
    },{
        url: 'http://10.76.150.104:9151/1/customerProfile/login', 
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        responseFormat: 'JSON',
        validResponseCodes: '200',
        params: {
            username: true,
            password: true
        },
        headers: {},
        auth: null,
        
        isErrorResponse: function(me,oAjax,response) {
            me.log("tPostJSONList, isErrorResponse?",FM.logLevels.info,me.getFullClassName());
            if(
                !response || 
                !FM.isset(response.getAttr) || 
                !FM.isObject(response.getAttr("value",null))
            ) return true;
                
            var creds = response.getAttr("value",null);
            if(!FM.isset(creds, "IbAuthCookie")) return true;
            
            return false;            
        },
        listType: 'single',
        order:{
            orderAttribute: 'value',
            orderAttributeType: 'STRING',
            orderType: 'ASC'
        }                
    });
    
    var me = this;
    oList.addListener({
        onListStart: function(l,oArgs) {
            me.log("tPostJSONList, onListStart event:",FM.logLevels.info,me.getFullClassName());
            me.log(oArgs,FM.logLevels.info,me.getFullClassName());
        },
        onListError: function(l,oErr) {
            me.log("tPostJSONList, onListError event:",FM.logLevels.info,me.getFullClassName());
            me.log(oErr.getAttr(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tPostJSONList',false);
            
        },
        onListEnd: function(l,oData) {
            me.log("tPostJSONList, onListEnd event:",FM.logLevels.info,me.getFullClassName());
            me.log(oData,FM.logLevels.info,me.getFullClassName());
            me.log("tPostJSONList, onListEnd list size:" + l.getListSize(),FM.logLevels.info,me.getFullClassName());
            me.addResult('tPostJSONList',true);
        }        
    });    
    
    oList.getData();
}     


// static
FM.TstDmList.className = "TstDmList";
FM.TstDmList.fullClassName = 'tst.TstDmList';



