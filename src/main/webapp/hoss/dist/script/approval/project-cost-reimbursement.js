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
    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var feeLoanInfo = require('script/approval/feeLoanInfo');
    var fileOperationUtil = require('script/file-operation-util');
    require('script/validate');
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
    workflowObj.flowType = 'new';
    workflowObj.projectId = "projectSelect";
    workflowObj.cityId = "citySelect";
    workflowProp.showWorkFlowAll(workflowObj);

    var $costRepayForm = $('#costRepayForm');

    //城市数据加载
    var projectUtil = require("script/project/project-util");



    $(function () {

        projectUtil.bindingProjectAndCity('projectSelect', 'citySelect', function() {
            if (!isEmpty(wfInstanceId) && !isEmpty(taskId) && !isEmpty(businessKey)) {
                //退回 或 草稿 进入编辑
                fillEditData(wfInstanceId, taskId, businessKey);
            }
            var feeId = getLocationParam('feeId');
            if(!isEmpty(feeId)) {
                $('#feeId').val(feeId);
//        $('#costRepayFeeTypeName').html(feeTypeName);
                getFeeInfo(feeId, "");
                getFeeInfoDto(feeId);
                repayAppendFeeLoanInfo(businessKey,feeId,0);//显示借款信息
                setTimeout(function(){
                    workflowObj.conditionMap.feeId = feeId;
                    workflowProp.findAuditUsers(workflowObj);
                },1000);

            }
            if($('#projectSelect').val() && !$('#projectSelect').is(':disabled')) {
                $('#fee_apply').removeAttr("disabled");
                $('#repayBtn').removeAttr('disabled');
            }
        });

        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'project_repay', businessKey);
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

        $costRepayForm.on('change', '[name="repayInfoList.feeInfoId"]', function(event) {
            var that = $(this);
            if(that.is(':checked')) {
                that.parents('tr').find('[name="repayInfoList.repayAmount"]').val('');
                that.parents('tr').find('[name="repayInfoList.repayAmount"]').removeAttr('disabled');
            } else {
                that.parents('tr').find('[name="repayInfoList.repayAmount"]').attr('disabled', true);
            }
        });

        $costRepayForm.on('change', '[name="projectRepay.repayType"]', function(event) {
            var thisVal = $(this).val();
            if(thisVal == '0') {
                $('[name="projectRepay.bankAccountName"]').attr('disabled', 'disabled');
            } else {
                $('[name="projectRepay.bankAccountName"]').removeAttr('disabled');
            }
        });
        if($costRepayForm.find('[name="projectRepay.repayType"][checked]').val() == '0') {
            $('[name="projectRepay.bankAccountName"]').attr('disabled', 'disabled');
        }

        $costRepayForm.on('click', '[flowDealType]', function (event) {
            if (event) {
                event.preventDefault();
            }
//            console.info("to submit goods apply");

            var $that = $(this);
            var flowDealType = $that.attr('flowDealType');
            var paramStr = "&repayDetail=" + generateRepayDetailJson() + "&flowDealType=" + flowDealType;

            var formDataStr = clearEmptyValue($costRepayForm);
            if($('#citySelect').is(':disabled') && $('#citySelect').val()) {
                formDataStr = formDataStr + '&projectRepay.cityId=' + $('#citySelect').val();
            }
            if($('#projectSelect').is(':disabled') && $('#projectSelect').val()) {
                formDataStr = formDataStr + '&projectRepay.projectId=' + $('#projectSelect').val();
            }

            if($('#feeId').val() == '') {
                var repayAmount = $('#amount_input');
                if(parseFloat($(repayAmount).val()) != NaN && parseFloat($(repayAmount).val()) > 1000) {
                    systemMessage('报销总金额超过1000元，请先申请费用！');
                    return false;
                }
            }
            if($costRepayForm.isValid()) {
                var repayAmountList  = $('[name="repayInfoList.repayAmount"]:not(:disabled)');
                if(!repayAmountList.length) {
                    systemMessage('请录入要申请或报销的费用明细');
                    return false;
                }
                if(!fileOperationUtil.uploadFileRequiredValidate()) {
                    return false;
                }
                var confirmStr = '是否确认申请费用报销';
                if(flowDealType == 'draft') {
                    confirmStr = '是否确认将费用报销单保存草稿';
                }
                if(!confirm(confirmStr)) {
                    //$submit.attr('disabled', 'disabled');
                    return false;
                }
            } else {
                return false;
            }

            $.ajax({
                type: "POST",
                url: apiHost + '/hoss/expenses/projectRepay/submitProRepayApply.do',
                data: formDataStr+paramStr,
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
                        detail: json.detail || '提交成功！'
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
                //$context.removeAttr('disabled').blur();
            });
        });


            /*$.ajax($.extend({
                url: apiHost + '/hoss/expenses/projectRepay/submitProRepayApply.do' + paramStr,
                data: formDataStr,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '申请成功！'
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
        });*/

        var numberUtil = require('script/approval/number-util');

        function caculateRepayAmount() {
            var repayAmountArr = $('[name="repayInfoList.repayAmount"]');
            var repayAmountSum = 0.0;
            repayAmountArr.each(function (i, item) {
                var tempVal = numberUtil.myParseFloat($(item).val());
                repayAmountSum = repayAmountSum + tempVal;
            });
            return repayAmountSum;
        }

        $costRepayForm.on('change', '[name="repayInfoList.repayAmount"]', function (event) {
            if (event) {
                event.preventDefault();
            }
            var repayAmountSum = caculateRepayAmount();
            $('#amount_input').val(repayAmountSum);
            $('#amount_display').html(repayAmountSum);
            $('#amount_big_input').val(numberUtil.parseToChinese(repayAmountSum));
            $('#amount_big_display').html(numberUtil.parseToChinese(repayAmountSum));

            var feeId = $(this).parent().parent().find("[name='repayInfoList.feeInfoId']").attr('data-feeId');

            repayAppendFeeLoanInfo(businessKey,feeId,repayAmountSum);//显示借款信息
        });

        $costRepayForm.on('click' ,'input[type=checkbox]', function(e){ // 取消选中也触发
            $(e.currentTarget).closest('tr').find('input[name*="repayAmount"]').val('').change();
        })



        var $searchFeeDetailList = $('#searchFeeDetailList'),
            $pageNum = $searchFeeDetailList.find('input[name=page]'),
            $pageSize = $searchFeeDetailList.find('input[name=size]'),
            $searchFeeDetailForm = $searchFeeDetailList.find('#searchFeeDetailForm'),
            $searchResultPagination = $('#searchResultPagination');
        /**
         * 费用申请单文本框获取焦点时触发事件
         */
        $('#fee_apply').focus(focusFeeApply);
        function focusFeeApply() {
            var projectId = $('#projectSelect').val();
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/findProjectFeeByProjectId.do?projectId=' + projectId +'&requestType=projectRepay',
                data: {
                    page: $pageNum.val(),
                    size: $pageSize.val()
                },
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};

                        var templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                            'searchResultTemplate' :
                            'messageTemplate';

                        // 显示数据
                        $searchFeeDetailList.find('tbody').html(
                            template(templateId, data)
                        );
                        // 显示分页
                        if (dataObj.totalElements) {
                            $searchResultPagination.pagination({
                                $form: $searchFeeDetailForm,
                                totalSize: dataObj.totalElements,
                                pageSize: parseInt($pageSize.val()),
                                visiblePages: 5,
                                info: true,
                                paginationInfoClass: 'pagination-count pull-left',
                                paginationClass: 'pagination pull-right',
                                onPageClick: function (event, index) {
                                    $pageNum.val(index - 1);
                                    focusFeeApply();
                                }
                            });
                        }
                        $('#searchFeeDetailList').modal('show');
                    }

                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    detailEvents();
                });
            return false;
        }
        function detailEvents() {
            $('.fee_option_detail').on("click", function () {
                var feeId = $(this).attr("data-pid");
                var flowNo = $(this).attr("data-flowNo");
                var feeTypeName = $(this).attr("data-feeTypeName");
                var subFeeTypeName = $(this).attr("data-subFeeTypeName");
                $('#fee_apply').val(flowNo);
                $('#feeId').val(feeId);
                $('#costRepayFeeTypeName').html(feeTypeName);
                if(!isEmpty(subFeeTypeName)){
                    $("#subFeeTypeName").html("—— "+subFeeTypeName);
                }
                workflowObj.conditionMap.feeId = feeId;
                workflowProp.findAuditUsers(workflowObj);
                getFeeInfo(feeId, feeTypeName);
                repayAppendFeeLoanInfo(businessKey,feeId,0);//显示借款信息
            });
        }

        function repayAppendFeeLoanInfo(repayId,feeId,repayAmount){
            feeLoanInfo.appendFeeLoanInfo($('#repayTotalTr'),repayId,feeId,repayAmount);
        }

        $costRepayForm.on('click', '#repayBtn', function (event) {
            $('[tempAdd]').remove();
            $('#feeId').val('');
            var directRepayFeeHtml = template('directRepayFeeTemplate', {});
            $(directRepayFeeHtml).insertAfter($('#fee_detail_tr'));
            $('#costRepayFeeTypeName').html('其他费用-其他');

            workflowObj.conditionMap.feeId = '';
            workflowProp.findAuditUsers(workflowObj);
            repayAppendFeeLoanInfo(businessKey,'','');//显示借款信息
        });

        $costRepayForm.on('click', '.fee-add-btn', function (event) {
            var feeApplyDetailHtml =
                '<tr tempAdd="direct_apply">' +
                '    <td></td>' +
                '    <td><input name="repayInfoList.feeName" type="text" class="form-control-sm txt"  maxlength="50" data-rules="{required:true}" data-messages="{required:\'费用明细为必填项\'}"></td>' +
                '    <td><input name="repayInfoList.repayAmount" type="text" class="form-control-sm txt" maxlength="10" data-rules="{required:true,number:true,max:1000}" data-messages="{required:\'报销金额为必填项\',number:\'报销金额必须为数字\',max:\'报销金额不能超过1000元\'}"></td>' +
                '    <td><button class="btn btn-xs btn-danger rmv-btn">&nbsp;&nbsp;-&nbsp;&nbsp;</button></td>' +
                '</tr>';
            $(feeApplyDetailHtml).insertBefore($('#fee_detail_tr_2'));
        });

        $costRepayForm.on('click', '.rmv-btn', function (event) {
            var $that = $(this);
            $that.parents('tr').remove();
        });
    });


    function fillEditData(wfInstanceId, taskId, businessKey) {
        $costRepayForm.find('[name="taskId"]').val(taskId);
        $costRepayForm.find('[name="wfInstanceId"]').val(wfInstanceId);
        $.ajax($.extend({
            url: apiHost + "/hoss/expenses/projectRepay/getProRepayDto.do?projectRepayId=" + businessKey
        }, jsonp)).done(function (data) {
            function useless(data) {
                $('#fee_detail_tbody').empty();
                var dataObj = data.data;
                var projectRepay = dataObj.projectRepay;
                //$costRepayForm.find('[name="projectRepay.cityId"]').val(projectRepay.cityId);

                //$costRepayForm.find('[name="projectRepay.cityId"]').trigger('change', function() {
                //    $costRepayForm.find('[name="projectRepay.projectId"]').val(projectRepay.projectId);
                //    $costRepayForm.find('[name="projectRepay.projectId"]').attr('disabled', 'disabled');
                //});
                $costRepayForm.find('[name="projectRepay.cityId"]').append('<option value="'+projectRepay.cityId+'" selected >'+dataObj.cityName+'</option>');
                $costRepayForm.find('[name="projectRepay.projectId"]').append('<option value="'+projectRepay.projectId+'" selected >'+dataObj.projectName+'</option>');
                $costRepayForm.find('[name="projectRepay.projectId"]').attr('disabled', 'disabled');

                $costRepayForm.find('[name="projectRepay.cityId"]').attr('disabled', 'disabled');

                $costRepayForm.find('[name="projectRepay.id"]').val(projectRepay.id);
                $costRepayForm.find('[name="projectRepay.feeId"]').val(projectRepay.feeId);
                $costRepayForm.find('[name="projectRepay.amount"]').val(projectRepay.amount);
                $costRepayForm.find('[name="projectRepay.amountBig"]').val(projectRepay.amountBig);
                $costRepayForm.find('[name="projectRepay.repayType"][value=' + projectRepay.repayType + ']').attr('checked', 'checked');
                if(projectRepay.repayType == '0') {
                    $('[name="projectRepay.bankAccountName"]').attr('disabled', 'disabled');
                } else {
                    $('[name="projectRepay.bankAccountName"]').removeAttr('disabled', 'disabled');
                }
                $costRepayForm.find('[name="projectRepay.bankAccountName"]').val(projectRepay.bankAccountName);
                $costRepayForm.find('[name="projectRepay.bankName"]').val(projectRepay.bankName);
                $costRepayForm.find('[name="projectRepay.bankNo"]').val(projectRepay.bankNo);
                $costRepayForm.find('[name="projectRepay.remark"]').val(projectRepay.remark);
                $costRepayForm.find('#fee_apply').val(dataObj.projectFee.flowNo);


                var repayInfoList = dataObj.repayInfoList;
                var projectFee = dataObj.projectFee;
                $('#costRepayFeeTypeName').html(projectFee.feeTypeName);
                if(!isEmpty(projectFee.subFeeTypeName)){
                    $("#subFeeTypeName").html("—— "+projectFee.subFeeTypeName);
                }

                if(projectRepay.feeId) { //费用申请
                    $('#repay_type_tr').removeClass('hide');
                    getFeeInfo(projectRepay.feeId, '');
                    var tempList = $('[name="repayInfoList.feeInfoId"]');
                    tempList.each(function(i, item) {
                        var that = $(item);
                        for(var iii in repayInfoList) {
                            var repayInfo = repayInfoList[iii];
                            if(that.val() == repayInfo.feeInfoId) {
                                that.attr('checked', true);
                                that.parents('tr').find('[name="repayInfoList.repayAmount"]').val(repayInfo.repayAmount);
                                that.parents('tr').find('[name="repayInfoList.repayAmount"]').trigger('change');
                                that.parents('tr').find('[name="repayInfoList.repayAmount"]').removeAttr('disabled');
                                return;
                            } else {
                                that.parents('tr').find('[name="repayInfoList.repayAmount"]').attr('disabled', true);
                                continue;
                            }
                        }
                    });

                } else { //报销单
                    $('#repay_type_tr').addClass('hide');
                    $('[tempAdd]').remove();
                    $('#feeId').val('');
                    var directRepayFeeHtml = template('directRepayFeeTemplate', dataObj);
                    $(directRepayFeeHtml).insertAfter($('#fee_detail_tr'));

                    $costRepayForm.find('[name="repayInfoList.feeName"]').eq(0).val(repayInfoList[0].feeName);
                    $costRepayForm.find('[name="repayInfoList.repayAmount"]').eq(0).val(repayInfoList[0].repayAmount)
                    $costRepayForm.find('[name="repayInfoList.repayAmount"]').eq(0).trigger('change');
                }
            }
            doneCallback.call(this, data, useless);
        }) .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '操作失败！');
            })
            .always(function () {
                //    checkboxEvents();
            });
    }

    /**
     * 根据费用申请单id查询费用下的科目明细
     * @param feeId
     * @param title
     * @returns {boolean}
     */
    function getFeeInfo(feeId, feeTypeName) {
        var paramsStr = '?feeId=' + feeId + '&repayId=' + businessKey;
        $.ajax($.extend({
            url: apiHost + '/hoss/contract/findUnUsedFeeInfoByFeeIdForRepay.do' + paramsStr,
            async: false,
            beforeSend: function () {
            }
        }, jsonp))
            .done(function (data) {
                function usefull(data) {
                    $('#fee_detail_tbody').empty();
                    var dataObj = data.data || {};
                    var templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                        'searchFeeResultTemplate' :
                        'messageTemplate';
                    $('#searchFeeDetailList').modal('hide');
                    $('[tempAdd]').remove();
                    $('.data-message').remove();
                    // 显示数据
                    var appFellDetailHtml = template(templateId, data);
                    $(appFellDetailHtml).insertAfter($('#fee_detail_tr'));

                }

                doneCallback.call(this, data, usefull);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '操作失败！');
            })
            .always(function () {
                //    checkboxEvents();
            });
        return false;
    }

    function getFeeInfoDto(feeId) {
        $.ajax($.extend({
            url: apiHost + '/hoss/expenses/projectFee/getProjectFeeDto.do?feeId=' + feeId,
            async: false,
            beforeSend: function () {
            }
        }, jsonp))
            .done(function (data) {
                function usefull(data) {
                    var projectFee = data.data.projectFee;
//                    $costRepayForm.find('#citySelect').val(projectFee.cityId);
//                    $costRepayForm.find('#citySelect').trigger('change');
//                    $costRepayForm.find('#projectSelect').val(projectFee.projectId);
                    $costRepayForm.find('[name="projectRepay.cityId"]').val(projectFee.cityId);

                    $costRepayForm.find('[name="projectRepay.cityId"]').trigger('change', function() {
                        $costRepayForm.find('[name="projectRepay.projectId"]').val(projectFee.projectId);
                        $costRepayForm.find('[name="projectRepay.projectId"]').attr('disabled', 'disabled');
                    });
                    $costRepayForm.find('[name="projectRepay.cityId"]').attr('disabled', 'disabled');

                    $costRepayForm.find('#fee_apply').val(projectFee.flowNo);
                    $('#feeId').val(feeId);
                    $('#costRepayFeeTypeName').html(projectFee.feeTypeName);
                    if(!isEmpty(projectFee.subFeeTypeName)){
                        $("#subFeeTypeName").html("—— "+projectFee.subFeeTypeName);
                    }
                }

                doneCallback.call(this, data, usefull);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '操作失败！');
            })
            .always(function () {
                //    checkboxEvents();
            });
        return false;
    }

    function generateRepayDetailJson() {
        var $feeName = $('[name="repayInfoList.feeName"]');
        var repayInfoArr = new Array();
        $feeName.each(function (i, item) {
            var $that = $(item);
            var repayInfo = {};
            var $feeInfoId = $that.parents('tr').find('[name="repayInfoList.feeInfoId"]');
            if ($feeInfoId.length) {
                if ($feeInfoId.is(':checked')) {
                    repayInfo.feeName = $that.val();
                    repayInfo.feeInfoId = $feeInfoId.val();
                    repayInfo.repayAmount = $that.parents('tr').find('[name="repayInfoList.repayAmount"]').val();
                    repayInfoArr.push(repayInfo);
                }
            } else {
                repayInfo.feeName = $that.val();
                repayInfo.repayAmount = $that.parents('tr').find('[name="repayInfoList.repayAmount"]').val();
                repayInfoArr.push(repayInfo);
            }
        });
        return encodeURIComponent(JSON.stringify(repayInfoArr));
    }
});