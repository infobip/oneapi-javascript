// -- DM list class ------------------------------------------------------------
/**
* DM list holds  DM.Objects. 
*
* @class DmList
* @extends FM.DmObject
* @param {object} attrs list of attribute name and values
* @param {object|String} [config] configuration. Literal presentation or object
*/    
FM.DmList = function() {
    this._init.apply(this, arguments); 
}
FM.extendClass(FM.DmList,FM.DmObject); // extends FM.DmObject

// properties
FM.DmList.prototype.objectSubClass = "";
FM.DmList.prototype.objectsList = null;
FM.DmList.prototype.fetchSize = 0;
FM.DmList.prototype.lastFetchTime = null;
FM.DmList.prototype.lastFetchEndTime = null;
FM.DmList.prototype.lastFetchArgs = null;
FM.DmList.prototype.lastFetchedArgs = null;

FM.DmList.prototype._init = function(attrs,config) {            
    this.objectsList = {};

    // ajax
    this.fetchSize = FM.DmList.DEF_FETCH_SIZE;
    this.lastFetchTime = null;
    this.lastFetchEndTime = null;
    this.lastFetchArgs = null;
    this.lastFetchedArgs = null;

    this._super("_init",attrs);
    this.objectSubClass = "ListOfItems";

    // list configuration
    config = FM.isset(config) && config ? config : null;
    if(FM.isString(config)) {
        if(FM.DmList.getConfiguration(config)) {
            config = FM.cloneObject(FM.DmList.getConfiguration(config));
        } else {
            config = FM.stringPtrToObject(config);
        }
    }

    this.setProperty('config',config ? config : {},false);
}

// -- func AJAX --------------------------------------------------------
/**
* Get arguments of last fetch
* @public
* @function
* @returns {object} List of arguments of last fetch or null
*/            
FM.DmList.prototype.getLastGetArgs = function() {
    return this.lastFetchArgs;        
}

/**
* Get arguments of last sucessfull fetch  
* @public
* @function
* @returns {object} List of arguments of last sucessfull fetch or null
*/            
FM.DmList.prototype.getLastFetchedArgs = function() {
    return this.lastFetchedArgs;        
}

/**
* Get arguments for fetch
* @public
* @function
* @param {boolean} getMore New fetch or fetch more data
* @returns {object} List of arguments for new fetch
*/            
FM.DmList.prototype.getDataArgs = function(getMore) {
    var args = {};

    // ako imamo fn pozivamo nju, inace saljemo sve atribute  
    var fnFetchArgs = this.getProperty('config.getFetchArguments',null);
    if(fnFetchArgs && FM.isString(fnFetchArgs)) fnFetchArgs = FM.stringPtrToObject(fnFetchArgs);
    if(fnFetchArgs && FM.isFunction(fnFetchArgs)) {
        args = fnFetchArgs({dmList: this, getMore: getMore});
    } else { // ako nemamo fn stavljamo atribute
        this.forEachAttr(function(pname,value) {
            if(!FM.isFunction(value)) {
                args[pname] = value;
            }
            return true;
        });
        if(this.isAttr("fromrow")) {
            args["fromrow"] = this.getListSize();
        }
        if(this.isAttr("nrows")) {
            args["nrows"] = this.getFetchSize();
        }
    }
    this.lastFetchArgs = args;

    // serijaliziraj argumente
    FM.forEach(args,function(name,value) {
        if(FM.isArray(value) || FM.isObject(value)) {
            args[name] = FM.serialize(value);
        }
        return true;
    });            

   
    // kraj
    return(args);
}

/**
* Before start of fetch. Fires <i>onListStart</i> event
* @event
* @param {object} oAjax UtAjax object
* @param {object} oArgs data Fetch arguments
*/                
FM.DmList.prototype.onAjaxStateStart = function(oAjax,oArgs) {
    this.log("Starting fetch ...",FM.logLevels.info,'onAjaxStateStart');
    this.fireEvent("onListStart",oArgs);
}

