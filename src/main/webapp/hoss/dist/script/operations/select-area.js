define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;


    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var $ = require('jquery');
    var systemMessage = require('system-message');
    var ztree = require('ztree');

    var allCityLength;

    function domReady() {

        var $addForm = $('#addForm');

        // 区域删除
        $addForm.delegate('.remove-area', 'click', function(e){
            var $target = $(e.currentTarget);
            $target.parent().remove();
        })

        // 添加区域
        var $selectArea = $('#selectArea'),
            $cityModal = $('#cityModal'),
            areaData;
        $selectArea.click(function(){
            $cityModal.modal();
            if (areaData) {
                initAreaTree(areaData)
            } else {
                loadAreaData();
            }
        });

        /* 初始化树 */
        var setUserPositionTreeObj,
            $setUserPositionRegion = $('#setUserPositionRegion'),
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
            }

        function initAreaTree(dataObj){


            var treeAllNodes,
                currentNode;

            var current = dataObj.content;
            allCityLength = dataObj.totalCity; // 计算所有城市的长度

            if ($.isArray(current) &&
                current.length) {
                setUserPositionTreeObj = $.fn.zTree.init(
                    $setUserPositionRegion,
                    setUserPositionTreeSetting,
                    current
                );

                // 打开根节点
                setUserPositionTreeObj.expandNode(
                    setUserPositionTreeObj.getNodeByParam('id', -1),
                    true,
                    false,
                    false
                );

                treeAllNodes = setUserPositionTreeObj.getNodes();

            } else {
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '所属区域不存在！'
                });
            }

            // 设置已经选过的城市
            setChecked();
        }

        // 设置选中的节点
        function setChecked(){
            var selectedList = $('.selected-area input');

            $.each(selectedList, function (i, item) {
                var id = $(item).attr('areaid');

                var currentNode = setUserPositionTreeObj.getNodeByParam('id', id);
                if (currentNode) {
                    setUserPositionTreeObj.checkNode(
                        currentNode,
                        true,
                        true
                    );
                }

            });
        }

        /* 加载全国 */
        function loadAreaData() {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getCurrentUserCityList.do',
                data: {
                },
                beforeSend: function () {}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        areaData = dataObj;
                        initAreaTree(areaData);

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

        // 获取选中的节点
        function getSelectedNodes (treeAllNodes) {
                var selectedNodes = [],
                    recursion = function (tree) {
                        var i = 0,
                            il = tree.length,
                            item,
                            type;

                        for (; i < il; i += 1) {

                            item = tree[i];
                            type = item.type;

                            if (type == 3) {
                                selectedNodes.push(
                                    {
                                        id:item.id,
                                        type:item.type,
                                        name:item.name
                                    }
                                );
                            }

                        }
                    };

                recursion(treeAllNodes);

                return selectedNodes;
            }

//            regions = getSelectedNodes(treeAllNodes).join(',');

        $('#selectBtn').click(function(){

            var selectedResultPriorParent = getSelectedNodesPriorParent(setUserPositionTreeObj.getNodes()),
                firstSelected = selectedResultPriorParent[0],
                selectedResult = getSelectedNodes(setUserPositionTreeObj.getCheckedNodes());

            if (selectedResult.length == allCityLength) { // 选中全国

                // 如果选中全国， 将所有的 cityId 拼接起来塞到 全国标签中
                firstSelected.id = $.map(selectedResult, function(city){
                    return city.id;
                }).join(',');

                selectedResult = selectedResultPriorParent;
            }

            if (!selectedResult.length) {
                systemMessage('未选中城市！');
                return;
            }
            $cityModal.modal('toggle');

            initSelected(selectedResult);
        });

        // 将选中的城市展示出来
        function initSelected(list){
            while($selectArea.prev().length) { // 先将所有的选中都移除掉
                $selectArea.prev().remove();
            }

            showCityList(list);

        }
    }

    function showCityList(list){
        $.each(list, function(index, item){
            var $city = $('<div class="selected-area">' +
                item.name +
                '<span class="glyphicon glyphicon-remove remove-area" title="移除"></span>' +
                '<input type="hidden" areatype="' + item.type + '" areaid="' + item.id + '"/>' +
                '</div>');
            $city.insertBefore($('#selectArea'));
        });
    }

    // 获取选中的列表. 有顶层则选顶层
    function getSelectedNodesPriorParent (treeAllNodes) {
        var selectedNodes  = [],
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
                            selectedNodes.push({
                                id:item.id,
                                name:item.name,
                                type:item.type
                            });
                        } else if (item.chlidren && status.half) {
                            recursion(item.chlidren);
                        }
                    }

                }
            };

        recursion(treeAllNodes);

        return selectedNodes;
    }

    $(domReady);

    return {
        showCityList:showCityList
    }
});


