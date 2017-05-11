define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    require('script/validate');
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
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            $exportByCondition=$('#exportByCondition'),
            $addProjectIncome=$('#addProjectIncome');


        //城市数据加载
        bindingToCitySelection('searchCitySelect');

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
                url: apiHost + '/hoss/project/otherincome/projectOtherIncomeDtoList.do',
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


                        // 删除
                        $searchResultList.find('.adel[data-toggle=confirmation]').confirmation({
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

        /**
         * 新增项目其它收入
         * @returns {boolean}
         */
        var $addProjectIncomeModel = $('#addProjectIncome');
        var $saveIncomeModel = $('#saveIncome');
        $addProjectIncomeModel.on('click',  function (event) {
            $saveIncomeModel.modal({
                show: true
            });
        });

        //城市数据加载
        var projectUtil = require("script/project/project-util");
        projectUtil.bindingProjectAndCity('addProjectSelect', 'addCitySelect',null,null,'/hoss/project/common/getMyCityAndLeagueCity.do');
        //projectUtil.bindingProjectAndCity('addProjectSelect', 'addCitySelect',null,null);


        require(['datepicker'], function () {
            $('#add_datetimepicker input').add($('#opendatetimepicker input')).datepicker({
                autoclose: true,
                language: 'zh-CN',
                dateFormat: 'yy-mm-dd'
            });
        });

        $saveIncomeModel.on('click', '#submitProjectIncome', function (event) {
            if (event) {
                event.preventDefault();
            }

            var $addForm = $('#addForm');
            if(!$addForm.isValid()) {
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/project/otherincome/saveProjectOtherIncome.do',
                data: $addForm.serialize(),
                beforeSend: function () {
                    // $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '添加项目其它收入成功！'
                        });
                        $addForm[0].reset();
                        $saveIncomeModel.modal('hide');
                        $pageNum.val('0');

                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '添加项目其它收入失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '添加项目其它收入失败！');
                });

        });

        $saveIncomeModel.on('click', '#cancelProjectIncome', function (event) {
            if (event) {
                event.preventDefault();
            }
            $saveIncomeModel.modal('hide');
        });



        /**
         * 修改项目其它收入
         * @returns {boolean}
         */
        var $editIncomeModel = $('#editIncome');
        $searchResultList.on('click', '.btn-edit', function (event) {
            if (event) {
                event.preventDefault();
            }
            $editIncomeModel.modal({
                show: true
            });

            var $that = $(this),
                uid = $.trim($that.attr('data-id'));
            $.ajax($.extend({
                url: apiHost + '/hoss/project/otherincome/getProjectOtherIncomeById.do',
                    data: {
                        id:uid
                    },
                beforeSend: function () {
                    // $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        //显示数据
                        $('#editIncome').find('tbody').html(template('editTableTemplate', data));
                        //城市数据加载
                        var projectUtil = require("script/project/project-util");
                        projectUtil.bindingProjectAndCity('editProjectSelect', 'editCitySelect',function(){
                            $('#editCitySelect').find('option[value='+data.data.cityId+']').prop('selected', true).trigger('change',function(){
                                $('#editProjectSelect').find('option[value='+data.data.projectId+']').prop('selected', true);
                            });
                        });

                        $('#myIncomeType').find('option[value='+data.data.incomeType+']').prop('selected', true);
                        require(['datepicker'], function () {
                            $('#edit_datetimepicker input').add($('#opendatetimepicker input')).datepicker({
                                autoclose: true,
                                language: 'zh-CN',
                                dateFormat: 'yy-mm-dd'
                            });
                        });





                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '获取项目其它收入失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取项目其它收入失败！');
                });

            $editIncomeModel.on('click', '#submitEditProjectIncome', function (event) {
                if (event) {
                    event.preventDefault();
                }
                var $editForm = $('#editForm');
                if(!$editForm.isValid()) {
                    return false;
                }
                $.ajax($.extend({
                    url: apiHost + '/hoss/project/otherincome/updateProjectOtherIncome.do',
                    data: $editForm.serialize(),
                    beforeSend: function () {
                        // $that.attr('disabled', 'disabled');
                    }
                }, jsonp))
                    .done(function (data) {
                        function useful(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '修改项目其它收入成功！'
                            });
                            $editIncomeModel.modal('hide');
                            $pageNum.val('0');
                            $searchForm.submit();
                        }

                        function useless(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '修改项目其它收入失败！'
                            });
                        }

                        doneCallback.call(this, data, useful, useless);
                    })
                    .fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '修改项目其它收入失败！');
                    })
                    .always(function () {
                        $that.removeAttr('disabled').blur();
                    });

            });

            $editIncomeModel.on('click', '#cancelEditProjectIncome', function (event) {
                if (event) {
                    event.preventDefault();
                }
                $editIncomeModel.modal('hide');
            });
        });


        /**
         * 删除操作
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
                url: apiHost + '/hoss/project/otherincome/delProjectOtherIncome.do',
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
                            detail: data.detail || '确认删除出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '确认删除失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }


        //导出excel
        $exportByCondition.on('click', function () {
            var exportByConditionUrl = apiHost + '/hoss/project/otherincome/exportOtherIncomeByCondition.do?' + $searchForm.serialize();
            $exportByCondition.attr('href', exportByConditionUrl);
        });
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