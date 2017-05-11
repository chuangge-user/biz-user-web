define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var $ = require('jquery');
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

    var modal = require('bootstrap/modal');

    template.helper("webHost",webHost);

    function bindingToCitySelection(id) {
        var selObj = $('#' + id);
        if (!selObj) {
            throw new Error('找不到对应Section控件');
        } else {
            selObj.html('');
            selObj.append('<option value="">请选择城市</option>');
        }
        var cityArr = getMyCity();
        for (var i = 0; i < cityArr.length; i++) {
            var city = cityArr[i];
            selObj.append('<option value="' + city.cityId + '">' + city.cityName + '</option>');
        }
    }

    function getMyCity() {
        var result = null;
        $.ajax({
            type: "get",
            async: false,
            url: apiHost + '/hoss/project/common/getMyCityDto.do',
            dataType: "jsonp",
            jsonp: "callback",
            success: function (data) {
//                console.info(data);
                result = data.data.content;
            },
            error: function () {
                //todo
            }
        });
        return result;
    }
    //城市数据加载
    bindingToCitySelection('searchCashierCitySelect');

    function domReady() {
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            $exportByCondition = $('#exportByCondition');


        require(['jquery', 'datepicker', 'date-extend'], function ($, datepicker, dateExtend) {

            var $datepickerGroup = $('#datepicker > input'),
                startDate,
                endDate;

            $datepickerGroup.datepicker({
                autoclose: true,
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd'
            });

            $datepickerGroup.first().on('changeDate', function (event) {
                startDate = event.date.valueOf();
                $datepickerGroup.last().focus();
            });

            $datepickerGroup.last().on('changeDate', function (event) {
                endDate = event.date.valueOf();

                if (endDate && startDate && endDate < startDate) {
                    systemMessage('结束时间不能小于开始时间！');
                }
            });

        });
        require(['jquery', 'datetimepicker', 'date-extend'], function ($, datetimepicker, dateExtend) {
            var $datepickerGroup = $('#datetimepicker > input');

            $datepickerGroup.datetimepicker({
                autoclose: true,
                minuteStep: 5,
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd'
            }).on('changeDate', function (event) {
//                console.log(event);
            });

        });


        // 获取项目状态管理列表
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
                url: apiHost + '/hoss/finance/cashiermanage/cashierPaymentDtoList.do',
//                data: $context.serialize(),
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
                        $searchResultList.find('tbody').html(
                            template(templateId, data)
                        );

                        // 显示分页
                        $searchResultPagination.pagination({
                            $form : $searchForm,
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


                        // 支付
                        $searchResultList.find('.adel[data-toggle=confirmation]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                toggleReturnStatus.isConfirm = false;
                                $(element).on('click.toggleUserStatus', toggleReturnStatus);
                            },
                            onHide: function (event, element) {
                                toggleReturnStatus.isConfirm = false;
                                $(element).off('.toggleUserStatus');
                            },
                            onConfirm: function (event, element) {
                                toggleReturnStatus.isConfirm = true;
                                $(element).trigger('click.toggleUserStatus');
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




        /**
         * 支付操作
         * @returns {boolean}
         */
        function toggleReturnStatus() {
            if (!toggleReturnStatus.isConfirm) {
                return false;
            }
            toggleReturnStatus.isConfirm = false;

            var $that = $(this),
                uid = $.trim($that.attr('data-id')),
                utype = $.trim($that.attr('data-type'));

            $.ajax($.extend({
                url: apiHost + '/hoss/finance/cashiermanage/updateCashierPaymentByTypeAndId.do',
                data: {
                    id:uid,
                    type:utype
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        $pageNum.val('0');
                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '确认支付出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '确认支付失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }


        //导出excel
        $exportByCondition.on('click', function () {
            var exportByConditionUrl = apiHost + '/hoss/finance/cashiermanage/exportCashierPaymentByCondition.do?' + $searchForm.serialize();
            $exportByCondition.attr('href', exportByConditionUrl);
        });
    }


    $(document).ready(domReady);



});



require(['jquery', 'datetimepicker', 'date-extend'], function ($, datetimepicker, dateExtend) {

    var $datepickerGroup = $('#datetimepicker > input');

    $datepickerGroup.datetimepicker({
        autoclose: true,
        minuteStep: 5,
        language: 'zh-CN',
        dateFormat: 'yy-mm-dd'
    }).on('changeDate', function (event) {
//        console.log(event);
    }).prop('placeholder', dateExtend.toString(new Date(), 'yyyy-mm-dd hh:ii'));

});