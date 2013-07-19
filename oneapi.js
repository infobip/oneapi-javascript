if(typeof(window['FM']) == 'undefined') {
// file: src/lib/fm/fm.js
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

FM.dateTimeDeveder = ' ';

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
        (sh < 9 ? ' 0' + sh : FM.dateTimeDeveder + sh) +
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
        pos = sdate.indexOf(FM.dateTimeDeveder,fpos);
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
    return '1970-01-01' + FM.dateTimeDeveder + '00:00:00';
}

FM.endOfHistory = function() {
    return '2050-01-01' + FM.dateTimeDeveder + '00:00:00';
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




// file: src/lib/fm/ob/ob.Object.js
// -- Basic FM class -----------------------------------------------------------
/**
* Basic FM class. Provide listeners, attributes, propertyes, log
* @class FM.Object
* @param {object} attrs list of attribute name and values
* @param {object} [flds] allowed attributes
*/    
FM.Object = function() {
    this._init.apply(this, arguments); // new poziva _init()
}

// ne extenda nista
FM.extendClass(FM.Object,null);

// properties
FM.Object.prototype.objectSubClass = "";
FM.Object.objectLogLevel = null;
FM.Object.prototype.id = null;   
FM.Object.prototype.enabled = true;
FM.Object.prototype.listenersArr = null;
FM.Object.prototype.prop = null;
FM.Object.prototype.undoList = null;
FM.Object.prototype.options = null;
FM.Object.prototype.strictOptions = false;
    
// methods

/**
* Get  FM class name
* @public     
* @function 
* @returns {string} Returns name of the object
*/   
FM.Object.prototype.getClassName = function() {
    var o=this;

    while(o && !FM.isset(o.constructor.className)) {
        o = o.parent? o.parent : null;
    }
    return(o ? o.constructor.className : '');
}

/**
* Get full (package and class name) FM class name
* @public     
* @function 
* @returns {string} Returns package and name of the object
*/   
FM.Object.prototype.getFullClassName = function() {
    var o=this;
    while(o && !FM.isset(o.constructor.fullClassName)) {
        o = o.parent? o.parent : null;
    }
    return(o ? o.constructor.fullClassName : '');
}

/**
* Get FM subclass name
* @public     
* @function 
* @returns {string} Returns subclass of object
*/   
FM.Object.prototype.getSubClassName = function() {
    return this.objectSubClass;
},

/**
* Get object id
* @public     
* @function 
* @returns {string} Returns id of object
*/   
FM.Object.prototype.getID = function() {
    if(this.id == null) this.id = FM.generateNewID();
    return(this.id);
}

/**
* Get object data id 
* @public     
* @function 
* @returns {string} Returns id of object
*/   
FM.Object.prototype.getDataID = function() {    
    return(this.getID());
}


/**
* Add listener
* @public     
* @function 
* @param {FM.Object|object} oListener FM.Object to register as listener or object with event functions
* @param {object} [config] Additional options
*/   
FM.Object.prototype.addListener = function(oListener,config) {

    // definicija listenera
    var lstnrdef = {
        listener: oListener,
        config: FM.isset(config) ? config : {},
        iscallback: !FM.isset(oListener.onEvent)
    };

    // if the listener is not object
    if(!FM.isset(oListener.getID)) {
        var lid = '_CB_' + FM.generateNewID();
        oListener.getID = function() {
            return lid;
        }
    }
    this.listenersArr[oListener.getID()] = lstnrdef;
}

/**
* Remove listener
* @public     
* @function 
* @param {FM.Object|object} oListener 
*/   
FM.Object.prototype.removeListener = function(oListener) {
    if(!FM.isset(oListener)  || !oListener || !FM.isset(oListener.getID)) return false;

    var nlist = {};
    var objId = oListener.getID();
    if(!objId) return false;

    for(var id in this.listenersArr) {
        if(objId != id) nlist[id] = this.listenersArr[id];
    }

    this.listenersArr = nlist;

    return true;
}

/**
* Remove all listeners
* @public     
* @function 
*/   
FM.Object.prototype.removeAllListeners = function() {
    this.listenersArr = {};
    return true;
}


/**
* Event function
* @public     
* @function 
* @param {FM.Object} sender Sender of event
* @param {String} ev Event
* @param {String} data Event data
*/   
FM.Object.prototype.onEvent = function(sender,ev,data,calledlist) {
    if(!this.isEnabled()) return false;

    //  ako imaš event fn
    if(FM.isset(this[ev])) {
        this[ev](sender,data);
        return calledlist;
    }

    // proslijedi dalje ako nemas ev fn
    return this.fireEvent(ev,data,calledlist);
}

/**
* Send event to all listeners
* @public     
* @function 
* @param {String} ev Event
* @param {String} evdata Event data
*/   
FM.Object.prototype.fireEvent = function(ev,evdata,calledlist) {
    var cl = FM.isset(calledlist) ? calledlist : {};

    // obicni listeneri
    for(var id in this.listenersArr) {
        var ldef = this.listenersArr[id];
        if(!FM.isset(cl[id])) {
            cl[id] = "1";
            try {
                if(ldef.iscallback) {
                    if(FM.isFunction(ldef.listener[ev])) {
                        ldef.listener[ev](this,evdata);
                    }
                } else {
                    cl = ldef.listener.onEvent(this,ev,FM.isset(evdata) ? evdata : {},cl);
                }
            } catch(err) {
                console.log("fireEvent error(" + ev + "): " + err);
            }
        }
    }

    // kraj
    return cl;
}

/**
* Test attribute existence
* @public     
* @function 
* @param {string} [key] Attribute name
* @returns {boolean} 
*/   
FM.Object.prototype.isAttr = function(key) {
    return FM.isAttr(this.options,key);
}

/**
* Get attribute value
* @public     
* @function 
* @param {string} [key] Attribute name
* @param {string} [defv] Default value of attribute. Default for default is empty string :)
* @returns {object|string|number} Returns attribute value of <i>key</i> attribute or all attributes in object if <i>key</i> is undefined
*/   
FM.Object.prototype.getAttr = function(key,defv) {
    return FM.getAttr(this.options,key,defv);
}

/**
* Set value of <i>key</i> attribute to <i>val</i> value
* @public
* @function
* @param {string} key Attribute name
* @param {string} val Value of attribute
* @param {boolean} callevent Fire <i>onChange</i> after object update (default is true)
*/
FM.Object.prototype.setAttr = function(key,val,callevent) {
    if(FM.setAttr(this.options,this.undoList,key,val)) {
        this.setProperty('dirty',true);
        this.setProperty('timestamp',new Date().getTime());
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    }
}

/**
* See <i>FM.Object.getAttr()</i>
* @see FM.Object#getAttr
*/    
FM.Object.prototype.d = function(key,defv) {
    return this.getAttr(key,defv);
}

/**
* See <i>FM.Object.setAttr()</i>
* @see FM.Object#setAttr
*/    
FM.Object.prototype.s = function(key,val,callevent) {
    return this.setAttr(key,val,callevent);
}

/**
* Check if <i>key</i> attribute is changed
* @public
* @function 
* @param {string} key Attribute name
* @returns {boolean} Returns <i>true</i> if attribute is changed 
*/
FM.Object.prototype.isChanged = function(key) {
    if(FM.isset(key)) {
        if(FM.isset(this.undoList[key])) return true;
        return false;
    }
    return this.getProperty('dirty');
}

/**
* Set object <i>changed</i> property 
* @public
* @function 
* @param {boolean} v true or false
* @param {boolean} callevent Fire <i>onChange</i> after object update (default is false)
*/
FM.Object.prototype.setChanged = function(v,callevent) {
    this.setProperty('dirty',v == true);
    if(!this.getProperty('dirty')) this.undoList = {};
    if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
}

FM.Object.prototype.resolveAttrValue = function(attrName,def,fnargs) {
    return FM.resolveAttrValue(this.options,attrName,def,fnargs);
}

/**
* Return object with all changed attributes
* @public     
* @function 
* @returns {object} Returns with changed attributes
*/
FM.Object.prototype.getChangedAttrList = function() {
    return FM.cloneObject(this.undoList);
}

/**
* For each attribute call function <i>doFn(id,attr)</i> until end of attributes or <i>false</i> return value.    
* @public
* @function 
* @param {function} [doFn={}]
* @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return attribute name otherwise null
*/
FM.Object.prototype.forEachAttr = function(doFn) {
    return FM.forEach(this.options,doFn);
}

/**
* Get property value
* @function 
* @param {string} key Property name
* @param {string} defv Default value of property
* @returns Returns property value
*/    
FM.Object.prototype.getProperty = function(key,defv) {
    return FM.getAttr(this.prop,key,defv);
}

/**
* Set property value
* @static
* @function
* @param {string} key Property name
* @param {string} val Value of property
* @param [boolean] callevent Fire <i>onChange</i> after object update (default is true)
*/
FM.Object.prototype.setProperty = function(key,val,callevent) {
    if(FM.setAttr(this.prop,null,key,val)) {
        if(FM.isset(callevent) && callevent == true) this.fireEvent("onChange", this);
    } else {
        return false;
    }
    return true;
}

FM.Object.prototype.resolvePropertyValue = function(attrName,def,fnargs) {
    return FM.resolveAttrValue(this.prop,attrName,def,fnargs);
}

/**
* For each property call function <i>doFn(id,prop)</i> until end of properties or <i>false</i> return value.    
* @public
* @function 
* @param {function} [doFn={}]
* @return {string} In case of <i>false</i> return value of <i>doFn()</i> call return property name otherwise null
*/
FM.Object.prototype.forEachProperty = function(doFn) {
    return FM.forEach(this.prop,doFn);
}

/**
* Enable object. Object start to process events.
* @public
* @function 
*/
FM.Object.prototype.enable = function() {
    this.enabled = true;
}

/**
* Disable object. Object stop to process events.
* @public
* @function 
*/
FM.Object.prototype.disable = function() {
    this.enabled = false;
}


/**
* Check if object is enabled
* @public
* @function 
* @return {boolean} 
*/
FM.Object.prototype.isEnabled = function() {
    return this.enabled;
}

/**
* Log function to call from this object
* @public
* @function 
* @param {string} msg Log text
* @param {number} level Log level
*/
FM.Object.prototype.log = function(msg,level,callerinfo) {
    //return;
    /*
    if(level >= FM.getPackageLogLevel(this)) {
        if(!FM.isset(callerinfo)) callerinfo = FM.getCallerInfo(1);
        FM.log(this,msg,level,callerinfo);
    }*/
    FM.log(this,msg,level,callerinfo);
}                

/**
* Set log level for this object
* @public
* @function 
* @param {string | number} level Log level
*/
FM.Object.prototype.setLogLevel = function(level) {
    if(FM.isString(level)) {
        if(FM.isset(FM.logLevels[level.toLowerCase()])) {
            this.objectLogLevel = FM.logLevels[level.toLowerCase()];
        }
    } else {
        this.objectLogLevel = level;
    }
}

/**
* Get log level for this object
* 
* @public
* @function 
*/
FM.Object.prototype.getLogLevel = function() {
    return FM.logLevelNames[this.objectLogLevel != null ? this.objectLogLevel : FM.getPackageLogLevel(this)];

}

FM.Object.prototype._init = function(attrs,flds) {
    this.objectSubClass = "Objects";            
    this.id =  null;    
    this.objectLogLevel = null;
    
    this.enabled = true;
    this.listenersArr = {};
    this.undoList = {};
    this.options = {};
    this.strictOptions = false;

    // properties
    this.prop = {
        dirty: false,
        timestamp: new Date().getTime(),
        fetched: true // da li je new loc ili je fetchan
    },        

    this.setAttr(false,FM.isset(flds) ? flds : {},false);
    this.strictOptions = FM.isset(flds) ? true : false;
    if(FM.isset(attrs) && attrs) {
        if(FM.isString(attrs)) attrs = FM.stringPtrToObject(attrs);
        if(FM.isFunction(attrs)) attrs = attrs();        
        this.setAttr(this.strictOptions,attrs,false);
    }
    
    this.setChanged(false,false);
}

FM.Object.prototype.getPackageName = function() {
    var fcname = this.getFullClassName();
    if(fcname == '') {
        console.log("ERROR undefined full class name!");
        console.log(this);                        
    } else {
        fcname = fcname.split('.');
    }

    return (fcname && FM.isset(fcname.length) && fcname.length > 1) ? fcname[0] : null;        
}

// == static ===================================================================
FM.Object.className = "Object";
FM.Object.fullClassName = 'ob.Object';

// file: src/lib/fm/ut/ut.UtAjax.js
/**
* Ajax class. 
*     var example_options = {
        url: 'http://...',
        method: 'GET',
        contentType: 'application/x-www-form-urlencoded',        
        params: [], // or: p1=v1&p2=v2 ...
        headers: {},
        auth: { // basic http auth
            username: '',
            password: ''
        },
        responseFormat: 'JSON',
        validResponseCodes: '200,201'        
    }
* 
* @class FM.UtAjax
* @extends FM.Object
* @param {object} config Options
*/    
FM.UtAjax = function() {    
    var me = this;        
    this._cb_onReadyStateChange = function() {        
        if(me.http.readyState == FM.UtAjax.AJAX_STATE_LOADEND) { // http ok                
            // timeout
            if(me.http.status == 0) {
                return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                    messageId: "1",
                    text: "Timeout or Access-Control-Allow-Origin is not allowed" 
                }));
            }   

            // deserijaliziraj rezultat ako je JSON
            var responseFormat = me.getAttr('responseFormat','TEXT');
            var responseObject = null;
            if(responseFormat == 'JSON') {
                responseObject = FM.unserialize(me.http.responseText,null);
                // neuspjela deserijalizacija
                if(responseObject == null) {
                    return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                        messageId: "1",
                        text: me.http.responseText != '' ? "Error: " + me.http.responseText : "Invalid response format"
                    }));
                }
            } else {
                responseObject = me.http.responseText;
            }
                
            // provjeri response status code (samo ako nema nikakvog povratnog teksta
            if(me.http.responseText == '') {
                var respCodesStr = FM.trim(me.getAttr('validResponseCodes',''));            
                var responseCodes = respCodesStr == '' ? [] : me.getAttr('validResponseCodes','').split(",");            
                var i;
                for(i=0;i < FM.sizeOf(responseCodes); i++) {
                    if(FM.trim(responseCodes[i]) == me.http.status) break;
                }
                if(i != 0 && i == FM.sizeOf(responseCodes)) {
                    return me.fireEvent("onAjaxStateError",new FM.DmGenericError({
                        messageId: "1",
                        text: "Invalid response code (found:" + me.http.status + ", expected:" + responseCodes + ")"
                    }));
                }
            }
            
            // ako sam stigsao do tu sve je ok
            return me.fireEvent(
                "onAjaxStateEnd",
                new FM.DmGenericValue({value: responseObject})
            );
        }
    }
   
    // pozovi konstruktor
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtAjax,FM.Object); 

