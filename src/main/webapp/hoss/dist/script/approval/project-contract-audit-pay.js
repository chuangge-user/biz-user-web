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
    require('jqprint-util');

    var fileUtil = require('script/file-operation-util');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var $modal = require('bootstrap/modal');
    var numberUtil = require('script/approval/number-util');
    var projectUtil = require('script/project/project-util');
    var queryString = require("get-query-string");
    var systemMessage = require('system-message');

    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var workflowObj = workflowProp.workflowObj;

    var approvalUtil = require('script/approval/approval-util');

    $(function () {
        projectUtil.bindingProjectAndCity("projectId","cityId");
        var processKey = workflowProp.definitionConstants.XMFK;
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

        var contractPayId = queryString('businessKey');

        var applyContractId = null;
        var wfInstanceId = queryString('wfInstanceId');
        var taskId = queryString('taskId');

        $('#wfInstanceId').val(wfInstanceId);
        $('#taskId').val(taskId);

        var $flow = $('#flow');
        var $searchPayContractDetailList = $('#searchPayContractDetailList');
        var $searchResultPagination = $('#searchResultPagination');

        var $pageNum = $searchPayContractDetailList.find('input[name=page]');
        var $pageSize = $searchPayContractDetailList.find('input[name=size]');

        fileUtil.appendFileViewTable($('#fileViewTable'), 'project_contract_pay', businessKey);


        $(".toTab").click(function () {
            $("html, body").animate({
                scrollTop: $flow.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });

        $('#submit').click(function(){
            if(confirm('确定同意吗?')){
                saveContractPay('submit');
            }
        });
        $('#btn-draft').click(function(){
            saveContractPay('draft');
        });


        /**
         * 初始化合同付款单编辑页面
         */
        initAjax();
        function initAjax() {
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/pay/findContractPayById.do?contractPayId=' + contractPayId +"&optionType=audit",
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};
                        var cmApplyContract = dataObj.cmApplyContract;//合同审批主表信息
                        var cmApplyContractPay = dataObj.cmApplyContractPay;//合同付款主表信息

                        if(cmApplyContractPay != undefined && cmApplyContractPay != null){
                            $("#flowId").text(dataObj.fkNo ||dataObj.flowNo);
                        }
                        $('.pay_contract_cityId').text(cmApplyContractPay.cityName);
                        $('.pay_contract_flowNo').html("<a href='project-contract-view-approval.html?businessKey="+cmApplyContract.id+"&wfInstanceId="+cmApplyContract.wfInstanceId+"'>"+cmApplyContract.flowNo+"</a>");
                        $('.pay_contract_bankAccountName').text(cmApplyContractPay.bankAccountName);
                        $('.pay_contract_bankNo').text(cmApplyContractPay.bankNo);
                        $('.pay_contract_remark').text(cmApplyContractPay.remark);
                        $('.pay_contract_projectId').text(dataObj.projectName);
                        $('.pay_contract_bankName').text(cmApplyContractPay.bankName);

                        $('#payId').val(cmApplyContractPay.id);

                        $("#projectId option[value="+cmApplyContractPay.projectId+"]").attr("selected", "selected");
                        $("#bankCityId option[value="+cmApplyContractPay.bankCityId+"]").attr("selected", "selected");
                        $('#xiaoxie').val(cmApplyContractPay.amount);

                        $('#daxie').text(numberUtil.parseToChinese(parseFloat(cmApplyContractPay.amount)));
                        $('#pay_applyContractId').val(cmApplyContract.id);
                        applyContractId = cmApplyContract.id;
                        $('#pay_contractno').val(cmApplyContract.flowNo)
                        $('.pay_contract_hemc').text(cmApplyContract.contractName);
                        $('.pay_contract_fykm').text(dataObj.feeTypeName);
                        $('.pay_contract_hbbh').text(cmApplyContract.contractNo);
                        $('.pay_contract_htje').text(cmApplyContract.auditAmount);
                        var beginDate = cmApplyContract.beginDate.substring(0,10);
                        var endDate = cmApplyContract.endDate.substring(0,10);
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
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }
                    doneCallback.call(this, data, useless);
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
            if('cmApplyContractPay.amount' == targetName){
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
                url: apiHost + '/hoss/contract/pay/approvalContractPayApply.do?flowDealType=' + type + '&applyContractId=' + applyContractId,
                data: $('#saveContractForm').serialize(),
                beforeSend: function () {
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
                url: apiHost + '/hoss/contract/pay/findContractList.do?projectId=' + projectId,
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
                url: apiHost+ '/hoss/contract/pay/findfContractApprovalById.do?applyContractId=' + applyContractId,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};
                        var dataJson = dataObj.cmApplyContract;
                        $('#pay_applyContractId').val(applyContractId);
                        $('#pay_contractno').val(dataJson.flowNo)
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