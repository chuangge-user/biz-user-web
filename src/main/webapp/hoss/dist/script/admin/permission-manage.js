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

        var $menuTree = $('#menuTree'),
            $addMenu = $('#addMenu'),
            $addSubMenu = $('#addSubMenu'),
            $moveUp = $('#moveUp'),
            $moveDown = $('#moveDown'),

            $editForm = $('#editForm'),
            $editParentId = $editForm.find('[name=parentId]'),
            $editId = $editForm.find('[name=id]'),
            $editName = $editForm.find('[name=name]'),
            $editType = $editForm.find('[name=type]'),
            $editCode = $editForm.find('[name=code]'),
            $editDisabled = $editForm.find('[name=disabled]'),
            $btnEdit = $editForm.find('.btn-edit'),

            treeObj,
            treeNodeClick = function (event, treeId, treeNode) {

                if (!treeNode.id) {
                    return false;
                }

                // 查看
                $.ajax($.extend({
                    url: apiHost + '/hoss/sys/viewPermiss.do',
                    data: {
                        permId: treeNode.id
                    },
                    beforeSend: function () {}
                }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        $editType.find('option[value='+dataObj.type+']').prop('selected', true);
                        $editParentId.val(dataObj.parentId);
                        $editId.val(dataObj.id);
                        $editName.val(dataObj.name);
                        $editCode.val(dataObj.code);
                        $editDisabled.find('option[value='+dataObj.disabled+']').prop('selected', true);

                        $editForm.find('input, select').prop('disabled', true);
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '查看权限出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '查看权限失败！');
                });
            },
            treeSetting = {
                data: {
                    key: {
                        children: 'chlidren',
                        name: 'name'
                    }
                },
                callback: {
                    onClick: treeNodeClick
                }
            };



        $btnEdit.hide();
        $editForm.get(0).reset();
        $editForm.find('input, select').prop('disabled', true);

        $menuTree.on('click', 'a', function (event) {
            if (event) {
                event.preventDefault();
            }

            $btnEdit.show();
        });



        // 获取所有权限列表
        function getAllPermissList() {
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
                        treeObj = $.fn.zTree.init(
                            $menuTree,
                            treeSetting,
                            dataObj.content
                        );
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

        // 必须先选择菜单树，然后才能操作
        function isSelectedPermissList() {
            var selectedNodes = treeObj.getSelectedNodes();

            if (!selectedNodes ||
                !$.isArray(selectedNodes) ||
                !selectedNodes.length) {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请选择菜单，然后操作！'
                });
                return false;
            }
            return true;
        }



        // 显示权限列表
        getAllPermissList();

        // 显示新增表单
        $addMenu.add($addSubMenu).on('click', function (event) {
            var $context = $(this);

            if (event) {
                event.preventDefault();
            }

            if (!isSelectedPermissList()) {
                return false;
            }

            $btnEdit.hide();

            $editForm.find('input, select').prop('disabled', false);

            $editForm.
                attr('data-submit-type', 'add').
                attr('data-menu-type', $context.attr('id')).
                get(0).reset();
        });

        // 显示编辑表单
        $btnEdit.on('click', function (event) {
            if (event) {
                event.preventDefault();
            }

            if (!isSelectedPermissList()) {
                return false;
            }

            $editForm.find('input, select').prop('disabled', false);

            $editForm.prop('data-submit-type', 'edit');
        });

        // 更新
        $editForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]'),
                $parentId = $context.find('input[name=parentId]'),
                submitType = $context.attr('data-submit-type');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            if (!isSelectedPermissList()) {
                return false;
            }

            var selectedNodes = treeObj.getSelectedNodes(),
                currentNode = selectedNodes[0];

            // 编辑
            if (submitType === 'edit') {
                $.ajax($.extend({
                    url: apiHost + '/hoss/sys/updatePermiss.do',
                    data: clearEmptyValue($context),
                    beforeSend: function () {
                        $submit.attr('disabled', 'disabled');
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

                        currentNode.parentId = dataObj.parentId;
                        currentNode.id = dataObj.id;
                        currentNode.name = dataObj.name;

                        treeObj.updateNode(currentNode);
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
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();

                    $editForm.find('input, select').prop('disabled', true);
                });
            }



            // 添加
            if (submitType === 'add') {
                var addMenuType = $context.attr('data-menu-type');

                // 新增子菜单
                if (addMenuType === $addSubMenu.attr('id')) {
                    $parentId.val(currentNode.id);
                }
                $context.find('input[name=id]').val('');
                $.ajax($.extend({
                    url: apiHost + '/hoss/sys/addPermiss.do',
                    data: clearEmptyValue($context),
                    beforeSend: function () {
                        $submit.attr('disabled', 'disabled');
                    }
                }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        systemMessage({
                            type: 'done',
                            title: '提示：',
                            detail: data.detail || '添加完成！'
                        });

                        getAllPermissList();
                        $editForm.attr('data-submit-type', 'edit');
                        $editForm.get(0).reset();
                        $editForm.find('input, select').prop('disabled', true);
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '添加失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '添加失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
            }
        });

        // 上移、下移
        $moveUp.add($moveDown).on('click', function () {
            var $context = $(this),
                selectedNodes = treeObj.getSelectedNodes();

            if (!isSelectedPermissList()) {
                return false;
            }

            $menuTree.find('.curSelectedNode').trigger('click');

            var currentNode = selectedNodes.shift(),
                targetNode,
                moveType,
                type;

            if ($context.attr('id') === 'moveUp') {
                targetNode = currentNode.getPreNode();
                moveType = 'prev';
                type = '0';
            } else {
                targetNode = currentNode.getNextNode();
                moveType = 'next';
                type = '1';
            }

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/upAndDownPermiss.do',
                data: {
                    objectId: currentNode.id,
                    referenceId: targetNode.id,
                    type: type
                }
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    treeObj.moveNode(
                        targetNode,
                        currentNode,
                        moveType
                    );
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '操作出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '操作出错！');
            });
        });

        // 搜索
        var $searchForm = $('#searchForm');
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $submit = $context.find('input[type=submit]');

            if (event) {
                event.preventDefault();
            }

            if ($submit.hasClass('disabled')) {
                return false;
            }

            var $keywords = $context.find('[name=keywords]'),
                key = $.trim($keywords.val());

            if (!key) {
                return false;
            }

            $submit.attr('disabled', 'disabled');

//            var nodes = treeObj.getNodesByParam('name', key, null);
            var nodes = treeObj.getNodesByParamFuzzy('name', key);
            // treeObj.expandAll(false);
            $.each(nodes || [], function (i, item) {
                treeObj.expandNode(item, true, true, true);
                treeObj.selectNode(item);
                return false;
            });
            $menuTree.find('.curSelectedNode').trigger('click');

            $submit.removeAttr('disabled').blur();
        });
    }



    $(document).ready(domReady);

});


