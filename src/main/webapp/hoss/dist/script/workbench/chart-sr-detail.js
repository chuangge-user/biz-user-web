define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    require('datepicker');

    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var $modal = require('bootstrap/modal');
    var projectUtil = require("script/project/project-util");

    var queryString = require("get-query-string");
    var $projectId = null;
    var $cityId = null;

    var proInfoList = projectUtil.appendProjectSelectUtil('project_bench_detail', function (proInfo) {
        $projectId = proInfo.id;
        $cityId = proInfo.cityId;

        setTimeout(function(){
            $('#searchForm').trigger("submit");
        },100);

    });

    $(document).ready(function () {
        var $channelName = queryString("channelName");
        $("#channelType option[value="+$channelName+"]").attr("selected", "selected");
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]');

        var $submit = $searchForm.find('input[type=submit]'),
            $disabled = $searchForm.find('[disabled]'),
            action = $searchForm.attr("action");

        var  $searchResultPagination = $('#searchResultPagination');


        $('#dateType-option').change(function(){
            if('custom' == $(this).val()) {
                var html = '<span class="" id="endSpan">至</span>'
                           + '<input id="endInput" name="endTime" class="form-control input-w5">';
                $('#datepicker').append(html);
                var $datepickerGroup = $('#datepicker > input'),
                    startDate;

                $datepickerGroup.datepicker({
                    autoclose: true,
                    language: 'zh-CN',
                    dateFormat: 'yy-mm-dd'
                });
            } else {
                $('#endSpan').remove();
                $('#endInput').remove();
            }
        });

        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');
            $('input[name=projectId]').val($projectId);
            $.ajax($.extend({
                url: apiHost + '/hoss/bench/findIncomeGroupList.do',
                data : clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful (data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                'searchResultTemplate':
                                'messageTemplate';
                        /**团购协议费*/
                        var groupTotal = 0.00;
                        /**累计收款*/
                        var actualGroupbuyTotal = 0.00;
                        /**净收款*/
                        var receivablesTotal = 0.00;
                        /**退款*/
                        var refundAmountTotal = 0.00;
                        /**未审核收款*/
                        var noApprovedTotal = 0.00;
                        /**已审核收款*/
                        var saleApprovedTotal = 0.00;

                        $.each(dataObj.content, function(item, i){
                            groupTotal += i.groupAmount;
                            actualGroupbuyTotal += i.actualGroupbuyAmount || 0;
                            receivablesTotal += i.receivables || 0;
                            refundAmountTotal += i.refundAmount || 0;
                            if ('buy_make' == i.accountStatus) {
                                saleApprovedTotal += i.actualGroupbuyAmount || 0;
                            } else {
                                noApprovedTotal += i.groupAmount || 0;
                            }
                        });
                        receivablesTotal = actualGroupbuyTotal - refundAmountTotal || 0;
                        dataObj.groupTotal = groupTotal;
                        dataObj.actualGroupbuyTotal = actualGroupbuyTotal;
                        dataObj.receivablesTotal = receivablesTotal;
                        dataObj.refundAmountTotal = refundAmountTotal;
                        dataObj.noApprovedTotal = noApprovedTotal;
                        dataObj.saleApprovedTotal = saleApprovedTotal;

                        // 显示数据
                        $('#searchList').find('tbody').html(
                            template(templateId, data)
                        );
                        // 显示分页
                        if (dataObj.totalElements) {
                            $searchResultPagination.pagination({
                                $form: $context,
                                totalSize: dataObj.totalElements,
                                pageSize: parseInt($pageSize.val()),
                                visiblePages: 5,
                                info: true,
                                paginationInfoClass: 'pagination-count pull-left',
                                paginationClass: 'pagination pull-right',
                                onPageClick: function (event, index) {
                                    $pageNum.val(index - 1);
                                    $context.trigger('submit');
                                }
                            });
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
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');
        return false;
    });
});

require(['jquery', 'datepicker', 'date-extend'], function ($, datepicker, dateExtend) {

    var $datepickerGroup = $('#datepicker > input'),
        startDate;

    $datepickerGroup.datepicker({
        autoclose: true,
        language: 'zh-CN',
        dateFormat: 'yy-mm-dd'
    });

    $datepickerGroup.first().on('changeDate', function (event) {
        startDate = event.date.valueOf();
        $datepickerGroup.last().focus();
    }).prop('placeholder', dateExtend.getPrevMonthToday());

});

