define(function (require) {

    var $ = require('jquery');
    require('script/validate');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;

    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var fileupload = require('fileupload');

    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var projectUtil = require('script/project/project-util');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var workflowObj = workflowProp.workflowObj;

    var accounting = require('accounting');
    var formatMoney = accounting.formatMoney;

    var approvalUtil = require('script/approval/approval-util');

    $(function () {

        initSrcoll();

        var processKey = workflowProp.definitionConstants.FYSQ;
        var taskId = getLocationParam("taskId");//任务ID
        var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
        var businessKey = getLocationParam("businessKey");//业务主键ID
        var calcAmount = 0;
        var bigCalcAmount = "";

        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowType = 'new';
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.projectId = "projectId";
        workflowObj.cityId = "cityId";

        workflowProp.showWorkFlowAll(workflowObj);

        approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), '', wfInstanceId, 0,'');
        projectUtil.bindOneProjectAndCity("projectId","cityId", function(){
            if(!isEmpty(wfInstanceId)&&!isEmpty(taskId)&&!isEmpty(businessKey)){
                //退回 或 草稿 进入编辑
                fillEditData(wfInstanceId,taskId,businessKey);
            }
        });


        $("#addInfo").click(function(){

            var feeInfoStr = '<tr>' +
                '<th colspan="2">' +
                '<input type="text" name="feeName" maxlength="50" class="form-control-sm w100" data-rules="{required:true}" data-messages="{required:\'费用明细不能为空!\'}">' +
                '</th>' +
                '<th> ' +
                '<input type="text" name="amount" maxlength="19" class="form-control-sm e4" data-rules="{required:true,number:true}" data-messages="{required:\'申请金额不能为空!\',number:\'申请金额必须为数字\'}">' +
                '</th> ' +
                '<th> ' +
                '<button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button>' +
                '</th> ' +
                '</tr>';

            $(feeInfoStr).find("button[remove=true]").click(removeFeeInfo).end().insertBefore($("#addInfoTr"));
        });
        var index = 1;
        $("#addFile").click(function(){
            var num =  $("[name='attachFile']").length;
            if(num>=5){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '最多可上传5个附件!'
                });
                return;
            }
            var randomId = "attachFile"+index;
            var fileStr = '<tr> ' +
                '<th colspan="2"> <input type="file" id="'+randomId+'" name="attachFile"/><input type="hidden" name="documentId"/> <span></span> </th>' +
                '<th> <input type="button"  id="upAttachFile"   class="btn btn-danger btn-handfile" align="right"  value="上传"/> </th>' +
                '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                '</tr>';

            $(fileStr).find("button[remove=true]").click(removeFeeInfo).end().appendTo($("#projectFeeTable"));
            index++;
        });

        $('button[remove=true]').click(removeFeeInfo);

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
            $("input[name=amount]").eq(0).trigger("blur");
        }

        var $projectFeeForm = $("#projectFeeForm");
        $projectFeeForm.on('click','.btn-handfile', function (event) {

            var $that = $(this);
            var $attachFile = $(this).parents('tr').find("input[type=file]");
            var fileId=$attachFile.attr("id"),//文件选择框的id名称
                fileName="attachFile",
                id = businessKey,//记录Id
                objType ="project_fee",//场景类型(费用申请单)
                docType="3";//文档类型 暂时没用（不同字段才需要）

            if ($attachFile.val() == "") {
                systemMessage({
                    type: 'alert',
                    title: '警告！',
                    detail: '请先选择文件！'
                });
                return false;
            }
            fileupload.ajaxFileUpload({
                url: apiHost + "/hoss/file/fileUtil/uploadFile.do?fileId="+fileName+"&objId="+id+"&objType="+objType+"&docType="+docType,              //需要链接到服务器地址
                secureuri:false,
                fileElementId:fileId,
                fileType:['txt','doc','docx','xls','xlsx','ppt','pptx','pdf','jpg','jpeg','png','gif','rar','zip'],
                fileSize:10*1000,//不能超过10M
                dataType: 'json',  //服务器返回的格式类型
                success: function (data) //成功
                {

                    var result =  eval("("+data+")");//解析返回的json

                    if (result.status === '1') {
//                        console.log(result);
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
                error: function (data, e) //异常
                {
                    systemMessage("出错了，请重新上传！");
                }
            });


        });


        $("#projectFeeTable").on('blur',"[name='amount']",function(){
            calcAmount = 0;
            $("input[name='amount']").each(function(i,item){
                if($.isNumeric($(item).val()) ){
                    calcAmount+=parseFloat($(item).val());
                }
            });
            bigCalcAmount = accounting.formatUpperCase(calcAmount);
            $("#totalAmount").html("小写： "+formatMoney(calcAmount,'')+"         大写："+bigCalcAmount);//todo 加上大写转换
            triggerCost();
        });


        function triggerCost(){

            var projectId = $("#projectId").val();
            var feeTypeCode = $("[name='feeTypeCode']").val();
            if(!isEmpty(feeTypeCode)&&!isEmpty(projectId)){
                approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), projectId, wfInstanceId, calcAmount, feeTypeCode);
            }

        }


        $("[name='feeTypeCode']").change(function(){
            var feeTypeCode = $(this).val();
            if('full_pact_outcome' == feeTypeCode){
                $("[name='subFeeTypeCode']").removeClass("hide");
                $("[name='subFeeTypeCode']").attr("data-rules", "{required:true}");
                $("[name='subFeeTypeCode']").attr("data-messages", "{required:'费用类型必选'}");
            }else{
                if(!$("[name='subFeeTypeCode']").hasClass("hide")){
                    $("[name='subFeeTypeCode']").addClass("hide");
                    $("[name='subFeeTypeCode']").removeAttr("data-rules");
                    $("[name='subFeeTypeCode']").removeAttr("data-messages");
                }
            }
            triggerCost();
            workflowObj.conditionMap.feeTypeCode = feeTypeCode;
            workflowProp.findAuditUsers(workflowObj);
        });

        $("#projectId").change(function(){
            triggerCost();
        });


        $("input[name='loanType']").change(function(){

            var loanType = $(this).val();

            changeLoanType(loanType);
        });

        function changeLoanType(loanType){

            switch (loanType){
                case 'none' :
                    $("#loanAmountTr").hide();
                    $("#bankTr").hide();
                    $("#supplierNameSpan").hide();
                    enableOrDisableLoanBank(false);
                    enableOrDisableRule('supplierName',false);
                    break;
                case 'backup':
                    $("#loanAmountTr").show();
                    $("#bankTr").show();
                    $("#supplierNameSpan").hide();
                    enableOrDisableLoanBank(true);
                    enableOrDisableRule('supplierName',false);
                    break;
                case 'projectLoan' :
                    $("#loanAmountTr").show();
                    $("#bankTr").show();
                    $("#supplierNameSpan").show();
                    enableOrDisableLoanBank(true);
                    enableOrDisableRule('supplierName',true);
                    break;
            }

        }

        function enableOrDisableLoanBank(bool){
            enableOrDisableRule('bankName',bool);
            enableOrDisableRule('accountNo',bool);
            enableOrDisableRule('accountName',bool);
            enableOrDisableRule('loanAmount',bool);
        }

        function enableOrDisableRule(name,bool){

            if(name == 'loanAmount'){
                $("input[name='"+name+"']").attr('data-rules','{required:'+bool+',number:'+ bool +'}');
            }else{
                $("input[name='"+name+"']").attr('data-rules','{required:'+bool+'}');
            }
        }


        //todo 1.本费用预算占比=((申请金额+本费用的成本流）/ 本费用类型计划支出)/(预调收入/计划收款)；
        //todo 2.大于1说明费用超过预期
        //todo 1.总预算执行率=((申请金额+项目的成本）/ 计划支出)/(预调收入/计划收款)；
        //todo 2.大于1说明费用超过预期

        //提交
        $("a[data-type]").click(function(event){

            var flowDealType = $(this).attr("data-type");
            if(!$('#projectFeeForm').isValid()) {
                return false;
            }

            if(flowDealType == 'submit'){
                if(!confirm('确定提交审批吗?')){
                    return;
                }
            }

            var $context = $(this),
                $disabled = $context.find('[disabled]');

            if (event) {
                event.preventDefault();
            }

            if ($context.hasClass('disabled')) {
                return false;
            }

            $disabled.removeAttr('disabled');


            var cityId = $("[name=cityId]").val();
            var projectId = $("[name=projectId]").val();
            var feeTypeCode = $("[name=feeTypeCode]").val();
            var subFeeTypeCode = $("[name=subFeeTypeCode]").val();
            var remark = $("[name=remark]").val();
            var loanType = $("[name='loanType']").filter(":checked").val();
            var bankName = $("[name='bankName']").val();
            var accountNo = $("[name='accountNo']").val();
            var accountName = $("[name='accountName']").val();
            var loanAmount = $("[name='loanAmount']").val();
            var supplierName = $("[name='supplierName']").val();
            var content = $("#content").val();

            var projectFeeDto = {};
            var projectFee = {};
            var projectFeeLoan = {};
            projectFee.id = businessKey;//设置主键
            projectFee.remark = remark;
            projectFee.cityId = cityId;
            projectFee.projectId = projectId;
            projectFee.amountBig = bigCalcAmount;
            projectFeeDto.projectFee = projectFee;
            projectFeeDto.feeTypeCode = feeTypeCode;
            projectFeeDto.content = content;//设置意见

            projectFeeLoan.loanType = loanType;
            switch (loanType){
                case 'none' :
//                    projectFeeLoan.
                    break;
                case 'backup':
                    projectFeeLoan.bankName = bankName;
                    projectFeeLoan.accountNo = accountNo;
                    projectFeeLoan.accountName = accountName;
                    projectFeeLoan.loanAmount = loanAmount;
                    break;
                case 'projectLoan' :
                    projectFeeLoan.bankName = bankName;
                    projectFeeLoan.accountNo = accountNo;
                    projectFeeLoan.accountName = accountName;
                    projectFeeLoan.loanAmount = loanAmount;
                    projectFeeLoan.supplierName = supplierName;
                    break;
            }
            projectFeeDto.projectFeeLoan = projectFeeLoan;

            if ("full_pact_outcome" == projectFeeDto.feeTypeCode) {
                projectFeeDto.subFeeTypeCode = subFeeTypeCode;
            } else {
                projectFeeDto.subFeeTypeCode = "";
            }
            var feeInfoArray = [];
            $("input[name=feeName]").each(function(i,item){
                var feeName = $(item).val();
                var feeAmount = $(item).parents("tr").find("input[name='amount']").val();
                var feeInfo = {};
                feeInfo.feeName = feeName;
                feeInfo.amount = feeAmount;
                feeInfoArray.push(feeInfo);
            });
            var documentIdList = [];
            $("input[name=documentId]").each(function(i,item){
                if(!isEmpty($(item).val())){
                    documentIdList.push($(item).val());
                }
            });
            if(!documentIdList.length) {
                systemMessage({
                    type: 'error',
                    title: '提示：',
                    detail: '请上传附件！'
                });
                return false;
            }
            projectFeeDto.documentIdList =documentIdList;

            projectFeeDto.infoList = feeInfoArray;

            //设置流程参数
            projectFeeDto.taskId = taskId;
            projectFeeDto.wfInstanceId = wfInstanceId;

            var projectFeeDtoStr = JSON.stringify(projectFeeDto);

            $.ajax({
                type: "POST",
                url : apiHost + '/hoss/expenses/projectFee/submitProjectFee.do?flowDealType='+flowDealType,
                dataType : 'json',
                data :{"projectFeeDtoStr":projectFeeDtoStr},
                success: function(msg){

                }

            }).done(function (data) {

            }).fail(function (jqXHR, textStatus, errorThrown) {
                var json = eval('(' + jqXHR.responseText+ ')');
                if (json.detail.indexOf("成功") == -1 ) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '提交失败！'
                    });
                } else {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '提交成功！'
                    });
                    location.href=document.referrer;
                }
                $disabled.attr('disabled', 'disabled');
                $context.removeAttr('disabled').blur();
            });

