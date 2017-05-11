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

        $("#draft,#submit").attr("disabled",true);
        initCycle();
        initCity();
        bindEvent();
        initWorkFlow();
    });


    var workflowProp = require('script/approval/workflow-properties');
    function initWorkFlow(){
        var workflowObj = workflowProp.workflowObj;
//        workflowObj.wfInstanceId = null;
        //workflowObj.businessKey = businessKey;
//        workflowObj.taskId = null;
        workflowObj.processKey = workflowProp.definitionConstants.QDJS;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = 'new';
        workflowObj.cityId = 'city';
        workflowProp.showWorkFlowAll(workflowObj);
    }

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
        $("#queryForm").submit(function(){
            if( $("#city").val().length <1 ){
                sysMessage({type:"info",detail:'请选择城市!'})
                return false;
            }

            if( $("#cycle").val().length <1 ){
                sysMessage({type:"info",detail:'请选择结佣周期!'})
                return false;
            }

            send( $(this).attr("action"),function (result) {
                    $("#liquidation").html( template("liquidationTemplate",result) );
//                    console.log(result)
                    if( result.data.content &&  result.data.content.length > 0){
                       $("#draft,#submit").removeAttr("disabled");
                    }else{
//                        $("#draft,#submit").attr("disabled",true);
                    }

                    // 如果佣金合计为0，则不允许提交或保存草稿
                    if($("#liquidation tr td:eq(1)").text() == '0'){
                        $("#draft,#submit").attr("disabled",true);
                    }
                },$(this).serializeArray()
            );
            return false;
        });

        $("#cycle").change(function () {
            var val=$(this).val();
//            console.log(val)
            if( val.length > 0 ){
                $("#startTime").val( val.split("#")[0] );
                $("#endTime").val( val.split("#")[1] );
            }else{
                $("#start,#end").val("");
            }
        });

        $("#draft,#submit").click(function(){
            if($(this).attr('id')=='submit'){
                if(!confirm('确定提交审批吗?')){
                    return;
                }
            }
            send( $(this).attr("formaction") , toNewApply, $("#queryForm").serializeArray() );
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