/**
* After successfull fetch. 
* @public
* @event
* @param {object} oAjax UtAjax object
* @param {FM.DmGenericValue} response 
*  {
*    error: 0,
*    errorMessage: '',
*    responseText: '',
*    responseObject: null
*  }
*/                
FM.DmList.prototype.onAjaxStateEnd = function(oAjax,response) {    
    this.log("Fetch completed.",FM.logLevels.info,'onAjaxStateEnd');
    oAjax.removeListener(this);
    
    this.lastFetchEndTime = new Date().getTime();
    
    // provjeri param
    if(!FM.isObject(response) || !FM.isset(response.getAttr)) {
        return this.onAjaxStateError(oAjax,new FM.DmGenericError({
            messageId: "-1",
            text: "Ajax call error (empty response)"               
        }));
    }
    
    // imas objekt, provjeri da nije error obj
    var isErrorResponse = this.resolvePropertyValue(
        'config.isErrorResponse',false,
        {dmList: this, utAjax: oAjax, response: response.getAttr('value',null)}
    );            
    
    if(isErrorResponse) {
        var errObj = this.resolvePropertyValue(
            'config.errorParser',null,
            {dmList: this, utAjax: oAjax, response: response.getAttr('value',null)}
        );
        if(!errObj) {
            errObj = new FM.DmGenericError({
                messageId: "-1",
                text: "Error parsing response"
            });
        }
        return this.onAjaxStateError(oAjax,errObj);            
    }
    
    return this.addResponseToList(response);
}

/**
* After fetch error. 
* @public
* @event
* @param {object} oAjax UtAjax object
* @param {object} errObj (class extending FM.DmGenericError)
*/                
FM.DmList.prototype.onAjaxStateError = function(oAjax,errObj) {    
    if(!FM.isset(errObj) || !errObj || !FM.isObject(errObj) || !FM.isset(errObj.getErrorText)) {
        errObj = new FM.DmGenericError({
            messageId: "-1",
            text: "Error fetching data from server"
        });
    }
    this.log(
        errObj.getErrorText(),
        FM.logLevels.warn, 'onAjaxStateError'
    );
        
    oAjax.removeListener(this);

    this.lastFetchEndTime = new Date().getTime();    
    this.fireEvent("onListError",errObj);
}

/**
* Start ajax call. 
* @private
* @function    
* @param {object} args Fetch arguments
*/                
FM.DmList.prototype._ajaxCall = function(args) {
    var fnargs = {dmList: this, arguments: args};
    
    this.lastFetchTime = new Date().getTime();
    
    // resolve headers
    var hdrs = this.resolvePropertyValue(
        'config.headers',{},fnargs
    );
    for(var hname in hdrs) {
        hdrs[hname] = FM.applyTemplate(args,hdrs[hname],false,true);
    }
    var url = FM.applyTemplate(
        args,
        this.resolvePropertyValue(
            'config.url','',fnargs
        ),
        false,true
    );

    var authArgs = this.resolvePropertyValue('config.auth',{},fnargs);    
        
    // ajax config
    var utAjax = new FM.UtAjax({
        url: url,
        method: this.resolvePropertyValue('config.method','',args),
        contentType: this.resolvePropertyValue('config.contentType','application/x-www-form-urlencoded',args),
        responseFormat: this.resolvePropertyValue('config.responseFormat','TEXT',args),
        validResponseCodes: this.resolvePropertyValue('config.validResponseCodes','',args),
        params: this.resolvePropertyValue('config.params',{},args),
        headers: hdrs,
        auth:   FM.getAttr(authArgs,'username','') == '' ? null : {
            username: FM.getAttr(authArgs,'username',''),
            password: FM.getAttr(authArgs,'password','')
        }
    });
    
    // add listener
    utAjax.addListener(this);
    
    // send
    utAjax.send(args);
    
    return true;
}

/**
* Get data from server. 
* @public
* @function    
* @param {boolean} getMore Continue or start new fetch
*/                
FM.DmList.prototype.getData = function(getMore) {   
    // ako nema url-a ne radimo fetch
    if(this.getProperty('config.url','') == '') {
        this.fireEvent(
            "onListEnd",
            {
                Removed: {},
                Added: {},
                Updated: {}
            });
        return true;                
    }

    // args za fetch
    var args = this.getDataArgs(getMore);

    // call            
    if(args) this._ajaxCall(args);

    return true;
}

