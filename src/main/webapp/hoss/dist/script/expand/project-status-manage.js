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
//    var datepicker = require('datepicker');
    var fileupload = require('fileupload');

    var areaPicker = require('area-picker');
    var $province = $('#province'),
        $city = $('#city');
    areaPicker.provinceToCity($province, $city);


    var modal = require('bootstrap/modal');


    var autocomplete = require('autocomplete');
    $("#autocomplete-ajax").autocomplete(
        {paramName: 'housesName',
            dataType: 'jsonp',
            serviceUrl: apiHost + '/hoss/project/common/getHousesByName.do',
            width: 300,
            maxHeight: 400,
            transformResult: function (response, originalQuery) {
                return {
                    query: originalQuery,
                    suggestions: $.map(response.data.content, function (dataItem) {
                        return {value: dataItem.name, id: dataItem.id, allDataObj: dataItem};
                    })
                };
            },
            onSelect: function (suggestion) {
                $('#addContent #projectCityName_add').html(suggestion.allDataObj.cityName);
                $('#addContent #houseDeveloperDeveloperName_add').val(suggestion.allDataObj.developerName);

                var projectPostion = suggestion.allDataObj.cityName;
                if (suggestion.allDataObj.areaName) {
                    projectPostion += suggestion.allDataObj.areaName;
                }
                $('#addContent #projectPostion_add').val(projectPostion);
                $('#addContent #poject_cityId_add').val(suggestion.allDataObj.cityId);
                $('#addContent #project_housesId_add').val(suggestion.allDataObj.id)

            }
        }
    );


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
                url: apiHost + '/hoss/project/expand/getMyCityProjectList.do',
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
                            window.location.reload();
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

        function generateProjectTypeJsonStr(nameList) {
            var proTypeArr = new Array();
            nameList.each(function (i, item) {
                var obj = {};
                obj.name = $(item).val();
                obj.groupAmount = $(item).parents('tr').find('[name="projectTypeList.groupAmount"]').val();
                obj.discountInfo = $(item).parents('tr').find('[name="projectTypeList.discountInfo"]').val();
                obj.groupBuyNum = $(item).parents('tr').find('[name="projectTypeList.groupBuyNum"]').val();
                proTypeArr.push(obj)
            });

            var projectTypesJson = JSON.stringify(proTypeArr);
            return projectTypesJson;
        }

        function generateDevStaffJsonStr(nameList) {
            var devStaffArr = new Array();
            nameList.each(function (i, item) {
                var obj = {};
                obj.staffName = $(item).val();
                obj.post = $(item).parents('tr').find('[name="developerStaffList.post"]').val();
                obj.linkType = $(item).parents('tr').find('[name="developerStaffList.linkType"]').val();
                devStaffArr.push(obj);
            });
            var devStaffsJson = JSON.stringify(devStaffArr);
            return devStaffsJson;
        }
    }


    $(document).ready(domReady);


});