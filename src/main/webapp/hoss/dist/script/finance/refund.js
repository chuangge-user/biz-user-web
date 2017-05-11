require(['jquery', 'template','datepicker', 'date-extend'], function ($, template, datepicker, dateExtend) {

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var $datepickerGroup = $('#datepicker > input'),
        startDate,
        endDate;

    var systemMessage = require('system-message');

    $datepickerGroup.datepicker({
        autoclose: true,
        language: 'zh-CN',
        dateFormat: 'yy-mm-dd'
    });


    $datepickerGroup.first().on('changeDate', function (event) {
        startDate = event.date.valueOf();
        $datepickerGroup.last().focus();
    }).prop('placeholder', dateExtend.getPrevMonthToday());

    $datepickerGroup.last().on('changeDate', function (event) {
        endDate = event.date.valueOf();

        if (endDate && startDate && endDate < startDate ) {
            systemMessage('结束时间不能小于开始时间！');
        }
    }).prop('placeholder', dateExtend.getNextMonthToday());




    $(document).ready(function () {
        var $searchForm = $('#searchForm'),
            $status = $searchForm.find('[name=status]'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResult = $('#searchResult'),
            $page = $('#page');




        // 列表
        $searchForm.on('submit', function(){
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: location.protocol + '//' + location.host + '' + '/hoss/finance/refund/getRefundList.do',
                data: $context.serialize(),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, {
                type: 'GET',
                dataType: 'jsonp'
            }))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        var templateId = (
                            $.isArray(dataObj.content) &&
                            dataObj.content.length
                            ) ? 'searchResultTemplate' : 'messageTemplate';

                        // 显示数据
                        $searchResult.find('tbody').html(
                            template(templateId, data)
                        );

                        // 分页
//                        $page.pagination({
//                            formElem: $searchForm,
//                            totalSize: dataObj.totalElements
//                        });

                        // 确认收款
                        $searchResult.find('.btn-refund[data-toggle="confirmation"]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                refund.isConfirm = false;
                                $(element).on('click.refund', refund);
                            },
                            onHide: function (event, element) {
                                refund.isConfirm = false;
                                $(element).off('.refund');
                            },
                            onConfirm: function (event, element) {
                                refund.isConfirm = true;
                                $(element).trigger('click.refund');
                            }
                        });

                        var statusVla = $status.find('option:selected').val();

                        if (statusVla === '' || statusVla === 'refund_affirm') {
                            $searchResult.find('tfoot').show();
                        } else {
                            $searchResult.find('tfoot').hide();
                        }


                    }

                    function useless(data) {
                        systemMessage(data.detail || '获取列表数据失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

            return false;
        }).submit();

    });


});


