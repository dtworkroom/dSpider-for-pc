/**
 * Created by du on 16/9/1.
 */

String.prototype.format = function () {
    var args = Array.prototype.slice.call(arguments);
    var count = 0;
    return this.replace(/%s/g, function (s, i) {
        return args[count++];
    });
};


String.prototype.empty = function () {
    return this.trim() === "";
};

function log() {
    for (var i = 0; i < arguments.length; ++i) {
        var str = arguments[i];
        str = typeof str !== "string" ? JSON.stringify(str) : str;
        console.log("dSpider: " + str);
    }
}
//异常捕获
function errorReport(e) {
    console.error("dSpider: 语法错误: " + e.message + e.stack);
    alert("异常:" + e.message)
    //window.curSession && curSession.finish(e.toString(), "")
}

String.prototype.endWith = function (str) {
    if (!str) return false;
    return this.substring(this.length - str.length) === str;
};

//queryString helper
window.qs = [];
var s = decodeURI(location.search.substr(1));
var a = s.split('&');
for (var b = 0; b < a.length; ++b) {
    var temp = a[b].split('=');
    qs[temp[0]] = temp[1] ? temp[1] : null;
}
MutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver ||
    window.MozMutationObserver;

function safeCallback(f) {
    if (!(f instanceof Function)) return f;
    return function () {
        try {
            f.apply(this, arguments)
        } catch (e) {
            errorReport(e)
        }
    }
}
//设置dQuery异常处理器
dQuery.safeCallback = safeCallback;
dQuery.errorReport = errorReport;


function hook(fun) {
    return function () {
        if (!(arguments[0] instanceof Function)) {
            t = arguments[0];
            log("warning: " + fun.name + " first argument should be function not string ")
            arguments[0] = function () {
                eval(t)
            };
        }
        arguments[0] = safeCallback(arguments[0]);
        return fun.apply(this, arguments)
    }
}

//hook setTimeout,setInterval异步回调
setTimeout = hook(setTimeout);
setInterval = hook(setInterval);

//dom 监控
function DomNotFindReport(selector) {
    var msg = "元素不存在[%s]".format(selector)
    log(msg)
}

function waitDomAvailable(selector, success, fail) {
    var timeout = 10000;
    var t = setInterval(function () {
        timeout -= 10;
        var ob = dQuery(selector)
        if (ob[0]) {
            clearInterval(t)
            success(ob, 10000 - timeout)
        } else if (timeout == 0) {
            clearInterval(t)
            var f = fail || DomNotFindReport;
            f(selector)
        }
    }, 10);
}

function Observe(ob, options, callback) {
    var mo = new MutationObserver(callback);
    mo.observe(ob, options);
    return mo;
}

//dquery,api加载成功的标志是window.xyApiLoaded=true,所有操作都必须在初始化成功之后
function apiInit() {
    dQuery.noConflict();
    var withCheck=function(attr) {
        var f = DataSession.prototype[attr];
        return function () {
            if (this.finished) {
                log("call " + attr + " ignored, finish has been called! ")
            } else {
                return f.apply(this, arguments);
            }
        }
    }

    for (var attr in DataSession.prototype) {
        DataSession.prototype[attr] = withCheck(attr);
    }
    var t = setInterval(function () {
        if (!(window._xy || window.bridge)) {

            return;
        }
        window.xyApiLoaded = true;
        clearInterval(t);
    }, 20);
}

//爬取入口
function dSpider(sessionKey, callback) {
    var t = setInterval(function () {
        if (window.xyApiLoaded) {
            clearInterval(t);
        } else {
            return;
        }
        var session = new DataSession(sessionKey);
        dQuery(window).on("beforeunload",function () {
            session._save()
            if(session.onNavigate){
                session.onNavigate(location.href);
            }
        })
        window.curSession = session;
        session._init(function(){
            DataSession.getExtraData(function (extras) {
                callback(session, extras, dQuery);
            })
        })
    }, 20);
}

dQuery("body").on("click","a",function(){
    dQuery(this).attr("target",function(_,v){
        if(v=="_blank") return "_self"
    })
})

//邮件爬取入口
function dSpiderMail(sessionKey, callback) {
    var t = setInterval(function () {
        if (window.xyApiLoaded) {
            clearInterval(t);
        } else {
            return;
        }
        var session = new DataSession(sessionKey);
        window.curSession = session;
        DataSession.getExtraData(function (extras) {

            dSpiderLocal.get('wd', function (wd) {
                dSpiderLocal.get('u', function (user) {
                    callback(user, wd, session, extras, dQuery);
                })
            })
        })

    }, 20);
}





