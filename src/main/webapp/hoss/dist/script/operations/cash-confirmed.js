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



    function bindingToCitySelection(id) {
        var selObj = $('#' + id);
        if (!selObj) {
            throw new Error('找不到对应Section控件');
        } else {
            selObj.html('');
            selObj.append('<option value="">请选择城市</option>');
        }
        var cityArr = getMyCity();
        for (var i = 0; i < cityArr.length; i++) {
            var city = cityArr[i];
            selObj.append('<option value="' + city.cityId + '">' + city.cityName + '</option>');
        }
    }
    function getMyCity() {
        var result = null;
        $.ajax({
            type: "get",
            async: false,
            url: apiHost + '/hoss/project/common/getMyCityDto.do',
            dataType: "jsonp",
            jsonp: "callback",
            success: function (data) {
//                console.info(data);
                result = data.data.content;
            },
            error: function () {
                //todo
            }
        });
        return result;
    }


    function domReady() {
        bindingToCitySelection('searchCitySelect');
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
                url: apiHost + '/hoss/finance/approved/getApprovedList.do',
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
            var leadingOuturl = apiHost + '/hoss/finance/operations/leadingOut.do?' + $searchForm.serialize();
            $leadingOut.attr('href', leadingOuturl);
        });


        // 查看信息
        var $viewModal = $('#viewModal'),
            $viewTablePagination = $('#viewTablePagination'),
            viewTableTemplate = 'viewTableTemplate',
            viewTablemessageTemplate = 'viewTablemessageTemplate',
            $viewModalForm=$('#viewModalForm'),
            $viewpageNum = $viewModalForm.find('input[name=viewpage]'),
            $viewpageSize = $viewModalForm.find('input[name=viewsize]'),
            $cashAddForm = $('#cashAddForm'),
            page=$viewpageNum.val(),
            size=$viewpageSize.val(),
            $viewTable = $('#viewTable');
        var id;

        $viewModalForm.on('submit', function (event) {
            //获取列表信息
            var viewpage = $viewpageNum.val();

            $viewpageNum = $viewModalForm.find('input[name=viewpage]');
            //alert(viewpage);

            $.ajax($.extend({
                url: apiHost + '/hoss/finance/approved/getBrokerAccountList.do',
                data: {
                    page:viewpage,
                    size:size,
                    brokerId: id
                },
                beforeSend: function () {
                    //$that.attr('disabled', 'disabled');
                }
            }, jsonp)).done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {},
                        templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                            viewTableTemplate :
                            viewTablemessageTemplate;

                    // 显示数据
                    $viewTable.find('tbody').html(
                        template(templateId, data)
                    );


                    $viewModal.modal({
                        show: true
                    });

                    // 显示分页
                    $viewTablePagination.pagination({
                        totalSize: dataObj.totalElements,
                        pageSize: parseInt($viewpageSize.val()),
                        visiblePages: 5,
                        info: true,
                        paginationInfoClass: 'pagination-count pull-left',
                        paginationClass: 'pagination pull-right',
                        onPageClick: function (event, index) {
                            $viewpageNum.val(index - 1);
                            $viewModalForm.trigger('submit');

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
                    // $that.removeAttr('disabled').blur();

                });

            return false;

        });

        $viewModal.on('hidden.bs.modal', function () {
            $viewTablePagination.pagination('destroy');
            $viewTable.find('tbody').html('');
            $viewpageNum.val(0);// = $viewModalForm.find('input[name=viewpage]'),
            $viewpageSize.val(10);// = $viewModalForm.find('input[name=viewsize]'),

        });





        $searchResultList.on('click', '.btn-primary', viewFunc);

        function viewFunc() {
            var $that = $(this),
                userAmount=$that.attr('data-pid');

            if ($that.hasClass('disabled')) {
                return false;
            }
            $viewpageNum.val(0);
            id = $that.attr('data-id');

            //alert(id);
            $("#appliedAmount").text("");
            $("#totalAmount").text("");
            $("#applyAmount").text("");
            $("#balanceAmount").text("");
            $("#brokerName").text("");

            //获取账户
            $.ajax($.extend({
                url: apiHost + '/hoss/finance/approved/getstatisticsAccountRecord.do',
                data: {
                    brokerId: id
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {

                        var dataObj = data.data || {};

                        $("#appliedAmount").text(dataObj.appliedAmount);
                        $("#totalAmount").text(dataObj.appliedAmount+dataObj.balanceAmount+dataObj.applyAmount);
                        $("#applyAmount").text(userAmount);
                        $("#balanceAmount").text(dataObj.balanceAmount);
                        $("#brokerName").text(dataObj.brokerName);
                        $("#nowApplyAmount").text(dataObj.applyAmount);
                    }

                    function useless(data) {
                        systemMessage(data.detail || '获取活动信息失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取活动信息失败！');
                })
                .always(function () {
                    $that.removeAttr('disabled').blur();
                });

            //获取列表信息

            $viewModalForm.trigger('submit');

            return false;
        }


        $searchResultList.on('click', '.btn-warning', viewAduitFunc);

        function viewAduitFunc() {
            var $that = $(this),
                userAmount = $that.attr('data-pid'),
                id = $that.attr('data-id');

            $("#approvedId").val(id);
            $("#textareatxt").val("");
            if ($that.hasClass('disabled')) {
                return false;
            }

        }
        //审核通过
        //审核不通过
        var $reviewModal = $('#reviewModal');
        $cashAddForm.on('click','input[type=submit]', function (event) {
            var $that = $(this),
                isPass = $that.hasClass('btn-pass'),
                approvedId= $cashAddForm.find("[name=approvedId]").val(),
                appurl="",
                content=$cashAddForm.find("[name=content]").val();

            if (event) {
                event.preventDefault();
            }

            if (isPass) {
                appurl="/hoss/finance/approved/updatepass.do";
            } else {

                if(null==content||content==""){

                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: "审批意见不能为空!" || "审批意见不能为空!"
                    });

                    return false;
                }

                appurl="/hoss/finance/approved/updateNopass.do";

            }

            $.ajax($.extend({
                url: apiHost + appurl,
                data: {
                    approvedId:approvedId,
                    content: content
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
                        $reviewModal.modal('hide');
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '审核失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '审核失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });


        });


    }

    $(document).ready(domReady);


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
        });//.prop('placeholder', dateExtend.getPrevMonthToday());

        $datepickerGroup.last().on('changeDate', function (event) {
            endDate = event.date.valueOf();

            if (endDate && startDate && endDate < startDate ) {
                systemMessage('结束时间不能小于开始时间！');
            }
        });//.prop('placeholder', dateExtend.getNextMonthToday());

    });

});


