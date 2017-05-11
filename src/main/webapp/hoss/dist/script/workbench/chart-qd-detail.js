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
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $channelType = queryString("channelName"),
            $projectId = queryString("projectId"),
            dealCount = queryString("dealCount"),
            haowuCount = queryString("haowuCount"),
            percentageRatio = queryString("percentageRatio"),
            $pageSize = $searchForm.find('input[name=size]');

        var $submit = $searchForm.find('input[type=submit]'),
            $disabled = $searchForm.find('[disabled]'),
            action = $searchForm.attr("action");

        $("#channelType option[value="+$channelType+"]").attr("selected", "selected");

        var  $searchResultPagination = $('#searchResultPagination');

        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');
                $('input[name=projectId]').val($projectId);
            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/bench/findIncomeGroupList.do',
                data : clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {

                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                'searchResultTemplate' :
                                'messageTemplate';

                        data.data.dealCount = dealCount + '套' ;
                        data.data.haowuCount = haowuCount + '套';
                        data.data.percentageRatio = percentageRatio + '%';

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

//    $datepickerGroup.last().on('changeDate', function (event) {
//        endDate = event.date.valueOf();
//
//        if (endDate && startDate && endDate < startDate ) {
//            alert('结束时间不能小于开始时间！');
//        }
//    }).prop('placeholder', dateExtend.getNextMonthToday());


});

