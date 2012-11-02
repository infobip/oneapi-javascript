// -- osnovna APP klasa --------------------------------------------------------
OA.AppOneApi = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.AppOneApi,FM.AppObject); 

// properties
OA.AppOneApi.prototype.objectSubClass = "";
OA.AppOneApi.prototype.customersList = null;
OA.AppOneApi.prototype.userID = '';
OA.AppOneApi.prototype.appRegistry = null;


OA.AppOneApi.prototype._init = function(attrs) {            
    // set date format
    FM.dateTimeDivider = 'T';
    
    this.userID =  ''; // !test
    this.appRegistry = new FM.UtRegistry();
    this.customersList = new FM.DmList({},'cache');
    
    this._super("_init",attrs);    
    this.objectSubClass = "AppOneApi";

    if(!OA.apiLastErr) {
        OA.apiLastErr = new OA.DmApiError();
        OA.apiLastErr.addListener(this);
    }    

    // imas li token u cookie-u
    this.loadCredentials();
        
}

       
OA.AppOneApi.prototype.run = function() {
    this._super("run");
    this.userID =  ''; // !test
}

OA.AppOneApi.prototype.dispose = function() {        
    this._super("dispose");
}


OA.AppOneApi.prototype.getErrorObject = function(oErr) {
    oErr = FM.isset(oErr) && oErr ? oErr : '';
    
    if(FM.isString(oErr)) {
        oErr = new OA.DmApiError({
            serviceException: {
                messageId: (oErr == '' ? '0' : '999'),
                text: oErr
            }
        });
    }
    
    return oErr;
}

OA.AppOneApi.prototype.setLastError = function(oErr) {
    if(!FM.isset(oErr) || !oErr || !FM.isObject(oErr)) {
        oErr = new OA.DmApiError();
    }
    if(!OA.apiLastErr) {
        OA.apiLastErr = oErr;
        return OA.apiLastErr;
    }
    OA.apiLastErr.forEachAttr(function(attr,value) {
        OA.apiLastErr.setAttr(attr,oErr.getAttr(attr,null));
        return true;
    });
    OA.apiLastErr.setChanged(true,true); // posalji event
    return OA.apiLastErr;
}

// --  auth ------------------------------------------------------------
OA.AppOneApi.prototype._clearAuthData = function() {
    var dom = document.domain;
    if(dom.indexOf('.') > 0) {
        dom = dom.substr(dom.indexOf('.'));
    }
    FM.deleteCookie('IbAuthCookie',dom);

    OA.apiAuth.setAttr("username","");
    OA.apiAuth.setAttr("password","");
    OA.apiAuth.setAttr("verified",false);
    OA.apiAuth.setAttr("ibAuthCookie","");
    
}

OA.AppOneApi.prototype.saveCredentials = function() {
    if(OA.apiAuth)  {        
        var dom = document.domain;
        if(dom.indexOf('.') > 0) {
            dom = dom.substr(dom.indexOf('.'));
        }
        FM.saveCookie('IbAuthCookie', OA.apiAuth.getAttr('ibAuthCookie',''), -1,dom);
        FM.saveCookie('IbAuthCookieInfo', OA.apiAuth.getAttr(), -1,dom);
    }
}

OA.AppOneApi.prototype.loadCredentials = function() {
    var authArr = FM.loadCookie('IbAuthCookieInfo');    
    var authKey = FM.loadCookie('IbAuthCookie',true);
    authArr['ibAuthCookie'] = authKey;
    authArr = authArr && FM.isObject(authArr) ? authArr : {
        username: "",
        ibAuthCookie: "",
        verified: false        
    };
    
    // if credentials object is not created yet
    if(!OA.apiAuth) {
        OA.apiAuth = FM.DmObject.newObject('UserCredentials', {
            username:   FM.getAttr(authArr,'username',''),
            ibAuthCookie: FM.getAttr(authArr,'ibAuthCookie',''),
            verified: FM.getAttr(authArr,'verified','false') == 'true'
        });
        OA.apiAuth.addListener(this);        // add app listener
    }    
}