// properties
FM.UtAjax.prototype.objectSubClass = "";
FM.UtAjax.prototype.http = null;

// methods
FM.UtAjax.prototype._init = function(config) {            
    this._super("_init",config);
    this.objectSubClass = "UtAjax";

    this.http = null;
}

FM.UtAjax.prototype.send = function(args) {
    var url = this.getAttr('url','');
    var params = this.getAttr('params',{});
    var headers = this.getAttr('headers',{});

    
    var pline = "";
    /*
    if(FM.isObject(args)) {
        var val;
        for(var pname in params) {
            val = FM.getAttr(args,pname,'');
            pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
        }
    }
    */
    if(FM.isObject(args)) {
        var val;
        for(var pname in args) {
            if(FM.isset(params[pname])) {
                val = FM.getAttr(args,pname,'');
                pline = pline + (pline == "" ? "" : "&") + pname + "=" + encodeURIComponent(val);
            }
        }
    }
    
    var callUrl = this.getAttr("method","POST") == 'POST' ? url : url + "?" + pline;
    this.http = FM.UtAjax.initHttpObject();
    if(this.http == null) {
        return this.fireEvent("onAjaxStateError",new FM.DmGenericError({
            messageId: "1",
            text: "Unable to init connection"
        }));
    }
    
    var auth = this.getAttr('auth',null);
    if(auth) {
        this.http.open(
            this.getAttr("method","POST"), 
            callUrl, true,
            this.getAttr('auth.username',''),this.getAttr('auth.password','')
        );
    } else {
        this.http.open(
            this.getAttr("method","POST"), 
            callUrl, true
        );                
    }
    
    if(this.getAttr("method","POST") == 'POST') {
        this.http.setRequestHeader(
            "Content-type", 
            this.getAttr('contentType',"application/x-www-form-urlencoded")
        );
        //this.http.setRequestHeader("Content-length", params.length);
        //this.http.setRequestHeader("Connection", "close");
    } else {
        this.http.setRequestHeader(
            "Content-type", 
            this.getAttr('contentType',"application/x-www-form-urlencoded")
        );        
    }
        
    if(FM.isset(headers) && headers) for(var hdr in headers) {
        this.http.setRequestHeader(hdr, headers[hdr]);
    }
    this.http.onreadystatechange = this._cb_onReadyStateChange;

    // posalji (ovo treba samo za POST, get ima parametre u url-u ali ne smeta)
    this.http.send(pline);

    // event
    return this.fireEvent("onAjaxStateStart",new FM.DmGenericValue({value: args}));
}     


