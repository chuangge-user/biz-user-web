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

    var accounting = require('accounting');

   // var areaPicker = require('area-picker');

    var projectUtil = require("script/project/project-util");
   // projectUtil.bindingToCitySelection('cityId');



    function domReady() {

        /*
       //城市
        var $province2 = $('#province2'),
            $city2 = $('#projectCityId');
         areaPicker.provinceToCity($province2, $city2);*/

        projectUtil.bindingCity('projectCityId');

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
            $price1 = $('#price1'),
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
                url: apiHost + '/hoss/finance/caseDeposit/getCaseDepositList.do',
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


                        // 确认还清
                        $searchResultList.find('.btn-success[data-toggle=confirmation]').confirmation({
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


        var $pageContent = $('.page-content'),
            $editCaseForm=$('#editCaseForm'),
            $editContent = $('#editContent');

        // 返回搜索结果列表
        $pageContent.on('click', '.btn-back-list', function (event) {
            if (event) {
                event.preventDefault();
            }

            $pageContent.addClass('hide');
            $searchListContent.removeClass('hide');

//            console.log('back-list');
        });



        /**
         * 执行还清操作
         * @returns {boolean}
         */
        function toggleReturnStatus() {
            if (!toggleReturnStatus.isConfirm) {
                return false;
            }
            toggleReturnStatus.isConfirm = false;

            var $that = $(this),
                uid = $.trim($that.attr('data-id'));

            $.ajax($.extend({
                url: apiHost + '/hoss/finance/caseDeposit/updateToReturn.do',
                data: {
                    id:uid
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
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '确认还清出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新保证金状态失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }


        // 更新查询条件时，页码返回第一页
        $searchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });

        //导出excel
        $leadingOut.on('click', function () {
            var leadingOuturl = apiHost + '/hoss/finance/caseDeposit/leadingOut.do?' + $searchForm.serialize();
            $leadingOut.attr('href', leadingOuturl);
        });



        // 坏账
        $searchResultList.on('click', '.btn-danger', function (event) {
            if (event) {
                event.preventDefault();
            }
            //查询数据
            var $that = $(this),
                uid = $.trim($that.attr('data-id'));

            $("#dadAmount").val("");
            $("#dadRemark").val("");
            $price1.html("");
            $.ajax($.extend({
                url: apiHost + '/hoss/finance/caseDeposit/getCaseDeposit.do',
                data: {id: uid},
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        if (result.status === '1') {
                            $("#id").val(result.data.id);
                            $("#title").text(result.data.title);
                            $("#cityName").text(result.data.cityName);
                            $("#userName").text(result.data.userName);
                            $("#startTime").text(result.data.startTime);
                            $("#endTime").text(result.data.endTime);
                            $("#flowNo").text(result.data.flowNo);
                           // alert(result.data.auditAmount);
                            $("#auditAmount").text(result.data.auditAmount);

                        }
                    }

                    function useless(data) {
                        systemMessage(data.detail || '操作失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作失败！');
                })
                .always(function () {
                    $that.removeAttr('disabled').blur();
                });


            $editContent.modal('show');


        });



        //转大写
        $editCaseForm.on('blur','input[name=dadAmount]', function (event) {
            var num=$editCaseForm.find("[name=dadAmount]").val();
            $price1.html(
                accounting.formatUpperCase(num)
            );
        });


       //坏账保存
        $editCaseForm.on('click','input[type=submit]', function (event) {
            var $that = $(this),
                dadRemark= $editCaseForm.find("[name=dadRemark]").val(),
                dadAmount= $editCaseForm.find("[name=dadAmount]").val();

            if (event) {
                event.preventDefault();
            }


            if(dadAmount==null||dadAmount==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '坏账金额不能为空!' || '坏账金额不能为空！'
                });

                $("#dadAmount").focus();
                return false;
            }

            if(dadRemark==null||dadRemark==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '坏账原因不能为空!' || '坏账原因不能为空！'
                });
                $("#dadRemark").focus();
                return false;
            }

            if(dadRemark.length>500){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '坏账原因过长，不能超过500!' || '坏账原因过长，不能超过500！'
                });
                $("#dadRemark").focus();
                return false;
            }

            $.ajax($.extend({
                url: apiHost + "/hoss/finance/caseDeposit/updateToBaddebt.do",
                data:$editCaseForm.serialize(),
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var result = data || {};
                        $pageNum.val('0');
                        $searchForm.submit();
                        $editContent.modal('hide');
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '保存失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '保存失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });


        });



    }

    $(document).ready(domReady);



});
