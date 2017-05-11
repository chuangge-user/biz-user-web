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

    /***************************************自动匹配收据号 start******************************************/
    var autocomplete = require('autocomplete');
    $("#search-text").autocomplete(
        {paramName: 'searchText',
            dataType: 'jsonp',
            serviceUrl: apiHost + '/hoss/finance/quick/matchReceiptNo.do',
            width: 130,
            maxHeight: 300,
            transformResult: function (response, originalQuery) {
                return {
                    query: originalQuery,
                    suggestions: $.map(response.data.content, function (dataItem) {
                        return {value: dataItem, id: dataItem.id, allDataObj: dataItem};
                    })
                };
            },
            onSelect: function (suggestion) {
                $searchInput.val(suggestion.allDataObj);
            }
        }
    );
    /***************************************自动匹配收据号 end******************************************************/


    function domReady() {
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';
            //自动匹配收据号
            $search = $('#editReceiptNo');
            $searchInput = $search.find('#search-text');


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
                url: apiHost + '/hoss/finance/quick/getQuickRecordDtoList.do',
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


        //添加“修改收据号”事件
        $searchResultList.on("click", ".btn-edit", function(){
            //eidtId传递到form表单中
            $("input[name=editId]").val($(this).attr("data-id"));
            $("input[name=oldReceiptNo]").val($(this).attr("data-receiptNo"));
            //对于原收据号对应的认筹记录已退款或已转筹审核的不能修改
            $.ajax($.extend({
                url: apiHost + '/hoss/finance/quick/checkReceiptNo.do',
                data: {
                    id: $(this).attr("data-id"),
                    receiptNo : $(this).attr("data-receiptNo")
                }
            }, jsonp)).done(function (data) {
                    if(data.status == 1){
                        //清空模糊匹配内容
                        $("input[name=editedReceiptNo]").val('');
                        //清除选中状态
                        $("input[name=isHelpBuy]").removeAttr('checked');
                        //弹出框弹出
                        $("#editReceiptNo").modal({
                            show: true
                        });
                    }else{
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '不能修改收据号！'
                        });
                    }
            }).fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '不能修改收据号！');
            });
        });

        //修改收据号弹出框ajax请求事件
        $("#editBtn").click(function () {

            var quickRecordId = $("input[name=editId]").val();
            var editedReceiptNo = $("input[name=editedReceiptNo]").val();
            var isHelpBuy = $('input[name="isHelpBuy"]:checked').val();
            if($.trim(editedReceiptNo) == ""){
                systemMessage("请输入收据号！");
                return false;
            }
            if($.trim(isHelpBuy) == ""){
                systemMessage("请选择是否代付！");
                return false;
            }

            if(quickRecordId == undefined || $.trim(quickRecordId) == ""){
                systemMessage("需要修改的id未获取到！");
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/finance/quick/editReceiptNo.do',
                data: {
                    id: quickRecordId,
                    editedReceiptNo : editedReceiptNo,
                    isHelpBuy : isHelpBuy
                },
                beforeSend: function () {
                    $("#editBtn").attr('disabled', 'disabled');
                }
            }, jsonp)).done(function (data) {
                function useful(data) {

                    $("#editReceiptNo").modal("hide");
                    $searchForm.submit();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '修改收据号出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '修改收据号失败！');
            }).always(function () {
                $("#editBtn").removeAttr('disabled').blur();
            });
        });

        return false;

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