// static
FM.UtAjax.className = "UtAjax";
FM.UtAjax.fullClassName = 'ut.UtAjax';

// mapiranje ajax resp
FM.UtAjax.AJAX_STATE_OPEN = 1;
FM.UtAjax.AJAX_STATE_SEND = 2;
FM.UtAjax.AJAX_STATE_LOADSTART = 3;
FM.UtAjax.AJAX_STATE_LOADEND = 4;

FM.UtAjax.initHttpObject = function() {
    var http = null;
    if(window.XMLHttpRequest && !(window.ActiveXObject)) {
        try {
            http = new XMLHttpRequest();
        } catch(e1) {
            http = null;
        }
    } else if(window.ActiveXObject) {
        try {
            http = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e2) {
            try {
                http = new ActiveXObject("MSXML2.XMLHTTP.3.0");
            } catch (e3) {
                try {
                    http = new ActiveXObject("Microsoft.XMLHTTP");

                } catch (e4) {
                    http = null;
                }
            }
        }
    }
    return(http);
}       


// == jobovi ===================================================================
/**
* Ayax class. 
* @class FM.UtAjaxJob
* @extends FM.Object
*/    
FM.UtAjaxJob = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtAjaxJob,FM.Object); 

// properties
FM.UtAjaxJob.prototype.objectSubClass = "";
FM.UtAjaxJob.prototype.owner = null;
FM.UtAjaxJob.prototype.initParams = null;
FM.UtAjaxJob.prototype.callArguments = null;
FM.UtAjaxJob.prototype.ajaxConnector = null;
FM.UtAjaxJob.prototype.callTime = null;
FM.UtAjaxJob.prototype.runTime = 0;
FM.UtAjaxJob.prototype.endTime = 0;
FM.UtAjaxJob.prototype.finished = false;

FM.UtAjaxJob.prototype._init = function(oOwner,initParams,callArguments) {
    this._super("_init",callArguments);
    this.objectSubClass = "UtAjaxJob";            
    this.owner = oOwner;
    this.initParams = initParams;
    this.callArguments = callArguments;

    this.ajaxConnector = null;
    this.callTime = new Date().getTime();
    this.runTime = 0;
    this.endTime = 0;
    this.finished = false;
}

FM.UtAjaxJob.prototype.getThreadID = function() {
    return(this.owner.getID());
}

FM.UtAjaxJob.prototype.run = function() {
    this.finished = false;
    this.runTime = new Date().getTime();
    this.addListener(this.owner); // ??????
    this.ajaxConnector = new FM.UtAjax(this.initParams);
    this.ajaxConnector.addListener(this);
    this.ajaxConnector.send(this.callArguments);
    return(true);
}

FM.UtAjaxJob.prototype.stop = function() {
    this.finished = true;
    this.endTime = new Date().getTime();
}

FM.UtAjaxJob.prototype.discardJob = function(message) {
    this.stop();
    this.fireEvent("onAjaxStateError",message);
}

FM.UtAjaxJob.prototype.isJobOver = function() {
    return this.finished;
}

FM.UtAjaxJob.prototype.isJobTimeout = function() {
    return (this.callTime && new Date().getTime() - this.callTime > FM.UtAjaxJob.jobQueueTimeout);
}

FM.UtAjaxJob.prototype.isAjaxTimeout = function() {
    return (this.runTime && new Date().getTime() - this.runTime > FM.UtAjaxJob.jobTimeout);
}

FM.UtAjaxJob.prototype.isTimeout = function() {
    if(this.isJobOver()) return(false);
    return (this.isJobTimeout() || this.isAjaxTimeout());
}

FM.UtAjaxJob.prototype.onAjaxStateEnd = function(oAjax,response) {
    this.log("onAjaxStateEnd",response,FM.logLevels.info,this.getFullClassName());
    this.stop();
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'end', response: response});
    this.fireEvent("onAjaxStateEnd",response);
}

FM.UtAjaxJob.prototype.onAjaxStateError = function(oAjax,errmsg) {
    this.log("onAjaxStateError",errmsg,FM.logLevels.error,this.getFullClassName());
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'error', message: errmsg});
    this.discardJob(errmsg);
}


FM.UtAjaxJob.prototype.onAjaxStateStart = function(oAjax,data) {
    this.log("onAjaxStateStart",data,FM.logLevels.info,this.getFullClassName());
    this.fireEvent("onGetDataFromServer",{job: this, connection: oAjax, event: 'start', params: data});
    this.fireEvent("onAjaxStateStart",data);
}

// static
FM.UtAjaxJob.className = "UtAjaxJob";
FM.UtAjaxJob.fullClassName = 'ut.UtAjaxJob';
FM.UtAjaxJob.timer = null;
FM.UtAjaxJob.jobQueueTimeout = 60000; // 60 sec
FM.UtAjaxJob.jobTimeout = 20000; // 20 sec
FM.UtAjaxJob.jobMaxTrhreads = 3;
FM.UtAjaxJob.jobList = {}; // {id1: [j1,j2, ..], id2: [...], ...}
FM.UtAjaxJob.threadsList = []; // jobovi

// id je ovdje obj.getID() - to osigurava da jedna dmklasa vrti samo jedan
// job u neko vrijeme, i da istovremeno se vrte najvise x jobova        
FM.UtAjaxJob.addToQueue = function(job) {
    if(FM.UtAjaxJob.timer) {
        clearTimeout(FM.UtAjaxJob.timer);
        FM.UtAjaxJob.timer = null;
    }

    // dodaj job u listu
    if(!FM.isset(FM.UtAjaxJob.jobList[job.getThreadID()])) {
        FM.UtAjaxJob.jobList[job.getThreadID()] = [];
    }

    var jlist = FM.UtAjaxJob.jobList[job.getThreadID()];
    jlist.push(job);

    // odmah kreni u run
    FM.UtAjaxJob.__checklist__();

    // kraj
    return true;
}

