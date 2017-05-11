define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    //var $tab = require('bootstrap/tab');
    var template = require("template");
    var sysMessage=require("system-message");
    var queryString = require("script/get-query-string");
    require('jqprint-util');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    $(document).ready(function(){

        bindEvent();
        init();
        initWorkFlow();


        var $flow = $('#flow');
        $('.toTab').click(function(e){
            $("html, body").animate({
                scrollTop: $flow.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
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
//        window.location=hoss.webHost+"/app/approval/new-apply.html";
        location.href = document.referrer;
    }

    function bindEvent(){

        var params ={ "workFlowModel.id" : queryString("businessKey") ,taskId : queryString("taskId") ,wfInstanceId : queryString("wfInstanceId")  };
        $(".btn").click(function(){
            if( $(this).text()=="同意" ) {
                if(!confirm('确定同意吗?')){
                    return;
                }
                send( "/costmanager/liquidation/commissionSettlement/approval.do" , toNewApply, params );
            }
            return false;
        });
    }

    function init(){
        send(
            "/costmanager/liquidation/commissionSettlement/findByCommissionId.do",function (data) {
                $("#liquidation").html( template("liquidationTemplate",data) );

            },{id : queryString("businessKey") }
        );
    }

    function initWorkFlow(){
        var workflowProp = require('script/approval/workflow-properties');

        var workflowObj = workflowProp.workflowObj;
        workflowObj.wfInstanceId = queryString("wfInstanceId");
        workflowObj.businessKey = queryString("businessKey");
        workflowObj.taskId = queryString("taskId");
        workflowObj.processKey = workflowProp.definitionConstants.QDJS;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowProp.showWorkFlowAll(workflowObj);
    }

});