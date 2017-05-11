define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');

    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template'),
        _apiHost_ = template.helper('_apiHost_', apiHost);

    var pagination = require('pagination'),
        modal = require('bootstrap/modal'),
        confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');

    var accounting = require('accounting');

    template.helper("formatNumber",accounting.formatNumber);//对template增加全局变量或方法

    var doneExamineUtil = require('script/quality-control/done-examine-util')


    require(['datepicker', 'date-extend'], function (datepicker, dateExtend) {

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
        }).prop('placeholder', dateExtend.getPrevMonthToday());

        $datepickerGroup.last().on('changeDate', function (event) {
            endDate = event.date.valueOf();

            if (endDate && startDate && endDate < startDate ) {
                systemMessage('结束时间不能小于开始时间！');
            }
        }).prop('placeholder', dateExtend.getNextMonthToday());

    });


    // 楼盘
    require(['autocomplete'], function () {
        $(document).ready(function () {
            $('#autocomplete-ajax').autocomplete({
                paramName: 'housesName',
                dataType: 'jsonp',
                serviceUrl: apiHost + '/hoss/sys/houses/findByName.do',
                width: 300,
                maxHeight: 400,
                transformResult: function(response, originalQuery) {
                    return {
                        query: originalQuery,
                        suggestions: $.map(response.data.content, function(dataItem) {
                            return { value: dataItem.name, data: dataItem.id };
                        })
                    };
                },
                onSelect: function (suggestion) {
                    // alert(suggestion.data);
                }
            });
        });
    });



    $(document).ready(function () {
        var $searchForm = $('#searchForm'),
            $status = $searchForm.find('[name=result]'),
            $searchResultList = $('#searchResult'),
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
                url: apiHost + '/hoss/sys/pk/findExamineList.do',
                data: $context.serialize(),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
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

                    // 显示分页
                    $page.pagination({
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
//                    var statusVla = $status.find('option:selected').val();
//
//                    if (statusVla === '' || statusVla === 'brokerage_applied') {
//                        $searchResult.find('tfoot').show();
//                    } else {
//                        $searchResult.find('tfoot').hide();
//                    }

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
        }).trigger('submit');


        /**
         * 批量审核
         */
        function batchAudits() {

            if (!batchAudits.isConfirm) {
                return false;
            }
            batchAudits.isConfirm = false;

            var $that = $(this),
                uid = $.trim($that.attr('data-id'));

            var $checks = $searchResultList.find('tbody [type=checkbox]:checked');
            var followIds = "";
            $checks.each(function(){
                followIds += $(this).val() + ",";
            });

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pk/examineBatchAudits.do',
                data: {
                    ids : followIds
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        $searchForm.submit();
                    }
                    function useless(data) {
                        systemMessage(data.detail || '获取审核数据失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取审核数据失败！');
                })
                .always(function () {
                    $that.removeAttr('disabled').blur();
                });

        }

        // 批量审核确认
        $searchResultList.find('.btn-success[data-toggle="confirmation"]').confirmation({
            btnOkLabel: '确认',
            btnCancelLabel: '取消',
            onShow: function (event, element) {
                batchAudits.isConfirm = false;
                $(element).on('click.batchReceivables', batchAudits);
            },
            onHide: function (event, element) {
                batchAudits.isConfirm = false;
                $(element).off('.batchReceivables');
            },
            onConfirm: function (event, element) {
                batchAudits.isConfirm = true;
                $(element).trigger('click.batchReceivables');
            }
        });

        // 查看
        var $viewModal = $('#viewModal'),
            $viewTable = $('#viewTable');

        $searchResult.on('click', '.btn-view', function (e) {
            // 因为该详情页，涉及到 13 个页面调用，故放在了一个 util 中
            doneExamineUtil.initDetail(e, $viewTable, function(){
                $viewModal.modal({
                    show: true
                });
            });
            return false;
        });



        // 审核
        var $editModal = $('#editModal'),
            $editTable = $('#editTable'),
            $editForm = $('#editForm');
        $searchResult.on('click', '.btn-audit', function () {
            var $that = $(this),
                id = $that.attr('data-id');

            if ($that.hasClass('disabled')) {
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pk/getProExamineInfo.do',
                data: {
                    id: id
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var dataObj = data || {};

                    var templateId = !$.isEmptyObject(dataObj) ?
                        'auditDetailInfoTemplate' : 'messageTemplate';

                    // 显示数据
                    $editTable.find('tbody').html(
                        template(templateId, dataObj)
                    );

                    $editTable.find('[name=id]').val(id);

                    $editModal.modal({
                        show: true
                    });
                }

                function useless(data) {
                    systemMessage(data.detail || '获取审核数据失败！');
                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取审核数据失败！');
            })
            .always(function () {
                $that.removeAttr('disabled').blur();
            });

            return false;
        });

        $editTable.on('click', '.btn-audit-tg, .btn-audit-btg', function () {
            var $that = $(this),
                type = $that.attr('data-type');

            $editTable.find('[name=type]').val(type);

            if ($that.hasClass('disabled')) {
                return false;
            }

            if (!$editTable.find('[name=content]').val()) {
                systemMessage('请输入审核意见!');
                return false;
            }

            $editTable.find('#examineAction').on('submit', function () {
                return false;
            });
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pk/getExamineAction.do',
                data: {
                    id: $editTable.find('[name=id]').val(),
                    type: type,
                    content: $editTable.find('[name=content]').val()
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var dataObj = data || {};

                    if (dataObj.status === '1') {
                        $searchForm.trigger('submit');
                        $editModal.modal('hide');
                    }

                }

                function useless(data) {
                    systemMessage(data.detail || '操作失败！');
                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '审核失败！');
            })
            .always(function () {
                $that.removeAttr('disabled').blur();
            });

            return false;
        });




    });

});

