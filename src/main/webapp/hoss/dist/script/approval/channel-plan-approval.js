define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    require('jqprint-util')

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');

    var workflowProp = require('script/approval/workflow-properties');
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.QDFJ;

    var getQueryString = require('script/get-query-string');
    var businessKey = getQueryString('businessKey');
    var wfInstanceId = getQueryString('wfInstanceId');
    var taskId = getQueryString('taskId');
    var isEdit=getQueryString('isEdit');

    $(function () {
        var $flow = $("#flow");
        $(".toTab").click(function () {
            $("html, body").animate({
                scrollTop: $flow.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
        $(".goback").click(function () {
            history.back();
            return false;
        });
    });


    $(document).ready(function () {

        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.taskId = taskId;
        workflowObj.businessKey = businessKey;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowProp.showWorkFlowAll(workflowObj);


        var $project=$('#projectId'),
            isEmptyValue = '';


        $.ajax($.extend({
            url: apiHost + '/hoss/sys/channel/findChannelPlanVoById.do',
            data: {id: businessKey}
        }, jsonp))
            .done(function (data) {
                doneCallback.call(
                    this,
                    data,
                    function (data) {
                        if("1"!=data.status&&1!=data.status){
                            systemMessage({
                                type: 'error',
                                title: '提示：',
                                detail: data.detail || '获取数据失败！'
                            });
                        }else{
                            $("#showInfo").html(
                                template('tabContentTemplate', data)
                            );
                            $("#id").val(businessKey);
                            $("#taskId").val(taskId);
                            $("#wfInstanceId").val(wfInstanceId);
                            $("#flowStatus").text(flowStatus[data.data.typeWf]);
                            if(0==data.data.typeWf||"0"==data.data.typeWf){
                                $("#content").hide();
                            }
                            checkNum("Appointment");
                            checkNum("Visit");
                            checkNum("Buy");
                            checkNum("Deal");
                        }
                    }
                );
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取城市列表失败');
            })
            .always(function (data) {});

        //提交
        $("#warningPass").on('click', function () {
            if(!confirm('确定同意吗?')){
                return false;
            }
            $("#createForm").attr('action',apiHost+'/hoss/sys/channel/approvalChannelPlan.do');
            $("#flowDealType").val("submit");
            $("#createForm").submit();
        });


    });
});

function checkNum(obj){
    var re = /^[1-9]+[0-9]*]*$/;

    var social = "#social"+obj;
    var share = "#share"+obj;
    var alone = "#alone"+obj;
    var conduit = "#conduit"+obj;
    var nature = "#nature"+obj;

    var socialNum = 0;
    var shareNum = 0;
    var aloneNum = 0;
    var conduitNum = 0;
    var natureNum = 0;

    if (re.test($(social).val())){
        socialNum=($(social).val());
    }else{
        $(social).val(0);
    }
    if (re.test($(share).val())){
        shareNum=($(share).val());
    }else{
        $(share).val(0);
    }
    if (re.test($(alone).val())){
        aloneNum=($(alone).val());
    }else{
        $(alone).val(0);
    }
    if (re.test($(conduit).val())){
        conduitNum=($(conduit).val());
    }else{
        $(conduit).val(0);
    }
    if (re.test($(nature).val())){
        natureNum=($(nature).val());
    }else{
        $(nature).val(0);
    }
    var total = parseInt(socialNum)+parseInt(shareNum)+parseInt(aloneNum)+parseInt(conduitNum)+parseInt(natureNum);
    var totalName = "#"+obj;
    $(totalName).text(total);

}

