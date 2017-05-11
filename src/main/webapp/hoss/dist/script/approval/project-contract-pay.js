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
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.XMFK;

    var businessKey = queryString('businessKey');
    var applyContractId = queryString("applyContractId");
    var wfInstanceId = queryString('wfInstanceId');
    var taskId = queryString('taskId');
    var isEdit=queryString('isEdit');

    var approvalUtil = require('script/approval/approval-util');

    $(function () {
        var $flow = $('#flow');
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

        fileOperationUtil.appendFileUploadTable($('#fileUploadTable'), 'project_contract_pay', businessKey);

        workflowObj.businessKey = businessKey;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = "new";
        workflowObj.projectId = "projectId";
        workflowObj.cityId = "cityId";
        workflowProp.showWorkFlowAll(workflowObj);
        projectUtil.bindingProjectAndCity("projectId","cityId", function(){
            /**如果是转付款*/
            if (applyContractId) {
                toContractPay();
            }
        });

        var $searchPayContractDetailList = $('#searchPayContractDetailList');
        var $searchResultPagination = $('#searchResultPagination');

        var $pageNum = $searchPayContractDetailList.find('input[name=page]');
        var $pageSize = $searchPayContractDetailList.find('input[name=size]');
        var $searchPayContractForm = $searchPayContractDetailList.find('#searchPayContractForm');


            function toContractPay() {
                $.ajax($.extend({
                    url: apiHost + '/hoss/contract/pay/findContractPaytoContract.do?applyContractPayId=' + applyContractId,
                    beforeSend: function () {
                    }
                }, jsonp))
                    .done(function (data) {
                        function useful(data) {
                            var dataObj = data.data || {};
                            var dataJson = dataObj.cmApplyContract;
                            $('#cityId').val(dataJson.cityId);

                            $('#cityId').trigger('change', function() {
                                $('#projectId').val(dataJson.projectId);
                                $('#projectId').attr("disabled", "disabled");
                            });
                            $('#pay_cityId').val(dataJson.cityId);
                            $('#pay_projectId').val(dataJson.projectId);
                            $('#cityId').attr("disabled", "disabled");

                            $('#pay_applyContractId').val(applyContractId);
                            $('#pay_contractno').val(dataJson.flowNo)
                            $('.pay_contract_hemc').text(dataJson.contractName);
                            $('.pay_contract_fykm').text(dataObj.feeTypeName);
                            $('.pay_contract_hbbh').text(dataJson.contractNo);
                            $('.pay_contract_htje').text(dataJson.auditAmount);
                            var beginDate = dataJson.beginDate.substring(0,10);
                            var endDate = dataJson.endDate.substring(0,10);
                            $('.pay_contract_htzq').text(beginDate + '~~' +  endDate);
                            $('.pay_contract_yzfje').text(dataObj.auditAmount);
                            $('.pay_contract_dfdw').text(dataJson.otherCompany);
                            $('.pay_contract_bcyfk').text(dataObj.maxPayAmount);
                            $searchPayContractDetailList.modal('hide');

                            var projectFee = dataObj.cmProjectFee;
                            var subFeeTypeName = projectFee.subFeeTypeName;
                            if('undefined'!=subFeeTypeName&&null!=subFeeTypeName&&''!=subFeeTypeName){
                                $("#subFeeTypeName").html("—— "+subFeeTypeName);
                            }

                            setTimeout(function(){
                                workflowObj.conditionMap.feeId = projectFee.id+"";
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
                    });
            }

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
         * 设置小写金额
         */
        function setCurrentAmountPayable() {
            //本次最多可付款金额
            $('.pay_contract_bcyfk').text();
            $('#pay_currentAmountPayable').val(parseFloat($('#xiaoxie').val()));
        }

        /**
         * 保存合同付款单
         * @returns {boolean}
         */
        function saveContractPay(type) {
            setCurrentAmountPayable();
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/pay/saveContractPay.do?flowDealType=' + type,
                data: $('#saveContractForm').serialize(),
                beforeSend: function () {
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
        $('#pay_contractno').focus(contractListDetail);

        function contractListDetail(){
            var projectId = $("#projectId option:selected").val();
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/pay/findContractList.do?projectId=' + projectId,
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
                        $searchPayContractDetailList.find('tbody').html(
                            template(templateId, data)
                        );
                        // 显示分页
                        if (dataObj.totalElements) {
                            $searchResultPagination.pagination({
                                $form: $searchPayContractForm,
                                totalSize: dataObj.totalElements,
                                pageSize: parseInt($pageSize.val()),
                                visiblePages: 5,
                                info: true,
                                paginationInfoClass: 'pagination-count pull-left',
                                paginationClass: 'pagination pull-right',
                                onPageClick: function (event, index) {
                                    $pageNum.val(index - 1);
                                    contractListDetail();
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
        }

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
                    function useful(data) {
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
                        $('.pay_contract_htzq').text(beginDate + '~~' +  endDate);
                        $('.pay_contract_yzfje').text(dataObj.auditAmount);
                        $('.pay_contract_dfdw').text(dataJson.otherCompany);
                        $('.pay_contract_bcyfk').text(dataObj.maxPayAmount);
                        $searchPayContractDetailList.modal('hide');

                        var projectFee = dataObj.cmProjectFee;
                        var subFeeTypeName = projectFee.subFeeTypeName;
                        if('undefined'!=subFeeTypeName&&null!=subFeeTypeName&&''!=subFeeTypeName){
                            $("#subFeeTypeName").html("—— "+subFeeTypeName);
                        }

                        workflowObj.conditionMap.feeId = projectFee.id+"";
                        workflowProp.findAuditUsers(workflowObj);


                        approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), dataObj.cmProjectFee.projectId, "", dataObj.cmProjectFee.auditAmount, dataObj.sysDictionary.code);
                    }
                    function useless(data) {
                        $searchPayContractDetailList.modal('hide');
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
            });
            return false;
        }

        $(".goback").click(function () {
            history.back();
        });
    });

});