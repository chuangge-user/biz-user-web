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

    var systemMessage = require('system-message');

    var ztree = require('ztree');



    function domReady() {
        var $departmentTree = $('#departmentTree'),
            $userList = $('#userList'),
            userListTemplate = 'userListTemplate',
            messageTemplate = 'messageTemplate',
            treeObj,
            treeNodeClick = function (event, treeId, treeNode) {

                if (!treeNode.id) {
                    return false;
                }

                // 查看
                getUserListByDepart(treeNode.id);
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
                },
                view :{
                    showIcon: false,
                    fontCss: getFontCss
                }
            };


        // 获取所有部门列表
        function getAllDepartmentList() {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getAllDepartmentList.do',
                beforeSend: function () {}
            }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var dataObj = data.data || {};

                    if ($.isArray(dataObj.content) &&
                        dataObj.content.length) {
                        treeObj = $.fn.zTree.init(
                            $departmentTree,
                            treeSetting,
                            dataObj.content
                        );

                        treeObj.expandAll(true);
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取所有部门列表出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取所有部门列表失败！');
            });
        }

        // 根据部门获取用户列表
        function getUserListByDepart(departId) {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getUserListByDepart.do',
                data: {
                    departId: departId
                },
                beforeSend: function () {
                    $userList.find('tbody').html(
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
                            userListTemplate :
                            messageTemplate;

                    // 显示数据
                    $userList.find('tbody').html(
                        template(templateId, data)
                    );
                    $userList.removeClass('hide');
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
                failCallback.call(this, jqXHR, '获取用户列表失败！');
            });
        }



        // 显示所有部门列表
        getAllDepartmentList();


        // 搜索
        var $searchForm = $('#searchForm');
        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $submit = $context.find('input[type=submit]');
//            console.log('1');
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
            $departmentTree.find('.curSelectedNode').trigger('click');

            $submit.removeAttr('disabled').blur();
        });

        function getFontCss(treeId, treeNode) {
            return (!!treeNode.highlight) ? {color:"#A60000", "font-weight":"bold"} : {color:"#333", "font-weight":"normal"};
        }

//        var nodeList;
//        $searchForm.on('keyup','[name=keywords]',function(){
//
//            var value = $(this).val();
//            updateNodes(false);
//            if(value != ""){
////                var treeObj = $.fn.zTree.getZTreeObj(treeId);
//                nodeList = treeObj.getNodesByParamFuzzy('name', value);
//                if(nodeList && nodeList.length>0){
//                    updateNodes(true);
//                }
//            }
//        });
//
//        function updateNodes(highlight) {
////            var treeObj = $.fn.zTree.getZTreeObj(treeId);
//            if('undefined'!=nodeList&&null!=nodeList&&nodeList.length>0){
//                for( var i=0; i<nodeList.length;  i++) {
//                    nodeList[i].highlight = highlight;
//                    treeObj.updateNode(nodeList[i]);
//                }
//            }
//        }

    }



    $(document).ready(domReady);



});