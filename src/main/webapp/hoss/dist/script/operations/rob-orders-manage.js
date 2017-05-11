define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');

    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination'),
        modal = require('bootstrap/modal'),
        confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');



    $(document).ready(function () {
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResult = $('#searchResult'),
            $page = $('#page');


        // 禁用--》启用
        // 启用--》禁用
        function toggleUserStatus() {

            if (!toggleUserStatus.isConfirm) {
                return false;
            }
            toggleUserStatus.isConfirm = false;

            var $that = $(this),
                $curStatus = $that.parents('tr').children('.curStatus'),
                uid = $.trim($that.attr('data-uid')),
                curStatus = $.trim($that.attr('data-status')),
                newStatus = curStatus === 'on' ? 'off' : 'on',
                oppStatus = curStatus === 'on' ? 'on' : 'off',
                statusTxt = {'on': '启用', 'off': '禁用'},
                className = {'on': 'disable', 'off': 'enable'},
                unStyle = {'on': 'btn-danger', 'off': 'btn-success'};


            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pa/updateAgentSalesStatus.do',
                data: {
                    agentSalesId: uid
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var result = data || {};

                        if (result.status === '1') {
                            $that.removeClass('disable enable btn-success btn-danger')
                                .addClass(className[newStatus])
                                .addClass(unStyle[newStatus])
                                .attr('data-status', newStatus)
                                .html(statusTxt[curStatus]);

                            $that.next().removeClass('btn-success btn-danger').addClass(unStyle[oppStatus]);

                            $curStatus.html(statusTxt[newStatus]);
                        }

                        $searchForm.submit();
                    }

                    function useless(data) {
                        systemMessage(data.detail || '更新状态出错！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新状态失败！');
                })
                .always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }


        // 列表
        $searchForm.on('submit', function(){
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pa/getAgentSalesList.do',
                data: $context.serialize(),
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
                        $searchResult.find('tbody').html(
                            template(templateId, data)
                        );

                        // 分页
                         $page.pagination({
                            $form: $searchForm,
                            totalSize: dataObj.totalElements,
                            pageSize: parseInt($pageSize.val()),
                            visiblePages: 5,
                            info: false,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $pageNum.val(index - 1);
                                $searchForm.trigger('submit');
                            }
                        });

                        // 启用，禁用
                        // /hoss/sys/pa/updateAgentSalesStatus.do
                        $searchResult.find('[data-toggle="confirmation"]').confirmation({
                            btnOkLabel: '确认',
                            btnCancelLabel: '取消',
                            onShow: function (event, element) {
                                toggleUserStatus.isConfirm = false;
                                $(element).on('click.toggleUserStatus', toggleUserStatus);
                            },
                            onHide: function (event, element) {
                                toggleUserStatus.isConfirm = false;
                                $(element).off('.toggleUserStatus');
                            },
                            onConfirm: function (event, element) {
                                toggleUserStatus.isConfirm = true;
                                $(element).trigger('click.toggleUserStatus');
                            }
                        });

                    }

                    function useless(data) {
                        systemMessage(data.detail || '获取列表数据失败！');
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

            return false;
        }).submit();


        // 添加
        // /hoss/sys/getProjectList.do
        var $createAccountForm = $('#createAccountForm'),
            $createAccountModal = $('#createAccountModal'),
            $projectList = $('#projectList'),
            $projectList2 = $('#projectList2');

        // 获取项目列表
        /*$.ajax($.extend({
            url: apiHost + '/hoss/sys/getProjectList.do',
            success: function(data){
                doneCallback.call(
                    this,
                    data,
                    function (data) {
                        $projectList.html(
                            template('projectTemplate', data)
                        );
                        $projectList2.html(
                            template('projectTemplate', data)
                        );
                    },
                    function (data) {
                        systemMessage(data.detail || '获取项目列表失败');
                    }
                );
            },
            error: function(jqXHR){
                failCallback.call(this, jqXHR, '获取项目列表失败');
            },
            complete: function(){
                // $city.removeAttr('disabled');
            }
        }, jsonp));*/

        $createAccountForm.on('click', '.btn-success', function () {
            var $that = $(this),
                html = '<tr class="add-item">' +
                    '<td><input class="form-control" type="text" name="agentName" maxlength="30" placeholder="姓名"></td>' +
                    '<td><input class="form-control" type="text" name="phone" maxlength="11" placeholder="手机号码"></td>' +
                    '<td>' +
                    '<button class="btn btn-danger">删除</button>' +
                    '</td>' +
                    '</tr>';

            $createAccountForm.find('tbody').append(html);

            return false;
        });

        $createAccountForm.on('click', '.btn-danger', function () {
            var $that = $(this),
                tr = $that.parents('.add-item');

            tr.remove();
        });

        // /hoss/sys/pa/addAgentSales.do
        $createAccountForm.on('submit', function () {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            var projectId = $("#projectId").val(),
                $agentName = $context.find('[name=agentName]'),
                $phone = $context.find('[name=phone]'),
                agentSaleList = '[';

            if (projectId === '') {
                systemMessage('请选择项目！');
                return false;
            }



            $.each($agentName, function (i, n) {
                if (n.value && $phone.eq(i).val()) {
                    agentSaleList += '{agentName:"'+ n.value +'",phone:"'+ $phone.eq(i).val() +'"}';
                    if (i < $agentName.length - 1) {
                        agentSaleList += ',';
                    }
                }
            });

            agentSaleList += ']';

            if ('[]' === agentSaleList) {
                systemMessage('输入姓名与手机号码！');
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pa/addAgentSales.do',
                data:$context.serializeArray(),
                //processData: false,
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        var dataObj = data || {};

                        if (data.status === '1') {
                            systemMessage(data.detail || '添加成功');
                            $createAccountModal.modal('hide');
                            $page.find('.page-active').click();
                        }

                    }

                    function useless(data) {
                        systemMessage(data.detail || '添加失败！');
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '添加失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

            return false;
        });

        // 再次显示时，清空上次结果
        $createAccountModal.on('hidden.bs.modal', function (e) {
            $createAccountForm.get(0).reset();
            // $createAccountForm.find('.error').removeClass('error');
        });

        $("#createImportForm").on('submit', function () {

            $("#createImportForm").attr("action",apiHost+"/hoss/sys/parseAgentExcel.do");
            $("#createImportForm").submit;
            return true;
        });

        // 导入
        var $createImportModal = $('#createImportModal'),
            $post_submit = $('#post_submit'),
            $newAddList = $('#newAddList'),
            $createImportForm = $('#createImportForm');


        $createImportModal.on('hidden.bs.modal', function (e) {
            $createImportForm.get(0).reset();
        });

        window.handlePostCallback = function (data) {
            switch (data.status) {
                case '1':
                    $newAddList.find('tbody').html(
                        template('newAddTemplate', data)
                    );
                    $createImportForm.get(0).reset();
                    systemMessage('导入成功！');
                    $createImportModal.modal('hide');
                    $page.find('.page-active').click();
                    break;
                case '0':
                    systemMessage(data.detail || '导入失败！');
                    break;
                default :
                    systemMessage(data.detail || '操作异常！');
                    break;
            }

            $post_submit.removeAttr('src');
        };

        window.editAgent=editAgent;
        function editAgent (self, agentId,agentIdName,agentIdPhone){
            if($(self).hasClass("btn-success")){
                $("#editAccountModal").show();
                $("#editId").val(agentId);
                $("#editName").val(agentIdName);
                $("#editPhone").val(agentIdPhone);
                $("#editAccountModal").modal("show");
            }
        }

        window.closeEdit=closeEdit;
        function closeEdit(){
            $("#editAccountModal").modal('hide');
        }

        $("#editAccountForm").on('submit', function () {
            var id = $("#editId").val();
            var name = $("#editName").val();
            if(""==id){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '无法获取id，请重新点击编辑按钮进行修改'
                });
                return false;
            }
            if(""==name){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '姓名不能为空'
                });
                return false;
            }


            $.ajax($.extend({
                url: apiHost + '/hoss/sys/agentUpdateName.do?agentId='+ id+"&agentName="+name,
                beforeSend: function () {}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        if (data.status === '1') {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '修改信息成功！'
                            });
                            $('#editAccountModal').modal('hide');
                            location.reload();
                        } else {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '修改信息失败！'
                            });
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '修改信息失败！'
                        });
                        $('#editAccountModal').modal('hide');
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '修改信息失败！');
                    $('#editAccountModal').modal('hide');
                });

            return false;
        });


        // 全选、返选
        var $selectedCheckbox = $('#selectedCheckbox'),
            $selectAll = $('#selectAll');

        $selectAll.attr('checked', false);


        $searchResult.on('click', '#selectAll', function () {
            var $context = $(this),
                $checkbox = $searchResult.find('tbody [type=checkbox]'),
                ids = [];

            $checkbox.prop("checked", $context.prop("checked"));

            if ($context.prop("checked")) {
                $.each($checkbox, function (i, n) {
                    ids.push(n.value);
                });
            }

            $selectedCheckbox.attr('data-id', ids.join(','));
        });

        // 取消一条或多条
        $searchResult.on('click', 'tbody [type=checkbox]', function () {
            var $checkbox = $searchResult.find('tbody [type=checkbox]'),
                ids = [];

            $.each($checkbox, function (i, n) {
                if ($(n).prop('checked')) {
                    ids.push(n.value);
                } else {
                    $selectAll.removeAttr('checked');
                }
            });

            $selectedCheckbox.attr('data-id', ids.join(','));
        });

        $selectedCheckbox.on('click', function () {
            var $context = $(this),
                ids = $context.attr('data-id');

            if (!ids) {
                return false;
            }

            return false;
        });

        /**
         * 禁用状态
         * @returns {boolean}
         */
        function disableAgents() {

            if (!disableAgents.isConfirm) {
                return false;
            }
            disableAgents.isConfirm = false;

            var $that = $(this),
                uid = $.trim($that.attr('data-id'));

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/pa/disableAgentSales.do',
                data: {
                    agentSalesIds: uid
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
                            detail: data.detail || '禁用出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '禁用失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });

            return false;
        }

        // 批量禁用
        $searchResult.find('.btn-danger[data-toggle="confirmation"]').confirmation({
            btnOkLabel: '确认',
            btnCancelLabel: '取消',
            onShow: function (event, element) {
                disableAgents.isConfirm = false;
                $(element).on('click.batchReceivables', disableAgents);
            },
            onHide: function (event, element) {
                disableAgents.isConfirm = false;
                $(element).off('.batchReceivables');
            },
            onConfirm: function (event, element) {
                disableAgents.isConfirm = true;
                $(element).trigger('click.batchReceivables');
            }
        });

    });

    require(['autocomplete'], function () {
        $(document).ready(function () {
            $('#projectList').autocomplete({
                paramName: 'projectTitle',
                dataType: 'jsonp',
                serviceUrl: apiHost + '/hoss/sys/getProjectList.do',
                width: 300,
                maxHeight: 400,
                transformResult: function(response, originalQuery) {
                    return {
                        query: originalQuery,
                        suggestions: $.map(response.data.content, function(dataItem) {
                            return { value: dataItem.title+"-"+dataItem.cityName, data: dataItem.id };
                        })
                    };
                },
                onSelect: function (suggestion) {
                    $('#projectId').val(suggestion.data);
                     //alert(suggestion.data);
                }
            });
            $('#projectList2').autocomplete({
                paramName: 'projectTitle',
                dataType: 'jsonp',
                serviceUrl: apiHost + '/hoss/sys/getProjectList.do',
                width: 300,
                maxHeight: 400,
                transformResult: function(response, originalQuery) {
                    return {
                        query: originalQuery,
                        suggestions: $.map(response.data.content, function(dataItem) {
                            return { value: dataItem.title, data: dataItem.id };
                        })
                    };
                },
                onSelect: function (suggestion) {
                    $('#projectId2').val(suggestion.data);
                    //alert(suggestion.data);
                }
            });
        });
    });
});