/**
* Get number of objects to fetch from server. 
* @public
* @function    
* @returns {number} Number of objects to fetch from server
*/                
FM.DmList.prototype.getFetchSize = function() {
    return(this.fetchSize);
}

/**
* Set number of objects to fetch from server. 
* @public
* @function    
* @param {number} s Number of objects to fetch from server
*/                
FM.DmList.prototype.setFetchSize = function(s) {
    this.fetchSize = FM.isset(s) && s > 0 && s < 1000 ? s : this.fetchSize;
}

/**
* Add DmObject to list
* @public
* @function    
* @param {DmObject} inmember DmObject to add
* @param {string} mid DmObject id
* @param {boolean} callevent Send <i>onListEnd</i> event
* @param {string} groupid Id of DmObject group
*/ 
FM.DmList.prototype.addToList = function(inmember,mid,callevent,groupid) {
    var addlst;
    
    // ako je lista objekata a ne objekt
    if(FM.isObject(inmember) && !FM.isset(inmember.getDataID)) {
        addlst = inmember;
    } else {
        if(!FM.isset(mid)) mid = inmember.getDataID();
        addlst[mid] = inmember;
    }

    return this.refreshList({Added: addlst, Updated: {}, Removed: {}},false,groupid,false,callevent);

    // kraj
    return true;
}

/**
* Remove DmObject from list
* @public
* @function    
* @param {string} id Id of DmObject to remove or object with list od DmObjects to remove
* @param {boolean} callevent Send <i>onListEnd</i> event
* @param {string} groupid Id of DmObject group
*/                
FM.DmList.prototype.removeFromList = function(id,callevent,groupid) {
    var rmlist = {};
    var oOldObj;
    
    // ako je lista objekata ili objekt a ne id objekta
    if(FM.isObject(id)) {
        if(!FM.isset(id.getDataID)) {
            rmlist = id;
        } else {            
            rmlist[id.getDataID()] = id;
        }
    } else if(FM.isString(id)) { // string id
        oOldObj = this.get(id);
        if(oOldObj) {
            rmlist[oOldObj.getDataID()] = oOldObj;
        }
    }
    
        var nlist = {};
        var myrmlist = {};        
        this.forEachListElement(
            function(index,iObj) {
                var odataid = iObj.getDataID();
                if(!FM.isset(rmlist[odataid])) {
                    nlist[index] = iObj;
                } else {
                    myrmlist[odataid] = iObj;
                }
                return true;
            }
        );
        this.objectsList = nlist;

        if(callevent != false) {
            this.fireEvent(
                "onListEnd",
                {
                    Removed: myrmlist,
                    Added: {},
                    Updated: {}
                });                
        }    
}

/**
* Remove all DmObjects with <i>attr</i> attribute value equal to <i>value</i> from list
* @public
* @function    
* @param {string} attr Attribute name
* @param {string} value Attribute value
* @param {boolean} callevent Send <i>onListEnd</i> event
* @param {string} groupid Id of DmObject group
*/                
FM.DmList.prototype.removeFromListByAttr = function(attr, value,callevent,groupid) {
    var rmlist = {};

    this.forEachListElement(
        function(index,iObj) {
            if(iObj.getAttr(attr) == value.toString()) {
                rmlist[index] = iObj;
            }
            return true;
        }
    );
    return this.removeFromList(rmlist,callevent,groupid);
}

/**
* Remove all DmObjects from list
* @public
* @function    
*/                
FM.DmList.prototype.clearList = function(callevent,groupid) {
    return this.removeFromList(FM.cloneObject(this.objectsList),callevent,groupid);
}

/**
* Dispose list
* @public
* @function    
*/                
FM.DmList.prototype.dispose = function() {
    this.clearList(false);
    
    // event
    this.fireEvent("onListDispose", {});

    // props & listeners
    this.removeListener();
    this.options = {};
    this.prop = {};

    // list
    this.objectsList = {};

    // ajax
    this.lastFetchTime = null;
    this.lastFetchEndTime = null;
    this.lastFetchArgs = null;
    this.lastFetchedArgs = null;
}

