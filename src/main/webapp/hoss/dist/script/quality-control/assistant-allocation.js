define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var modal = require('bootstrap/modal');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');




    function domReady() {
        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination'),
            searchResultTemplate = 'searchResultTemplate',
            messageTemplate = 'messageTemplate',
            addUserResultTemplate = 'addUserResultTemplate',
            $addUserAllListForm = $('#addUserAllListForm'),
            $addUserAllList = $('#addUserAllList'),
            $addsearchResultPagination = $('#addsearchResultPagination'),
            $addpageNum = $addUserAllListForm.find('input[name=page]'),
            $addpageSize = $addUserAllListForm.find('input[name=size]');
        var firstSelectId=null;
        // 获取项目状态管理列表
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
                url: apiHost + '/hoss/project/assing/getProjectAssistantDistributeDto.do',
//                data: $context.serialize(),
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


                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取项目助理分配失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取项目助理分配失败！');
                }).
                always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');


//        var $assignUserSearchForm = $('#assignSearchForm');
//        $searchResultList.on('click', '.btn-edit', function(event) {
//            if (event) {
//                event.preventDefault();
//            }
//            $('#assginSaveProjectUser').modal('show');
//            $('#loadTable').html('');
//            var $that = $(this),
//                isAssign = $.trim($that.attr('data-isAssign')),
//                projectId = $.trim($that.attr('data-projectId'));//传递到页面中
//            $assignUserSearchForm.find('#projectId').val(projectId);
//            $assignUserSearchForm.find('#isAssign').val(isAssign);
//            $assignUserSearchForm.trigger('submit');
//
//        });



