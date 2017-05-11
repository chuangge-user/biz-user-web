define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;
    var $ = require('jquery');
    var navigation = require('navigation');
    var pagination = require('pagination');
    var template = require('template');
    var ztree = require('ztree');
    var $position = $('#position');
    var modal = require('bootstrap/modal');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var systemMessage = require('system-message');



    function domReady() {
        var doublePositionId = "";
        var $searchForm= $('#searchForm');
        var $searchResultPagination = $('#searchResultPagination');
        var $pageNum = $searchForm.find('input[name=page]');
        var $pageSize = $searchForm.find('input[name=size]');

        var roleTreeNodeClick = function (event, treeId, treeNode) {
            $('#positionId').val(treeNode.id);
            $('#positionIdParentId').val(treeNode.parentId);
            $('#doublePositionId').val(treeNode.id);
            $searchForm.submit();
            $('#workPath').val(treeNode.workPath);

        };
        var setting = {
            data: {
                key: {
                    children: 'chlidren',
                    name: 'name'
                }
            },
            callback: {
                onClick: roleTreeNodeClick
            }
        };
        $position.on('click','a span',function(event){
            var $self = $(this);
            //getPositionMemberList(posId);
            var positionName = $self.html();
            var workPath = $self.attr("workPath");
            var idstr = $self.prop('id');
            var positionId = idstr.substring(idstr.indexOf('_')+1,idstr.lastIndexOf('_'));
            $('#positionId').val(positionId);
            $('#positionName').val(positionName);
            $('#workPath').val(workPath);
            var postionTree = getPostionTreeStr($self,"")+"-"+$self.html();
            $('#postionTree').html(postionTree);
            $self.addClass('postion-focus');
        });

        $searchForm.on('submit', function (event) {
            var $context = $(this),
                $disabled = $context.find('[disabled]'),
                $submit = $context.find('input[type=submit]');


            if ($submit.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');

            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getPositionMemberList.do',
                data:clearEmptyValue($context),
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        // 显示数据
                        $('#findUserIdAndPositionIdByCitys').find('tbody').html(
                            template("searchResultTemplate", data)
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
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取成员列表失败！'
                        });
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取成员列表失败！');
                });
            return false;
        }).trigger('submit');;


        //获取职位成员列表
        function getPositionMemberList(positionId) {
            var $searchForm = $('#searchForm');
            var $searchResultPagination = $('#searchResultPagination');
            var $pageNum = $searchForm.find('input[name=page]');
            var $pageSize = $searchForm.find('input[name=size]');
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getPositionMemberList.do',
                data:{
                    positionId:positionId
                },
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};
                        // 显示数据
                        $('#findUserIdAndPositionIdByCitys').find('tbody').html(
                            template("searchResultTemplate", data)
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
                                $searchForm.trigger('submit');
                            }
                        });
                    }
                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取成员列表失败！'
                        });
                    }
                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取成员列表失败！');
                });
        }

        $(document).on('click','.edit',function(event){
            if($('#positionId').val()==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请先选择一个职位！'
                });
                return;
            }

            $('#positionName').attr('disabled',false);
            $('#workPath').attr('disabled',false);
            var childern = $(document).find('.search-line').children();
            for(var i=0;i<childern.length;i++){
                $(childern[i]).removeClass('disabled');
            }

        });


        $(document).on('click','.cancel',function(event){
            $('#positionName').attr('disabled',true);
            var childern = $('#searchlinesubmit').find('.search-line').children();
            for(var i=0;i<childern.length;i++){
                $(childern[i]).addClass('disabled');
            }

        });

        //打开新增职位窗口
        $('#positionOperator').on('click','.add',function(event){
            if($('#position').html()==""){
                $('#positionId').val(0);
                $('#positionIdParentId').val(0);
            }else{
                if($('#positionId').val()==""){
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '请先选择一个职位！'
                    });
                    return;
                }
            }
            $('#addpositionDiv').find('input[name=positionName]').val("");
            $('#addpositionDiv').modal('show');
            //alert('新增职位');
        });


        //新增职位
        $('#addpositionDiv').on('click','.btn-submit',function(event){
            var name = $('#addpositionDiv').find('input[name=positionName]').val();
            if(name==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '职位名称不能为空！'
                });
                return;
            }
            var workPath = $('#addpositionDiv').find('input[name=workPath]').val();
            addpotion(name,$('#positionIdParentId').val(), workPath);
        });

        //打开新增子职位窗口
        $('#positionOperator').on('click','.addsub',function(event){
            if($('#position').html()==""){
                $('#positionId').val(0);
                $('#positionIdParentId').val(0);
            }else{
                if($('#positionId').val()==""){
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '请先选择一个职位！'
                    });
                    return;
                }
            }
            $('#addsubpositionDiv').find('input[name=positionName]').val("");
            $('#addsubpositionDiv').modal('show');
        });

        //新增子职位
        $('#addsubpositionDiv').on('click','.btn-submit',function(event){
            var name = $('#addsubpositionDiv').find('input[name=positionName]').val();
            if(name == ""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '职位名称不能为空！'
                });
                return;
            }
            var parentId = $('#positionId').val();
            var workPath = $('#addsubpositionDiv').find('input[name=workPath]').val();
            addpotion(name, parentId, workPath);
        });

        //删除职位
        $('#positionOperator').on('click','.del',function(event){
            if($('#positionId').val()==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请先选择一个职位！'
                });
                return;
            }
           if(confirm("确定删除?")){
               $.ajax($.extend({
                   url: apiHost + '/hoss/sys/deletePosition.do',
                   data:{
                       positionId:$('#positionId').val()
                   },
                   beforeSend: function () {
                   }
               }, jsonp)).
                   done(function (data) {
                       function useful(data) {
                           var status = data.status;
                           if(status==1){
                               systemMessage({
                                   type: 'info',
                                   title: '提示：',
                                   detail: data.detail || '删除职位成功！'
                               });
                               getAllPositionList();
                           }else{
                               systemMessage({
                                   type: 'info',
                                   title: '提示：',
                                   detail: data.detail || '删除职位失败！'
                               });
                           }
                       }

                       function useless(data) {
                           systemMessage({
                               type: 'info',
                               title: '提示：',
                               detail: data.detail || '删除职位成功！'
                           });
                           getAllPositionList();
                       }

                       doneCallback.call(this, data, useful, useless);
                   }).
                   fail(function (jqXHR) {
                       failCallback.call(this, jqXHR, '删除职位失败！');
                   });
           }
        });

        $('#positionOperator').on('click','.move',function(event){
            if($('#positionId').val()==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请先选择一个职位！'
                });
                return;
            }
            var type = $(this).attr('data-type');
            if(type==0){
                movepotion($('#positionId').val(),0);
            }else if(type==1){
                var treeObj = $.fn.zTree.getZTreeObj("position");
                var nodes = treeObj.getSelectedNodes()[0].tId;
                var $curretNode = $("#position").find("li[id='"+nodes+"']");
                var tbDomId = $curretNode.prev("li").attr("id");
                if (!treeObj.getNodeByTId(tbDomId)) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '无法降职!'
                    });
                    return false;
                }
                var demotionId = treeObj.getNodeByTId(tbDomId).id;
                movepotion($('#positionId').val(), 1, demotionId);
            }
        });

        $('#positionOperator').on('click','.changePosition',function(event){
            if($('#positionId').val()==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请先选择一个职位！'
                });
                return;
            }
            var selectedNodes = treeObj.getSelectedNodes();
            var currentNode = selectedNodes.shift(),
                targetNode,
                moveType;
            var type = $(this).attr('data-type');

            if(type==0){
                targetNode = currentNode.getPreNode();
                moveType = 'prev';
                if(null==targetNode){
                    return;
                }
                changePosition(0,currentNode,targetNode,moveType);
            }else if(type==1){
                targetNode = currentNode.getNextNode();
                moveType = 'next';
                if(null==targetNode){
                    return;
                }
                changePosition(1,currentNode,targetNode,moveType);
            }

        });


        function clearDate(){
            $('#positionIdParentId').val("");
            $('#positionId').val("");
            $('#positionName').val("");
            $('#workPath').val("");
            $('#postionTree').html("");
        }
        function movepotion(positionId,type, demotionId){
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/upAndDownPosition.do',
                data:{
                    positionId:positionId,
                    type:type,
                    demotionId: demotionId
                },
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var status = data.status;
                        if(status==1){
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '操作职位成功！'
                            });
                            getAllPositionList();
                        }else{
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '操作职位失败！'
                            });
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '操作职位成功！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作职位失败！');
                });
        }

        /**
         * 上移下移操作
         * @param positionId
         * @param type
         */
        function changePosition(type,currentNode,targetNode,moveType){
//            console.log("positionId="+positionId);
//            console.log("type="+type);
//            console.log(currentNode);
//            console.log(targetNode);
//            console.log("moveType="+moveType);
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/changePosition.do',
                data:{
                    curPositionId:currentNode.id,
                    targetPositionId:targetNode.id,
                    type:type
                },
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var status = data.status;
                        if(status==1){
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '操作职位成功！'
                            });
                            treeObj.moveNode(
                                targetNode,
                                currentNode,
                                moveType
                            );