FM.UtAjaxJob.__checklist__ = function() {
    // iskljuci tajmer ako radi da ne ulijecemou procesiranje tokom rada
    if(FM.UtAjaxJob.timer) {
        clearTimeout(FM.UtAjaxJob.timer);
        FM.UtAjaxJob.timer = null;
    }

    var i,job,idlist,id;

    // waiting list
    var njoblist = {};    
    for(id in FM.UtAjaxJob.jobList) {
        idlist = FM.UtAjaxJob.jobList[id];

        // iz svake liste samo jedan kandidat
        var nidlist = [];
        for(i=0; i < idlist.length; i++) {
            job = idlist[i];
            if(job.isTimeout()) {
                job.discardJob("Timeout.");
            } else if(!job.isJobOver()) {
                nidlist.push(job);
            }
        }
        if(nidlist.length > 0) {
            njoblist[id] = nidlist;
        }
    }
    FM.UtAjaxJob.jobList = njoblist;

    // running list
    var nlist = [];
    for(i=0; i < FM.UtAjaxJob.threadsList.length; i++) {
        job = FM.UtAjaxJob.threadsList[i];

        // provjeri timeoute
        if(job.isTimeout()) {
            job.discardJob("Timeout.");
        }
        if(!job.isJobOver()) {
            nlist.push(job);
        }
    }
    FM.UtAjaxJob.threadsList = nlist;

    // sad imamo listu osvjezenu
    // ako ima mjesta pokreni novi job
    if(FM.UtAjaxJob.threadsList.length <  FM.UtAjaxJob.jobMaxTrhreads) {
        var numnext = FM.UtAjaxJob.jobMaxTrhreads - FM.UtAjaxJob.threadsList.length;
        var nextJobs = [];
        for(id in FM.UtAjaxJob.jobList) {
            idlist = FM.UtAjaxJob.jobList[id];

            // iz svake liste samo jedan kandidat
            var njob = null;
            for(i=0; i < idlist.length; i++) {
                job = idlist[i];
                if(job.runTime == 0 && (njob == null || njob.callTime > job.callTime)) njob = job;
            }

            if(njob != null) {
                if(nextJobs.length < numnext) {
                    nextJobs.push(job);
                } else {
                    nextJobs.sort(function(j1,j2) {
                        return(j1.callTime - j2.callTime);
                    });
                    if(job.calltime < nextJobs[nextJobs.length-1].calltime) {
                        nextJobs[nextJobs.length-1] = job;
                    }
                }
            }
        }

        // dodaj nove jobove i pokreni ih
        for(i=0; i < nextJobs.length; i++) {
            job = nextJobs[i];
            FM.UtAjaxJob.threadsList.push(job);
            job.run();
        }
    }

    if(!FM.UtAjaxJob.timer && FM.UtAjaxJob.threadsList.length > 0) {
        setTimeout("FM.UtAjaxJob.__checklist__()",2000);
    }
}

// file: src/lib/fm/ut/ut.UtTimer.js
/**
* Timer job class. 
* @class FM.UtTimerJob
* @extends FM.Object
* @param {String} event Event to send
* @param {any} evdata Data to send with event
* @param {number} period Period in secconds
* @param {number} executecount
*/    
FM.UtTimerJob = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtTimerJob,FM.Object); 

// properties
FM.UtTimerJob.prototype.objectSubClass = "";
FM.UtTimerJob.prototype.event = '';
FM.UtTimerJob.prototype.evdata = null;
FM.UtTimerJob.prototype.period = -1;
FM.UtTimerJob.prototype.executecount = -1;
FM.UtTimerJob.prototype.suspended = false;
FM.UtTimerJob.prototype.started = false;
FM.UtTimerJob.prototype.lastRun = 0;

FM.UtTimerJob.prototype._init = function(event,evdata,period,executecount) {
    this.objectSubClass = "UtTimerJob";
    this.event = '';
    this.evdata = null;
    this.period = -1;
    this.executecount = -1;
    this.suspended = false;
    this.started = false;
    this.lastRun = 0;

    this._super("_init",evdata);

    this.event = event;
    this.evdata = evdata;
    this.period = period < FM.UtTimer.minPeriod ? FM.UtTimer.minPeriod : period;
    this.executecount = FM.isset(executecount) ? executecount : -1;
    this.suspended = false;
    this.started = false;
    this.lastRun = 0;
}

FM.UtTimerJob.prototype.start = function() {
    this.started = true;
    FM.UtTimer.jobsList.push(this);
    if(!FM.UtTimer.timeoutHandle) {
        FM.UtTimer.__checklist__();
    }
}

FM.UtTimerJob.prototype.isStarted = function() {
    return this.started;
}

FM.UtTimerJob.prototype.isSuspended = function() {
    return this.suspended;
}

FM.UtTimerJob.prototype.suspend = function() {
    this.suspended = true;
}

FM.UtTimerJob.prototype.resume = function() {
    if(!this.isStarted()) this.start();
    this.suspended = false;
}

FM.UtTimerJob.prototype.dispose = function() {    
    FM.UtTimer.suspended = true;
    
    this.suspended = true;
    this.started = false;
    
    var nlist = [];
    for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
        if(FM.UtTimer.jobsList[i] != this) {
            nlist.push(FM.UtTimer.jobsList[i]);
        }
    }
    FM.UtTimer.jobsList = nlist;
    
    this.removeAllListeners();
    
}

// static
FM.UtTimerJob.className = "UtTimerJob";
FM.UtTimerJob.fullClassName = 'ut.UtTimerJob';


/**
* Timer class. <b>Ovo bi trebalo srediti da extend FM.object</b>
* @class FM.UtTimer
*/
FM.UtTimer = function() {
    //this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtTimer,null); 

// properties
FM.UtTimer.prototype.objectSubClass = "UtTimer";

// static
FM.UtTimer.className = "UtTimer";
FM.UtTimer.fullClassName = 'ut.UtTimer';

FM.UtTimer.minPeriod = 1;
FM.UtTimer.timeoutHandle = null;
FM.UtTimer.jobsList = [];
FM.UtTimer.suspended = false;

FM.UtTimer.__checklist__ = function() {
    if(!FM.UtTimer.suspended) {
        var nlist = [];
        for(var i=0; i < FM.UtTimer.jobsList.length; i++) {
            var job = FM.UtTimer.jobsList[i];
            if(
                job.executecount != 0 && job.suspeded != false &&
                job.lastRun + job.period * 1000 < new Date().getTime()
            ) {
                job.lastRun = new Date().getTime();
                job.executecount--;
                if(job.executecount != 0) nlist.push(job);
                job.fireEvent(job.event, job.evdata);
            } else {
                if(job.executecount != 0) nlist.push(job);
            }
        }
        FM.UtTimer.jobsList = nlist;

        if(FM.UtTimer.jobsList.length > 0) {
            FM.UtTimer.timeoutHandle = setTimeout("FM.UtTimer.__checklist__()",FM.UtTimer.minPeriod * 1000);
        }else {
            FM.UtTimer.timeoutHandle = null;
        }
    } else { // za svaki slucaj
        FM.UtTimer.timeoutHandle = null;
    }
}

FM.UtTimer.suspendQueue = function() {
    FM.UtTimer.suspended = true;
}

FM.UtTimer.resumeQueue = function() {
    FM.UtTimer.suspended = false;
    FM.UtTimer.__checklist__();
}

// file: src/lib/fm/ut/ut.UtRegistry.js
/**
* Registry class. 
* @class FM.UtRegistry
* @extends FM.Object
* @param {object} opt Options
*/    
FM.UtRegistry = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(FM.UtRegistry,FM.Object); 

// properties
FM.UtRegistry.prototype.objectSubClass = "";
FM.UtRegistry.prototype.cookieName = '';
FM.UtRegistry.prototype.registry = null;

FM.UtRegistry.prototype._init = function(opt) {            
    this.cookieName = '';
    this.registry = null;

    this._super("_init",opt);
    this.objectSubClass = "UtRegistry";

    this.cookieName = this.getAttr('cookieName','fmRegistry');
    this.registry = null;
}

FM.UtRegistry.prototype.set = function(pkey,val,force) {
    force = FM.isset(force) && force == true ? true: false;
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey,force);
    if(!ndef.node) return false;
    ndef.node[ndef.keyName] = val;

    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});

    return true;
}

