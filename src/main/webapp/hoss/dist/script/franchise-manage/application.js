/**
 * 加盟申请
 */
define(function (require) {
    var hoss = require('hoss'),
        webHost = hoss.webHost,
        apiHost = hoss.apiHost;

    require(['jquery', 'datepicker', 'dist/script/bootstrap.min', 'dist/script/bootstrap-select']);

    var $ = require('jquery');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var navigation = require('navigation');

    var template = require('template');
    var datepicker = require('datepicker');
    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var systemMessage = require('system-message');

    //*******操作成功提示信息*******//
    function success_message(message) {
        systemMessage({
            type: 'info',
            title: '提示：',
            detail: message
        });
    }

    function domReady() {

        jQuery('#tabpanel').find('[result-target]').click(function(e){ // 切换 Tab 事件
            var resultTarget = $(e.currentTarget).attr('result-target');
        });

        //*******时间筛选*******//
        var $datepickerGroup = $('#datepicker > input.datepicker'), timeStart, timeEnd;
        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yyyy-mm-dd'
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

        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            $tabType = $('#tabType');

        $searchForm.find('[result-target]').click(function(e){ // 切换 Tab 事件
            var resultTarget = $(e.currentTarget).attr('result-target');
            $tabType.val(resultTarget);
            jQuery("input[name='page']").val("0");
            $searchForm.submit();
        });

        //*******获取投放列表*******//
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if ($tabType.val() == 3) {
                $searchResultList = $('#searchResultList');
            } else {
                $searchResultList = $('#searchResultList1');
            }

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/league/apply/getLeagueCompanyPages.do',
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
                            $form: $searchForm,
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

                        //*******删除主题 提示框*******//
                        $searchResultList.find('.btn_delete_theme[data-toggle=confirmation]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                delete_theme.isConfirm = false;
                                $(element).on('click.remove', delete_theme);
                            },
                            onHide: function (event, element) {
                                delete_theme.isConfirm = false;
                                $(element).off('.remove');
                            },
                            onConfirm: function (event, element) {
                                delete_theme.isConfirm = true;
                                $(element).trigger('click.remove');
                            }
                        });

                        //*******删除主题操作**********//
                        function delete_theme() {
                            var _obj = $(this);
                            var id = $(this).attr('data-id');
                            if (!id) {
                                systemMessage('当前主题没有id，请检查！');
                                return false;
                            }
                            //发送请求
                            $.ajax($.extend({
                                url: apiHost + '/kbd/putAds/delatePutAdsById.do',
                                data: {id: id},
                                beforeSend: function () {
                                    _obj.attr('disabled', 'disabled').text('删除中...');
                                },
                                success: function (data) {
                                    success_message(data.detail || '删除成功！');

                                    setTimeout(function () {
                                        $searchForm.submit();
                                    }, 600);
                                },
                                error: function () {
                                    systemMessage('删除失败！');
                                },
                                complete: function () {
                                    _obj.removeAttr('disabled').text('删除');
                                }

                            }, jsonp));
                        };
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');
    }

    $(document).ready(domReady);
});
