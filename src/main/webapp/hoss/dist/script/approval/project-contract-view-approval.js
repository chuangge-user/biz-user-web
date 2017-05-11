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
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;
    template.helper("flowStatus",flowStatus);//对template增加全局变量或方法
    var approvalUtil = require('script/approval/approval-util');

    $(function () {
        /**
         * 日期格式转换
         * @param now
         * @returns {string}
         */
        function formatDate(date)   {
            var now = new Date(date);
            var year=now.getFullYear();
            var month=now.getMonth()+1;
            var date=now.getDate();
            var hour=now.getHours();
            var minute=now.getMinutes();
            var second=now.getSeconds();
            return year+"-"+month+"-"+date;
        }



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
        var $pickapproval=$('#pick-approval'),
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
        $('#cityId').change(function(){
            var city_name = $("#cityId").find("option:selected").text();
            $('#cmApplyContract_citName').val(city_name);
        });

        projectUtil.bindingProjectAndCity("projectId","cityId", function() {
            editInit();
        });

        editInit();

        initScroll();

        function editInit() {
            $.ajax($.extend({
                url: apiHost + '/hoss/contract/findContractAuditInfo.do?applyContractId=' + applyContractId,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        $('#cmApplyContract_feeId').val(dataObj.cmApplyContract.feeId);
                        var cityId = dataObj.cmApplyContract.cityId || 1;
                        var projectId = dataObj.cmApplyContract.projectId;
                        var beginTime = dataObj.cmApplyContract.beginDate.substring(0,10);
                        var endTime = dataObj.cmApplyContract.endDate.substring(0,10);
                        var contractCycle = beginTime + "~~" + endTime;
                        dataObj.contractCycle = contractCycle;
                        if(dataObj.cmApplyContract != undefined && dataObj.cmApplyContract != null){
                            $("#flowId").text(dataObj.cmApplyContract.flowNo);
                        }
                        $('#contract_projectId').val(projectId);
                        $('#view_cittyId').text(dataObj.cityName);
                        $('#view_projectId').text(dataObj.projectName);
                        $('#cityId').val(cityId);
//                        $('#cityId').trigger('change', function() {
//
//                        });
                        $('#projectId').val(projectId);
                        $('#contractTable').find("tbody").html(
                            template('searchContractResultTemplate', data)
                        );

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
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    checkboxEvents();
                });
            return false;
        };

        /**
         * 动态计算金额
         */
        function checkboxEvents() {
            $('#daxie').text(numberUtil.parseToChinese($('#xiaoxie').text()*1));
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
