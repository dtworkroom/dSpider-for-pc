/**
 * Created by du on 16/11/21.
 */
var sessionKey=dQuery("title").text().split(" ")[0]
dSpider(sessionKey, function(session,env,$){
    log(sessionKey)
    var list = $("table a");
    window.list=list
    session.showProgress();
    session.setProgressMax(list.length);
    var curIndex=0
    function getText(){
        var  e = list.eq(curIndex);
            $.get(e.attr("href")).done(function (data) {
                log(e.text())
                var text=e.text()+"\r\n";
                text += $("<div>").append($(data))
                    .find("#contents").html().replace(/&nbsp;/g, " ")
                    .replace(/<br>/g, "\r\n")
                if (e.text().startsWith("第")) {
                    session.upload(text)
                }

            }).always(function(){
               if(++curIndex<list.length){
                   session.setProgress(curIndex);
                   getText();
                   log(curIndex,list.length)
               }else{
                   session.setProgress(curIndex);
                   session.finish();
               }
            })
    }
    getText()
})
