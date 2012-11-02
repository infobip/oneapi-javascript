if(typeof(FM) == 'undefined') {
    /**
    * @namespace Basic SDK namespace
    */
    FM = function() {};    
}


// propertyes
FM.version = '0.1';

// static methods
FM.isset = function(obj) {
    return (typeof(obj) != 'undefined');
}


FM.isString = function(obj){
    return (typeof obj == 'string' && obj !== null);
}

FM.isFunction = function (obj){
    return (typeof obj == 'function'  && obj !== null);
}

FM.isArray = function(obj) {
    if(!FM.isset(obj) || !obj) return false;
    if (obj.constructor.toString().indexOf("Array") == -1)
        return false;
    else
        return FM.isset(obj.length);
}

FM.isObject = function(obj) {
    return (typeof obj == 'object' && obj !== null);
}

FM.isEqual = function(v1,v2,maxlvl, _l) {
    maxlvl = FM.isset(maxlvl) ? maxlvl : 9;
    _l = isset(_l) ? _l : -1;
    _l++;
    if(_l > maxlvl) return true;
    
    if(FM.isset(v1) && FM.isset(v2)) {
        var eq=true;
        
        if(FM.isObject(v1)) {
            if(!FM.isObject(v2)) return false;

            FM.forEach(v2, function(name,value){                
                if(!FM.isset(v1[name])) {
                    eq = false;
                }
                return(eq);
            });            

            if(eq) FM.forEach(v1, function(name,value){
                eq = FM.isEqual(value,v2[name],maxlvl, _l);
                return eq;
            });            
            return eq;
            
            
        } else if(FM.isArray(v1)) {
            if(!FM.isArray(v2)) return false;
            if(v1.length != v2.length) return false;
                
            for(var i=0; i < v1.length; i++) {
                if(!FM.isEqual(v1[i],v2[i],maxlvl, _l)) return false;
            }
            
            return true;
        }    
    }
    
    return(v1 == v2);
}

FM.isInstanceOf = function(object, constructorFunction) {
    while(object != null) {
        if (object == constructorFunction.prototype){
            return true;
        }
        object = object.__proto__;
    }
    return false;
}

FM.sizeOf = function(o) {
    if(!FM.isset(o) || o == null) return(-1);
    var i=0;
    for(var id in o) {
        i++;
    }
    return(i);
}


FM.applyTemplate = function(attrs,template,escapeValues,encodeValues) {
    var templ = FM.isset(template) && template ? template : "";
    var val;
    var me = this;

    // ako imas dmobject
    if(attrs) {
        FM.forEach(attrs,function(name,value) {
            if(!FM.isset(value) || !value) value = '';
            if(!FM.isFunction(value) && !FM.isObject(value) && !FM.isArray(value)) {                
                if(FM.isset(encodeValues) && encodeValues == true) {
                    val = FM.urlEncode(value.toString());
                } else {
                    val = value;
                }
                if(FM.isset(escapeValues) && escapeValues != false) {
                    val = FM.escapeStr(val);
                } 
                
                templ = templ.replace(new RegExp("\\[\\:" + name + "\\]","g"),val);
            }
            return true;
        });
    }

    // kraj
    return(templ);
}       

FM.stringPtrToObject = function(objptr,lm,app) {
    var akeys = objptr.split(".");
    if(akeys.length < 1) return null;

    var parent = akeys[0] == 'APP' ? app : (
        akeys[0] == 'LM' ? lm : (
            akeys[0] == '' ? window : FM
            )
        );
    var startIndex = 0;
    if(akeys[0] == 'APP' || akeys[0] == 'LM' || akeys[0] == '') {
        startIndex = 1;
    }

    for(var i = startIndex; i < akeys.length; i++) {
        if(!FM.isset(parent[akeys[i]])) return null;
        parent = parent[akeys[i]];
    }

    return parent;
}

FM.generateNewID = function() {
    return '_' + new Date().getTime() + "_" + Math.floor(Math.random()*1000000);
}        

