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
                url: apiHost + '/hoss/finance/payment/getPaymentList.do',
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


                        // 确认收款
                        $searchResultList.find('.btn-end[data-toggle=confirmation]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                toPaymentStatus.isConfirm = false;
                                $(element).on('click.toggleUserStatus', toPaymentStatus);
                            },
                            onHide: function (event, element) {
                                toPaymentStatus.isConfirm = false;
                                $(element).off('.toggleUserStatus');
                            },
                            onConfirm: function (event, element) {
                                toPaymentStatus.isConfirm = true;
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


        // 更新查询条件时，页码返回第一页
        $searchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });


        //导出excel
        $leadingOut.on('click', function () {
            var leadingOuturl = apiHost + '/hoss/finance/payment/leadingOut.do?' + $searchForm.serialize();
            $leadingOut.attr('href', leadingOuturl);
        });



        /**
         * 执行确认收款
         * @returns {boolean}
         */
        function toPaymentStatus() {
            if (!toPaymentStatus.isConfirm) {
                return false;
            }
            toPaymentStatus.isConfirm = false;

            var $that = $(this),
                uid = $.trim($that.attr('data-id'));

            $.ajax($.extend({
                url: apiHost + '/hoss/finance/payment/updatestatus.do',
                data: {
                    ids:uid
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        //$pageNum.val('0');
                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '确认收款出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新收款状态失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }



        $searchResultList.on("click", ".btn-edit", function(){

            //eidtId传递到form表单中
            $("input[name=editId]").val($(this).attr("data-id"));
            $("input[name=editedAmount]").val($(this).attr("data-amount"));

            //弹出框弹出
            $("#editAmount").modal({
                show: true
            });
        });


        //修改金额弹出框ajax请求事件
        $("#editBtn").click(function () {

            var uid = $("input[name=editId]").val();
            var editedAmount = $("input[name=editedAmount]").val();

            if($.trim(editedAmount) == ""){
                systemMessage("请输入修改金额！");
                return false;
            }

            if(uid == undefined || $.trim(uid) == ""){
                systemMessage("需要修改的id未获取到！");
                return false;
            }

            //判断实收金额是否为0或者负数
            var $editedAmount = $("input[name=editedAmount]");
            var ev = $editedAmount.val();
            if(ev == undefined || $.trim(ev) == "" || parseFloat($.trim(ev)) <= 0){
                $editedAmount.focus();
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/finance/payment/editStatus.do',
                data: {
                    id: uid,
                    editedAmount : editedAmount
                },
                beforeSend: function () {
                    $("#editBtn").attr('disabled', 'disabled');
                }
            }, jsonp)).done(function (data) {
                function useful(data) {

                    $("#editAmount").modal("hide");
                    $searchForm.submit();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '修改金额出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '修改金额失败！');
            }).always(function () {
                $("#editBtn").removeAttr('disabled').blur();
            });
        });

        return false;
    }

    /**
     * 实收金额限定小数位数
     */
    window.checkNumStyle = checkNumStyle;
    function checkNumStyle(object){
        var value = object.value;
        var length = value.length -  value.lastIndexOf(".");
        if( value.lastIndexOf(".") > 0 && length > 3){
            systemMessage("小数点后面最多只能有两位小数！");
            $(object).val(value.substr(0,value.length-1));
        }
    }

    $(document).ready(domReady);



});