//                            getAllPositionList();
                        }else{
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '操作职位失败！'
                            });
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '操作职位成功！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '操作职位失败！');
                });
        }


        function addpotion(name,parentId,workPath){
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/addPosition.do',
                data:{
                    name:name,
                    parentId:parentId,
                    workPath : workPath
                },
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var status = data.status;
                        if(status==1){
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '新增职位成功！'
                            });
                            $('#addpositionDiv').modal('hide');
                            $('#addsubpositionDiv').modal('hide');
                            getAllPositionList();
                        }else{
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '新增职位失败！'
                            });
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '新增职位成功！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新职位失败！');
                });
        }

        $(document).on('click','.confirm-submit',function(event){
            if($('#positionId').val()==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '请先选择一个职位！'
                });
                return;
            }
            if($('#positionName').val()==""){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '职位名称必填！'
                });
                return;
            }
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/updatePosition.do',
                data:{
                    id:$('#positionId').val(),
                    name:$('#positionName').val(),
                    workPath : $("#workPath").val()
                },
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var status = data.status;
                        if(status==1){
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '更新职位成功！'
                            });
                            getAllPositionList();
                        }else{
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '更新职位失败！'
                            });
                        }
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取所有职位列表出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '更新职位失败！');
                });


        });

        function getPostionTreeStr(obj,postionTreeStr){
            var parentUL = obj.parent().parent().parent().prop('id');
            if(!parentUL || parentUL.indexOf('_')==-1){
                return getAgainst(postionTreeStr);
            }
            var parentSpanId = parentUL.substring(0,parentUL.lastIndexOf('_'))+"_span"
            var $parent = $('#'+parentSpanId);
            postionTreeStr = postionTreeStr + $parent.html()+"-";
            return getPostionTreeStr($parent,postionTreeStr);
        }

        function getAgainst(postionTreeStr){
            if(!postionTreeStr || postionTreeStr==''){
                return '';
            }else{
                var result = "";
                var strargs = postionTreeStr.split("-");
                var len = strargs.length;
                for(var j=len;j>=0;j--){
                    if(!strargs[j] || strargs[j]==''){
                        continue;
                    }
                    result = result + strargs[j] + '-';
                }
                if(result && result!=null){
                    return result.substring(0,result.length-1);
                }else{
                    return '';
                }
            }
        }

        // 获取所有职位列表
        function getAllPositionList() {
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/getAllPositionList.do',
                beforeSend: function () {
                }
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {};

                        if ($.isArray(dataObj.content) &&
                            dataObj.content.length) {
                            treeObj = $.fn.zTree.init(
                                $("#position"),
                                setting,
                                dataObj.content
                            );
                            treeObj.expandAll(true);
                        }

                        clearDate();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取所有职位列表出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取所有职位列表失败！');
                });
        }

        getAllPositionList();
    }

    $(document).ready(domReady);

});