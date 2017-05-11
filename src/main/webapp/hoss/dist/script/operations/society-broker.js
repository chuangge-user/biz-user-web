define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

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

    function domReady() {
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
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
                url: apiHost + '/hoss/operations/broker/queryBrokerList.do',
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
                    // 注销 || 封号
                    $searchResultList.find('.btn[data-toggle=confirmation]').confirmation({
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
                });

        }).trigger('submit');


        // 更新查询条件时，页码返回第一页
        $searchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });


        /**
         * 更新状态操作
         * @returns {boolean}
         */
        function toggleReturnStatus() {
            if (!toggleReturnStatus.isConfirm) {
                return false;
            }
            toggleReturnStatus.isConfirm = false;

            var $that = $(this),
                phone = $.trim($that.attr('data-phone')),
                disabled = $.trim($that.attr('data-disabled'));

            $.ajax($.extend({
                url: apiHost + '/hoss/operations/broker/updateDisabled.do',
                data: {
                    phone:phone,
                    disabled:disabled
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        $pageNum.val('0');
                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'error',
                            title: '提示：',
                            detail: data.detail  || '账户注销或封号出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '账户注销或封号出错！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }


    }

    $(document).ready(domReady);


});


