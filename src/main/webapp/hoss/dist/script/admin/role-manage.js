define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var $ = require('jquery');
    var navigation = require('navigation');
    var template = require('template');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var modal = require('bootstrap/modal');
    var confirmation = require('bootstrap/confirmation');
    var pagination = require('pagination');
    var systemMessage = require('system-message');

    function domReady() {
        var $allrolelist = $('#allrolelist'),
            $roleuserlist = $('#roleuserlist'),
            $roleuserlistForm = $('#roleuserlistForm'),
            $addUserAllList = $('#addUserAllList'),

            $addUserAllListForm = $('#addUserAllListForm'),

            $roleName = $('#roleName'),
            $roleAdmin = $('#roleAdmin'),
            $pageNum = $roleuserlistForm.find('input[name=page]'),
            $pageSize = $roleuserlistForm.find('input[name=size]'),
            $roleId = $roleuserlistForm.find('input[name=roleId]'),

            $addpageNum = $addUserAllListForm.find('input[name=page]'),
            $addpageSize = $addUserAllListForm.find('input[name=size]'),
            $selectUser = $addUserAllListForm.find('input[name=selectUser]'),

            $addroleId = $addUserAllList.find('input[name=addroleId]'),

            $searchResultPagination = $('#searchResultPagination'),
            $addsearchResultPagination = $('#addsearchResultPagination'),
            roleResultTemplate = 'roleResultTemplate',
            roleMessageTemplate = 'roleMessageTemplate',
            userResultTemplate = 'userResultTemplate',
            userMessageTemplate = 'userMessageTemplate',
            addUserResultTemplate = 'addUserResultTemplate';

        // 获取所有角色列表
        function getAllRoleList() {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getAllRoleList.do',
                beforeSend: function () {
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};
                    templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                        roleResultTemplate :
                        roleMessageTemplate;
                    $roleName.html('角色：' + dataObj.content[0].name);
                    getUserListByRoleId(dataObj.content[0].id, $pageNum.val(), $pageSize.val());

                    // 显示数据
                    $allrolelist.html(
                        template(templateId, data)
                    );
                    //$('#rolelist').find('.btn-user-view').eq(0).addClass('focus');
                    //$rolelist.find("a")[0].addClass("focus");
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取角色列表出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取角色列表失败！');
            });
        }


        // 根据角色ID获取用户分页列表
        function getUserListByRoleId(roleId, page, size) {
            $roleId.val(roleId);
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getUserListByRoleId.do',
                data: {
                    roleId: roleId,
                    page: page,
                    size: size
                },
                beforeSend: function () {
                    $roleuserlist.find('tbody').html(
                            '<tr class="data-loading text-center">' +
                            '<td colspan="100">数据加载中...</td>' +
                            '</tr>'
                    );
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {},
                        templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                            userResultTemplate :
                            userMessageTemplate;
                    // 显示数据
                    $roleuserlist.find('tbody').html(
                        template(templateId, data)
                    );
                    // 显示分页
                    $searchResultPagination.pagination({
                        $form: $roleuserlistForm,
                        totalSize: dataObj.totalElements,
                        pageSize: parseInt($pageSize.val()),
                        visiblePages: 5,
                        info: true,
                        paginationInfoClass: 'pagination-count pull-left',
                        paginationClass: 'pagination pull-right',
                        onPageClick: function (event, index) {
                            $pageNum.val(index - 1);
                            getUserListByRoleId(roleId, $pageNum.val(), size);
                        }
                    });

                    // 移除
                    $roleuserlist.find('.btn-user-role-del[data-toggle=confirmation]').confirmation({
                        btnOkLabel: '确认',
                        btnCancelLabel: '取消',
                        onShow: function (event, element) {
                            removeRoleUserRelationByUserIdAndRoleId.isConfirm = false;
                            $(element).on('click.toggleUserStatus', removeRoleUserRelationByUserIdAndRoleId);
                        },
                        onHide: function (event, element) {
                            removeRoleUserRelationByUserIdAndRoleId.isConfirm = false;
                            $(element).off('.toggleUserStatus');
                        },
                        onConfirm: function (event, element) {
                            removeRoleUserRelationByUserIdAndRoleId.isConfirm = true;
                            $(element).trigger('click.toggleUserStatus');
                        }
                    });
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '根据角色获取用户列表出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '根据角色获取用户列表失败！');
            });
        }

        // 显示所有角色列表
        getAllRoleList();

        $roleAdmin.on('click', '.btn-user-view', function (event) {
            var $this = $(this);
            $('#rolelist').find('.btn-user-view').removeClass('focus');
            $("#roleName").text($this.text());
            $this.addClass("focus");
            getUserListByRoleId($this.attr('data-id'), $pageNum.val(), $pageSize.val());
        });

        $('#addRoleOperator').on('click', function (event) {
            $('#addRoleForm').find('[name=roleName]').val("");
            $('#addRoleDiv').modal('show');
        });

        $('#addRoleForm').on('submit', function (event) {
            var roleName = $.trim($('#addRoleForm').find('[name=roleName]').val()),
                errorInfo = function (msg) {
                    return {
                        type: 'error',
                        title: '新增角色：',
                        detail: msg
                    };
                };

            if (event) {
                event.preventDefault();
            }

            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');


            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            if (roleName == "") {
                systemMessage(errorInfo('角色名称不能为空！'));
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/addRole.do',
                data: {
                    name: roleName
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'done',
                            title: '提示：',
                            detail: data.detail || '添加角色成功！'
                        });
                        getAllRoleList();
                        $('#addRoleDiv').modal('hide');
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '添加角色失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '添加角色失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
        });

        var $delRoleOperator = $('#delRoleOperator');
        $delRoleOperator.confirmation({
            btnOkLabel: '确认',
            btnCancelLabel: '取消',
            onShow: function (event, element) {
                delRoleById.isConfirm = false;
                $(element).on('click.delRoleById', delRoleById);
            },
            onHide: function (event, element) {
                delRoleById.isConfirm = false;
                $(element).off('.delRoleById');
            },
            onConfirm: function (event, element) {
                delRoleById.isConfirm = true;
                $(element).trigger('click.delRoleById');
            }
        });

        $delRoleOperator.on('shown.bs.confirmation', function () {
            var errorInfo = function (msg) {
                return {
                    type: 'error',
                    title: '删除：',
                    detail: msg
                };
            };
            var roleId = $('#rolelist').find('.focus').attr('data-id');
            if (!roleId) {
                systemMessage(errorInfo('请选择你要删除的角色！'));
                $delRoleOperator.confirmation('hide');
            }
        });

        function delRoleById() {
            if (!delRoleById.isConfirm) {
                return false;
            }
            delRoleById.isConfirm = false;

            var errorInfo = function (msg) {
                return {
                    type: 'error',
                    title: '删除角色：',
                    detail: msg
                };
            };

            var roleId = $('#rolelist').find('.focus').attr('data-id');
            if (!roleId) {
                systemMessage(errorInfo('请选择你要删除的角色！'));
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/deleteRole.do',
                data: {
                    roleId: roleId
                },
                beforeSend: function () {
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    systemMessage({
                        type: 'done',
                        title: '提示：',
                        detail: data.detail || '删除角色成功！'
                    });
                    getAllRoleList();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '删除角色失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '删除角色失败！');
            }).
            always(function () {
            });
        }

        var $disableRolOperatore = $('#disableRolOperatore');
        $disableRolOperatore.confirmation({
            btnOkLabel: '确认',
            btnCancelLabel: '取消',
            onShow: function (event, element) {
                disableRol.isConfirm = false;
                $(element).on('click.disableRol', disableRol);
            },
            onHide: function (event, element) {
                disableRol.isConfirm = false;
                $(element).off('.disableRol');
            },
            onConfirm: function (event, element) {
                disableRol.isConfirm = true;
                $(element).trigger('click.disableRol');
            }
        });

        $disableRolOperatore.on('shown.bs.confirmation', function () {
            var errorInfo = function (msg) {
                return {
                    type: 'error',
                    title: '禁用：',
                    detail: msg
                };
            };
            var roleId = $('#rolelist').find('.focus').attr('data-id');
            if (!roleId) {
                systemMessage(errorInfo('请选择你要禁用的角色！'));
                $disableRolOperatore.confirmation('hide');
            }
        });

        function disableRol() {
            if (!disableRol.isConfirm) {
                return false;
            }
            disableRol.isConfirm = false;

            var errorInfo = function (msg) {
                return {
                    type: 'error',
                    title: '禁用：',
                    detail: msg
                };
            };

            var roleId = $('#rolelist').find('.focus').attr('data-id');
            if (!roleId) {
                systemMessage(errorInfo('请选择你要禁用的角色！'));
                $('#disableRolOperatore').confirmation('hide');
                return false;
            }
            updateRoleById(roleId, 1);
        }

        $('#enableRoleOperator').on('click', function (event) {
            var errorInfo = function (msg) {
                return {
                    type: 'error',
                    title: '启用角色：',
                    detail: msg
                };
            };
            if (event) {
                event.preventDefault();
            }

            var roleId = $('#rolelist').find('.focus').attr('data-id');
            if (!roleId) {
                systemMessage(errorInfo('请选择你要启用的角色！'));
                return false;
            }
            updateRoleById(roleId, 0);
        });

        function updateRoleById(roleId, type) {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/enableDisableRole.do',
                data: {
                    roleId: roleId,
                    disabled: type
                },
                beforeSend: function () {
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    systemMessage({
                        type: 'done',
                        title: '提示：',
                        detail: data.detail || '更新角色状态成功！'
                    });
                    getAllRoleList();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '更新角色状态失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '更新角色状态失败！');
            }).
            always(function () {
            });
        }

        //显示添加用户
        $roleAdmin.on('click', '.role-user-set', function (event) {
            findAllUserList("", $addpageNum.val(), $addpageSize.val());
            $addroleId.val($roleId.val());
        });

        //添加用户查询
        $addUserAllList.on('click', '.btn-default', function (event) {
            $addUserAllList.modal('show');
            $addpageNum.val('0');
            findAllUserList($addUserAllList.find('input[name=keywords]').val(), $addpageNum.val(), $addpageSize.val());
        });

        //提交添加
        $addUserAllList.on('click', '.btn-submit', function (event) {

            var errorInfo = function (msg) {
                return {
                    type: 'error',
                    title: '添加用户：',
                    detail: msg
                };
            };

            var selUserIds = $selectUser.val();
            var rid = $addroleId.val();
            var userlist = $('input[type="checkbox"]');
            var flag = false;
            $.each(userlist, function (j, aitem) {
                if ($(aitem).prop('checked') == true) {
                    flag = true;
                }
            });
            if (flag == false) {
                systemMessage(errorInfo('请选择至少选择一个用户再进行操作！'));
                return;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/setRoleUserRelation.do',
                data: {
                    roleId: rid,
                    userIds: selUserIds
                },
                beforeSend: function () {
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    systemMessage({
                        type: 'done',
                        title: '提示：',
                        detail: data.detail || '添加角色用户成功！'
                    });
                    getUserListByRoleId(rid, $pageNum.val(), $pageSize.val());
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '添加角色用户失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '添加角色用户失败！');
            }).
            always(function () {
            });
        });

        // 获取所有待添加用户列表
        function findAllUserList(queryKey, page, size) {

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/openSetRoleUserRelation.do',
                data: {
                    roleId: $roleId.val(),
                    queryKey: queryKey,
                    page: page,
                    size: size
                },
                beforeSend: function () {}
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {},
                        templateId = ($.isArray(dataObj.pageList.content) && dataObj.pageList.content.length) ?
                            addUserResultTemplate :
                            userMessageTemplate;

                    // 显示数据
                    $addUserAllList.find('tbody').html(
                        template(templateId, data)
                    );
                    var selIserIds = selectUser(data.data.userList);
                    $selectUser.val(selIserIds);


                    // 显示分页
                    $addsearchResultPagination.pagination({
                        $form: $addUserAllListForm,
                        totalSize: dataObj.pageList.totalElements,
                        pageSize: parseInt($addpageSize.val()),
                        visiblePages: 5,
                        info: true,
                        paginationInfoClass: 'pagination-count pull-left',
                        paginationClass: 'pagination pull-right',
                        onPageClick: function (event, index) {
                            $addpageNum.val(index - 1);
                            findAllUserList(queryKey, $addpageNum.val(), size);
                        }
                    });
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取用户列表出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取用户列表出错！');
            });
        }

        function selectUser(user) {
            var selectUserIds = "";
            $.each(user, function (i, item) {
                selectUserIds = selectUserIds + item.id + ",";
                var alluser = $('input[type="checkbox"]');
                $.each(alluser, function (j, aitem) {
                    if (item.id == aitem.value) {
                        $(aitem).prop('checked', true);
                    }
                });
            });
            return selectUserIds;
        }

        $addUserAllList.on('click', '.class-checked', function (event) {
            var $self = $(this);
            var v = $selectUser.val();
            if ($self.prop('checked') == true) {
                $selectUser.val(v + $self.attr('value') + ",")
            } else {
                $selectUser.val($selectUser.val().replace($self.attr('value') + ',', ''));
            }
        });

        function removeRoleUserRelationByUserIdAndRoleId() {
            var errorInfo = function (msg) {
                return {
                    type: 'error',
                    title: '启用角色：',
                    detail: msg
                };
            };

            var roleId = $roleId.val();
            var userId = $(this).attr('data-user-id');
            if (!roleId || roleId == "" || !userId || userId == "") {
                systemMessage(errorInfo('参数不对！'));
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/removeRoleUserRelationByUserIdAndRoleId.do',
                data: {
                    roleId: roleId,
                    userId: userId
                },
                beforeSend: function () {
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    systemMessage({
                        type: 'done',
                        title: '提示：',
                        detail: data.detail || '删除用户角色关联成功！'
                    });
                }

                getUserListByRoleId(roleId, $pageNum.val(), $pageSize.val());
                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '删除用户角色关联失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '删除用户角色关联失败！');
            }).
            always(function () {
            });
        }

    }

    $(document).ready(domReady);
});
