define(function (require) {
    var hoss = require('hoss'),
        apiHost = hoss.apiHost;

    var $ = require('jquery'),
        template = require("template"),
        navigation = require('navigation'),
        sysMessage=require("system-message");
    var xhr = require('xhr'),
        jsonp = xhr.jsonp,
        jsonpost = xhr.jsonpost,
        clearEmptyValue = xhr.clearEmptyValue,
        doneCallback = xhr.done,
        failCallback = xhr.fail;
    var queryString = require("script/get-query-string");

    var systemMessage = require('system-message');

    function send(url,suc,params, type){
        $.ajax($.extend({
            url:apiHost+url,
            success:function(data){
                if( $.isFunction( suc ) && data.status=="1" ){
                    suc(data);
                }else if( data.status == "0" ){
                    suc(data);
                }
            },
            data:params||{}
        },type || jsonp));
    }

    function initProject(projectId,pName,start,end){

        send("/liquidation/ruleTemplate/projectTypesAndCheck.do?project="+projectId,function(data){

            if("1"!=data.status&&1!=data.status){
                $("#projectType").html("");
                systemMessage({
                    type: 'error',
                    title: '提示：',
                    detail: data.detail || '获取数据失败！'
                });
            }else{
                template.helper("p",{name:pName,id:projectId});
                $("#projectType").html(
                    template("projectTypeTemplate",data)
                );
                $("#cooperate_date").text(( start||"" )+"-"+( end||"" ))

                intCommissionPercentages( projectId );
            }



        });
    }

    function bindEvent(){

        $("#project").on("change",function(){
            var $content=$(this);
            var projectId = $content.find(":selected").val() ;
            var pName=$content.find(":selected").text();
            initProject( projectId, pName , $content.find(":selected").attr("start"), $content.find(":selected").attr("end") );
        });


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
        });

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


        $(".btn-warning,.btn-info").click(function(){
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
            var projectId = $('#project').val();
            if(!projectId) {
                return '请选择项目';
            }
            var projectType = $('[name^="projectTypes"][name$=".projectType"]');
            if(projectType.length == 0) {
                return "该项目没有可用的产品";
            }
            var parten=/^(-?\d+)[0-9,.]*$/;
            var socialAgentList = $('[name^="projectTypes"][name*="items[0]"][name*="scales[0]"]');
            var $cur,$previous;
            var curVal,preVal;
            if(socialAgentList.length) {
                for(var i = 0; i < socialAgentList.length; i++) {
                    $cur = $(socialAgentList[i]);
                    curVal = $cur.val();
                    if(curVal == '') {
                        return '请输入社会经纪人佣金';
                    }else{
                        if (!parten.test(curVal)){
                            return '社会经纪人佣金请输入合法数字';
                        }
                        if (curVal <= 0) {
                            return '社会经纪人佣金比例必须大于0';
                        }
                    }
                }
            }
            var haowuParterList = $('[name^="projectTypes"][name*="items[1]"][name*="scales[0]"]');
            if(haowuParterList.length) {
                for(var i = 0; i < haowuParterList.length; i++) {
                    $cur = $(haowuParterList[i]);
                    curVal = $cur.val();
                    if(curVal == '') {
                        return '请输入好屋合伙人佣金';
                    }else{
                        if (!parten.test(curVal)){
                            return '好屋合伙人佣金请输入合法数字';
                        }
                        if (curVal <= 0) {
                            return '好屋合伙人佣金比例必须大于0';
                        }
                    }
                }
            }

            var agencyList1 = $('[name^="projectTypes"][name*="items[2]"][name*="scales[0]"]:not([name$="smallThreshold"]):not([name$="bigThreshold"])'); //传统中介 标准比例
            if(agencyList1.length) {
                for(var i = 0; i < agencyList1.length; i++) {
                    $cur = $(agencyList1[i]);
                    curVal = $cur.val();
                    if(curVal == '') {
                        return '请输入传统中介的标准比例佣金';
                    }else{
                        if (!parten.test(curVal)){
                            return '传统中介的标准比例佣金请输入合法数字';
                        }
                        if (curVal <= 0) {
                            return '传统中介的标准比例佣金必须大于0';
                        }
                    }
                }
            }
            var agencyList2SmallThreshold = $('[name^="projectTypes"][name*="items[2]"][name*="scales[1]"][name$="smallThreshold"]'); //传统中介 额外奖励 较小套数
            var agencyList2 = $('[name^="projectTypes"][name*="items[2]"][name*="scales[1]"]:not([name$="smallThreshold"]):not([name$="bigThreshold"])'); //传统中介 额外奖励
            if(agencyList2SmallThreshold.length) {
                for(var i = 0; i < agencyList2SmallThreshold.length; i++) {
                    $cur = $(agencyList2[i]);
                    $previous = $(agencyList1[i]);
                    curVal = $cur.val();
                    preVal = $previous.val();
                    if($(agencyList2SmallThreshold[i]).val() != '' && curVal == '') {
                        return '请输入传统中介的额外奖励佣金'
                    }else{
                        if(preVal != '' && curVal == ''){
                            continue;
                        }
                        if (!parten.test(curVal)){
                            return '中介的额外奖励佣金请输入合法数字';
                        }
                        if (curVal <= 0) {
                            return '传统中介的额外奖励佣金必须大于0';
                        }
                    }
                }
            }
            var agencyList3SmallThreshold = $('[name^="projectTypes"][name*="items[2]"][name*="scales[2]"][name$="smallThreshold"]'); //传统中介 额外奖励 较小套数
            var agencyList3 = $('[name^="projectTypes"][name*="items[2]"][name*="scales[2]"]:not([name$="smallThreshold"]):not([name$="bigThreshold"])'); //传统中介 额外奖励
            if(agencyList3SmallThreshold.length) {
                for(var i = 0; i < agencyList3SmallThreshold.length; i++) {
                    $cur = $(agencyList3[i]);
                    $previous = $(agencyList1[i]);
                    curVal = $cur.val();
                    preVal = $previous.val();

                    if($(agencyList3SmallThreshold[i]).val() != '' && curVal == '') {
                        return '请输入传统中介的额外奖励佣金'
                    }else{
                        if(preVal != '' && curVal == ''){
                            continue;
                        }
                        if (!parten.test(curVal)){
                            return '中介的额外奖励佣金请输入合法数字';
                        }
                        if (curVal <= 0) {
                            return '传统中介的额外奖励佣金必须大于0';
                        }
                    }
                }
            }
            return null;
        }

        function notEndWith(orgStr, matchStr) {
            var endStrReg = new RegExp('(?!' + matchStr + ')');
            return endStrReg.test(matchStr);
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
                $content.serializeArray(),
                jsonpost
            )

            return false;
        });
    }

    /**
     * 初始化项目列表
     */
    function initProjectList(){
        send("/hoss/project/common/getMyCityProject.do?size=2000",function(data){

			/** 装填模版 */
            $("#project").html( template("projectTemplate",data) );
            initDefaultProject();
        });
    }

    /**
     * 初始化项目佣金比例
     * @param id
     */
    function intCommissionPercentages( id ){

        var url="/liquidation/commissionSettlementStandards/findStandard.do";
        function callback(data){

            $(data.data["projectTypes"]).each(function(){
                var tr=$("#"+this.projectType );
                $(this.items).each(function (){
                    var $item=this;
                    var type=$item.type;
                    $($item.scales).each(function(index,s){

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
							label = "固定金额";
						}

                        var smallThreshold = this.smallThreshold;
                        if(type == 'org'){
                            if(index == 1 && smallThreshold ==1){
                                smallThreshold = '';
                            }
                        }

                        tr.find("."+type+".smallThreshold:eq("+index+")").val(smallThreshold);
                        tr.find(".start").text($item.start);
                        tr.find(".end").text($item.end);
                        if( this.bigThreshold !=2147483647 ){
                            tr.find("."+$item.type+".bigThreshold:eq("+index+")").val(this.bigThreshold);
                        }
                    });
                });
            });

        };
        send( url ,callback ,{id:id} );
    }

    /**
     * 初始化默认项目
     */
    function initDefaultProject(){
        var project = queryString("project")
        if( project ){
            $("#project").find("option[value="+project+"]").attr("selected",true)
            $("#project").change()
        }
    }


    var workflowProp = require('script/approval/workflow-properties');
    function initWorkFlow(){
        var workflowObj = workflowProp.workflowObj;
        workflowObj.wfInstanceId = null;
        //workflowObj.businessKey = businessKey;
        workflowObj.taskId = null;
        workflowObj.processKey = workflowProp.definitionConstants.QDBZ;
        workflowObj.flowImageId = "flow";
        workflowObj.contentId = "content";
        workflowObj.workflowCommentId = "workflowComment";
        workflowObj.flowType = 'new';
        workflowObj.projectId = "project";
        workflowProp.showWorkFlowAll(workflowObj);
    }


    $(document).ready(function(){

        bindEvent();
        initWorkFlow();
        initProjectList();

    });

});
