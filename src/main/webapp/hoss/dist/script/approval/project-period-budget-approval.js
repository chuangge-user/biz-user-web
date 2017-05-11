define(function (require) {
    var hoss = require('hoss'),
        global = hoss.global,
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');

    var pagination = require('pagination');

    var confirmation = require('bootstrap/confirmation');

    var systemMessage = require('system-message');

    var workflowProp = require('script/approval/workflow-properties');
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;
    var processKey = workflowProp.definitionConstants.QZQYS;

    var getQueryString = require('script/get-query-string');
    var businessKey = getQueryString('businessKey');
    var wfInstanceId = getQueryString('wfInstanceId');
    var taskId = getQueryString('taskId');
    var isEdit=getQueryString('isEdit');
    var accounting = require("accounting");


    $(function () {
        var $flow = $("#flow");
        $(".toTab").click(function () {
            $("html, body").animate({
                scrollTop: $flow.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
        $(".goback").click(function () {
            history.back();
            return false;
        });
    });


    $(document).ready(function () {


        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowProp.showWorkFlowAll(workflowObj);


        $.ajax($.extend({
            url: apiHost + '/hoss/sys/budget/findFullBudgetByApproval.do',
            data: {id: businessKey}
        }, jsonp))
            .done(function (data) {
                doneCallback.call(
                    this,
                    data,
                    function (data) {
                        if("1"!=data.status&&1!=data.status){
                            systemMessage({
                                type: 'error',
                                title: '提示：',
                                detail: data.detail || '获取数据失败！'
                            });
                        }else{

                            $("#showInfo").html(
                                template('tabContentTemplate', data)
                            );
                            $("#versionsPlan").text(data.data.cmFullCycleProjectBudget.versionsPlan);
                            $("#fw").text(data.data.cmFullCycleProjectBudget.flowNo);
                            $("#id").val(businessKey);
                            $("#taskId").val(taskId);
                            $("#wfInstanceId").val(wfInstanceId);
                            $("#flowStatus").html(workflowProp.flowStatusHtml[data.data.typeWf]);
                            if(0==data.data.typeWf||"0"==data.data.typeWf){
                                $("#content").hide();
                            }

                            if(isEdit==0){
                                $("#isEdit").show();
                                $("#noEdit").hide();
                            }else{
                                $("#isEdit").hide();
                                $("#noEdit").show();
                            }
                            initFlod(data);
                        }
                    }
                );
            })
            .fail(function (jqXHR) {
                failCallback.call(this, jqXHR, '获取项目信息失败');
            })
            .always(function (data) {});


        function initFlod(data) {
            var $flod = $('.pointer'),
                $allNext = $flod.next(),// 获取 所有的 .pointer 节点
                $downIcon = $('.glyphicon-chevron-down'),
                $upIcon = $('.glyphicon-chevron-up')

            $flod.click(function(e){
                var $target = $(e.currentTarget),
                    $next = $target.next();

                $downIcon.show();
                $upIcon.hide();



                if ($next.css('display') === 'none') {  // 隐藏所有打开的， 展开目前的
                    $allNext.hide();
                    $next.show();

                    $target.find('.glyphicon-chevron-down').toggle();
                    $target.find('.glyphicon-chevron-up').toggle();
                } else { // 如果是已经展开的， 只隐藏
                    $allNext.hide();
                }

                updatePosition();
            });


            // 详情窗口
            var $infoButton1 = $('#infoButton1'),
                $infoButton2 = $('#infoButton2'),
                $infoAbsolute1 = $('#infoAbsolute1'),
                $infoAbsolute2 = $('#infoAbsolute2');

            $infoButton1.click(function(){
                $infoAbsolute1.toggle();
                updatePosition();
            });

            $infoButton2.click(function(){
                $infoAbsolute2.toggle();
                updatePosition();
            });
            updatePosition();

            /** 更新详情面板位置 */
            function updatePosition(){
                var offset1 = $infoButton1.offset(),
                    offset2 = $infoButton2.offset();

                $infoAbsolute1.css({
                    left:offset1.left + 20,
                    top:offset1.top + 20
                });

                $infoAbsolute2.css({
                    left:offset2.left + 20,
                    top:offset2.top + 20
                });
            }


            $flod.eq(0).click();
            $flod.eq(0).click();
            checkpath_commission();

            // 审核区按钮
            $('#link-comment').click(function(){ // 滚动到底
                $(global).scrollTop($(global.document.body).height());
            });
        }

        window.showLog=showLog;
        function showLog(id){
            var fullId = $("#id").val();
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/budget/findBudgetLogBy.do?ctFullId='+fullId+"&objectCode=group_buy_income&businessId="+id,
                data: {id: businessKey}
            }, jsonp))
                .done(function (data) {
                    doneCallback.call(
                        this,
                        data,
                        function (data) {
                            if("1"!=data.status&&1!=data.status){
                                systemMessage({
                                    type: 'error',
                                    title: '提示：',
                                    detail: data.detail || '获取数据失败！'
                                });
                            }else{
                                var str1='';
                                var datas = data.data;
                                if(null!=datas.content&&datas.content.length>0){
                                    for(var i=0;i<datas.content.length;i++){
                                        str1 +='<tr><td>'+datas.content[i].createTime+'</td><td>'+datas.content[i].comment+'</td></tr>';
                                    }
                                }
                                $("#showLogTable").html(str1);
                                $("#showLogModal").modal("show");
                            }
                        }
                    );
                })
                .fail(function (jqXHR) {
                    failCallback.call(this, jqXHR, '获取项目信息失败');
                })
                .always(function (data) {});
        }
        // 提交审批
        $("#warningPass").on('click', function () {
            if(!confirm('确定同意吗?')){
                return false;
            }

            var jsonGroupBuy = new Array();
            $('input[name=group_buy_income_projecttype_id]').each(function(){
                var jsonObj = {};
                var projectTypeId = this.value;
                jsonObj["id"]=projectTypeId;
                jsonObj["s_num"]=$("#group_buy_income_projecttypevalue_"+projectTypeId).val();
                jsonObj["isEdit"]=$("#group_buy_income_isEdit_"+projectTypeId).val();
                jsonGroupBuy.push(jsonObj);
            });

            var jsonSociety = new Array();
            $('input[name=society_projecttype_id]').each(function(){
                var jsonObj = {};
                var projectTypeId = this.value;
                jsonObj["id"]=projectTypeId;
                jsonObj["s_num"]=$("#society_num_"+projectTypeId).val();
                jsonObj["s_rate"]=$("#society_rate_"+projectTypeId).val();
                jsonSociety.push(jsonObj);
            });

            var jsonNoConduit = new Array();
            $('input[name=no_conduit_projecttype_id]').each(function(){
                var jsonObj = {};
                var projectTypeId = this.value;
                jsonObj["id"]=projectTypeId;
                jsonObj["s_num"]=$("#no_conduit_num_"+projectTypeId).val();
                jsonObj["s_rate"]=$("#no_conduit_rate_"+projectTypeId).val();
                jsonNoConduit.push(jsonObj);
            });

            var jsonConduit = new Array();
            $('input[name=conduit_projecttype_id]').each(function(){
                var jsonObj = {};
                var projectTypeId = this.value;
                jsonObj["id"]=projectTypeId;
                jsonObj["s_num"]=$("#conduit_num_"+projectTypeId).val();
                jsonObj["s_rate"]=$("#conduit_rate_"+projectTypeId).val();
                jsonConduit.push(jsonObj);
            });

            $("#createForm").attr('action',apiHost+'/hoss/sys/budget/approvalFullBedget.do?' +
                'jsonGroupBuy='+JSON.stringify(jsonGroupBuy)+'&jsonSociety='+JSON.stringify(jsonSociety)+'&jsonConduit='+JSON.stringify(jsonConduit)+'&jsonNoConduit='+JSON.stringify(jsonNoConduit))+'';

            $("#createForm").submit();
        });
        window.toSystemPage=toSystemPage;
        function toSystemPage(data){

            require(["xhr", 'script/get-query-string', 'hoss'],function(xhr,getQueryStr, hoss){
                xhr.done(data,function(){
                    var uid = getQueryStr('uid');
                    location.href=document.referrer;
                },function(){
                    if("-99"==data.status){
                        window.location = hoss.webHost + '/login.html';
                    }else{
                        systemMessage({
                            type: 'error',
                            title: '提示：',
                            detail: data.detail
                        });
                    }
                });
            })
        }
         window.deleteDiv =function(id){
            var uid = "deleteId"+id;
            $.ajax($.extend({
                url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do',
                data: {
                    id:id
                },
                success:function(data){
                    var dataObj = data.data || {};
                    if("1"==data.status||1==data.status){
                        $("#"+uid+"").hide();
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '删除文件成功！'
                        });
                    }else{
                        systemMessage({
                            type: 'error',
                            title: '提示：',
                            detail: '删除文件失败！'
                        });
                    }
                },
                error: function(jqXHR){
                    failCallback(jqXHR, '操作文件失败');
                }
            }, jsonp));
        }
    });


    window.delDiv=delDiv;
    function delDiv(obj){
        var id = $(this).attr('data-id');

        if (!id || id === '') {
            systemMessage('缺少ID');
            return false;
        }

        deleteDiv(id);

        return false;
    }

});
