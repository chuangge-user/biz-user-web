define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    var $ = require('jquery');
            require('datepicker');
            require('script/validate');

    require('jqprint-util');

    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var $modal = require('bootstrap/modal');
    var projectUtil = require('script/project/project-util');
    var numberUtil = require('script/approval/number-util');
    var queryString = require("get-query-string");
    var systemMessage = require('system-message');

    var workflowProp = require('script/approval/workflow-properties');
    var fileUtil = require('script/file-operation-util');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var workflowObj = workflowProp.workflowObj;
    var submitFlag = true;
    var selectedFeeAmount = 0;//选中的费用合计
    var approvalUtil = require('script/approval/approval-util');

    $(function () {
        var processKey = workflowProp.definitionConstants.HTSP;
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
        workflowProp.showWorkFlowAll(workflowObj);
        fileUtil.appendFileViewTable($('#fileViewTable'), 'cm_apply_contract', businessKey);
        var applyContractId = queryString('businessKey');
        var wfInstanceId = queryString('wfInstanceId');
        var taskId = queryString('taskId');
        var $flow = $('#flow'),
            $pickapproval=$('#pick-approval'),
            $approvalitem=$('.approval-item'),
            $approvalcol=$('.approval-col');

        /**
         * window列表
         * @type {*|HTMLElement}
         */
        var $searchFeeDetailList = $('#searchFeeDetailList'),
            $pageNum = $searchFeeDetailList.find('input[name=page]'),
            $pageSize = $searchFeeDetailList.find('input[name=size]'),
            $searchResultPagination = $('#searchResultPagination');

        $('#cmApplyContract_applyContractId').val(applyContractId);
        $('#wfInstanceId').val(wfInstanceId);
        $('#taskId').val(taskId);

        editInit();
        initScroll();

        function editInit() {
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/findContractPayNumOrPayFeeInfo.do?applyContractId=' + applyContractId + '&optionType=auditQuery',
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        $('#cmApplyContract_feeId').val(dataObj.cmApplyContract.feeId);
                        var cityId = dataObj.cmApplyContract.cityId;
                        var projectId = dataObj.cmApplyContract.projectId;
                        var beginTime = dataObj.cmApplyContract.beginDate.substring(0,10);
                        var endTime = dataObj.cmApplyContract.endDate.substring(0,10);
                        var contractCycle = beginTime + "~~" + endTime;
                        dataObj.contractCycle = contractCycle;

                        if(dataObj.cmApplyContract != undefined && dataObj.cmApplyContract != null){
                            $("#flowId").text(dataObj.cmApplyContract.flowNo);
                        }

                        $('#contract_projectId').val(projectId);
                        $('#contract_cityId').val(cityId);
                        $('#view_cityId').text(dataObj.cityName);
                        $('#view_projectId').text(dataObj.projectName);
                        $('#contractTable').find("tbody").html(
                            template('searchContractResultTemplate', data)
                        );
                        var length = dataObj.feeInfoDto.length;
                        $.each(dataObj.feeInfoDto,function(i,item){
                            if(i==(length-1)){
                                selectedFeeAmount = item.auditAmount;
                            }
                        });
                        var projectFee = dataObj.cmProjectFee;
                        var subFeeTypeName = projectFee.subFeeTypeName;
                        if('undefined'!=subFeeTypeName&&null!=subFeeTypeName&&''!=subFeeTypeName){
                            $("#subFeeTypeName").html("—— "+subFeeTypeName);
                        }
                        if(dataObj.feeInfoDto.length>0){
                            approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), projectId, "", dataObj.feeInfoDto[dataObj.feeInfoDto.length-1].auditAmount, dataObj.sysDictionary.code);
                        }else{
                            approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), projectId, "", 0, dataObj.sysDictionary.code);
                        }

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
                    checkboxEvents();
                    intitDatePicker();
                    initChangeEvents();
                });
            return false;
        };

        intitDatePicker();

        function intitDatePicker() {
            var $datepickerGroup = $('#datepicker > input'),
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
        $("#contractTable").on('keyup','.pay-amount',function(e){
            var amount = 0.00;
            $.each($('.pay-amount'), function(){
                amount += parseFloat($(this).val());
            });
            $('#xiaoxie').text(amount);
            $('#daxie').text(numberUtil.parseToChinese(amount));
        });

        /**
         * 动态计算金额
         */
        function checkboxEvents() {
            $('#daxie').text(numberUtil.parseToChinese($('#xiaoxie').text()*1));
        }

        /**
         * 日期格式检查
         */
        function checkPayTime() {
            var flag = true;
            var kongjCount = $('.count-num').length == 1 ? 1 : $('.count-num').length - 1;
            var lastPayDate = $('#count-num-' + kongjCount).find('.text-center > input').val();
            var currentCount = (kongjCount*1) + 1;
            var curretDate = $('#count-num-' + currentCount).find('.text-center > input').val();
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
            if(totalAmount > selectedFeeAmount) {
                flag = false;
            }
            return flag;
        }


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
                        $('.btn-danger').attr("disabled","disabled");
                        $('.btn-success').attr("disabled", "disabled");
                        submitFlag = false;
                    }else {
                        submitFlag = true;
                        $('.btn-danger').removeAttr("disabled");
                        $('.btn-success').removeAttr("disabled");
                    }
                    if ( fristInput != undefined && currentInput != undefined && lastInput != undefined) {
                        if(new Date(currentInput) > new Date(fristInput) && new Date(currentInput) < new Date(lastInput)) {
                            $('.btn-danger').removeAttr("disabled");
                            $('.btn-success').removeAttr("disabled");
                            submitFlag = true;
                        } else {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '第[' + ((count*1)+1) + '' + ']付款时间不能小于' + '第[' + (count) + '' + ']付款时间,并且第[' + ((count*1)+1) + '' + ']付款时间不能大于第[' + ((count*1)+2) + '' + ']付款时间'
                            });
                            $('.btn-danger').attr("disabled","disabled");
                            $('.btn-success').attr("disabled", "disabled");
                            submitFlag = false;
                        }
                    }
                }
            });
        }

        /**
         * 审批同意
         */
        $('.btn-success').on('click', function(){
//            if(!checkPayAmount()) {
//                systemMessage({
//                    type: 'info',
//                    title: '提示：',
//                    detail: '付款金额合计不能大于选中费用明细合计!'
//                });
//                return false;
//            }
            if(!confirm('确定同意吗?')){
                return false;
            }
            if(!submitFlag) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '您的付款时间顺序不正确，请重新填写!'
                });
                return false;
            }
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/approvalContractApply.do?flowDealType=submit',
                data: $('#contractAddForm').serializeArray(),
                beforeSend: function () {
                    if(!$('#contractAddForm').isValid()) {
                        return false;
                    }
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '保存成功！'
                        });
                        location.href=document.referrer;
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
                });
            return false;
        });

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

        function initScroll(){
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
                return false;
            });
        }
    });
});
