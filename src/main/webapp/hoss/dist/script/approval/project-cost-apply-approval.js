define(function (require) {

    var $ = require('jquery');
    require('script/validate');
    var navigation = require('navigation');
    var $tab = require('bootstrap/tab');

    var hoss = require('hoss'),
        apiHost = hoss.apiHost,
        webHost = hoss.webHost;
    var template = require('template');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var approvalUtil = require('script/approval/approval-util');

    var accounting = require('accounting');
    var formatNumber = accounting.formatNumber;
    var systemMessage = require('system-message');
    var workflowProp = require('script/approval/workflow-properties');
    var getLocationParam = workflowProp.getLocationParam;
    var isEmpty = workflowProp.isEmpty;
    var flowStatus = workflowProp.flowStatus;
    var workflowObj = workflowProp.workflowObj;
    template.helper("flowStatus",flowStatus);//对template增加全局变量或方法
    template.helper("formatNumber",formatNumber);

    $(function () {

        initSrcoll();

        var processKey = workflowProp.definitionConstants.FYSQ;
        var taskId = getLocationParam("taskId");//任务ID
        var wfInstanceId = getLocationParam("wfInstanceId");//流程实例ID
        var businessKey = getLocationParam("businessKey");//业务主键ID
        var calcAmount = 0;
        var projectId = null;
        var feeTypeCode = null;

        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = processKey;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content"
        workflowObj.noCityProject = true;;
        workflowObj.workflowCommentId = "workflowComment";
        workflowProp.showWorkFlowAll(workflowObj);
        if(!isEmpty(wfInstanceId)&&!isEmpty(businessKey)){
            //退回 或 草稿 进入编辑
            fillAuditData(wfInstanceId,taskId,businessKey);
        }

        $("#addInfo").click(function(){

            var feeInfoStr = '<tr> <th colspan="2">' +
                            '<input type="text" name="feeName" class="form-control-sm w100"></th>' +
                            '<th colspan="2"> ' +
                            '<input type="text" name="amount" class="form-control-sm e4">' +
                            '<button class="btn btn-xs btn-danger" remove="true" >&nbsp;&nbsp;-&nbsp;&nbsp;</button> </th> </tr>';

            $(feeInfoStr).find("button[remove=true]").click(removeFeeInfo).end().insertBefore($("#addInfoTr"));
        })

        function removeFeeInfo(){
            $(this).parents("tr").remove();
        }

        $("#projectFeeForm").on('blur',"[name='auditAmount']",function(){

            calcAmount = 0;
            $("input[name='auditAmount']").each(function(i,item){
                if($.isNumeric($(item).val()) ){
                    calcAmount+=parseFloat($(item).val());
                }
            });

            $("#totalAuditAmount").html(assembleAmount(calcAmount));

            if(!isEmpty(feeTypeCode)&&!isEmpty(projectId)){
                approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), projectId, wfInstanceId, calcAmount, feeTypeCode);
            }
        });

        //todo 1.本费用预算占比=((申请金额+本费用的成本流）/ 本费用类型计划支出)/(预调收入/计划收款)；
        //todo 2.大于1说明费用超过预期
        //todo 1.总预算执行率=((申请金额+项目的成本）/ 计划支出)/(预调收入/计划收款)；
        //todo 2.大于1说明费用超过预期

        //提交
        $("#submit").click(function(event){
            if(!$('#projectFeeForm').isValid()) {
                return false;
            }
            if(!confirm('确定同意吗?')){
                return;
            }
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

            var content = $("#content").val();
            var remark = $("[name=remark]").val();

            var loanType = $("[name='loanType']").filter(":checked").val();
            var bankName = $("[name='bankName']").val();
            var accountNo = $("[name='accountNo']").val();
            var accountName = $("[name='accountName']").val();
            var loanAmount = $("[name='loanAmount']").val();
            var supplierName = $("[name='supplierName']").val();


            var projectFeeDto = {};
            var projectFee = {};
            var projectFeeLoan = {};
            projectFee.id = businessKey;//设置主键
            projectFee.remark = remark;
            projectFeeDto.projectFee = projectFee;

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

            var isLessThen = true;
            var feeInfoArray = [];
            $("input[name=feeInfoId]").each(function(i,item){
               var feeInfoId = $(item).val();
               var auditAmount = $(item).parents("tr").find("input[name='auditAmount']").val();
               var amount = $(item).parents("tr").find("input[name='amount']").val();
               var feeInfo = {};
               feeInfo.id = feeInfoId;
               feeInfo.auditAmount = auditAmount;
               feeInfoArray.push(feeInfo);
               if(parseFloat(amount)<parseFloat(auditAmount)){//费用明细审批金额不能大于申请金额
                   isLessThen = false;
                   return;
               }
            });

            if(!isLessThen){
                systemMessage({
                    type: 'info',
                    title: '提示：',
                    detail: '费用明细审批金额不能大于申请金额!'
                });
                return;
            }

            projectFeeDto.infoList = feeInfoArray;

            //设置流程参数
            projectFeeDto.taskId = taskId;
            projectFeeDto.wfInstanceId = wfInstanceId;
            projectFeeDto.content = content;//设置意见

            var projectFeeDtoStr = JSON.stringify(projectFeeDto);
//            console.log(projectFeeDtoStr);


            $.ajax({
                type: "POST",
                url: apiHost + '/hoss/expenses/projectFee/approvalProjectFee.do',
                data: {"projectFeeDtoStr":projectFeeDtoStr},
                dataType : 'json',
                success: function(msg){

                }

            }).done(function (data) {

            }).fail(function (jqXHR, textStatus, errorThrown) {
                var json = eval('(' + jqXHR.responseText+ ')');
                if (json.detail.indexOf("成功") == -1 ) {
                    systemMessage({
                        type: 'info',
                        title: '提示：',
                        detail: json.detail || '提交成功！'
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
        });



            /*$.ajax($.extend({
                url: apiHost + '/hoss/expenses/projectFee/approvalProjectFee.do',
                data: {"projectFeeDtoStr":projectFeeDtoStr}
            }, jsonp))
                .done(function (data) {

                    function useful(data) {
                        var dataObj = data.data || {};
                        systemMessage({
                            type: 'info',
                            title: '提示：',
                            detail: '审批成功！'
                        });
                        location.href=document.referrer;
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
                }).always(function () {
                    $disabled.attr('disabled', 'disabled');
                    $submit.removeAttr('disabled').blur();
                });
        });*/

        function fillAuditData(wfInstanceId,taskId,businessKey){
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

                        // 显示数据
                        $("#projectFeeForm").html(
                            template('projectFeeApproval', dataObj)
                        );
                        if(!isEmpty(projectFee.subFeeTypeName)){
                            $("#subFeeTypeName").html("—— "+projectFee.subFeeTypeName);
                        }

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


                        $("#totalAmount").html(assembleAmount(projectFee.amount));
                        $("#totalAuditAmount").html(assembleAmount(projectFee.auditAmount));
                        $("#flowNo").html(projectFee.flowNo);
                        var str = 'ing';
                        switch (dataObj.status){
                            case 1:
                            case 5:
                            case 6: str="ing";break;
                            case 2: str="accept";break;
                            default :str="refused";break;
                        }
                        $("#statusSpan").attr(str);
                        var documentList = dataObj.documentList;
//                        console.log(documentList);
                        var fileStr = "";

                        $.each(documentList,function(i,item){
                            var url = apiHost+"/hoss/sys/fileDownload/download.do?id="+item.id;
                            if(fileStr!=''){
                                fileStr+=" | ";
                            }
                            fileStr +="<a href='"+url+"'>"+item.name+"</a>";
                        });
                        $("#showFile").html(fileStr);
                        projectId = projectFee.projectId;
                        feeTypeCode = dataObj.feeTypeCode;
                        approvalUtil.renderingCostInfo($('#projectFeeAmountTR'), projectId, wfInstanceId,
                            projectFee.auditAmount, feeTypeCode);

                        changeLoanType(loanType);

//                        $("input[name='loanType']").change(function(){
//
//                            var loanType = $(this).val();
//
//                            changeLoanType(loanType);
//                        });
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

        function assembleAmount(amount){
            var bigAmount = accounting.formatUpperCase(amount);
            var str = "小写:&nbsp;&nbsp;"+formatNumber(amount,2)+"&nbsp;&nbsp;&nbsp;大写:&nbsp;"+bigAmount;
            return str;
        }

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
            var array = ['bankName','accountNo','accountName','loanAmount'];
            $.each(array,function(i,item){
                enableOrDisableRule(item,bool);

            });
//            enableOrDisableRule('bankName',bool);
//            enableOrDisableRule('accountNo',bool);
//            enableOrDisableRule('accountName',bool);
//            enableOrDisableRule('loanAmount',bool);
        }

        function enableOrDisableRule(name,bool){

            if(name == 'loanAmount'){
                $("input[name='"+name+"']").attr('data-rules','{required:'+bool+',number:'+ bool +'}');
            }else{
                $("input[name='"+name+"']").attr('data-rules','{required:'+bool+'}');
            }
        }

        function initSrcoll(){

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
                location.href=document.referrer;
            });
        }
    });

});