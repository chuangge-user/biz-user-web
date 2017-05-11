define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var getQueryString = require('script/get-query-string');
    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;

    var accounting = require('accounting');
    var formatMoney = accounting.formatMoney;
        require('jqprint-util');

    var xhr = require('xhr'),
        systemMessage = require('system-message'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var $table = $(".new-apply-content table:first");


    var loadInfo = function (url, param, callback, errorStr, async) {
        $.ajax($.extend({
            url: url,
            data: param,
            async: async
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var result = data || {};

                    if (result.status === '1') {
                        callback(data);
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取相关统计出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, errorStr || '获取相关统计失败！');
            })

        return false;
    }


    $(function () {
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
        });



    });

    $(function () {

        var id = getQueryString("businessKey");
        var processKey = workflowProp.definitionConstants.BZJFK;
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
        //查看到保证金信息
        var getBailPayInfo = function(id){
            var getBailPayUrl = apiHost + "/hoss/expenses/projectDeposit/getProjectDepositDto.do";
            var param = {
                depositId : id
            };
            var getBailPayErrorStr = "查询项目保证金错误！";
            var getBailPayCallback = function(data){

                if(data.data.projectDeposit != undefined && data.data.projectDeposit != null){
                    $("#flowId").text(data.data.projectDeposit.flowNo);
                }

                $("#cityName").attr("info", data.data.cityId).text(data.data.cityName);
                $("#projectName").attr("info", data.data.projectId).text(data.data.projectName);
                $("#otherUnits").text(data.data.partnerName);
                $("#contractBailAmount").text(formatMoney(data.data.cautionMoney,''));
                $("#bankName").text(data.data.projectDeposit.bankName);
                $("#bankIdCardNo").text(data.data.projectDeposit.bankNo);
                $("#payAmount").text(formatMoney(data.data.projectDeposit.auditAmount,''));
                $("#upperPayAmount").text(accounting.formatUpperCase(data.data.projectDeposit.auditAmount));
                $("#remark").text(data.data.projectDeposit.remark);

                var fileStr = [];
                $.each(data.data.documentList, function(i, item){
                    var url = apiHost+"/hoss/sys/fileDownload/download.do?id="+item.id;

                    fileStr.push('<a href="' +
                        url +
                        '">' +
                        item.name +
                        '</a><input type="hidden" name="documentId" value="' +
                        item.objectId +
                        '">');

                })
                $('#showFile').html(fileStr.join('|'));
            }
            loadInfo(getBailPayUrl, param, getBailPayCallback, getBailPayErrorStr);
        }

        if(id != undefined && id != ""){
            getBailPayInfo(id);
        }else{
            systemMessage({
                type: 'alert',
                title: '警告！',
                detail: '没有获取到保证金付款单id'
            });
        }
    });


});