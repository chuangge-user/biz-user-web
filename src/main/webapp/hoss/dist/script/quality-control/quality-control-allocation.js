define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var modal = require('bootstrap/modal');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');



    // 楼盘
    require(['autocomplete'], function ($) {
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
        var $qcaSearchForm = $('#qcaSearchForm'),
            $pageNum = $qcaSearchForm.find('input[name=page]'),
            $pageSize = $qcaSearchForm.find('input[name=size]'),
            $qcaList = $('#qcaList'),
            $page = $('#page');




        var $province = $('#province'),
            $city = $('#city'),
            $areaId = $('#area'),
            isEmptyValue = '';

        require(['area-picker'], function (areaPicker) {
            areaPicker.provinceToCityToArea($province, $city, $areaId);
        });





        // 删除分配
        function deleteAssist() {

            if (!deleteAssist.isConfirm) {
                return false;
            }
            deleteAssist.isConfirm = false;

            var $that = $(this),
                uid = $.trim($that.attr('data-uid')),
                pid = $.trim($that.attr('data-pid')),
                $operating = $that.parents('tr').find('.operating');


            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pkManager/deleteAssist2Project.do',
                data: {
                    sysUserProjectId: pid
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        if (result.status === '1') {
                            $that.remove();
                            $operating.removeClass('p-bg')
                                .addClass('p-zd')
                                .html('指定');
                        }
                    }

                    function useless(data) {
                        systemMessage(data.detail || '删除失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '删除失败！');
                })
                .always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }



        // 列表
        $qcaSearchForm.on('submit', function(){
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pkManager/getQualityDistributionList.do',
                data: clearEmptyValue($context),
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
                            ) ? 'qcaListTemplate' : 'messageTemplate';

                        // 显示数据
                        $qcaList.find('tbody').html(
                            template(templateId, data)
                        );

                        // 分页
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

                        // 确认 删除分配
                        $qcaList.find('[data-toggle="confirmation"]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                deleteAssist.isConfirm = false;
                                $(element).on('click.deleteAssist', deleteAssist);
                            },
                            onHide: function (event, element) {
                                deleteAssist.isConfirm = false;
                                $(element).off('.deleteAssist');
                            },
                            onConfirm: function (event, element) {
                                deleteAssist.isConfirm = true;
                                $(element).trigger('click.deleteAssist');
                            }
                        });
                    }

                    function useless(data) {
                        systemMessage(data.detail || '获取品控分配列表失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取品控分配列表失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

            return false;
        }).submit();

        // 更新查询条件时，页码返回第一页
        $qcaSearchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });

        // 全选、返选
        var $selectedCheckbox = $('#selectedCheckbox'),
            $selectAll = $('#selectAll');

        $selectAll.attr('checked', false);

        $page.on('click', 'a', function () {
            $selectAll.attr('checked', false);
        });

        $qcaList.on('click', '#selectAll', function () {
            var $context = $(this),
                $checkbox = $qcaList.find('tbody [type=checkbox]'),
                ids = [];

            $checkbox.prop("checked", $context.prop("checked"));

            if ($context.prop("checked")) {
                $.each($checkbox, function (i, n) {
                    ids.push(n.value);
                });
            }

            $selectedCheckbox.attr('ids', ids.join(','));
        });

        // 取消一条或多条
        $qcaList.on('click', 'tbody [type=checkbox]', function () {
            var $checkbox = $qcaList.find('tbody [type=checkbox]'),
                ids = [];

            $.each($checkbox, function (i, n) {
                if ($(n).prop('checked')) {
                    ids.push(n.value);
                } else {
                    $selectAll.removeAttr('checked');
                }
            });

            $selectedCheckbox.attr('ids', ids.join(','));
        });

        $selectedCheckbox.on('click', function () {
            var $context = $(this),
                ids = $context.attr('ids');

            if (!ids) {
                systemMessage('请先选择，然后再批量指定。');
                return false;
            }

            $spmResult.append(
                    '<input type="hidden" name="pid" value="'+ ids +'">' +
                    '<input type="hidden" name="distribute" value="true">'
            );

            $spmModal.modal({
                show: true
            });

            return false;
        });



        var $spmModal = $('#spmModal'),
            $spmForm = $('#spmForm'),
            $spmResult = $('#spmResult'),
            $changeList = $('#changeList');

        // 显示变更、指定弹出框
        $qcaList.on('click', '.operating', function () {
            var $context = $(this),
                id = $context.attr('data-id'),
                pid = $context.attr('data-pid');

            if ($context.hasClass('p-bg')) {
                $spmResult.append(
                        '<input type="hidden" name="pid" value="'+ pid +'">' +
                        '<input type="hidden" name="change" value="true">'
                );
            } else {
                $spmResult.append(
                        '<input type="hidden" name="pid" value="'+ id +'">' +
                        '<input type="hidden" name="distribute" value="true">'
                );
            }

            $spmModal.modal({
                show: true
            });
            findQcList("");
            return false;
        });

        // 再次显示时，清空上次结果
        $spmModal.on('hidden.bs.modal', function (e) {
            $spmForm.get(0).reset();
            $spmModal.find('input[type=hidden]').remove();
            $changeList.find('tbody').html(
                    '<tr class="data-message">' +
                    '<td colspan="50">搜索品控人员，然后再变更！</td>' +
                    '</tr>'
            );
        });

        // 搜索品控人员
        $spmForm.on('submit', function () {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            findQcList($("#name").val());

            return false;
        });

        window.findQcList=findQcList;
        function findQcList(name){

            $.ajax($.extend({
                //url: apiHost + '/hoss/sys/pKManager/getQualityFrame.do',
                url: apiHost + '/hoss/project/assing/selectQcList.do?name='+name,
                beforeSend: function () {
                    $(this).find('input[type=submit]').attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        var templateId = (
                            $.isArray(dataObj.content) &&
                            dataObj.content.length
                            ) ? 'changeListTemplate' : 'messageTemplate';

                        // 显示数据
                        $changeList.find('tbody').html(
                            template(templateId, data)
                        );

                        $spmResult.find('input[type=submit]')
                            .removeAttr('disabled');
                    }

                    function useless(data) {
                        systemMessage(data.detail || '搜索品控人员失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '搜索品控人员失败！');
                })
                .always(function () {
                    $(this).find('[disabled]').attr('disabled', 'disabled');
                    $(this).find('input[type=submit]').removeAttr('disabled').blur();
                });
        }

        // 变更、指定品控人员
        $spmResult.on('submit', function () {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $change = $context.find('input[name=change]'),
                $submit = $context.find('input[type=submit]'),

                pid = $context.find('input[name=pid]').val(),
                uid = $context.find('input[name=uid]:checked').val(),
                dataUrl = '',
                dataObj = {};

            if ($submit.hasClass('disabled')) {
                return false;
            }

            if (!pid || !uid) {
                systemMessage('请选择品控人员！');
                return false;
            }

            $disabled.removeAttr('disabled');

            if ($change.length) {
                dataUrl = '/hoss/project/assing/changeSysUser2Project.do';
                dataObj.sysUserProjectId = pid;
                dataObj.newSysUserId = uid;
            } else {
                dataUrl = '/hoss/project/assing/addSysUser2Projects.do';
                dataObj.projectIds = pid;
                dataObj.sysUserId = uid;
            }

            $.ajax($.extend({
                url: apiHost + dataUrl,
                data: dataObj,
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '操作成功！'
                        });

                        $spmModal.modal('hide');

                        if (pid.indexOf(',') === -1) {
                            var zdBtn = $('[data-id='+ pid +']');

                            if ($change.length) {
                                $qcaSearchForm.submit();
                            } else {
//                                zdBtn.parents('tr').remove();
                                $qcaSearchForm.submit();
                            }
                        } else {
                            $qcaSearchForm.submit();
                            $selectAll.attr('checked', false);
                        }

                    }

                    function useless(data) {
                        systemMessage(data.detail || '变更或指定品控人员失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '变更或指定品控人员失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

            return false;
        });


    });





});