//            $.ajax($.extend({
//                url: apiHost + '/hoss/expenses/projectFee/submitProjectFee.do?flowDealType='+flowDealType,
//                data: {"projectFeeDtoStr":projectFeeDtoStr},
//                beforeSend: function () {
//                    $context.attr('disabled', 'disabled');
//                }
//            }, {
//                type: 'POST',
//                dataType: 'jsonp'
//            }))
//                .done(function (data) {
//
//                    function useful(data) {
//                        var dataObj = data.data || {};
//                        systemMessage({
//                            type: 'info',
//                            title: '提示：',
//                            detail: '提交成功！'
//                        });
//                        location.href=document.referrer;
//                    }
//
//                    function useless(data) {
//                        systemMessage({
//                            type: 'info',
//                            title: '提示：',
//                            detail: data.detail || '请检查输入信息！'
//                        });
//                    }
//
//                    doneCallback.call(this, data, useful, useless);
//                })
//                .fail(function (jqXHR) {
//                    failCallback.call(this, jqXHR, '请检查输入信息！');
//                }).always(function () {
//                    $disabled.attr('disabled', 'disabled');
//                    $context.removeAttr('disabled').blur();
//                });
        });

        function fillEditData(wfInstanceId,taskId,businessKey){
            $.ajax($.extend({
                url: apiHost + '/hoss/expenses/projectFee/getProjectFeeDto.do?feeId='+businessKey
            }, jsonp))
                .done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};
                        //填充数据
