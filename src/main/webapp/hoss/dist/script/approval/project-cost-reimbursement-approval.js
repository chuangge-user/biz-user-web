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
    var template = require('template');
    var modal = require('bootstrap/modal');
    var feeLoanInfo = require('script/approval/feeLoanInfo');
    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var fileUtil = require('script/file-operation-util');
                require('jqprint-util');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var taskId = getLocationParam("taskId");//任务ID
    var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
    var businessKey = getLocationParam("businessKey");//业务主键ID
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.FYBX;

    workflowObj.wfInstanceId = wfInstanceId;
    workflowObj.businessKey = businessKey;
    workflowObj.taskId = taskId;
    workflowObj.processKey = processKey;
    workflowObj.flowImageId = "flow";
    workflowObj.contentId = "content";
    workflowObj.workflowCommentId = "workflowComment";
    workflowProp.showWorkFlowAll(workflowObj);

    var $costRepayForm = $('#costRepayForm');
    var numberUtil = require('script/approval/number-util');

    //城市数据加载
    var projectUtil = require("script/project/project-util");
    projectUtil.bindingProjectAndCity('projectSelect', 'citySelect');


    if (!isEmpty(wfInstanceId) && !isEmpty(businessKey)) {
        //退回 或 草稿 进入编辑
        fillEditData(wfInstanceId, taskId, businessKey);
    }
    $(function () {
        fileUtil.appendFileViewTable($('#fileViewTable'), 'project_repay', businessKey);
        var $approvalListTab = $('#flow');
        $approvalListTab.find('a:first').tab('show');
        $(".toTab").click(function () {
            $("html, body").animate({
                scrollTop: $approvalListTab.offset().top + "px"
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

        $('#projectSelect').change(function () {
            $('#fee_apply').removeAttr("disabled");
            $('#repayBtn').removeAttr('disabled');
        });
        $('#citySelect').change(function () {
            $('#fee_apply').attr("disabled", "disabled");
            $('#repayBtn').attr("disabled", "disabled");
        });

        $costRepayForm.on('click', '#submit', function (event) {
            if (event) {
                event.preventDefault();
            }
//            console.info("to submit goods apply");

            var $that = $(this);
            var flowDealType = $that.attr('flowDealType');

            $costRepayForm.find('[name="taskId"]').val(taskId);
            $costRepayForm.find('[name="wfInstanceId"]').val(wfInstanceId);

            if(!confirm('确定提交审批吗?')){
                return;
            }

            var paramStr = "&repayDetail=" + generateRepayDetailJson();
            $.ajax($.extend({
                url: apiHost + '/hoss/expenses/projectRepay/approvalProRepayApply.do',
                data: clearEmptyValue($costRepayForm)+paramStr,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '审批成功！'
                        });
                        location.href = document.referrer;
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'error',
                            title: '提示：',
                            detail: data.detail || '提交失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    // detailEvents();
                });
        });


        function calculateRepayAmount() {
            var repayAmountArr = $('[name="repayInfoList.auditAmount"]');
            var repayAmountSum = 0.0;
            repayAmountArr.each(function (i, item) {
                var tempVal = numberUtil.myParseFloat($(item).val());
                repayAmountSum = repayAmountSum + tempVal;
            });
            return repayAmountSum;
        }

        $costRepayForm.on('change', '[name="repayInfoList.auditAmount"]', function (event) {
            if (event) {
                event.preventDefault();
            }
            var repayAmountSum = calculateRepayAmount();
            $('#amount_input').val(repayAmountSum);
            $('#amount_display').html(repayAmountSum);
            $('#amount_big_input').val(numberUtil.parseToChinese(repayAmountSum));
            $('#amount_big_display').html(numberUtil.parseToChinese(repayAmountSum));

            var feeId = $("[name='feeId']").val();
            repayAppendFeeLoanInfo(businessKey,feeId,repayAmountSum);//显示借款信息
        });
    });


    function fillEditData(wfInstanceId, taskId, businessKey) {
        $costRepayForm.find('[name="taskId"]').val(taskId);
        $costRepayForm.find('[name="wfInstanceId"]').val(wfInstanceId);
        $.ajax($.extend({
            url: apiHost + "/hoss/expenses/projectRepay/getProRepayDto.do?projectRepayId=" + businessKey
        }, jsonp)).done(function (data) {
            function useless(data) {
                var dataObj = data.data;
                var projectRepay = dataObj.projectRepay;
                $costRepayForm.find('[name="projectRepay.id"]').val(projectRepay.id);

                if(projectRepay != undefined && projectRepay != null){
                    $("#flowId").text(projectRepay.flowNo);
                }

                $costRepayForm.find('#repayResult').html(
                    template('feeRepayResultTemplate', dataObj)
                );

                var projectFee = dataObj.projectFee;
                $('#costRepayFeeTypeName').html(projectFee.feeTypeName);
                if(!isEmpty(projectFee.subFeeTypeName)){
                    $("#subFeeTypeName").html("—— "+projectFee.subFeeTypeName);
                }

                var repayAmountSum = $('#amount_input').val();
                $('#amount_display').html(projectRepay.auditAmount);
                $('#amount_big_display').html(numberUtil.parseToChinese(projectRepay.auditAmount));
                $('#amount_input').html(projectRepay.auditAmount);
                $('#amount_big_input').html(numberUtil.parseToChinese(projectRepay.auditAmount));
                $("[name='feeId']").val(projectFee.id);
                repayAppendFeeLoanInfo(businessKey,'','');//显示借款信息
            }
            doneCallback.call(this, data, useless);
        }) .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '操作失败！');
            })
            .always(function () {
                //    checkboxEvents();
            });
    }

    function repayAppendFeeLoanInfo(repayId,feeId,repayAmount){
        feeLoanInfo.appendFeeLoanInfo($('#repayTotalTr'),repayId,feeId,repayAmount);
    }

    function generateRepayDetailJson() {
        var $feeName = $('[name="repayInfoList.id"]');
        var repayInfoArr = new Array();
        $feeName.each(function (i, item) {
            var $that = $(item);
            var repayInfo = {};
            repayInfo.id = $that.val();
            var $auditAmount = $that.parents('tr').find('[name="repayInfoList.auditAmount"]');
            repayInfo.auditAmount = $auditAmount.val();
            repayInfoArr.push(repayInfo);
        });
        return encodeURIComponent(JSON.stringify(repayInfoArr));
    }
});