FM.UtRegistry.prototype.get = function(pkey,defv) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey);
    if(!ndef.node) return FM.isset(defv) ? defv : '';

    return (
        !FM.isset(ndef.keyValue) ||  
        ndef.keyValue == null || 
        (FM.isString(ndef.keyValue) && ndef.keyValue == '')  ? 
        (FM.isset(defv) ? defv : '') : 
        ndef.keyValue
    );
}

FM.UtRegistry.prototype.remove = function(pkey) {
    if(this.registry == null) {
        var cookie = FM.loadCookie(this.cookieName);
        if(FM.isset(cookie.reg)) this.registry = FM.unserialize(cookie.reg);
        if(this.registry == null || !FM.isObject(this.registry)) this.registry = {};
    }

    var ndef = FM.UtRegistry.findKey(this.registry,pkey);
    if(!ndef.node) return false;

    var nnode = {};
    for(var en in ndef.node) {
        if(en != ndef.keyName) {
            nnode[en] = ndef.node[en];
        }
    }

    if(ndef.parent) ndef.parent[ndef.nodeKey] = nnode;
    else this.registry = nnode;

    FM.saveCookie(this.cookieName,{reg: FM.serialize(this.registry)});
    return true;
}

FM.UtRegistry.prototype.findKey = function(key,force) {
    return FM.UtRegistry(this.registry,key,force);
}

// static
FM.UtRegistry.className = "UtRegistry";
FM.UtRegistry.fullClassName = 'ut.UtRegistry';


FM.UtRegistry.findKey = function(reg,key,force) {
    var retc = {found: false, node: null, nodeKey: '', parent: null, keyName: '', keyValue: null};
    force = FM.isset(force) && force == true ? true: false;

    if(!FM.isset(reg) || !reg || !FM.isObject(reg)) return retc;
    if(!FM.isset(key) || !key || key == '') return retc;

    var apath_f = key.split("/");
    var apath = [];
    for(var k=0; k < apath_f.length; k++) {
        if(apath_f[k] != null && apath_f[k] != '') {
            apath.push(apath_f[k]);
        }
    }
    if(apath.length < 1) return retc;

    var ndirs = apath.length -1;

    retc.keyName = apath[apath.length -1];
    retc.node = reg;
    for(var i = 0; i < ndirs; i++) {
        var nname = apath[i];
        if(!FM.isset(retc.node[nname]) || !FM.isObject(retc.node[nname])) {
            if(force) retc.node[nname] = {};
            else return retc;
        }
        retc.parent = retc.node;
        retc.nodeKey = nname;
        retc.node = retc.node[nname];
    }

    if(FM.isset(retc.node[retc.keyName])) {
        retc.found = true;
        retc.keyValue = retc.node[retc.keyName];
    }

    return retc;
}


// file: src/lib/fm/dm/dm.DmObject.js
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

// file: src/lib/fm/dm/dm.DmList.js
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
        hdrs[hname] = FM.applyTemplate(args,hdrs[hname],false,true).replace(/\s*\[\:.*?\]\s*/g, "");
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
        method: this.resolvePropertyValue('config.method','',this),
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


// file: src/lib/fm/lm/lm.LmObject.js
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

// file: src/lib/fm/app/app.AppObject.js
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


// file: src/oa/config/oa.ClassConfig.js
if(typeof(OA) == 'undefined') {
    /**
    * @namespace OneAPI SDK namespace
    */
    OA = function() {};    
}

/* =============================================================================
 * Dm Class declaration
 * ========================================================================== */
    
// -- error --------------------------------------------------------------------
OA.DmApiError = function() {
    this._init.apply(this, arguments);
}
FM.extendClass(OA.DmApiError, FM.DmGenericError);

// properties
OA.DmApiError.prototype.objectSubClass = "";

OA.DmApiError.prototype._init = function(attrs) {
    this._super("_init",attrs, {        
        clientCorrelator: '',        
        serviceException: {},
        policyException: {},
        messageId: '',
        text: ''
    });    
    this.objectSubClass = "ApiErrors";
    
    var messageId = this.getAttr('serviceException.messageId',this.getAttr('policyException.messageId',''));
    var text = this.getAttr('serviceException.text', this.getAttr('policyException.text',''));
    var variables = this.getAttr('serviceException.variables', this.getAttr('policyException.variables',''));
    if(FM.isArray(variables)) {
        for(var i=variables.length-1; i > -1; i--) {
            text = text.replace('%' + (i+1),variables[i]);
        }
    }
    
    this.setAttr('messageId',messageId);
    this.setAttr('text',text);
}

OA.DmApiError.className = "DmApiError";
OA.DmApiError.fullClassName = 'dm.DmApiError';

FM.DmObject.addSubClassType('DmApiErrors',OA.DmApiError);


// -- user credentials ---------------------------------------------------------
OA.DmUserCredentials = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmUserCredentials, FM.DmObject); 

// properties
OA.DmUserCredentials.prototype.objectSubClass = "";

// methods
OA.DmUserCredentials.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        username: "",
        ibAuthCookie: "",
        verified: false
    });
    this.objectSubClass = "UserCredentials";
}
        
OA.DmUserCredentials.prototype.getDataID = function() {
    return this.getAttr('ibAuthCookie','');
}

OA.DmUserCredentials.prototype.isAuthenticated = function() {
    return this.getAttr('ibAuthCookie','') != '';
}

OA.DmUserCredentials.prototype.isVerified = function() {
    return this.getAttr('ibAuthCookie','') != '' && this.getAttr('verified',false);
}

OA.DmUserCredentials.className = "DmUserCredentials";
OA.DmUserCredentials.fullClassName = 'dm.DmUserCredentials';

FM.DmObject.addSubClassType('UserCredentials',OA.DmUserCredentials);

// -- user login data ----------------------------------------------------------
OA.DmUserLoginData = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmUserLoginData, FM.DmObject); 

// properties
OA.DmUserLoginData.prototype.objectSubClass = "";

// methods
OA.DmUserLoginData.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        username: '',
        password: ''
    });
    this.objectSubClass = "DmUserLoginData";
}
        
OA.DmUserLoginData.prototype.getDataID = function() {
    return this.getAttr('username','');
}


OA.DmUserLoginData.className = "DmUserLoginData";
OA.DmUserLoginData.fullClassName = 'dm.DmUserLoginData';

FM.DmObject.addSubClassType('UserLoginData',OA.DmUserLoginData);


// -- countries ----------------------------------------------------------------
OA.DmCountry = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmCountry, FM.DmObject); 

// properties
OA.DmCountry.prototype.objectSubClass = "";

// methods
OA.DmCountry.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        id: '',
        code: '',
        prefix: '',
        name: '',
        locale: ''
    });
    this.objectSubClass = "DmCountry";
}
        
OA.DmCountry.prototype.getDataID = function() {
    return this.getAttr('code','');
}


OA.DmCountry.className = "DmCountry";
OA.DmCountry.fullClassName = 'dm.DmCountry';

FM.DmObject.addSubClassType('Country',OA.DmCountry);

// -- timezones ----------------------------------------------------------------
OA.DmTimezone = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmTimezone, FM.DmObject); 

// properties
OA.DmTimezone.prototype.objectSubClass = "";

// methods
OA.DmTimezone.prototype._init = function(attrs) {            
    this._super("_init",attrs, {
        id: '',
        name: '',
        standardUtcOffset: '',
        dstOffset: '',
        dstStartTime: '',
        dstEndTime: '',
        countryId: '',
        title: ''
    });
    this.objectSubClass = "DmTimezone";

    var utcOff = parseInt(this.getAttr('standardUtcOffset',0));
    var utcH = utcOff / 60.0;
    var offH = Math.floor(Math.abs(utcH)) * (utcH < 0 ? -1 : 1);
    var offM = Math.floor(Math.abs(utcH - offH) * 60);
    var offStr = '(UTC ' + (offH < 0 ? '-' : '+');
    
    offStr += (offH < 10 && offH > -10 ?
        '0' + '' + Math.abs(offH) :
        '' + Math.abs(offH)) +
    ':' +
    (offM < 10 && offM > -10 ?
        '0' + '' + offM :
        '' + offM) +
    ') '
    ;
    
    this.setAttr('title',offStr + this.getAttr('name',''));
}
        
