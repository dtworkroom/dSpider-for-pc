/**
 * Created by du on 16/11/17.
 */
function callHandler(){
    var f=arguments[2];
    if (f) {
        arguments[2] = safeCallback(f)
    }
    bridge.callHandler.apply(bridge,arguments);
}
var dSpiderLocal = {
    set: function (k, v) {
        callHandler("save", {"key": k, "value": v})
    },

    get: function (k, f) {
        callHandler("read",{"key":k} ,function (d) {
            f && f(d)
        })
    }
};

function DataSession(key) {
    this.key = key;
    this.finished=false;
    callHandler("start", {"sessionKey":key})
}

DataSession.getExtraData = function (f) {

    callHandler("getExtraData", null, function (data) {
        f && f(JSON.parse(data || "{}"))
    })
}

DataSession.prototype = {

    _save: function () {
        callHandler("set", {"sessionKey": this.key, "value": JSON.stringify(this.data)})
    },
    _init: function (f) {
        var that=this;
        callHandler("get", {"sessionKey":this.key}, function (data) {
            if(!data){
                data={}
            }
            else if(typeof data==="string"){
                data=JSON.parse(data || "{}");
            }
            that.data=data
            f();
        })
    },

    get: function (key) {
        return this.data[key];
    },
    set: function (key, value) {
        this.data[key]=value;
    },
    showProgress: function (isShow) {
        callHandler("showProgress", {"show":isShow === undefined ? true : !!isShow});
    },
    setProgressMax: function (max) {
        callHandler("setProgressMax", {"progress":max});
    },
    setProgress: function (progress) {
        callHandler("setProgress", {"progress":progress});
    },
    getProgress: function (f) {
        callHandler("getProgress",null, function (d) {
            f && f(d)
        })
    },
    showLoading: function (s) {
        callHandler("showLoading",{"s":s || "正在处理,请耐心等待..."});
    },
    hideLoading: function () {
        callHandler("hideLoading");
    },
    finish: function (errmsg, content, code) {
        var that=this;
        DataSession.getExtraData(function (d) {
            var ret = {"sessionKey":that.key, "result": 0, "msg": ""}
            if (errmsg) {
                var ob = {
                    url: location.href,
                    msg: errmsg,
                    content: content||document.documentElement.outerHTML ,
                    extra: d
                }
                ret.result = code || 2;
                ret.msg = JSON.stringify(ob);
            }
            that.finished=true;
            callHandler("finish", ret);

        })
    },
    upload: function (value,f) {
        if (value instanceof Object) {
            value = JSON.stringify(value);
        }
        f=f||function(b){log("push "+b)};
        callHandler("push", {"sessionKey": this.key, "value": value},f);
    },
    load:function(url,headers){
        headers=headers||{}
        if(typeof headers!=="object"){
            alert("the second argument of function load  must be Object!")
            return
        }
        callHandler("load",{url:url,headers:headers});
    },
    setUserAgent:function(str){
        callHandler("setUserAgent",{"userAgent":str})
    },
    autoLoadImg:function(load){

    },
    openWithSpecifiedCore:function(){

    },
    string: function () {
        log(this.data)
    }
};
apiInit();





