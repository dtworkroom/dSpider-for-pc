// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
require("../js/copyPaste.js")
const {BrowserWindow,getGlobal,shell} = require('electron').remote
var back = $("#back");
var forward = $("#forward");
var refresh = $("#refresh");
var urlEdit = $("#url-edit")
var debug = $("#debug")
var device = $("#device")
var rf = require("fs");
const path = require('path')
refresh.text("close")
var info = {name: "", handleLoaded: true};
function showError(msg,close=true){
    alert(msg+"\r\n\n\n\tclick to close !")
    if(close){
        window.close();
    }
}
window.init = (_info)=> {
    if (_info) {
        info = _info;
        if (info.ua == "mb") {
            device.addClass("phone")
            webview.useragent = getGlobal('MOBILE_UA');
        }
        webview.src = info.start;
    }
    info.handleLoaded = false;
    if (info.handle) {
        if (info.handle.startsWith("http")) {
            var sc = document.createElement("script");
            sc.src = info.handle;
            sc.onload = function () {
                info.handleLoaded = true;
            };
            sc.onerror = function (e) {
                showError("handle script url request failed: " + info.handle)
            }
            document.head.appendChild(sc)
        } else {
            //是文件
            if (info.handle.startsWith(".")) {
                info.handle = path.join(__dirname, info.handle);
            }
            if (!fs.existsSync(info.handle)) {
                showError("handle script not exist: " + info.handle)
            } else {
                require(info.handle)
                info.handleLoaded = true
            }
        }
    } else {
        require("../handler/json.js")
        info.handleLoaded = true
    }
    $("<title>").text(info.name).appendTo("head")
}



$(function () {
    var t = setInterval(function () {
        if (!info.handleLoaded) {
            return;
        }
        clearInterval(t)

        $(webview).on("did-start-loading", function () {
            refresh.text("close")
            urlEdit.val(webview.getURL())
        }).on("dom-ready", function () {
            $("title").text("[" + info.name + "]" + webview.getTitle())
            var script = "";
            if (info.uri) {
                //如果是网络地址
                if (info.uri.startsWith("http")) {
                    var prefix = "?"
                    if (info.uri.indexOf("?") != -1) {
                        prefix = "&";
                    }
                    var url = info.uri + prefix + "t=" + new Date().getTime() + "&platform=pc"
                        + "&refer=" + encodeURIComponent(webview.getURL());
                    console.log(url)
                    $.get(url)
                        .done(function (data) {
                            webview.executeJavaScript(
                                "!function(){\r\n" +
                                rf.readFileSync(path.join(__dirname, "../js/dQuery-3.1.0.min.js"), "utf-8") + "\r\n"
                                + rf.readFileSync(path.join(__dirname, "../js/utils.js"), "utf-8") + "\r\n"
                                + rf.readFileSync(path.join(__dirname, "../js/dSpiderAPI.js"), "utf-8") + "\r\n"
                                + data + "\r\n"
                                + "}()"
                            )
                        })
                        .fail(function () {
                            showError("script url request failed:" + url);
                        })
                    return
                }
                //是文件
                if (info.uri.startsWith(".")) {
                    info.uri = path.join(__dirname, info.uri);
                } else if (!fs.existsSync(info.uri)) {
                    showError("handle script file is not exist: "+info.uri )
                }
                script += rf.readFileSync(info.uri)
            }

            webview.executeJavaScript(
                rf.readFileSync(path.join(__dirname, "../js/dQuery-3.1.0.min.js"), "utf-8") + "\r\n"
                + rf.readFileSync(path.join(__dirname, "../js/utils.js"), "utf-8") + "\r\n"
                + rf.readFileSync(path.join(__dirname, "../js/dSpiderAPI.js"), "utf-8") + "\r\n"
                + script)

        }).on("did-stop-loading", function () {
            if (global.userAgent) {
                webview.setUserAgent(global.userAgent)
                global.userAgent = ""
            }
            urlEdit.val(webview.getURL())
            refresh.text("refresh")
            if (webview.canGoBack()) {
                back.removeClass("disabled")
            } else {
                back.addClass("disabled")
            }
            if (webview.canGoForward()) {
                forward.removeClass("disabled")
            } else {
                forward.addClass("disabled")
            }
        })

    }, 16)

})

document.onkeydown = function (e) {
    if (e.keyCode == 123) { // 按 F12
        if (e.ctrlKey) {
            BrowserWindow.getFocusedWindow().webContents.toggleDevTools()
        } else {
            webview.getWebContents().toggleDevTools()
        }
    } else if (e.keyCode == 13) {
        if (document.activeElement.id == "url-edit") {
            var src = urlEdit.val().trim()
            if (webview.src) {
                webview.loadURL(src)
            } else {
                webview.src = src;
            }
        }
    } else if (e.keyCode == 116) {
        refresh.click();
    }
};

back.click(function () {
    if ($(this).hasClass("disabled"))
        return
    webview.goBack();

})

forward.click(function () {
    if ($(this).hasClass("disabled"))
        return
    webview.goForward();
})

refresh.click(function () {
    if ($(this).text == "close") {
        webview.stop();
    } else {
        webview.reload();
    }
})

debug.click(()=> {
    webview.getWebContents().toggleDevTools()
});

device.click(function () {
    var e = $(this)
    var ua = getGlobal('MOBILE_UA')
    if (e.hasClass("phone")) {
        ua = getGlobal('DEFAULT_UA')
        e.removeClass("phone")
    } else {
        $(e).addClass("phone")
    }
    webview.setUserAgent(ua);
    webview.reload()
})
$("button").click(function () {
    if (!shell.showItemInFolder(path.join(__dirname, "../result/")))
        alert("No data!");
})

