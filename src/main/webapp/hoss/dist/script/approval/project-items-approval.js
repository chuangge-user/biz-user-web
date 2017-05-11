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

    var projectUtil = require("script/project/project-util");
    var numberUtil = require('script/approval/number-util');
    var fileUtil = require('script/file-operation-util');
    require('script/validate');

    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var getFlowImage = workflowProp.getFlowImage;

    var processKey = "WPSQ";
    var taskId = getLocationParam("taskId");//任务ID
    var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
    var businessKey = getLocationParam("businessKey");//业务主键ID

    var approvalUtil = require('script/approval/approval-util');
    //显示流程图
    getFlowImage(processKey, wfInstanceId, taskId);

    var $goodsApplyForm = $('#goodsApplyForm');
    //城市数据加载
    if (!isEmpty(wfInstanceId) && !isEmpty(taskId) && !isEmpty(businessKey)) {
        //退回 或 草稿 进入编辑
        fillEditData(wfInstanceId, taskId, businessKey);
    }

    require('jqprint-util');


    var workflowObj = workflowProp.workflowObj;
    $(function () {
        fileUtil.appendFileViewTable($('#fileViewTable'), 'pro_goods_apply', businessKey);
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
        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowProp.showWorkFlowAll(workflowObj);

    });

    $goodsApplyForm.on('click', '#submit', function (event) {
        if (event) {
            event.preventDefault();
        }
//        console.info("to submit goods apply");

        var $context = $(this);
        var flowDealType = $context.attr('flowDealType');
        var goodsName = $goodsApplyForm.find('[name=goodsName]');
        var paramStr = "?applyGoodsListJson=" + generateApplyGoodsJson(goodsName) + "&flowDealType=" + flowDealType;
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsApply/approvalProGoodsApply.do' + paramStr,
            data: $goodsApplyForm.serialize(),
            beforeSend: function () {
                if ($goodsApplyForm.isValid()) {
                    var confirmStr = '是否确认提交审批';
                    if(!confirm(confirmStr)) {
                        //$submit.attr('disabled', 'disabled');
                        return false;
                    }
                    $context.attr('disabled', 'disabled');
                    return true;
                } else {
                    return false;
                }
            }
        }, jsonp)).
            done(function (data) {
                function useful(data) {
//                    console.info('submit to ...')
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '物品申请审批成功！'
                    });
                    location.href = document.referrer;
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '物品申请审批失败！'
                    });
                    $context.removeAttr('disabled').blur();
                }

                doneCallback.call(this, data, useful, useless);

            }
        );
    });

    $goodsApplyForm.on('change', '[name=unitPrice]', function (event) {
        if (event) {
            event.preventDefault();
        }
        var $that = $(this);
        calculateGoodsSum($that);
        var amountSum = calculateAllGoodsSum();

        var projectSelect = $('#projectSelect');
       approvalUtil.renderingCostInfo($('#proApplyGoodsTrLine'), projectSelect.val(), wfInstanceId, amountSum, 'other_spread_outcome');
    });

    function calculateGoodsSum(unitPriceObj) {
        var unitPrice = numberUtil.myParseFloat(unitPriceObj.val())
        var amount = unitPriceObj.parents('tr').find('[name="goodsAmount"]');
        var amountInt = numberUtil.myParseInt(amount.val());
        var applyNum = unitPriceObj.parents('tr').find('[name="goodsSum"]'); //申请金额
        applyNum.val(unitPrice * amountInt);
    }


    function calculateAllGoodsSum() {
        var goodsSumArr = $goodsApplyForm.find('[name="goodsSum"]');
        var allGoodsSum = 0.0;
        goodsSumArr.each(function (i, item) {
            var that = $(item);
            var thatIntVal = numberUtil.myParseFloat(that.val());
            allGoodsSum = allGoodsSum + thatIntVal;
        });
        var amountSum = $goodsApplyForm.find('[name="proGoodsApply.amountSum"]');
        amountSum.val(allGoodsSum);
        var amountSumZ = $goodsApplyForm.find('[name="proGoodsApply.amountSumZ"]');
        amountSumZ.val(numberUtil.parseToChinese(allGoodsSum));
        return allGoodsSum;
    }


    function fillEditData(wfInstanceId, taskId, businessKey) {
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsApply/getProGoodsApplyData.do?proGoodsApplyId=' + businessKey
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var goodsApply = data.data.proGoodsApply;
//                    $goodsApplyForm.find('[name="proGoodsApply.cityId"]').val(goodsApply.cityId);
//                    $goodsApplyForm.find('[name="proGoodsApply.cityId"]').attr('disabled', 'disabled');
//                    $goodsApplyForm.find('[name="proGoodsApply.projectId"]').val(goodsApply.projectId);
//                    $goodsApplyForm.find('[name="proGoodsApply.projectId"]').attr('disabled', 'disabled');
//                    $goodsApplyForm.find('[name="proGoodsApply.cityId"]').trigger('change', function() {
////                        $goodsApplyForm.find('[name="proGoodsApply.projectId"]').val(goodsApply.projectId);
////                        $goodsApplyForm.find('[name="proGoodsApply.projectId"]').attr('disabled', 'disabled');
//                    });

                    if(goodsApply != undefined && goodsApply != null){
                        $("#flowId").text(goodsApply.flowNo);
                    }

                    $goodsApplyForm.find('#cityNameTd').html(data.data.cityName);
                    $goodsApplyForm.find('#projectNameTd').html(data.data.projectName);
                    $goodsApplyForm.find('[name="proGoodsApply.id"]').val(goodsApply.id);
                    $goodsApplyForm.find('#goodsPurpose').html(goodsApply.goodsPurpose);
                    $goodsApplyForm.find('[name="proGoodsApply.version"]').val(goodsApply.version);
                    $goodsApplyForm.find('[name="proGoodsApply.amountSum"]').val(goodsApply.amountSum);
                    $goodsApplyForm.find('[name="proGoodsApply.amountSumZ"]').val(goodsApply.amountSumZ);

                    if(goodsApply.amountSum) {
                        approvalUtil.renderingCostInfo($('#proApplyGoodsTrLine'), goodsApply.projectId, wfInstanceId, goodsApply.amountSum, 'other_spread_outcome');
                    }

                    $goodsApplyForm.find('[name="taskId"]').val(taskId);
                    $goodsApplyForm.find('[name="wfInstanceId"]').val(wfInstanceId);

                    var applyGoodsList = data.data.proApplyGoodsList;
                    $.each(applyGoodsList, function (i, item) {
                        if (i == 0) {//初次赋值
                            $("input[name='id']").val(item.id);
                            $("input[name='goodsName']").val(item.goodsName);
                            $("input[name='goodsAmount']").val(item.goodsAmount);
                            $("input[name='unitPrice']").val(item.unitPrice);
                            $("input[name='goodsSum']").val(item.goodsSum);
                        } else {
                            var html =
                                '<tr> <th><input name="id" type="hidden" value="' +
                                nullValueToTempStr(item.id) +
                                '"> <input name="goodsName" type="text" class="form-control-sm" maxlength="100" value="' +
                                    nullValueToTempStr(item.goodsName) +
                                '" readonly> </th> <th colspan=""> <input name="goodsAmount" type="text" class="form-control-sm  text-center e6 " maxlength="10" value="' +
                                    nullValueToTempStr(item.goodsAmount) +
                                '" readonly> </th> <th> <input name="unitPrice" type="text" class="form-control-sm e6" maxlength="10" value="' +
                                    nullValueToTempStr(item.unitPrice) +
                                '" maxlength="10" data-rules="{required:true,number:true}" data-messages="{required:\'物品单价为必填项\',number:\'物品单价必须为数字\'}"> ' +
                                    '</th> <th> <input name="goodsSum" type="text" class="form-control-sm e6" maxlength="100" value="' +
                                    nullValueToTempStr(item.goodsSum) +
                                '" readonly> </th> </tr>';

                            $(html).insertBefore('#proApplyGoodsTrLine');

                        }
                    });



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

    function nullValueToTempStr(val) {
        if(!val) {
            return ""
        } else {
            return val;
        }
    }

    function generateApplyGoodsJson(goodsName) {
        var goodsArr = new Array();
        goodsName.each(function (i, item) {
            var goods = {};
            goods.id = $(item).parents('tr').find('[name=id]').val();
            goods.goodsName = $(item).val();
            goods.goodsAmount = $(item).parents('tr').find('[name=goodsAmount]').val();
            goods.unitPrice = $(item).parents('tr').find('[name=unitPrice]').val();
            goods.goodsSum = $(item).parents('tr').find('[name=goodsSum]').val();
            goodsArr.push(goods);
        });
        return JSON.stringify(goodsArr);
    }

});