/**
* Get DmObject from list by id or attribute name/value pair
* @public
* @function    
* @param {string} key id of DmObject to remove or attribute value
* @param {string} aname undefined or attribute name
* @returns {DmObject} 
*/                
FM.DmList.prototype.get = function(key,aname) {
    // ako je aname def onda je par name/value attributa a ne dataid
    if(FM.isset(aname) && aname && aname != '') {
        return this.findByAttr(aname,key);
    }

    // drito u listu pod dataid-u
    if(FM.isset(this.objectsList[key.toString()])) {
        return this.objectsList[key.toString()];
    }

    // nije nadjen
    return null;
}

/**
* See DmList.get
* @see DmList#get
*/                
FM.DmList.prototype.c = function(key,aname) {
    return this.get(key,aname);
}

/**
* Add DmObject to list
* Examples:
*  this.set(obj,'1234')
*  this.set(false,[o1,o2,o3],'uid')
*  (R)
*  
* @public
* @function    
* @param {DmObject} member DmObject to add
* @param {string} id Id of DmObject to add
* @param {String} idattr - 
* @returns {DmObject} 
*/                
FM.DmList.prototype.set = function(member,id,idattr) {
    if(FM.isset(idattr)) {
        var olist = id;
        var onlyExisting = member;
        for(var k in olist) {
            var obj = olist[k];
            if(FM.isObject(obj)) {
                if(!onlyExisting || (this.get(obj[idattr]) != null)) this.set(obj,obj[idattr]);
            }
        }
    } else {
        this.objectsList[id.toString()] = member;
    }
    return true;
}

/**
* See DmList.set
* @see DmList#set
*/                
FM.DmList.prototype.l = function(member,id,idattr) {
    return this.set(member,id,idattr);
}

/**
* Get list of objects
* @public
* @function    
* @returns {object} 
*/                
FM.DmList.prototype.getList = function() {
    return this.objectsList;
}

/**
* Find DmObject(s) 
* @public
* @function    
* @param {string} aname Attribute name 
* @param {string} value Attribute value
* @param {boolean} all Return all objects (or only first that mach criteria)
* @param {object} orderList List index 
* @returns {object} DMObject or DmObject collection
*/                    
FM.DmList.prototype.findByAttr = function(aname,value,all,orderList) {
    var getall = (FM.isset(all) ? all : false);
    var retarr = getall ? {} : null;

    var obj = this.forEachListElement(
        function(index,obj) {
            if(obj.getAttr(aname.toString()) == value) {
                if(getall) {
                    if(!retarr) retarr = {};
                    retarr[index] = obj;                    
                } else {
                    retarr = obj;
                    return(false);
                }
            }
            return(true);
        }, orderList
    );

    return(getall);
}

/**
* Find DmObject data id by attribute name/value pair 
* @public
* @function    
* @param {string} attrname Attribute name 
* @param {string} attrval Attribute value
* @returns {object} DmObject or null
*/                    
FM.DmList.prototype.findElementIndex = function(attrname,attrval) {
    var i = this.forEachListElement(
        function(index,obj) {
            if(obj.getAttr(attrname.toString()) == attrval.toString()) return(false);
            return(true);
        },
        true
        );
    return(i);
}

/**
* Get list size
* @public
* @function    
* @returns {number} Number of DmObject in list
*/                    
FM.DmList.prototype.getListSize = function() {
    return FM.sizeOf(this.getList());
}

