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
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;

    var workflowProp = require('script/approval/workflow-properties');
    var systemMessage = require('system-message');



    function initWorkFlow(){
        var workflowObj = workflowProp.workflowObj;
        workflowObj.wfInstanceId = wfInstanceId;
        workflowObj.businessKey = businessKey;
        workflowObj.taskId = taskId;
        workflowObj.processKey = workflowProp.definitionConstants.QDBZ;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = 'new';
        workflowProp.showWorkFlowAll(workflowObj);

        $(".goback").click(function (event) {
            if (event) {
                event.preventDefault();
            }
            location.href=document.referrer;
        });
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



        $("#projectType").on("change","[s]",function(){
            var $content=$(this),
                $thisVal=parseInt( $content.val() ) ;

            if( !isNaN($thisVal) && $thisVal < 1  ){
                $thisVal=2;
                $content.val(2)
            }

            var next=parseInt($content.attr("s"))+1;
            var $next=$content.parent().parent().find("[s="+next+"]")
            var nextVal=parseInt($next.val());

            if( ! isNaN( $thisVal ) && !isNaN( nextVal ) && $thisVal >= nextVal  ){

                $content.val("").change().val($thisVal).change();
                return;
            }

            var val=parseInt($thisVal)+1;
            $next.val( isNaN(val) ? "" :val );
            if( isNaN( parseInt( $thisVal )  ) ){
                $next.change();
            }

        })

        function validateColor(){

            $("#projectType > tr").each(function(){
                changeColor(  $(this).find("[s]")  );
                changeColor(  $(this).find(".org.scale")  );
            });
        }

        $("#projectType").on("change","input",validateColor);

        function changeColor( s ){

            for(var i = 1 ; i < s.length - 1 ; i++){

                if( !!$(s[i]).attr("readonly") || $.trim(s[i].value) =="" ){

                    $(s[i]).css("border","1px solid #ccc");
                } else if( parseInt( s[i].value ) > parseInt( s[i+1].value ) || parseInt( s[i].value ) < parseInt( s[i-1].value )  || isNaN( parseInt( s[i].value ) )  ){

                    //$(s[i]).css("border","1px solid red");
                } else{

                    $(s[i]).css("border","1px solid #ccc");
                }
            }
        }


        $(".btn-warning,.btn-info").click(function(event){
            if(event){
                event.preventDefault();
            }
            var validateResultInfoStr = validateForm();
            if(validateResultInfoStr) {
                systemMessage({
                    type: 'error',
                    title: '提示：',
                    detail: validateResultInfoStr
                });
                return false;
            }
            $("#submitForm").attr("action",$(this).attr("formAction")).submit();
        });


        function validateForm() {
            var projectType = $('[name^="projectTypes"][name$=".projectType"]');
            if(projectType.length == 0) {
                return "该项目没有可用的产品";
            }
            var socialAgentList = $('[name^="projectTypes"][name*="items[0]"][name*="scales[0]"]');
            if(socialAgentList.length) {
                for(var i = 0; i < socialAgentList.length; i++) {
                    if($(socialAgentList[i]).val() == '') {
                        return '请输入社会经纪人佣金';
                    }
                }
            }
            var haowuParterList = $('[name^="projectTypes"][name*="items[1]"][name*="scales[0]"]');
            if(haowuParterList.length) {
                for(var i = 0; i < haowuParterList.length; i++) {
                    if($(haowuParterList[i]).val() == '') {
                        return '请输入好屋合伙人佣金';
                    }
                }
            }

            var agencyList1 = $('[name^="projectTypes"][name*="items[2]"][name*="scales[0]"]:not([name$="smallThreshold"]):not([name$="bigThreshold"])'); //传统中介 标准比例
            if(agencyList1.length) {
                for(var i = 0; i < agencyList1.length; i++) {
                    if($(agencyList1[i]).val() == '') {
                        return '请输入传统中介的标准比例佣金';
                    }
                }
            }
            var agencyList2SmallThreshold = $('[name^="projectTypes"][name*="items[2]"][name*="scales[1]"][name$="smallThreshold"]'); //传统中介 额外奖励 较小套数
            var agencyList2 = $('[name^="projectTypes"][name*="items[2]"][name*="scales[1]"]:not([name$="smallThreshold"]):not([name$="bigThreshold"])'); //传统中介 额外奖励
            if(agencyList2SmallThreshold.length) {
                for(var i = 0; i < agencyList2SmallThreshold.length; i++) {
                    if($(agencyList2SmallThreshold[i]).val() != '' && $(agencyList2[i]).val() == '') {
                        return '请输入传统中介的额外奖励佣金'
                    }
                }
            }
            var agencyList3SmallThreshold = $('[name^="projectTypes"][name*="items[2]"][name*="scales[2]"][name$="smallThreshold"]'); //传统中介 额外奖励 较小套数
            var agencyList3 = $('[name^="projectTypes"][name*="items[2]"][name*="scales[2]"]:not([name$="smallThreshold"]):not([name$="bigThreshold"])'); //传统中介 额外奖励
            if(agencyList3SmallThreshold.length) {
                for(var i = 0; i < agencyList3SmallThreshold.length; i++) {
                    if($(agencyList3SmallThreshold[i]).val() != '' && $(agencyList3[i]).val() == '') {
                        return '请输入传统中介的额外奖励佣金'
                    }
                }
            }
            return null;
        }


        $("#submitForm").submit(function(){

            var $content=$(this);



            if($content.attr("action").lastIndexOf('submit')!=-1){
                if(!confirm('确定提交审批吗?')){
                    return false;
                }
            }
            send(
                $content.attr("action"),
                function (data) {
//                    window.location=hoss.webHost+"/app/approval/new-apply.html";
                    if(data.status == '0'){
                        sysMessage({type:"error",detail:data.detail});
                    }
                    if(data.status == '1'){
                        location.href = document.referrer;
                    }
                },
                $content.serializeArray()
            )

            return false;
        });
    }


    function renderForm(){

        send("/costmanager/liquidation/CommissionSettlementStandards/getStandards.do?businessKey="+businessKey,function(data){

            var standards=data.data;
            template.helper("p",{name:"",id:standards.project,businessKey:businessKey });

            initProject( standards.project );
            initStandards( standards.project , standards );


        });
    }

    /**
     * 初始化佣金比例
     */
    function initStandards( project , standards ){

        var url="/liquidation/ruleTemplate/projectTypes.do";
        function callback( data ){

            $("#projectType").html( template("projectTypeTemplate",data) );

            $(standards["projectTypes"]).each(function(){
                var tr=$("#"+this.projectType );
                $(this.items).each(function (){
                    var type=this.type;
                    $(this.scales).each(function(index,s){

						var value;
						var label;
                        var $inputLabel;
                        var inputName;
						if (this.scale != '' || this.scale != 0)
						{
//                            $inputLabel = tr.find("."+type+".scale:eq("+index+")");
//                            changeScaleName($inputLabel)
                            tr.find("."+type+".scale:eq("+index+")")
                            inputName = 'scale';
							value = this.scale;
							label = "团购费%";
						}

						if (this.houseScale != '' || this.houseScale != 0)
						{
                            inputName = 'houseScale';
							value = this.houseScale;
							label = "房价%";
						}

						if (this.fixedAmount != '' || this.fixedAmount != 0)
						{
                            inputName = 'fixedAmount';
							value = this.fixedAmount;
							label = "固定金额(元)";
						}

                        var smallThreshold = this.smallThreshold;
                        if(type == 'org'){
                            if(index == 1 && smallThreshold ==1){
                                smallThreshold = '';
                            }
                        }
                        tr.find("."+type+".scale:eq("+index+")").val(value).after(label);
                        tr.find("."+type+".smallThreshold:eq("+index+")").val(smallThreshold);

                        var tempInputName = tr.find("."+type+".scale:eq("+index+")").attr('name');
                        if(tempInputName) {
                            inputName = tempInputName.replace(/\b(scale|houseScale|fixedAmount)\b/, inputName);
                            tr.find("."+type+".scale:eq("+index+")").attr('name', inputName);
                        }
                        if( this.bigThreshold !=2147483647 ){
                            tr.find("."+type+".bigThreshold:eq("+index+")").val(this.bigThreshold);
                        }
                    });
                });
            });
            $("input[name='taskId']").val(taskId);
            $("input[name='wfInstanceId']").val(wfInstanceId);
            $("input[name='workFlowModelId']").val(businessKey);
        }

        send(url ,callback , {project :project } );
    }

    function changeScaleName(current, value) {
        var scaleInput = current;

        scaleInput.attr("name", scaleInput.attr("name").replace(/\b(scale|houseScale|fixedAmount)\b/, value));

        /** 固定金额(元)不限制输入长度 */
        if (value == 'fixedAmount')
        {
            scaleInput.attr("maxlength", "10");
        }
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

        initWorkFlow();
        renderForm();
        bindEvent();
    });

});