//        /**
//         * 项目指定或变更
//         * @returns {boolean}
//         */
//        $assignUserSearchForm.on('submit', function (event) {
//            if (event) {
//                event.preventDefault();
//            }
//            var $mySearchResultPagination = $('#mySearchResultPagination');
//            var $userPageSize = $assignUserSearchForm.find('input[name=size]');
//            var $userPageNum = $assignUserSearchForm.find('input[name=page]');
//            $.ajax($.extend({
//                url: apiHost + '/hoss/project/assing/getQcProjectUserDtoByPage.do',
//                data: clearEmptyValue($assignUserSearchForm)
//            }, jsonp)).
//                done(function (data) {
//                    function useful(data) {
//                        var dataObj = data.data || {};
//                        dataObj.currentProjectId = $assignUserSearchForm.find('input[name=projectId]').val();
//                        // 显示数据
//                        $('#loadTable').html(template('assignProjectPeopleTemplate', dataObj));
//                        // 显示分页
//                        $mySearchResultPagination.pagination({
//                            $form: $assignUserSearchForm,
//                            totalSize: dataObj.page.totalElements,
//                            pageSize: parseInt($userPageSize.val()),
//                            visiblePages: 5,
//                            info: true,
//                            paginationInfoClass: 'pagination-count pull-left',
//                            paginationClass: 'pagination pull-right',
//                            onPageClick: function (event, index) {
//                                $userPageNum.val(index - 1);
//                                $assignUserSearchForm.trigger('submit');
//                            }
//                        });
//
//                    }
//
//                    function useless(data) {
//                        systemMessage({
//                            type: 'info',
//                            title: '提示：',
//                            detail: data.detail || '获取项目助理分配失败！'
//                        });
//                    }
//
//                    doneCallback.call(this, data, useful, useless);
//                }).
//                fail(function (jqXHR) {
//                    failCallback.call(this, jqXHR, '获取项目助理分配失败！');
//                });
//        });

        window.showZhiding=showZhiding;
        function showZhiding(projectId){

            $('#addUserAllList').modal('show');
            $addpageNum.val('0');
            findAllUserList(projectId, $addpageNum.val(), $addpageSize.val());
        }


        // 弹出框获取项目助理
        function findAllUserList(projectId, page, size) {

            $.ajax($.extend({
                url: apiHost + '/hoss/project/assing/getQcProjectUserDtoByPage.do',
                data: {
                    projectId: projectId,
                    page: page,
                    size: size
                },
                beforeSend: function () {}
            }, jsonp)).
                done(function (data) {
                    function useful(data) {
                        var dataObj = data.data || {},
                            templateId = ($.isArray(dataObj.page.content) && dataObj.page.content.length) ?
                                addUserResultTemplate :
                                messageTemplate;

                        // 显示数据
                        $("#showAddMo").html(
                            template(templateId, dataObj),
                            $("#projectName").text(dataObj.projectName),
                            $("#projectArea").text(dataObj.projectArea),
                            $("#targetNum").text(dataObj.targetNum),
                            $("#time").text(dataObj.startTime+"~"+dataObj.endTime),
                            $("#positionName").text(dataObj.positionName),
                            $("#positionName2").text("请指定该项目的"+dataObj.positionName+"："),
                            $("#projectId").val(projectId),
                            selectName(dataObj.selectName,projectId)
                        );

                        selectBox(dataObj.page.content)
                        // 显示分页
                        $addsearchResultPagination.pagination({
                            $form: $addUserAllListForm,
                            totalSize: dataObj.page.totalElements,
                            pageSize: parseInt($addpageSize.val()),
                            visiblePages: 5,
                            info: true,
                            paginationInfoClass: 'pagination-count pull-left',
                            paginationClass: 'pagination pull-right',
                            onPageClick: function (event, index) {
                                $addpageNum.val(index - 1);
                                findAllUserList(projectId, $addpageNum.val(), size);
                            }
                        });


                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '获取数据列表出错！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                }).
                fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取数据列表出错！');
                });
        }
        function selectName(obj,projectId){
            if(null==firstSelectId||firstSelectId!=projectId){
                firstSelectId = projectId;
                if(null!=obj&&obj.length>0){
                    for(var i= 0;i<obj.length;i++){
                        if ($("#userNm_selected > .userNm_" + obj[i].id).length < 1 ) {
                            $('#addUserAllList').find("#userNm_selected").append(userNm_template.replace("{value}", obj[i].id).replace("{id}", obj[i].id).replace("{userNm}", obj[i].name))
                        }
                    }
                }
            }
        }
        function selectBox(obj){
            if(null!=obj&&obj.length>0){
                for(var i= 0;i<obj.length;i++){
                    if ($("#userNm_selected > .userNm_" + obj[i].userId).length >0) {
                        $('#addUserAllList').find("#"+obj[i].userId).prop("checked", "checked");
                    }
                }
            }
        }
        var userNm_template =
            '<strong class="table-user del-assistant userNm_{id}" ' +
            'name="userNm_{id}" data-toggle="confirmation" data-placement="top" ' +
            'data-original-title="请确认该操作">{userNm}<s class="i-del"></s>' +
            '<input name="userNm" value="{value}" type="hidden"/></strong>';

        window.onCheckedUser=onCheckedUser;
        function onCheckedUser(obj,userName){
            if($('#addUserAllList').find("#"+obj).prop("checked")==true){
                var id = obj;
                var text = userName;
                if ($("#userNm_selected > .userNm_" + id).length < 1 && id.length > 0) {
                    $('#addUserAllList').find("#userNm_selected").append(userNm_template.replace("{value}", id).replace("{id}", id).replace("{userNm}", text))
                }
            }else{
                $("#userNm_selected > .userNm_" + obj).remove();
            }
        }
        $("div").on("click", ".i-del", function () {

            $('#addUserAllList').find("#"+$(this).next().val()).prop("checked", false);
            $(this).parent().remove();
        });
        $('#addUserAllList').on('click', '#saveProjectCancel', function (event) {
            firstSelectId = null;
            $('#addUserAllList').find("#userNm_selected").html('');
        });
        $('#addUserAllList').on('click', '.close', function (event) {
            firstSelectId = null;
            $('#addUserAllList').find("#userNm_selected").html('');
        });

        //保存（指定或变更动作）update by zhoujun 20140924
        $('#addUserAllList').on('click', '#addUserIds', function (event) {
            if (event) {
                event.preventDefault();
            }
            var checkedUser =  $("input[name=userNm]");
//            if(checkedUser && checkedUser.length > 0) {
//                //
//            } else {
//                systemMessage('请选择项目助理');
//                return;
//            }
            $.ajax($.extend({
                url: apiHost + '/hoss/project/assing/qcAssignOrChangeUser.do',
                data: clearEmptyValue($("#addUserAllListForm")),
                beforeSend: function () {
                    // $that.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '指定或变更项目人员成功！'
                        });
                        $('#assginSaveProjectUser').modal('hide');
                        location.reload();
                    }

                    function useless(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '指定或变更项目人员失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '指定或变更项目人员失败！');
                });
        });
//        //保存（指定或变更动作）
//        $('#assginSaveProjectUser').on('click', '#saveAssignProject', function (event) {
//            if (event) {
//                event.preventDefault();
//            }
//            var checkedUser =  $('#assginSaveProjectUser').find('[name="userIds"]:checked');
//            if(checkedUser && checkedUser.length > 0) {
//                //
//            } else {
//                systemMessage('请选择项目助理');
//                return;
//            }
//            $.ajax($.extend({
//                url: apiHost + '/hoss/project/assing/qcAssignOrChangeUser.do',
//                data: clearEmptyValue($assignUserSearchForm),
//                beforeSend: function () {
//                    // $that.attr('disabled', 'disabled');
//                }
//            }, jsonp))
//                .done(function (data) {
//                    function useful(data) {
//                        systemMessage({
//                            type: 'info',
//                            title: '提示：',
//                            detail: '指定或变更项目人员成功！'
//                        });
//                        $('#assginSaveProjectUser').modal('hide');
//                        location.reload();
//                    }
//
//                    function useless(data) {
//                        systemMessage({
//                            type: 'info',
//                            title: '提示：',
//                            detail: '指定或变更项目人员失败！'
//                        });
//                    }
//
//                    doneCallback.call(this, data, useful, useless);
//                })
//                .fail(function (jqXHR) {
//                    failCallback.call(this, jqXHR, '指定或变更项目人员失败！');
//                });
//        });



    }


    $(document).ready(domReady);

});