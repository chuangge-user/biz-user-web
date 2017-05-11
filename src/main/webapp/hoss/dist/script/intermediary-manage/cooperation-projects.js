
/**
 * �н������Ŀ
 */
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

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');


    var queryString = require("get-query-string"),
        intermediaryId = queryString("intermediaryId");

    function domReady(){
        // Tab 栏 项目ID
        $('.yw2').find('a').each(function(i, a){
            $(a).attr('href', $(a).attr('href') + '?intermediaryId=' + intermediaryId);
        });
        // 项目ID 这里设置表单那里就不用设置了
        $('input[name=orgId]').val(intermediaryId);



        // 统计信息
        var getIntermediaryReportCode = '/hoss/partner/getIntermediaryReportByIntermediaryId.do',
            reportParams = {intermediaryId:intermediaryId},
            $informationTitle = $('#informationTitle'),
            informationTitleTemplate = 'informationTitleTemplate'

        $.ajax($.extend({
            url: apiHost + getIntermediaryReportCode,
            data: reportParams,
            beforeSend: function () {}
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    $informationTitle.html(
                        template(informationTitleTemplate, data)
                    );

                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取统计信息失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            });


        // 合作项目列表
        var getProjectListCode = '/hoss/orgProject/getProjectList.do',
            $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';

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

            $.ajax($.extend({
                url: apiHost + getProjectListCode,
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchResultTemplate :
                                messageTemplate;

                        // 显示数据
                        $searchResultList.html(
                            template(templateId, data)
                        ).find('a').each(function(i, a){
                                var $a = $(a);
                                $a.attr('href', $a.attr('href') + '&ORG_ID=' + intermediaryId)
                            });

                        // 显示分页
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
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');


    }

    $(document).ready(domReady);
});
