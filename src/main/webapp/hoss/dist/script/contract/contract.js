/**
 * 中介客户管理
 */
define(function (require) {

    //console.log(require('hoss'));

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;


    //console.log(apiHost);

    require(['jquery', 'datepicker', 'dist/script/bootstrap.min', 'dist/script/bootstrap-select']);


    var navigation = require('navigation');

    //console.log(navigation);

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;


    //console.log(doneCallback);

    var template = require('template');

    //console.log(template);

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');
    var dateStr = require('date-extend');

    //console.log(dateStr.getToday());

    var queryString = require('get-query-string'), // 读取 URL 附加参数
        appendParams = {},
        appendParamsStr;
    $.each({
        TYPE:queryString('TYPE'),
        ORG_ID:queryString('ORG_ID'),
        EMPLOY_ID:queryString('EMPLOY_ID'),
        CORPORATION_STATUS:queryString('CORPORATION_STATUS'),
        EMPLOY_NAME:queryString('EMPLOY_NAME'),
        projectId:queryString('projectId'),
        PROJECT_STATUS:queryString('PROJECT_STATUS'),
        shopId:queryString('shopId')
    }, function(key, value){ // 清理空参
        if (value) {
            appendParams[key] = value;
        }
    });
    appendParamsStr = $.param(appendParams) + '&';



    var startTime = queryString('startTime'),
        endTime = queryString('endTime');


    function domReady() {

        $('.selectpicker').selectpicker({
            'selectedText': 'cat'
        });
        $('input[name=startDate]').attr("value", dateStr.getToday());

        if (startTime){ // 本周数据、 本月数据 跳转附带 日期参数

            $('input[name=startTime]').val(startTime);
            $('input[name=endTime]').val(endTime);
        }

        var $datepickerGroup = $('#datepicker > input'),
            startDate;
        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            queryClientRecordListCode = '/hoss/clientcontrol/queryClientRecordList.do';

        // 获取直客专员管理列表
        $searchForm.on('submit', function (event) {
            //console.log(event);
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


            // 设置多选的值
            var selectVal= $('#id_select').val();
            $('input[name=basicStatus]').val(selectVal&&selectVal.join(','));


            console.log(apiHost + queryClientRecordListCode);
            console.log(appendParamsStr + clearEmptyValue($context));

            $.ajax($.extend({
                url: apiHost + queryClientRecordListCode,
                data:appendParamsStr + clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        console.log(data);
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.clientList.content) && dataObj.clientList.content.length) ?
                                searchResultTemplate :
                                messageTemplate;

                        // 显示数据
                        $searchResultList.find('tbody').html(
                            template(templateId, data)
                        ).find('[status]').click(statusClick);

                        // 显示分页
                        $searchResultPagination.pagination({
                            $form: $context,
                            totalSize: dataObj.clientList.totalElements,
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


        // 查看客户详情
        var getStatusCode = '/hoss/clientcontrol/getCustomerStatus.do',
            statusTemplate = 'statusTemplate'
        function statusClick(e){

            var $target = $(e.currentTarget),
                $tr = $target.parents('tr'),
                $next = $tr.next(),
                followId = $target.attr('followId');

            if ($next.attr('status')) { // 已经打开过了, 关闭
                $next.remove();
                return;
            }

            $.ajax($.extend({
                url: apiHost + getStatusCode,
                data: {followId:followId},
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};


                        $searchResultList.find('tr[status=true]').remove(); // 打开之前先关闭
                        $('<tr status="true"></tr>').insertAfter($tr).html(
                            template(statusTemplate, data)
                        );

                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取客户进度失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取客户进度失败！');
                })


        }


    }

    $(document).ready(domReady);




});