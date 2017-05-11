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

    var fileOperationUtil = require('script/file-operation-util');
    var approvalUtil = require('script/approval/approval-util');
    require('script/validate');

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
    workflowObj.flowType = 'new';
    workflowObj.projectId = "projectSelect";
    workflowObj.cityId = "citySelect";
    workflowProp.showWorkFlowAll(workflowObj);

    var $goodsCancelApplyForm = $('#goodsCancelApplyForm');

    //城市数据加载
    var projectUtil = require("script/project/project-util");
    projectUtil.bindingProjectAndCity('projectSelect', 'citySelect',function() {
        if (!isEmpty(wfInstanceId) && !isEmpty(taskId) && !isEmpty(businessKey)) {
            //退回 或 草稿 进入编辑
            fillEditData(wfInstanceId, taskId, businessKey);
        }
    });

    $(function () {
        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'pro_goods_cancel', businessKey);
        var $approvalListTab = $('#approvalListTab');
        $approvalListTab.find('a:first').tab('show');
        $("a.toTab").click(function () {
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
        });
    });

    var $goodsApplySelectModal = $('#goodsApplySelectModal');
    $goodsCancelApplyForm.on('click', '#goodsApplySelectBtn', function (event) {
        if (event) {
            event.preventDefault();
        }
        var projectId = $('#projectSelect').val();
        if (!projectId) {
            systemMessage('请选择项目');
            return false;
        }
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsCancel/getNotCanceledGoodsApply.do?projectId=' + projectId,
            data: $goodsCancelApplyForm.serialize()
        }, jsonp)).
            done(function (data) {
                function useful(data) {
//                    console.info(data);
                    var result = data.data.content;
                    if (result.length == 0) {
                        systemMessage('未找到待核销的物品领用申请单');
                        return false;
                    }
                    var goodsApplySelectTable = $goodsApplySelectModal.find('#goodsApplySelectTable');
                    goodsApplySelectTable.html('');
                    var html = '<tr id="goodsApplyTrLine"> <th>编号</th> <th>说明</th> <th>申请人</th> <th>申请日期</th> <th>操作</th> </tr>';
                    $.each(result, function (i, goodsApply) {
                        html = html + '<tr></tr><td>' + goodsApply.flowNo +
                            '</td> <td>' + goodsApply.title +
                            '</td> <td>' + goodsApply.applyer +
                            '</td> <td>' + goodsApply.applyDate +
                            '</td> <td><a class="select-index" href="#" goodsApplyId="' + goodsApply.id +
                            '">选择</a></td></tr>';
                    });
                    goodsApplySelectTable.html(html);
                    $goodsApplySelectModal.modal({show: true});
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
    });

    $goodsApplySelectModal.on('click', '.select-index', function (event) {
        if (event) {
            event.preventDefault();
        }
        var that = $(this);
        var goodsApplyId = that.attr('goodsApplyId');

        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsApply/getProApplyGoodsList.do?goodsApplyId=' + goodsApplyId
            //   data: $goodsCancelApplyForm.serialize()
        }, jsonp)).
            done(function (data) {
                function useful(data) {
//                    console.info(data);
                    var result = data.data.content;
                    if (result.length == 0) {
                        systemMessage('您选择的物品领用申请单没有待核销物品');
                        return false;
                    }
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.applyGoodsId"]').val(goodsApplyId);
                    var proApplyCancelTrLine = $goodsCancelApplyForm.find('#proApplyCancelTrLine');
                    proApplyCancelTrLine.parents('table').find('tr[temptrline=1]').remove();
                    $.each(result, function (i, goodsApply) {
                        var html = '<tr temptrline="1"> <td> <input name="id" type="hidden" value="' +
                            goodsApply.id + '"> <input name="goodsName" type="text" class="form-control-sm" maxlength="100" value="' +
                            goodsApply.goodsName +
                            '" readonly> </td> <td> <input name="goodsAmount" type="text" class="form-control-sm  text-center e6 " value="' +
                            goodsApply.goodsAmount + '" maxlength="10" readonly> </td> <td> <input name="cancelAmount" type="text" class="form-control-sm e6" maxlength="10"' +
                            'data-rules="{required:true,number:true,max:' + goodsApply.goodsAmount + '}" data-messages="{required:\'物品核销数量为必填项\',number:\'物品核销数量必须为数字\',max:\'物品核销数量不能超过申请数量\'}"> </td> ' +
                            '<td> <input name="unitPrice" type="text" class="form-control-sm e6" maxlength="100" value="' + goodsApply.unitPrice + '" readonly> </td> ' +
                            '<td> <input name="cancelSum" type="text" class="form-control-sm" maxlength="100" readonly> </td> </tr>';
                        $(html).insertBefore(proApplyCancelTrLine);
                    });
                    $goodsApplySelectModal.modal('hide');
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

    });

    $goodsCancelApplyForm.on('change', '[name=cancelAmount]', function (event) {
        if (event) {
            event.preventDefault();
        }
        var $that = $(this);
        calculateGoodsSum($that);
        var cancelSum = calculateAllGoodsSum();
        approvalUtil.renderingCostInfo($('#proApplyCancelTrLine'), $('#projectSelect').val(), wfInstanceId, cancelSum, 'other_spread_outcome');
    });

    var numberUtil = require('script/approval/number-util');

    function calculateGoodsSum(cancelAmount) {
        var amount = numberUtil.myParseInt(cancelAmount.val());
        var unitPrice = numberUtil.myParseFloat(cancelAmount.parents('tr').find('[name="unitPrice"]').val());
        var cancelSum = cancelAmount.parents('tr').find('[name="cancelSum"]'); //申请金额
        cancelSum.val(unitPrice * amount);
    }

    function calculateAllGoodsSum() {
        var goodsSumArr = $goodsCancelApplyForm.find('[name="cancelSum"]');
        var allCancelGoodsSum = 0.0;
        goodsSumArr.each(function (i, item) {
            var that = $(item);
            var thatIntVal = numberUtil.myParseFloat(that.val());
            allCancelGoodsSum = allCancelGoodsSum + thatIntVal;
        });
        var cancelSum = $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cancelSum"]');
        cancelSum.val(allCancelGoodsSum);
        var cancelSumZ = $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cancelSumZ"]');
        cancelSumZ.val(numberUtil.parseToChinese(allCancelGoodsSum));
        return cancelSum.val();
    }

    $goodsCancelApplyForm.on('click', '[flowDealType]', function (event) {
        if (event) {
            event.preventDefault();
        }
//        console.info("to submit goods apply");
        var goodsName = $goodsCancelApplyForm.find('[name=goodsName]');
        if(goodsName.length <= 0) {
            systemMessage('请选择需要需要核销的物品');
            return false;
        }
        var $context = $(this);
        var flowDealType = $context.attr('flowDealType');
        var paramStr = "&cancelGoodsListJson=" + generateApplyGoodsJson(goodsName) + "&flowDealType=" + flowDealType;

        if ($goodsCancelApplyForm.isValid()) {
            var confirmStr = '是否确认提交物品核销单';
            if(flowDealType == 'draft') {
                confirmStr = '是否确认将物品核销单保存草稿';
            }
            if(!confirm(confirmStr)) {
                return false;
            }
            $context.attr('disabled', 'disabled');
        } else {
            return false;
        }

        $.ajax({
            type: "POST",
            url: apiHost + '/hoss/expenses/projectGoodsCancel/submitProGoodsCancel.do',
            data: $goodsCancelApplyForm.serialize()+paramStr,
            dataType : 'json',
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

            //$disabled.attr('disabled', 'disabled');
            $context.removeAttr('disabled').blur();
        });
//        $.ajax($.extend({
//            url: apiHost + '/hoss/expenses/projectGoodsCancel/submitProGoodsCancel.do' + paramStr,
//            data: $goodsCancelApplyForm.serialize(),
//            beforeSend: function () {
//                if ($goodsCancelApplyForm.isValid()) {
//                    var confirmStr = '是否确认提交物品核销单';
//                    if(flowDealType == 'draft') {
//                        confirmStr = '是否确认将物品核销单保存草稿';
//                    }
//                    if(!confirm(confirmStr)) {
//                        return false;
//                    }
//                    $context.attr('disabled', 'disabled');
//                    return true;
//                } else {
//                    return false;
//                }
//            }
//        }, jsonp)).
//            done(function (data) {
//                function useful(data) {
////                    console.info('submit to ...')
//                    systemMessage({
//                        type: 'info',
//                        title: '提示：',
//                        detail: '物品核销申请成功！'
//                    });
//                    location.href = document.referrer;
//                }
//
//                function useless(data) {
//                    systemMessage({
//                        type: 'info',
//                        title: '提示：',
//                        detail: data.detail || '物品申请失败！'
//                    });
//                }
//
//                doneCallback.call(this, data, useful, useless);
//
//            }
//        );
    });

    function fillEditData(wfInstanceId, taskId, businessKey) {
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsCancel/getProjectGoodsCancelDto.do?proGoodsCancelId=' + businessKey
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var goodsApply = data.data.proApplyGoodsCancel;

                    //$goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cityId"]').val(goodsApply.cityId);
                    //$goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cityId"]').trigger('change', function() {
                    //    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.projectId"]').val(goodsApply.projectId);
                    //    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.projectId"]').attr('disabled', 'disabled');
                    //});

                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cityId"]').html('<option value="'+goodsApply.cityId+'" selected >' +data.data.cityName+'</option>');
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cityId"]').attr('disabled', 'disabled');
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.projectId"]').html('<option value="'+goodsApply.projectId+'" selected >' +data.data.projectTitle+'</option>')
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.projectId"]').attr('disabled', 'disabled')
                        .change();

                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.id"]').val(goodsApply.id);
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.applyGoodsId"]').val(goodsApply.applyGoodsId);
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.remark"]').val(goodsApply.remark);
                    $goodsCancelApplyForm.find('[name="taskId"]').val(taskId);
                    $goodsCancelApplyForm.find('[name="wfInstanceId"]').val(wfInstanceId);
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.version"]').val(goodsApply.version);
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cancelSum"]').val(goodsApply.cancelSum);
                    $goodsCancelApplyForm.find('[name="proApplyGoodsCancel.cancelSumZ"]').val(goodsApply.cancelSumZ);
                    $goodsCancelApplyForm.find('#goodsApplySelectBtn').attr('disabled', 'disabled');

                    approvalUtil.renderingCostInfo($('#proApplyCancelTrLine'), $('#projectSelect').val(), wfInstanceId, goodsApply.cancelSum, 'other_spread_outcome');

                    var proApplyCancelTrLine = $goodsCancelApplyForm.find('#proApplyCancelTrLine');
                    proApplyCancelTrLine.parents('table').find('tr[temptrline=1]').remove();
                    var applyGoodsList = data.data.proApplyGoodsList;
                    $.each(applyGoodsList, function (i, goodsApply) {
                        var html = '<tr temptrline="1"> <td> <input name="id" type="hidden" value="' +
                            goodsApply.id + '"> <input name="goodsName" type="text" class="form-control-sm" maxlength="100" value="' +
                            goodsApply.goodsName +
                            '" readonly> </td> <td> <input name="goodsAmount" type="text" class="form-control-sm  text-center e6 " value="' +
                            goodsApply.goodsAmount + '" maxlength="10" readonly> </td> <td> <input name="cancelAmount" value="' +
                            goodsApply.cancelAmount + '" type="text" class="form-control-sm e6" maxlength="10" ' +
                            'data-rules="{required:true,number:true,max:' + goodsApply.goodsAmount + '}" data-messages="{required:\'物品核销数量为必填项\',number:\'物品核销数量必须为数字\',max:\'物品核销数量不能超过申请数量\'}"> </td> ' +
                            '<td> <input name="unitPrice" type="text" class="form-control-sm e6" maxlength="100" value="' + goodsApply.unitPrice + '" readonly> </td> ' +
                            '<td> <input name="cancelSum" type="text" class="form-control-sm" maxlength="100" value="' +
                            goodsApply.cancelSum + '" readonly> </td> </tr>';
                        $(html).insertBefore(proApplyCancelTrLine);
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


    function generateApplyGoodsJson(goodsName) {
        var goodsArr = new Array();
        goodsName.each(function (i, item) {
            var goods = {};
            goods.id = $(item).parents('tr').find('[name=id]').val();
            goods.goodsName = $(item).val();
            goods.cancelAmount = $(item).parents('tr').find('[name=cancelAmount]').val();
            goods.cancelSum = $(item).parents('tr').find('[name=cancelSum]').val();
            goodsArr.push(goods);
        });
        return encodeURIComponent(JSON.stringify(goodsArr));
    }

});