define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var modal = require('bootstrap/modal');

    var ztree = require('ztree');
    var systemMessage = require('system-message');

    var systemMessage = require('system-message');


    var $body = $('body'),
        $userDeptModal = $('#userDeptModal'),
        $userDeptTree = $('#userDeptTree'),
        $doneSelectedStaff = $('#doneUserDeptSelectedStaff'),
        $clearSelectedStaff = $('#clearUserDeptSelectedStaff'),
        modalHtml =
            '<div id="userDeptModal" class="modal fade" aria-labelledby="userDeptModal" aria-hidden="true">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
            '<h4 class="modal-title">请选择审批人员</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<ul id="userDeptTree" class="ztree"></ul>' +
            '<div class="form-inline text-center">' +
            '<a id="doneUserDeptSelectedStaff" class="btn btn-sm btn-primary">确认</a>' +
            '<a id="clearUserDeptSelectedStaff" class="btn btn-sm btn-default" style="margin-left: 1em;">重选</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
        treeObj = null,
        treeNodes = [],
        treeCheckedNodes = [],
        treeSetting = {
            data: {
                simpleData: {
                    enable: true,
                    idKey: 'id',
                    pIdKey: 'pId'
                }
            },
            check: {
                enable: true,
                chkStyle: 'radio',
                radioType: "all"
            },
            callback: {
                onClick: function (event, treeId, treeNode) {
                    if (!treeNode.isParent) {
                        treeObj.checkNode(treeNode, !treeNode.getCheckStatus().checked, true);
                        treeCheckedNodes = treeObj.getCheckedNodes(true);
                    }
                },
                onCheck: function (event, treeId, treeNode) {
                    treeCheckedNodes = treeObj.getCheckedNodes(true);
                }
            }
        };

    if ($userDeptModal.length === 0) {
        $body.append(modalHtml);
    }

    $userDeptModal = $($userDeptModal.selector);
    $userDeptTree = $($userDeptTree.selector);
    $doneSelectedStaff = $($doneSelectedStaff.selector);
    $clearSelectedStaff = $($clearSelectedStaff.selector);

    $doneSelectedStaff.on('click', function (event) {
        if (event) {
            event.preventDefault();
        }
        var result = getSelectedStaff();
        hide();
    });

    $clearSelectedStaff.on('click', function (event) {
        if (event) {
            event.preventDefault();
        }

        clear();
    });


    function cancelSelectedNode (callback) {
        treeObj.expandAll(false);
        $('.radio_true_full').attr("class",'button chk radio_false_full');
    }
    function init(callback) {
        if ($.isPlainObject(treeObj)) {
            if ($.isFunction(callback)) {
                callback();
            }
            return this;
        }

        $.ajax($.extend({
            url: apiHost + '/hoss/sys/getAllDepartmentList.do',
            beforeSend: function () {}
        }, jsonp)).
        done(function (data) {
            function done(data) {
                var result = data.data.content || [];
                result = getTreeNodes(result);

                treeObj = $.fn.zTree.init(
                    $userDeptTree,
                    treeSetting,
                    result
                );

                if ($.isFunction(callback)) {
                    callback();
                }
            }
            doneCallback.call(this, data, done);
        }).
        fail(function (jqXHR) {
            failCallback.call(this, jqXHR, '获取所有员工列表失败！');
        });

        return this;
    }

    function show() {
        $userDeptModal.modal('show');
        return this;
    }

    function hide() {
        $userDeptModal.modal('hide');
        return this;
    }

    function clear() {
        treeObj.checkAllNodes(false);
        $('.radio_true_full').attr("class",'button chk radio_false_full');
        treeCheckedNodes = treeObj.getCheckedNodes(true);
        return this;
    }

    function getSelectedStaff() {
        var ids = [],
            names = [],
            result = {};

        $.each(treeCheckedNodes, function (i, item) {
            if (ids.indexOf(item.id) === -1) {
                ids.push(item.id);
                names.push(item.name);
            }
        });

        result.ids = ids.join(',');
        result.names = names.join(',');

        return result;
    }

    function setSelectedStaff(ids) {
        var node = null,
            expand = false;

        $.each(ids.split(',') || [], function (i, id) {
            node = treeObj.getNodeByParam('id', parseInt(id));
            if (node) {
                treeObj.checkNode(node, true, true);
                expand = true;
            }
        });

        treeCheckedNodes = treeObj.getCheckedNodes(true);

        if (expand) {
            treeObj.expandAll(true);
        }

        return this;
    }

    function isNotEmptyArray(a) {
        return $.isArray(a) && a.length;
    }

    function getTreeNodes(data) {
        var treeNodes = [],
            recursion = function (treeData, parentId) {
                var min = 0,
                    max = treeData.length,
                    active,
                    newNode = {};

                if (!$.isArray(treeData)) {
                    if (console) {
                        console.error(
                            '模块：carbon-copy.js\r\n' +
                            '详情：getTreeNodes 的参数 treeData 类型不正确！'
                        );
                    }
                }

                for (; min < max; min += 1) {
                    active = treeData[min];
                    // 设置员工的父ID
                    if (!active.hasOwnProperty('parentId')) {
                        active.parentId = parentId;
                    }
                    // 根节点默认打开
                    if (active['parentId'] === 0) {
                        newNode.open = true;
                    }
                    // 取必要字段：id, parentId, name
                    if (active.hasOwnProperty('id') &&
                        active.hasOwnProperty('name')) {
                        newNode = {
                            id: active.id,
                            pId: active.parentId,
                            name: active.name
                        };
                    }

                    // 部门列表
                    if (active.hasOwnProperty('chlidren')) {
                        newNode.isParent = true;
                        newNode.nocheck = true;
                        if (isNotEmptyArray(active['chlidren'])) {
                            recursion(active['chlidren']);
                        }
                    }

                    // 员工列表
                    if (active.hasOwnProperty('userInfoDTOList') &&
                        isNotEmptyArray(active['userInfoDTOList'])) {
                        recursion(active['userInfoDTOList'], active.id);
                    }

                    treeNodes[treeNodes.length] = newNode;
                }
            };

        recursion(data);

        return treeNodes;
    }

    return {
        init: init,
        show: show,
        hide: hide,
        clear: clear,
        cancelSelectedNode :cancelSelectedNode,
        getSelectedStaff: getSelectedStaff,
        setSelectedStaff: setSelectedStaff,
        $doneSelectedStaff: $doneSelectedStaff
    };
});