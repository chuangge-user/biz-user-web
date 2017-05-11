define(function (require) {
    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var modal = require('bootstrap/modal');
    var template = require('template');

    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var fileOperationUtil = require('script/file-operation-util');
                            require('jqprint-util');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var taskId = getLocationParam("taskId");//任务ID
    var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
    var businessKey = getLocationParam("businessKey");//业务主键ID
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.TGFJMSQ;

    workflowObj.wfInstanceId = wfInstanceId;
    workflowObj.businessKey = businessKey;
    workflowObj.taskId = taskId;
    workflowObj.processKey = processKey;
    workflowObj.flowImageId = "flow";
    workflowObj.contentId = "content";
    workflowObj.workflowCommentId = "workflowComment";
    workflowProp.showWorkFlowAll(workflowObj);

    var $clientGroupbuyId = getLocationParam('clientGroupbuyId');

    var $groupFeeReduceApplyForm = $('#groupFeeReduceApplyForm');
    if (!isEmpty(wfInstanceId) && !isEmpty(businessKey)) {
        //退回 或 草稿 进入编辑
        fillEditData(wfInstanceId, taskId, businessKey);
    } else {
        initGroupFeeReduceClientInfo();
    }

    $(function () {
        var $flow = $('#flow');
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
        });
    });

    var groupFeeReduceApplyTemplate = 'groupFeeReduceApplyTemplate';
    function initGroupFeeReduceClientInfo() {
        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'group_fee_reduce', businessKey);
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/groupFeeReduce/getGroupFeeClient.do?clientGroupbuyId=' + $clientGroupbuyId
//            ,
//            data: $goodsCancelApplyForm.serialize()
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    $('#groupFeeReduceInfoTbl').find('tbody').html(
                        template(groupFeeReduceApplyTemplate, data.data)
                    );
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '物品申请失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);

            }
        );

    }


    var numberUtil = require('script/approval/number-util');



    $groupFeeReduceApplyForm.on('click', '[flowDealType]', function (event) {
        if (event) {
            event.preventDefault();
        }
//        console.info("to submit goods apply");

        var $context = $(this);
        var flowDealType = $context.attr('flowDealType');
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/groupFeeReduce/submitGroupFeeReduceApply.do?flowDealType=' + flowDealType,
            data: $groupFeeReduceApplyForm.serialize(),
            beforeSend: function () {
                $context.attr('disabled', 'disabled');
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
//                    console.info('submit to ...')
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '团购费减免申请成功！'
                    });
                    location.href = document.referrer;
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '团购费减免申请失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);

            }
        );
    });

    var $groupFeeReduceApprovalForm = $('#groupFeeReduceApprovalForm');
    $groupFeeReduceApprovalForm.on('click', '#submit', function (event) {
        if (event) {
            event.preventDefault();
        }
//        console.info("to submit goods apply");

        var $context = $(this);
        var flowDealType = $context.attr('flowDealType');

        $groupFeeReduceApprovalForm.find('[name="taskId"]').val(taskId);
        $groupFeeReduceApprovalForm.find('[name="wfInstanceId"]').val(wfInstanceId);
        if(!confirm('确定同意吗?')){
            return false;
        }
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/groupFeeReduce/approvalGroupFeeReduceApply.do' ,
            data: $groupFeeReduceApprovalForm.serialize(),
            beforeSend: function () {
                $context.attr('disabled', 'disabled');
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
//                    console.info('submit to ...')
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '团购费减免审批成功！'
                    });
                    history.back();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '团购费减免审批失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);

            }
        );
    });

    function fillEditData(wfInstanceId, taskId, businessKey) {
        fileOperationUtil.appendFileViewTable($('#fileUploadTable'), 'group_fee_reduce', businessKey);
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/groupFeeReduce/getGroupFeeClientByApplyId.do?groupFeeReduceApplyId=' + businessKey
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    $('#groupFeeReduceInfoTbl').find('tbody').html(
                        template(groupFeeReduceApplyTemplate, data.data)
                    );

                    var groupFeeReduceApply = data.data.groupFeeReduceApply;
                    if(groupFeeReduceApply != undefined && groupFeeReduceApply != null){
                        $("#flowId").text(groupFeeReduceApply.flowNo);
                    }
                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.id"]').val(groupFeeReduceApply.id);
                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.projectId"]').val(groupFeeReduceApply.projectId);
                    $groupFeeReduceApplyForm.find('[name="taskId"]').val(taskId);
                    $groupFeeReduceApplyForm.find('[name="wfInstanceId"]').val(wfInstanceId);
                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.version"]').val(groupFeeReduceApply.version);

                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.applyerName"]').val(groupFeeReduceApply.applyerName);
                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.applyerOrgType"]').each(function(i, item) {
                        if($(item).val() == groupFeeReduceApply.applyerOrgType) {
                            $(item).attr('checked', 'checked');
                        }
                    });
                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.applyerOrgOther"]').val(groupFeeReduceApply.applyerOrgOther);
                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.reduceReason"]').val(groupFeeReduceApply.reduceReason);
                    $groupFeeReduceApplyForm.find('[name="groupFeeReduceApply.reduceAmount"]').val(groupFeeReduceApply.reduceAmount);

                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取物品申请数据失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }
        ).fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取物品申请数据失败！');
            }
        );
    }
});