/**
* For each DmObject in list call function <i>doFn(id,attr)</i> until end of list or <i>false</i> return value.    
* @public
* @function    
* @param {function} doFn Callback function
* @param {boolean} returnIndex Return index of DmObject instead DmObject itself
* @param {boolean} doSort Sort index by orderAttribute (from config)
* @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return DmObject (or data id of DmObject) otherwise null or -1
*/                    
FM.DmList.prototype.forEachListElement = function(doFn,returnIndex,doSort) {
    // tu treba kreirati index
    doSort = FM.isset(doSort) && doSort == true ? true : false;
    if(doSort) {
        var orderList = this.createListIndex(
            this.getProperty('config.order.orderAttribute','__fetch_order'),
            this.getProperty('config.order.orderAttributeType','NUMBER'),
            this.getProperty('config.order.orderType','ASC') == 'DESC' ? false : true
        );
    } else {
        orderList = null;
    }

    // pokreni
    var id,lobj,i;

    returnIndex = FM.isset(returnIndex) ? (returnIndex == true) : false;
    if(orderList) {
        for(i = 0; i < orderList.length; i++) {
            lobj = orderList[i];
            if(lobj && FM.isset(lobj.getDataID)) {
                id = lobj.getDataID();
                if(!doFn(id,lobj)) return(returnIndex ? id : lobj);
            }
        }
    } else {

        for(id in this.objectsList) {
            lobj = this.objectsList[id];
            if(FM.isset(lobj.getID)) {
                if(!doFn(id,lobj)) return(returnIndex ? id : lobj);
            }
        }
    }

    // kraj
    return(returnIndex ? -1 : null);
}

/**
* Create list filter
* @public
* @function    
* @param {function} callbackFn Callback for creating list
* @param {object} startFilter Master filter
* @returns {object} List filter
*/                    
FM.DmList.prototype.createListFilter = function(callbackFn,startFilter) {
    var lst = {};
    var cbFn = FM.isset(callbackFn) ?  callbackFn : function(){
        return false;
    };
    var fltStart = FM.isset(startFilter) ?  startFilter : null;

    this.forEachListElement(function(index,iObj) {
        if(!fltStart || FM.isset(fltStart[iObj.getDataID()])) {
            if(cbFn(iObj)) lst[iObj.getDataID()] = iObj;
        }
        return true;
    });

    return(lst);
}


/**
* Create list index
* @public
* @function    
* @param {string} attr Attribute name 
* @param {string} attrtype Attribute type (STRING,DATE,NUMBER)
* @param {boolean} asc Ascending
* @param {object} filterTable list filter to use
* @returns {object} List index
*/                    
FM.DmList.prototype.createListIndex = function(attr,attrtype, asc,filterTable) {
    var lst = [];
    this.forEachListElement(function(index,iObj) {
        if(!FM.isset(filterTable) || FM.isset(filterTable[iObj.getDataID()])) lst.push(iObj);
        return true;
    });

    var sortFn = function(a,b) {
        var at,bt;
        if(attrtype == 'DATE') {
            at = FM.parseDateString(a.getAttr(attr,''),true);
            bt = FM.parseDateString(b.getAttr(attr,''),true);
        } else if(attrtype == 'NUMBER') {
            at = parseFloat(a.getAttr(attr,'0'),true);
            bt = parseFloat(b.getAttr(attr,'0'),true);
        } else { // STRING
            at = a.getAttr(attr,'').toString();
            bt = b.getAttr(attr,'').toString();
        }

        return(
            at > bt ? 1 : (at == bt ? 0: -1)
            );
    }

    lst.sort(sortFn);
    if(FM.isset(asc) && asc == false) lst.reverse();

    return(lst);
}


/**
* Return soprt options from list congig
* @public
* @function    
* @return {array} sortOptions
*/                    
FM.DmList.prototype.getSortOptions = function() {
    this.getProperty('config.sortOptions',{});
}

/**
* Add  objects from fetch response to list. Fires <i>onListEnd</i> event.
* @public
* @function
* @param {object} response Fetch response
* @param {boolean} onlyExisting Replace only existing object 
* @param {string} groupid ID od objects group
* @param {boolean} protectDirty Don't change dirty objects
*/            

