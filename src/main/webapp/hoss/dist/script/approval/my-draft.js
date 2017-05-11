define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;
    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var modal = require('bootstrap/modal');
    var template = require('template');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var areaPicker = require('area-picker');
    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var flowStatus = workflowProp.flowStatus;
    template.helper("flowStatus",flowStatus);//对template增加全局变量或方法


    function domReady(){

        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination');

        // 更新查询条件时，页码返回第一页
        $searchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });

        workflowProp.getDefinitions('processKey');

        var $province = $('#province'),
            $city = $('#city');

        areaPicker.provinceToCity($province, $city);


        // 已发申请列表
        $searchForm.on('submit', function(event){
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
                url: apiHost + '/hoss/wfTask/listMyDraft.do',
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
                            ) ? 'searchResultTemplate' : 'messageTemplate';

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

                        // 启用，禁用
                        $searchResultList.find('[data-toggle="confirmation"]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                deleteMyDraft.isConfirm = false;
                                $(element).on('click.deleteMyDraft', deleteMyDraft);
                            },
                            onHide: function (event, element) {
                                deleteMyDraft.isConfirm = false;
                                $(element).off('.deleteMyDraft');
                            },
                            onConfirm: function (event, element) {
                                deleteMyDraft.isConfirm = true;
                                $(element).trigger('click.deleteMyDraft');
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
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');

        // 编辑流程
        $searchResultList.on('click', '.btn-edit', function (event) {
            if (event) {
                event.preventDefault();
            }
            var wfInstanceId = $(this).attr('data-wfInstanceId');
            var businessKey = $(this).attr('data-businessKey');
            var taskId = $(this).attr('data-taskId');
            var url = webHost + $(this).attr('data-url');
            location.href = url;
        });

        function deleteMyDraft() {

            if (!deleteMyDraft.isConfirm) {
                return false;
            }
            deleteMyDraft.isConfirm = false;

            var $that = $(this),
                taskId = $that.attr('data-taskId'),
                wfInstanceId = $that.attr('data-wfInstanceId');
//            console.log(taskId);
            $.ajax($.extend({
                url: apiHost + '/hoss/wfTask/deleteMyDraft.do',
                data: {
                    taskId:taskId,
                    wfInstanceId: wfInstanceId
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        if (result.status === '1') {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '删除草稿成功！'
                            });
                            $searchForm.trigger('submit');
                        }
                    }

                    function useless(data) {
                        systemMessage('删除草稿出错！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '删除草稿出错！');
                })
                .always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }
    }


    $(document).ready(domReady);

});