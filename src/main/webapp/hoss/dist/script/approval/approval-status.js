define(function (require) {
    var $ = require('jquery');
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var systemMessage = require('system-message');
    var template = require('template');
    var accounting = require('accounting');
    var getQueryString = require('script/get-query-string');
    var wfInstanceId = getQueryString('wfInstanceId');



    /**
     * 所有表单的状态初始化
     * @param statusHTML 状态 HTML
     */
    function initStatus (statusHTML) {
        var $statusContainer = $('#status-container')
        if (wfInstanceId) {

            $.ajax($.extend({
                url: apiHost + '/hoss/workflow/getWorkFlowStatus.do',
                data: {wfInstanceId: wfInstanceId}
            }, jsonp))
                .done(function (data) {
//                    $statusContainer.html('<span>审批状态：</span><span>' + statusHTML[data.data] + '</span>');
                    $('<span>' + statusHTML[data.data] + '</span>').insertAfter($statusContainer);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取单据状态失败！');
                })
        }
    }


    return {
        initStatus:initStatus
    }

});