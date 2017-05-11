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

    var fileOperationUtil = require('script/file-operation-util');

    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var $modal = require('bootstrap/modal');
    var numberUtil = require('script/approval/number-util');
    var projectUtil = require('script/project/project-util');
    var systemMessage = require('system-message');
    var queryString = require("get-query-string");

    var workflowProp = require('script/approval/workflow-properties');
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.XMFK;

    var approvalUtil = require('script/approval/approval-util');

    $(function () {

        var contractPayId = queryString('businessKey');
        var wfInstanceId = queryString('wfInstanceId');
        var taskId = queryString('taskId');

        $('#wfInstanceId').val(wfInstanceId);
        $('#taskId').val(taskId);

        var $flow = $('#flow');
        var $searchPayContractDetailList = $('#searchPayContractDetailList');
        var $searchResultPagination = $('#searchResultPagination');

        var $pageNum = $searchPayContractDetailList.find('input[name=page]');
        var $pageSize = $searchPayContractDetailList.find('input[name=size]');


        workflowObj.businessKey = contractPayId;
        workflowObj.processKey = processKey;
        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.taskId = taskId;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = "new";
        workflowProp.showWorkFlowAll(workflowObj);

        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'project_contract_pay', contractPayId);


        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $flow.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });

        $('#btn-save').click(function(event){
            if(event){
                event.preventDefault();
            }
            if(confirm('确定提交审批吗?')){
                saveContractPay('submit');
            }
        });
        $('#btn-draft').click(function(event){
            if(event){
                event.preventDefault();
            }
            saveContractPay('draft');
        });

        projectUtil.bindingProjectAndCity("projectId","cityId",function(){
            initAjax();
        });
        /**
         * 初始化合同付款单编辑页面
         */
        function initAjax() {
            $.ajax($.extend({
                url: apiHost+ '/hoss/contract/pay/findContractPayById.do?contractPayId=' + contractPayId + "&optionType=edit",
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        var cmApplyContract = dataObj.cmApplyContract;//合同审批主表信息
                        var cmApplyContractPay = dataObj.cmApplyContractPay;//合同付款主表信息
                        $('#cityId').val(cmApplyContractPay.cityId);
                        //$('#cityId').trigger('change', function() {
                        //    $('#projectId').val(cmApplyContractPay.projectId);
                        //    $('#projectId').attr("disabled", "disabled");
                        //});
                        $('#projectId').append('<option value="'+cmApplyContractPay.projectId+'" selected >'+dataObj.projectName+'</option>');
                        $('#projectId').attr('disabled','disabled');
                        $('#cityId').attr("disabled", "disabled");
                        $('#pay_cityId').val(cmApplyContractPay.cityId);
                        $('#pay_projectId').val(cmApplyContractPay.projectId);

                        $('#payId').val(cmApplyContractPay.id);

                        $('input[name=bankName]').val(cmApplyContractPay.bankName);
                        $('input[name=bankAccountName]').val(cmApplyContractPay.bankAccountName);
                        $('input[name=bankNo]').val(cmApplyContractPay.bankNo);
                        $('input[name=amount]').val(cmApplyContractPay.amount);
                        $('textarea[name=remark]').val(cmApplyContractPay.remark);

                        $('#daxie').text(numberUtil.parseToChinese(parseFloat(cmApplyContractPay.amount)));
                        $('#pay_applyContractId').val(cmApplyContract.id);
                        $('#pay_contractno').val(cmApplyContract.flowNo);
                        $('.pay_contract_hemc').text(cmApplyContract.contractName);
                        $('.pay_contract_fykm').text(dataObj.feeTypeName);
                        $('.pay_contract_hbbh').text(cmApplyContract.contractNo);
                        $('.pay_contract_htje').text(cmApplyContract.auditAmount);
                        var beginDate = cmApplyContract.beginDate.substring(0,10);
                        var endDate = cmApplyContract.endDate.substring(0,10)
                        $('.pay_contract_htzq').text(beginDate + '~~' + endDate);
                        $('.pay_contract_dfdw').text(cmApplyContract.otherCompany);
                        $('.pay_contract_yzfje').text(dataObj.amountPaid);
                        $('.pay_contract_bcyfk').text(dataObj.currentAmountPayable);

                        var projectFee = dataObj.cmProjectFee;
                        var subFeeTypeName = projectFee.subFeeTypeName;
                        if('undefined'!=subFeeTypeName&&null!=subFeeTypeName&&''!=subFeeTypeName){
                            $("#subFeeTypeName").html("—— "+subFeeTypeName);
                        }

                        approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), dataObj.cmProjectFee.projectId, "", dataObj.cmProjectFee.auditAmount, dataObj.sysDictionary.code);

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
        };


        /**
         * 如果选择城市则显示城市下的项目
         */
        $('#cityId').change(function(){
            $('#projectId').removeAttr("disabled");
        });

        /**
         * 选择项目后合同审批单可编辑
         */
        $('#projectId').change(function(){
            $('#pay_contractno').removeAttr("disabled");
        });

        /**
         * 大写金额转换
         */
        $("#saveContractForm").keyup(function(e){
            var targetName = e.target.name;
            if('amount' == targetName){
                var payAmount = parseFloat($('.pay_contract_bcyfk').text());
                var amount = parseFloat($('#xiaoxie').val());
                if ( amount > payAmount ) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '付款金额不能大于本次应付款金额!'
                    });
                    return false;
                }
                $('#daxie').text(numberUtil.parseToChinese(amount));
            }
            return false;
        });

        /**
         * 保存合同付款单
         * @returns {boolean}
         */
        function saveContractPay(type) {
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/pay/saveContractPay.do?flowDealType=' + type,
                data: $('#saveContractForm').serialize(),
                beforeSend: function () {
                    //使用验证框架
                    if(!$('#saveContractForm').isValid()) {
                        return false;
                    }
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '合同付款单保存成功！'
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
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
            return false;
        };

        $('select[name=applyContractId]').change(function(){
            $(this, 'option:selected').val();

            $("#houseChangeModal").modal("show");
        });

        /**
         * 获取合同详情
         */
        $('#pay_contractno').focus(function(){
            var projectId = $("#projectId option:selected").val();
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/pay/findContractList.do?projectId=' + 1,
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
                        $searchPayContractDetailList.find('tbody').html(
                            template(templateId, data)
                        );
                        // 显示分页
                        if (dataObj.totalElements) {
                            $searchResultPagination.pagination({
                                totalSize: dataObj.totalElements,
                                pageSize: parseInt($pageSize.val()),
                                visiblePages: 5,
                                info: true,
                                paginationInfoClass: 'pagination-count pull-left',
                                paginationClass: 'pagination pull-right',
                                onPageClick: function (event, index) {
                                    $pageNum.val(index - 1);
                                }
                            });
                        }
                        $searchPayContractDetailList.modal('show');
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
        });

        /**
         * 选中合同审批单
         */
        function detailEvents() {
        $('.fee_option_detail').on('click', function(){
            var applyContractId = $(this).attr("data-pid");
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/pay/findfContractApprovalById.do?applyContractId=' + applyContractId,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};
                        var dataJson = dataObj.cmApplyContract;
                        $('#pay_applyContractId').val(applyContractId);
                        $('#pay_contractno').val(dataJson.flowNo);
                        $('.pay_contract_hemc').text(dataJson.contractName);
                        $('.pay_contract_fykm').text(dataObj.feeTypeName);
                        $('.pay_contract_hbbh').text(dataJson.contractNo);
                        $('.pay_contract_htje').text(dataJson.auditAmount);
                        var beginDate = dataJson.beginDate.substring(0,10);
                        var endDate = dataJson.endDate.substring(0,10);
                        $('.pay_contract_htzq').text(beginDate + '~~' + endDate);
                        $('.pay_contract_yzfje').text(dataObj.auditAmount);
                        $('.pay_contract_dfdw').text(dataJson.otherCompany);
                        $('.pay_contract_bcyfk').text(dataObj.maxPayAmount);
                        $searchPayContractDetailList.modal('hide');
                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
            });
            return false;
        }

        $(".goback").click(function () {
            history.back();
        });
    });

});