FM.DmList.prototype.addResponseToList = function(response,onlyExisting,groupid,protectDirty) {
    response = 
        FM.isset(response) && response ? 
        response : null
    ;

    // init
    var added = {};
    var updated = {};
    var responseParser = this.getProperty('config.responseParser',null);
    var listType = this.getProperty('config.listType',"collection"); // collection|single
    
    // za svaki ili samo jednom
    var respCol = [];
    if(response && FM.isObject(response) && FM.isset(response.getAttr)) {
        var rlprop = this.getProperty('config.dataProperty',null);
        var val = response.getAttr("value",null);
        if(listType == 'single') {
            if(val) respCol = [rlprop ? FM.getAttr(val,rlprop,null) : val];
        } else if(listType == 'none') {
            respCol = [];
        } else {
            respCol = rlprop ? FM.getAttr(val,rlprop,null) : val;
            if(!FM.isObject(respCol) && !FM.isArray(respCol)) {
                respCol = [];
            }
        }
    }

    var lstObj = null;
    for(var respId in respCol) {
        if(responseParser) {
            lstObj = responseParser({dmList: this, response: respCol[respId]});
            if(!lstObj) {
                this.fireEvent("onListError",new FM.DmGenericError({
                    messageId: -1,
                    text: 'Data error: invalid response.'
                }));
                return false;
            }
        } else {
            lstObj = respCol[respId];
        } 
        
        // osvjezimo listu
        // objekti se ne zamijenjuju, radi se update da ostanu reference na obj ok
        var oldObj = this.get(lstObj.getDataID());
        if(oldObj) {
            updated[lstObj.getDataID()] = lstObj;
        } else {
            added[lstObj.getDataID()] = lstObj;
        }
    }
    
    return this.refreshList(
        {Added: added, Updated: updated, Removed: {}},onlyExisting,groupid,protectDirty
    );
}


FM.DmList.prototype._refreshAdd = function(list,retList,onlyExisting,groupid,protectDirty) {
    var id,oValue,oOldValue;
    
    for(id in list) {
        oValue = list[id];
        oOldValue = this.get(oValue.getDataID());
        if(!oOldValue || !onlyExisting) {
            if(oOldValue) { // vec postoji, ako nije editiran zamijenimo ga
                if(!oOldValue.isChanged() || !protectDirty) {
                    oValue.forEachAttr(function(name,value) {
                        oOldValue.setAttr(name,value,false); // ne zovi evente
                        return true;
                    });
                    if(groupid && !oOldValue.isInGroup(groupid)) {
                        oOldValue.addGroup(groupid);
                    }
                    retList.Updated[oOldValue.getDataID()] = oOldValue;
                    retList.listCount++;
                }
            } else {
                if(groupid && !oValue.isInGroup(groupid)) {
                    oValue.addGroup(groupid);
                }                
                this.set(oValue, oValue.getDataID());
                retList.Added[oValue.getDataID()] = oValue;
                retList.listCount++;
            }
        }
    }    
}

/**
* Add objects to list. Fires <i>onListEnd</i> event.
* @public
* @function
* @param {object} response List of updated, deleted and inserted objects (onListEnd format)
* @param {boolean} onlyExisting Replace only existing object 
* @param {string} groupid ID od objects group
* @param {boolean} protectDirty Ignore changed objects
* @param {boolean} callEvents Call events  (default is true)
*/            
FM.DmList.prototype.refreshList = function(response,onlyExisting,groupid,protectDirty,callEvents) {
    var id,oValue,oOldValue;
    
    // def params
    onlyExisting = FM.isset(onlyExisting) && onlyExisting == true ? true : false;
    groupid = FM.isset(groupid) && groupid ? groupid : null;
    protectDirty = FM.isset(protectDirty) && protectDirty  == true ? true : false;
    response = 
        FM.isset(response) && response ? 
        response : null
    ;
    callEvents = FM.isset(callEvents) && callEvents  == false ? false : true;
    
    // init
    var retList = {
        listCount: 0,
        Removed: {},
        Added: {},
        Updated: {}
    };        

    // dodani
    if(FM.isset(response) && FM.isset(response.Added)) {
        this._refreshAdd(response.Added,retList,onlyExisting,groupid,protectDirty);
    }
    if(FM.isset(response) && FM.isset(response.Updated)) {
        this._refreshAdd(response.Updated,retList,onlyExisting,groupid,protectDirty);
    }
    
    // brisani
    if(FM.isset(response) && FM.isset(response.Removed)) {
        for(id in response.Removed) {
            oValue = response.Removed[id];
            oOldValue = this.get(oValue.getDataID());
            if(groupid) {
                // makni grupu
                if(oOldValue.isInGroup(groupid)) {
                    oOldValue.removeGroup(groupid);
                }
                // micemo ga samo ako je broj grupa 0
                if(oOldValue.getGroupsCount() < 1) {
                    this.removeFromList(id, false);
                    retList.Removed[id] = this.get(id,oOldValue);
                    retList.listCount++;
                } else {
                    retList.Updated[id] = oOldValue;
                    retList.listCount++;
                }
            } else {
                this.removeFromList(id, false);
                retList.Removed[id] = this.get(id,null);
                retList.listCount++;
            }
        }
    }

    // posalji evente za change
    for(id in retList.Updated) {
        oOldValue = retList.Updated[id];
        oOldValue.setChanged(false,true); // call ev
    }
    
    // ako je listType none uvijek posalji event
    if(this.getProperty('config.listType',"collection") == 'none') {
        callEvents = true;
    }
    // kraj
    if(callEvents) this.fireEvent("onListEnd",retList);

    // kraj
    return(true);
}

