/**
 * Created by du on 16/11/13.
 */
const ipc = require('electron').ipcRenderer
var EventEmitter = require('events').EventEmitter;
global.dSpider = new EventEmitter();
String.prototype.format = function () {
    var args = [...arguments];
    var count = 0;
    return this.replace(/%s/g, function () {
        return args[count++];
    });
};

webview.addEventListener('ipc-message', (event) => {
    var arg = event.args[0];
    var fun = bridge[arg.funName]
    fun && fun(arg.arg, arg.callback)
})

var map = new Map()
function callback(cb, result) {
    var script = `${cb}(${JSON.stringify(result)})`;
    webview.executeJavaScript(script)
}
var max = 100;
var progressShow = false;
var loadingShow = false;
bridge = {
    set(arg){
        map.set(arg.sessionKey, arg.value)
    },
    get(arg, cb){
        callback(cb, map.get(arg.sessionKey))
    },
    clear(){
        map.clear()
    },
    read(arg, cb){
        callback(cb, ipc.sendSync("shareData", "get", arg.key));
    },
    save(arg){
        ipc.sendSync("shareData", "set", arg.key, arg.value)
    },
    getExtraData(_, cb) {
        callback(cb, "{\"webcore\":\"%s\"}".format("chrome"));
    },
    push(arg){
        dSpider.emit(arg.sessionKey, arg.value);
        dSpider.emit("all", arg);
    },
    setProgressMax(arg){
        max = arg.progress;
    },
    setProgress(arg){
        loadingText.text("当前进度: " + Math.ceil(arg.progress / max * 100) + "%");
    },
    getProgress(_, cb){
        callback(cb, progress.value);
    },
    showProgress(arg){
        if (arg.show) {
            progressShow = true;
            loading.show()
            loadingText.text("正在初始化...")
        } else {
            progressShow = false;
            if (!loadingShow) {
                loading.hide()
            }
        }
    },
    showLoading(arg){
        loadingShow=true;
        loading.show();
        loading.find("#loading-text").text(arg.s)
    },
    hideLoading(){
        loadingShow = false;
        if (!progressShow) {
            loading.hide()
        }

    },
    setUserAgent(arg){
        webview.setUserAgent(arg.userAgent)
    },
    load(arg){
        var headers = arg.headers
        if (headers && headers["User-Agent"]) {
            userAgent = webview.getUserAgent()
            webview.setUserAgent(headers["User-Agent"])
        }
        webview.loadURL(arg.url, {extraHeaders: headers})
    },

    start(arg){
        //$("#loading-text,.spinner").show()
    },

    finish(arg){
        dSpider.emit("finish", arg);
    }
}