OA.DmTimezone.prototype.getDataID = function() {
    return this.getAttr('id','');
}


OA.DmTimezone.className = "DmTimezone";
OA.DmTimezone.fullClassName = 'dm.DmTimezone';

FM.DmObject.addSubClassType('Timezone',OA.DmTimezone);

// -- languages ----------------------------------------------------------------
OA.DmLanguage = function() {
    this._init.apply(this, arguments); 
}

FM.extendClass(OA.DmLanguage, FM.DmObject); 

// properties
OA.DmLanguage.prototype.objectSubClass = "";

// methods
OA.DmLanguage.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        id: '',
        languageCode: '',
        languageName: '',
        languageNameLocal: ''
    });
    this.objectSubClass = "DmLanguage";
}
        
OA.DmLanguage.prototype.getDataID = function() {
    return this.getAttr('languageCode','');
}


OA.DmLanguage.className = "DmLanguage";
OA.DmLanguage.fullClassName = 'dm.DmLanguage';

FM.DmObject.addSubClassType('Language',OA.DmLanguage);

// -- customer profile ---------------------------------------------------------
OA.DmCustomerProfile = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmCustomerProfile, FM.DmObject); // extends FM.Object

// properties
OA.DmCustomerProfile.prototype.objectSubClass = "";

// methods
OA.DmCustomerProfile.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        id: '',
        city: '',
        countryId:  '',
        email:  '',
        enabled:  false,
        fax:  '',
        forename:  '',
        gsm:  '',            
        msn:  '',
        primaryLanguageId:  '',
        secondaryLanguageId:  '',
        skype:  '',
        street:  '',
        surname:  '',
        telephone:  '',
        timezoneId:  '',
        username:  '',
        zipCode:  ''
    });
    this.objectSubClass = "CustomerProfile";
}
        
OA.DmCustomerProfile.prototype.getDataID = function() {
    return this.getAttr('id','');
}
OA.DmCustomerProfile.className = "DmCustomerProfile";
OA.DmCustomerProfile.fullClassName = 'dm.DmCustomerProfile';
FM.DmObject.addSubClassType('CustomerProfile',OA.DmCustomerProfile);

// -- SMS message --------------------------------------------------------------
OA.DmSMSMessage = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmSMSMessage, FM.DmObject); // extends FM.Object

// properties
OA.DmSMSMessage.prototype.objectSubClass = "";

// methods
OA.DmSMSMessage.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        senderAddress: '',
        senderName: '',
        message: '',
        address: '',
        notifyURL: '',
        callbackData: '',
        dataCoding: '0',
        clientCorrelator: ''
    });
    this.objectSubClass = "SMSMessage";
}
        
OA.DmSMSMessage.prototype.getDataID = function() {
    return this.getAttr('clientCorrelator','');
}
OA.DmSMSMessage.className = "DmSMSMessage";
OA.DmSMSMessage.fullClassName = 'dm.DmSMSMessage';
FM.DmObject.addSubClassType('SMSMessage',OA.DmSMSMessage);


// Delivery info !! dupli (DmDeliveryInfoNotification)
OA.DmDeliveryInfo = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmDeliveryInfo, FM.DmObject); // extends FM.Object

// properties
OA.DmDeliveryInfo.prototype.objectSubClass = "";

// methods
OA.DmDeliveryInfo.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        address: '',
        deliveryStatus: ''
    });
    this.objectSubClass = "DeliveryInfo";
}
        
OA.DmDeliveryInfo.prototype.getDataID = function() {
    return this.getID();
}

OA.DmDeliveryInfo.className = "DmDeliveryInfo";
OA.DmDeliveryInfo.fullClassName = 'dm.DmDeliveryInfo';
FM.DmObject.addSubClassType('DeliveryInfo',OA.DmDeliveryInfo);


// delivery status of SMS message
OA.DmDeliveryInfoNotification = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmDeliveryInfoNotification, FM.DmObject); // extends FM.Object

// properties
OA.DmDeliveryInfoNotification.prototype.objectSubClass = "";

// methods
OA.DmDeliveryInfoNotification.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        deliveryInfo: {
            address: '',
            deliveryStatus: ''
        },
        callbackData: ''
    });
    this.objectSubClass = "DeliveryInfoNotification";
}
        
OA.DmDeliveryInfoNotification.prototype.getDataID = function() {
    return this.getID();
}

OA.DmDeliveryInfoNotification.className = "DmDeliveryInfoNotification";
OA.DmDeliveryInfoNotification.fullClassName = 'dm.DmDeliveryInfoNotification';
FM.DmObject.addSubClassType('DeliveryInfoNotification',OA.DmDeliveryInfoNotification);

// -- REST resource reference --------------------------------------------------
OA.DmResourceReference = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmResourceReference, FM.DmObject); // extends FM.Object

// properties
OA.DmResourceReference.prototype.objectSubClass = "";

// methods
OA.DmResourceReference.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        resourceURL: '',
        resourceObject: null
    });
    this.objectSubClass = "ResourceReference";
}
        
OA.DmResourceReference.prototype.getDataID = function() {
    return this.getAttr('resourceURL','');
}
OA.DmSMSMessage.className = "DmResourceReference";
OA.DmSMSMessage.fullClassName = 'dm.DmResourceReference';
FM.DmObject.addSubClassType('ResourceReference',OA.DmResourceReference);

// -- inbound message ----------------------------------------------------------
OA.DmInboundMessage = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmInboundMessage, FM.DmObject); // extends FM.Object

// properties
OA.DmInboundMessage.prototype.objectSubClass = "";

// methods
OA.DmInboundMessage.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        dateTime: '',
        destinationAddress: '',
        messageId: '',
        message: '',
        resourceURL: '',
        senderAddress: ''
    });
    this.objectSubClass = "InboundMessage";
}
        
OA.DmInboundMessage.prototype.getDataID = function() {
    return this.getID();
}

OA.DmInboundMessage.className = "DmInboundMessage";
OA.DmInboundMessage.fullClassName = 'dm.DmInboundMessage';
FM.DmObject.addSubClassType('InboundMessage',OA.DmInboundMessage);

// inboud query
OA.DmInboundQuery = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmInboundQuery, FM.DmObject); // extends FM.Object

// properties
OA.DmInboundQuery.prototype.objectSubClass = "";

// methods
OA.DmInboundQuery.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        subscriptionId: '',
        maxBatchSize: '100'
    });
    this.objectSubClass = "InboundQuery";
}
        
OA.DmInboundQuery.prototype.getDataID = function() {
    return this.getAttr('subscriptionId','');
}

OA.DmInboundQuery.className = "DmInboundQuery";
OA.DmInboundQuery.fullClassName = 'dm.DmInboundQuery';
FM.DmObject.addSubClassType('InboundQuery',OA.DmInboundQuery);

// -- Hlr requests -------------------------------------------------------------
OA.DmTerminalRoamingQuery = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmTerminalRoamingQuery, FM.DmObject); // extends FM.Object

// properties
OA.DmTerminalRoamingQuery.prototype.objectSubClass = "";

// methods
OA.DmTerminalRoamingQuery.prototype._init = function(attrs) {
    this._super("_init",attrs, {        
        address: '',
        notifyURL:'',
        includeExtendedData:'',
        clientCorrelator: '',
        callbackData: ''
    });
    this.objectSubClass = "DmTerminalRoamingQuery";
}
        
OA.DmTerminalRoamingQuery.prototype.getDataID = function() {
    return this.getAttr('address','');
}
OA.DmTerminalRoamingQuery.className = "DmTerminalRoamingQuery";
OA.DmTerminalRoamingQuery.fullClassName = 'dm.DmTerminalRoamingQuery';
FM.DmObject.addSubClassType('TerminalRoamingQuery',OA.DmTerminalRoamingQuery);


OA.DmTerminalRoamingStatus = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmTerminalRoamingStatus, FM.DmObject); // extends FM.Object

