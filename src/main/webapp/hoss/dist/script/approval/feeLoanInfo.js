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
    var formatMoney = accounting.formatMoney;
    template.helper("webHost", webHost);
    template.helper("formatMoney",formatMoney);


    var feeLoanTemplate = '<script id="feeLoanTemplate" type="text/html">' +
        '<tr tempAddFeeLoan><th>借款金额（元）</th>' +
        '    <td><%= formatMoney(loanAmount,"") %></td>' +
        '    <th>已核销金额（元）</th>' +
        '    <td><%= formatMoney(cancelSuccessAmount,"") %></td>' +
        '</tr>' +
        '<tr tempAddFeeLoan><th>本次核销金额（元）</th>' +
        '    <td><%= formatMoney(cancelAmountFixed,"") %><input type="hidden" name="projectRepay.cancelAmount" value="<%= cancelAmount %>"/></td>' +
        '    <th><bold>支付金额（元）</bold></th>' +
        '    <td><%= formatMoney(loanPayAmountFixed,"") %><input type="hidden" name="projectRepay.loanPayAmount" value="<%= loanPayAmount %>"/></td>' +
        '</tr>' +
        '</script>';
    if (!$('#feeLoanTemplate').length) {
        $(feeLoanTemplate).appendTo('body');
    }

    function appendFeeLoanInfo(afterTr, repayId, feeId, repayAmount) {
        if(isEmpty(feeId)){
            feeId = '';
        }
        if(isEmpty(repayId)){
            repayId = '';
        }
        if (afterTr.length) {
            var paramsStr = '?repayId=' + repayId
                + '&feeId=' + feeId
                + '&repayAmount=' + repayAmount;
            $.ajax($.extend({
                url: apiHost + '/hoss/expenses/projectRepay/findByRepayIdOrFeeIdAndRepayAmount.do' + paramsStr
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        // 显示数据
                        if(!isEmpty(dataObj)){
                            dataObj.loanAmount = toFixedAmount(dataObj.loanAmount);
//                            dataObj.loanPayAmount = toFixedAmount(dataObj.loanPayAmount);
                            dataObj.loanPayAmountFixed = toFixedAmount(dataObj.loanPayAmount);
                            dataObj.cancelAmountFixed = toFixedAmount(dataObj.cancelAmount);
//                            dataObj.cancelAmount = toFixedAmount(dataObj.cancelAmount);
                            dataObj.cancelSuccessAmount = toFixedAmount(dataObj.cancelSuccessAmount);
                            var resultHtml = template('feeLoanTemplate', dataObj);
                            afterTr.parents('table').find('[tempAddFeeLoan]').remove();
                            $(resultHtml).insertAfter(afterTr);
                        }
                    }
                    function useless(data) {
                        afterTr.parents('table').find('[tempAddFeeLoan]').remove();
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                });
        }
    }

    /**
     *
     * @param v 需要判断的值
     * @param allowBlank 是否可以为空串 true  当是“”时返回false不为空
     * @returns {boolean|*}
     */
    function isEmpty(v, allowBlank) {
        return v === null || v === undefined || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    }

    function toFixedAmount(amount){
        if(amount!=0){
            return amount.toFixed(2);
        }else{
            return amount;
        }
    }

    return {
        appendFeeLoanInfo : appendFeeLoanInfo
    }

});