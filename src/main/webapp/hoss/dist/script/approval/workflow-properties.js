define(function (require) {

    var $ = require('jquery');
    var modal = require('bootstrap/modal');
    var popover = require('bootstrap/popover');
    var carbonCopy = require('script/carbon-copy');
    var userDeptTree = require('script/userDeptTree');
    var commonMap = require('script/common-map');
    var dateExtend = require('date-extend');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;
    var sessionStorage = hoss.sessionStorage;
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var confirmation = require('bootstrap/confirmation');
    var systemMessage = require('system-message');
    var treeType = "audit";//audit 选择审批人   delegate 选择委托人
    var flowStatus = {'0': '草稿',
        '1': '审批中',
        '2': '审批通过',
        '3': '审批不通过',
        '4': '已撤消',
        '5': '暂缓',
        '6': '退回'};


    // 查看、 审批  表单状态
    var flowStatusHtml = {'0': flowStatus[0],
        '1': '<font style="color: #0000ff">' + flowStatus[1] + '</font><ins class="icon-status-blue"></ins>',
        '2': '<font style="color: #008000">' + flowStatus[2] + '</font><ins class="icon-status-green"></ins>',
        '3': '<font style="color: #ff0000">' + flowStatus[3] + '</font><ins class="icon-status-red"></ins>',
        '4': '<font style="color: #008000">' + flowStatus[4] + '</font><ins class="icon-status-blue"></ins>',
        '5': '<font style="color: #008000">' + flowStatus[5] + '</font><ins class="icon-status-blue"></ins>',
        '6': '<font style="color: #ff0000">' + flowStatus[6] + '</font><ins class="icon-status-red"></ins>'
    };
    require('script/approval/approval-status').initStatus(flowStatusHtml) // 表单状态

    var definitionConstants = {
        QZQYS: "QZQYS",  //项目全周期预算表
        YDYS: "YDYS",    //项目月度预算表
        FYSQ: "FYSQ",    //项目费用申请单
        FYBX: "FYBX",    //项目费用报销单
        HTSP: "HTSP",    //项目合同审批单
        XMFK: "XMFK",    //项目合同付款单
        BZJFK: "BZJFK",  //项目保证金付款单
        TKSQ: "TKSQ",    //项目退款申请单
        QDJS: "QDJS",    //渠道佣金结算单
        TGFJMSQ: "TGFJMSQ",//团购费减免申请单
        QDBZ: "QDBZ",    //渠道佣金结算标准申请单(老数据)
        JSBZ: "JSBZ",    //佣金结算标准申请单(新数据)
        WPSQ: "WPSQ",    //项目物品领用申请单
        WPHX: "WPHX",    //项目物品核销单
        QDFJ: "QDFJ",    //渠道任务分解
        TYBD: "TYBD",     //通用表单
        JGYJ: "JGYJ",     //机构佣金结算单
        GRYJ: "GRYJ",     //个人佣金结算单
        YJTD: "YJTD"      //机构佣金跳点申请单
    };

    var definitionMap =  new commonMap.CommonMap();
    definitionMap.put("QZQYS",'项目全周期预算表');
    definitionMap.put("YDYS",'项目月度预算表');
    definitionMap.put("FYSQ",'项目费用申请单');
    definitionMap.put("FYBX",'项目费用报销单');
    definitionMap.put("HTSP",'项目合同审批单');
    definitionMap.put("XMFK",'项目合同付款单');
    definitionMap.put("BZJFK",'项目保证金付款单');
    definitionMap.put("TKSQ",'项目退款申请单');
//    definitionMap.put("QDJS",'渠道佣金结算单');
    definitionMap.put("TGFJMSQ",'团购费减免申请单');
    definitionMap.put("QDBZ",'渠道佣金结算标准申请单');
    definitionMap.put("WPSQ",'项目物品领用申请单');
    definitionMap.put("WPHX",'项目物品核销单');
    definitionMap.put("QDFJ",'渠道任务分解');
    definitionMap.put("TYBD",'通用表单');
    definitionMap.put("JGYJ",'机构佣金结算单');
    definitionMap.put("GRYJ",'个人佣金结算单');
    definitionMap.put("YJTD",'机构佣金跳点申请单');

    var workflowObj = {
        processKey: null,
        businessKey: null,
        wfInstanceId: null,
        taskId: null,
        flowImageId: 'flow',
        contentId: 'content',
        workflowCommentId: 'workflowComment',
        flowType:'',// new(新建 修改) / audit /view
        conditionMap:{},
        noCityProject:false
    };

    function getLocationParam(param) {
        var request = {
            QueryString: function (val) {
                var uri = window.location.search;
                var re = new RegExp("" + val + "=([^&?]*)", "ig");
                return ((uri.match(re)) ? (decodeURI(uri.match(re)[0].substr(val.length + 1))) : '');
            }
        }
        return request.QueryString(param);
    }

    /**
     *
     * @param v 需要判断的值
     * @param allowBlank 是否可以为空串 true  当是“”时返回false不为空
     * @returns {boolean|*}
     */
    function isEmpty(v, allowBlank) {
        return v === null || v === undefined || (($.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
    }

    /**
     * 显示流程名称
     * @param workflowObj
     */
    function showProcessName(workflowObj){
        var $h2 = $("h2");
        if($h2){
            if(!isEmpty(workflowObj.flowType)&&workflowObj.flowType=='new'){
                $h2.html(definitionMap.get(workflowObj.processKey));
            }else{
                $h2.html("<a href='javascript:void(0)' class=\"toTab\">查看审批流程</a>"+"("+definitionMap.get(workflowObj.processKey)+")"+"<span id=\"flowId\" style=\"float:right;padding-right:20px;\"></span>");
                $(".toTab").click(function () {
                    $("html, body").animate({
                        scrollTop: $("#flow").offset().top + "px"
                    }, {
                        duration: 500,
                        easing: "swing"
                    });
                    return false;
                });
            }
        }
    }

    /**
     * 显示流程图
     * @param processKey
     * @param wfInstanceId
     * @param taskId
     */
    function getFlowImage(workflowObj) {
        if (!$("#" + workflowObj.flowImageId)) {
            return;
        }
        if(isEmpty(workflowObj.taskId)||workflowObj.taskId == 'null'){
            workflowObj.taskId = "";
        }
        var paramsUrl =
            "wfInstanceId="+(workflowObj.wfInstanceId||"")
            +"&taskId="+(workflowObj.taskId||"")
            +"&processKey="+(workflowObj.processKey||"");

        var url = apiHost+"/hoss/workflow/getImageFlow.do?"+paramsUrl;

        var taskDataUrl = apiHost+"/hoss/workflow/getImageData.do?"+paramsUrl;


        $("#" + workflowObj.flowImageId).click(function (event) {
            if (event) {
                event.preventDefault();
            }
            var str = '<div id="flowImageDivModal" class="modal fade" >' +
                '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                '<h4 class="modal-title">流程跟踪图</h4>' +
                '</div>' +
                '<div class="modal-body">' +
                '<div id="flowImageDiv" >' +
                '<img src=""/>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>' +
                '</div>';

            var $flowImageDivModal = $('#flowImageDivModal');
            if (!$flowImageDivModal.length) {
                $(str).appendTo('body');
            }
            $flowImageDivModal = $('#flowImageDivModal');

            var $flowImageDiv = $('#flowImageDiv'),
                $flowImage = $flowImageDiv.find('img');
            $flowImage.attr('src', url).load(function(){
                $flowImageDivModal.find('.modal-dialog').css({
                    width: this.width + 30
                });
                $flowImageDivModal.modal('show');
            });
            $flowImageDivModal.modal('show');


//            $flowImageDivModal.on('show.bs.modal', function (e) {
//                $('.activity-flow').show();//显示提示popover
//            });

            $.ajax($.extend({
                url: taskDataUrl
            }, jsonp))
            .done(function (data) {
                function useful(data) {
                    var taskDto = data.data;
                    if(taskDto){
                        var x = taskDto.x;
                        var y = taskDto.y;
                        var width = taskDto.width;
                        var height = taskDto.height;
                        var taskKey = taskDto.taskKey;
                        var taskName = taskDto.taskName;// 当前任务名称
                        var assgineeName = taskDto.assgineeName;// 当前审批人
                        var flowStartUserName = taskDto.flowStartUserName;// 申请人
                        var end = taskDto.end;//是否结束
                        if(taskKey=='qc'){//在起草节点

                            $flowImageDiv.append(
                                    '<div class="activity-flow " ' +
                                    'data-content="申请人：'+ flowStartUserName +'" ' +
                                    'data-container="body" data-toggle="popover" data-placement="top" style="' +
                                    'top: '+ y + 'px; left: '+ x + 'px;' +
                                    'width: '+ width + 'px; height: '+ height + 'px;' +
                                    '"></div>'
                            );

                        }else{
                            if(end){
                                $flowImageDiv.append(
                                        '<div class="activity-flow" ' +
                                        'data-content="当前流程已结束'  + '<br>申请人：'+ flowStartUserName +'" ' +
                                        'data-container="body" data-toggle="popover" data-placement="top" style="' +
                                        'top: '+ y + 'px; left: '+ x + 'px;' +
                                        'width: '+ width + 'px; height: '+ height + 'px;' +
                                        '"></div>'
                                );
                            }else{
                                $flowImageDiv.append(
                                        '<div class="activity-flow" ' +
                                        'data-content="当前任务名称：'+ taskName + '<br>当前审批人：'+ assgineeName + '<br>申请人：'+ flowStartUserName +'" ' +
                                        'data-container="body" data-toggle="popover" data-placement="top" style="' +
                                        'top: '+ y + 'px; left: '+ x + 'px;' +
                                        'width: '+ width + 'px; height: '+ height + 'px;' +
                                        '"></div>'
                                );
                            }
                        }

                        $('.activity-flow').popover({
                            html: true,
                            trigger: 'hover'
                        });

                    }
                }

                function useless(data) {

                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '！');
            })
        });

    };

    /**
     * 处理工作流通用操作如：退回，暂缓，终止，撤销,抄送
     * @param wfInstanceId
     * @param taskId
     * @param contentId
     */
    function doWorkFlowCommonOper(workflowObj) {


        $("a[data-type]").click(function (event) {
            if(event){
                event.preventDefault();
            }
            var flowDealType = $(this).attr('data-type');
            workflowObj.flowDealType = flowDealType;
            workflowObj.content = $("#" + workflowObj.contentId).val();
            switch (flowDealType) {
                case 'defer':
                    showDeferDays(workflowObj);
                    break;
                case 'back':
                    showBackModal(workflowObj);
//                    doCommonOper(workflowObj);
                    break;
                case 'stop':
                    if(!confirm('确定要终止吗?')){
                        return;
                    }
                    doCommonOper(workflowObj);
                    break;
                case 'cancel':
                    if(!confirm('确定要撤销吗?')){
                        return;
                    }
                    doCommonOper(workflowObj);
                    break;
                case 'carbonCopy':
                    doCarbonCopy(workflowObj);
                    break;
            }


        });
        var $cancelBtn = $("a[data-type='cancel']");
        if ($cancelBtn) {//存在撤销按钮 判断是否有权限撤销
            validateCancelBtn($cancelBtn, workflowObj);
        }
    }

    /**
     * 验证是否有撤销权限
     * @param workflowObj
     */
    function validateCancelBtn($cancelBtn, workflowObj) {
        if (isEmpty(workflowObj.wfInstanceId)) {
            return;
        }
        $.ajax($.extend({
            url: apiHost + '/hoss/workflow/doValidateCancelBtn.do',
            data: $.param(workflowObj)
        }, jsonp))
            .done(function (data) {

                function useful(data) {
//                    console.log(data.data);
                    if (!data.data) {
                        $cancelBtn.remove();//无权限移除撤销按钮
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '操作失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取列表数据失败！');
            })
    }

    /**
     * 显示暂缓天数
     * @param workflowObj
     */
    function showDeferDays(workflowObj) {
        // 设置暂缓天数

        var str =
            '<div id="deferDaysDivModal" class="modal fade" >' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">设置暂缓天数</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div>' +
            '暂缓天数:' + '<input type="text" name="deferDays" class="form-control-sm w100">' +
            '</div>' +
            '<div class="dialog-btn-line">' +

            '</div>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<a class="btn btn-success btn-deferDays" href="javascript:void(0)" >确定</a>' +
            '<a class="btn btn-default" aria-hidden="true" data-dismiss="modal">返回</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        if (!$('#deferDaysDivModal').length) {
            $(str).appendTo('body');
            $("#deferDaysDivModal").on('click', '.btn-deferDays', function () {
                var deferDays = $("#deferDaysDivModal [name='deferDays']").val();
                var numReg = /^[0-9]*[1-9][0-9]*$/;
                if (numReg.test(deferDays)) {
                    workflowObj.deferDays = deferDays;
                    doCommonOper(workflowObj);
                } else {
                    systemMessage("格式不正确,请输入整数天数!");
                }
            });
        }
        $('#deferDaysDivModal').modal('show');


    }

    function showBackModal(workflowObj) {

        var str =
            '<div id="backDivModal" class="modal fade" >' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">请选择退回审批人</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div>' +
            '<span>请选择退回审批人：' +
            '<select id="backSelectNode"></select>' +
            '</span>' +
            '</div>' +
            '<div class="dialog-btn-line">' +
            '</div>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<a class="btn btn-success btn-backDivModal" href="javascript:void(0)" >提交</a>' +
            '<a class="btn btn-default" aria-hidden="true" data-dismiss="modal">取消</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
        if($("#backDivModal").length == 0){
            $(str).appendTo('body');
        }
        $('.btn-backDivModal').unbind("click"); //移除click
        $('.btn-backDivModal').on('click', clickBackFn);


        $('#backDivModal').modal('show');

        findCanReturnTask(workflowObj);

    }

    function clickBackFn(){

        var $backSelectNode = $("#backSelectNode");
        var backTaskKey = $backSelectNode.val();
        var wfTaskId = $backSelectNode.find("option:selected").attr("data-wfTaskId");
        if(isEmpty(backTaskKey) || isEmpty(wfTaskId) ){
            systemMessage({
                type: 'info',
                title: '提示：',
                detail: '请选择退回审批人！'
            });
            return;
        }
        workflowObj.wfTaskId = wfTaskId;

        if(!confirm('确定要退回吗?')){
            return;
        }
//        console.log(workflowObj);
        doCommonOper(workflowObj);

    }

    function findCanReturnTask(workflowObj){

        function clearNullValue(val){
            if(isEmpty(val)||val =='null'){
                return "";
            }
            return val;
        }
        if(!isEmpty(workflowObj.wfInstanceId)&&!isEmpty(workflowObj.taskId)){
            $.ajax($.extend({
                url: apiHost + '/hoss/wfTask/findCanReturnTask.do',
                data: {
                    "wfInstanceId":clearNullValue(workflowObj.wfInstanceId),
                    "taskId":clearNullValue(workflowObj.taskId)
                }
            }, jsonp))
                .done(function (data) {

                    function useful(data) {

                        var $backSelectNode = $("#backSelectNode");
                        $backSelectNode.empty();

                        var str = "<option  value=''>请选择</option>";
                        var dataObj = data.data || {};
                        var selectStr = '';
                        $.each(dataObj.content, function (i, item) {
                            if(i == 0){
                                selectStr = ' selected="selected" ';
                            }else{
                                selectStr = '';
                            }
                            str+="<option " +
                                "data-assgineeId=" + item.assgineeId +
                                " data-wfTaskId=" + item.wfTaskId +
                                "  value='" + item.taskKey +
                                "'" +
                                selectStr +
                                ">"+item.assgineeName+"【"+item.taskName+"】"+"</option>"
                        });

                        $backSelectNode.append(str);
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

    /**
     *  处理通用流程操作  ：退回/暂缓/终止/撤销接口
     *  wfInstanceId
     *  taskId
     * @return
     */
    function doCommonOper(workflowObj) {

//        console.log($.param(workflowObj))
//        return;
        $.ajax($.extend({
            url: apiHost + '/hoss/workflow/doCommonOper.do',
            data: $.param(workflowObj)
        }, jsonp))
            .done(function (data) {

                function useful(data) {
                    var dataObj = data.data || {};

//                    history.back();
                    location.href = document.referrer;
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '操作成功!'
                    });
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '操作失败！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '操作失败！');
            })
    }

    function loadCSS(url){
        var s = document.createElement("LINK");
        s.rel = "stylesheet";
        s.type = "text/css";
        s.href = url;
        document.getElementsByTagName("HEAD")[0].appendChild(s);
    }

    /**
     * 抄送
     * @param workflowObj
     */
    function doCarbonCopy(workflowObj) {
       var url =  '/dist/widget/ztree/zTreeStyle/zTreeStyle.css';
        loadCSS(webHost+url);
//        console.log(workflowObj);
//
        var str =
            '<div id="doCarbonCopyDivModal" class="modal fade" >' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">请选择抄送人员</h4>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div>' +
            '<input type="text" name="receiverNames" style="width: 300px;" placeholder="请选择抄送人员" class="form-control input-lg w100"> <input type="hidden" name="receivers"/>'  +
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



        if (!$('#doCarbonCopyDivModal').length) {
            $(str).appendTo('body');
            // 因为不在 domready 事件中，这里手动触发 IE9 placeholder
            if (!('placeholder' in document.createElement('input'))) {
                $('input[name=receiverNames]').placeholder();
            }

            $("#doCarbonCopyDivModal [name='receiverNames']").val('');
            $("#doCarbonCopyDivModal [name='receivers']").val('');

            showOrg();
            $("#doCarbonCopyDivModal [name='receiverNames']").focus(function(){
                carbonCopy.show();
            });

            $("#doCarbonCopyDivModal").on('click', '.btn-doCarbonCopy', function () {
                var receiverNames = $("#doCarbonCopyDivModal [name='receiverNames']").val();
                var receivers = $("#doCarbonCopyDivModal [name='receivers']").val();
//                console.log(receiverNames);
//                console.log(receivers);
                if(isEmpty(receiverNames)){
                    systemMessage("抄送人员不能为空!");
                    return;
                }
                workflowObj.receivers = receivers;
                workflowObj.receiverNames = receiverNames;


                $.ajax($.extend({
                    url: apiHost + '/hoss/workflow/doCarbonCopy.do',
                    data: $.param(workflowObj)
                }, jsonp))
                    .done(function (data) {

                        function useful(data) {
                            var dataObj = data.data || {};

                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: '操作成功!'
                            });
                            $('#doCarbonCopyDivModal').modal('hide');
                        }

                        function useless(data) {
                            systemMessage({
                                type: 'info',
                                title: '提示：',
                                detail: data.detail || '操作失败！'
                            });
                        }

                        doneCallback.call(this, data, useful, useless);
                    })
                    .fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '操作失败！');
                    })

            });
        }
        $('#doCarbonCopyDivModal').modal('show');
    }

    function showOrg(){
        var $carbonCopyModal = $('#carbonCopyModal');
        var $doCarbonCopyDivModal = $("#doCarbonCopyDivModal")
        carbonCopy.init(function () {
//            var ids = '1004910909,1004910910,1004910911';
//            carbonCopy.setSelectedStaff(ids);

            carbonCopy.$doneSelectedStaff.on('click', function () {
                var result = carbonCopy.getSelectedStaff();
//                console.log(result);
                $doCarbonCopyDivModal.find('[name=receiverNames]').val(result.names);
                $doCarbonCopyDivModal.find('[name=receivers]').val(result.ids);
//                console.log($doCarbonCopyDivModal.find('[name=receiverNames]').val());
//                console.log($doCarbonCopyDivModal.find('[name=receivers]').val());
                carbonCopy.clear();
            });
        });
        $carbonCopyModal.on('show.bs.modal', function (e) {
            var ids = $doCarbonCopyDivModal.find('[name=receivers]').val();
            if(!isEmpty(ids)){
                carbonCopy.setSelectedStaff(ids);
            }
//            console.log(ids);
            $doCarbonCopyDivModal.modal("hide");
        });

        $carbonCopyModal.on('hide.bs.modal', function (e) {
            $doCarbonCopyDivModal.modal("show");
        });

    }

    /**
     * 显示流程意见
     * @param wfInstanceId
     */
    function showComment(workflowObj) {

        if (!$("#" + workflowObj.workflowCommentId)) {
            return;
        }

        if (isEmpty(workflowObj.wfInstanceId)) {
            return;
        }

        $.ajax($.extend({
            url: apiHost + '/hoss/workflow/listFlowComment.do?wfInstanceId=' + workflowObj.wfInstanceId
        }, jsonp))
            .done(function (data) {

                function useful(data) {
                    var dataObj = data.data || {};

                    var comment = '<table class="table table-hover workflow-table">' +
                        ' <thead> <tr> ' +
                        '<th width="20%">职位</th> ' +
                        '<th width="20%">审批人</th> ' +
                        '<th width="15%">状态</th> ' +
                        '<th>审批意见</th>' +
                        '<th width="15%">审批日期</th>' +
                        ' </tr> </thead>' +
                        ' <tbody> ';
                    var userId = JSON.parse(sessionStorage.sessionData).id;

                    $.each(dataObj.content, function (i, item) {
                        var cls = "submit";
                        var dealTypeStr = "";
                        var content = item.content;
                        if (isEmpty(content)) {
                            content = "";
                        }
                        if(!isEmpty(item.secretSend) && item.secretSend == 1){
                            if(userId != item.nextUserId && userId != item.dealUserId){
                                return;
                            }
                        }
                        switch (item.dealType) {  //0发起流程,1同意,2退回,3暂缓,4终止
                            case 0:
                                cls = "submit";
                                dealTypeStr = "发起流程";
                                break;
                            case 1:
                                cls = "accept";
                                dealTypeStr = "<font color='green'>同意</font>";
                                break;
                            case 2:
                                cls = "refused";
                                dealTypeStr = "<font color='red'>退回</font>";
                                break;
                            case 3:
                                cls = "refused";
                                dealTypeStr = "<font color='red'>暂缓</font>";
                                break;
                            case 4:
                                cls = "refused";
                                dealTypeStr = "<font color='red'>终止</font>";
                                break;
                            case 5:
                                cls = "accept";
                                dealTypeStr = "<font color='red'>委托</font>";
                                break;
                        }
                        comment += '<tr> ' +
                            ' <td>' + item.taskNodeName + '</td>' +
                            ' <td>' + item.dealUserName + '</td>' +
                            ' <td><span class="' + cls + '">' + dealTypeStr + '</span></td>' +
                            ' <td>' + content + '</td>' +
                            ' <td>' + item.commentTime + '</td>' +
                            ' </tr>';

                    });
                    comment += '</tbody> </table>';
                    // 显示数据
                    $("#" + workflowObj.workflowCommentId).html(comment);
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

    }

    /**
     * 显示回退编辑意见
     */
        function showReturnContent(){
            var isReturn = getLocationParam("isReturn");
            if(!isEmpty(isReturn) && isReturn == 1){

                $("#content").parent().show();

            }
        }

    /**
     * 处理所有工作流通用
     *       使用如下：
     *       var workflowProp = require('script/approval/workflow-properties');
     var getLocationParam = workflowProp.getLocationParam;
     var workflowObj = workflowProp.workflowObj;
     var processKey = workflowProp.definitionConstants.FYSQ;
     var taskId = getLocationParam("taskId");//任务ID
     var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
     var businessKey = getLocationParam("businessKey");//业务主键ID
     workflowObj.wfInstanceId = wfInstanceId;
     workflowObj.businessKey = businessKey;
     workflowObj.taskId = taskId;
     workflowObj.processKey = processKey;
     workflowObj.flowImageId = "flow";  //设置流程a标签id
     workflowObj.contentId = "content"; //设置意见框id
     workflowObj.workflowCommentId = "workflowComment";//设置意见列表div id
     workflowObj.cityId = "cityId";
     workflowObj.projectId = "projectId";
     workflowProp.showWorkFlowAll(workflowObj);
     * @param workflowObj
     */
    function showWorkFlowAll(workflowObj) {

        if (!workflowObj) {
            throw new Error("未传流程参数");
        }
        checkAgree(workflowObj);
        hideDrftBtn();
        deleteBtn(workflowObj);
        //显示流程名称
        showProcessName(workflowObj);
        //显示流程定义
        getFlowImage(workflowObj);
        //显示意见
        showComment(workflowObj);
        //处理按钮操作
        doWorkFlowCommonOper(workflowObj);
        //打印处理
        doPrint();

        findAuditUsers(workflowObj);

        showReturnContent();

    }

    function hideDrftBtn() {
        if(getLocationParam("isReturn")) {
            $.each($('button,a,input[type="button"]'),
                function(idx,item) {
                    if ('保存草稿' == $(this).text() || '保存草稿' == $(this).val()) {
                        $(this).remove();
                    }
                }
            )
        }
    }

    /**
     * 检查界面是否存在同意按钮
     */
    function checkAgree(workflowObj) {
        //Delegate()
        $.each($('a,button'),
            function() {
                if('同意'==$(this).text()) {
                    $('<a class="btn btn-warning" style="margin:0 0 0 4px" id="delegateBtn">委托审批</a>').insertAfter($(this));
                    var url =  '/dist/widget/ztree/zTreeStyle/zTreeStyle.css';
                    loadCSS(webHost+url);
                }
            }
        );
        $('#delegateBtn').on('click',
            function(event) {
                    if(event){
                        event.preventDefault();
                    }
                    var str =
                        '<div id="delegateDivModal" class="modal fade" >' +
                        '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                        '<div class="modal-header">' +
                        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                        '<h4 class="modal-title">请选择委托审批人</h4>' +
                        '</div>' +
                        '<div class="modal-body">' +
                        '<div style="text-align: center">' +
                        '<input type="text" name="delegateUserName" style="width: 180px;" placeholder="请选择委托审批人"> <input type="hidden" name="delegateUserId"/>' +
                        '<span style="margin-left: 10px;"><input type="checkbox" name="secretSend"  >密送</span>'+
                        '</div>' +
                        '<div class="dialog-btn-line">' +
                        '</div>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '<a class="btn btn-success btn-delegateDivModal" href="javascript:void(0)" >提交</a>' +
                        '<a class="btn btn-default" aria-hidden="true" data-dismiss="modal">取消</a>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    if($("#delegateDivModal").length == 0){
                        $(str).appendTo('body');
                    }

                    showOrgForDelegate();

                    $('[name=delegateUserName]').val("");
                    $('[name=delegateUserName]').unbind("click"); //移除click


                    $('[name=delegateUserName]').on("click", function() {
                        $('#delegateDivModal').modal('hide');
                        treeType = "delegate";
                        userDeptTree.show();
                    });

                    $('.btn-delegateDivModal').unbind("click"); //移除click
                    $('.btn-delegateDivModal').on('click', function(){

                        var delegateUserName = $("[name=delegateUserName]").val();
                        var delegateUserId = $("[name=delegateUserId]").val();
                        var secretSend = 0;
                        if($("[name=secretSend]")[0].checked){
                            secretSend = 1;
                        }
                        if(isEmpty(delegateUserId)||isEmpty(delegateUserName)){
                            systemMessage("请选择委托审批人!");
                            return;
                        }
                        if(isEmpty(workflowObj.taskId)||isEmpty(workflowObj.wfInstanceId)){
                            systemMessage("当前流程任务节点任务不能为空");
                            return;
                        }

                        var content = $("#" + workflowObj.contentId).val();

                        $.ajax($.extend({
                            url: apiHost + '/hoss/workflow/doDelegate.do',
                            data: {
                                content : content,
                                taskId : workflowObj.taskId,
                                wfInstanceId : workflowObj.wfInstanceId,
                                delegateUserName : delegateUserName,
                                delegateUserId : delegateUserId,
                                secretSend:secretSend
                            },
                            beforeSend: function () {
                            }
                        }, jsonp))
                            .done(function (data) {

                                function useful(data) {
                                    systemMessage({
                                        type: 'info',
                                        title: '提示：',
                                        detail: data.detail
                                    });
                                    goBack();
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

                    $('#delegateDivModal').modal('show');
            }
        )
    };

    function showOrgForDelegate(){

        var $carbonCopyModal = $('#userDeptModal');
        var $delegateDivModal = $("#delegateDivModal")
        userDeptTree.init(function () {
            userDeptTree.$doneSelectedStaff.on('click', function () {
                if(treeType == 'delegate'){
                    var result = userDeptTree.getSelectedStaff();
//                console.log(result);
                    $("[name=delegateUserName]").val(result.names);
                    $("[name=delegateUserId]").val(result.ids);
                    userDeptTree.clear();
                }
            });
        });
        $carbonCopyModal.on('show.bs.modal', function (e) {
//                userDeptTree.cancelSelectedNode();
            $delegateDivModal.modal("hide");
        });

        $carbonCopyModal.on('hide.bs.modal', function (e) {
            if(treeType == 'delegate'){
                $delegateDivModal.modal("show");
            }
        });

    }

    function deleteBtn(workflowObj) {
        if (!isEmpty(workflowObj.taskId)) {
            if(isDelegateApproval(workflowObj) && $("a[data-type='back']").length > 0) {
                $(".text-center").find("a,button").not(".goback").remove();
                $('<a style="margin: 0 4px 0 0" class="btn btn-warning" id="delegateAgree">同意</a>').insertBefore(".goback");
                $('#delegateAgree').on("click",
                    function () {

                        if(!confirm("确定同意吗?")){
                            return;
                        }
                        var content = $("#" + workflowObj.contentId).val();

                        $.ajax($.extend({
                            url: apiHost + '/hoss/workflow/dealDelegate.do',
                            data: {
                                content : content,
                                taskId : workflowObj.taskId,
                                wfInstanceId: workflowObj.wfInstanceId
                            },
                            beforeSend: function () {
                            }
                        }, jsonp))
                            .done(function (data) {

                                function useful(data) {
                                    systemMessage({
                                        type: 'info',
                                        title: '提示：',
                                        detail: data.detail
                                    });
                                    goBack();
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
                    }
                )
            }
        }
    }

    function isDelegateApproval(workflowObj, callback) {
        var bool = false;
        $.ajax({
            type: "POST",
            url : apiHost + '/hoss/wfTask/isDelegateApproval.do',
            dataType : 'jsonp',
            async:false,
            data :{"taskId":workflowObj.taskId},
            jsonp:'callback',
//            jsonpCallback:'success',
            success: function(msg){
                bool = msg.data;
                if (callback) {
                    callback(msg);
                }
            }

        });
        return bool;
    }

    function doPrint(){
        var $printBtn = $("#flowPrint");
        if($printBtn){
            $printBtn.click(function(event){
                if(event){
                    event.preventDefault();
                }
                $("header").hide();
                $("#sidebar").hide();
                $printBtn.hide();
                $('.todo').hide();
                $('.toTab').hide();

                window.print();

                $("header").show();
                $("#sidebar").show();
                $printBtn.show();
                $('.todo').show();
                $('.toTab').show();
            });

        }
    }

    function goBack(){
        location.href = document.referrer;
    }

    function getDefinitions(defId) {
        var selObj = $('#' + defId);
        if (!selObj) {
            return;
        }

        $.ajax($.extend({
            url: apiHost + '/hoss/workflow/listDefinitionForSelect.do'
        }, jsonp))
            .done(function (data) {
                function useful(data) {
                    selObj.html('');
                    selObj.append('<option selected="selected" value="">请选择审批类型</option>');
                    var dataObj = data.data || {};
                    $.each(dataObj.content, function (i, item) {
                        if(item.processKey != 'YDYS'){
                            selObj.append('<option value="' + item.processKey + '">' + item.processName + '</option>')
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
    }

    function findAuditUsers(workflowObj){

        if(!isEmpty(workflowObj.flowType)&&workflowObj.flowType=='new') {//新建
           auditUserSelect(workflowObj,'new');
        }else{
            if($("a[data-type='back']").length > 0 ){//审批中
               auditUserSelect(workflowObj,'audit');
            }
        }

    }

    function auditUserSelect(workflowObj,type){
        var $projectId = $("#"+workflowObj.projectId);
        var $cityId = $("#"+workflowObj.cityId);
        userSelect();
        if($projectId){
            $projectId.change(function(){
                userSelect();
            })
        }
        if($cityId){
            $cityId.change(function(){
                userSelect();
            })
        }
        function userSelect(){
            var projectId = "";
            var cityId = "";
            if($projectId && !isEmpty(workflowObj.projectId) && !isEmpty($projectId.val())){
                projectId = $projectId.val();
            }else{
                projectId = getLocationParam("projectId");
            }
            if($cityId && !isEmpty(workflowObj.cityId) && !isEmpty($cityId.val())){
                cityId = $cityId.val();
            }else{
                cityId = getLocationParam("cityId");
            }
            function clearNullValue(val){
                if(isEmpty(val)||val =='null'){
                    return "";
                }
                return val;
            }
			if("-1"==projectId){
                projectId = getLocationParam("projectId");
            }
            if((!isEmpty(cityId)&&"-1"!=cityId&&cityId!='请选择城市')||
                (!isEmpty(projectId)&&"-1"!=projectId&&projectId!='请选择项目')||
                !isEmpty(workflowObj.businessKey)||
                workflowObj.noCityProject
                ){

                $.ajax($.extend({
                    url: apiHost + '/hoss/wfTask/findAuditUsers.do',
                    data: {"taskId":clearNullValue(workflowObj.taskId),"processKey":clearNullValue(workflowObj.processKey),
                        "workFlowModel.id":clearNullValue(workflowObj.businessKey),
                        "cityId":clearNullValue(cityId),
                        "projectId":clearNullValue(projectId),
                        "wfInstanceId":clearNullValue(workflowObj.wfInstanceId),
                        "conditionMapStr":JSON.stringify(workflowObj.conditionMap)
                    }
                }, jsonp))
                    .done(function (data) {

                        function useful(data) {
                            if($("#selectAuditUser_wf").length>0){
                                $("#selectAuditUser_wf").parent().remove();
                            }
                            var str = "<div><select id='selectAuditUser_wf'>"
//                        "<option  value=''>请选择下一步审批人</option>"
                                ;
                            var dataObj = data.data || {};
                            $.each(dataObj.content, function (i, item) {
                                if(i == 0){
                                    str+="<option selected='selected' " +
                                        "data-assgineeId=" + item.assgineeId +
                                        "  value='" + item.taskKey +
                                        "'>"+item.assgineeName;

                                        if(!isEmpty(item.taskName)){
                                            str += "【"+item.taskName+"】</option>"
                                        }else{
                                            str += "</option>";
                                        }

                                }else{
                                    str+="<option " +
                                        "data-assgineeId=" + item.assgineeId +
                                        "  value='" + item.taskKey +
                                        "'>"+item.assgineeName;
                                    if(!isEmpty(item.taskName)){
                                        str += "【"+item.taskName+"】</option>"
                                    }else{
                                        str += "</option>";
                                    }
                                }
                            });
                            str+="<option data-assgineeId='-99' value='more'>"+"请选择审批人"+"</option>";
                            str +="</select><span id='moreUserName'></span><input type='hidden' id='moreUserId'/></div>";
                            if('new'==type){
                                if($("#content").length > 0 && !$("#content").is(":hidden") ){
                                    $(str).insertAfter($("#content"));
                                }else{
                                    $(str).insertAfter($("#"+workflowObj.flowImageId).parent().parent());
                                }
                            }else{
//                        $(str).insertAfter($("#"+workflowObj.workflowCommentId));
                                $(str).insertAfter($("#content"));
                            }
                            var url =  '/dist/widget/ztree/zTreeStyle/zTreeStyle.css';
                            loadCSS(webHost+url);
                            $("#selectAuditUser_wf").change(function(){

                                var assgineeId = $(this).find("option:selected").attr("data-assgineeId");
                                var taskKey = $(this).val();
//                        console.log("assigneeId="+assigneeId);
//                        console.log("taskKey="+taskKey);
                                if(taskKey == 'more'){
                                    treeType = "audit";
                                    showSingleSelectOrg(workflowObj,taskKey);
                                    userDeptTree.show();
                                }else{
                                    $("#moreUserName").html("");
                                    $("#moreUserId").val("");
                                    saveSelectedAuditUser(workflowObj,assgineeId,taskKey);
                                }
                            });
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

    }

    function saveSelectedAuditUser(workflowObj,assgineeId,taskKey){

        function clearNullValue(val){
            if(isEmpty(val)||val =='null'||undefined==val||'undefined'==val){
                return "";
            }
            return val;
        }

        $.ajax($.extend({
            url: apiHost + '/hoss/wfTask/saveSelectedAuditUser.do',
            data: {"taskId":workflowObj.taskId,"processKey":workflowObj.processKey,
                "assgineeId":clearNullValue(assgineeId),
                "taskKey":clearNullValue(taskKey)
            }
        }, jsonp))
            .done(function (data) {

                function useful(data) {

                }

                function useless(data) {
                }

                doneCallback.call(this, data, useful, useless);
            })
            .fail(function (jqXHR) {
            }).always(function () {
            });

    }

    function showSingleSelectOrg(workflowObj,taskKey){
        var $userDeptTreeModal = $('#userDeptModal');

        userDeptTree.init(function () {
            userDeptTree.$doneSelectedStaff.on('click', function (event) {
                if(event){
                    event.preventDefault();
                }
                if(treeType == 'audit'){
                    var result = userDeptTree.getSelectedStaff();
                    if(''!=result.ids){
                        $("#moreUserName").html("<B>您选择的审批人员是：<font color='green'>"+result.names+"</font></B>");
                        $("#moreUserId").val(result.ids);
                        saveSelectedAuditUser(workflowObj,result.ids,taskKey);
                    }
                    userDeptTree.clear();
                }
            });
        });
        $userDeptTreeModal.on('show.bs.modal', function (e) {
//            var ids = $doCarbonCopyDivModal.find('[name=receivers]').val();
//            if(!isEmpty(ids)){
//                carbonCopy.setSelectedStaff(ids);
//            }
////            console.log(ids);
//            $doCarbonCopyDivModal.modal("hide");
        });

        $userDeptTreeModal.one('hide.bs.modal', function (e) {
            if(treeType == 'audit'){
                setTimeout(operateCallback, 10) // 由于调用顺序问题，暂时先这样处理
            }
        });

        function operateCallback(e) {
            var moreUserId = $("#moreUserId").val();
            if(isEmpty(moreUserId)){ // 选中第一个 option
//                $("#selectAuditUser_wf").find("option:eq(0)").attr("selected", true); // 火狐不兼容
                $("#selectAuditUser_wf")[0].selectedIndex = 0;
            }
        }
    }

    return {
        flowStatus: flowStatus,
        flowStatusHtml:flowStatusHtml,
        getLocationParam: getLocationParam,
        isEmpty: isEmpty,
        getFlowImage: getFlowImage,
        showComment: showComment,
        showWorkFlowAll: showWorkFlowAll,
        definitionConstants: definitionConstants,
        workflowObj: workflowObj,  //用于传参
        getDefinitions: getDefinitions,
        goBack:goBack,
        userDeptTree:userDeptTree,
        findAuditUsers:findAuditUsers,
        isDelegateApproval:isDelegateApproval
    };
});