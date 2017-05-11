define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery'),
        template = require("template"),
        navigation = require('navigation'),
        queryString = require("script/get-query-string"),
        sysMessage=require("system-message");

    var businessKey = queryString('businessKey');
    var wfInstanceId = queryString('wfInstanceId');
    var taskId = queryString('taskId');
            require('jqprint-util');
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;



    var workflowProp = require('script/approval/workflow-properties');



    function initWorkFlow(){
        var workflowObj = workflowProp.workflowObj;
        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = workflowProp.definitionConstants.QDBZ;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowProp.showWorkFlowAll(workflowObj);
    }

    function send(url,suc,params){
        $.ajax($.extend({
            url:apiHost+url,
            success:function(data){
                if( $.isFunction( suc ) && data.status=="1" ){
                    suc(data);
                }else if( data.status == "0" ){
                    sysMessage({type:"error",detail:data.detail})
                }
            },
            data:params||{}
        },jsonp));
    }

    function bindEvent(){

        function success(data){
//            window.location=hoss.webHost+"/app/approval/new-apply.html";
            location.href = document.referrer;
        }

        $("#warningBtn").click(function () {

            if(!confirm('确定同意吗?')){
                return false;
            }
            send(
                "/costmanager/liquidation/CommissionSettlementStandards/approval.do",
                success,
                {"workFlowModel.id":businessKey,businessKey:businessKey,wfInstanceId:wfInstanceId,taskId:taskId,flowDealType:"submit",content:$("#content").val()}
            );
        });

    }


    function renderForm(){

        send("/costmanager/liquidation/CommissionSettlementStandards/getStandards.do?businessKey="+businessKey,function(data){

            var standards=data.data;
            template.helper("p",{name:"",id:standards.project,businessKey:businessKey });

            initStandards( standards );
            initProject( standards.project )

        });
    }

    function initStandards(standards){

        var url="/liquidation/ruleTemplate/projectTypes.do";

        function callback( result ){
            $("#projectType").html( template("projectTypeTemplate",result) );

            $(standards["projectTypes"]).each(function(){
                var tr=$("#"+this.projectType );
                $(this.items).each(function (){
                    var type=this.type;
                    $(this.scales).each(function(index,s){

						var value;
						var label;
						if (this.scale != '' || this.scale != 0)
						{
							value = this.scale;
							label = "团购费%";
						}

						if (this.houseScale != '' || this.houseScale != 0)
						{
							value = this.houseScale;
							label = "房价%";
						}

						if (this.fixedAmount != '' || this.fixedAmount != 0)
						{
							value = this.fixedAmount;
							label = "固定金额(元)";
						}

                        tr.find("."+type+".scale:eq("+index+")").val(value).after(label);
                        tr.find("."+type+".smallThreshold:eq("+index+")").val(this.smallThreshold);
                        if( this.bigThreshold !=2147483647 ){
                            tr.find("."+type+".bigThreshold:eq("+index+")").val(this.bigThreshold);
                        }
                    });
                });
            });

        }

        send(url, callback , { project :standards.project  });
    }

    /**
     * 初始化项目
     * @param project
     */
    function initProject(project){

        var url="/hoss/project/common/getProjectDto.do";
        function callback( result ){
            $("[name=pName]").text( result.data.project.title )
            $("[name=pDate]").text( (result.data.project.startTime||"") + "-" + (result.data.project.endTime||"") )
        }
        send(url,callback , {projectId : project } );

    }


    $(document).ready(function(){

        //var $approvalListTab = $('#approvalListTab');
        renderForm();
        bindEvent();
        initWorkFlow();
    });

});
