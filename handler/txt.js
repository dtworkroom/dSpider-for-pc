const rf=require("fs")
//const path = require('path')
var data=[];
dSpider.on("all",function(d){
    data.push(d.value)
})
dSpider.on("finish",function(arg){
    var str="";
    for(let i of data){
        str+=i+"\r\n\r\n";
    }
    rf.writeFileSync(getResultPath()+arg.sessionKey+".txt",str)
    showResultBtn()
})