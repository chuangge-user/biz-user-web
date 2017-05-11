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
    template.helper("_apiHost_", apiHost);


    function domReady() {
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';




        // 获取刷卡记录管理列表
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
                url: apiHost + '/hoss/case/dealConfirmation/getClientLinkList.do',
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
                        ).find('[status]').confirmation({
                                btnOkLabel: '确认',
                                btnCancelLabel: '取消',
                                onShow: function (event, element) {
                                    approvalConfirm.isConfirm = false;
                                    $(element).on('click.approvalConfirm', approvalConfirm);
                                },
                                onHide: function (event, element) {
                                    approvalConfirm.isConfirm = false;
                                    $(element).off('.approvalConfirm');
                                },
                                onConfirm: function (event, element) {
                                    approvalConfirm.isConfirm = true;
                                    $(element).trigger('click.approvalConfirm');
                                }
                            });

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


        // 审核确认
        function approvalConfirm(e){

            if (!approvalConfirm.isConfirm) {
                return false;
            }
            approvalConfirm.isConfirm = false;

            var $that = $(this),
                $tr = $that.parents('tr'),
                id = $that.attr('clientId'),
                status = $that.attr('status');

            $.ajax($.extend({
                url: apiHost + '/hoss/case/dealConfirmation/auditClientLink.do',
                data: {
                    status:status,
                    id:id
                },
                beforeSend: function () {

                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                searchResultTemplate :
                                messageTemplate;

                        // 更新合作状态成功
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '更新合作状态成功！'
                        });

                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '更新合作状态失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新合作状态成功！');
                }).
                always(function () {

                });
        }


        //修改收据号弹出框ajax请求事件
        $("#editBtn").click(function (e) {


            $.ajax($.extend({
                url: apiHost + '/hoss/case/dealConfirmation/getClientLinkList.do',
                data: {
                    id: 1,
                    status:2
                },
                beforeSend: function () {
                    $("#editBtn").attr('disabled', 'disabled');
                }
            }, jsonp)).done(function (data) {
                function useful(data) {

                    $searchForm.submit();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '审核失败！');
            })
        });

        return false;

    }

    $(document).ready(domReady);

});

