define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    //  require('datepicker');
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

    var areaPicker = require('area-picker');
    var $province = $('#province'),
        $city = $('#city');

    var queryString = require("get-query-string");
    var provinceId = queryString('provinceId');
    var cityId = queryString('cityId');

    function domReady() {
        areaPicker.provinceToCity($province, $city, provinceId, cityId);
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
            var paraStr = '';
            if(cityId) {
                paraStr = paraStr + '?cityIdList=' + cityId;
            }
            $.ajax($.extend({
                url: apiHost + '/hoss/project/common/getManagerProjectList.do' + paraStr,
                data: clearEmptyValue($context),
                beforeSend: function () {
              //      $submit.attr('disabled', 'disabled');
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
                        if(dataObj && dataObj.content) {
                            $.each(dataObj.content, function(i, item) {
                                fillInData(item.id);
                            });
                        }


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

                });

        }).trigger('submit');

        function fillInData(projectId) {

            $.ajax($.extend({
                url: apiHost + '/hoss/project/common/getProjectIncomesAndExpenses.do?projectId=' + projectId,
                beforeSend: function () {
                    //      $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        if(data && data.data) {
                            var dataObj = data.data;
                            var $projectTr = $searchResultList.find('tr[data-project="' + projectId +  '"]');
                            $projectTr.find('td[data-type="applyExpenses"]').html(dataObj.applyExpenses);
                            var payPlanRate = dataObj.payPlanRate;
                            if(payPlanRate) dataObj.payPlanRate + "%";
                            $projectTr.find('td[data-type="payPlanRate"]').html(payPlanRate);
                            $projectTr.find('td[data-type="preRegulateIncome"]').html(dataObj.preRegulateIncome);
                            var incomePlanRate = dataObj.incomePlanRate;
                            if(incomePlanRate) incomePlanRate + '%';
                            $projectTr.find('td[data-type="incomePlanRate"]').html(incomePlanRate);
                        }
                    }
                    function useless(data) {
//                        console.warn(data);
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                   // failCallback.call(this, jqXHR, '获取列表数据失败！');
                }).
                always(function () {
                });
        }



        var $suspendProjectModel = $('#suspendProjectModel');
        $searchResultList.on('click', '.btn-end', function (event) {
            if (event) {
                event.preventDefault();
            }
            var $that = $(this);
            var id = $that.attr('data-id');

            require(['datepicker'], function () {
                $('#suspendDate input').add($('#opendatetimepicker input')).datepicker({
                    autoclose: true,
                    language: 'zh-CN',
                    dateFormat: 'yy-mm-dd'
                });
            });

            $suspendProjectModel.modal({
                show: true
            });

            $suspendProjectModel.on('click', '#suspendSubmit', function (event) {
                if (event) {
                    event.preventDefault();
                }
                $('#suspend_projectId').val(id);
                var $suspendProjectForm = $('#suspendProjectForm');
                $.ajax($.extend({
                    url: apiHost + '/hoss/project/expand/suspendProject.do',
                    data: $suspendProjectForm.serialize(),
                    beforeSend: function () {
                        var suspendTime = $suspendProjectModel.find('[name="suspendTime"]').val();
                        if(!suspendTime) {
                            systemMessage('请输入项目中止日期');
                            return false;
                        }
                        var regEx = new RegExp("\\-","gi");
                        var suspendTimeValue = Date.parse(suspendTime.replace(regEx,"/"));
                        var nowDate = new Date();
                        if(suspendTimeValue > nowDate.valueOf()) {
                            systemMessage('项目中止日期不能大于当前日期');
                            return false;
                        }
                        return true;
                    }
                }, jsonp))
                    .done(function (data) {
                        function useful(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '中止项目成功！'
                            });
                            $suspendProjectModel.modal('hide');
                        }

                        function useless(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '中止项目失败！'
                            });
                        }

                        doneCallback.call(this, data, useful, useless);
                    })
                    .fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '中止项目失败！');
                    })
                    .always(function () {
                        $that.removeAttr('disabled').blur();
                    });

            });

        });
        $suspendProjectModel.on('click', '#suspendCancel', function (event) {
            if (event) {
                event.preventDefault();
            }
            $suspendProjectModel.modal('hide');
        });
    }
    $(document).ready(domReady);
});