// properties
OA.DmTerminalRoamingStatus.prototype.objectSubClass = "";

// methods
OA.DmTerminalRoamingStatus.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        address: '',
        currentRoaming: '',
        servingMccMnc: {
            mcc: '',
            mnc: ''
        },
        resourceURL: '',
        retrievalStatus: '',
        extendedData: '',
        callbackData: ''
    });
    this.objectSubClass = "TerminalRoamingStatus";
}
        
OA.DmTerminalRoamingStatus.prototype.getDataID = function() {
    return this.getAttr('resourceURL','');
}
OA.DmTerminalRoamingStatus.className = "DmTerminalRoamingStatus";
OA.DmTerminalRoamingStatus.fullClassName = 'dm.DmTerminalRoamingStatus';
FM.DmObject.addSubClassType('TerminalRoamingStatus',OA.DmTerminalRoamingStatus);

// -- Account balance ----------------------------------------------------------
OA.DmAccountBalance = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmAccountBalance, FM.DmObject); // extends FM.Object

// properties
OA.DmAccountBalance.prototype.objectSubClass = "";

// methods
OA.DmAccountBalance.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        currency: {
            id: '',
            currencyName: '',
            symbol: ''
        },
        balance: ''
    });
    this.objectSubClass = "AccountBalance";
}
        
OA.DmAccountBalance.prototype.getDataID = function() {
    return this.getID();
}
OA.DmAccountBalance.className = "DmAccountBalance";
OA.DmAccountBalance.fullClassName = 'dm.DmAccountBalance';
FM.DmObject.addSubClassType('AccountBalance',OA.DmAccountBalance);


// Inbound sms message 
OA.DmInboundSmsMessage = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmInboundSmsMessage, FM.DmObject); // extends FM.Object

// properties
OA.DmInboundSmsMessage.prototype.objectSubClass = "";

// methods
OA.DmInboundSmsMessage.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        messageId: '',
        dateTime: '',
        destinationAddress: '',    
        message: '',
        resourceURL: '',
        senderAddress: ''
    });
    this.objectSubClass = "InboundSmsMessage";
}
        
OA.DmInboundSmsMessage.prototype.getDataID = function() {
    return this.getAttr('messageId','');
}

OA.DmInboundSmsMessage.className = "DmInboundSmsMessage";
OA.DmInboundSmsMessage.fullClassName = 'dm.DmInboundSmsMessage';
FM.DmObject.addSubClassType('InboundSmsMessage',OA.DmInboundSmsMessage);

// MO subscription
OA.DmMoSubscription = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmMoSubscription, FM.DmObject); // extends FM.Object

// properties
OA.DmMoSubscription.prototype.objectSubClass = "";

// methods
OA.DmMoSubscription.prototype._init = function(attrs) {
    this._super("_init",attrs, {
        subscriptionId: '',
        notifyURL: '',
        callbackData: '',
        criteria:"",
        destinationAddress: '',
        notificationFormat: '',
        title: ''
    });
    this.objectSubClass = "MoSubscription";
    this.setAttr('title',this.getAttr('destinationAddress','') + ', ' + this.getAttr('criteria',''));
    this.setChanged(false,false);
}

OA.DmMoSubscription.prototype.getDataID = function() {
    return this.getAttr('subscriptionId','');
}
OA.DmMoSubscription.className = "DmMoSubscription";
OA.DmMoSubscription.fullClassName = 'dm.DmMoSubscription';
FM.DmObject.addSubClassType('MoSubscription',OA.DmMoSubscription);

//-- USSD ----------------------------------------------------------------------
OA.DmUSSDQuery = function() {
    this._init.apply(this, arguments); // new poziva _init()
}
FM.extendClass(OA.DmUSSDQuery, FM.DmObject); // extends FM.Object

// properties
OA.DmUSSDQuery.prototype.objectSubClass = "";

// methods
OA.DmUSSDQuery.prototype._init = function(attrs) {
    this._super("_init",attrs, {        
        address: '',
        message:'',
        stopSession: 'false',
        _ussd_function: null
    });
    this.objectSubClass = "USSDQuery";
}
        
OA.DmUSSDQuery.prototype.getDataID = function() {
    return this.getID();
}
OA.DmUSSDQuery.className = "DmUSSDQuery";
OA.DmUSSDQuery.fullClassName = 'dm.DmUSSDQuery';
FM.DmObject.addSubClassType('USSDQuery',OA.DmUSSDQuery);


// file: src/oa/config/oa.ListConfig.js
/* =============================================================================
 * List helper functions 
 * ========================================================================== */

// -- urls & proxy -------------------------------------------------------------
OA.apiURL = 'http://oneapi.infobip.com/1';
OA.proxyURL= '';
OA.setProxy = function(url) {  
    OA.proxyURL = FM.isset(url) && url ? url : '';
}

OA.setAPIurl = function(url) {  
    OA.apiURL = FM.isset(url) && url ? url : '';
}


//options = {dmList: this, arguments: args};
OA.getApiUrl = function(options) {
    var dmList = FM.getAttr(options,'dmList',null);
    
    var url = OA.proxyURL != '' ? 
    OA.proxyURL :
    OA.apiURL + (
        dmList && FM.isset(dmList['getAttr']) ? 
        dmList.getProperty('config.resourcePath','') : 
        ''
        )
    ;
    
    if(url.substr(url.length-1) == "/") {
        url = url.substr(0,url.length-1);
    }
    return url;
}


// -- ajax call headers --------------------------------------------------------
OA.getApiHeaders = function(options) {
    var dmList = FM.getAttr(options,'dmList',null);
    var hdrs = {};
    if(OA.proxyURL != '') {
        if(OA.apiAuth.getAttr("ibAuthCookie",'') != '') {
            hdrs['P-Authorization'] = 'IBSSO ' + OA.apiAuth.getAttr("ibAuthCookie",'');
        }
        hdrs['P-Rest-Service'] = dmList ? dmList.getProperty('config.resourcePath','') : '';
        hdrs['P-Http-Headers'] = 'Authorization';
        hdrs['P-Http-Method']  = dmList ? dmList.getProperty('config.resourceMethod','POST') : 'POST';
    } else {
        if(OA.apiAuth.getAttr("ibAuthCookie",'') != '') {
            hdrs['Authorization'] = 'IBSSO ' + OA.apiAuth.getAttr("ibAuthCookie",'');
        }
    }
    
    return hdrs;
}

// -- ajax call method ---------------------------------------------------------
OA.getApiMethod = function(dmList) {
    if(OA.proxyURL != '') {
        return 'POST';
    } else {
        return dmList ? dmList.getProperty('config.resourceMethod','POST') : 'POST';
    }
}

// -- ajax response parsing ----------------------------------------------------
// {dmList: this, utAjax: oAjax, response: response.getAttr('value',null)}
OA.isErrorResponse = function(options) {  
    var oData = FM.getAttr(options,'response',{});
    
    if(!FM.isObject(oData)) {
        oData = FM.unserialize(oData,{});
    }
    var response = FM.isset(oData) && oData ? oData : null;
    return response && FM.isset(response['requestError']);
}

OA.errorParser = function(options) {
    var response = FM.getAttr(options,'response',{});
    if(!FM.isObject(response)) {
        response = FM.unserialize(response,{});
    }
    return new OA.DmApiError(FM.getAttr(response,'requestError',{}));
}

OA.responseParser = function(options) {
    var oData = FM.getAttr(options,'response',{});
    var oList = FM.getAttr(options,'dmList',null);
    
    if(!oList || !FM.isset(oList.getProperty)) {
        return new FM.DmGenericValue({
            value: oData
        });
    }
    
    var cls = oList.getProperty('config._responseClass',null);
    if(!cls) return new FM.DmGenericValue({
        value: oData
    });
    
    
    if(FM.isString(cls)) {
        cls = FM.stringPtrToObject(cls);
        if(!cls) return null;
    }
    
    if(!FM.isFunction(cls)) return null;
    return new cls(oData); 
}


/* =============================================================================
 * List configurations
 * ========================================================================== */
