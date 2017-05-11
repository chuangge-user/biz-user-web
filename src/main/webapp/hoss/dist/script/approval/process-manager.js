define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;
    var $ = require('jquery');
    require('datepicker');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var modal = require('bootstrap/modal');
    var template = require('template');
    var dateStr = require('date-extend');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var pagination = require('pagination');
    var confirmation = require('bootstrap/confirmation');
    var areaPicker = require('area-picker');
    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var flowStatus = workflowProp.flowStatus;
    template.helper("flowStatus",flowStatus);//对template增加全局变量或方法
    var userDeptTree = workflowProp.userDeptTree;


    function domReady(){



        $('input[name=applyDate]').attr("value", "");
        var $datepickerGroup = $('#datepicker > input'),
            applyDate;
        $datepickerGroup.datepicker({
            autoclose: true,
            language: 'zh-CN',
            dateFormat: 'yy-mm-dd'
        });


        var $searchForm = $('#searchForm'),
            $pageNum = $searchForm.find('input[name=page]'),
            $pageSize = $searchForm.find('input[name=size]'),
            $searchResultList = $('#searchResultList'),
            $searchResultPagination = $('#searchResultPagination');

        // 更新查询条件时，页码返回第一页
        $searchForm.find('input, select').on('change', function () {
            $pageNum.val('0');
        });

        workflowProp.getDefinitions('processKey');

        var $province = $('#province'),
            $city = $('#city');

        areaPicker.provinceToCity($province, $city);

        // 已发申请列表
        $searchForm.on('submit', function(event){
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
                url: apiHost + '/hoss/wfTask/listMyProcess.do?flowSentSearchType=' + 'systemManager',
                data: clearEmptyValue($context),
                beforeSend: function () {
                    $submit.attr('disabled', 'disabled');
                }
            }, jsonp))
                .done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};
                        var templateId = (
                            $.isArray(dataObj.content) &&
                            dataObj.content.length
                            ) ? 'searchResultTemplate' : 'messageTemplate';

                        // 显示数据
                        $searchResultList.find('tbody').html(
                            template(templateId, data)
                        );
                        // 显示分页
                        $searchResultPagination.pagination({
                            $form: $context,
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
                            detail: data.detail || '获取列表数据失败！'
                        });
                    }

                    doneCallback.call(this, data, useful, useless);
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取列表数据失败！');
                })
                .always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });

        }).trigger('submit');

        // 修改审批人
        $searchResultList.on('click', '.btn-updateAuditUser', function (event) {
            $(this).val("");
            if (event) {
                event.preventDefault();
            }
            var wfInstanceId = $(this).attr('data-wfInstanceId');
            var businessKey = $(this).attr('data-businessKey');
            var taskId = $(this).attr('data-taskId');
            var wfTaskId = $(this).attr('data-wfTaskId');
            var curAuditUserName = $(this).attr('data-curAuditUserName');
            showAuditUser(wfTaskId, curAuditUserName);
        });


        // 修改流程
        $searchResultList.on('click', '.btn-updateProcess', function (event) {
            if (event) {
                event.preventDefault();
            }
            var wfInstanceId = $(this).attr('data-wfInstanceId');
            var businessKey = $(this).attr('data-businessKey');
            var taskId = $(this).attr('data-taskId');
            var wfTaskId = $(this).attr('data-wfTaskId');
            var wfInstanceId = $(this).attr('data-wfInstanceId');
            var curAuditUserName = $(this).attr('data-curAuditUserName');
            showUpdateProcess(wfInstanceId,taskId,wfTaskId, curAuditUserName);
        });


        function showAuditUser (wfTaskId, curAuditUserName) {
            var str =
                '<div id="doCarbonCopyDivModal" class="modal fade" >' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title">修改审批人</h4>' +
                '</div>' +
                '<div class="modal-body">' +
                '<div>' +
                '<td>当前审批人：<span id="curAuditUserNameSpan"></span></td><br>' +
                '<span>修改审批人：' +
                '<input type="text" name="auditUserName" style="width: 180px;" placeholder="请选择审批人员"> <input type="hidden" name="receivers"/> <input type="hidden" id="curAuditWfTaskId" name="wfTaskId" value="'+wfTaskId+'"/>'  +
                '</span>' +
                '</div>' +
                '<div class="dialog-btn-line">' +
                '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<a class="btn btn-success btn-doCarbonCopy" href="javascript:void(0)" >确定</a>' +
                '<a class="btn btn-default" aria-hidden="true" data-dismiss="modal">返回</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
            if($("#doCarbonCopyDivModal").length == 0){
                $(str).appendTo('body');
            }
            showOrg();
//            $(str).appendTo('body');
            $("#curAuditUserNameSpan").html(curAuditUserName);
            $("#curAuditWfTaskId").val(wfTaskId);
            $('#doCarbonCopyDivModal').modal('show');
            $('[name=auditUserName]').val("");
            $('[name=auditUserName]').unbind("click"); //移除click
            var url =  '/dist/widget/ztree/zTreeStyle/zTreeStyle.css';
            loadCSS(webHost+url);
            $('[name=auditUserName]').on("click", function() {
                $('#doCarbonCopyDivModal').modal('hide');
                userDeptTree.show();
            });

            $('.btn-doCarbonCopy').unbind("click"); //移除click
            $('.btn-doCarbonCopy').on('click', function() {
                $.ajax($.extend({
                    url: apiHost + '/hoss/wfTask/updateAuditUserName.do?',
                    data: {
                        wfTaskId : wfTaskId,
                        userId : $('[name=receivers]').val()
                    },
                    beforeSend: function () {
                    }
                }, jsonp))
                    .done(function (data) {

                        function useful(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '修改失败！'
                            });
                            $('#doCarbonCopyDivModal').modal('hide');
                            $searchForm.submit();
                        }

                        function useless(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '获取列表数据失败！'
                            });
                        }

                        doneCallback.call(this, data, useful, useless);
                    })
                    .fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '获取列表数据失败！');
                    })
            });
        }

        function showUpdateProcess (wfInstanceId,taskId,wfTaskId, curAuditUserName) {
//            var url =  '/dist/widget/ztree/zTreeStyle/zTreeStyle.css';
//            loadCSS(webHost+url);

            var str =
                '<div id="updateProcessDivModal" class="modal fade" >' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title">修改流程</h4>' +
                '</div>' +
                '<div class="modal-body">' +
                '<div>' +
                '<td>当前审批人：<span id="curAuditUserName"></span><span id="currentPosition"></span></td><br>' +
                '<span>修改审批流程至：' +
                '<select id="selectAllAuditUser_wf"></select> <input type="hidden" name="receivers"/> <input type="hidden" id="curAuditProcessWfTaskId" name="wfTaskId" value="'+wfTaskId+'"/>' +
                ' <span id="moreUserName"></span><input type="hidden" id="moreUserId"/>'  +
                '</span>' +
                '</div>' +
                '<div class="dialog-btn-line">' +
                '</div>' +
                '</div>' +
                '<div class="modal-footer">' +
                '<a class="btn btn-success btn-updateProcessDivModal" href="javascript:void(0)" >确定</a>' +
                '<a class="btn btn-default" aria-hidden="true" data-dismiss="modal">返回</a>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';
                if($("#updateProcessDivModal").length == 0){
                    $(str).appendTo('body');
                }
                $('.btn-updateProcessDivModal').unbind("click"); //移除click
                $('.btn-updateProcessDivModal').on('click', function() {

                    var $selectAllAuditUser_wf = $("#selectAllAuditUser_wf");
                    var needJumpToTaskKey = $selectAllAuditUser_wf.val();
                    var assgineeId = $selectAllAuditUser_wf.find("option:selected").attr("data-assgineeId");
                    if(isEmpty(assgineeId)){
                        assgineeId = "";
                    }
                    if(isEmpty(needJumpToTaskKey) || isEmpty(assgineeId) ){
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '请选择流程节点！'
                        });
                        return;
                    }
                    $.ajax($.extend({
                        url: apiHost + '/hoss/wfTask/updateProcess.do?',
                        data: {
                            wfTaskId : wfTaskId,
                            taskId : taskId,
                            wfInstanceId : wfInstanceId,
                            needJumpToTaskKey : needJumpToTaskKey,
                            needJumpToUserId : assgineeId
                        },
                        beforeSend: function () {
                        }
                    }, jsonp))
                        .done(function (data) {

                            function useful(data) {
                                systemMessage({
                                    type: 'info',
                                    title: '提示：',
                                    detail: data.detail || '修改失败！'
                                });
                                $('#updateProcessDivModal').modal('hide');
                                $searchForm.submit();
                            }

                            function useless(data) {
                                systemMessage({
                                    type: 'info',
                                    title: '提示：',
                                    detail: data.detail || '获取列表数据失败！'
                                });
                            }

                            doneCallback.call(this, data, useful, useless);
                        })
                        .fail(function (jqXHR) {
                            failCallback.call(this, jqXHR, '获取列表数据失败！');
                        })
                });

            $("#curAuditUserName").html(curAuditUserName);
            $("#curAuditProcessWfTaskId").val(wfTaskId);
            $('#updateProcessDivModal').modal('show');

            findAllAuditUserByTaskId(wfInstanceId,taskId);

