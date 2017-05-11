define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    var $ = require('jquery');
    var fileupload = require('fileupload');
    var accounting =  require('accounting');
    var systemMessage = require('system-message');
    var queryString = require("get-query-string");
    require('datepicker');
    require('jqprint-util');

    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var workflowObj = workflowProp.workflowObj;
    var isEmpty = workflowProp.isEmpty;

    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');


    var $table = $(".new-apply-content table:first");

    var projectUtil = require("script/project/project-util");

    function domReady() {
        initScroll();
        var refundApplyId = queryString('businessKey');
        var wfInstanceId = queryString('wfInstanceId');
        var taskId = queryString('taskId');
        var businessKey = getLocationParam("businessKey");//业务主键ID
        var processKey = workflowProp.definitionConstants.TKSQ;

        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowProp.showWorkFlowAll(workflowObj);

        var $flow = $('#flow');

        var $newApplyBox = $('.new-apply-box'),
            $newApplyType = $newApplyBox.find('.new-apply-type'),
            $newApplyDetail = $newApplyBox.find('.new-apply-detail');

        $newApplyType.on('click', function () {
            var $context = $(this),
                index = $newApplyType.index(this);
            $newApplyDetail.eq(index).slideToggle();
        });

        //上传附件end
//        projectUtil.bindingProjectAndCity('projectSelect', 'citySelect',initViewRefundApply);
        initViewRefundApply();

        /**
         * 审批同意
         */
        $('.btn-success').on('click', function(){

            if(!confirm('确定同意吗?')){
                return false;
            }
            $.ajax($.extend({
                url: apiHost+'/hoss/refund/approvalRefundApply.do?flowDealType=' + 'submit',
                data: {
                    wfInstanceId : wfInstanceId,
                    taskId : taskId,
                    processKey: processKey,
                    businessKey : businessKey,
                    content : $('#content').val(),
                    refundApplyId : refundApplyId
                },
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '操作失败！'
                        });
                    }
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '退款申请单审批成功！'
                        });
                        location.href=document.referrer;
                    }
                    doneCallback.call(this, data,useful,useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                });
            return false;
        });

        function initViewRefundApply() {
            $.ajax($.extend({
                url: apiHost+'/hoss/refund/findRefundRecordListById.do?refundApplyId=' + refundApplyId,
                beforeSend: function () {
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};
                        var applyAmount = 0;
                        var refundApply = dataObj.cmProjectRefundApply;
                        $.each(data.data.refundRecordDtoList, function(i, item){
                            applyAmount += item.amount;
                        });
                        $("#citySelect").html(dataObj.cityName);
                        $("#projectSelect").html(dataObj.projectName);
                        var upperApplyAmount = accounting.formatUpperCase(applyAmount);

                        data.applyAmount = applyAmount;
                        data.upperApplyAmount = upperApplyAmount;

                        if(refundApply != undefined && refundApply != null){
                            $("#flowId").text(refundApply.flowNo);
                        }

                        $(".countRefundInfo").remove();
                        $("#addFileTr").remove();
                        $(".file-upload").remove();
                        $table.find("tbody").append(template("searchResultTemplate", data));
                        var documentList = dataObj.documentList;
                        var fileStr = [];
                        $.each(documentList,function(i,item){
                            var url = apiHost+"/hoss/sys/fileDownload/download.do?id="+item.id;
                            fileStr.push("<a href='"+url+"'>"+item.name+"</a>");
                        });
                        $("#showFile").html(fileStr.join('|'));
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


        function initScroll(){
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
                location.href=document.referrer;
            });
        }
    }

    $(document).ready(domReady);
});