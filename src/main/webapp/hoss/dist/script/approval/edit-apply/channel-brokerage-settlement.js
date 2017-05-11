define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    //var $tab = require('bootstrap/tab');
    var template = require("template");
    var sysMessage=require("system-message");
    var queryString = require("script/get-query-string");

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var workflowProp = require('script/approval/workflow-properties');
    function initWorkFlow(){
        var workflowObj = workflowProp.workflowObj;
        workflowObj.wfInstanceId = queryString("wfInstanceId");
        workflowObj.businessKey = queryString("businessKey");
        workflowObj.taskId = queryString("taskId");
        workflowObj.processKey = workflowProp.definitionConstants.QDJS;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = 'new';
        workflowProp.showWorkFlowAll(workflowObj);
    }

    $(document).ready(function(){

        bindEvent();
        init();
        initWorkFlow();
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
        $("#draft,#submit").click(function(){
            if($(this).attr('id')=='submit'){
                if(!confirm('确定提交审批吗?')){
                    return;
                }
            }
            var content = $("#content").val();
            params.content = content;
            send( $(this).attr("formaction")+"?"+$(".details").serialize() , toNewApply, params );
            return false;
        });
    }

    function init(){
        send(
            "/costmanager/liquidation/commissionSettlement/findByCommissionId.do",function (data) {
                if(data.data){
                    $("#liquidation").html( template("liquidationTemplate",data) );
                }
            },{id : queryString("businessKey") }
        );
    }

});