//            $("#selectAllAuditUser_wf").change(function(){
//
//                var assgineeId = $(this).find("option:selected").attr("data-assgineeId");
//                var taskKey = $(this).val();
//                if(taskKey == 'more'){
//                    $('#updateProcessDivModal').modal('hide');
//                    showOrgForUpdateProcess();
//                    userDeptTree.show();
//                }else{
//                    $("#moreUserName").html("");
//                    $("#moreUserId").val("");
//                }
//
//            });

        }

        function findAllAuditUserByTaskId(wfInstanceId,taskId){

            function clearNullValue(val){
                if(isEmpty(val)||val =='null'){
                    return "";
                }
                return val;
            }
            if(!isEmpty(taskId)){
                $.ajax($.extend({
                    url: apiHost + '/hoss/wfTask/findAllAuditUserByTaskId.do',
                    data: {"taskId":clearNullValue(taskId),
                        "wfInstanceId":clearNullValue(wfInstanceId)
                    }
                }, jsonp))
                    .done(function (data) {

                        function useful(data) {

                            var $selectAllAuditUser_wf = $("#selectAllAuditUser_wf");
                            $selectAllAuditUser_wf.empty();

                            var str = "<option  value=''>请选择</option>";
                            var dataObj = data.data || {};
                            $.each(dataObj.content, function (i, item) {
                                str+="<option " +
                                    "data-assgineeId=" + item.assgineeId +
                                    "  value='" + item.taskKey +
                                    "'>"+item.assgineeName+"【"+item.taskName+"】"+"</option>"
                            });
//                            str+="<option data-assgineeId='-99' value='more'>"+"更多"+"</option>";
//                            str +="</select><span id='moreUserName'></span><input type='hidden' id='moreUserId'/></div>";

                            $selectAllAuditUser_wf.append(str);
                        }

                        function useless(data) {
                        }

                        doneCallback.call(this, data, useful, useless);
                    })
                    .fail(function (jqXHR) {
                    }).always(function () {
                    });

                modifyPosition(taskId);
            }
            function modifyPosition(taskId){

                $.ajax($.extend({
                    url: apiHost + '/hoss/wfTask/findTaskByTaskId.do',
                    data: {"taskId":clearNullValue(taskId)
                    }
                }, jsonp))
                    .done(function (data) {

                        function useful(data) {
                            $("#currentPosition").html("【"+data.data+"】");
                        }

                        function useless(data) {
                        }

                        doneCallback.call(this, data, useful, useless);
                    })
                    .fail(function (jqXHR) {
                    }).always(function () {
                    });
            }

        }

        function loadCSS(url){
            var s = document.createElement("LINK");
            s.rel = "stylesheet";
            s.type = "text/css";
            s.href = url;
            document.getElementsByTagName("HEAD")[0].appendChild(s);
        }
        function showOrg(){
            var $carbonCopyModal = $('#userDeptModal');
            var $doCarbonCopyDivModal = $("#doCarbonCopyDivModal")
            userDeptTree.init(function () {
                userDeptTree.$doneSelectedStaff.on('click', function () {
                    var result = userDeptTree.getSelectedStaff();
                    $doCarbonCopyDivModal.find('[name=auditUserName]').val(result.names);
                    $doCarbonCopyDivModal.find('[name=receivers]').val(result.ids);
                    userDeptTree.clear();
                });
            });
            $carbonCopyModal.on('show.bs.modal', function (e) {
                userDeptTree.cancelSelectedNode();
                $doCarbonCopyDivModal.modal("hide");
            });

            $carbonCopyModal.on('hide.bs.modal', function (e) {
                $doCarbonCopyDivModal.modal("show");
            });

        }

        function showOrgForUpdateProcess(){

            var $carbonCopyModal = $('#userDeptModal');
            var $updateProcessDivModal = $("#updateProcessDivModal")
            userDeptTree.init(function () {
                userDeptTree.$doneSelectedStaff.on('click', function () {
                    var result = userDeptTree.getSelectedStaff();
                    $("#moreUserName").html("<B>您选择的审批人员是：<font color='green'>"+result.names+"</font></B>");
                    $("#moreUserId").val(result.ids);
                    userDeptTree.clear();
                });
            });
            $carbonCopyModal.on('show.bs.modal', function (e) {
//                userDeptTree.cancelSelectedNode();
                $updateProcessDivModal.modal("hide");
            });

            $carbonCopyModal.on('hide.bs.modal', function (e) {
                $updateProcessDivModal.modal("show");
            });

        }


        /**
         *
         * @param v 需要判断的值
         * @param allowBlank 是否可以为空串 true  当是“”时返回false不为空
         * @returns {boolean|*}
         */
        function isEmpty(v, allowBlank) {
            return v === null || v === undefined || v === 'undefined' || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
        }

    }

    $(document).ready(domReady);

});