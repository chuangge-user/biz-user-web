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


    $(document).ready(function () {
        var $channelType = queryString("channelType");
        var $projectId = queryString("projectId");
        var $searchForm = $('#searchForm');
        var $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]');

        var $submit = $searchForm.find('input[type=submit]'),
            $disabled = $searchForm.find('[disabled]'),
            action = $searchForm.attr("action");

        var  $searchResultPagination = $('#searchResultPagination');

        /**
         * 提交查询
         */
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                $name = $context.find('input[name=name]').val(),
                $channelType = $context.find('#accountInfo option:selected').val(),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/bench/findChanneCommissionByChannelName.do?projectId=' + $projectId + "&channelType=" + $channelType + "&name=" + $name ,
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {},

                        templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                            'searchResultTemplate': 'messageTemplate';
                        var payableAmount = 0;
                        var haveTopPayAmount = 0;
                        //应付金额、已支付金额统计
                        $.each(dataObj.content, function(item, i){
                            payableAmount += i.unpaid;
                            haveTopPayAmount += i.paid;
                        });
                        data.data.channelType = $channelType;
                        data.data.payableAmount = payableAmount;
                        data.data.haveTopPayAmount = haveTopPayAmount;

                        // 显示数据
                        $('#suggestion').find('tbody').html(
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

                        if(templateId != 'messageTemplate') {
                            findCompanyCommissionAmount();
                        }
                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
            return false;
        }).trigger('submit');


        function findCompanyCommissionAmount() {
            $.ajax($.extend({
                url: apiHost + '/hoss/bench/findCompanyCommissionAmount.do?projectId=' + $projectId,
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {};

                        $('#dyncAmount').append("<tr><td colspan='4'> 公司直客部佣金："+dataObj.companySocialAmount+"(元)，公司经纪部团队佣金："+dataObj.companyIntermediaryAmount+"(元) </td></tr>");

                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
        }
    });
});

