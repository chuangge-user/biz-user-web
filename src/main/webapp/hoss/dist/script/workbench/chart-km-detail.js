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

    var queryString = require("get-query-string");


    $(document).ready(function () {
        var channelType = queryString("channelType");
        var projectId = queryString("projectId") || 0;
        var $searchForm = $('#searchForm');
        var $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]');

        var $submit = $searchForm.find('input[type=submit]'),
            $disabled = $searchForm.find('[disabled]'),
            action = $searchForm.attr("action");

        var  $searchResultPagination = $('#searchResultPagination');

        /**动态生成渠道统计下啦列表*/
        var channelAllCodes = {
            haowu_outcome: [{
                 'rob_spread_outcome' : '抢抢宝',
                 'media_outcome' : '全媒体'
            }],
            path_reward : [
                {
                    'broker_look_sale_outcome' : '直客经纪人带看成交奖励',
                    'broker_maintenance_outcome' : '直客经纪人纪经人维护',
                    'broker_conduit_look_sale__outcome' : '中介机构带看成交奖励',
                    'broker_work_outcome' : '中介机构纪经人维护'
                }
            ],
            full_pact_outcome : {
                'full_pact_outcome' : '合同约定固定投入'
            },
            other_outcome : [
                {
                    'other_work_outcome' : "其他劳务费",
                    'other_look_sale_outcome' : '其他带看成交奖励',
                    'roadshow_outcome' : '巡展',
                    'activity_ground_outcome' : '活动/场地',
                    'activity_spread_outcome' : '广告宣传费',
                    'broker_bus_outcome' : '交通',
                    'material_outcome' : '物料',
                    'other_spread_outcome' : '其他'
                }
            ]
        };

        /**
         * 动态生成select下拉数据
         */
        $('#subjectType').empty();
        $('#subjectType').append('<option value="all">科目</option>');
        if ($.isArray(channelAllCodes[channelType])) {
            $.each(channelAllCodes[channelType],function(index, item) {
                    for(var keyCode in item){
                        $('#subjectType').append("<option value="+keyCode+">"+item[keyCode]+"</option>");
                    }
                }
            )
        } else {
            var itemKey = channelAllCodes[channelType];
            for(var keyCode in itemKey){
                $('#subjectType').append("<option value="+keyCode+">"+itemKey[keyCode]+"</option>");
            }
        }

        /**
         * 根据key动态收集下拉列表数据组装json格式
         */
        function getChannelCodes() {
            var channelCodes = [];
            var $items = $('#subjectType > option');
            var value = $('#subjectType').val();
            if ('all' == value) {
                $.each($items, function (index, item) {
                    if ('all' != $(item).val()){
                        channelCodes.push($(item).val());
                    }
                })
            } else {
                channelCodes.push(value);
            }
            return channelCodes;
        }

        function getStatus() {
            var statusArray = [];
            var value = $('#auditStatus').val();
            if('all' == value) {statusArray.push(new Array(1,2,5,6));}
            if('auditIn' == value) {statusArray.push(new Array(1,5,6));}
            if('auditPass' == value) {statusArray.push(new Array('2'));}
            return statusArray;
        }


        /**
         * 提交查询
         */
        $searchForm.on('submit', function (event) {
            var $subjectCode = getChannelCodes();
            var $status = getStatus();
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                $flowNo = $context.find('input[name=flowNo]').val(),
                $channelType = $context.find('#accountInfo option:selected').val(),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/bench/findParentSubjectDetailBySubjectCode.do?projectId='
                    + projectId +'&subjectCode=' + $subjectCode + '&status=' + $status + '&flowNo=' + $flowNo,
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useless(data) {
                        var dataObj = data.data || {},

                        templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                            'searchResultTemplate': 'messageTemplate';

                        //申请费用 实际支付 审批中费用
                        var applyTotalAmount = 0;
                        var actualPaymentTotalAmount = 0;
                        var approvalTotalAmount = 0;

                        $.each(dataObj.content, function(index, item){
                            applyTotalAmount += item.applyAmount || 0.00;
                            actualPaymentTotalAmount += item.payAmount || 0.00;
                            approvalTotalAmount += item.approvalAmount || 0.00;
                        });

                        dataObj.channelType = $channelType;
                        dataObj.applyTotalAmount = applyTotalAmount;
                        dataObj.actualPaymentTotalAmount = actualPaymentTotalAmount;
                        dataObj.approvalTotalAmount = approvalTotalAmount;

                        // 显示数据
                        $('#suggestion').find('tbody').html(
                            template(templateId, data)
                        );
                        // 显示分页
                        if (dataObj.totalElements) {
                            $searchResultPagination.pagination({
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
                    }
                    doneCallback.call(this, data, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
            return false;
        }).trigger('submit');
    });
});

