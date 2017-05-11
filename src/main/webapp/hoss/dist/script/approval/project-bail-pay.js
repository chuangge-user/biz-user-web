define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery');
    require('script/validate');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');
    var projectUtil = require("script/project/project-util");

    var fileupload = require('fileupload');
    var getQueryString = require('script/get-query-string');

    var accounting = require('accounting');
    var formatMoney = accounting.formatMoney;

    var xhr = require('xhr'),
        systemMessage = require('system-message'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var workflowObj = workflowProp.workflowObj;
    var isEmpty = workflowProp.isEmpty;

    var id = getQueryString("businessKey");
    var taskId = getQueryString("taskId");
    var wfInstanceId = getQueryString("wfInstanceId");


    var $table = $(".new-apply-content table:first");

    function removeFeeInfo() {
        if ($(this).parents('tr').find("input[name='documentId']")) {
            var documentId = $(this).parents('tr').find("input[name='documentId']").val();//文件id
            if (!isEmpty(documentId)) {
                $.ajax($.extend({
                    url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do?id=' + documentId
                }, jsonp))
                    .done(function (data) {

                    });
                $(this).parents("tr").remove();
            }
        }
        $(this).parents("tr").remove();
    }


    var loadInfo = function (url, param, callback, errorStr, async) {
        $.ajax($.extend({
            url: url,
            data: param,
            async: async
        }, jsonp)).
            done(function (data) {
                function useful(data) {
                    var result = data || {};

                    if (result.status === '1') {
                        callback(data);
                    }
                }

                function useless(data) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: data.detail || '获取相关统计出错！'
                    });
                }

                doneCallback.call(this, data, useful, useless);
            }).
            fail(function (jqXHR) {
                failCallback.call(this, jqXHR, errorStr || '获取相关统计失败！');
            });

        return false;
    }


    $(function () {
        var $approvalListTab = $('#approvalListTab');
        $approvalListTab.find('a:first').tab('show');
        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $approvalListTab.offset().top + "px"
            }, {
                duration: 500,
                easing: "swing"
            });
            return false;
        });
        $(".goback").click(function () {
            location.href=document.referrer;
        });
    });

    initProjectChange();

    $(function () {
        //城市和项目的级联
        projectUtil.bindingProjectAndCity('projectSelect', 'citySelect',function(){
            initProjectChange();
        });//项目Select的Id，城市Select的id

        //付款金额大写事件
        $("#payAmount").keyup(function () {
            $("#upperPayAmount").text(accounting.formatUpperCase(parseFloat($(this).val())));
        });
    });


    function initProjectChange () {
        //项目名称改变事件
        $("#projectSelect").change(function () {
            var getProjectDtoUrl = apiHost + "/hoss/project/common/getProjectDtoForProjectDeposit.do";
            var param = {projectId : $(this).val()}
            if(!isEmpty($(this).val())){
                var getProjectDtoErrorStr = "获取合同信息失败！";
                var getProjectDtoCallback = function(data){
                    $("#otherUnits").text(data.data.proContract.partnerName);
                    $("#contractBailAmount").text(formatMoney(data.data.proContract.cautionMoney,''));
                };
                loadInfo(getProjectDtoUrl, param, getProjectDtoCallback, getProjectDtoErrorStr);
            }
        });
    }

    //附件添加
    $(function () {
        var processKey = workflowProp.definitionConstants.BZJFK;
        var businessKey = getLocationParam("businessKey");//业务主键ID
        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = 'new';
        workflowObj.projectId = "projectSelect";
        workflowObj.cityId = "citySelect";
        workflowProp.showWorkFlowAll(workflowObj);

        //上传附件start
        var index = 1;
        $(document).on("click", '#addFile', function () {

            var num =  $("[name='attachFile']").length;
            if(num>=5){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '最多可上传5个附件!'
                });
                return;
            }
            var randomId = "attachFile" + index;
            var fileStr = '<tr> ' +
                '<th colspan="2"> <input type="file" id="' + randomId + '" name="attachFile"/><input type="hidden" name="documentId"/> <span></span> </th>' +
                '<th> <input type="button"  id="upAttachFile"   class="btn btn-submit btn-handfile" align="right"  value="上传"/> </th>' +
                '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                '</tr>';

            $(fileStr).find("button[remove=true]").click(removeFeeInfo).end().appendTo($table);
            index++;
        });

        $('button[remove=true]').click(removeFeeInfo);

        $table.on('click', '.btn-handfile', function (event) {
            var $that = $(this);
            var $attachFile = $(this).parents('tr').find("input[type=file]");
            var fileId = $attachFile.attr("id"),//文件选择框的id名称
                fileName = "attachFile",
                id = businessKey,//记录Id
                objType = "cm_project_deposit",//场景类型(费用申请单)
                docType = "3";//文档类型 暂时没用（不同字段才需要）

            if ($attachFile.val() == "") {
                systemMessage({
                    type: 'alert',
                    title: '警告！',
                    detail: '请先选择文件！'
                });
                return false;
            }

            fileupload.ajaxFileUpload({
                url: apiHost + "/hoss/file/fileUtil/uploadFile.do?fileId=" + fileName + "&objId=" + id + "&objType=" + objType + "&docType=" + docType,
                secureuri: false,
                fileElementId: fileId,
                fileType:['txt','doc','docx','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','rar','zip'],
                fileSize:10*1000,//不能超过10M
                dataType: 'json',  //服务器返回的格式类型
                success: function (data) {
                    var result = eval("(" + data + ")");//解析返回的json

                    if (result.status === '1') {
                        $that.hide();//隐藏上传按钮
                        $that.parents('tr').find("input[type=file]").hide();
                        $that.parents('tr').find("input[name='documentId']").val(result.data.id);
                        $that.parents('tr').find("span").html(result.data.name);
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传成功！'
                        });
                    } else {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传失败！'
                        });
                    }


                },
                error: function (data, e) {
                    systemMessage("出错了，请重新上传！");
                }
            });


        });
    });

    $(function(){
        //提交审批、保存草稿按钮事件
        function submit(subType){

            if(!$('#projectBailForm').isValid()) {
                return false;
            }
            if(subType == 'submit'){
                if(!confirm('确定提交审批吗?')){
                    return;
                }
            }
            var files = $("input[name='documentId']");
            var fileIds = "";
            $.each(files, function(i, item){
                if($(item).val() != ""){
                    fileIds += (","+$(item).val());
                }
            });
            if(fileIds.length > 0){
                fileIds = fileIds.substr(1);
            }

            var cityId = $("#citySelect").val() || $("#cityId").attr("info");
            var projectId = $("#projectSelect").val() || $("#projectId").attr("info");
            var amount = $("#payAmount").val();
            var bankName = $("#bankName").val();
            var bankNo = $("#bankIdCardNo").val();
            var remark = $("#remark").val();
            var content = $("#content").val();

            var contractBailAmount = accounting.unformat($("#contractBailAmount").text());

            if(!isEmpty(contractBailAmount)){
                if(parseFloat(contractBailAmount)<parseFloat(amount)){
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: '付款金额不能超过合同约定保证金!'
                    });
                    return;
                }
            }

            var saveBailPayUrl = apiHost + "/hoss/expenses/projectDeposit/submitProjectDeposit.do";
            var param = {
                cityId: cityId,
                projectId: projectId,
                amount: amount,
                bankName: bankName,
                bankNo: bankNo,
                remark: remark,
                fileIds: fileIds,
                flowDealType: subType,
                content:content
            }

            if(id != "" && id != undefined && taskId != "" && taskId != undefined && wfInstanceId != "" && wfInstanceId != undefined){
                param.id = id;
                param.taskId = taskId;
                param.wfInstanceId = wfInstanceId;
            }

            var saveBailPayErrorStr = "提交保存信息失败！";
            var saveBailPayCallback = function(data){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '保存成功!'
                });
                location.href=document.referrer;
            };

            loadInfo(saveBailPayUrl, param, saveBailPayCallback, saveBailPayErrorStr);
        }

        //查看到保证金信息
        var getBailPayInfo = function(id){
            var getBailPayUrl = apiHost + "/hoss/expenses/projectDeposit/getProjectDepositDto.do";
            var param = {
                depositId : id
            };
            var getBailPayErrorStr = "查询项目保证金错误！";
                var getBailPayCallback = function(data){
                $("#citySelect").parent().attr("id", "cityId").attr("info", data.data.cityId);
                $("#citySelect").parent().text(data.data.cityName);
                $("#projectSelect").parent().attr("id", "projectId").attr("info", data.data.projectId);
                $("#projectSelect").parent().text(data.data.projectName);
                $("#otherUnits").text(data.data.partnerName);
                $("#contractBailAmount").text(formatMoney(data.data.cautionMoney,''));
                $("#bankName").val(data.data.projectDeposit.bankName);
                $("#bankIdCardNo").val(data.data.projectDeposit.bankNo);
                $("#payAmount").val(data.data.projectDeposit.auditAmount);
                $("#upperPayAmount").text(accounting.formatUpperCase(data.data.projectDeposit.auditAmount));
                $("#remark").val(data.data.projectDeposit.remark);

                $.each(data.data.documentList, function(i, item){
                    var url = apiHost+"/hoss/sys/fileDownload/download.do?id="+item.id;

                    var fileStr = '<tr><th colspan="2"><a href="' +
                    url +
                    '">' +
                    item.name +
                    '</a><input type="hidden" name="documentId" value="' +
                    item.id +
                    '"><span></span> </th><th></th><th> <button class="btn btn-xs btn-danger" remove="true">&nbsp;&nbsp;-&nbsp;&nbsp;</button></th></tr>';

                    $(fileStr).insertBefore($table.find("tr:last")).find("button[remove=true]").click(removeFeeInfo);
                })
            }
            loadInfo(getBailPayUrl, param, getBailPayCallback, getBailPayErrorStr);
        }

        if(id != "" && id != undefined && taskId != "" && taskId != undefined && wfInstanceId != "" && wfInstanceId != undefined){
            getBailPayInfo(id);
        }

        $("#subApproval").click(function(){
            submit("submit");
        });
        $("#saveDrafts").click(function(){
            submit("draft");
        });
    });

});