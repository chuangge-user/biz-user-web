define(function (require) {
    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var template = require('template');
        require('jqprint-util');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var modal = require('bootstrap/modal');
    var fileUtil = require('script/file-operation-util');
    var approvalUtil = require('script/approval/approval-util');

    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var taskId = getLocationParam("taskId");//任务ID
    var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
    var businessKey = getLocationParam("businessKey");//业务主键ID
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.WPHX;

    workflowObj.wfInstanceId = wfInstanceId;
    workflowObj.businessKey = businessKey;
    workflowObj.taskId = taskId;
    workflowObj.processKey = processKey;
    workflowObj.flowImageId = "flow";
    workflowObj.contentId = "content";
    workflowObj.workflowCommentId = "workflowComment";
    workflowProp.showWorkFlowAll(workflowObj);

    var $goodsCancelApplyForm = $('#goodsCancelApplyForm');

    //城市数据加载
    var projectUtil = require("script/project/project-util");
    projectUtil.bindingProjectAndCity('projectSelect', 'citySelect');

    if (!isEmpty(wfInstanceId) && !isEmpty(taskId) && !isEmpty(businessKey)) {
        //退回 或 草稿 进入编辑
        fillViewData(wfInstanceId, taskId, businessKey);
    }

    $(function () {
        fileUtil.appendFileViewTable($('#fileViewTable'), 'pro_goods_cancel', businessKey);
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

    $('#gobackButton').on('click', function(event) {
        history.back();
    });
    var $goodsCancelForm = $('#goodsCancelForm');
    $goodsCancelForm.on('click', '#submit', function (event) {
        if (event) {
            event.preventDefault();
        }
//        console.info("to submit goods apply");

        var $context = $(this);
        var flowDealType = $context.attr('flowDealType');

        $goodsCancelForm.find('[name="taskId"]').val(taskId);
        $goodsCancelForm.find('[name="wfInstanceId"]').val(wfInstanceId);

        if(!confirm('确定提交审批吗?')){
            return;
        }

        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsCancel/approvalProjectGoodsCancel.do' ,
            data: $goodsCancelForm.serialize(),
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
                        detail: '物品核销审批成功！'
                    });
                    history.back();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '物品核销审批失败！'
                    });
                    $context.removeAttr('disabled').blur();
                }

                doneCallback.call(this, data, useful, useless);

            }
        );
    });

    function fillViewData(wfInstanceId, taskId, businessKey) {
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsCancel/getProjectGoodsCancelDto.do?proGoodsCancelId=' + businessKey
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var dataObj = data.data;
                    var goodsCancel = dataObj.proApplyGoodsCancel;

                    if(goodsCancel != undefined && goodsCancel != null){
                        $("#flowId").text(goodsCancel.flowNo);
                    }

                    //渲染表单数据
                    $("#goodsCancelViewTable").find('tbody').html(
                        template('goodsCancelTemplate', dataObj)
                    );
                    //渲染成本信息数据
                    approvalUtil.renderingCostInfo($('#proApplyCancelTrLine'), goodsCancel.projectId, wfInstanceId, goodsCancel.cancelSum, 'other_spread_outcome');
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