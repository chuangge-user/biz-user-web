define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    var pagination = require('pagination');
    var systemMessage = require('system-message');
    var ztree = require('ztree');

    var modal = require('bootstrap/modal');
    var confirmation = require('bootstrap/confirmation');

    // 绑定加盟数据省市
    var areaPicker = require('area-picker');
    var $province = $('#provinceId'),
        $city = $('#cityId');
    areaPicker.provinceToCity($province, $city);
    // 已经选中的加盟公司
    var selectCompanyIds=[];




    function domReady() {
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate';

        // 获取员工管理列表
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
                url: apiHost + '/hoss/sys/getAllUserList.do',
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
                        $form: $searchForm,
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

                    // 员工禁用/启用
                    $searchResultList.find('.btn-status[data-toggle=confirmation]').confirmation({
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

        // 更新查询条件时，页码返回第一页
        $searchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });



        // 部门设置
        var $departmentModal = $('#departmentModal'),
            $departmentTree = $('#departmentTtee'),
            $departmentForm = $('#departmentForm'),
            treeObj,
            treeNodeClick = function (event, treeId, treeNode) {
                if (!treeNode.id) {
                    return false;
                }

                treeObj.checkNode(treeNode, true, true);
            },
            treeSetting = {
                data: {
                    key: {
                        children: 'chlidren',
                        name: 'name'
                    }
                },
                check: {
                    enable: true
                },
                callback: {
                    onClick: treeNodeClick
                }
            };


        $searchResultList.on('click', '.btn-set-department', function (event) {
            var $context = $(this),
                userId = $context.attr('data-userid');

            if (event) {
                event.preventDefault();
            }

            if (!userId) {
                systemMessage({
                    type: 'error',
                    title: '提示：',
                    detail: '缺少用户ID！'
                });
                return false;
            }

            // 获取部门树
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/openSetUserDepartmentRelation.do',
                data: {
                    userId: userId
                },
                beforeSend: function () {
                    $departmentForm.attr('data-userid', userId);
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};
                    var treeAllNodes,
                        currentNode;

                    if ($.isArray(dataObj.departmentTree) &&
                        dataObj.departmentTree.length) {
                        treeObj = $.fn.zTree.init(
                            $departmentTree,
                            treeSetting,
                            dataObj.departmentTree
                        );

                        // treeObj.expandAll(true);
                        // 打开根节点
                        treeObj.expandNode(
                            treeObj.getNodes()[0],
                            // treeObj.getNodeByParam('id', -1),
                            true,
                            false,
                            false
                        );

                        treeAllNodes = treeObj.getNodes();
                    } else {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '部门信息不存在！'
                        });
                    }

                    if (treeAllNodes) {
                        $.each(dataObj.departmentList || [], function (i, item) {
                            if (item.id) {
                                currentNode = treeObj.getNodeByParam('id', item.id);
                                treeObj.checkNode(
                                    currentNode,
                                    true,
                                    true
                                );
                                /*
                                if (currentNode.isParent) {
                                    treeObj.expandNode(
                                        currentNode,
                                        true,
                                        true,
                                        true
                                    );
                                } else {
                                    treeObj.expandNode(
                                        currentNode.getParentNode(),
                                        true,
                                        true,
                                        true
                                    );
                                }
                                */
                            }
                        });
                    }

                    $departmentModal.modal('show');
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取部门出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取部门失败！');
            }).
            always(function () {});
        });

        $departmentForm.on('submit', function (event) {
            var $context = $(this),
                $submit = $context.find('input[type=submit]'),
                userId = $context.attr('data-userid');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            var treeAllNodes = treeObj.getNodes(),
                getSelectedNodes = function (treeAllNodes) {
                    var selectedNodes = [],
                        recursion = function (tree) {
                        var i = 0,
                            il = tree.length,
                            item,
                            status;

                        for (; i < il; i += 1) {

                            item = tree[i];
                            status = item.getCheckStatus();

                            if (status.checked) {
                                if (!status.half) {
                                    selectedNodes.push(item.id);
                                } else if (item.chlidren && status.half) {
                                    recursion(item.chlidren);
                                }
                            }

                        }
                    };

                    recursion(treeAllNodes);

                    return selectedNodes;
                },
                departIds = getSelectedNodes(treeAllNodes).join(',');

            if (!userId || !departIds) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '缺少部门ID！'
                });
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/setUserDepartmentRelation.do',
                data: {
                    userId: userId,
                    departIds: departIds
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled').addClass('disabled');
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    $departmentModal.modal('hide');
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '部门设置失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '部门设置失败！');
            }).
            always(function () {
                $submit.removeAttr('disabled').removeClass('disabled').blur();
            });
        });



        // 职位设置
        var $positionModal = $('#positionModal'),
            $positionList = $('#positionList'),
            positionListTemplate = 'positionListTemplate',
            $positionPageList = $('.position-page-list'),
            $positionPageAdd = $('.position-page-add'),
            $btnShowAdd = $('.btn-show-add'),
            $positionPageSetting = $('.position-page-setting'),
            $positionPage = $('.position-page'),
            showPositionPage = function ($elem) {
                $positionPage.addClass('hide');
                $elem.removeClass('hide');
            };

        $searchResultList.on('click', '.btn-set-position', function (event) {
            var $context = $(this),
                userId = $context.attr('data-userid');

            if (event) {
                event.preventDefault();
            }

            $setUserPositionForm.attr('data-userid', userId);

            openSetUserPosition(userId, function (data) {
                $positionModal.modal('show');
            });

        });

        function openSetUserPosition(userId, callback) {
            if (!userId) {
                systemMessage({
                    type: 'error',
                    title: '提示：',
                    detail: '缺少用用户ID！'
                });
                return false;
            }

            // 获取职位列表
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/openSetUserPositionRelation.do',
                data: {
                    userId: userId
                },
                beforeSend: function () {
                    $roleListForm.attr('data-userid', userId);
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {},
                        templateId = ($.isArray(dataObj.content) && dataObj.content.length) ?
                            positionListTemplate :
                            messageTemplate;

                    $positionList.find('tbody').html(
                        template(templateId, data)
                    );

                    $btnShowAdd.attr('data-userid', userId);

                    showPositionPage($positionPageList);

                    if ($.isFunction(callback)) {
                        callback(data);
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取职位列表出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取职位列表失败！');
            }).
            always(function () {});
        }

        // 添加职位
        var $addPosition = $('#addPosition'),
            $addPositionForm = $('#addPositionForm'),
            positionTreeObj,
            positionTreeNodeClick = function (event, treeId, treeNode) {
                if (!treeNode.id) {
                    return false;
                }

                positionTreeObj.checkNode(treeNode, true, true);
            },
            positionTreeSetting = {
                data: {
                    key: {
                        children: 'chlidren',
                        name: 'name'
                    }
                },
                check: {
                    enable: true,
                    chkStyle: 'radio',
                    radioType: 'all'
                },
                callback: {
                    onClick: positionTreeNodeClick
                }
            };

        // 显示职位树
        $positionList.on('click', '.btn-show-add', function (event) {
            var $context = $(this),
                userId = $context.attr('data-userid');

            if (event) {
                event.preventDefault();
            }

            if (!userId) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '缺少用户ID！'
                });
                return false;
            }

            $addPositionForm.find('input[name=userId]').val(userId);

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getAllPositionList.do',
                data: {
                    userId: userId
                },
                beforeSend: function () {}
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if ($.isArray(dataObj.content) &&
                        dataObj.content.length) {
                        positionTreeObj = $.fn.zTree.init(
                            $addPosition,
                            positionTreeSetting,
                            dataObj.content
                        );

                        positionTreeObj.expandAll(true);

                        showPositionPage($positionPageAdd);
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取员工职位列表出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取员工职位列表失败！');
            });
        });

        // 添加职位，并更新列表
        $addPositionForm.on('submit', function (event) {
            var $context = $(this),
                $submit = $context.find('input[type=submit]'),
                userId = $context.find('input[name=userId]').val();

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            var selectedNodes = positionTreeObj.getCheckedNodes(true);

            if (selectedNodes && selectedNodes.length) {
                $context.
                    find('input[name=positionIds]').
                    val(selectedNodes[0].id);
            } else {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请选择职位！'
                });
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/setUserPositionRelation.do',
                data: $context.serialize(),
                beforeSend: function () {
                    $submit.addClass('disabled');
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    openSetUserPosition(userId);
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '添加职位失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '添加职位失败！');
            }).
            always(function () {
                $submit.removeClass('disabled').blur();
            });
        }).on('click', '.btn-back-list', function (event) {
            var userId = $addPositionForm.find('input[name=userId]').val();

            if (event) {
                event.preventDefault();
            }

            openSetUserPosition(userId);
        });

        // 设置所属区域
        var $setUserPositionRegion = $('#setUserPositionRegion'),
            $setUserPositionForm = $('#setUserPositionRegionForm'),
            setUserPositionTreeObj,
            setUserPositionRegionTreeNodeClick = function (event, treeId, treeNode) {
                if (!treeNode.id) {
                    return false;
                }

                setUserPositionTreeObj.checkNode(treeNode, true, true);
            },
            setUserPositionTreeSetting = {
                data: {
                    key: {
                        children: 'chlidren',
                        name: 'name'
                    }
                },
                check: {
                    enable: true,
                    chkStyle: 'checkbox'
                },
                callback: {
                    onClick: setUserPositionRegionTreeNodeClick
                }
            };

        $positionList.on('click', '.btn-setting', function (event) {
            var $context = $(this),
                userPositionId = $context.attr('data-id');

            if (event) {
                event.preventDefault();
            }

            if (!userPositionId) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '缺少用户职位ID！'
                });
                return false;
            }

            $setUserPositionForm.attr('data-userpid', userPositionId);

            openSetUserPositionRegionRelation(userPositionId);
        });

        function openSetUserPositionRegionRelation(userPositionId, callback) {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/openSetUserPositionRegionRelation.do',
                data: {
                    userPositionId: userPositionId
                },
                beforeSend: function () {}
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};
                    var treeAllNodes,
                        currentNode;

                    if ($.isArray(dataObj.regionTree) &&
                        dataObj.regionTree.length) {
                        setUserPositionTreeObj = $.fn.zTree.init(
                            $setUserPositionRegion,
                            setUserPositionTreeSetting,
                            dataObj.regionTree
                        );

                        // 打开根节点
                        setUserPositionTreeObj.expandNode(
                            //setUserPositionTreeObj.getNodes()[0],
                            setUserPositionTreeObj.getNodeByParam('id', -1),
                            true,
                            false,
                            false
                        );

                        // setUserPositionTreeObj.expandAll(true);
                        treeAllNodes = setUserPositionTreeObj.getNodes();

                        showPositionPage($positionPageSetting);

                        $setUserPositionForm.attr('data-userpid', userPositionId);

                        if ($.isFunction(callback)) {
                            callback(data);
                        }
                    } else {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '所属区域不存在！'
                        });
                    }

                    if (treeAllNodes) {
                        // 设置选中的节点
                        $.each(dataObj.regionList || [], function (i, item) {
                            if (item.id) {
                                currentNode = setUserPositionTreeObj.getNodeByParam('id', item.id);
                                if (currentNode) {
                                    setUserPositionTreeObj.checkNode(
                                        currentNode,
                                        true,
                                        true
                                    );
                                }

                                /*
                                if (currentNode.isParent) {
                                    setUserPositionTreeObj.expandNode(
                                        currentNode,
                                        true,
                                        true,
                                        true
                                    );
                                } else {
                                    setUserPositionTreeObj.expandNode(
                                        currentNode.getParentNode(),
                                        true,
                                        true,
                                        true
                                    );
                                }
                                */
                            }
                        });
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取所属区域出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取所属区域失败！');
            });
        }

        $setUserPositionForm.on('submit', function (event) {
            var $context = $(this),
                $submit = $context.find('input[type=submit]'),
                userId = $context.attr('data-userid'),
                userPositionId = $context.attr('data-userpid');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            var treeAllNodes = setUserPositionTreeObj.getNodes(),
                getSelectedNodes = function (treeAllNodes) {
                    var selectedNodes = [],
                        recursion = function (tree) {
                            var i = 0,
                                il = tree.length,
                                item,
                                status;

                            for (; i < il; i += 1) {

                                item = tree[i];
                                status = item.getCheckStatus();

                                if (status.checked) {
                                    if (!status.half) {
                                        selectedNodes.push(item.id + ':' + item.type);
                                    } else if (item.chlidren && status.half) {
                                        recursion(item.chlidren);
                                    }
                                }

                            }
                        };

                    recursion(treeAllNodes);

                    return selectedNodes;
                },
                regions = getSelectedNodes(treeAllNodes).join(',');

            if (!userPositionId || !regions) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '缺少职位ID！'
                });
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/setUserPositionRegionRelation.do',
                data: {
                    userPositionId: userPositionId,
                    regions: regions
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled').addClass('disabled');
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    openSetUserPosition(userId);
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '设置所属区域失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '设置所属区域失败！');
            }).
            always(function () {
                $submit.removeAttr('disabled').removeClass('disabled').blur();
            });

        }).on('click', '.btn-back-list', function (event) {
            if (event) {
                event.preventDefault();
            }

            showPositionPage($positionPageList);
        });

        // 移除职位
        $positionList.on('click', '.btn-remove', function (event) {
            var $context = $(this),
                id = $context.attr('data-id');

            if (event) {
                event.preventDefault();
            }

            if ($context.hasClass('disabled')) {
                return false;
            }

            if (!id) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '缺少职位ID！'
                });
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/removeUserPositionRelation.do',
                data: {
                    userPositionId: id
                },
                beforeSend: function () {
                    $context.addClass('disabled');
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    $context.parents('tr').fadeOut().remove();
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '移除操作出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '移除操作失败！');
            }).
            always(function () {
                $context.removeClass('disabled');
            });
        });



        // 角色设置
        var $roleModal = $('#roleModal'),
            $roleListForm = $('#roleListForm'),
            $roleList = $('#roleList'),
            $userNameWarp = $roleList.find('.user-name-tips'),
            roleListTemplate = 'roleListTemplate';

        $searchResultList.on('click', '.btn-set-role', function (event) {
            var $context = $(this),
                userId = $context.attr('data-userid'),
                userName = $context.attr('data-name');

            if (event) {
                event.preventDefault();
            }

            if (!userId || !userName) {
                systemMessage({
                    type: 'error',
                    title: '提示：',
                    detail: '缺少用户名或用户ID！'
                });
                return false;
            }

            // 获取角色列表
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/openSetUserRoleRelation.do',
                data: {
                    userId: userId
                },
                beforeSend: function () {
                    $roleListForm.attr('data-userid', userId);
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {},
                        templateId =
                            ($.isArray(dataObj.allRoleList) && dataObj.allRoleList.length) ?
                            roleListTemplate :
                            messageTemplate;

                    // 显示数据
                    $roleList.find('tbody').html(
                        template(templateId, data)
                    );

                    $.each(dataObj.roleList || [], function (i, item) {
                        if (item.id) {
                            $roleList.
                                find('input[data-id=' + item.id + ']').
                                prop('checked', true);
                        }
                    });

                    $roleModal.modal('show');
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取角色出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取角色失败！');
            }).
            always(function () {
                $userNameWarp.html('用户名：' + userName);
            });

        });

        $roleListForm.on('submit', function (event) {
            var $context = $(this),
                $submit = $context.find('input[type=submit]'),
                $checkbox = $context.find('input:checked'),
                id = '',
                userId = $context.attr('data-userid'),
                roleIds = [];

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $.each($checkbox, function (i, item) {
                id = $(item).attr('data-id');
                if (id) {
                    roleIds[i] = id;
                }
            });

            if (!roleIds.length || !userId) {
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/setUserRoleRelation.do',
                data: {
                    userId: userId,
                    roleIds: roleIds.join(',')
                },
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    $roleModal.modal('hide');
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '设置失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '设置失败！');
            }).
            always(function () {
                $submit.removeAttr('disabled').blur();
            });
        });



        // 员工禁用/启用
        function toggleUserStatus() {
            if (!toggleUserStatus.isConfirm) {
                return false;
            }
            toggleUserStatus.isConfirm = false;

            var $that = $(this),
                uid = $.trim($that.attr('data-userid')),
                curStatus = $.trim($that.attr('data-status')),
                newStatus = curStatus === '1' ? '0' : '1',
                statusTxt = ['启用', '禁用'],
                className = ['btn-danger', 'btn-success'];

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/updateAuthUserStatus.do',
                data: {
                    userId: uid,
                    disabled: newStatus
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    $that.removeClass(className.join(' ')).
                        addClass(className[parseInt(newStatus)]).
                        attr('data-status', newStatus).
                        html(statusTxt[curStatus]);
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '更新用户状态出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '更新用户状态失败！');
            }).
            always(function () {
                $that.removeAttr('disabled').blur();
            });

            return false;
        }



        // 重置账号密码
        var $resetAccountModal = $('#resetAccountModal'),
            $resetAccountForm = $('#resetAccountForm'),
            $inpUserId = $resetAccountForm.find('[name=userId]'),
            $inpUserName = $resetAccountForm.find('[name=userName]'),
            $inpPassword = $resetAccountForm.find('[name=password]'),
            $inpRepassword = $resetAccountForm.find('[name=repassword]'),
            regAccount = /^.{1,}$/,
            regPassword = /^.{6,}$/;

        $searchResultList.on('click', '.btn-reset-account', function (event) {
            if (event) {
                event.preventDefault();
            }

            var $context = $(this),
                userId = $context.attr('data-userid'),
                userName = $context.attr('data-username');

            $inpUserId.val(userId);
            $inpUserName.val(userName);

            $resetAccountModal.modal('show');
        });

        $resetAccountModal.on('hide.bs.modal', function () {
            $resetAccountForm.get(0).reset();
            $inpUserId.val('');
            $inpUserName.val('');
        });

        $resetAccountForm.on('submit', function (event) {
            var id = $.trim($inpUserId.val()),
                name = $.trim($inpUserName.val()),
                pwd = $.trim($inpPassword.val()),
                rePwd = $.trim($inpRepassword.val()),
                errorInfo = function (msg) {
                    return {
                        type: 'error',
                        title: '重置账号：',
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

            if (!id) {
                systemMessage(errorInfo('缺少用户ID！'));
                return false;
            }

            if (!regAccount.test(name)) {
                systemMessage(errorInfo('用户名格式不正确！'));
                return false;
            }

            if (!regPassword.test(pwd)) {
                systemMessage(errorInfo('密码格式不正确！'));
                return false;
            }

            if (pwd !== rePwd) {
                systemMessage(errorInfo('两次密码不一至！'));
                return false;
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/resetAuthAccount.do',
                data: {
                    userId: id,
                    userName: name,
                    password: pwd
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
                        detail: data.detail || '重置账号成功！'
                    });

                    $resetAccountModal.modal('hide');
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '重置账号失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '重置账号失败！');
            }).
            always(function () {
                $disabled.attr('disabled', 'disabled');
                $submit.removeAttr('disabled').blur();
            });

        });

        $departmentModal.on('hide.bs.modal', function (event) {
            $searchForm.trigger('submit');
        });

        $positionModal.on('hide.bs.modal', function (event) {
            $searchForm.trigger('submit');
        });

        $roleModal.on('hide.bs.modal', function (event) {
            $searchForm.trigger('submit');
        });


        /**
         * 发送密码
         */
        $searchResultList.on('click', '.btn-reset-sendUserPassword', function (event) {
            var $that = $(this),
                userId = $that.attr('data-userid');
            if (event) {
                event.preventDefault();
            }
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/sendUserPassword.do',
                data: {
                    userId: userId
                },
                beforeSend: function () {
                    $that.attr('disabled', 'disabled');
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '密码发送失败！'
                        });
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '密码发送失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '密码发送失败！');
                }).
                always(function () {
                    $that.removeAttr('disabled').blur();
                });
        });

        /*员工管理-加盟数据权限-点击设置*/
        $searchResultList.on('click', '.btn-openSetUserLeagueRelation', function () {
            var $context = $(this),
                userId = $context.attr('data-userid');
            $('#selectUserId').val(userId);
            $('#openSetUserLeagueRelationBox').modal('show');
            setCompanyList();
            resetSearchInfo();
        });
        /*获取加盟公司列表*/
        $('#btn-set-openSetUserLeagueRelation').on('click',function(){
            $('#openSetUserLeagueRelationBox').modal('hide');
            $('#getAllLeagueDepartmentListBox').modal('show');
            setAllCompany();
            resetSearchInfo();
        });
        /*选择公司*/
        $('#getAllLeagueDepartmentList').on('click','.company-add',function(){
            var o = $(this),leagueId= o.attr('leagueId'),userId = $('#selectUserId').val();
            loadData('/hoss/sys/setUserLeagueRelation.do',{userId:userId,leagueIds:leagueId});
        });
        /*添加公司提交*/
        $('#btn-add-setUserLeagueRelation').on('click',function(){
            var o = $('#getAllLeagueDepartmentList').find('input:checked'),
                userId = $('#selectUserId').val(),
                leagueIds = selectCompanyIds.join(',');
            if(leagueIds){
                loadData('/hoss/sys/setUserLeagueRelation.do',{userId:userId,leagueIds:leagueIds}, null, null, null,function(){
                    message('添加成功');
                    setCompanyList();
                });
            }
            $('#getAllLeagueDepartmentListBox').modal('hide');
            $('#openSetUserLeagueRelationBox').modal('show');
        });
        /*移除公司*/
        $('#openSetUserLeagueRelationCallTemplate').on('click','.company-remove',function(){
            var o = $(this),leagueId= o.attr('leagueId'),userId = $('#selectUserId').val();
            loadData('/hoss/sys/removeUserLeagueRelation.do',{userId:userId,leagueId:leagueId},null,null,null,function(){
                message('移除成功');
                setCompanyList();
            })
        });
        /*关闭加盟弹出框触发*/
        $('#openSetUserLeagueRelationBox').on('hide.bs.modal',function(){
            $searchForm.trigger('submit');
        });
        /*加盟公司列表-初始化*/
        function setCompanyList(){
            loadData(
                '/hoss/sys/openSetUserLeagueRelation.do',
                {userId: $('#selectUserId').val()},
                'openSetUserLeagueRelationTemplate',
                $('#openSetUserLeagueRelationCallTemplate'),
                null,
                function(data){
                    if(data.data){
                        selectCompanyIds = $.map(data.data.content,function(v){
                            return v.leagueId;
                        });
                    }else{
                        selectCompanyIds = [];
                    }
                }
            );
        }
        /*单选*/
        $('#getAllLeagueDepartmentList').on('click',':checkbox',function(){
            var o = $(this),v= parseInt(o.val());
            if(o.is(':checked')){
                if(!~$.inArray(v,selectCompanyIds)){
                    selectCompanyIds.push(v);
                }
            }else{
                if(!!~$.inArray(v,selectCompanyIds)){
                    selectCompanyIds = selectCompanyIds.filter(function (value,index) {
                        return (value != v);
                    });
                }
            }
        });
        /*获取所有公司*/
        function setAllCompany(){
            loadData(
                '/hoss/league/apply/getLeaguePartnerPages.do',
                {
                    gatherStatus:2,
                    size:$('#getLeagueCompanyPagesPageSize').val(),
                    page:$('#getLeagueCompanyPagesPageNum').val(),
                    companyName:$('#getLeaguePartnerPagescompanyName').val(),
                    city_s1:$('#provinceId').val(),
                    city_s2:$('#cityId').val()
                },
                'getAllLeagueDepartmentTemplate',
                $('#getAllLeagueDepartmentList'),
                null,
                function(){
                    $.each(selectCompanyIds,function(k,v){
                        if($('#getAllLeagueDepartmentList').find("input:checkbox[value='"+v+"']").size()){
                            $('#getAllLeagueDepartmentList').find("input:checkbox[value='"+v+"']")[0].checked = true;
                        }
                    });
                },
                {
                    obj:$('#getLeagueCompanyPagesPage'),
                    form:$('#getLeagueCompanyPagesForm'),
                    pageSize:$('#getLeagueCompanyPagesPageSize'),
                    pageNum:$('#getLeagueCompanyPagesPageNum')
                }
            );
        }
        /*查询按钮*/
        $('#btn-search-getLeaguePartnerPages').click(function () {
            setAllCompany();
        });
        /*清空查询条件*/
        function resetSearchInfo(){
            $('#provinceId').val('');
            $('#cityId').val('');
            $('#getLeagueCompanyPagesPageNum').val('0');
            $('#getLeaguePartnerPagescompanyName').val('');
        }
        /*输入框获取焦点清空内容*/
        $('#getLeaguePartnerPagescompanyName').on('focus', function () {
            $(this).attr('placeholder','');
        });
        $('#getLeaguePartnerPagescompanyName').on('blur', function () {
            $(this).attr('placeholder','加盟公司');
        });
        function loadData(code, params, successTemplate, $searchResultList, beforeSend,callback,page){
            $.ajax($.extend({
                url: apiHost + code,
                data: params,
                beforeSend: function () {
                    (!!$.isFunction(beforeSend) && beforeSend);
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = successTemplate;
                        if(successTemplate && $searchResultList){
                            $searchResultList.html(
                                template(templateId, data)
                            );
                        }
                        (!!$.isFunction(callback))&&callback(data);

                        if(!!page){
                            page.obj.pagination({
                                $form: page.form,
                                totalSize: dataObj.totalElements,
                                pageSize: parseInt(page.pageSize.val()),
                                visiblePages: 5,
                                info: true,
                                paginationInfoClass: 'pagination-count pull-left',
                                paginationClass: 'pagination pull-right',
                                onPageClick: function (event, index) {
                                    page.pageNum.val(index - 1);
                                    setAllCompany();
                                }
                            });
                        }
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
                })
        }
        function message(m){
            systemMessage({type: 'info', title: '提示：', detail: m, wait:1000, autoHide: true});
        }

    }
    $(document).ready(domReady);
});