FM._super_stack = function(me,method,on) {
    //var s = FM.getStackTrace().slice(3,4);
    var mStack = FM.getAttr(me,'_parent_call_stack', []);  
  
    if(on) {
        if(mStack.length == 0 || mStack[mStack.length-1].m != method ) {
            mStack[mStack.length] = {
                o: me, 
                m: method
            };

        } else {
            mStack[mStack.length] = {
                o: mStack[mStack.length-1].o._parent, 
                m: method
            }
        }
    } else {
        mStack = Array.prototype.slice.call(mStack, 0,mStack.length -1);        
    }

    me._parent_call_stack = mStack;
    return mStack;
}

FM._super = function() {
    var me = arguments[0]
    var callArgs = arguments[1];
    var method = callArgs[0];
    
    var mStack = FM._super_stack(me,method,true);
    try {
        // nadji klasu od koje polazis
        var fnThis = mStack[mStack.length-1].o;
        var retc = fnThis._parent[method].apply(me, Array.prototype.slice.call(callArgs, 1));
        
        // makni stack
        FM._super_stack(me,method,false);
        return retc;
    } catch(e) {
        // makni stack
        FM._super_stack(me,method,false);
        return undefined;
    }
}

FM.loadScript = function(url,cbfn) {
    var script = document.createElement("script")
    script.type = "text/javascript";
 
    if (script.readyState) { //IE
        script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                cbfn();
            }
        };
    } else { //Others
        script.onload = function () {
            cbfn();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}
 
FM.extend = function(oDest,oSrc,isclass) {
    isclass = FM.isset(isclass) && isclass;        
    oDest = oDest ? oDest : {};
    oSrc = oSrc ? oSrc : {};
    
    for (var property in oSrc) {
        oDest[property] = oSrc[property];
    }    

    if(FM.isset(isclass) && isclass == true) { 
        oDest._super = function() {
            return FM._super(this,arguments);
        }
    }

    return oDest;
}

FM.extendClass = function(oDest,oSrc) {        
    if(oSrc) {
        for (var property in oSrc.prototype) {
            oDest.prototype[property] = oSrc.prototype[property];
        }    
        oDest.prototype._parent = oSrc.prototype;
    } else {
        oDest.prototype._parent = null;
    }
    
    oDest.prototype._super = function() {
        return FM._super(this,arguments);
    }
    
    return oDest;
}


/**
* Clone object methods and propertyes. This function is not recursive
* @static
* @function 
* @returns {object} Returns copy of object
*/
FM.cloneObject = function(obj) {
    if(!FM.isset(obj) || !FM.isObject(obj)) return obj;    
    return FM.extend({},obj);
}



FM.isAttr = function(options,key) {
    if(!FM.isset(options) || !options || !FM.isset(key)) return false;

    var akeys = key.split(".");
    var ar = options;
    var val = null;
    for(var i = 0; i < akeys.length; i++) {
        var k = akeys[i].toString();
        if(!FM.isObject(ar) || !FM.isset(ar[k])) return false;
        ar = ar[k];
    }
    return true;
}

FM.getAttr = function(options,key,defv) {
    if(!options) return options;

    if(FM.isset(key)) {
        var akeys = key.split(".");
        var ar = options;
        var val = null;
        for(var i = 0; i < akeys.length; i++) {
            var k = akeys[i].toString();
            if(
                (!FM.isObject(ar) && !FM.isFunction(ar)) || !FM.isset(ar[k]) || ar[k] == null || (FM.isString(ar[k]) && ar[k] == '')
                ) {
                return(FM.isset(defv) ? defv : '');
            }
            ar = ar[k];
            val = ar;
        }

        return val == null ? (FM.isset(defv) ? defv : '') : val;
    } else {
        return FM.cloneObject(options);
    }
}

/**
* Set attribute of object
* @static
* @function 
* @param {object} options Object with attributes
* @param {string} undoList Undo list 
* @param {string} key Attribute name
* @param {string} val Value of attribute
* @returns {boolean} <i>true</i> if value of attribute is changed, otherwise <i>false</i>
*/
FM.setAttr = function(options,undoList,key,val) {
    var i,k,aname;
    var dirty = false;

    if(!options) return dirty;
    
    if(!FM.isString(key)) {
        for(k in val) {
            if(FM.isFunction(val[k]) || !key || FM.isset(options[k])) dirty = FM.setAttr(options,undoList,k,val[k]);
        }
        return dirty;
    }

    var akeys = key.split(".");
    var ar = options;    

    for(i = 0; i < akeys.length-1; i++) {
        k = akeys[i].toString();
        if(
            !FM.isObject(ar) || !FM.isset(ar[k]) || ar[k] == null || (FM.isString(ar[k]) && ar[k] == '')
            ) {
            return dirty;
        }
        ar = ar[k];
    }
    aname = akeys[akeys.length-1].toString();
    if(!FM.isObject(ar)) return dirty;

    if(FM.isset(ar[aname]) && ar[aname] == val) return dirty;
    if(undoList && FM.isset(options[akeys[0].toString()]))  {
        undoList[akeys[0].toString()] = options[akeys[0].toString()];
    }
    ar[aname] = val;
    dirty = true;
    return dirty;
}

FM.resolveAttrValue = function(options,attrName,def,callArgs) {
    var v = FM.getAttr(options,attrName,def);
    
    // if attr is function call it and return result    
    if(FM.isFunction(v)) {
        return(v(callArgs));
    }
    
    // if attr is string try to eval object
    if(FM.isString(v)) {
        var ptr = FM.stringPtrToObject(v);
        // if attr is evaluated to function
        if(FM.isFunction(ptr)) {
            return(ptr(callArgs));
        }
        if(ptr) {
            v= ptr;
        }
    }
    
    return v;
}

/**
* For each element in <i>ar</i> call function <i>doFn(id,elm)</i> until end of list or <i>false</i> return value
* @static
* @function 
* @param {object} [ar={}] 
* @param {function} [doFn={}]
* 
*/
FM.forEach = function(ar,doFn) {
    ar = FM.isset(ar) ? ar : {};
    for(var aname in ar) {
        if(!doFn(aname,ar[aname])) return(aname);
    }
    return null;
}

FM.removeArrayElement = function(arr,index) {
    var newarr = [];

    for(var ai in arr) {
        if(ai != index) newarr.push(arr[ai]);
    }

    return newarr;
}

FM.serialize = function(obj,def) {
    def = FM.isset(def) ? def : '';
    if(!FM.isset(obj) || !FM.obj) return def;

    try {
        return FM.isFunction(obj.serialize) ? obj.serialize() : JSON.stringify(obj);
    } catch(e) {        
        console.log('ERROR  serialize object!');
        var oar = FM.logObjectMsgToArray(obj);
        for(var i =0; i < oar.length; i++) console.log(oar[i]);        
    }
    return def;
}

FM.unserialize = function(str,def) {
    def = FM.isset(def) ? def : null;
    if(!FM.isset(str) || !str) return def;

    try {
        return JSON.parse(str);
    } catch(e) {
        console.log('ERROR  unserialize string ! [' +  str + ']');
    }
    return def;
}

FM.deleteCookie = function(name,domain) {
    FM.saveCookie(name,"",0,domain);
//document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}

FM.saveCookie = function(name,value,expiredays,domain) {
    var daysahead, expires = null;

    if(FM.isset(expiredays)) {
        daysahead = parseInt(expiredays);    
        if(daysahead <= 0) daysahead=3650; // 10 godina = zauvijek
    } else {
        daysahead=3650; // 10 godina = zauvijek
    }   
    expires = new Date();
    expires.setDate(expires.getDate() + daysahead);

    if(!FM.isset(value) || value == null) value = {};

    document.cookie =
    name + "=" + 
    escape(FM.isString(value) ? value : FM.arrayToUrl(value)) + 
    (FM.isset(domain) && domain ?  ";domain=" + domain : "") +
    "; path=/" +
    ((expires == null) ? "" : "; expires=" + expires.toGMTString())
    ;

    return document.cookie;
}


FM.loadCookie = function(name,asstring) {
    var dc = document.cookie;
    var cname = name + "=";
    var cbegin,cend,retstr="";

    asstring = FM.isset(asstring) ? asstring == true : false;

    if (dc.length > 0) {
        cbegin = dc.indexOf(cname);
        if (cbegin != -1) {
            cbegin += cname.length;
            cend = dc.indexOf(";", cbegin);
            if (cend == -1) cend = dc.length;
            retstr = unescape(dc.substring(cbegin, cend));            
        }
    }

    return asstring ? retstr :  FM.urlToArray(retstr);
}

// -- URL ------------------------------------------------------------------
FM.escapeStr = function(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
}

FM.unescapeStr = function(str) {
    str = str.replace(/&amp;/g, "&");
    str = str.replace(/&gt;/g, ">");
    str = str.replace(/&lt;/g, "<");
    str = str.replace(/&quot;/g, "\"");
    str = str.replace(/&#039;/g, "'");
    return str;
}

FM.urlEncode = function(s) {
    return encodeURIComponent(s).replace( /\%20/g, '+' ).replace( /!/g, '%21' ).replace( /'/g, '%27' ).replace( /\(/g, '%28' ).replace( /\)/g, '%29' ).replace( /\*/g, '%2A' ).replace( /\~/g, '%7E');
}

FM.urlDecode = function(s) {
    return decodeURIComponent(s.replace( /\+/g, '%20' ).replace( /\%21/g, '!' ).replace( /\%27/g, "'" ).replace( /\%28/g, '(' ).replace( /\%29/g, ')' ).replace( /\%2A/g, '*' ).replace( /\%7E/g, '~' ) );
}

FM.arrayToUrl = function(params) {
    var ret = "";
    var first = true;
    for (var vname in params) {
        if(first != true) ret = ret + '&';
        ret = ret + vname + '=' + FM.urlEncode(params[vname]);
        first = false;
    }

    return ret;
}

FM.urlToArray = function(url) {
    //location.queryString = {};
    var arr = {};

    var pairs = url.split( "&" );

    for (var i=0; i < pairs.length; i++ )  {
        var keyval = pairs[ i ].split( "=" );
        arr[ keyval[0] ] = FM.isset(keyval[1]) ? FM.urlDecode(keyval[1]) : '';
    }

    return arr;
}

FM.isURL = function(s) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(s);
}    

// -- STRING ---------------------------------------------------------------
FM.trim = function(s) {
    if(!FM.isset(s) || s == null) return('');
    var ss = '' + s;
    return ss.replace(/^\s+|\s+$/g,"");
}

FM.ltrim = function(s) {
    if(!FM.isset(s) || s == null) return('');
    var ss = '' + s;
    return ss.replace(/^\s+/,"");
}

FM.rtrim = function(s) {
    if(!FM.isset(s) || s == null) return('');
    var ss = '' + s;
    return ss.replace(/\s+$/,"");
}


FM.startsWith = function(instr,fstr) {
    return (instr ? instr.match("^"+fstr)==fstr : false);
}

FM.endsWith = function(instr,fstr) {
    return (instr ? instr.match(fstr+"$")==fstr : false);
}

FM.utf8_encode = function(s) {
    return unescape( encodeURIComponent( s ) );
}

FM.utf8_decode = function(s) {
    return decodeURIComponent(escape(s));
}


FM.addslashes = function(str) {
    str=str.replace(/\\/g,'\\\\');
    str=str.replace(/\'/g,'\\\'');
    str=str.replace(/\"/g,'\\"');
    str=str.replace(/\0/g,'\\0');
    return str;
}

FM.stripslashes = function(str) {
    str=str.replace(/\\'/g,'\'');
    str=str.replace(/\\"/g,'"');
    str=str.replace(/\\0/g,'\0');
    str=str.replace(/\\\\/g,'\\');
    return str;
}

FM.tokenize = function(argsstr) {
    var i,instr;

    // napravi listu tokena
    var elm_array = [];
    var st_array = argsstr.split('"');

    instr = false;
    for( i=0; i < st_array.length; i++) {
        // ako nisi u stringu
        if(!instr) {
            var e = st_array[i].split(/[\s,]+/);
            for(var j=0; j < e.length;j++) {
                if(e[j] != "") elm_array.push(e[j]);
            }
        } else {
            elm_array.push(st_array[i]);
        }

        instr = !instr;
    }

    return elm_array;
}    

// -- MD5 ------------------------------------------------------------------
FM.md5 = function(str) {
    // Calculate the md5 hash of a string
    //
    // version: 1008.1718
    // discuss at: http://phpjs.org/functions/md5
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // -    depends on: utf8_encode
    // *     example 1: md5('Kevin van Zonneveld');
    // *     returns 1: '6e658d4bfcb59cc13f96c14450ac40b9'
    var xl;

    var rotateLeft = function (lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    };

    var addUnsigned = function (lX,lY) {
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    };

    var _F = function (x,y,z) {
        return (x & y) | ((~x) & z);
    };
    var _G = function (x,y,z) {
        return (x & z) | (y & (~z));
    };
    var _H = function (x,y,z) {
        return (x ^ y ^ z);
    };
    var _I = function (x,y,z) {
        return (y ^ (x | (~z)));
    };

    var _FF = function (a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _GG = function (a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _HH = function (a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var _II = function (a,b,c,d,x,s,ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(_I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function (str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=new Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    };

    var wordToHex = function (lValue) {
        var wordToHexValue="",wordToHexValue_temp="",lByte,lCount;
        for (lCount = 0;lCount<=3;lCount++) {
            lByte = (lValue>>>(lCount*8)) & 255;
            wordToHexValue_temp = "0" + lByte.toString(16);
            wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length-2,2);
        }
        return wordToHexValue;
    };

    var x={},
    k,AA,BB,CC,DD,a,b,c,d,
    S11=7, S12=12, S13=17, S14=22,
    S21=5, S22=9 , S23=14, S24=20,
    S31=4, S32=11, S33=16, S34=23,
    S41=6, S42=10, S43=15, S44=21;

    str = this.utf8_encode(str);
    x = convertToWordArray(str);
    a = 0x67452301;
    b = 0xEFCDAB89;
    c = 0x98BADCFE;
    d = 0x10325476;

    xl = x.length;
    for (k=0;k<xl;k+=16) {
        AA=a;
        BB=b;
        CC=c;
        DD=d;
        a=_FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=_FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=_FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=_FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=_FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=_FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=_FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=_FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=_FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=_FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=_FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=_FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=_FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=_FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=_FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=_FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=_GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=_GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=_GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=_GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=_GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=_GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=_GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=_GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=_GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=_GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=_GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=_GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=_GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=_GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=_GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=_GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=_HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=_HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=_HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=_HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=_HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=_HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=_HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=_HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=_HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=_HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=_HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=_HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=_HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=_HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=_HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=_HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=_II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=_II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=_II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=_II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=_II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=_II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=_II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=_II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=_II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=_II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=_II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=_II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=_II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=_II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=_II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=_II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=addUnsigned(a,AA);
        b=addUnsigned(b,BB);
        c=addUnsigned(c,CC);
        d=addUnsigned(d,DD);
    }

    var temp = wordToHex(a)+wordToHex(b)+wordToHex(c)+wordToHex(d);

    return temp.toLowerCase();
}    

// -- base64 ---------------------------------------------------------------
FM.base64_decode = function(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    } while (i < input.length);

    return output;
}


FM.base64_encode = function(input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    do {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
        keyStr.charAt(enc3) + keyStr.charAt(enc4);
    } while (i < input.length);

    return output;
}

// -- log ----------------------------------------------------------------------
FM.logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 99
}

FM.logLevelNames = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'WARN',
    3: 'ERROR',
    99: 'FATAL'
}

// subclass/min loglevel def. info
FM.logDefaultLevel = FM.logLevels.warn;
FM.logConfig = {
    ut: FM.logLevels.warn,
    ob: FM.logLevels.warn,
    dm: FM.logLevels.warn,        
    lm: FM.logLevels.warn,
    ui: FM.logLevels.warn,
    app: FM.logLevels.warn,
    tst: FM.logLevels.info
};


FM.setDefaultLogLevel = function(level) {
    FM.logDefaultLevel = level;
}

FM.getDefaultLogLevel = function(pkg) {
    return FM.logDefaultLevel;
}

FM.setLogLevel = function(pkg,level) {
    FM.logConfig[pkg] = level;
}

FM.getLogLevel = function(pkg) {
    return FM.isset(FM.logConfig[pkg]) ? FM.logConfig[pkg] : FM.logDefaultLevel;
}

FM.getPackageLogLevel = function(oObj) {
    var pname = oObj && FM.isset(oObj.getPackageName) ? oObj.getPackageName() : null;
    return (pname && FM.isset(FM.logConfig[pname])) ? FM.logConfig[pname] : FM.logDefaultLevel;    
}

FM.getLogId = function(oObj) {
    return oObj && FM.isset(oObj.getClassName) ? oObj.getClassName() : '<anonymous>';
}

FM.getLogTypeName = function(level) {
    return FM.isset(FM.logLevelNames[level]) ? FM.logLevelNames[level] : FM.logLevelNames[FM.logLevels.info];
}

FM.setPackageLogLevel = function(pkg,level) {
    FM.logConfig[pkg] = level;    
}

FM.logObjectMsgToArray = function(obj) {
    if(!FM.isset(obj) || !obj) return [];
    if(FM.isset(obj.length)) return obj;
    if(FM.isset(obj.toLogArray)) return(obj.toLogArray());
    var ar = ['('];
    for(var id in obj) {
        ar.push(
            '  ' + id + ":" + (obj[id] === null ? 'null' : (
                FM.isset(obj[id].getFullClassName) ?  obj[id].getFullClassName() :
                (
                    FM.isFunction(obj[id]) ? "function() {...}" :
                    (
                        FM.isArray(obj[id]) ? "[...]" : 
                        (
                            FM.isObject(obj[id]) ? "{...}" : 
                            (
                                obj[id]
                                )
                            )
                        )
                    )
                ))
            );
    }
    ar.push(")");
    return ar;
}


FM.getStackTraceStr = function(err) {
    err = FM.isset(err) ? err : new Error();

    return err.stack ? err.stack : "";        
}

FM.getStackTrace = function(err) {    
    var strace = FM.getStackTraceStr(err);    

    return strace.split("\n").slice(3); //strace.length > 2 ? strace.slice(2) : [];

}

FM.getCallerInfo = function(shift) {    
    var strace = FM.getStackTrace();
    var pos1,pos2,name,file;
    var lin = "<anonymous>";

    shift = FM.isset(shift) ? shift : 0;
    // mi smo na 1
    if(strace.length < 2 + shift) return lin;

    lin = strace[1+shift];
    pos1 = lin.indexOf("at ");
    if(pos1 < 0) return lin;

    lin = lin.substr(pos1+3);    
    pos1 = lin.indexOf("(");
    pos2 = lin.indexOf(")");
    if(pos1 > -1 && pos2 > -1) {
        name = lin.substr(0,pos1);
        file = lin.substr(pos1+1,pos2-pos1-1);
        pos1 = file.lastIndexOf("/");
        if(pos1 > -1) {
            file = file.substring(pos1+1);
        }
        lin = name + "("  + file + ")";
    }
    return(lin);
}


FM.log = function(oObj,msg,level,callerinfo) {
    var minlevel = 
    oObj&& FM.isset(oObj.objectLogLevel) && oObj.objectLogLevel != null ? 
    oObj.objectLogLevel : FM.getPackageLogLevel(oObj)
    ;
    if(!FM.isset(level)) level = FM.logLevels.info;
    if(level < minlevel) return false;
    if(FM.isset(callerinfo) && callerinfo.indexOf('.') < 0) {
        callerinfo = FM.getLogId(oObj) + '.' + callerinfo;
    } else if(!FM.isset(callerinfo)) {
        callerinfo = FM.getLogId(oObj) +
        '.' +
        (FM.isset(FM.log.caller.name) && FM.log.caller.name != '' ? FM.log.caller.name : '<unknown>');        
    }

    // formiraj header    
    console.log(
        (FM.isset(callerinfo) ? callerinfo : "Unknown") +
        " [" + FM.getLogTypeName(level) + "]:" + 
        (msg && !FM.isString(msg) ? '' : msg)
        );
    /*
    var amsg = FM.logObjectMsgToArray(msg);
    if(FM.isArray(amsg)) {
        for(var i=0; i < amsg.length; i++) {
            console.log(' >' + amsg[i]);
        }
    }*/
    if(FM.isObject(msg) || FM.isArray(msg)) {
        console.dir(msg);
    }
    return true;
}

FM._T = function() {
    if(arguments.length < 1) return('');

    if(false /*T_messages_loaded */) {
        // nadji hash i prevedeni string
        var hash = md5(arguments[0]);
        var str;

        if(isset(T_messages[hash])) {
            str = T_messages[hash];
        } else {
            str = arguments[0];
            if(T_missing_messages == null) T_missing_messages = {};
            T_missing_messages[hash] = str;
        }
    } else {
        str = arguments[0];
    }

    // ubaci podatke
    for(var i = 1; i < arguments.length; i++)  {
        str = str.replace("[:" + i + "]", arguments[i]);
    }

    // kraj
    return(str);
}

// -- sdk namespace - dates ----------------------------------------------------
if(typeof(FM) == 'undefined') {
    FM = function() {};
}

FM.dateTimeDivider = ' ';

FM.dateToString = function(dat,utc) {
    var sy,sm,sd,sh,sn,ss;
    var d = dat;

    if(!FM.isset(d) || d == null || d == '') return('');

    if(utc) {
        sy = d.getUTCFullYear();
        sm = (d.getUTCMonth() + 1);
        sd = d.getUTCDate();
        sh = d.getUTCHours();
        sn = d.getUTCMinutes();
        ss = d.getUTCSeconds();
    } else {
        sy = d.getFullYear();
        sm = (d.getMonth() + 1);
        sd = d.getDate();
        sh = d.getHours();
        sn = d.getMinutes();
        ss = d.getSeconds();
    ;
    }

    // formiraj string
    return(
        sy +
        (sm < 9 ? '-0' + sm : '-' + sm) +
        (sd < 9 ? '-0' + sd : '-' + sd) +
        (sh < 9 ? ' 0' + sh : FM.dateTimeDivider + sh) +
        (sn < 9 ? ':0' + sn : ':' + sn) +
        (ss < 9 ? ':0' + ss : ':' + ss)
        );
}

FM.parseDateString = function(sdate,utc) { // '2010-05-26 05:56:00', true/false
    var fpos = 0,pos;
    var sy = '1970';
    var sm = '01';
    var sd = '01';
    var sh = '00';
    var sn = '00';
    var ss = '00';
    var d;

    if(!FM.isset(sdate) || sdate == null || sdate == '') return(sdate);
    if(sdate == FM.endOfHistory() || sdate == FM.startOfHistory()) return('');

    // godina
    pos = sdate.indexOf("-",fpos);
    if(pos < 0) {
        sy = sdate.substr(fpos);
        fpos = -1;
    } else {
        sy = sdate.substr(fpos, pos - fpos);
        fpos = pos + 1;
    }

    // mjesec
    if(fpos > -1) {
        pos = sdate.indexOf("-",fpos);
        if(pos < 0) {
            sm = sdate.substr(fpos);
            fpos = -1;
        } else {
            sm = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if(sm.substr(0,1) == '0') {
        sm = sm.substr(1);
    }

    // dan
    if(fpos > -1) {
        pos = sdate.indexOf(FM.dateTimeDivider,fpos);
        if(pos < 0) {
            sd = sdate.substr(fpos);
            fpos = -1;
        } else {
            sd = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if(sd.substr(0,1) == '0') {
        sd = sd.substr(1);
    }

    // sat
    if(fpos > -1) {
        pos = sdate.indexOf(":",fpos);
        if(pos < 0) {
            sh = sdate.substr(fpos);
            fpos = -1;
        } else {
            sh = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if(sh.substr(0,1) == '0') {
        sh = sh.substr(1);
    }

    // minute
    if(fpos > -1) {
        pos = sdate.indexOf(":",fpos);
        if(pos < 0) {
            sn = sdate.substr(fpos);
            fpos = -1;
        } else {
            sn = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if(sn.substr(0,1) == '0') {
        sn = sn.substr(1);
    }


    // sekunde
    if(fpos > -1) {
        pos = sdate.indexOf(":",fpos);
        if(pos < 0) {
            ss = sdate.substr(fpos);
            fpos = -1;
        } else {
            ss = sdate.substr(fpos, pos - fpos);
            fpos = pos + 1;
        }
    }
    if(ss.substr(0,1) == '0') ss = ss.substr(1);

    if(utc) {
        d = new Date(
            Date.UTC(
                parseInt(sy), parseInt(sm)-1, parseInt(sd),
                parseInt(sh), parseInt(sn), parseInt(ss), 0
                )
            );
    } else {
        d = new Date();
        d.setFullYear(parseInt(sy), parseInt(sm)-1, parseInt(sd));
        d.setHours(parseInt(sh), parseInt(sn), parseInt(ss), 0);
    }

    // kraj
    return(d);
}

FM.srv2locDate = function(srvstr) {
    return(FM.dateToString(FM.parseDateString(srvstr ,true),false));
}

FM.loc2srvDate = function(locstr) {
    return(FM.dateToString(FM.parseDateString(locstr ,false),true));
}

FM.locNow = function() {
    return(FM.dateToString(new Date(),false));
}

FM.srvNow = function() {
    return(FM.dateToString(new Date(),true));
}

FM.strTimeBetween = function(d1, d2) {
    if(!FM.isset(d1) || !d1 || d1 == ' ' || !FM.isset(d2) || !d2 || d2 == ' ') return '';

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;
    var ONE_HOUR = 1000 * 60 * 60;
    var ONE_MINUTE = 1000 * 60;
    var ONE_SEC = 1000;

    var dif,ret;

    // Convert both dates to milliseconds
    var date1_ms = d1.getTime();
    var date2_ms = d2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // ONE_SEC
    dif = Math.round(difference_ms/ONE_SEC);
    
    if (dif < 60) {
        ret = FM._T(date1_ms < date2_ms ? "[:1] seconds ago" : "In [:1] seconds",dif);
    } else { // ONE_MINUTE
        dif = Math.round(difference_ms/ONE_MINUTE);
        if (dif < 60) {
            ret = FM._T(date1_ms < date2_ms ? "[:1] minutes ago" : "In [:1] minutes",dif);
        } else { // ONE_HOUR
            dif = Math.round(difference_ms/ONE_HOUR);
            if (dif < 24) {
                ret = FM._T(date1_ms < date2_ms ? "[:1] hours ago" : "In [:1] hours",dif);
            } else { // ONE_DAY
                dif = Math.round(difference_ms/ONE_DAY);
                
                if (dif == 1) {
                    ret = FM._T(date1_ms < date2_ms ? "Yesterday" : "Tomorow",dif);
                }
                else {
                    ret = FM._T(date1_ms < date2_ms ? "[:1] days ago" : "In [:1] days",dif);    
                }
                
                
            }
        }
    }


    // kraj
    return(ret);
}

FM.dateLocalFormat = function(d) {
    if(!FM.isset(d) || d == null || d == '') return('');

    try {
        var s = d.toLocaleString();
    } catch(err) {
        alert(err)
    };
    var i = s.indexOf("GMT");
    if(i >= 0) s = s.substr(0,i);
    return(s);
}

FM.startOfHistory = function() {
    return '1970-01-01' + FM.dateTimeDivider + '00:00:00';
}

FM.endOfHistory = function() {
    return '2050-01-01' + FM.dateTimeDivider + '00:00:00';
}

FM.timestamp = function(date) {
    return Math.round((FM.isset(date) ? date : new Date()).getTime() / 1000);
}

FM.getArgs = function() {
    return decodeURIComponent(window.location.search.slice(1))
    .split('&')
    .reduce(function _reduce (a,b) {
        b = b.split('=');
        a[b[0]] = b[1];
        return a;
    }, {});    
}


FM.expandToFullSCreen = function(elmid) {
    var elem = document.getElementById(elmid);
    if (elem.requestFullScreen) {
        elem.requestFullScreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
    }    
}