// == static ===================================================================
FM.DmList.className = "DmList";
FM.DmList.fullClassName = 'dm.DmList';

FM.DmList.DEF_FETCH_SIZE = 20;

FM.DmList.configurations = {};

/**
* Add new DmList configuration
* @static
* @function    
* @param {String} name Name of configuration
* @param {object} config Confiruation
*/   

FM.DmList.addConfiguration = function(name,config) {
    FM.DmList.configurations[name] = config;
    return true;
}

/**
* Returns new DmList with <b>config</b> configuration
* @static
* @function    
* @param {object} attrs list of attributes
* @param {String} config Confiruation name
* @return {object} list configuration or null if not found
*/   
FM.DmList.getConfiguration = function(name) {
    return FM.getAttr(FM.DmList.configurations,name,null);
}

/**
* Returns new DmList winth <b>config</b>  configuration
* @static
* @function    
* @param {object} attrs list of attributes
* @param {String} config Confiruation name
* @return {FM.DmList} new DmList
*/   
FM.DmList.newList = function(attrs,config) {            
    return new FM.DmList(attrs,FM.getAttr(FM.DmList.configurations,config,{}));
}

/**
* For each DmObject in list call function <i>doFn(id,attr)</i> until end of list or <i>false</i> return value.    
* @static
* @function    
* @param {object} list DmObject collection
* @param {function} doFn Callback function
* @param {boolean} returnIndex Return index of DmObject instead DmObject itself
* @param {object} orderList List index 
* @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return DmObject (or data id of DmObject) otherwise null or -1
*/   
FM.DmList.forEachListElement = function(list,doFn,returnIndex,orderList) {
    var id,lobj,i;

    returnIndex = FM.isset(returnIndex) ? (returnIndex == true) : false;
    orderList =
        FM.isset(orderList) && orderList && (FM.isArray(orderList) && orderList.length > 0) ?
        orderList : null;

    if(orderList) {
        for(i = 0; i < orderList.length; i++) {
            lobj = orderList[i];
            if(lobj && FM.isset(lobj.getDataID)) {
                id = lobj.getDataID();
                if(!doFn(id,lobj)) return(returnIndex ? id : lobj);
            }
        }
    } else {
        for(id in list) {
            lobj = list[id];
            if(FM.isset(lobj.getID)) {
                if(!doFn(id,lobj)) return(returnIndex ? id : lobj);
            }
        }
    }
    return(returnIndex ? -1 : null);
}

/**
* Get collection size
* @static
* @function    
* @param {object} list Collection
* @param {function} filterFn Callback to filter collection
* @returns {number} Number of elements in collection
*/                    
FM.DmList.getListSize = function(list,filterFn) {
    var n = 0;
    FM.DmList.forEachListElement(list,function(id,obj) {
        if(FM.isset(filterFn)) {
            if(filterFn(obj) == true) n++;
        } else {
            n++;
        }
        return true;
    });

    return n;
}        

