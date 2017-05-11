define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    //var $tab = require('bootstrap/tab');
    var template = require("template");
    var sysMessage=require("system-message");
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    $(document).ready(function(){
        initCycle();
        initCity();
        bindEvent();
    });

    function send(url,suc,params){
        $.ajax($.extend({
            url:apiHost+url,
            success:function(data){
                if( $.isFunction( suc ) && data.status=="1" ){
                    suc(data);
                }else if( data.status == "0" ){
                    sysMessage({type:"error",detail:data.detail})
                }
            },
            data:params||{}
        },jsonp));
    }


    function toNewApply(data) {
        window.location=hoss.webHost+"/app/approval/new-apply.html";
    }

    function bindEvent(){
        $("#queryForm").submit(function(){
            send( $(this).attr("action"),function (data) {
                    $("#liquidation").html( template("liquidationTemplate",data) );
                },$(this).serializeArray()
            );
            return false;
        });

        $("#draft,#submit").click(function(){
            send( $(this).attr("formaction") , toNewApply, $(".details").serializeArray() );
            return false;
        });
    }

    function initCity() {
        send("/hoss/sys/getMyCityList.do",function (result) {
            if( null == result.data ){
                sysMessage({type:"error",detail:'您没有配置城市!请联系管理员配置'})
            }else{
                $("#city").html( template("cityTemplate",result) );
            }
        });
    }

    function initCycle(){
        send("/costmanager/liquidation/commissionSettlement/findCycle.do",function (data) {
            $("#cycle").html( template("cycleTemplate",data) );
        });
    }
});