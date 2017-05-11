define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    var $ = require('jquery');
            require('datepicker');
            require('script/validate');

    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var $modal = require('bootstrap/modal');
    var projectUtil = require('script/project/project-util');
    var numberUtil = require('script/approval/number-util');
    var queryString = require("get-query-string");
    var systemMessage = require('system-message');


    var approvalUtil = require('script/approval/approval-util');
    var workflowProp = require('script/approval/workflow-properties');
    var fileOperationUtil = require('script/file-operation-util');
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.HTSP;

    var businessKey = queryString('businessKey');
    var wfInstanceId = queryString('wfInstanceId');
    var taskId = queryString('taskId');
    var isEdit=queryString('isEdit');
    var submitFlag = true;
    var selectedFeeAmount = 0;//选中的费用合计
    $(function () {
        var $flow = $('#flow');
        $flow.find('a:first').tab('show');
        $("a.toTab").click(function () {
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

    $(function () {
        workflowObj.businessKey = businessKey;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = "new";
        workflowObj.projectId = "projectId";
        workflowObj.cityId = "cityId";
        workflowProp.showWorkFlowAll(workflowObj);

        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'cm_apply_contract', businessKey);

        var feeId = queryString("feeId");
        projectUtil.bindingProjectAndCity("projectId","cityId", function(){
            if(feeId) {
                eliminatedToContract(feeId);
            }

            approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), "", "", 0, "");
        });

        var $flow = $('#flow'),
            $pickapproval=$('#pick-approval'),
            $approvalitem=$('.approval-item'),
            $approvalcol=$('.approval-col');

        /**
         * window列表
         * @type {*|HTMLElement}
         */
        var $searchFeeDetailList = $('#searchFeeDetailList'),
            $searchFeeDetailForm = $('#searchFeeDetailForm'),
            $pageNum = $searchFeeDetailForm.find('input[name=page]'),
            $pageSize = $searchFeeDetailForm.find('input[name=size]'),
            $searchResultPagination = $('#searchResultPagination');


        function intitDatePicker() {
            var $datepickerGroup = $('.input-daterange > input'),
                startDate;
            $datepickerGroup.datepicker({
                autoclose: true,
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd'
            });
        }

        /**
         * 计算金额
         */
        $("#contractTable").on('keyup','input[id^=amount]',function(e){
            var amount = 0.00;
            $.each($('input[id^=amount]'), function(){
                amount += parseFloat($(this).val());
            });
//                var totalContractAmount = parseFloat($('#xiaoxie').text());
            $('#xiaoxie').text(amount);
            $('#daxie').text(numberUtil.parseToChinese(amount));
            if(amount > selectedFeeAmount) {
                $('.btn-del').attr("disabled","disabled");
                $('.btn-add').attr("disabled", "disabled");
//                systemMessage({
//                    type: 'info',
//                    title: '提示：',
//                    detail: '累计付款金额不能大于选中的费用明细合计!'
//                });
            }

            if($('input[type=radio]:checked').val() == 0 && amount < selectedFeeAmount) {
                $('.btn-del').removeAttr("disabled");
                $('.btn-add').removeAttr("disabled");
            }
        });

        /**
         * 日期控件初始化
         */
        intitDatePicker();


        $('input[type=radio]').on('click', function() {
            submitFlag = true;
            if($(this).val()== 0) {
                $('.btn-del').removeAttr("disabled");
                $('.btn-add').removeAttr("disabled");
            } else {
                $(".count-num tr:not([id^='count_num_1'])").remove();
                $('.del-class').remove();
                $('.btn-del').attr("disabled","disabled");
                $('.btn-add').attr("disabled", "disabled");

            }
        });

        /**
         * 新增行
         */
        $('.btn-add').click(function(){
            if(!checkPayTimeEmpty()) {
                return false;
            }
            if(!checkPayTime()) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '本次付款日期不能小于上次付款日期'
                });
                return false;
            };
            var id = "count_num_" + ($('.count-num').length + 1);
            var count = $('.count-num').length + 1;
            var index = $('.count-num').length;
            var payDateId = 'payDate' + index;
            var amountId = 'amount' + index;
            var html = '<tr class="count-num del-class" id='+id+'>'
                + '<th>第'+count+'次</th>'
                + '<th><div id="datepicker" class="input-daterange text-center">'
                + '<input type="text" class="form-control-sm text-center pay_date_change" id="'+payDateId+'" name="applyContractPayNumList['+index+'].payDate" placeholder="">'
                + '</div></th>'
                + '    <th><input type="text" class="form-control-sm text-left pay-amount" id="'+amountId+'" maxlength="20" name="applyContractPayNumList['+index+'].amount"></th>'
                + '        <th><input type="text" class="form-control-sm txt" name="applyContractPayNumList['+index+'].remark" maxlength="60"></th>'
                + '        </tr>';
            $(html).insertBefore('#optionType');
            $('#' + payDateId).attr("data-rules", "{required:true}");
            $('#' + payDateId).attr("data-messages", "{required:'付款时间不能为空'}");
            $('#' + amountId).attr("data-rules", "{required:true,number:true}");
            $('#' + amountId).attr("data-messages", "{required:'金额(元)不能为空',number:'金额(元)必须为数字'}");
            //动态新增行时初始化日期控件
            intitDatePicker();
            initChangeEvents();
            return false;
        });

        function initChangeEvents() {
            $('.pay_date_change').on('change', function() {
                //根据本次付款index获取上一次 和下一次
                var count = $(this).attr("id").split("payDate")[1];

                //本次的上一次付款时间对于的id
                var fristId = 'payDate' + (count*1 - 1) + '';

                // 当前次数ID
                var currentId = $(this).attr("id");

                //本次对应下一次下一次付款时间的id
                var nextId = 'payDate' + (count*1 + 1) + '';

                var fristInput = $('#' + fristId).val();

                var currentInput = $('#' + currentId).val();

                var lastInput = $('#' +nextId).val();

                if(currentInput != undefined && fristInput != undefined) {
                    if(new Date(currentInput) < new Date(fristInput)) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '第[' + ((count*1)+1) + '' + ']付款时间不能小于' + '第[' + (count) + '' + ']次付款时间'
                        });
                        $('.btn-del').attr("disabled","disabled");
                        $('.btn-add').attr("disabled", "disabled");
                        submitFlag = false;
                    }else {
                        submitFlag = true;
                        $('.btn-del').removeAttr("disabled");
                        $('.btn-add').removeAttr("disabled");
                    }
                    if ( fristInput != undefined && currentInput != undefined && lastInput != undefined) {
                        if(new Date(currentInput) > new Date(fristInput) && new Date(currentInput) < new Date(lastInput)) {
                            $('.btn-del').removeAttr("disabled");
                            $('.btn-add').removeAttr("disabled");
                            submitFlag = true;
                        } else {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '第[' + ((count*1)+1) + '' + ']付款时间不能小于' + '第[' + (count) + '' + ']付款时间,并且第[' + ((count*1)+1) + '' + ']付款时间不能大于第[' + ((count*1)+2) + '' + ']付款时间'
                            });
                            $('.btn-del').attr("disabled","disabled");
                            $('.btn-add').attr("disabled", "disabled");
                            submitFlag = false;
                        }
                    }
                }
            });
        }

        /**
         * 去除付款日期空字符
         * @returns {boolean}
         */
        function checkPayTimeEmpty() {
            return $('.count-num').isValid();
        }

        /**
         * 日期格式检查
         */
        function checkPayTime() {
            var flag = true;
            var kongjCount = $('.count-num').length == 1 ? 1 : $('.count-num').length - 1;
            var lastPayDate = $('#count_num_' + kongjCount).find('.text-center > input').val();
            var currentCount = (kongjCount*1) + 1;
            var curretDate = $('#count_num_' + currentCount).find('.text-center > input').val();
            if($('.count-num').length > 1 ) {
                if(lastPayDate && curretDate) {
                    if(new Date(curretDate) < new Date(lastPayDate)) {
                        flag = false;
                    }
                }
            }
            return flag;
        }

        /**检查多次付款和单次付款总金额是否大于合同金额*/
        function checkPayAmount() {
            var flag = true;
            var totalAmount = 0;
            $.each($('input[id^=amount]'), function(){
                totalAmount += parseFloat($(this).val());
            });
//            var appContractAmount = parseFloat($('#xiaoxie').text() || 0);
            if(totalAmount > selectedFeeAmount) {
                flag = false;
            }
//            console.log("totalAmount:"+totalAmount);
//            console.log("selectedFeeAmount:"+selectedFeeAmount);
            return flag;
        }

        /**
         *删除行
         */
        $('.btn-del').click(function(){
            var len = $('.count-num').length;
            if(len > 1) {
                $('#count_num_' + len).remove();
            }
            return false;
        });

        /**提交合同审批*/
        $('#btn_save').click(function() {
            if(confirm('确定提交审批吗?')){
                getJsonFeeList();
                saveContract('submit');
            }
            return false;
        });

        /**保存草稿*/
        $('#btn_save_draft').click(function() {
            getJsonFeeList();
            saveContract('draft');
            return false;
        });


        /**
         * 保存合同审批
         * @param optionType
         * @returns {boolean}
         */
        function saveContract(optionType) {
            getAmount();
            if(!submitFlag) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '您的付款时间顺序不正确，请重新填写!'
                });
                return false;
            }
