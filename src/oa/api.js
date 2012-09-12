// -- api namespace ------------------------------------------------------------
if(typeof(oneapi) == 'undefined') {
    oneapi = function() {};

    // session
    oneapi.session = {};
    oneapi.session.version = '0.1';        
    oneapi.session.app = null;
    oneapi.session.listeners = {};    
    oneapi.session.evHandler = {};
    oneapi.ml = {};    
    // methods
    
    
    /** Returns Infobip API version
    * 
    */
    oneapi.getVersion = function() {
        return oneapi.session.version;
    }

    /*
     * Inicijalizacija, options su tu za slucaj kad zelimo i widgete
     * pa moramo aplikaciju konfigurirati drugacije
     * Vraca app / null
     */
    oneapi.init = function(args,options) {
        args = FM.isset(args) && args ? args : {};
        options = FM.isset(options) && options ? options : {
            appClass: 'OA.AppOneApi',
            dmObject: new FM.DmObject(args)
        }
        oneapi.session.app = FM.AppObject.startApp(options,oneapi.session.evHandler);
                
        return oneapi.session.app;
    }

    /*
     * Events
     */    
    oneapi._procEvents = function(ev,data) {
        if(!FM.isset(oneapi.session.listeners[ev])) {
            return true;
        }        
        
        var lst = oneapi.session.listeners[ev];
        for(var i = 0; i <lst.length;i++)  {
            if(FM.isFunction(lst[i])) {
                try {
                    lst[i](data);
                } catch(e) {}
            }
        }
        
        return true;
    }
    
    oneapi.addListener = function(ev,cbFn) {
        if(!FM.isset(oneapi.session.listeners[ev])) {
            oneapi.session.listeners[ev] = [];
        }        
        for(var i = 0; i < oneapi.session.listeners[ev].length;i++)  {
            if(oneapi.session.listeners[ev][i] == cbFn) return true;
        }
        oneapi.session.listeners[ev].push(cbFn);
        
        if(!FM.isset(oneapi.session.evHandler[ev])) {
            oneapi.session.evHandler[ev] = function(sender,data) {
                oneapi._procEvents(ev,data);
            }
        }
        return true;
    }
    
    oneapi.removeListener = function(ev,cbFn) {
        if(!FM.isset(oneapi.session.listeners[ev])) {
            return true;
        }        
        
        var nlist = [];
        for(var i = 0; i < oneapi.session.listeners[ev].length;i++)  {
            if(oneapi.session.listeners[ev][i] != cbFn) {
                nlist.push(oneapi.session.listeners[ev][i]);
            }
        }
        oneapi.session.listeners[ev] = nlist;
        return true;
    }

    // == API methods ==========================================================
    /*
     * login & signup
    */
    oneapi.login = function(username,password,callbackFn) {
        oneapi.session.app.login(username, password,callbackFn);
    }
    
    oneapi.logout = function() {
        return oneapi.session.app.logout();
    }

    oneapi.verifyAccount = function(vercode,callbackFn) {
        return oneapi.session.app.verifyAccount(vercode,callbackFn);
    }
    
    oneapi.signup = function(oCustomer,callbackFn) {
        return oneapi.session.app.signup(oCustomer,callbackFn);
    }

    oneapi.generateCaptcha = function(width,height,imageFormat,domNodeId,callbackFn) {        
        return oneapi.session.app.getCaptcha(width,height,imageFormat,function(isok, oCaptcha) {
            // obradi, pozovi cb
                var url = oCaptcha.getImageUrl();
                var node = document.getElementById(domNodeId);                
                if(node) {
                    node.src = url;
                }

            if(FM.isset(callbackFn) && callbackFn && FM.isFunction(callbackFn)) {
                callbackFn(isok, oCaptcha);
            };
        })
    }

    oneapi.checkPasswordStrength = function(password,callbackFn) {
        return oneapi.session.app.checkPasswordStrength(password,callbackFn);
    }

    oneapi.generatePassword = function(callbackFn) {
        return oneapi.session.app.generatePassword(callbackFn);
    }

    oneapi.checkUsernameAvialiability = function(username,callbackFn) {
        return oneapi.session.app.checkUsernameAvialiability(username,callbackFn);
    }

    /*
    * Customer
    */
    oneapi.getCustomerId = function() {
        return oneapi.session.app.getCustomerId();
    }
   
    oneapi.getCustomerProfile = function(id,callbackFn) {
        id = FM.isset(id) && id && id != '' ? id : 'me';
        return oneapi.session.app.getCustomerProfile(id,callbackFn);
    }
    
    
    oneapi.updateCustomerProfile = function(oCustomer,callbackFn) {
        oCustomer = FM.isset(oCustomer) && oCustomer ? oCustomer : 'me';
        return oneapi.session.app.updateCustomerProfile(oCustomer,callbackFn);
    }
 
    oneapi.createCustomerProfile = function(attrs,callbackFn) {
        attrs = attrs = FM.isset(attrs) ? attrs : {};
        
        // kreiraj novi profil
        var oCustomer = FM.DmObject.newObject('CustomerProfiles', attrs);
        if(!oCustomer) {
            // ako imas cb fn
            if(callbackFn) try {
                callbackFn(false,null);
            } catch(e) {}
            return null;
        }
        
        return oneapi.session.app.createCustomerProfile(oCustomer,callbackFn);
    }

    oneapi.deleteCustomerProfile = function(id,callbackFn) {
        id = FM.isset(id) && id && id != '' ? id : 'me';
        return oneapi.session.app.deleteCustomerProfile(id,callbackFn);                    
    }

    oneapi.getAccountBalance = function(callbackFn) {
        return oneapi.session.app.getAccountBalance(callbackFn);                    
    }


    /*
    * SMS
    */
    oneapi.sendSMS = function(oSmsMessage,callbackFn) {
        return oneapi.session.app.sendSMS(oSmsMessage,callbackFn);
    }
   
    oneapi.queryDeliveryStatus = function(address,clientCorrelatorOrResourceReference,callbackFn) {
        return oneapi.session.app.sendSMS(address,clientCorrelatorOrResourceReference,callbackFn);
    }

    oneapi.retrieveInboundMessages = function(
    /*
        destinationAddress,notifyURL,
        criteria,notificationFormat,
        callbackData,
        clientCorrelator,
    */
        page,pageSize,
        callbackFn
    ) {
        return oneapi.session.app.retrieveInboundMessages(
        /*
            destinationAddress,notifyURL,
            criteria,notificationFormat,
            callbackData,
            clientCorrelator,
        */
            page,pageSize,
            callbackFn
        );
    }
   
   
    oneapi.subscribeToInboundMessagesNotifications = function(
        destinationAddress,notifyURL,
        criteria,notificationFormat,
        callbackData,
        clientCorrelator,
        callbackFn
    ) {
        return oneapi.session.app.subscribeToInboundMessagesNotifications(
            destinationAddress,notifyURL,
            criteria,notificationFormat,
            callbackData,
            clientCorrelator,
            callbackFn
        );
    }

    oneapi.getAvailableNumbersToBuy = function(
        countryId, dateFrom, dateTo, criteria, free,
        page, pageSize,
        callbackFn
    ) {
        return oneapi.session.app.getAvailableNumbersToBuy(
            countryId,dateFrom,dateTo,criteria,free,page,pageSize,callbackFn
        );
    }

    oneapi.getFreeTrialNumber = function(
        notifyURL,
        callbackFn
    ) {
        return oneapi.session.app.getFreeTrialNumber(
            notifyURL,callbackFn
        );
    }


    /*
    * Hlr
    */
    oneapi.retrieveRoamingStatus = function(
        sAddress,sNotifyURL, bExternalData, 
        sClientCorrelator, sCallbackData, callbackFn
    ) {
        return oneapi.session.app.retrieveRoamingStatus(
            sAddress,sNotifyURL, bExternalData, 
            sClientCorrelator, sCallbackData, callbackFn
        );
    }
    
    
    /*
    * Utils
    */
    oneapi.getCountries = function(code,callbackFn) {
        return oneapi.session.app.getCountries(code,callbackFn);
    }

    oneapi.getTimezones = function(code,callbackFn) {
        return oneapi.session.app.getTimezones(code,callbackFn);
    }
}
