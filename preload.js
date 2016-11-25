/**
 * Created by du on 16/11/12.
 */
//const {net} = require('electron')
const ipc = require('electron').ipcRenderer
var LITTER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
LITTER+=LITTER.toLocaleLowerCase()
LITTER=LITTER.split("");
const NO=[0,1,2,3,4,5,6,7,8,9]
function generateMixed(n,chars) {
    var res = "";
    for(var i = 0; i < n ; i ++) {
        var id = Math.ceil(Math.random()*chars.length);
        res += chars[id];
    }
    return res;
}
var ipcname=generateMixed(12,LITTER)+generateMixed(6,NO)
process.once('loaded', () => {
    Object.defineProperties(window, {
        "bridge":{
            configurable: false,
            writable: false,
            enumberable:false,
            value: {}
        },
        [ipcname]:{
            configurable: false,
            writable: false,
            enumberable:false,
            value:ipc
        }

    });
    Object.defineProperties(window.bridge, {
        callHandler: {
            configurable: false,
            writable: false,
            enumberable:false,
            value: callHandler
        },
        ready:{
            configurable: false,
            writable: false,
            enumberable:false,
            value:function(callback){
                var t=setInterval(function(){
                    if(window.xyApiLoaded){
                       callback();
                       clearInterval(t)
                    }
                },10);
            }
        }
    });
})

function toString(){
    return `${this.name}() { [native code] }`
}

function callHandler(funName,arg,callback){
    arg=Object.assign({funName,arg});
    if(callback) {
        if(!window._dsn){
            window._dsn=0;
        }
        let cbName="_dscb"+_dsn++;
        window[cbName] = function (result) {
            callback(result);
            delete window[cbName];
        };
        arg.callback=cbName;
    }
    window[ipcname].sendToHost('dSpider-bridge',arg)

}
callHandler.toString=toString
