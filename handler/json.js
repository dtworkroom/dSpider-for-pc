const rf=require("fs")
const path = require('path')
var data=[];
dSpider.on("all",function(d){
    data.push(d.value)
})
dSpider.on("finish",function(arg){
    arg.time=new Date().toString();
    data.splice(0,0,JSON.stringify(arg))
    var dataPath=path.join(getResultPath(),arg.sessionKey+".json")
    rf.writeFileSync(dataPath,JSON.stringify(data))
    showResultBtn()
})