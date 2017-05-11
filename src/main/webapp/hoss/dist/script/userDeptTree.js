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
    var ztree_exhide = require('ztree-exhide');

    var systemMessage = require('system-message');

    var global_treeNodes;

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
            '<div><input type="text" class="form-control-sm" style="width: 250px;max-width: 250px;" placeholder="请输入搜索关键字" id="searchTreeInput" /><input type="button" id="searchTreeBtn" value="搜索"></div>'+
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
        if(''==result.ids){
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: '请选择审批人员!'
            });
            return;
        }
        hide();
    });

    $clearSelectedStaff.on('click', function (event) {
        if (event) {
            event.preventDefault();
        }

        clear();
    });

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

                if(global_treeNodes == null){
                    global_treeNodes = $.extend(true, {}, treeObj.getNodes());
                }

                $("#userDeptModal").on("click", "#searchTreeBtn",function(){

                    //function removeNotLikeNode(treeObj, node, info){
                    //    if(node.children != undefined){
                    //        for(var i = node.children.length - 1; i >= 0; i--){
                    //            var item = node.children[i];
                    //            if((item.children == undefined  && item.name.indexOf(info) == -1) || (item.children != undefined && item.children.length == 0)){
                    //                treeObj.removeNode(item);
                    //            }else{
                    //                removeNotLikeNode(treeObj, item, info);
                    //            }
                    //        }
                    //    }
                    //    if(node.children != undefined && node.children.length == 0){
                    //        treeObj.removeNode(node);
                    //    }
                    //}
                    //
                    //function removeNotLikeNodes(treeObj, info){
                    //    var nodes = treeObj.getNodes();
                    //    for(var i = 0; i < nodes.length; i++){
                    //        removeNotLikeNode(treeObj, nodes[i], info);
                    //    }
                    //
                    //    return treeObj.getNodes();
                    //}
                    //
                    //var treeObj = $.fn.zTree.getZTreeObj("userDeptTree");
                    //treeObj.removeNode(treeObj.getNodes()[0]);
                    //treeObj.addNodes(null, global_treeNodes[0]);
                    //
                    //if($.trim($("#searchTreeInput").val()) != ''){
                    //    var showNodes = removeNotLikeNodes(treeObj, $.trim($("#searchTreeInput").val()));
                    //    treeObj.showNodes(showNodes);
                    //    treeObj.expandAll(true);
                    //}

                    //简化处理
                    function filter(node) {
                        var showNum = 0;
                        if(node.children != undefined){
                            $.each(node.children, function(i, item){
                                if(!item.isHidden){
                                    showNum++;
                                }
                            });
                        };
                        return (node.children == undefined && node.name.indexOf($.trim($("#searchTreeInput").val())) == -1) || (node.children != undefined && showNum == 0);
                    }

                    var treeObj = $.fn.zTree.getZTreeObj("userDeptTree");
                    if($.trim($("#searchTreeInput").val()) != ""){
                        var nodes = treeObj.getNodesByParam("isHidden", true);
                        treeObj.showNodes(nodes);
                        var nodes = treeObj.transformToArray(treeObj.getNodes());
                        var level = 0;
                        $.each(nodes, function (i, item) {
                            if (level < item.level) {
                                level = item.level;
                            }
                        });
                        for (var l = 0; l <= level; l++) {
                            var nodes = treeObj.getNodesByFilter(filter);
                            for (var i = 0; i < nodes.length; i++) {
                                treeObj.hideNode(nodes[i]);
                            }
                        }
                        treeObj.expandAll(true);
                    }else{
                        treeObj.expandAll(false);
                        var nodes = treeObj.getNodesByParam("isHidden", true);
                        treeObj.showNodes(nodes);
                    }
                });

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

    function cancelSelectedNode (callback) {
        treeObj.expandAll(false);
        $('.radio_true_full').attr("class",'button chk radio_false_full');
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
        getSelectedStaff: getSelectedStaff,
        setSelectedStaff: setSelectedStaff,
        $doneSelectedStaff: $doneSelectedStaff,
        cancelSelectedNode :cancelSelectedNode
    };
});