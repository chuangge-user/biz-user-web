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

    var systemMessage = require('system-message');

    var ztree = require('ztree');



    function domReady() {
        var $roleTree = $('#roleTree'),
            roleTreeObj,
            roleTreeNodeClick = function (event, treeId, treeNode) {
                var permissList = treeNode.permissList || [];

                toggleAllChkDisabled(menuTreeObj, false);

                menuTreeObj.checkAllNodes(false);

                $.each(permissList, function (i, item) {
                    if (item.id) {
                        menuTreeObj.checkNode(
                            menuTreeObj.getNodeByParam('id', item.id),
                            true,
                            false
                        );
                    }
                });

                toggleAllChkDisabled(menuTreeObj, true);

                $roleEdit.removeClass('hide');
                $roleUpdate.add($roleCancel).addClass('hide');
            },
            menuTreeRightClick = function(event,treeId,treeNode){

                if('undefined'!=treeNode&&null!=treeNode){
                    menuTreeObj.checkNode(treeNode);
                }
            },
            roleTreeSetting = {
                data: {
                    key: {
                        children: 'chlidren',
                        name: 'name'
                    }
                },
                callback: {
                    onClick: roleTreeNodeClick
                }
            },
            $menuTree = $('#menuTree'),
            menuTreeObj,
            menuTreeNodeClick = function (event, treeId, treeNode) {
                menuTreeObj.checkNode(
                    menuTreeObj.getNodeByParam('id', treeNode.id),
                    true,
                    true
                );
            },
            menuTreeSetting = {
                data: {
                    key: {
                        children: 'chlidren',
                        name: 'name'
                    }
                },
                check: {
                    chkStyle: "checkbox",
                    enable: true
                },
                callback: {
                    onClick: menuTreeNodeClick,
                    onRightClick:menuTreeRightClick
                }
            };

        // 获取所有角色列表
        function getAllRoleList(callback) {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getAllRoleListByPermisson.do',
                data: {},
                beforeSend: function () {}
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if ($.isArray(dataObj.content) &&
                        dataObj.content.length) {
                        roleTreeObj = $.fn.zTree.init(
                            $roleTree,
                            roleTreeSetting,
                            dataObj.content
                        );
                    }

                    if ($.isFunction(callback)) {
                        callback(data, menuTreeObj);
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取角色权限出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取角色权限失败！');
            });
        }

        // 获取所有权限列表
        function getAllPermissList(callback) {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getAllPermissList.do',
                data: {},
                beforeSend: function () {}
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if ($.isArray(dataObj.content) &&
                        dataObj.content.length) {
                        menuTreeObj = $.fn.zTree.init(
                            $menuTree,
                            menuTreeSetting,
                            dataObj.content
                        );
                    }

                    if ($.isFunction(callback)) {
                        callback(data, menuTreeObj);
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取所有权限出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取所有权限失败！');
            });
        }

        // 启用、禁用多选按钮的操作
        function toggleAllChkDisabled(treeObj, status) {
            var treeAllNodes = treeObj.getNodes();

            $.each(treeAllNodes, function (i, item) {
                treeObj.setChkDisabled(
                    treeAllNodes[i],
                    status || false,
                    true,
                    true
                );
            });
        }

        // 必须先选择菜单树，然后才能操作
        function isSelectedPermissList() {
            var selectedNodes = roleTreeObj.getSelectedNodes();

            if (!selectedNodes ||
                !$.isArray(selectedNodes) ||
                !selectedNodes.length) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请选择角色，然后操作！'
                });
                return false;
            }
            return true;
        }

        // 默认加载两个树
        getAllRoleList();
        getAllPermissList(function (data, treeObj) {
            toggleAllChkDisabled(treeObj, true);
        });


        var $roleEdit = $('#roleEdit'),
            $roleUpdate = $('#roleUpdate'),
            $roleCancel = $('#roleCancel');

        $roleEdit.prop('');

        // 编辑
        $roleEdit.on('click', function (event) {
            if (event) {
                event.preventDefault();
            }

            if (!isSelectedPermissList()) {
                return false;
            }

            toggleAllChkDisabled(menuTreeObj, false);

            $roleEdit.addClass('hide');
            $roleUpdate.add($roleCancel).removeClass('hide');
        });

        // 取消
        $roleCancel.on('click', function (event) {
            if (event) {
                event.preventDefault();
            }

            if (!isSelectedPermissList()) {
                return false;
            }

            toggleAllChkDisabled(menuTreeObj, true);

            $roleEdit.removeClass('hide');
            $roleUpdate.add($roleCancel).addClass('hide');
        });

        // 更新
        $roleUpdate.on('click', function (event) {
            var $context = $(this);

            if (event) {
                event.preventDefault();
            }

            if (!isSelectedPermissList()) {
                return false;
            }

            if ($context.hasClass('disabled')) {
                return false;
            }

            var roleSelectedNodes = roleTreeObj.getSelectedNodes(),
                roleCurrentNode = roleSelectedNodes[0],
                roleId = roleCurrentNode.id,

                menuCheckedNodes = menuTreeObj.getCheckedNodes(true),
                permIds = '';

            if (!roleId) {
                return false;
            }

            $.each(menuCheckedNodes || [], function (i, item) {
                if (item.id) {
                    permIds += item.id + ','
                }
            });

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/setRolePermssRelation.do',
                data: {
                    roleId: roleId,
                    permIds: permIds
                },
                beforeSend: function () {
                    $context.attr('disabled', 'disabled');
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    systemMessage({
                        type: 'done',
                        title: '提示：',
                        detail: data.detail || '编辑完成！'
                    });

                    getAllRoleList();
                    getAllPermissList();
                    $roleTree.find('.curSelectedNode').trigger('click');
                    $roleEdit.removeClass('hide');
                    $roleUpdate.add($roleCancel).addClass('hide');
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '编辑失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '编辑失败！');
            }).
            always(function () {
                $context.removeAttr('disabled').blur();
            });
        });

    }



    $(document).ready(domReady);

});