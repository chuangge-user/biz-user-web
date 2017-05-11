/**
 * 项目日报收款
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



    require(['jquery', 'select-checkbox'], function ($, selectCheckbox) {
        var $select = $('#select'),
            $inverseSelect = $('#inverseSelect');

        $select.selectCheckbox({
            type: 'toggle',
            selector: '#selectGroup > [type=checkbox]'
        });
        $inverseSelect.selectCheckbox({
            type: 'inverse',
            selector: '#selectGroup > [type=checkbox]'
        });
    });








    function domReady() {

        $('input[name=startDate]').attr("value", dateStr.getToday());
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
            $leadingOut=$("#leadingOut"),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';

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
                url: apiHost + '/hoss/finance/invoice/getInvoiceList.do',
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



                        // 确认开票
                        $searchResultList.find('.btn-end[data-toggle=confirmation]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                toggleInvoiceStatus.isConfirm = false;
                                $(element).on('click.toggleInvoiceStatus', toggleInvoiceStatus);
                            },
                            onHide: function (event, element) {
                                toggleInvoiceStatus.isConfirm = false;
                                $(element).off('.toggleInvoiceStatus');
                            },
                            onConfirm: function (event, element) {
                                toggleInvoiceStatus.isConfirm = true;
                                $(element).trigger('click.toggleInvoiceStatus');
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


        var $pageContent = $('.page-content');

        // 返回搜索结果列表
        $pageContent.on('click', '.btn-back-list', function (event) {
            if (event) {
                event.preventDefault();
            }

            $pageContent.addClass('hide');
            $searchListContent.removeClass('hide');

//            console.log('back-list');
        });


        //导出excel
        $leadingOut.on('click', function () {
            var leadingOuturl = apiHost + '/hoss/finance/invoice/leadingOut.do?' + $searchForm.serialize();
            $leadingOut.attr('href', leadingOuturl);
        });



        /**
         * 执行确认开票
         * @returns {boolean}
         */
        function toggleInvoiceStatus() {
            if (!toggleInvoiceStatus.isConfirm) {
                return false;
            }
            toggleInvoiceStatus.isConfirm = false;

            var $that = $(this),
                $NOinput = $that.parent().parent().find("input[name='invoiceCode']"),
                ucode = $NOinput.length == 0 ? null : $NOinput[0].value,
                uid = $.trim($that.attr('data-id')),
                url;


            if(uid==null||uid==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: "请选择要操作的记录" || '确认开票出错！'
                });
                return false;
            }

            if($that.text() == '申请开票'){
                url = apiHost + '/hoss/finance/invoice/updateInvoicedForNoApply.do';
            }else{
                url = apiHost + '/hoss/finance/invoice/updateInvoiced.do';
            }

            $.ajax($.extend({
                url: url,
                data: {
                    ids:uid,
                    invoiceCode: ucode
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
                            detail: data.detail || '确认开票出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新开票状态失败！');
                }).
                always(function () {
                    $selectedCheckbox.attr('data-id',"");
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }






        // 指量确认
        $searchResultList.find('.btn-invoiced[data-toggle="confirmation"]').confirmation({
            btnOkLabel: '确认',
            btnCancelLabel: '取消',
            onShow: function (event, element) {
                toggleInvoiceStatus.isConfirm = false;
                $(element).on('click.batchReceivables', toggleInvoiceStatus);
            },
            onHide: function (event, element) {
                toggleInvoiceStatus.isConfirm = false;
                $(element).off('.batchReceivables');
            },
            onConfirm: function (event, element) {
                toggleInvoiceStatus.isConfirm = true;
                $(element).trigger('click.batchReceivables');
            }
        });




        // 全选、返选
        var $selectedCheckbox = $('#selectedCheckbox'),
            $selectAll = $('#selectAll');

        $selectAll.attr('checked', false);


        $searchResultList.on('click', '#selectAll', function () {
            var $context = $(this),
                $checkbox = $searchResultList.find('tbody [type=checkbox]'),
                ids = [];

            $checkbox.prop("checked", $context.prop("checked"));

            if ($context.prop("checked")) {
                $.each($checkbox, function (i, n) {
                    ids.push(n.value);
                });
            }

            $selectedCheckbox.attr('data-id', ids.join(','));
        });

        // 取消一条或多条
        $searchResultList.on('click', 'tbody [type=checkbox]', function () {
            var $checkbox = $searchResultList.find('tbody [type=checkbox]'),
                ids = [];

            $.each($checkbox, function (i, n) {
                if ($(n).prop('checked')) {
                    ids.push(n.value);
                } else {
                    $selectAll.removeAttr('checked');
                }
            });

            $selectedCheckbox.attr('data-id', ids.join(','));
        });

        $selectedCheckbox.on('click', function () {
            var $context = $(this),
                ids = $context.attr('data-id');

            if (!ids) {
                return false;
            }

            return false;
        });


    }

    $(document).ready(domReady);



});
