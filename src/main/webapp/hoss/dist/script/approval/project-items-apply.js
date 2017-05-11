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
    require('script/validate');

    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;

    var $goodsApplyForm = $('#goodsApplyForm');

    var taskId = getLocationParam("taskId");//任务ID
    var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
    var businessKey = getLocationParam("businessKey");//业务主键ID
    var fileOperationUtil = require('script/file-operation-util');

    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.WPSQ;
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

    //城市数据加载
//    projectUtil.myCityBindingToSelection('citySelect');
    projectUtil.bindOneProjectAndCity('projectSelect', 'citySelect', function() {
        if (!isEmpty(wfInstanceId) && !isEmpty(taskId) && !isEmpty(businessKey)) {
            //退回 或 草稿 进入编辑
            fillEditData(wfInstanceId, taskId, businessKey);
        }
    });


    $(function () {
        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'pro_goods_apply', businessKey);
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
            location.href = document.referrer;
        });
    });

//
//    $goodsApplyForm.on('change', '#projectSelect', function (event) {
//        if (event) {
//            event.preventDefault();
//        }
//        var $that = $(this);
//        var projectId = $('#projectId_hide');
//        projectId.val($that.val());
//    });


    $goodsApplyForm.on('click', '#goodsAddBtn', function (event) {
        if (event) {
            event.preventDefault();
        }
        var html = '<tr> <th colspan="2"> <input name="goodsName" type="text" class="form-control-sm w100" maxlength="100" data-rules="{required:true}" data-messages="{required:\'物品名称为必填项\'}"></th> <th colspan=""> ' +
            '<input name="goodsAmount" type="text" class="form-control-sm  text-center e6 " maxlength="10" data-rules="{required:true,number:true}" data-messages="{required:\'物品数量为必填项\',number:\'物品数量必须为数字\'}"></th> <th>' +
            ' <button class="btn btn-xs btn-danger">&nbsp;&nbsp;-&nbsp;&nbsp;</button> </th> </tr>';
        $(html).insertBefore('#proApplyGoodsTrLine');
        return false;
    });

    $goodsApplyForm.on('click', '.btn-danger', function (event) {
        if (event) {
            event.preventDefault();
        }
        $(this).parents('tr').remove();
        return false;
    });

    $goodsApplyForm.on('click', '[flowDealType]', function (event) {
        if (event) {
            event.preventDefault();
        }
//        console.info("to submit goods apply");

        var $context = $(this);
        var flowDealType = $context.attr('flowDealType');
        var goodsName = $goodsApplyForm.find('[name=goodsName]');
        var paramStr = "?applyGoodsListJson=" + generateApplyGoodsJson(goodsName) + "&flowDealType=" + flowDealType;
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsApply/submitProGoodsApply.do' + paramStr,
            data: $goodsApplyForm.serialize(),
            beforeSend: function () {
                if ($goodsApplyForm.isValid()) {
                    var confirmStr = '是否确认提交物品申请单';
                    if(flowDealType == 'draft') {
                        confirmStr = '是否确认将物品申请单保存草稿';
                    }
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
                        detail: '物品申请成功！'
                    });
                    location.href = document.referrer;
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '物品申请失败！'
                    });
                    $context.removeAttr('disabled').blur();
                }

                doneCallback.call(this, data, useful, useless);

            }
        );
    });

    function fillEditData(wfInstanceId, taskId, businessKey) {
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectGoodsApply/getProGoodsApplyData.do?proGoodsApplyId=' + businessKey
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    //todo 城市

                    var goodsApply = data.data.proGoodsApply;
                    $goodsApplyForm.find('[name="proGoodsApply.cityId"]').val(goodsApply.cityId);

                    $goodsApplyForm.find('[name="proGoodsApply.cityId"]').trigger('change', function() {
//                        $goodsApplyForm.find('[name="proGoodsApply.projectId"]').val(goodsApply.projectId);
//                        $goodsApplyForm.find('[name="proGoodsApply.projectId"]').attr('disabled', 'disabled');

                        $goodsApplyForm.find('[name="proGoodsApply.cityId"]').append('<option value="'+goodsApply.cityId+'" selected >' +data.data.cityName+'</option>');
                        $goodsApplyForm.find('[name="proGoodsApply.projectId"]').append('<option value="'+goodsApply.projectId+'" selected >' +data.data.projectName+'</option>');
                        $goodsApplyForm.find('[name="proGoodsApply.projectId"]').attr('disabled', 'disabled');
                    });

                    $goodsApplyForm.find('[name="proGoodsApply.cityId"]').attr('disabled', 'disabled');


                    $goodsApplyForm.find('[name="proGoodsApply.id"]').val(goodsApply.id);
                    $goodsApplyForm.find('[name="proGoodsApply.goodsPurpose"]').val(goodsApply.goodsPurpose);
                    $goodsApplyForm.find('[name="taskId"]').val(taskId);
                    $goodsApplyForm.find('[name="wfInstanceId"]').val(wfInstanceId);
                    $goodsApplyForm.find('[name="proGoodsApply.cityId"]').val(goodsApply.cityId);
                    $goodsApplyForm.find('[name="proGoodsApply.projectId"]').val(goodsApply.projectId);
                    $goodsApplyForm.find('[name="proGoodsApply.version"]').val(goodsApply.version);

                    var applyGoodsList = data.data.proApplyGoodsList;
                    $.each(applyGoodsList, function (i, item) {
                        if (i == 0) {//初次赋值
                            $("input[name='goodsName']").val(item.goodsName);
                            $("input[name='goodsAmount']").val(item.goodsAmount);
                        } else {
                            var html = '<tr> <th colspan="2"> ' +
                                '<input name="goodsName" type="text" class="form-control-sm w100" value="' +
                                item.goodsName +
                                '" maxlength="100" data-rules="{required:true}" data-messages="{required:\'物品名称为必填项\'}"></th> <th colspan="">' +
                                ' <input name="goodsAmount" type="text" class="form-control-sm  text-center e6 " maxlength="10" value="' +
                                item.goodsAmount +
                                '" data-rules="{required:true,number:true}" data-messages="{required:\'物品数量为必填项\',number:\'物品数量必须为数字\'}"></th> <th><button class="btn btn-xs btn-danger">&nbsp;&nbsp;-&nbsp;&nbsp;</button> </th>';
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


    function generateApplyGoodsJson(goodsName) {
        var goodsArr = new Array();
        goodsName.each(function (i, item) {
            var goods = {};
            goods.goodsName = $(item).val();
            goods.goodsAmount = $(item).parents('tr').find('[name=goodsAmount]').val();
            goodsArr.push(goods);
        });
        return JSON.stringify(goodsArr);
    }

});