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


    var costInfoHtmlTemplate = '<script id="costInfoTemplate" type="text/html">' +
        '<tr tempAdd><th rowspan="2" class="outer-td">成本提示信息</th>' +
        '    <td>本费用预算占比：<span id="feePercent"><% if(expensesBudgetRate == 0){ %> — <% } else {%> <%= expensesBudgetRate %>&nbsp;%</span></td> <% }%>' +
        '    <th>' +
//        '       <%if(monthBudgetId) {%>' +
//        '       <a href="<%= webHost %>/app/approval/wait-apply/project-month-budget-view.html?businessKey=<%= monthBudgetId %>&wfInstanceId=<%= monthWfInstanceId %>" target="_blank">查看本月预算执行</a>' +
//        '       <%}%>' +
        '   </th>' +
        '    <td rowspan="2"><%if(firstCost != 0) {%>先投成本：<span id="beforeAmount"><%= formatMoney(firstCost,"") %></span><%}%></td>' +
        '</tr>' +
        '<tr tempAdd>' +
        '    <td>总费用预算占比：<span id="feePercent"><% if(allExpensesBudgetRate == 0){ %> — <% } else {%> <%= allExpensesBudgetRate %>&nbsp;%</span></td> <% }%>' +
        '    <th>' +
        '       <%if(allCircleBudgetId) {%>' +
        '           <a href="<%= webHost %>/app/project/budget-table.html?projectId=<%= projectId %>" target="_blank">查看全周期预算执行</a>' +
        '       <%}%>' +
        '   </th>' +
        '</tr>' +
        '</script>';
    if (!$('#costInfoTemplate').length) {
        $(costInfoHtmlTemplate).appendTo('body');
    }

    function appendHtml(afterTr, projectId, wfInstanceId, thisCost, thisCostType) {

        if (afterTr.length) {
            var paramsStr = '?projectId=' + projectId
                + '&wfInstanceId=' + wfInstanceId
                + '&expenses=' + thisCost
                + '&expensesType=' + thisCostType;
            $.ajax($.extend({
                url: apiHost + '/hoss/expenses/expensesInfo/getFeeCostInfo.do' + paramsStr
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        // 显示数据
                        if(!isEmpty(dataObj)){
//                            dataObj.expensesBudgetRate = dataObj.expensesBudgetRate.toFixed(2);
//                            dataObj.allExpensesBudgetRate = dataObj.allExpensesBudgetRate.toFixed(2);
//                            dataObj.firstCost = dataObj.firstCost.toFixed(2);
                            dataObj.expensesBudgetRate = toFixedAmount(dataObj.expensesBudgetRate);
                            dataObj.allExpensesBudgetRate = toFixedAmount(dataObj.allExpensesBudgetRate);
                            dataObj.firstCost = toFixedAmount(dataObj.firstCost);
                            var resultHtml = template('costInfoTemplate', dataObj);
                            afterTr.parents('table').find('[tempAdd]').remove();
                            $(resultHtml).insertAfter(afterTr);
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
        renderingCostInfo : appendHtml
    }

});