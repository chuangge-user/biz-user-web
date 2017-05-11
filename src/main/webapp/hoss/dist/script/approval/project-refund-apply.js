define(function (require) {

    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var template = require('template');
    var $ = require('jquery');
    var fileupload = require('fileupload');
    var accounting =  require('accounting');
    var systemMessage = require('system-message');
    require('datepicker');

    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var workflowObj = workflowProp.workflowObj;
    var isEmpty = workflowProp.isEmpty;

    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');


    var $table = $(".new-apply-content table:first");

    var projectUtil = require("script/project/project-util");

    $(function () {
        var $flow = $('#flow');

        $("a.toTab").click(function () {
            $("html, body").animate({
                scrollTop: $flow.offset().top + "px"
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

    /**
     * 选择城市公司
     */
    $('#citySelect').change(function(){
        $('#projectSelect').removeAttr("disabled");
    });

    function domReady() {
        var $newApplyBox = $('.new-apply-box'),
            $newApplyType = $newApplyBox.find('.new-apply-type'),
            $newApplyDetail = $newApplyBox.find('.new-apply-detail');
        var processKey = workflowProp.definitionConstants.TKSQ;
        var taskId = getLocationParam("taskId");//任务ID
        var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
        var businessKey = getLocationParam("businessKey");//业务主键ID
        var defaultProjectId = getLocationParam("projectId");
        var defaultCityId = getLocationParam('cityId');
        var flag = 'cbk';
        if (defaultCityId != undefined && defaultCityId != '') flag = 'ecbk';
        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowType = "new";
        workflowObj.projectId = "projectSelect";
        workflowObj.cityId = "citySelect";
        workflowProp.showWorkFlowAll(workflowObj);



        projectUtil.bindingProjectAndCity('projectSelect', 'citySelect',function() {
            if(!isEmpty(defaultCityId)){
                $("#citySelect").val(defaultCityId);
                $("#citySelect").trigger('change',function(){
                    if (!isEmpty(defaultProjectId)) {
                        $('.project-select').val(defaultProjectId);
                        $('.project-select').trigger('change');
                    } else {
                        var proId = $('.project-select').val();
                        if (!isEmpty(proId)) {
                            $('.project-select').trigger('change');
                        }
                    }
                });
            } else {
                $('.project-select').trigger('change');
            }
        }, flag);

        $newApplyType.on('click', function () {
            var $context = $(this),
                index = $newApplyType.index(this);
            $newApplyDetail.eq(index).slideToggle();
        });

        //上传附件start
        var index = 1;
        $(document).on("click", '#addFile', function(){
            var randomId = "attachFile"+index;
            var fileStr = '<tr class="file-upload"> ' +
                '<th colspan="7"> <input type="file" id="'+randomId+'" name="attachFile"/><input type="hidden" name="documentId"/> <span></span> </th>' +
                '<th> <input type="button"  id="upAttachFile"   class="btn btn-danger btn-handfile" align="right"  value="上传"/> </th>' +
                '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                '</tr>';

            $(fileStr).find("button[remove=true]").end().appendTo($table);
            index++;
        });

        $('table').delegate('button[remove=true]', 'click', removeFeeInfo)

        function removeFeeInfo(){
            if($(this).parents('tr').find("input[name='documentId']")){
                var documentId = $(this).parents('tr').find("input[name='documentId']").val();//文件id
                if(!isEmpty(documentId)){
                    $.ajax($.extend({
                        url: apiHost + '/hoss/sys/fileDelete/deleteDocument.do?id='+documentId
                    }, jsonp))
                        .done(function (data) {

                        });
                    $(this).parents("tr").remove();
                }
            }
            $(this).parents("tr").remove();
        }

        $table.on('click','.btn-handfile', function (event) {

            var $that = $(this);
            var $attachFile = $(this).parents('tr').find("input[type=file]");
            var fileId=$attachFile.attr("id"),//文件选择框的id名称
                fileName="attachFile",
                id = businessKey,//记录Id
                objType ="project_refund",//场景类型(退款单)
                docType="3";//文档类型 暂时没用（不同字段才需要）

            if($attachFile.val() == ""){
                systemMessage({
                    type: 'alert',
                    title: '警告！',
                    detail: '请先选择文件！'
                });
                return false;
            }
            fileupload.ajaxFileUpload({
                url: apiHost + "/hoss/file/fileUtil/uploadFile.do?fileId="+fileName+"&objId="+id+"&objType="+objType+"&docType="+docType,
                secureuri: false,
                fileElementId: fileId,
                fileType:['txt','doc','docx','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','rar','zip'],
                fileSize:10*1000,//不能超过10M
                dataType: 'json',  //服务器返回的格式类型
                success: function (data){
                    var result =  eval("("+data+")");//解析返回的json

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
                    }else{
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: data.detail || '上传失败！'
                        });
                    }


                },
                error: function (data, e){
                    systemMessage("出错了，请重新上传！");
                }
            });


        });

        //上传附件end


        /**
         * 根据城市id获取城市下所有项目
         */
        $('.project-citycompay').change(function(){
            getId(this);
        });

        /**
         * 项目选择
         */
        $('.project-select').change(function(){

            if(!isEmpty($('#projectSelect option:selected').val())){
                $.ajax($.extend({
                    url: apiHost+'/hoss/refund/findRefundRecordList.do',
                    data: {
                        projectId : $('#projectSelect option:selected').val()
                    },
                    beforeSend: function () {
                    }
                }, jsonp))
                    .done(function (data) {
                        function useless(data) {
                            var result = data || {};

                            if (result.status === '1') {
                                var applyAmount = 0;
                                $.each(data.data.content, function(i, item){
                                    applyAmount += item.amount;
                                });
                                var upperApplyAmount = accounting.formatUpperCase(applyAmount);

                                data.applyAmount = applyAmount;
                                data.upperApplyAmount = upperApplyAmount;

                                $(".refundInfo").remove();
                                $(".countRefundInfo").remove();
                                $("#addFileTr").remove();
                                $(".file-upload").remove();
                                $table.find("tbody").append(template("searchResultTemplate", data));
                            }
                        }
                        doneCallback.call(this, data, useless);
                    })
                    .fail(function (jqXHR) {
                        failCallback.call(this, jqXHR, '操作失败！');
                    })
                    .always(function () {
                    });
            }
            return false;
        });

        function saveRefundInfo(subType){
            //对退款申请的客户列表进行封装成对象
            var refundRecordList = [];
            var ids = "";
            $(".new-apply-content table:first tbody tr.refundInfo").each(function(i, item){
                var rerefundRecord = refundRecordList[i] = {};
                rerefundRecord.id = $(this).find("td.clientName").attr("info");
                ids += rerefundRecord.id + ",";
//                rerefundRecord.clientName = $(this).find("td.clientName").text();
//                rerefundRecord.clientPhone = $(this).find("td.clientPhone").text();
//                rerefundRecord.payType = $(this).find("td.payType").attr("info");
//                rerefundRecord.receipt = $(this).find("td.receipt").text();
//                rerefundRecord.poseNo = $(this).find("td.poseNo").text();
//                rerefundRecord.bankName = $(this).find("td.bankName").text();
//                rerefundRecord.bankIdcardNo = $(this).find("td.bankIdcardNo").text();
//                rerefundRecord.amount = $(this).find("td.amount").text();
//                rerefundRecord.receivedAmount = $(this).find("td.receivedAmount").text();
            });
            var refundRecordListStr = JSON.stringify(refundRecordList);

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

            $.ajax($.extend({
                url: apiHost+'/hoss/refund/saveRefundRecordList.do',
                data: {
                    refundRecordListStr : refundRecordListStr,
                    cityId : $("#citySelect").val(),
                    projectId : $("#projectSelect").val(),
                    fileIds : fileIds,
                    flowDealType : subType,
                    ids: ids
                },
                beforeSend: function () {
                }
            }, xhr.jsonpost))
                .done(function (data) {
                    function useful(data) {
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '退款申请单保存成功！'
                        });
                        //保存成功后跳转到已办审批页面
                        location.href=document.referrer;
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
                .always(function () {
                });
            return false;
        }


        $("#subApproval").click(function() {
            if(confirm('确定提交审批吗?')){
                saveRefundInfo("submit");
            }
        });

        $("#saveDrafts").click(function(){
            saveRefundInfo("draft");
        });

        function getId(content) {
            return $($(content), 'option:selected').val();
        }
    }

    $(document).ready(domReady);
});