// == cache ====================================================================
// -- customer profiles cache --------------------------------------------------
FM.DmList.addConfiguration('cache', {});

// == user managment ===========================================================
// -- user login ---------------------------------------------------------------
FM.DmList.addConfiguration('USER_login', {
    resourcePath: '/customerProfile/login',
    url: OA.getApiUrl,
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        username: true,
        password: true
    },
    headers: OA.getApiHeaders,
    auth: null,        
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: 'login',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmUserCredentials
});

// -- user logout --------------------------------------------------------------
FM.DmList.addConfiguration('USER_logout', {
    resourcePath: '/customerProfile/logout',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'TEXT',
    validResponseCodes: '204', // nocontent
    listType: 'single',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser    
});

// == utils ====================================================================
// -- list of countries --------------------------------------------------------
FM.DmList.addConfiguration('UTIL_countries', {
    resourcePath: '/countries/[:id]',
    url: OA.getApiUrl,
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'collection',
    dataProperty: 'countries',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmCountry
});

// -- list of timezones --------------------------------------------------------
FM.DmList.addConfiguration('UTIL_timezones', {
    resourcePath: '/timezones/[:id]',
    url: OA.getApiUrl,
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'collection',
    dataProperty: 'timeZones',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmTimezone
});

// -- list of languages --------------------------------------------------------
FM.DmList.addConfiguration('UTIL_languages', {
    resourcePath: '/languages/[:id]',
    method: OA.getApiMethod,
    url: OA.getApiUrl,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'collection',
    dataProperty: 'languages',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmLanguage
});

// == profile managment ========================================================
// -- customer profile ---------------------------------------------------------
// ovo bi trebalo odraditi poziv sa i bez id-a
FM.DmList.addConfiguration('CUSTOMER_profile_get', {
    resourcePath: '/customerProfile/[:userId]',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        userId: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',    
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmCustomerProfile    
});

// -- customer profile update --------------------------------------------------
FM.DmList.addConfiguration('CUSTOMER_profile_update', {
    resourcePath: '/customerProfile',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'PUT',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        id: true,
        username: true,
        forename: true,
        surname: true,
        street: true,
        city: true,
        zipCode: true,
        telephone: true,
        gsm: true,
        fax: true,
        email: true,
        msn: true,
        skype: true,
        countryId: true,
        //countryCode: true,
        timezoneId: true,
        primaryLanguageId: true,
        secondaryLanguageId: true,
        enabled: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '201', // ??   
    listType: 'single',    
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmCustomerProfile
});

// == MO =======================================================================
FM.DmList.addConfiguration('SMS_inbound_update', {
    resourcePath: '/smsmessaging/inbound/subscriptions',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'PUT',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        notifyURL: true,
        subscriptionId: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'TEXT',
    validResponseCodes: '201',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser
});

FM.DmList.addConfiguration('SMS_inbound_sub_get', {
    resourcePath: '/smsmessaging/inbound/subscriptions',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        page: '',
        pageSize: ''
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection',
    dataProperty: 'subscriptions',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmMoSubscription
});

FM.DmList.addConfiguration('SMS_inbound_sub_add', {
    resourcePath: '/smsmessaging/inbound/subscriptions',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        destinationAddress: '',
        notifyURL: '',
        criteria: '',
        notificationFormat: '',
        callbackData: '',
        clientCorrelator: ''        
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'TEXT',
    validResponseCodes: '201',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: FM.DmGenericValue
});

FM.DmList.addConfiguration('SMS_inbound_sub_delete', {
    resourcePath: '/smsmessaging/inbound/subscriptions/[:subscriptionId]',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'DELETE',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        subscriptionId: ''
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'TEXT',
    validResponseCodes: '204',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser
});

FM.DmList.addConfiguration('SMS_inbound_get_messages', {
    resourcePath: '/smsmessaging/inbound/registrations/[:subscriptionId]/messages',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        subscriptionId: true,
        maxBatchSize: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection',
    dataProperty: 'inboundSMSMessageList.inboundSMSMessage',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    
    // custom
    _responseClass: OA.DmInboundMessage
});

// == SMS ======================================================================
FM.DmList.addConfiguration('SMS_send', {
    resourcePath: '/smsmessaging/outbound/[:senderAddress]/requests',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        senderAddress: true,
        senderName: true,
        message: true,
        address: true,
        notifyURL: true,
        callbackData: true,
        dataCoding: true,
        clientCorrelator: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '201',
    listType: 'single',
    dataProperty: 'resourceReference',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmResourceReference
});

// Delivery info
FM.DmList.addConfiguration('DELIVERY_INFOS_get', {
    resourcePath: '/smsmessaging/outbound/[:senderAddress]/requests/[:requestID]/deliveryInfos',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        senderAddress: true,
        requestID: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'collection',
    dataProperty: 'deliveryInfoList.deliveryInfo',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    
    // custom
    _responseClass: OA.DmDeliveryInfo
});

// == HLR ======================================================================
FM.DmList.addConfiguration('HLR_send', {
    resourcePath: '/terminalstatus/queries/roamingStatus',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {        
        address: true,
        notifyURL: true,
        includeExtendedData: true,
        clientCorrelator: true,
        callbackData: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: 'roaming',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    
    // custom
    _responseClass: OA.DmTerminalRoamingStatus
});

    
// == USSD =====================================================================
FM.DmList.addConfiguration('USSD_send', {
    resourcePath: '/ussd/outbound',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        address: true,
        message: true,
        stopSession: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    // custom
    _responseClass: OA.DmInboundMessage
});

FM.DmList.addConfiguration('USSD_send_stop', {
    resourcePath: '/ussd/outbound',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    params: {
        address: true,
        message: true,
        stopSession: true
    },
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'TEXT',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser
});

// == Account balance ==========================================================
FM.DmList.addConfiguration('CUSTOMER_balance_get', {
    resourcePath: '/customerProfile/balance',
    url: OA.getApiUrl,
    
    // ajax config
    method: OA.getApiMethod,
    resourceMethod: 'GET',
    contentType: 'application/x-www-form-urlencoded',
    params: {},
    headers: OA.getApiHeaders,
    auth: null,
    responseFormat: 'JSON',
    validResponseCodes: '200',
    listType: 'single',
    dataProperty: '',
    //
    isErrorResponse: OA.isErrorResponse,
    errorParser: OA.errorParser,
    responseParser: OA.responseParser, 
    
    // custom
    _responseClass: OA.DmAccountBalance
});

// file: src/oa/config/oa.ClassDecorations.js
// -- decorations --------------------------------------------------------------
FM.DmObject.defineClassDecorations('SignupData',{
        username:  'Username',
        forename:  'First name',
        surname:  'Last name',
        gsm:  'Telephone (GSM)',
        telephone:  'Telephone',
        email:  'Email address',
        password:  'Password',
        password2:  'Repeat password',
        data: 'Data'
});


FM.DmObject.defineClassDecorations('CustomerProfile',{
        id:  'Id',
        username:  'Username',
        forename:  'First name',
        surname:  'Last name',
        
        countryId:  'Country',
        city: 'City',
        street:  'Street',
        zipCode:  'Zip code',

        fax:  'Fax',        
        gsm:  'Telephone (GSM)',
        telephone:  'Telephone',

        email:  'Email address',
        msn:  'MSN id',
        skype:  'Skype id',
        
        primaryLanguageId:  'Language',
        secondaryLanguageId:  'Secondary language',
        timezoneId:  'Timezone',
                
        enabled:  'Enabled',
        data: 'Data'
});


// file: src/oa/oa.AppOneApi.js
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
    FM.dateTimeDeveder = 'T';
    
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
    

// file: src/oa/api.js
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

    oneapi.retrieveInboundSubscriptions = function(
    /*
        destinationAddress,notifyURL,
        criteria,notificationFormat,
        callbackData,
        clientCorrelator,
    */
        page,pageSize,
        callbackFn
    ) {
        return oneapi.session.app.retrieveInboundSubscriptions(
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

}
