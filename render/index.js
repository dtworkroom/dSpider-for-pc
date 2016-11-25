/**
 * Created by du on 16/11/15.
 */
require("../js/copyPaste.js")
const electron = require('electron').remote
var rf=require("fs");
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const {shell} = require('electron').remote
function createWindow (title="dSpider") {
    var view = new BrowserWindow({width: 1000, height: 700,backgroundColor:"#ddd", title:title,show: false,webPreferences:{webSecurity:false}})
    view.loadURL(url.format({
        pathname: path.join(__dirname, '../spider.html'),
        protocol: 'file:',
        slashes: true
    }))
    view.once('ready-to-show', () => {
        view.show()
    })

    view.once('closed', function () {
        view = null
    })
    return view;
}
document.onkeydown=function(e){
    if(e.keyCode==123){ // 按 F12
        if(e.ctrlKey){
            BrowserWindow.getFocusedWindow().webContents.toggleDevTools()
        }
 }
};

var dataPath=path.join(__dirname,"../data/config.json")
window.config= JSON.parse(rf.readFileSync(dataPath,"utf-8"))
if(!config[0]){
    config[0]={}
}
window.onbeforeunload = function () {
    rf.writeFileSync(dataPath,JSON.stringify(config))
}
var app= new Vue({
    el: '#table',
    data: {
        items:config
    },
    methods:{
        del(i){
            console.log(i)
            config.splice(i,1)
        },
        open(index,type){
            window.event.preventDefault();
            var p = electron.dialog.showOpenDialog({properties: ['openFile', 'openDirectory']})
            if(!p){
                return
            }
            if(type==1){
                config[index].uri=p[0];
            }else {
                config[index].handle=p[0];
            }
            this.$set(config,index,config[index])
        },
        go(index){
           var info= config[index]
            if(info.start&&info.start.trim()
                //&&info.uri&&info.uri.trim()
            ){
                var view= createWindow(info.name)
                view.webContents.executeJavaScript(`init(${JSON.stringify(config[index])})`)
            }else {
                console.log(alert("Start url  required !"))
            }

        },
        drag(ev,index){
            console.log("drag",index)
            ev.dataTransfer.setData("index",index);

        },
        dragover(ev){
            ev.preventDefault()
        },
        drop(ev,index){
          console.log("drop",index)
          ev.preventDefault();
          var orgIndex=ev.dataTransfer.getData("index")
          if(orgIndex!=index) {
              var temp=config[orgIndex];
              config.splice(orgIndex,1);
             if(orgIndex>index){
                 config.splice(index,0,temp)
             }else {
                 config.splice(index-1,0,temp)
             }
          }
        }

    }

})


$("#add").click(function(){
    app.items = config = [{name: ""}].concat(config)
})

$("#debugger").click(()=>{
    createWindow("dSpider debugger")
})

$("#result").click(()=>{
    if(!shell.showItemInFolder(path.join(__dirname,"../result/")))
        alert("No data!");
})

$("input").on("focus",function(){
    $(this).parents("tr").attr("draggable",false);
}).on("blur",function(){
    $(this).parents("tr").attr("draggable",true);
})








