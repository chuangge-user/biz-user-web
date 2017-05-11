
define(function (require) {

    var $ = require('jquery');
    var navigation = require('navigation');
    var modal = require('bootstrap/modal');
    var template = require('template');
    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var systemMessage = require('system-message');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
        webHost = hoss.webHost;
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    $(function(){
        var $brokerage=$(".brokerage");
        $brokerage.on('click', function (event) {
            self.location="brokerage-apply/brokerage-apply-search.html";
        });
    });

    require(['jquery', 'datepicker', 'date-extend'], function ($, datepicker, dateExtend) {

        var $start = $("#datepicker > input[name=startTime]").val(  dateExtend.getPrevMonthToday());
        var $end = $("#datepicker > input[name=endTime]").val( dateExtend.getNextMonthToday() );
        var startDate,endDate;

        $start.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });
        $end.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });

        $start.on('changeDate', function (event) {
            startDate = event.date.valueOf();
            $end.focus();
        })

        $end.on('changeDate', function (event) {
            endDate = event.date.valueOf();
            if (endDate && startDate && endDate < startDate ) {
                systemMessage('结束时间不能小于开始时间！');
            }
        })

    });

    require(['jquery', 'datetimepicker', 'date-extend'], function ($, datetimepicker, dateExtend) {
        var $datepickerGroup = $('#datetimepicker > input');

        $datepickerGroup.datetimepicker({
            autoclose: true,
            minuteStep: 5,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        }).on('changeDate', function (event) {
//            console.log(event);
        }).prop('placeholder', dateExtend.toString(new Date(), 'yyyy-mm-dd hh:ii'));

    });


    $(document).ready(function (){
        bindEvent();
    });

    function bindEvent(){



        var $dataList=$("#table"),
            $pageSize=$("#pageSize"),
            $pageNum=$("#page"),
            $page=$("#pagination");

        $dataList.on("click",".href_a",function(){
            window.location.href=webHost+$(this).attr("url");
        });

        $("#search-form").submit(function(){

            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + "/costmanager/liquidation/commissionSettlement/findCommissionSettlement.do",
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取数据失败！'
                        });
                    }

                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId =
                                ($.isArray(dataObj.content) && dataObj.content.length)
                                    ? "searchResultTemplate"
                                    : "messageTemplate";


                        // 显示数据
                        $dataList.find('tbody').html( template(templateId, data) );

                        // 显示分页
                        $page.pagination({
                            $form : $context,
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
                    };


                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取数据失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

            return false;
        }).trigger("submit");



    }
});