// pr .login(DmUserLoginData,cbfn)
OA.AppOneApi.prototype.login = function(username, password,cbfn) {
    if(FM.isObject(username) && FM.isset(username.getSubClassName) && username.getSubClassName() == 'DmUserLoginData') {
        cbfn = password;
        var o = username;
        username = o.getAttr('username','');
        password = o.getAttr('password','');
    }
    var me = this;
    var dmlist = new FM.DmList({
        username: username, 
        password: password
    },
    'USER_login'
    );
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            var oCred = null;
            FM.forEach(data.Added,function(id, obj) {
                oCred = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            oCred.forEachAttr(function(name,value) {
                OA.apiAuth.setAttr(name,value);
                return true;
            });
            OA.apiAuth.setAttr('username',username);
            me.saveCredentials();
            OA.apiAuth.setChanged(true,true); // posalji event
            callbackFn(true,OA.apiAuth);
            
            // posalji auth changed
            me.fireEvent('onAuthChanged',OA.apiAuth);
            return true;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();            
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();
}


OA.AppOneApi.prototype.logout = function(cbfn) {
    var me = this;
    var dmlist = new FM.DmList({},'USER_logout');
        
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    var dom = document.domain;
    if(dom.indexOf('.') > 0) {
        dom = dom.substr(dom.indexOf('.'));
    }
    
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        
        onListEnd: function(sender,data) {
            me._clearAuthData();
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            OA.apiAuth.setChanged(true,true);
            callbackFn(true,OA.apiAuth);
            me.fireEvent('onAuthChanged',OA.apiAuth);
            return true;
        },
        onListError: function(sender,data) {
            me._clearAuthData();
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            OA.apiAuth.setChanged(true,true);
            callbackFn(true,OA.apiAuth);
            me.fireEvent('onAuthChanged',OA.apiAuth);
            return true;
        }
      
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
     
    return true;
}


// country cache
OA.AppOneApi.prototype.getCountries = function(code,cbfn) {        
    // 
    code = FM.isset(code) && code ? code : '';
    var me = this;
    var dmlist = new FM.DmList({
        countryCode: code 
    },'UTIL_countries'
    );
    
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            dmlist.removeListener(lstnr);
            callbackFn(true,dmlist);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
}

OA.AppOneApi.prototype.getLanguages = function(code,cbfn) {        
    // 
    code = FM.isset(code) && code ? code : '';
    var me = this;
    var dmlist = new FM.DmList({
        countryCode: code 
    },'UTIL_languages'
    );
    
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            dmlist.removeListener(lstnr);
            callbackFn(true,dmlist);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
}

OA.AppOneApi.prototype.sendSMS = function(oSmsMessage,cbfn) {        
    // 
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    if(!FM.isset(oSmsMessage) || !oSmsMessage) {
        callbackFn(false,null);
        return;
    }
    
    var me = this;
    var dmlist = new FM.DmList(oSmsMessage.getAttr(),'SMS_send');
    if(oSmsMessage.getAttr('clientCorrelator','') == '') {
        dmlist.setAttr('clientCorrelator',FM.generateNewID());
    }
    
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            var oRef = null;
            FM.forEach(data.Added,function(id, obj) {
                oRef = obj;
                oRef.setAttr('resourceObject',oSmsMessage.getAttr());
                oRef.setAttr('resourceObject.clientCorrelator',dmlist.getAttr('clientCorrelator',''));
                return false;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(true,oRef);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
}

/* WORK IN PROGRESS */
OA.AppOneApi.prototype.deleteInboundSubscription = function(oSub,cbfn) {
    // 
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    
    var me = this;
    var params = {
        subscriptionId: oSub.getAttr('subscriptionId','')
    };
    
   
    var dmlist = new FM.DmList(params,'SMS_inbound_sub_delete');    
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            var oNums = [];
            FM.forEach(data.Added,function(id, obj) {
                oNums.push(obj);
                return true;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(true,oNums);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();                
}


OA.AppOneApi.prototype.retrieveInboundSubscriptions = function(
    /*
    destinationAddress,notifyURL,
    criteria,notificationFormat,
    callbackData,
    clientCorrelator,
*/
    page,pageSize,
    cbfn
    ) {
    // 
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    
    var me = this;
    var params = {};
    if(FM.isset(page) && page) params['page'] = page;
    if(FM.isset(pageSize) && pageSize) params['pageSize'] = pageSize;
    
    /*
    var params = {
        destinationAddress: destinationAddress
    };
    if(FM.isset(notifyURL) && notifyURL) params['notifyURL'] = notifyURL;
    if(FM.isset(criteria) && criteria) params['criteria'] = criteria;
    if(FM.isset(notificationFormat) && notificationFormat) params['notificationFormat'] = notificationFormat;
    if(FM.isset(callbackData) && callbackData) params['callbackData'] = callbackData;
    if(FM.isset(clientCorrelator) && clientCorrelator) params['clientCorrelator'] = clientCorrelator;
    */
   
    var dmlist = new FM.DmList(params,'SMS_inbound_sub_get');
    
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {            
            var oMsgs = [];
            FM.forEach(data.Added,function(id, obj) {
                oMsgs.push(obj);
                return true;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(true,oMsgs);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
}

OA.AppOneApi.prototype.subscribeToInboundMessagesNotifications = function(
    destinationAddress,notifyURL,
    criteria,notificationFormat,
    callbackData,
    clientCorrelator,
    cbfn
    ) {
    // 
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    
    var me = this;
    var params = {
        destinationAddress: destinationAddress
    };
    if(FM.isset(notifyURL) && notifyURL) params['notifyURL'] = notifyURL;
    if(FM.isset(criteria) && criteria) params['criteria'] = criteria;
    if(FM.isset(notificationFormat) && notificationFormat) params['notificationFormat'] = notificationFormat;
    if(FM.isset(callbackData) && callbackData) params['callbackData'] = callbackData;
    if(FM.isset(clientCorrelator) && clientCorrelator) params['clientCorrelator'] = clientCorrelator;
   
    var dmlist = new FM.DmList(params,'SMS_inbound_sub_add');
    
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {            
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(true,data);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
}
        
OA.AppOneApi.prototype.retrieveRoamingStatus = function(
    sAddress,sNotifyURL,
    bExternalData, sClientCorrelator, sCallbackData, 
    cbfn
    ) {
    // 
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    if(!FM.isset(sAddress) || sAddress == '') {
        callbackFn(false,null);
        return;
    }
    
    var me = this;
    var params = {
        address: sAddress
    };
    if(FM.isset(sNotifyURL) && sNotifyURL != '' && sNotifyURL != null) {
        params['notifyURL'] = sNotifyURL;
    }
    /*
    if(FM.isset(bExternalData) && bExternalData != null) {
        params['includeExtendedData'] = bExternalData != true;
    }
    if(FM.isset(sClientCorrelator) && sClientCorrelator != '' && sClientCorrelator != null) {
        params['clientCorrelator'] = sClientCorrelator;
    }
    if(FM.isset(sCallbackData) && sCallbackData != '' && sCallbackData != null) {
        params['callbackData'] = sCallbackData;
    }
    */
    var dmlist = new FM.DmList(params,'HLR_send');
    
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            var oRef = null;
            FM.forEach(data.Added,function(id, obj) {
                oRef = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            if(!oRef.isAttr('currentRoaming'))  { // not found
                me.setLastError(new FM.DmGenericError({messageId: 'CLI0001', text: 'Unable to query roaming status'}));
                callbackFn(false,OA.apiLastErr);
                return true;
            }
            callbackFn(true,oRef);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
}

OA.AppOneApi.prototype.updateInboundSubscription = function(oSub,cbfn) {
    // 
    var me = this;
    var callbackFn = FM.isset(cbfn) && FM.isFunction(cbfn) ? cbfn : function() {};
    
    var dmlist = new FM.DmList({
        notifyURL: oSub.getAttr('notifyURL',''),
        subscriptionId: oSub.getAttr('subscriptionId','')
        },'SMS_inbound_update');    
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            callbackFn(true,null);
            return dmlist;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            
            dmlist.removeListener(lstnr);
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };
    dmlist.addListener(lstnr);
    dmlist.getData();            
}



OA.AppOneApi.prototype.isAuthenticated = function() {
    return OA.apiAuth.isAuthenticated();
}

OA.AppOneApi.prototype.onDoLogin = function(sender,evdata) {
    var dmobj = FM.getAttr(evdata,'object',null);
    if(!dmobj) return;
    
    this.login(dmobj.getAttr('username',''), dmobj.getAttr('password',''),FM.getAttr(evdata,'callback',null));
}

OA.AppOneApi.prototype.onDoLogout = function(sender,evdata) {
    this.logout(FM.getAttr(evdata,'callback',null));
}

// --  customer --------------------------------------------------------
OA.AppOneApi.prototype.getCustomerId = function() {
    return(OA.apiAuth.getAttr('id',''));
}

OA.AppOneApi.prototype.getCustomerProfile = function(id,callbackFn) {
    var oProfile = null;
    var me = this;
    
    // ako je new
    if(id == 'new') {
        oProfile = new OA.DmCustomerProfile({
            id: 'new'
        });
        if(FM.isset(callbackFn)) {
            callbackFn(true,oProfile);
        }
        return(oProfile);        
    }
        
    // ako nisi auth
    if(!OA.apiAuth.isAuthenticated()) {
        if(FM.isset(callbackFn)) {
            callbackFn(false,oProfile);
        }
        return(oProfile);                
    }
    
    // auth je ok i nije new
    if(id == 'me' || id == OA.apiAuth.getAttr('id','')) {        
        id = '';
    }
    
    oProfile = this.customersList.get(id == '' ? OA.apiAuth.getAttr('id','') : id);

    // ako nije fetchan a callback nije poslan vrati null
    // samo u slucaju kad je auth prosao
    if(!oProfile && FM.isset(callbackFn)) {
        return this.fetchCustomerProfile(id,function(ok, cp) {
            /*
            if(ok && id == '') {
                OA.apiAuth.setAttr('username',cp.getAttr('username',''))
                me.saveCredentials();
            }*/
            if(callbackFn) {
                callbackFn(ok,cp);
            }
        });
    } else if(oProfile && oProfile.getAttr('id','y') == OA.apiAuth.getAttr('id','x')) {
        OA.apiAuth.setAttr('username',oProfile.getAttr('username',''))
        this.saveCredentials();        
    }

    // kraj
    if(FM.isset(callbackFn)) {
        callbackFn(true,oProfile);
    }
    return(oProfile);
}


// 
OA.AppOneApi.prototype.fetchCustomerProfile = function(id,callbackFn) {
    id = id == 'me' ? '' : id;
    callbackFn = FM.isset(callbackFn) ? callbackFn : function() {};

    var me = this;
    var dmlist = new FM.DmList({
        userId: id
    },'CUSTOMER_profile_get');
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            var oProfile = null;
            FM.forEach(data.Added,function(id, obj) {
                oProfile = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.customersList.refreshList(data,false,'', false,true);
            try {
                callbackFn(true,oProfile);
            } catch(e) {}
            return true;
        },
        onListError: function(sender,data) {                                   
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };                
    dmlist.addListener(lstnr);
    dmlist.getData();
}


// callbackFn(ev,data)
OA.AppOneApi.prototype.updateCustomerProfile = function(oCustomer,callbackFn) {
    callbackFn = FM.isset(callbackFn) && callbackFn && FM.isFunction(callbackFn) ? callbackFn : function() {};
    oCustomer = 
    !FM.isset(oCustomer) || !oCustomer || oCustomer == '' || oCustomer == 'me'?
    this.getCustomerProfile() :  oCustomer
    ;

    if(!oCustomer || oCustomer.getSubClassName() != 'CustomerProfile') { 
        if(FM.isset(callbackFn)) {
            try {
                callbackFn(false,null);
            } catch(e) {}
        }
        return false;
    }

    var dmlist = new FM.DmList(oCustomer.getAttr(),'CUSTOMER_profile_update');
    var me = this;
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.customersList.refreshList(data,false,'', false,true);
            callbackFn(true,me.customersList.get(oCustomer.getDataID()));
            return true;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }  
    };

    dmlist.addListener(lstnr);                
    dmlist.getData();
    return true;
},

OA.AppOneApi.prototype.createCustomerProfile = function(oCustomer,callbackFn) {            
    callbackFn = FM.isset(callbackFn) && callbackFn && FM.isFunction(callbackFn) ? callbackFn : function() {};
    oCustomer = 
    FM.isset(oCustomer) && oCustomer && oCustomer.getSubClassName() == 'CustomerProfile' ?
    oCustomer : 
    null
    ;

    if(!oCustomer) { 
        if(FM.isset(callbackFn)) {
            try {
                callbackFn(false,null);
            } catch(e) {}
        }
        return false;
    }

    var uname = oCustomer.getAttr('username','');
    var pass = oCustomer.getAttr('password','');

    var dmlist = new FM.DmList(oCustomer.getAttr(),'CUSTOMER_profile_create');
    var me = this;
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            // nadji novi cp                     
            var oNewCustomer = null;
            dmlist.forEachListElement(function(pname,value) {
                oNewCustomer = value;
                return false;
            });                    

            // disposaj listu
            dmlist.removeListener(lstnr);
            dmlist.dispose();

            // akjo nismo nasli novi cp
            if(!oNewCustomer) {
                if(FM.isset(callbackFn) && callbackFn) callbackFn(false,oNewCustomer);
                return true;
            }

            // da bi nam ml host radio moramo new objekt "prepisati" (da ptr. na dmobjekt ostane isti)
            var oOldCustomer = me.customersList.get('new');
            if(oOldCustomer) {
                oOldCustomer.forEachAttr(function(name, value) {
                    oOldCustomer.setAttr(name,oNewCustomer.getAttr(name,''));
                    return true;
                });
                me.customersList.addToList(oOldCustomer,oOldCustomer.getDataID(),true);
                me.customersList.removeFromList('new',true);
                oOldCustomer.setChanged(true,true);                        
            } else {
                me.customersList.addToList(oNewCustomer,oNewCustomer.getDataID(),true);
                oOldCustomer = oNewCustomer;
            }


            if(FM.isset(callbackFn) && callbackFn) callbackFn(true,oOldCustomer);
            return true;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }  
    };

    dmlist.addListener(lstnr);                
    dmlist.getData();
    return true;
}

OA.AppOneApi.prototype.deleteCustomerProfile = function(id,callbackFn) {
    id = FM.isset(id) ? (id == 'me' ? this.getCustomerId() : id) : this.getCustomerId();
    callbackFn = FM.isset(callbackFn) ? callbackFn : function() {};

    var me = this;
    var dmlist = new FM.DmList({
        id: id
    },'CUSTOMER_profile_delete');
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            if(me.customersList.get(id)) {
                me.customersList.removeFromList(id,true);
            }
            try {
                callbackFn(true);
            } catch(e) {}
            return true;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };                
    dmlist.addListener(lstnr);
    dmlist.getData();
}

OA.AppOneApi.prototype.getAccountBalance = function(callbackFn) {
    callbackFn = FM.isset(callbackFn) ? callbackFn : function() {};

    var me = this;
    var dmlist = new FM.DmList({
        },'CUSTOMER_balance_get');
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            var oBalance = null;
            FM.forEach(data.Added,function(id, obj) {
                oBalance = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            
            try {
                callbackFn(true,oBalance);
            } catch(e) {}
            return true;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };                
    dmlist.addListener(lstnr);
    dmlist.getData();
}

OA.AppOneApi.prototype.queryDeliveryStatus = function(address,clientCorrelatorOrResourceReference,callbackFn) {
    callbackFn = FM.isset(callbackFn) ? callbackFn : function() {};

    var me = this;
    var dmlist = new FM.DmList({
        senderAddress: address,
        requestID: clientCorrelatorOrResourceReference        
    },'DELIVERY_INFOS_get');
    var lstnr = {
        onListStart: function(sender,data) {
            me.setLastError();
            return true;
        },
        onListEnd: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            var oDeliveryInfo = null;
            FM.forEach(data.Added,function(id, obj) {
                oDeliveryInfo = obj;
                return false;
            });
            dmlist.removeListener(lstnr);
            
            try {
                callbackFn(true,oDeliveryInfo);
            } catch(e) {}
            return true;
        },
        onListError: function(sender,data) {
            dmlist.removeListener(lstnr);
            dmlist.dispose();
            me.setLastError(me.getErrorObject(data));
            callbackFn(false,OA.apiLastErr);
            return true;
        }
    };                
    dmlist.addListener(lstnr);
    dmlist.getData();        
}


OA.AppOneApi.prototype.onUpdateCustomerProfile = function(sender,evdata) {
    evdata = FM.isset(evdata) && FM.isObject(evdata) ? evdata : {};
    
    var oCustomer = FM.getAttr(evdata,'object',null);
    // 
    if(!oCustomer || (this.isAuthenticated() != true && oCustomer.getAttr('id','') != 'new')) return false;
    
    
    return  (
        oCustomer.getAttr('id','') != "new" ? 
        this.updateCustomerProfile(oCustomer,FM.getAttr(evdata,'callback',null)) : 
        this.createCustomerProfile(oCustomer,FM.getAttr(evdata,'callback',null))
        );
}

OA.AppOneApi.prototype.onCreateCustomerProfile = function(sender,evdata) {
    var oCustomer = this.customersList.get('new');
    if(!oCustomer) return false;
    return this.createCustomerProfile(oCustomer);            
}

OA.AppOneApi.prototype.onChange = function(oObj) {   
    if(oObj == OA.apiLastErr && OA.apiLastErr.getAttr("messageId") == 'SVC0003') {
        this._clearAuthData();
        //this.setLastError();
        OA.apiAuth.setChanged(true,true);
        this.fireEvent('onAuthChanged',OA.apiAuth);
    }
}   

OA.AppOneApi.className = "AppOneApi";
OA.AppOneApi.fullClassName = 'oa.AppOneApi';
    
