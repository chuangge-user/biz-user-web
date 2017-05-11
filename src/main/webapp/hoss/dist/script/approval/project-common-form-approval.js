define(function (require) {

    var $ = require('jquery');
    require('script/validate');
    var navigation = require('navigation');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var fileupload = require('fileupload');
    var template = require('template');

    require('jqprint-util')

    var fileOperationUtil = require('script/file-operation-util');

    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var workflowObj = workflowProp.workflowObj;


    $(function () {

        initSrcoll();

        var processKey = workflowProp.definitionConstants.TYBD;
        var taskId = getLocationParam("taskId");//任务ID
        var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
        var businessKey = getLocationParam("businessKey");//业务主键ID

        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.noCityProject = true;

        workflowProp.showWorkFlowAll(workflowObj);

        fileOperationUtil.appendFileViewTable($('#fileViewTable'), 'common_form', businessKey);

        if(!isEmpty(businessKey)){
            //退回 或 草稿 进入编辑
            fillViewData(wfInstanceId,taskId,businessKey);
        }

        //提交
        $("#submit").click(function(event){

            if (event) {
                event.preventDefault();
            }

            var confirmStr = "同意";
            if(!confirm('确定' + confirmStr +'吗?')){
                return;
            }
            var $context = $(this),
                $disabled = $context.find('[disabled]');

            if ($context.hasClass('disabled')) {
                return false;
            }
            $disabled.removeAttr('disabled');

            var commonForm = {};
            commonForm.content = $("#content").val();
            commonForm.wfInstanceId = wfInstanceId;
            commonForm.businessKey = businessKey;
            commonForm.taskId = taskId;

            $.ajax({
                type: "POST",
                url : apiHost + '/hoss/expenses/commonForm/approvalCommonForm.do',
                dataType : 'json',
                data : $.param(commonForm),
                success: function(msg){

                }

            }).done(function (data) {

            }).fail(function (jqXHR, textStatus, errorThrown) {
                var json = eval('(' + jqXHR.responseText+ ')');
                if (json.detail.indexOf("成功") == -1 ) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '提交失败！'
                    });
                } else {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '提交成功！'
                    });
                    location.href=document.referrer;
                }
                $disabled.attr('disabled', 'disabled');
                $context.removeAttr('disabled').blur();
            });

        });

        function fillViewData(wfInstanceId,taskId,businessKey){
            $.ajax($.extend({
                url: apiHost + '/hoss/expenses/commonForm/getCommonFormDto.do?formId='+businessKey
            }, jsonp))
                .done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};
                        $("#commonFormTable").html(
                            template('commonFormTemplate', dataObj)
                        );
                        $("#flowId").text(dataObj.commonForm.flowNo);
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                })
        }

        function initSrcoll(){

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
                location.href=document.referrer;
            });
        }
    });

});