//            if (!checkPayAmount()) {
//                systemMessage({
//                    type: 'info',
//                    title: '提示：',
//                    detail: '付款金额合计不能大于选中费用明细合计!'
//                });
//                return false;
//            }
            if(!$('#contractAddForm').isValid()) {
                return false;
            }
            $.ajax({
                type: "POST",
                url: apiHost + '/hoss/contract/saveCmApplyContract.do?flowDealType=' + optionType,
                dataType : 'jsonp',
                data :clearEmptyValue($('#contractAddForm')),
                jsonp:'callback'
            }).done(function (data) {
                function useful(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '保存成功！'
                    });
                    //保存成功后跳转到已办审批页面
                    location.href=document.referrer;
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
                failCallback.call(this, jqXHR, '操作失败！');
            })
            .always(function () {
            });

//            $.ajax($.extend({
//                url: apiHost + '/hoss/contract/saveCmApplyContract.do?flowDealType=' + optionType,
//                data: clearEmptyValue($('#contractAddForm')),
//                beforeSend: function () {
//                    //使用验证框架
//                    if(!$('#contractAddForm').isValid()) {
//                        return false;
//                    }
//                }
//            }, jsonp))
//                .done(function (data) {
//                    function useful(data) {
//                        systemMessage({
//                            type: 'info',
//                            title: '提示：',
//                            detail: '保存成功！'
//                        });
//                        //保存成功后跳转到已办审批页面
//                        location.href=document.referrer;
//                    }
//                    function useless(data) {
//                        systemMessage({
//                            type: 'info',
//                            title: '提示：',
//                            detail: data.detail || '获取列表数据失败！'
//                        });
//                    }
//                    doneCallback.call(this, data, useful, useless);
//                })
//                .fail(function (jqXHR) {
//                    failCallback.call(this, jqXHR, '操作失败！');
//                })
//                .always(function () {
//                });
            return false;
        }

        function getAmount() {
            var amount = parseFloat($('#xiaoxie').text());
            $('#cmApplyContract_amount').val(amount);
        }

        /**
         * 费用申请单文本框获取焦点时触发事件
         */
        $('#fee_apply').focus(focusFeeApply);

        function focusFeeApply(){
            var projectId = $("#projectId option:selected").val();
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/findProjectFeeByProjectId.do',
                data: {
                    projectId: projectId,
                    page: $pageNum.val(),
                    size: $pageSize.val(),
                    requestType:'projectContract'
                },
                beforeSend: function () {}
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
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
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    detailEvents();
                });
            return false;
        }

        function detailEvents(){
            $('.fee_option_detail').on("click", function(){
                var feeId = $(this).attr("data-pid");
                var flowNo = $(this).attr("data-flowNo");
                var feeTypeName = $(this).attr("data-feeTypeName");
                var subFeeTypeName = $(this).attr("data-subFeeTypeName");
                $('#fee_apply').val(flowNo);
                $('#cmApplyContract_feeId').val(feeId);;
                $('#cmApplyContract_feeTypeName').val("科目:" + feeTypeName + "," + "合同金额:" + $("#xiaoxie").text());
                getFeeInfo(feeId, feeTypeName,subFeeTypeName);

                workflowObj.conditionMap.feeId = feeId;
                workflowProp.findAuditUsers(workflowObj);
            });
        }

        /**
         * 根据费用申请单id查询费用下的科目明细
         * @param feeId
         * @param title
         * @returns {boolean}
         */
        function getFeeInfo(feeId, feeTypeName,subFeeTypeName) {
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/findUnUsedFeeInfoByFeeId.do?feeId=' + feeId,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        $('#fee_detail_tbody').empty();
                        var dataObj = data.data || {};
                        var templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                            'searchFeeRsultTemplate' :
                            'messageTemplate';
                        $('#searchFeeDetailList').modal('hide');
                        $('#fee_title').text(feeTypeName);
                        if('undefined'!=subFeeTypeName&&null!=subFeeTypeName&&''!=subFeeTypeName){
                            $("#subFeeTypeName").html("—— "+subFeeTypeName);
                        }
                        // 显示数据
                        $('#fee_detail_tbody').html(
                            template(templateId, data)
                        );
                        if(dataObj.content.length>0){

                            getCost(feeId,$("#projectId option:selected").val(),dataObj.content[dataObj.content.length-1].auditAmount);
                        }
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    checkboxEvents();
                });
            return false;
        }
        function getCost(feeId,projectId,amount) {
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/findDictionaryByFeeId.do?feeId=' + feeId,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {

                        var dataObj = data.data || {};
                        if(null != dataObj){

                            approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), projectId, "", amount, dataObj.code);
                        }
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    checkboxEvents();
                });
            return false;
        }
        /**
         * 转合同申请
         * @param feeId
         * @returns {boolean}
         */
        function eliminatedToContract(feeId) {
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/findEliminatedToContractDetail.do?feeId=' + feeId,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        $('#fee_detail_tbody').empty();
                        var dataObj = data.data || {};
                        var templateId = ($.isArray(dataObj.infoList) && dataObj.infoList.length) ?
                            'searchFeeDtoRsultTemplate' :
                            'messageTemplate';

                        $('#fee_title').text(dataObj.feeTypeName);
                        $('#fee_apply').val(dataObj.flowNo);
                        var projectFee = dataObj.cmProjectFee;
                        var subFeeTypeName = projectFee.subFeeTypeName;
                        if('undefined'!=subFeeTypeName&&null!=subFeeTypeName&&''!=subFeeTypeName){
                            $("#subFeeTypeName").html("—— "+subFeeTypeName);
                        }

                        //$('#projectId').val(dataObj.projectId);
                        $('#cmApplyContract_feeId').val(feeId);
                        $('#cityId').val(dataObj.cityId);
                        $('#cityId').trigger('change', function() {
                            $('#projectId').val(dataObj.projectId);
                            $('#projectId').attr("disabled", "disabled");
                        });
//                      $('#fee_apply').removeListener('focus',focusFeeApply);
                        $('#cityId').attr("disabled", "disabled");

                        $('#cmApplyContract_projectId').val(dataObj.projectId);
                        $('#cmApplyContract_cityId').val(dataObj.cityId);
//                        $('#fee_apply').removeAttr("disabled");
                        // 显示数据
                        $('#fee_detail_tbody').html(
                            template(templateId, data)
                        );

                        setTimeout(function(){
                            workflowObj.conditionMap.feeId = feeId;
                            workflowProp.findAuditUsers(workflowObj);
                        },1000);
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    checkboxEvents();
                });
            return false;
        }

        $('#projectId').change(function(){
            $('#fee_apply').removeAttr("disabled");
        });
        $('#cityId').change(function(){
            $('#fee_apply').attr("disabled", "disabled");
        });

        /**
         * 提交前生成dom节点
         */
        function getJsonFeeList() {
            $.each($('input[type=checkbox]:checked'), function(index, item) {
                var feeId = $(this).attr("data-feeId");
                var feeTypeId = $(this).attr("data-feeTypeId");
                var feeInfoId = $(this).attr("data-feeInfoId");
                var feeName = $(this).attr("data-feeName");
                var feeAmount = $(this).attr("data-amount");
                var domHtml = '<input hidden="hidden" name="applyContractFeeInfoList['+index+'].feeInfoId" value="'+feeInfoId+'"/>'
                    + '<input hidden="hidden" name="applyContractFeeInfoList['+index+'].feeTypeName" value="'+feeName+'"/>'
                    + '<input hidden="hidden" name="applyContractFeeInfoList['+index+'].amount" value="'+feeAmount+'"/>'
                    + '<input hidden="hidden" name="applyContractFeeInfoList['+index+'].feeId" value="'+feeId+'"/>'
                    + '<input hidden="hidden" name="applyContractFeeInfoList['+index+'].feeTypeId" value="'+feeTypeId+'"/>';
                $('#fee_detail_tbody').append(domHtml);
            });
        }

        /**
         * 动态计算金额
         */
        function checkboxEvents() {
            $('input[type=checkbox]').change(function(){
                var amount = $(this).attr("data-amount");
                var options = $(this).attr("class");
//                var old = $('#xiaoxie').text()*1;
//                if('notSelected' == options) {
////                    $('#xiaoxie').text(old + (amount*1));
//                    selectedFeeAmount = selectedFeeAmount + (amount*1);
//                    $(this).attr("class", 'selected');
//                } else {
////                    $('#xiaoxie').text(old - (amount*1));
//                    selectedFeeAmount = selectedFeeAmount - (amount*1);
//                    $(this).attr("class", 'notSelected');
//                }
//                var newAmount = $('#xiaoxie').text()*1;
//                $('#daxie').text(numberUtil.parseToChinese(newAmount));

                selectedFeeAmount = 0;
                $('#fee_detail_tbody [type=checkbox]:checked').each(function(index, node){
                    selectedFeeAmount += parseFloat($(node).attr('data-amount'))
                })
            });
        }


        /**
         * 数字转中文
         * @param number
         * @returns {*}
         */
        function chinese(number) {
            var N = [
                "零", "一", "二", "三", "四", "五", "六", "七", "八", "九"
            ];
            function convertToChinese(num){
                var str = num.toString();
                var len = num.toString().length;
                var C_Num = [];
                for(var i = 0; i < len; i++){
                    C_Num.push(N[str.charAt(i)]);
                }
                return C_Num.join('');
            }
            return convertToChinese(number);
        }
        $approvalitem.click(function () {
            $approvalcol.removeClass('hide');
        });
        $approvalitem.click(function () {
            $approvalcol.removeClass('hide');
        });
        $pickapproval.click(function () {
            $approvalcol.addClass('hide');
        });

        $(".goback").click(function () {
            history.back();
        });

    });
});
