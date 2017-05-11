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

    var $modal = require('bootstrap/modal');
    var projectUtil = require("script/project/project-util");
    var systemMessage = require('system-message');
                        require('script/validate');

    var queryString = require("get-query-string");
    var $projectId = null;
    var $cityId = null;

    var proInfoList = projectUtil.appendProjectSelectUtil('project_bench_detail', function (proInfo) {
        $projectId = proInfo.id;
        $cityId = proInfo.cityId;

        setTimeout(function(){
            $('#searchForm').trigger("submit");
        },100);

    });

    $(document).ready(function () {
        var $channelName = queryString("channelName");
        $("#channelType option[value="+$channelName+"]").attr("selected", "selected");
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]');

        var $submit = $searchForm.find('input[type=submit]'),
            $disabled = $searchForm.find('[disabled]'),
            action = $searchForm.attr("action");

        var $searchResultPagination = $('#searchResultPagination');
        var $checkboxs = $('#searchList');


        $('#dateType-option').change(function(){
            if('custom' == $(this).val()) {
                var html = '<span class="" id="endSpan">至</span>'
                           + '<input id="endInput" name="endTime" class="form-control input-w5">';
                $('#datepicker').append(html);
                var $datepickerGroup = $('#datepicker > input'),
                    startDate;

                $datepickerGroup.datepicker({
                    autoclose: true,
                    language: 'zh-CN',
                    dateFormat: 'yy-mm-dd'
                });
            } else {
                $('#endSpan').remove();
                $('#endInput').remove();
            }
        });

        /**
         * 应收调整
         */
        $('#ys').on("click",
            function(event) {

                if (event) {
                    event.preventDefault();
                }
                var followIds = getFollowIds();
                if ((followIds.length) == 0) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '您还未选择需要调整的应收记录!'
                    });
                    return false;
                }
                $("#sbmt_ys").removeAttr("style");
                commAjax('ys', $('#searchForm'), followIds);
            }
        );

        /**
         * 实收调整
         */
        $('#ss').on("click",
            function(event){
                if (event) {
                    event.preventDefault();
                }
                var followIds = getFollowIds();
                if ((followIds.length) == 0) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '您还未选择需要调整的实收记录!'
                    });
                    return false;
                }
                $("#sbmt_ss").removeAttr("style");
                commAjax('ss', $('#searchForm'), followIds)
            }
        );

        function getFollowIds () {
            var followIds = [];
            $.each($checkboxs.find('input[id=call]:checked'),
                function(idx, item) {
                    followIds.push($(this).val());
                }
            );
            return followIds;
        }

        /**
         * 根据标示获取请求url
         * @param bs
         */
        function getUrl (bs) {
            var url = "";
            if ('sbmt_ys' == bs ) { //应收
                url = apiHost + '/hoss/costmanager/updateReceivableAmount.do';
            }
            if ('sbmt_ss' == bs ) { //新增实收
                url = apiHost + '/hoss/costmanager/addInvoiceAmount.do';
            }
            return url;
        }

        /**
         * 修改应收金额
         */
        $('.distribution_cmt').on('click',
            function() {

                // 数值判断
                var msg = '';
                $('#searchList input[type="text"]').each(function(index, node){
                    var $node = $(node),
                        nodeName = $node.attr('name');
                    var value = $node.val().replace(/\ +$/, '')
                    var valueSpt = value.split('.');
                    if (isNaN(value)) {
                        msg = (nodeName === 'receivableAmount' ? '实收金额必须为数字':'应收金额必须为数字');
                        $node.focus();
                        return false;
                    }

                    if (value < 0 || value > 10000000 || (valueSpt[1] && valueSpt[1].length > 2)) {
                        msg = '请输入合理的金额';
                        $node.focus();
                        return;
                    }

                    $node.val(value);
                });
                if (msg) {
                    systemMessage(msg);
                    return;
                }

                var bs = $(this).attr("id");
                var url = getUrl(bs);
                var updateRecordList = [];
                $.each($('.up_flow'),
                    function(idx, item) {
                        var record = updateRecordList[idx] = {};
                        var followId = $(this).val();
                        var receivableAmount = $('#' + $(this).val()).val() || 0.00;
                        var invoiceAmount = $('#' + 'ss_' +$(this).val()).val() || 0.00;
                        record.followId = followId;
                        if ('sbmt_ys' == bs) {
                            record.receivableAmount = receivableAmount;
                        }
                        if ('sbmt_ss' == bs) {
                            record.invoiceAmount = invoiceAmount;
                        }
                    }
                );
                var updateDetail = JSON.stringify(updateRecordList);
                $.ajax($.extend({
                    url: url,
                    data : {
                        dto :  updateDetail,
                        projectId: $('[name=projectId]').val()
                    },
                    beforeSend: function () {
                        var bl = true;
                        if (!$('#searchList').isValid()) {
                            bl = false;
                        }
                        return bl;
                    }
                }, jsonp))
                    .done(function (data) {
                        function useful (data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '获取列表数据失败！'
                            });
                            location.href = apiHost + "/hoss-v2/app/project/distribution-manager.html"
                        }
                        function useless(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '获取列表数据失败！'
                            });
                        }
                        doneCallback.call(this, data,useful, useless);
                    })
                    .fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '操作失败！');
                    })
                    .always(function () {
                    });
            }
        );

        /**
         * 取消
         */
        $('#cannel').on('click',
            function() {
                location.href = apiHost + "/hoss-v2/app/project/distribution-manager.html"
            }
        );

        /**
         * 全选
         */
        $('#checkAll').on('change',
            function () {
                if($(this)[0].checked) {
                    var checkRecords = $('input[type=checkbox]');
                    $.each(checkRecords,
                        function (idx, item) {
                            $(this)[0].checked = true;
                        }
                    );
                } else {
                    var checkRecords = $('input[type=checkbox]');
                    $.each(checkRecords,
                        function (idx, item) {
                            $(this)[0].checked = false;
                        }
                    );
                }
            }
        );

        /**
         * 通用ajax请求
         * tType [defualt/ys/ss]
         */
        function commAjax(tType, $context, followIds) {
            $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');



            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');
            $('input[name=projectId]').val($projectId);
            $.ajax($.extend({
                url: apiHost + '/hoss/costmanager/findDistributionList.do?followIds=' + followIds,
                data : clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful (data) {
                        if(tType =='ss') {
                            $('<th>新增实收(元)<th>').insertBefore(".beforeyj");
                        }
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                'searchResultTemplate':
                                'messageTemplate';
                        /**应收*/
                        var receivableAmountTotal = 0.00;
                        /**实收*/
                        var invoiceAmountTotal = 0.00;
                        /**应结佣金*/
                        var receivableCommissionTotal = 0.00;
                        /**已结佣金*/
                        var commissionInvoiceTotal = 0.00;

                        $.each(dataObj.content, function(item, i){
                            receivableAmountTotal += i.receivableAmount;
                            invoiceAmountTotal += i.invoiceAmount || 0;
                            receivableCommissionTotal += i.receivableCommission || 0;
                            commissionInvoiceTotal += i.commissionInvoice || 0;
                        });
                        dataObj.receivableAmountTotal = receivableAmountTotal;
                        dataObj.invoiceAmountTotal = invoiceAmountTotal;
                        dataObj.receivableCommissionTotal = receivableCommissionTotal;
                        dataObj.commissionInvoiceTotal = commissionInvoiceTotal;
                        dataObj.projectId = $projectId;
                        dataObj.tType = tType || 'defualt';

                        // 显示数据
                        $('#searchList').find('tbody').html(
                            template(templateId, data)
                        );

                        //删除dom选择框dom节点
                        $('.selections').remove();
                        $('#searchDiv').remove();
                        $('#project_bench_detail').remove();
                        $('#searchResultPagination').remove();
                        $('.tab-content').attr("style", "display: block");

                        if(tType =='ss') {
                            $('.beforeyj').prev().remove();
                        }
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }

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
            $('input[name=projectId]').val($projectId);
            $.ajax($.extend({
                url: apiHost + '/hoss/costmanager/findDistributionList.do',
                data : clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful (data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                                'searchResultTemplate':
                                'messageTemplate';
                        /**应收*/
                        var receivableAmountTotal = 0.00;
                        /**实收*/
                        var invoiceAmountTotal = 0.00;
                        /**应结佣金*/
                        var receivableCommissionTotal = 0.00;
                        /**已结佣金*/
                        var commissionInvoiceTotal = 0.00;

                        $.each(dataObj.content, function(item, i){
                            receivableAmountTotal += i.receivableAmount;
                            invoiceAmountTotal += i.invoiceAmount || 0;
                            receivableCommissionTotal += i.receivableCommission || 0;
                            commissionInvoiceTotal += i.commissionInvoice || 0;
                        });
                        dataObj.receivableAmountTotal = receivableAmountTotal;
                        dataObj.invoiceAmountTotal = invoiceAmountTotal;
                        dataObj.receivableCommissionTotal = receivableCommissionTotal;
                        dataObj.commissionInvoiceTotal = commissionInvoiceTotal;
                        dataObj.tType = 'defualt';

                        // 显示数据
                        $('#searchList').find('tbody').html(
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
                    doneCallback.call(this, data,useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');
        return false;
    });
});

require(['jquery', 'datepicker', 'date-extend'], function ($, datepicker, dateExtend) {

    var $datepickerGroup = $('#datepicker > input'),
        startDate;

    $datepickerGroup.datepicker({
        autoclose: true,
        language: 'zh-CN',
        dateFormat: 'yy-mm-dd'
    });

    $datepickerGroup.first().on('changeDate', function (event) {
        startDate = event.date.valueOf();
        $datepickerGroup.last().focus();
    }).prop('placeholder', dateExtend.getPrevMonthToday());

});