//                        console.log(dataObj);
                        var infoList = dataObj.infoList;
                        var projectFee = dataObj.projectFee;

                        var $cityId = $("[name=cityId]");
                        var $projectId = $("[name=projectId]");
                        //$cityId.val(projectFee.cityId);
//                        $projectId.val(projectFee.projectId);
//                        $projectId.attr('disabled','disabled');
//                        $cityId.trigger('change', function () {
//                            $projectId.val(projectFee.projectId);
//                            $projectId.attr('disabled','disabled');
//                        });


                        $cityId.html('<option value="'+projectFee.cityId+'" selected >'+dataObj.cityName+'</option>').off('change');
                        $cityId.attr('disabled','disabled');

                        $projectId.html('<option value="'+projectFee.projectId+'" selected >'+dataObj.projectName+'</option>')
                            .clone().insertBefore($projectId).attr('disabled','disabled');
                        $projectId.remove();

                        $("[name=feeTypeCode]").val(dataObj.feeTypeCode);
                        $("[name='feeTypeCode']").trigger('change');
                        $("[name=subFeeTypeCode]").val(dataObj.subFeeTypeCode);
                        $("[name=remark]").val(projectFee.remark);

                        var projectFeeLoan = dataObj.projectFeeLoan;
                        var loanType = 'none';
                        if(!isEmpty(projectFeeLoan)){
                            loanType = projectFeeLoan.loanType;
                            $("input[name='bankName']").val(projectFeeLoan.bankName);
                            $("input[name='accountNo']").val(projectFeeLoan.accountNo);
                            $("input[name='accountName']").val(projectFeeLoan.accountName);
                            $("input[name='loanAmount']").val(projectFeeLoan.loanAmount);
                            $("input[name='supplierName']").val(projectFeeLoan.supplierName);
                            $("input[name='loanType'][value='"+loanType+"']").attr('checked',true);
                        }
                        changeLoanType(loanType);

                        $.each(infoList, function (i, item) {
                            if(i==0){//初次赋值
                                $("input[name=feeName]").val(item.feeName);
                                $("input[name=amount]").val(item.amount);
                            }else{

                                var feeInfoStr = '<tr>' +
                                    ' <th colspan="2">' +
                                    '<input type="text" name="feeName" maxlength="50" data-rules="{required:true}" data-messages="{required:\'费用明细不能为空!\'}" class="form-control-sm w100" value="'+
                                    item.feeName+'">' +
                                    '</th>' +
                                    '<th> ' +
                                    '<input type="text" name="amount" data-rules="{required:true,number:true}" data-messages="{required:\'申请金额不能为空!\',number:\'申请金额必须为数字\'}" maxlength="19" class="form-control-sm e4" value="'+
                                    item.amount+'">' +
                                    ' </th>' +
                                    '<th> ' +
                                    '<button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button>' +
                                    ' </th>' +
                                    ' </tr>';

                                $(feeInfoStr).find("button[remove=true]").click(removeFeeInfo).end().insertBefore($("#addInfoTr"));
                            }

                        });
                        $("input[name=amount]").eq(0).trigger("blur");
                        var documentList = dataObj.documentList;
                        if(!isEmpty(documentList)){
//                        console.log(documentList);
                            $("#addFileTr").nextAll().remove();
                            $.each(documentList,function(i,item){
                                var url = apiHost+"/hoss/sys/fileDownload/download.do?id="+item.id;
                                var fileStr ="<a href='"+url+"'>"+item.name+"</a>";

                                var fileStr = '<tr> ' +
                                    '<th colspan="2">'+ fileStr +' <input type="hidden" name="documentId" value="'+item.id+'" /> <span></span> </th>' +
                                    '<th></th>' +
                                    '<th> <button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button></th>' +
                                    '</tr>';

                                $(fileStr).find("button[remove=true]").click(removeFeeInfo).end().appendTo($("#projectFeeTable"));
                            });
                        }
                        approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), projectFee.projectId, wfInstanceId,
                            projectFee.amount, dataObj.feeTypeCode);
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

        function initSrcoll(){

            var $flow = $("#flow");
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
        }
    });

});